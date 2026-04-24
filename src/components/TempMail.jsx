import { useState, useEffect } from 'react';
import { 
  Mail, 
  RefreshCw, 
  Copy, 
  Check, 
  AlertCircle,
  Inbox,
  Loader2,
  Timer
} from 'lucide-react';

function generateRandomString(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function TempMail({ darkMode }) {
  const [emailPrefix, setEmailPrefix] = useState('');
  const domain = "ctmd.xyz";
  const address = emailPrefix ? `${emailPrefix}@${domain}` : '';
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  
  // 生命周期倒计时：5分钟 = 300秒
  const [timeLeft, setTimeLeft] = useState(300);
  const isExpired = timeLeft <= 0;

  // 初始化时生成随机前缀
  useEffect(() => {
    setEmailPrefix(generateRandomString(8));
  }, []);

  // 倒计时逻辑
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchMessages = async () => {
    if (!address || isExpired) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/tempmail/messages?address=${address}`);
      const data = await res.json();
      if (data.success) {
        setMessages(data.data || []);
      } else {
        setError(data.error || "获取邮件失败，请重试");
      }
    } catch (err) {
      setError("网络异常或服务器未响应");
    } finally {
      setIsLoading(false);
    }
  };

  // 定时刷新和初始抓取
  useEffect(() => {
    if (address && !isExpired) {
      fetchMessages();
      const interval = setInterval(() => {
        if (!isExpired) fetchMessages();
      }, 15000); // 15秒自动刷新
      return () => clearInterval(interval);
    }
  }, [address, isExpired]); // 依赖 isExpired 确保过期后停止刷新

  const copyAddress = () => {
    if (!address || isExpired) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const changeAddress = () => {
    setEmailPrefix(generateRandomString(8));
    setMessages([]);
    setError(null);
    setTimeLeft(300); // 重置5分钟
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full font-sans max-w-5xl mx-auto py-8">
      
      <div className="text-center space-y-3 mb-10">
        <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          临时隐私邮箱
        </h2>
        <p className={`text-base flex items-center justify-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          <Timer className="w-4 h-4" /> 阅后即焚，单个邮箱生命周期为 5 分钟
        </p>
      </div>

      <div className="space-y-6 max-w-3xl mx-auto">
        {/* 地址操作区 */}
        <div className={`p-6 md:p-8 rounded-3xl border text-center transition-all shadow-sm relative overflow-hidden ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
          
          {/* 进度条背景 */}
          {!isExpired && (
            <div className="absolute top-0 left-0 h-1 bg-emerald-500 transition-all ease-linear" style={{ width: `${(timeLeft / 300) * 100}%` }}></div>
          )}
          {isExpired && (
            <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
          )}

          <div className="flex flex-col items-center gap-4">
            <div className={`text-sm font-medium flex items-center gap-2 ${isExpired ? 'text-red-500' : (darkMode ? 'text-emerald-400' : 'text-emerald-600')}`}>
              {isExpired ? "邮箱已销毁" : `距离邮箱过期：${formatTime(timeLeft)}`}
            </div>
            
            {/* 邮箱地址大框 - 内置复制提效 */}
            <div className={`w-full max-w-md flex items-center justify-between pl-6 pr-2 py-2 rounded-2xl border transition-all ${
              isExpired ? (darkMode ? 'bg-red-900/10 border-red-900/30 opacity-50' : 'bg-red-50 border-red-200 opacity-50')
              : (darkMode ? 'bg-black border-gray-700' : 'bg-gray-50 border-gray-200')
            }`}>
              <span className={`text-lg md:text-xl font-mono tracking-tight font-bold truncate ${darkMode ? 'text-white' : 'text-black'}`}>
                {address || "generating..."}
              </span>
              <button
                onClick={copyAddress}
                disabled={isExpired}
                className={`flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-xl transition-all ${
                  isExpired ? 'cursor-not-allowed opacity-50' : 
                  (copied ? (darkMode ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-100 text-emerald-600') 
                  : (darkMode ? 'bg-gray-800 text-gray-400 hover:text-white' : 'bg-gray-200 text-gray-600 hover:text-black'))
                }`}
                title="复制邮箱地址"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-center mt-6">
            <button
              onClick={changeAddress}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all ${
                isExpired 
                ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                : (darkMode ? 'bg-gray-800 text-white hover:bg-gray-700' : 'bg-gray-100 text-black hover:bg-gray-200')
              }`}
            >
               <RefreshCw className="w-4 h-4" />
               {isExpired ? "获取新邮箱" : "提前更换地址"}
            </button>
          </div>
        </div>

        {/* 邮件列表区 */}
        <div className={`rounded-3xl border transition-all overflow-hidden shadow-sm ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <h3 className={`font-semibold text-lg flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <Inbox className="w-5 h-5" /> 收件箱
            </h3>
            <button 
              onClick={fetchMessages} 
              disabled={isLoading || isExpired}
              className={`flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-lg transition-all ${
                darkMode 
                ? 'bg-gray-800 text-gray-300 hover:text-white hover:bg-gray-700 disabled:opacity-30' 
                : 'bg-gray-200 text-gray-700 hover:text-black hover:bg-gray-300 disabled:opacity-30'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} /> 
              {isLoading ? '刷新中' : '刷新'}
            </button>
          </div>

          <div className="p-0">
            {error && (
              <div className={`m-6 flex items-center gap-2 p-3 text-sm rounded-xl border ${darkMode ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {!error && messages.length === 0 && (
              <div className="py-20 text-center flex flex-col items-center justify-center px-4">
                <Mail className={`w-12 h-12 mb-4 opacity-20 ${isExpired ? 'text-red-500' : (darkMode ? 'text-white' : 'text-black')}`} />
                {isExpired ? (
                  <>
                    <p className={`text-base font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>该邮箱已从这个世界消失</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>请点击上方获取新邮箱</p>
                  </>
                ) : (
                  <>
                    <p className={`text-base font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>收件箱空空如也</p>
                    <p className={`text-sm mt-1 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>等待新邮件到达自动更新，请勿关闭页面...</p>
                    {isLoading && <Loader2 className={`w-4 h-4 animate-spin mt-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}/>}
                  </>
                )}
              </div>
            )}

            {!error && messages.length > 0 && (
              <div className="divide-y max-h-[500px] overflow-auto">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`p-6 transition-colors ${darkMode ? 'divide-gray-800 hover:bg-gray-800/30' : 'divide-gray-100 hover:bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className={`font-semibold text-lg flex items-center gap-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>主题:</span> 
                          {msg.subject || "无主题"}
                        </h4>
                        <span className={`text-xs whitespace-nowrap ml-4 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>{msg.createTime}</span>
                    </div>
                    <div className={`text-sm mb-4 flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>发件人:</span> 
                        <span className={`px-2 py-0.5 rounded-md ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'}`}>{msg.sendEmail || "未知"}</span>
                    </div>
                    <div className="mt-4">
                      <div className={`text-sm mb-2 ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>正文:</div>
                      <div 
                        className={`text-sm p-4 rounded-xl border prose prose-sm max-w-none ${darkMode ? 'bg-black/50 border-gray-800 text-gray-300 prose-invert' : 'bg-white border-gray-100 text-gray-700'}`}
                        dangerouslySetInnerHTML={{ __html: msg.content || msg.text || "空内容" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TempMail;
