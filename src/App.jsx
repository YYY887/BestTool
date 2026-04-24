import { useState, createContext, useContext, useEffect } from "react";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Video, Braces, Terminal, Send, Mail } from "lucide-react";
import DouyinParser from "./components/DouyinParser";
import JsonFormatter from "./components/JsonFormatter";
import CurlConverter from "./components/CurlConverter";
import TextShare from "./components/TextShare";
import TempMail from "./components/TempMail";
import ToolCard from "./components/ToolCard";
import SearchInput from "./components/SearchInput";
import Loader from "./components/Loader";
import StatsPage from "./components/StatsPage";
import HtmlHosting from "./components/HtmlHosting";
import { FileCode } from "lucide-react";

// 创建主题上下文
const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

function Header() {
  const { darkMode, setDarkMode } = useTheme();
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className={`sticky top-0 z-50 w-full border-b transition-colors duration-300 backdrop-blur-md bg-opacity-80 dark:bg-opacity-80 ${darkMode ? 'bg-[#111111] border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex h-14 items-center justify-between px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center gap-4">
          {!isHome && (
            <Link to="/" className={`flex items-center gap-1 text-sm font-medium transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
              返回
            </Link>
          )}
          <Link to="/" className="flex items-center gap-2">
            <img src="https://free.boltp.com/2026/04/24/69eb1c3535ebf.webp" alt="BestTool Logo" className="w-8 h-8 object-contain" />
            <span className={`text-lg font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>BestTool</span>
          </Link>
        </div>
        <nav className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className={`text-sm font-medium ${darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-black'}`}>首页</Link>
          <Link to="/stats" className={`text-sm font-medium flex items-center gap-1 ${darkMode ? 'text-indigo-400 hover:text-white' : 'text-indigo-600 hover:text-black'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path></svg>
            功能使用统计排行
          </Link>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-gray-400 hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-100'} outline-none`}
            title="切换深色模式"
          >
            {darkMode ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fillRule="evenodd" clipRule="evenodd"></path></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [globalVisits, setGlobalVisits] = useState('-');

  // 深色模式初始化逻辑 (默认白色，记录用户操作)
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_preference');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    } else if (savedTheme === 'light') {
      setDarkMode(false);
    } else {
      setDarkMode(false); // 默认白色
      localStorage.setItem('theme_preference', 'light');
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_preference', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_preference', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    // 统计逻辑：只在第一次访问增加访问量
    if (!localStorage.getItem('visited_besttool')) {
      localStorage.setItem('visited_besttool', '1');
      fetch('/api/stats', { 
        method: 'POST', 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: 'app_visits' }) 
      }).then(() => fetchGlobalVisits());
    } else {
      fetchGlobalVisits();
    }
  }, []);

  const fetchGlobalVisits = () => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => {
        if(data.success) {
          const v = data.data.find(s => s.key === 'app_visits');
          if (v) setGlobalVisits(v.count);
        }
      });
  };

  const gridColor = darkMode ? 'rgba(114, 114, 114, 0.15)' : 'rgba(114, 114, 114, 0.1)';
  const gridStyle = {
    backgroundColor: darkMode ? '#191a1a' : '#fafafa',
    backgroundImage: `
      linear-gradient(0deg, transparent 24%, ${gridColor} 25%, ${gridColor} 26%, transparent 27%, transparent 74%, ${gridColor} 75%, ${gridColor} 76%, transparent 77%, transparent),
      linear-gradient(90deg, transparent 24%, ${gridColor} 25%, ${gridColor} 26%, transparent 27%, transparent 74%, ${gridColor} 75%, ${gridColor} 76%, transparent 77%, transparent)
    `,
    backgroundSize: '55px 55px'
  };

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <BrowserRouter>
        <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} style={gridStyle}>
          <Header />
          <main className="flex-1 w-full flex flex-col pt-4">
            <PageTransitionWrapper>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/douyin" element={<DouyinPage />} />
                <Route path="/json" element={<JsonPage />} />
                <Route path="/curl" element={<CurlPage />} />
                <Route path="/share" element={<SharePage />} />
                <Route path="/tempmail" element={<TempMailPage />} />
                <Route path="/html-host" element={<HtmlHostingPage />} />
                <Route path="/stats" element={<StatsPage darkMode={darkMode} />} />
              </Routes>
            </PageTransitionWrapper>
          </main>
          
          <footer className={`py-6 text-center text-sm border-t mt-auto ${darkMode ? 'border-gray-800 text-gray-500' : 'border-gray-200 text-gray-500'}`}>
            BestTool · 累计服务访问人数: <span className={`font-bold font-mono px-1 ${darkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>{globalVisits}</span> 人次
          </footer>
        </div>
      </BrowserRouter>
    </ThemeContext.Provider>
  );
}

function PageTransitionWrapper({ children }) {
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // 切换路由时激活转场
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 600); // 转场持续时间
    return () => clearTimeout(timer);
  }, [location.pathname]);

  if (loading) {
    return <Loader />;
  }

  return children;
}

function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { darkMode } = useTheme();

  const tools = [
    {
      id: "douyin",
      icon: <Video className="w-8 h-8 text-rose-500" />,
      title: "抖音无水印解析",
      description: "一键无水印视频解析工具",
      path: "/douyin"
    },
    {
      id: "json",
      icon: <Braces className="w-8 h-8 text-cyan-500" />,
      title: "JSON 格式化",
      description: "一键格式化、转表格与复制",
      path: "/json"
    },
    {
      id: "curl",
      icon: <Terminal className="w-8 h-8 text-indigo-500" />,
      title: "cURL 代码转换",
      description: "将 cURL 快速转换为代码",
      path: "/curl"
    },
    {
      id: "share",
      icon: <Send className="w-8 h-8 text-amber-500" />,
      title: "文本在线传递",
      description: "跨设备快传剪贴板文本与代码",
      path: "/share"
    },
    {
      id: "tempmail",
      icon: <Mail className="w-8 h-8 text-emerald-500" />,
      title: "临时隐私邮箱",
      description: "一键生成随机邮箱保护隐私",
      path: "/tempmail"
    },
    {
      id: "html",
      icon: <FileCode className="w-8 h-8 text-blue-500" />,
      title: "临时网页托管",
      description: "一键生成直接渲染的 HTML 链接 (2天后毁)",
      path: "/html-host"
    }
  ];

  const filteredTools = tools.filter(
    (tool) =>
      tool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const trackToolClick = (toolId) => {
    fetch('/api/stats', { 
      method: 'POST', 
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: toolId }) 
    });
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex-1">
      {/* 搜索区域 */}
      <div className="w-full max-w-4xl mx-auto mb-12">
        <h1 className={`text-center text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          在这个工具库中寻找你需要的
        </h1>
        <SearchInput
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索功能..."
        />
      </div>

      <div className="max-w-[1600px] mx-auto w-full">
        {/* 分类标题类似截图的 "最新工具" */}
        <h2 className={`text-xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>大家都在用</h2>

        {/* 工具网格: 满宽自适应 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {filteredTools.length === 0 ? (
            <div className={`col-span-full py-16 text-left ${darkMode ? 'text-gray-600' : 'text-gray-400'}`}>
              <p className="text-lg">{searchQuery ? "未找到匹配的功能" : "暂无内容..."}</p>
            </div>
          ) : (
            filteredTools.map((tool) => (
              <Link key={tool.id} to={tool.path} onClick={() => trackToolClick(tool.id)} className="block outline-none">
                <ToolCard
                  icon={tool.icon}
                  title={tool.title}
                  description={tool.description}
                  coverImage={tool.coverImage}
                  darkMode={darkMode}
                />
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function DouyinPage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <DouyinParser darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function JsonPage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <JsonFormatter darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function CurlPage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <CurlConverter darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function SharePage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <TextShare darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function TempMailPage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <TempMail darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

function HtmlHostingPage() {
  const { darkMode } = useTheme();

  return (
    <div className="w-full py-8 md:py-12 flex-1">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`rounded-3xl ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
          <HtmlHosting darkMode={darkMode} />
        </div>
      </div>
    </div>
  );
}

export default App;
