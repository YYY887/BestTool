const ToolCard = ({ icon, title, description, coverImage, darkMode }) => {
  return (
    <div 
      className={`group cursor-pointer rounded-2xl border transition-all duration-300 overflow-hidden outline-none hover:-translate-y-1 hover:shadow-lg
        ${darkMode 
          ? 'bg-[#1a1a1a] border-gray-800 hover:border-gray-700' 
          : 'bg-white border-gray-200 hover:border-gray-300'}`}
    >
      {coverImage && (
        <div className={`w-full h-40 overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
          <img src={coverImage} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </div>
      )}
      <div className="p-6">
        {!coverImage && <div className="text-3xl mb-4">{icon}</div>}
        <h3 className={`text-xl font-semibold mb-2 tracking-tight ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
          {title}
        </h3>
        <p className={`text-sm leading-relaxed ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          {description}
        </p>
      </div>
    </div>
  );
};

export default ToolCard;
