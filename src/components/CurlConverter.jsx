import { useState, useEffect } from 'react';
import * as curlconverter from 'curlconverter';
import { Terminal, Code2, Copy, Check, AlertCircle } from 'lucide-react';

const languages = [
  { id: 'python', name: 'Python', convert: curlconverter.toPython },
  { id: 'javascript', name: 'JavaScript (Fetch)', convert: curlconverter.toJavaScript },
  { id: 'java', name: 'Java', convert: curlconverter.toJava },
  { id: 'go', name: 'Go', convert: curlconverter.toGo },
  { id: 'rust', name: 'Rust', convert: curlconverter.toRust },
  { id: 'php', name: 'PHP', convert: curlconverter.toPhp },
];

function CurlConverter({ darkMode }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedLang, setSelectedLang] = useState(languages[0]);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!input.trim()) {
      setOutput('');
      setError(null);
      return;
    }
    try {
      setError(null);
      const converted = selectedLang.convert(input);
      setOutput(converted);
    } catch (err) {
      setError("无法解析 curl 命令，请检查格式是否正确。");
      setOutput('');
    }
  }, [input, selectedLang]);

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearInput = () => {
    setInput('');
  };

  return (
    <div className="w-full font-sans max-w-7xl mx-auto py-8">
      
      <div className="text-center space-y-3 mb-10">
        <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          cURL 命令转换代码
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          将 curl 命令行转为 Python、Java、JS 等主流语言代码
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 左侧：输入区 */}
        <div className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <span className={`font-semibold text-sm flex items-center gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              <Terminal className="w-4 h-4" /> cURL 输入
            </span>
            <button onClick={clearInput} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>清空</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="粘贴 cURL 命令... 例如：\ncurl 'https://api.example.com/' -H 'Accept: application/json'"
            className={`flex-1 p-5 w-full min-h-[400px] resize-none outline-none font-mono text-sm leading-relaxed ${
              darkMode ? 'bg-transparent text-gray-200 placeholder-gray-600' : 'bg-transparent text-gray-800 placeholder-gray-400'
            }`}
            spellCheck="false"
          />
          {error && (
            <div className={`flex items-center gap-2 px-5 py-3 border-t ${darkMode ? 'bg-red-900/10 border-red-900/50 text-red-400' : 'bg-red-50 border-red-100 text-red-600'}`}>
              <AlertCircle className="w-4 h-4 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>

        {/* 右侧：展示区 */}
        <div className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b flex flex-wrap gap-4 justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex flex-wrap items-center gap-2">
              <Code2 className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div className="flex gap-1 overflow-x-auto no-scrollbar">
                {languages.map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      selectedLang.id === lang.id
                        ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                        : (darkMode ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:text-black hover:bg-gray-200')
                    }`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            
            <button onClick={handleCopy} disabled={!output} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border ${!output ? 'opacity-50 cursor-not-allowed' : ''} ${copied ? (darkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-600 border-green-200') : (darkMode ? 'hover:bg-gray-800 text-gray-400 border-transparent' : 'hover:bg-gray-100 text-gray-500 border-transparent')}`}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "一键复制"}
            </button>
          </div>
          
          <div className="flex-1 w-full min-h-[400px] max-h-[600px] overflow-auto p-5 relative">
            {!output && !error && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <span className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>转换后的代码将实时显示在此</span>
              </div>
            )}
            
            {output && (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {output}
              </pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurlConverter;
