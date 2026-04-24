import React, { useState, useRef } from 'react';
import { FileCode, Upload, Link as LinkIcon, Check, Copy } from 'lucide-react';

const HtmlHosting = ({ darkMode }) => {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultUrl, setResultUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      alert("请上传 HTML 后缀的文件！");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setHtmlContent(ev.target.result);
    };
    reader.readAsText(file);
  };

  const handleSubmit = async () => {
    if (!htmlContent.trim()) {
      alert("内容不能为空！");
      return;
    }

    setLoading(true);
    setResultUrl('');
    setCopied(false);
    try {
      const res = await fetch('/api/html-host/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: htmlContent })
      });
      const data = await res.json();
      if (data.success) {
        // 构建最终可以访问的完整链接
        const finalUrl = window.location.origin + "/p/" + data.id;
        setResultUrl(finalUrl);
      } else {
        alert("上传失败: " + data.error);
      }
    } catch (e) {
      alert("发生错误: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!resultUrl) return;
    navigator.clipboard.writeText(resultUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className={`p-6 max-w-4xl mx-auto min-h-[500px] flex flex-col ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
      <div className="mb-8 text-center space-y-3">
        <h2 className={`text-3xl font-bold tracking-tight inline-flex items-center justify-center gap-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <FileCode className="w-8 h-8 text-blue-500" />
          临时静态网页托管
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          一键将本地 HTML 文件或代码变成可供他人访问的在线链接（链接生成后2天自动作废销毁）
        </p>
      </div>

      <div className={`flex flex-col flex-1 p-6 rounded-3xl border shadow-sm ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-col sm:flex-row gap-4 items-center mb-6">
          <input 
            type="file" 
            accept=".html,.htm" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileUpload}
          />
          <button 
            type="button"
            onClick={() => fileInputRef.current.click()}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium transition-colors border-2 ${darkMode ? 'border-dashed border-gray-700 bg-gray-800/50 hover:bg-gray-800 hover:border-blue-500/50' : 'border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 hover:border-blue-400'}`}
          >
            <Upload className="w-5 h-5" />
            选择本地 .html 文件上传
          </button>
          <span className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
            或者直接在下方粘贴代码：
          </span>
        </div>

        <textarea
          value={htmlContent}
          onChange={(e) => setHtmlContent(e.target.value)}
          placeholder="<html>&#10;  <body>&#10;    <h1>Hello World!</h1>&#10;  </body>&#10;</html>"
          className={`flex-1 w-full p-4 rounded-2xl resize-none font-mono text-sm leading-relaxed border outline-none transition-colors ${darkMode ? 'bg-black/50 border-gray-800 focus:border-blue-500/50 text-gray-300 placeholder-gray-700' : 'bg-gray-50/50 border-gray-200 focus:border-blue-400 focus:bg-white text-gray-700 placeholder-gray-400'}`}
        />

        <div className="mt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {!resultUrl ? (
            <button 
              onClick={handleSubmit}
              disabled={loading || !htmlContent.trim()}
              className="w-full md:w-auto flex justify-center items-center gap-2 px-8 py-3 rounded-xl font-bold tracking-wide text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LinkIcon className="w-5 h-5" />
              )}
              {loading ? "上传并生成中..." : "一键部署生成临时专属链接"}
            </button>
          ) : (
            <div className={`w-full flex md:flex-row flex-col items-center gap-3 p-3 pl-4 rounded-xl border ${darkMode ? 'bg-blue-900/20 border-blue-900/50' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex items-center gap-2 flex-1 w-full overflow-hidden">
                <span className={`px-2 py-1 text-xs font-bold rounded-lg ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-100 text-blue-600'}`}>成功</span>
                <span className={`text-sm font-mono truncate w-full ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{resultUrl}</span>
              </div>
              <button
                onClick={copyToClipboard}
                className={`flex shrink-0 items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors md:w-auto w-full ${darkMode ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? "已复制" : "复制临时访问地址"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HtmlHosting;
