import { useState } from 'react';
import { 
  Braces, 
  Table as TableIcon, 
  Copy, 
  Check, 
  AlertCircle 
} from 'lucide-react';

function JsonFormatter({ darkMode }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [viewMode, setViewMode] = useState('json'); // 'json' or 'table'
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [tableData, setTableData] = useState({ headers: [], rows: [] });

  const handleFormat = () => {
    setError(null);
    if (!input.trim()) {
      setOutput('');
      return;
    }
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setInput(formatted); // Format original input as well for convenience
      setViewMode('json');
    } catch (err) {
      setError("无效的 JSON 格式，请检查输入。");
    }
  };

  const handleToTable = () => {
    setError(null);
    if (!input.trim()) return;
    try {
      const parsed = JSON.parse(input);
      
      let dataToRender = parsed;
      // Wrap top level obj in array if not array
      if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
        dataToRender = [parsed]; 
      }

      if (Array.isArray(dataToRender) && dataToRender.length > 0) {
        const firstItem = dataToRender[0];
        if (typeof firstItem === 'object' && firstItem !== null) {
          const headers = Array.from(new Set(dataToRender.flatMap(obj => 
             typeof obj === 'object' && obj !== null ? Object.keys(obj) : []
          )));
          
          setTableData({
            headers,
            rows: dataToRender
          });
          setViewMode('table');
        } else {
          setError("JSON 项不是对象格式，无法漂亮地转为表格。");
        }
      } else {
        setError("无法转换为表格，JSON 必须是含有数据的对象或数组。");
      }
    } catch (err) {
      setError("无效的 JSON 格式，解析失败。");
    }
  };

  const handleCopy = () => {
    if (!output && viewMode !== 'table') return;
    
    // 如果是表格模式，只复制原始输入的排版
    const textToCopy = viewMode === 'table' ? input : output;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearInput = () => {
    setInput('');
    setOutput('');
    setTableData({ headers: [], rows: [] });
    setError(null);
  };

  return (
    <div className="w-full font-sans max-w-7xl mx-auto py-8">
      
      <div className="text-center space-y-3 mb-10">
        <h2 className={`text-4xl font-bold tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          JSON 格式化工具
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          一键格式化源码、转换为数据表格格式
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 左侧：输入区 */}
        <div className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <span className={`font-semibold text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>输入 JSON</span>
            <button onClick={clearInput} className={`text-xs px-3 py-1.5 rounded-lg transition-all ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-200 text-gray-500'}`}>清空</button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="在此粘贴你的 JSON 字符串..."
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
          <div className={`p-4 border-t flex flex-wrap gap-3 ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <button
              onClick={handleFormat}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                darkMode ? 'bg-white text-black hover:bg-gray-200' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              <Braces className="w-4 h-4" />
              一键格式化
            </button>
            <button
              onClick={handleToTable}
              className={`flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all border ${
                darkMode ? 'border-gray-700 hover:border-gray-500 text-gray-200 bg-transparent' : 'border-gray-300 hover:border-gray-400 text-gray-700 bg-white'
              }`}
            >
              <TableIcon className="w-4 h-4" />
              一键转表格
            </button>
          </div>
        </div>

        {/* 右侧：展示区 */}
        <div className={`flex flex-col rounded-3xl border transition-all overflow-hidden ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200 shadow-sm'}`}>
          <div className={`px-5 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex gap-2">
              <span className={`px-3 py-1 text-sm font-medium rounded-lg cursor-pointer ${
                viewMode === 'json' ? (darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')
              }`} onClick={() => { if(output) setViewMode('json') }}>
                JSON 代码
              </span>
              <span className={`px-3 py-1 text-sm font-medium rounded-lg cursor-pointer ${
                viewMode === 'table' ? (darkMode ? 'bg-gray-800 text-white' : 'bg-gray-200 text-gray-900') : (darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black')
              }`} onClick={() => { if(tableData.rows.length) setViewMode('table') }}>
                表格预览
              </span>
            </div>
            
            <button onClick={handleCopy} className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all border ${copied ? (darkMode ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-green-50 text-green-600 border-green-200') : (darkMode ? 'hover:bg-gray-800 text-gray-400 border-transparent' : 'hover:bg-gray-100 text-gray-500 border-transparent')}`}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "已复制" : "一键复制"}
            </button>
          </div>
          
          <div className="flex-1 w-full min-h-[400px] max-h-[600px] overflow-auto p-5 relative">
            {!output && viewMode === 'json' && (
              <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                <span className={`text-sm ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>格式化后的结果将显示在此</span>
              </div>
            )}
            
            {viewMode === 'json' && output && (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap break-all ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                {output}
              </pre>
            )}

            {viewMode === 'table' && tableData.rows.length > 0 && (
              <div className="overflow-x-auto">
                <table className={`w-full text-left border-collapse text-sm whitespace-nowrap ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  <thead>
                    <tr className={`border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
                      {tableData.headers.map(header => (
                        <th key={header} className={`pb-3 pr-6 font-semibold ${darkMode ? 'text-gray-200' : 'text-gray-900'}`}>
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tableData.rows.map((row, idx) => (
                      <tr key={idx} className={`border-b last:border-0 ${darkMode ? 'border-gray-800 hover:bg-gray-800/50' : 'border-gray-100 hover:bg-gray-50'}`}>
                        {tableData.headers.map(header => (
                          <td key={header} className="py-3 pr-6 max-w-[200px] truncate" title={typeof row[header] === 'object' ? JSON.stringify(row[header]) : String(row[header])}>
                            {row[header] !== undefined 
                              ? (typeof row[header] === 'object' ? JSON.stringify(row[header]) : String(row[header])) 
                              : '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JsonFormatter;
