export async function onRequest(context) {
  const { request } = context;

  // 处理 CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(request.url);
    const shareUrl = url.searchParams.get('url');

    if (!shareUrl) {
      return new Response(
        JSON.stringify({ error: '缺少 url 参数' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 步骤1: 获取重定向URL
    const redirectUrl = await getRedirectUrl(shareUrl);
    if (!redirectUrl) {
      return new Response(
        JSON.stringify({ error: '获取重定向URL失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 步骤2: 提取视频ID
    const videoId = extractVideoId(redirectUrl);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: '无法提取视频ID' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 步骤3: 获取视频数据
    const videoData = await fetchVideoData(videoId);
    if (!videoData) {
      return new Response(
        JSON.stringify({ error: '获取视频数据失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 步骤4: 解析视频信息
    const result = parseVideoInfo(videoData);
    if (!result) {
      return new Response(
        JSON.stringify({ error: '解析视频信息失败' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify({ code: 200, data: result }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

// 获取重定向URL
async function getRedirectUrl(shortUrl) {
  try {
    const response = await fetch(shortUrl, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15'
      }
    });
    return response.url;
  } catch (error) {
    console.error('获取重定向URL失败:', error);
    return null;
  }
}

// 提取视频ID
function extractVideoId(url) {
  const patterns = [
    /\/video\/(\d{19})/,
    /\/(\d{19})/,
    /modal_id=(\d{19})/
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  // 从查询参数提取
  try {
    const urlObj = new URL(url);
    const modalId = urlObj.searchParams.get('modal_id');
    if (modalId) return modalId;
  } catch (e) {}

  return null;
}

// 获取视频数据
async function fetchVideoData(videoId) {
  const url = `https://www.iesdouyin.com/share/video/${videoId}/`;
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36',
        'Referer': 'https://www.douyin.com/?is_from_mobile_home=1&recommend=1'
      }
    });

    const html = await response.text();
    
    // 查找数据标记
    const startMarker = 'window._ROUTER_DATA';
    const startIdx = html.indexOf(startMarker);
    if (startIdx === -1) {
      console.error('未找到视频数据标记');
      return null;
    }

    // 定位JSON起始位置
    const jsonStart = html.indexOf('{', startIdx);
    if (jsonStart === -1) {
      console.error('无法找到JSON数据');
      return null;
    }

    // 匹配大括号找到JSON结束位置
    let braceCount = 0;
    let jsonEnd = jsonStart;
    const maxSearch = Math.min(jsonStart + 500000, html.length);
    
    for (let i = jsonStart; i < maxSearch; i++) {
      if (html[i] === '{') braceCount++;
      else if (html[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEnd = i + 1;
          break;
        }
      }
    }

    if (jsonEnd === jsonStart) {
      console.error('无法解析完整JSON');
      return null;
    }

    // 解析JSON
    const jsonStr = html.substring(jsonStart, jsonEnd);
    const routerData = JSON.parse(jsonStr);

    // 提取视频信息
    const loaderData = routerData.loaderData || {};
    
    // 查找包含videoInfoRes的键
    let videoData = null;
    for (const key in loaderData) {
      const data = loaderData[key];
      if (data && typeof data === 'object' && data.videoInfoRes) {
        videoData = data;
        break;
      }
    }

    if (!videoData) {
      console.error('未找到videoInfoRes数据');
      return null;
    }

    const videoInfo = videoData.videoInfoRes || {};
    const itemList = videoInfo.item_list || [];
    
    if (itemList.length === 0) {
      console.error('视频列表为空');
      return null;
    }

    return itemList[0];

  } catch (error) {
    console.error('获取视频数据失败:', error);
    return null;
  }
}

// 解析视频信息
function parseVideoInfo(item) {
  try {
    const images = item.images || [];
    const isImage = images.length > 0;
    
    const statistics = item.statistics || {};
    const video = item.video || {};
    const cover = video.cover || {};
    const author = item.author || {};

    const result = {
      video_id: item.aweme_id,
      title: item.desc || '抖音视频',
      author: author.nickname || '未知',
      author_id: author.unique_id || '',
      cover: cover.url_list ? cover.url_list[0] : '',
      type: isImage ? 'image' : 'video',
      duration: (video.duration || 0) / 1000,
      like_count: statistics.digg_count || 0,
      comment_count: statistics.comment_count || 0,
      share_count: statistics.share_count || 0,
      collect_count: statistics.collect_count || 0,
    };

    if (isImage) {
      // 处理图集
      result.image_list = images.map(img => img.url_list ? img.url_list[0] : '').filter(Boolean);
      result.video_url = null;
    } else {
      // 处理视频
      const playAddr = video.play_addr || {};
      const videoUri = playAddr.uri || '';
      result.video_url = `https://www.douyin.com/aweme/v1/play/?video_id=${videoUri}`;
      result.image_list = [];
    }

    return result;

  } catch (error) {
    console.error('解析视频信息失败:', error);
    return null;
  }
}
