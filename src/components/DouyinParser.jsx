import { useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Heart,
  Download,
  Loader2,
  Link as LinkIcon
} from 'lucide-react';

function DouyinParser({ darkMode }) {
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const extractDouyinUrl = (text) => {
    const pattern = /https?:\/\/v\.douyin\.com\/[a-zA-Z0-9_-]+\/?/;
    const match = text.match(pattern);
    return match ? match[0] : null;
  };

  const handleParse = async () => {
    setError(null);
    setResult(null);

    const url = extractDouyinUrl(inputText);
    if (!url) {
      setError("未能识别到有效的抖音分享链接，请检查链接格式。");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/douyin/parse?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else if (data.data) {
        setResult(data.data);
      } else {
        setError("解析失败，请稍后重试");
      }
    } catch (err) {
      setError(`网络请求失败: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full font-sans max-w-4xl mx-auto py-10 md:py-16">

      {/* 头部标题区 */}
      <div className="text-center space-y-4 mb-12">
        <h2 className={`text-4xl md:text-5xl font-bold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          短视频无水印解析
        </h2>
        <p className={`text-lg ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          粘贴短视频分享链接，一键无水印下载
        </p>
      </div>

      {/* 居中输入区域 */}
      <div className="max-w-3xl mx-auto space-y-6">
        <div className={`flex flex-col sm:flex-row items-center gap-3 p-2 rounded-3xl border transition-all ${darkMode
          ? 'bg-[#1a1a1a] border-gray-800'
          : 'bg-white border-gray-200'
          } shadow-sm`}
        >
          <div className="flex-1 w-full flex items-center px-4">
            <LinkIcon className={`w-5 h-5 shrink-0 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
            <input
              type="text"
              placeholder="请在此粘贴你的解析链接，例如：https://v.douyin.com/xxx/"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && inputText.trim() && !loading) {
                  handleParse();
                }
              }}
              className={`w-full py-4 px-3 bg-transparent text-sm md:text-base outline-none ${darkMode ? 'text-gray-100 placeholder-gray-600' : 'text-gray-900 placeholder-gray-400'
                }`}
            />
          </div>
          <button
            onClick={handleParse}
            disabled={loading || !inputText.trim()}
            className={`w-full sm:w-auto h-12 px-8 flex items-center justify-center gap-2 text-sm font-medium rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed shrink-0 ${darkMode
              ? 'bg-white text-black hover:bg-gray-200'
              : 'bg-black text-white hover:bg-gray-800'
              }`}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              '开始解析'
            )}
          </button>
        </div>

        {error && (
          <div className={`flex items-center gap-3 p-4 rounded-2xl max-w-2xl mx-auto border ${darkMode ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* 教程提示区 */}
        <div className={`text-center transition-colors ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-sm">
            💡 <strong>使用教程：</strong>在短视频应用中点击“分享”，复制链接粘贴至上方输入框，即可提取无水印视频。
          </p>
        </div>
      </div>

      {/* 结果展示区域 */}
      {result && (
        <div className="mt-16 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className={`max-w-3xl mx-auto rounded-3xl border p-6 md:p-8 ${darkMode ? 'bg-[#1a1a1a] border-gray-800 shadow-xl shadow-black/20' : 'bg-white border-gray-100 shadow-xl shadow-gray-200/40'}`}>
            <div className={`flex items-center gap-2 border-b pb-4 mb-6 ${darkMode ? 'border-gray-800' : 'border-gray-100'}`}>
              <CheckCircle2 className="w-6 h-6 text-green-500" />
              <h3 className="font-semibold text-lg">视频解析成功</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              {/* 封面区 */}
              {result.cover && (
                <div className="rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-800 relative aspect-[3/4]">
                  <img
                    src={result.cover}
                    alt="封面"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-lg text-white text-sm font-medium flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    {result.like_count || 0}
                  </div>
                </div>
              )}

              {/* 信息及下载区 */}
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xl font-bold leading-snug line-clamp-2" title={result.title}>{result.title || "暂无标题"}</h4>
                  <div className={`flex items-center gap-2 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <span className="font-medium">{result.author || "未知作者"}</span>
                    <span>·</span>
                    <span>抖音号: {result.author_id || "未知"}</span>
                  </div>
                </div>

                <div className={`p-4 rounded-2xl space-y-3 text-sm ${darkMode ? 'bg-black/30' : 'bg-gray-50'}`}>
                  <div className="flex justify-between">
                    <span className="text-gray-500">点赞</span>
                    <span className="font-medium text-right">{result.like_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">评论</span>
                    <span className="font-medium text-right">{result.comment_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">分享</span>
                    <span className="font-medium text-right">{result.share_count || 0}</span>
                  </div>
                </div>

                {result.video_url && (
                  <div className="space-y-3 pt-2">
                    <a href={result.video_url} target="_blank" rel="noopener noreferrer" className="block w-full">
                      <button className={`w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${darkMode
                        ? 'bg-white text-black hover:bg-gray-200 focus:ring-white focus:ring-offset-[#111111]'
                        : 'bg-black text-white hover:bg-gray-800 focus:ring-black focus:ring-offset-white'
                        }`}>
                        <Download className="w-5 h-5" />
                        立即下载无水印视频
                      </button>
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DouyinParser;
