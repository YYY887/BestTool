import { useEffect, useState } from 'react';
import { BarChart2, Activity, Users, Star } from 'lucide-react';

const toolNames = {
  douyin: "抖音无水印解析",
  json: "JSON 格式化",
  curl: "cURL 代码转换",
  share: "文本在线传递",
  tempmail: "临时隐私邮箱",
  app_visits: "全站总访问数"
};

function StatsPage({ darkMode }) {
  const [stats, setStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        if (data.success) {
          setStats(data.data || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const features = stats.filter(s => s.key !== 'app_visits').sort((a, b) => b.count - a.count);
  const visits = stats.find(s => s.key === 'app_visits')?.count || 0;

  return (
    <div className="w-full font-sans max-w-4xl mx-auto py-8">
      <div className="text-center space-y-3 mb-10">
        <h2 className={`text-4xl font-bold tracking-tight inline-flex items-center gap-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          <BarChart2 className="w-8 h-8 text-indigo-500" /> 数据看板
        </h2>
        <p className={`text-base ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          实时洞察哪些工具最受大家欢迎
        </p>
      </div>

      <div className="space-y-6">
        {/* 总揽 */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm transition-all ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-emerald-500/10 text-emerald-500' : 'bg-emerald-100 text-emerald-600'}`}>
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>全站总访问用户</div>
                <div className={`text-3xl font-bold font-mono tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>{isLoading ? '-' : visits}</div>
              </div>
            </div>
          </div>
          
          <div className={`p-6 rounded-3xl border flex items-center justify-between shadow-sm transition-all ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-2xl ${darkMode ? 'bg-indigo-500/10 text-indigo-500' : 'bg-indigo-100 text-indigo-600'}`}>
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>最热功能</div>
                <div className={`text-xl md:text-2xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                  {isLoading ? '-' : (features[0] ? toolNames[features[0].key] || features[0].key : '暂无')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 排行榜 */}
        <div className={`rounded-3xl border overflow-hidden shadow-sm transition-all ${darkMode ? 'bg-[#1a1a1a] border-gray-800' : 'bg-white border-gray-200'}`}>
          <div className={`px-6 py-4 border-b flex justify-between items-center ${darkMode ? 'border-gray-800 bg-black/20' : 'border-gray-100 bg-gray-50'}`}>
            <h3 className={`font-semibold flex items-center gap-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
              <Star className="w-4 h-4 text-amber-500" /> 功能使用频次排行
            </h3>
          </div>
          
          <div className="divide-y p-0">
            {features.map((stat, idx) => {
               // 算百分比
               const maxCount = features[0]?.count || 1;
               const percent = (stat.count / maxCount) * 100;

               return (
                <div key={stat.key} className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${darkMode ? 'divide-gray-800 hover:bg-gray-800/30' : 'divide-gray-100 hover:bg-gray-50'}`}>
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`w-8 h-8 rounded-full flex justify-center items-center font-bold text-sm ${
                      idx === 0 ? 'bg-amber-100 text-amber-600' : 
                      idx === 1 ? 'bg-gray-200 text-gray-600' :
                      idx === 2 ? 'bg-orange-100 text-orange-600' : 
                      (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500')
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {toolNames[stat.key] || stat.key}
                      </div>
                      <div className="w-full mt-2 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all rounded-full" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2 w-32 justify-end">
                    <div className={`font-mono text-xl font-bold tracking-tight ${darkMode ? 'text-white' : 'text-black'}`}>{stat.count}</div>
                    <div className={`text-xs ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>次使用</div>
                  </div>
                </div>
               );
            })}
            
            {features.length === 0 && !isLoading && (
              <div className={`p-10 text-center ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                尚未产生使用数据
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
