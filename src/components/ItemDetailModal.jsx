// --- components/ItemDetailModal.jsx ---
const ItemDetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const getGeminiQuery = () => {
    if (item.type === 'food') return `幫我分析這家店：${item.title} (${item.location || '首爾'})。請提供：1. 必點推薦菜色 2. 網友評價/避雷指南 3. 人均消費預算 4. 是否適合家庭用餐？`;
    if (item.type === 'sightseeing') return `請介紹首爾景點：${item.title}。請提供：1. 景點特色與必看亮點 2. 建議停留時間 3. 交通方式與附近順遊景點 4. 適合家庭/親子的程度？`;
    if (item.type === 'hotel') return `請分析首爾住宿：${item.title}。請提供：1. 網友綜合評價 (優缺點) 2. 距離地鐵站/機場巴士的便利性 3. 附近便利商店與美食 4. 是否適合家庭入住？`;
    if (item.type === 'transport') return `請問在首爾如何搭乘：${item.title} (${item.note})？請提供：1. 搭乘位置與路線 2. 時刻表或班次頻率 3. 票價與支付方式 (T-money?)`;
    return `請介紹：${item.title} (${item.location || '首爾'})。請提供詳細的旅遊資訊、評價以及注意事項。`;
  };
  const handleAskGemini = () => { const query = getGeminiQuery(); window.open(`https://gemini.google.com/app?q=${encodeURIComponent(query)}`, '_blank'); };
  const handleGoogleSearch = () => { const query = `${item.title} ${item.location || '首爾'} 評價`; window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank'); };
  const handleGoogleMap = () => { const query = item.address || (item.location ? `${item.title} ${item.location}` : item.title); window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`, '_blank'); };
  
  const getAiConfig = (type) => {
     switch (type) {
        case 'food': return { title: "AI 探店助手", prompts: ["必吃推薦", "人均預算", "避雷 / 貼心提醒"], icons: [<ThumbsUp size={14}/>, <Wallet size={14}/>, <AlertTriangle size={14}/>] };
        case 'sightseeing': return { title: "AI 景點導覽", prompts: ["特色亮點", "建議停留", "參觀貼士"], icons: [<Star size={14}/>, <Clock size={14}/>, <AlertCircle size={14}/>] };
        case 'hotel': return { title: "AI 住宿分析", prompts: ["住宿評價", "周邊機能", "入住須知"], icons: [<Star size={14}/>, <MapPin size={14}/>, <AlertCircle size={14}/>] };
        default: return { title: "AI 旅遊助手", prompts: ["相關資訊", "網友評價", "注意事項"], icons: [<Search size={14}/>, <MessageCircle size={14}/>, <AlertCircle size={14}/>] };
     }
  }
  const aiConfig = getAiConfig(item.type);

  return (
    <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl relative h-[85vh] md:h-auto md:max-h-[85vh] flex flex-col">
        <div className="h-56 bg-stone-200 relative shrink-0">
          <img src={`https://source.unsplash.com/800x600/?korean,${item.type},${item.title}`} onError={(e) => e.target.src = "https://images.unsplash.com/photo-1580651315530-69c8e0026377?q=80&w=2070&auto=format&fit=crop"} alt={item.title} className="w-full h-full object-cover" />
          <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-full text-white transition-colors border border-white/20"><X size={20} /></button>
          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-20">
             <div className="flex gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-md text-white text-[10px] font-bold uppercase tracking-wider ${item.type === 'food' ? 'bg-orange-500' : item.type === 'sightseeing' ? 'bg-emerald-500' : 'bg-blue-500'}`}>{item.type}</span>
                {item.rating && <span className="px-2 py-0.5 rounded-md bg-white/20 text-white border border-white/20 text-[10px] backdrop-blur-md flex items-center gap-1"><Star size={10} className="fill-current text-yellow-400"/> {item.rating}</span>}
             </div>
            <h2 className="text-3xl font-bold text-white mb-1 shadow-sm">{item.title}</h2>
            <p className="text-white/80 text-sm flex items-center gap-1 font-medium truncate max-w-full"><MapPin size={14} className="shrink-0"/> {item.address || item.location || '首爾'}</p>
          </div>
        </div>
        <div className="p-6 overflow-y-auto flex-1 bg-stone-50">
          <div className="grid grid-cols-2 gap-3 mb-6">
             <button onClick={handleGoogleSearch} className="p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-purple-200 hover:text-purple-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base"><Search size={18} className="text-purple-500"/> Google 搜尋</button>
             <button onClick={handleGoogleMap} className="p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-blue-200 hover:text-blue-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base"><MapPin size={18} className="text-blue-500"/> Google 導航</button>
            {['food', 'sightseeing'].includes(item.type) && <button onClick={() => window.open(`https://www.instagram.com/explore/tags/${item.title}/`, '_blank')} className="col-span-2 p-3 rounded-2xl bg-white border border-stone-100 text-stone-700 hover:bg-stone-50 hover:border-pink-200 hover:text-pink-600 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base"><Camera size={18} className="text-pink-500"/> Instagram 美照</button>}
            {item.link && <button onClick={() => window.open(item.link, '_blank')} className="col-span-2 p-3 rounded-2xl bg-stone-800 text-white hover:bg-stone-700 flex items-center justify-center gap-2 font-bold shadow-sm transition-all text-sm md:text-base"><Globe size={18}/> 查看相關連結</button>}
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-100 relative overflow-hidden mb-6 group">
            <div className="absolute top-0 right-0 p-0 opacity-5 group-hover:opacity-10 transition-opacity"><Sparkles size={120} className="text-indigo-600 -mr-4 -mt-4"/></div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-indigo-700 font-bold"><div className="p-1.5 bg-indigo-100 rounded-lg"><Sparkles size={16} /></div><span>{aiConfig.title}</span></div>
                <span className="text-[10px] bg-indigo-50 text-indigo-400 px-2 py-1 rounded-full">Gemini Powered</span>
            </div>
            <div className="space-y-4">
               <div className="flex gap-3 items-start"><div className="mt-0.5 p-1 bg-orange-100 rounded text-orange-600 shrink-0">{aiConfig.icons[0]}</div><div><span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[0]}</span><p className="text-sm text-stone-700 font-medium leading-relaxed">{item.desc || '尚未載入資訊，請點擊下方按鈕詢問 AI。'}</p></div></div>
               <div className="flex gap-3 items-start"><div className="mt-0.5 p-1 bg-green-100 rounded text-green-600 shrink-0">{aiConfig.icons[1]}</div><div><span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[1]}</span><p className="text-sm text-stone-700 font-medium">{item.price || item.note || "暫無資料"}</p></div></div>
               <div className="flex gap-3 items-start"><div className="mt-0.5 p-1 bg-red-100 rounded text-red-600 shrink-0">{aiConfig.icons[2]}</div><div><span className="block text-xs font-bold text-stone-400 uppercase tracking-wider mb-0.5">{aiConfig.prompts[2]}</span><p className="text-sm text-stone-700 font-medium">建議事先確認營業時間與人潮狀況。</p></div></div>
            </div>
            <div className="mt-6 pt-4 border-t border-indigo-50">
                <button onClick={handleAskGemini} className="w-full py-3 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"><MessageCircle size={16} /> 詢問 Gemini 詳細資訊</button>
                <p className="text-[10px] text-center text-stone-300 mt-2">點擊將開啟 Google Gemini 進行即時分析</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
