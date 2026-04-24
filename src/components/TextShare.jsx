import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Send, 
  DownloadCloud, 
  Copy,
  Check,
  QrCode,
  Loader2,
  AlertCircle
} from 'lucide-react';

function TextShare({ darkMode }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  
  // Tab: 'send' or 'receive'
  const [activeTab, setActiveTab] = useState(initialCode ? 'receive' : 'send');
  
  // Send state
  const [sendText, setSendText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendResult, setSendResult] = useState(null); // { code, link }
  const [sendError, setSendError] = useState(null);
  
  // Receive state
  const [receiveCode, setReceiveCode] = useState(initialCode);
  const [receiveText, setReceiveText] = useState('');
  const [isReceiving, setIsReceiving] = useState(false);
  const [receiveError, setReceiveError] = useState(null);
  
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  // 如果链接里带有code，自动加载
  useEffect(() => {
    if (initialCode && activeTab === 'receive' && receiveCode === initialCode) {
      handleReceive(initialCode);
    }
  }, []);

  const handleSend = async () => {
    setSendError(null);
    if (!sendText.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sendText })
      });
      const data = await response.json();
      
      if (data.success) {
        const link = `${window.location.origin}/share?code=${data.code}`;
        setSendResult({ code: data.code, link });
      } else {
        setSendError(data.error || "生成失败");
      }
    } catch (err) {
      setSendError("网络异常，请稍后重试");
    } finally {
      setIsSending(false);
    }
  };

  const handleReceive = async (codeToUse = receiveCode) => {
    setReceiveError(null);
    setReceiveText('');
    const codeStr = typeof codeToUse === 'string' ? codeToUse : receiveCode;
    
    if (!codeStr || codeStr.length !== 4) {
      setReceiveError("请输入4位有效的取件码");
      return;
    }

    setIsReceiving(true);
    try {
      const response = await fetch(`/api/share?code=${codeStr}`);
      const data = await response.json();
      
      if (data.success) {
        setReceiveText(data.data);
        // 更新网址
        if (codeStr !== searchParams.get('code')) {
          setSearchParams({ code: codeStr });
        }
      } else {
        setReceiveError(data.error || "提取失败");
      }
    } catch (err) {
      setReceiveError("网络异常，请稍后重试");
    } finally {
      setIsReceiving(false);
    }
  };

  const copyLink = () => {
    if (!sendResult) return;
    navigator.clipboard.writeText(sendResult.link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };
  
  const copyText = () => {
    if (!receiveText) return;
    navigator.clipboard.writeText(receiveText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="w-full font-sans max-w-5xl mx-auto py-8">
      <div className="text-center space-y-3 mb-10">
        <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          加密文本传递
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          粘贴文本生成链接和4位取件码，跨设备快速传递
        </p>
      </div>

      <div className={`max-w-xl mx-auto rounded-3xl border overflow-hidden transition-all shadow-lg ${darkMode ? 'bg-[#1a1a1a] border-gray-800 shadow-black/20' : 'bg-white border-gray-200 shadow-gray-200/40'}`}>
        
        {/* Tab 切换 */}
        <div className={`flex border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
          <button 
            onClick={() => setActiveTab('send')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all outline-none ${
              activeTab === 'send' 
              ? (darkMode ? 'text-white border-b-2 border-white' : 'text-black border-b-2 border-black')
              : (darkMode ? 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent' : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent')
            }`}
          >
            <Send className="w-4 h-4" />
            我要发送
          </button>
          <button 
            onClick={() => setActiveTab('receive')}
            className={`flex-1 py-4 text-sm font-medium flex items-center justify-center gap-2 transition-all outline-none ${
              activeTab === 'receive' 
              ? (darkMode ? 'text-white border-b-2 border-white' : 'text-black border-b-2 border-black')
              : (darkMode ? 'text-gray-500 hover:text-gray-300 border-b-2 border-transparent' : 'text-gray-500 hover:text-gray-800 border-b-2 border-transparent')
            }`}
          >
            <DownloadCloud className="w-4 h-4" />
            我要取件
          </button>
        </div>

        <div className="p-6 md:p-8">
          {/* 发送页面 */}
          {activeTab === 'send' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              {sendResult ? (
                <div className="space-y-6 flex flex-col items-center">
                  <div className={`w-full p-6 text-center rounded-2xl border ${darkMode ? 'bg-green-900/10 border-green-900/50' : 'bg-green-50 border-green-100'}`}>
                    <Check className={`w-8 h-8 mx-auto mb-2 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                    <p className={`font-semibold text-lg ${darkMode ? 'text-green-400' : 'text-green-700'}`}>
                      生成成功！取件码：<span className="text-3xl font-black block mt-2">{sendResult.code}</span>
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                    <QRCodeSVG value={sendResult.link} size={150} level="M" />
                  </div>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>微信扫一扫，或分享二维码给好友</p>

                  <div className="w-full pt-4">
                     <button
                        onClick={copyLink}
                        className={`w-full py-3.5 flex items-center justify-center gap-2 rounded-2xl text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 border ${
                          darkMode 
                          ? 'border-gray-700 hover:border-gray-500 bg-transparent text-white focus:ring-white focus:ring-offset-[#111111]' 
                          : 'border-gray-300 hover:border-gray-400 bg-white text-black focus:ring-black focus:ring-offset-white'
                        }`}
                      >
                        {copiedLink ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        {copiedLink ? "链接已复制" : "一键复制完整链接"}
                      </button>
                  </div>
                  
                  <button 
                    onClick={() => {
                        setSendResult(null);
                        setSendText('');
                    }}
                    className={`text-sm mt-2 transition-colors ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'}`}
                  >
                    再发一条
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <textarea
                    placeholder="在此输入需要传递的文本或代码..."
                    value={sendText}
                    onChange={(e) => setSendText(e.target.value)}
                    rows={8}
                    className={`w-full px-5 py-4 border rounded-2xl text-sm transition-all resize-none outline-none ${
                        darkMode 
                        ? 'bg-[#1a1a1a] border-gray-800 focus:border-gray-600 text-gray-100 placeholder-gray-600'
                        : 'bg-white border-gray-200 focus:border-gray-400 text-gray-900 placeholder-gray-400'
                    }`}
                  />
                  {sendError && (
                    <div className={`flex items-center gap-2 p-3 text-sm rounded-xl border ${darkMode ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                      <AlertCircle className="w-4 h-4" /> {sendError}
                    </div>
                  )}
                  <button
                    onClick={handleSend}
                    disabled={isSending || !sendText.trim()}
                    className={`w-full h-12 flex items-center justify-center gap-2 text-sm font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-offset-2 ${
                      darkMode 
                      ? 'bg-white text-black hover:bg-gray-200 focus:ring-white focus:ring-offset-[#111111]' 
                      : 'bg-black text-white hover:bg-gray-800 focus:ring-black focus:ring-offset-white'
                    }`}
                  >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                    生成取件码及链接
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 接收页面 */}
          {activeTab === 'receive' && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="space-y-2">
                <label className={`block text-center text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  请输入 4 位取件码
                </label>
                <div className="flex justify-center">
                  <input
                    type="text"
                    maxLength={4}
                    value={receiveCode}
                    onChange={(e) => setReceiveCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="例如: 1234"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleReceive();
                    }}
                    className={`w-40 text-center text-2xl font-bold tracking-[0.2em] px-4 py-4 border rounded-2xl outline-none transition-all ${
                      darkMode 
                      ? 'bg-[#1a1a1a] border-gray-800 focus:border-gray-600 text-white placeholder-gray-700' 
                      : 'bg-gray-50 border-gray-200 focus:border-gray-400 text-black placeholder-gray-300'
                    }`}
                  />
                </div>
              </div>

              {receiveError && (
                <div className={`flex items-center justify-center gap-2 p-3 text-sm rounded-xl border ${darkMode ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
                  <AlertCircle className="w-4 h-4" /> {receiveError}
                </div>
              )}

              <button
                onClick={() => handleReceive()}
                disabled={isReceiving || receiveCode.length !== 4}
                className={`w-full h-12 flex items-center justify-center gap-2 text-sm font-medium rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed outline-none focus:ring-2 focus:ring-offset-2 ${
                  darkMode 
                  ? 'bg-white text-black hover:bg-gray-200 focus:ring-white focus:ring-offset-[#111111]' 
                  : 'bg-black text-white hover:bg-gray-800 focus:ring-black focus:ring-offset-white'
                }`}
              >
                {isReceiving ? <Loader2 className="w-4 h-4 animate-spin" /> : "立即取件"}
              </button>

              {receiveText && (
                <div className={`mt-6 p-5 border rounded-2xl space-y-4 ${darkMode ? 'bg-black/30 border-gray-800' : 'bg-gray-50 border-gray-200'}`}>
                  <h4 className={`text-sm font-semibold flex items-center justify-between ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    提取内容
                    <button onClick={copyText} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg transition-colors ${copiedText ? (darkMode ? 'text-green-400 bg-green-500/20' : 'text-green-600 bg-green-100') : (darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-black hover:bg-white')}`}>
                      {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedText ? "已复制" : "复制全部"}
                    </button>
                  </h4>
                  <div className={`whitespace-pre-wrap break-words text-sm max-h-[300px] overflow-auto ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {receiveText}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TextShare;
