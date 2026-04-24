import { useTheme } from '../App';

const SearchInput = ({ value, onChange, placeholder = "搜索功能..." }) => {
  const { darkMode } = useTheme();

  return (
    <div className="relative w-full">
      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
        <svg className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
      </div>
      <input
        type="text"
        className={`w-full pl-12 pr-4 py-3 rounded-full border transition-all duration-300 outline-none
        ${darkMode
            ? 'bg-[#1a1a1a] border-gray-800 text-gray-200 placeholder-gray-600 focus:border-gray-600 hover:border-gray-700'
            : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400 focus:border-gray-300 hover:border-gray-300 hover:shadow-sm'}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default SearchInput;
