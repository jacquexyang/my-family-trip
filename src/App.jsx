import React, { useState, useMemo, useEffect } from 'react';
import { 
  MapPin, Clock, Users, Share2, ChevronLeft, MoreHorizontal, Coffee, 
  Camera, Utensils, Train, Moon, Sun, Heart, Calendar, Plane, Navigation, 
  Wallet, ArrowRightLeft, Plus, X, ArrowRight, Umbrella, Car, Snowflake, 
  ExternalLink, Castle, Gift, ShoppingBag, Copy, CheckCircle2, Edit3, 
  Globe, PlusCircle, Briefcase, Lock, KeyRound, CheckSquare, UserPlus, Trash2,
  AlertCircle
} from 'lucide-react';

// --- 1. 資料庫區 (Data Layer) ---

const TRIP_DATA = {
  id: 'seoul_2024',
  password: "2024", // 設定密碼，若留空 "" 則直接進入
  title: "冬日首爾聖誕之旅 🎄",
  subtitle: "滑雪、美食與聖誕燈飾的浪漫行",
  dates: "2024.12.21 - 2024.12.27",
  budget: 60000,
  coverImage: "https://images.unsplash.com/photo-1542044896530-05d85be9b11a?q=80&w=2000&auto=format&fit=crop", 
  participants: [
    { id: 1, name: "我", avatar: "https://i.pravatar.cc/150?u=1" },
    { id: 2, name: "家人A", avatar: "https://i.pravatar.cc/150?u=5" },
    { id: 3, name: "家人B", avatar: "https://i.pravatar.cc/150?u=8" },
  ],
  packingList: [
    { category: "證件與錢財", items: [
      { id: 'p1', name: "護照 (效期6個月以上)", checked: false },
      { id: 'p2', name: "韓幣 / 信用卡 / WOWPASS", checked: false },
      { id: 'p3', name: "網卡 / E-sim / Wifi機", checked: false },
      { id: 'p4', name: "機票 / 住宿憑證", checked: false },
      { id: 'p5', name: "T-money 交通卡", checked: false }
    ]},
    { category: "電子產品", items: [
      { id: 'e1', name: "轉接頭 (韓國雙圓孔)", checked: false },
      { id: 'e2', name: "行動電源", checked: false },
      { id: 'e3', name: "充電線 (手機/手錶)", checked: false }
    ]},
    { category: "衣物 (冬季)", items: [
      { id: 'c1', name: "發熱衣 / 發熱褲", checked: false },
      { id: 'c2', name: "羽絨外套 / 大衣", checked: false },
      { id: 'c3', name: "圍巾 / 毛帽 / 手套 (滑雪必備)", checked: false },
      { id: 'c4', name: "好走的鞋子", checked: false }
    ]},
    { category: "個人用品", items: [
      { id: 't1', name: "牙刷牙膏 (韓國環保不提供)", checked: false },
      { id: 't2', name: "個人藥品 (感冒/腸胃/暈車)", checked: false },
      { id: 't3', name: "保養品 / 護手霜 / 暖暖包", checked: false }
    ]}
  ],
  days: [
    {
      day: 1,
      label: "Day 1",
      date: "12/21 (六)",
      weather: "snow",
      items: [
        { id: 101, time: "07:05", type: "transport", title: "桃園機場起飛", note: "長榮航空 BR170", desc: "預計 10:30 抵達仁川機場 (ICN)。", icon: Plane, location: "Taoyuan International Airport" },
        { id: 102, time: "11:40", type: "transport", title: "前往弘大", note: "AREX 機場快線 (普通車)", desc: "搭乘普通車前往弘大入口站 (約53分)。\n建議先在機場儲值好 T-money。", icon: Train, location: "Incheon International Airport" },
        { id: 103, time: "12:50", type: "info", title: "⚠️ 重要：寄放行李", note: "弘大站 7號出口 RAON", desc: "或使用站內置物櫃。不要先去民宿，時間不夠！", icon: AlertCircle, location: "Hongik University Station Exit 7" },
        { id: 104, time: "13:10", type: "food", title: "弘大午餐", note: "商圈簡單用餐", icon: Utensils, location: "Hongdae Shopping Street" },
        { id: 105, time: "14:00", type: "sightseeing", title: "弘大亂打秀", note: "Nanta Show", desc: "需提早 20 分鐘換票入場。", icon: Users, location: "Hongdae Nanta Theatre" },
        { id: 106, time: "15:30", type: "hotel", title: "Check-in", note: "回車站取行李 -> 民宿", icon: Moon, location: "Hongik University Station" },
        { id: 107, time: "18:00", type: "food", title: "弘大/新村晚餐", note: "週六熱鬧街頭", desc: "晚餐後可逛街，欣賞街頭表演。", icon: Coffee, location: "Hongdae Shopping Street" },
      ]
    },
    {
      day: 2,
      label: "Day 2",
      date: "12/22 (日)",
      weather: "sunny",
      items: [
        { id: 201, time: "09:00", type: "transport", title: "包車出發", note: "民宿門口集合", desc: "前往江華島一日遊。", icon: Car, location: "Hongdae" },
        { id: 202, time: "10:30", type: "sightseeing", title: "江華島 Luge", note: "斜坡滑車", desc: "刺激好玩的斜坡滑車體驗。", icon: Users, location: "Ganghwa Seaside Resort Luge" },
        { id: 203, time: "12:30", type: "food", title: "午餐：韓定食", note: "江華島特色料理", icon: Utensils, location: "Ganghwa-gun" },
        { id: 204, time: "13:30", type: "sightseeing", title: "小倉織物體驗館", note: "手帕蓋章 DIY", icon: Gift, location: "Sochang Experience Center" },
        { id: 205, time: "14:30", type: "food", title: "朝陽紡織咖啡廳", note: "網美打卡點", desc: "廢棄紡織廠改建的超大美術館級咖啡廳。", icon: Coffee, location: "Joyang Bangjik" },
        { id: 206, time: "16:15", type: "sightseeing", title: "愛妓峰和平生態公園", note: "⚠️ 需帶護照", desc: "這裡有星巴克，可以眺望北韓景觀。", icon: MapPin, location: "Aegibong Peace Eco Park" },
        { id: 207, time: "19:00", type: "transport", title: "返回弘大/新村", note: "下車用餐", icon: Car, location: "Sinchon Station" },
        { id: 208, time: "19:30", type: "food", title: "晚餐：暖身鍋物", note: "一隻雞 或 部隊鍋", desc: "消除一整天的疲勞。", icon: Utensils, location: "Sinchon" },
      ]
    },
    {
      day: 3,
      label: "Day 3",
      date: "12/23 (一)",
      weather: "snow",
      items: [
        { id: 301, time: "07:30", type: "transport", title: "滑雪團集合", note: "KKday 行程 (弘大)", desc: "請依憑證上的集合時間為準 (通常 07:00-08:00)。", icon: Car, location: "Hongik University Station Exit 8" },
        { id: 302, time: "10:00", type: "sightseeing", title: "芝山森林滑雪渡假村", note: "全天滑雪體驗", desc: "享受滑雪樂趣！", icon: Snowflake, location: "Jisan Forest Resort" },
        { id: 303, time: "17:30", type: "transport", title: "返回首爾", note: "約 18:00 抵達弘大", icon: Car, location: "Hongik University Station" },
        { id: 304, time: "18:30", type: "food", title: "晚餐：韓國烤肉", note: "補充體力", desc: "滑雪消耗大，建議吃三層肉或韓牛。", icon: Utensils, location: "Hongdae BBQ Street" },
        { id: 305, time: "20:30", type: "info", title: "早點休息", note: "養精蓄銳", icon: Moon, location: "Hongdae" },
      ]
    },
    {
      day: 4,
      label: "Day 4",
      date: "12/24 (二)",
      weather: "snow",
      items: [
        { id: 401, time: "09:00", type: "transport", title: "前往三成站", note: "地鐵 2號線", desc: "弘大 ➔ 三成站 (Samseong)，直通 COEX Mall。", icon: Train, location: "Samseong Station" },
        { id: 402, time: "10:00", type: "sightseeing", title: "COEX 星空圖書館", note: "巨型聖誕樹", desc: "欣賞發光書牆與聖誕裝置藝術，拍照打卡。", icon: Camera, location: "Starfield Library" },
        { id: 403, time: "11:30", type: "food", title: "午餐：COEX Mall", note: "建議在此用餐", desc: "選擇多且環境好。先吃飽再進樂天世界戰鬥。", icon: Utensils, location: "COEX Mall" },
        { id: 404, time: "12:30", type: "transport", title: "移動至蠶室", note: "地鐵 2號線", desc: "三成 ➔ 蠶室 (Jamsil)，約 6 分鐘。", icon: Train, location: "Jamsil Station" },
        { id: 405, time: "13:00", type: "sightseeing", title: "樂天世界 (聖誕夜)", note: "Lotte World", desc: "下午入場。室內探險世界 + 室外魔幻島。可玩到晚上看遊行。", icon: Castle, location: "Lotte World" },
        { id: 406, time: "20:00", type: "sightseeing", title: "石村湖 / 樂天塔", note: "聖誕燈飾 & 夜景", desc: "離開樂園後欣賞外圍燈飾與超大聖誕樹。", icon: Gift, location: "Seokchon Lake" },
        { id: 407, time: "21:30", type: "transport", title: "返回弘大", note: "地鐵 2號線直達", icon: Train, location: "Hongik University Station" },
      ]
    },
    {
      day: 5, 
      label: "Day 5",
      date: "12/25 (三)",
      weather: "snow",
      items: [
        { id: 501, time: "09:30", type: "transport", title: "前往光化門", note: "地鐵/公車", icon: Train, location: "Gwanghwamun Station" },
        { id: 502, time: "10:00", type: "sightseeing", title: "光化門", note: "守門將換崗儀式", icon: Users, location: "Gwanghwamun" },
        { id: 503, time: "10:30", type: "sightseeing", title: "景福宮", note: "參觀古宮", desc: "感受朝鮮王朝氣息。", icon: Castle, location: "Gyeongbokgung Palace" },
        { id: 504, time: "12:30", type: "food", title: "通仁市場 (午餐)", note: "銅錢便當", desc: "用古銅錢換購市場小吃。", icon: Utensils, location: "Tongin Market" },
        { id: 505, time: "14:30", type: "sightseeing", title: "西村散策", note: "Seochon", desc: "韓屋咖啡廳巡禮、逛文創小店。", icon: Coffee, location: "Seochon" },
        { id: 506, time: "17:00", type: "sightseeing", title: "漫步回光化門", note: "欣賞街景", icon: MapPin, location: "Gwanghwamun Square" },
        { id: 507, time: "18:00", type: "sightseeing", title: "光化門耶誕市集", note: "Seoul Lantern Festival", desc: "感受濃厚的聖誕氣氛。", icon: Gift, location: "Gwanghwamun Square" },
      ]
    },
    {
      day: 6,
      label: "Day 6",
      date: "12/26 (四)",
      weather: "sunny",
      items: [
        { id: 601, time: "10:00", type: "sightseeing", title: "昌信洞文具玩具市場", note: "東大門/東廟站", desc: "文具控必逛，價格實惠。", icon: ShoppingBag, location: "Changsin-dong Stationery Toy Market" },
        { id: 602, time: "12:30", type: "food", title: "廣藏市場 (午餐)", note: "必吃三寶", desc: "綠豆餅、生牛肉、麻藥飯捲。", icon: Utensils, location: "Gwangjang Market" },
        { id: 603, time: "14:30", type: "sightseeing", title: "潮牌一條街", note: "聖水洞 或 弘大", desc: "選擇一處逛街採買。", icon: Users, location: "Seongsu-dong" },
        { id: 604, time: "17:00", type: "sightseeing", title: "明洞新世界百貨", note: "3D 電子聖誕裝飾", desc: "觀賞建築物外牆的燈光秀。", icon: Camera, location: "Shinsegae Department Store Myeongdong" },
        { id: 605, time: "18:30", type: "sightseeing", title: "清溪川 / 東大門", note: "首爾燈節 & 晚餐", desc: "散步觀賞燈飾，晚餐可去東大門一隻雞胡同。", icon: Gift, location: "Cheonggyecheon Stream" },
      ]
    },
    {
      day: 7,
      label: "Day 7",
      date: "12/27 (五)",
      weather: "sunny",
      items: [
        { id: 701, time: "10:00", type: "hotel", title: "退房 Check-out", note: "寄放行李", desc: "建議寄放在弘大站 (RAON 或 T-Luggage)，方便去機場。", icon: Moon, location: "Hongik University Station" },
        { id: 702, time: "11:00", type: "sightseeing", title: "望遠市場", note: "Mangwon Market", desc: "弘大搭地鐵6號線至望遠站 (1站)。\n必吃/買：炸雞丁、可樂餅、雨靴、乾貨泡菜。", icon: ShoppingBag, location: "Mangwon Market" },
        { id: 703, time: "13:00", type: "food", title: "望遠洞咖啡廳", note: "悠閒午後", desc: "在市場周邊的文青咖啡廳休息。", icon: Coffee, location: "Mangwon-dong" },
        { id: 704, time: "15:30", type: "transport", title: "取行李", note: "返回弘大入口站", icon: MapPin, location: "Hongik University Station" },
        { id: 705, time: "16:00", type: "transport", title: "前往機場", note: "AREX 機場快線", desc: "週五傍晚易塞車，強烈建議搭快線/地鐵。\n約 17:15 抵達仁川機場。", icon: Train, location: "Incheon International Airport" },
        { id: 706, time: "17:30", type: "transport", title: "機場報到", note: "辦理登機、退稅", icon: CheckCircle2, location: "Incheon International Airport" },
        { id: 707, time: "19:45", type: "transport", title: "搭機返台", note: "長榮航空 BR159", desc: "21:40 抵達桃園機場 (TPE)。", icon: Plane, location: "Incheon International Airport" },
      ]
    }
  ]
};

// --- 2. 元件區 (Components) ---

// 2.1 標籤元件
const Tag = ({ type }) => {
  const styles = {
    food: "bg-orange-50 text-orange-600 border-orange-100",
    sightseeing: "bg-emerald-50 text-emerald-600 border-emerald-100",
    transport: "bg-blue-50 text-blue-600 border-blue-100",
    hotel: "bg-purple-50 text-purple-600 border-purple-100",
    info: "bg-gray-50 text-gray-600 border-gray-100",
  };
  
  const labelMap = { food: '餐飲', sightseeing: '景點', transport: '交通', hotel: '住宿', info: '資訊' };

  return (
    <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${styles[type] || "bg-gray-50 text-gray-600"}`}>
      {labelMap[type] || '其他'}
    </span>
  );
};

// 2.2 記帳邏輯
const calculateDebts = (expenses, participants) => {
  const balances = {};
  participants.forEach(p => balances[p.id] = 0);
  expenses.forEach(exp => {
    const payerId = exp.payerId;
    const amount = parseFloat(exp.amount);
    const splitCount = participants.length;
    const splitAmount = amount / splitCount;
    balances[payerId] += amount;
    participants.forEach(p => { balances[p.id] -= splitAmount; });
  });
  let debtors = [], creditors = [];
  Object.keys(balances).forEach(id => {
    const amount = balances[id];
    if (amount < -1) debtors.push({ id: parseInt(id), amount });
    if (amount > 1) creditors.push({ id: parseInt(id), amount });
  });
  const transactions = [];
  debtors.sort((a, b) => a.amount - b.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  let i = 0, j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.min(Math.abs(debtor.amount), creditor.amount);
    transactions.push({ from: participants.find(p => p.id === debtor.id), to: participants.find(p => p.id === creditor.id), amount: Math.round(amount) });
    debtor.amount += amount;
    creditor.amount -= amount;
    if (Math.abs(debtor.amount) < 1) i++;
    if (creditor.amount < 1) j++;
  }
  return transactions;
};

// 2.3 登入鎖定畫面
const TripLoginModal = ({ trip, onUnlock }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input === trip.password) onUnlock();
    else { setError(true); setTimeout(() => setError(false), 2000); }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-stone-900/40 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-300 relative text-center border border-white/20">
        <div className="flex justify-center mb-6">
          <div className="bg-stone-100 p-4 rounded-2xl text-stone-700 shadow-inner"><Lock size={32} /></div>
        </div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">行程已鎖定</h3>
        <p className="text-sm text-stone-500 mb-6">請輸入「{trip.title}」的通關密語</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Passcode" className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-all" autoFocus />
          <button type="submit" className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold text-lg hover:bg-stone-800 transition-all shadow-lg active:scale-95">解鎖</button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm font-bold animate-pulse flex justify-center gap-1"><X size={16} /> 密碼錯誤</p>}
      </div>
    </div>
  );
};

// 2.4 主行程介面 (Single Trip Dashboard)
const TripDashboard = ({ tripData }) => {
  const [activeTab, setActiveTab] = useState('schedule'); // schedule, expenses, checklist
  const [activeDay, setActiveDay] = useState(1);
  const [likedItems, setLikedItems] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  // State for features
  const [participants, setParticipants] = useState(tripData.participants);
  const [packingList, setPackingList] = useState(tripData.packingList || []);
  const [expenses, setExpenses] = useState([{ id: 1, title: '預付公基金', amount: 3000, payerId: 1, date: '出發前' }]);
  const [budget, setBudget] = useState(tripData.budget || 50000);
  
  // UI State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', payerId: 1 });
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  // 確保天數資料存在
  const currentDayData = tripData.days?.find(d => d.day === activeDay) || tripData.days?.[0] || { items: [] };

  const handleShare = () => {
    const url = window.location.href;
    const text = `✈️ ${tripData.title}\n📅 ${tripData.dates}\n密碼: ${tripData.password}\n連結: ${url}`;
    navigator.clipboard.writeText(text);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 3000);
  };

  const copyAddress = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNavigation = (location, title) => {
    const query = location || title;
    // 使用 Google Maps Web Search API，這在手機上會嘗試開啟 App，電腦上開網頁
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleAddExpense = () => {
    if (!newExpense.title || !newExpense.amount) return;
    const expense = {
      id: Date.now(),
      title: newExpense.title,
      amount: parseInt(newExpense.amount),
      payerId: parseInt(newExpense.payerId),
      date: currentDayData.date?.split(' ')[0] || 'Today'
    };
    setExpenses([...expenses, expense]);
    setNewExpense({ title: '', amount: '', payerId: 1 });
    setIsAddExpenseOpen(false);
  };

  const handleUpdateBudget = () => {
    setBudget(parseInt(newBudgetInput));
    setIsEditingBudget(false);
  };

  const handleAddPerson = () => {
    if (!newPersonName.trim()) return;
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    const newPerson = {
      id: newId,
      name: newPersonName,
      avatar: `https://i.pravatar.cc/150?u=${newId + 10}` // Generate new avatar
    };
    setParticipants([...participants, newPerson]);
    setNewPersonName('');
    setIsAddPersonOpen(false);
  };

  const handleRemovePerson = (id) => {
    // 簡單的刪除邏輯，實際應用可能要考慮是否有人已經有記帳紀錄
    setParticipants(participants.filter(p => p.id !== id));
  };

  const togglePackingItem = (categoryId, itemId) => {
    setPackingList(prevList => prevList.map(cat => {
      if (cat.category !== categoryId) return cat;
      return {
        ...cat,
        items: cat.items.map(item => item.id === itemId ? { ...item, checked: !item.checked } : item)
      };
    }));
  };

  const handleAddPackingItem = (categoryIndex) => {
    if (!newItemName.trim()) return;
    const newItem = { id: Date.now().toString(), name: newItemName, checked: false };
    const newList = [...packingList];
    newList[categoryIndex].items.push(newItem);
    setPackingList(newList);
    setNewItemName('');
  };

  const debts = useMemo(() => calculateDebts(expenses, participants), [expenses, participants]);
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetPercentage = Math.min((totalSpent / budget) * 100, 100);

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pb-24 md:pb-0">
      {/* 1. Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[50vh]">
        <img src={tripData.coverImage} alt={tripData.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-stone-900/40"></div>
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-end items-center z-10 max-w-7xl mx-auto w-full">
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium">
            {copiedId === 'share-btn' ? <CheckCircle2 size={18} className="text-green-400"/> : <Share2 size={18} />} <span className="hidden md:inline">分享行程</span>
          </button>
        </div>

        {/* Title Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90 text-sm tracking-widest uppercase font-medium">
            <span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm border border-white/10">{tripData.dates.split('-')[0]}</span>
            <span className="hidden md:inline">| {tripData.subtitle}</span>
          </div>
          <h1 className="text-3xl md:text-6xl font-bold leading-tight drop-shadow-sm mb-4">{tripData.title}</h1>
          
          {/* Participants */}
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {participants.map(p => (
                <img key={p.id} src={p.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/20" alt={p.name} title={p.name} />
              ))}
            </div>
            <button 
              onClick={() => setIsAddPersonOpen(true)}
              className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/10 text-white"
            >
              <UserPlus size={16} />
            </button>
          </div>
        </div>
      </div>

      {showShareModal && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm shadow-xl z-50 animate-in fade-in zoom-in duration-300 flex items-center gap-2">
          <CheckCircle2 size={16} className="text-green-400"/> 已複製連結！
        </div>
      )}

      {/* 2. Content Container */}
      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden min-h-[60vh]">
          
          {/* Desktop Tabs */}
          <div className="hidden md:flex border-b border-stone-100 sticky top-0 bg-white z-30">
            <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'schedule' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Calendar size={20}/> 行程規劃</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'expenses' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Wallet size={20}/> 預算記帳</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'checklist' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><CheckSquare size={20}/> 行前清單</button>
          </div>

          {/* Mobile Tabs */}
          <div className="md:hidden flex p-2 bg-stone-100/50 rounded-t-3xl border-b border-stone-200">
             <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>行程</button>
             <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>記帳</button>
             <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'checklist' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>清單</button>
          </div>

          {/* TAB: 行程 Schedule */}
          {activeTab === 'schedule' && (
            <div className="pb-12">
              {/* Day Selector */}
              <div className="sticky top-0 md:top-[74px] z-20 bg-white/95 backdrop-blur-md border-b border-stone-100 pt-4 pb-2 px-4 md:px-8">
                <div className="flex justify-between items-end mb-3">
                  <div>
                    <h2 className="text-2xl font-bold text-stone-800">Day {currentDayData.day}</h2>
                    <p className="text-stone-400 text-sm">{currentDayData.date}</p>
                  </div>
                  <div className="px-3 py-1 bg-stone-50 rounded-full border border-stone-100 flex items-center gap-1.5 text-xs font-medium text-stone-600">
                    {currentDayData.weather === 'snow' ? <span className="text-blue-400">❄️ 下雪</span> : <><Sun size={14} className="text-amber-400"/> 晴朗</>}
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
                  {TRIP_DATA.days.map((d) => (
                    <button key={d.day} onClick={() => setActiveDay(d.day)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeDay === d.day ? "bg-stone-900 text-white shadow-md scale-105" : "bg-stone-100 text-stone-400 hover:bg-stone-200"}`}>Day {d.day}</button>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="px-4 md:px-8 py-8">
                <div className="relative border-l-2 border-stone-200 ml-3 md:ml-4 space-y-10 pl-8 md:pl-10 py-2">
                  {currentDayData.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="relative group">
                        <div className={`absolute -left-[41px] md:-left-[49px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${item.type === 'transport' ? 'bg-blue-500 text-white' : item.type === 'food' ? 'bg-orange-500 text-white' : item.type === 'sightseeing' ? 'bg-emerald-500 text-white' : item.type === 'info' ? 'bg-red-500 text-white' : 'bg-stone-400 text-white'}`}>
                          <Icon size={14} strokeWidth={3} />
                        </div>
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'transport' ? 'bg-blue-500' : item.type === 'food' ? 'bg-orange-500' : item.type === 'sightseeing' ? 'bg-emerald-500' : item.type === 'info' ? 'bg-red-500' : 'bg-stone-400'}`}></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded"><Clock size={12}/> {item.time}</span>
                            <Tag type={item.type} />
                          </div>
                          <div className="pl-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => item.location ? handleNavigation(item.location, item.title) : null}>
                            <h3 className="text-lg font-bold text-stone-800 mb-1 flex items-center gap-2">
                              {item.title}
                              {item.location && <Navigation size={14} className="text-blue-500" />}
                            </h3>
                            <p className="text-sm text-stone-600 mb-3 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0 text-stone-400"/> {item.note}</p>
                            {item.desc && <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl leading-relaxed mb-4 whitespace-pre-line">{item.desc}</div>}
                          </div>
                            
                            <div className="flex gap-2">
                              {item.location && (
                                <button onClick={() => copyAddress(item.location, item.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>
                                  {copiedId === item.id ? <CheckCircle2 size={14}/> : <Copy size={14}/>} 複製地址
                                </button>
                              )}
                              {item.link && (
                                <a href={item.link} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-stone-900 text-white hover:bg-stone-700 transition-colors">
                                  <ExternalLink size={14}/> 查看詳情
                                </a>
                              )}
                            </div>
                          
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative pl-2">
                    <div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-4 h-4 bg-stone-300 rounded-full border-2 border-white"></div>
                    <p className="text-xs text-stone-400 italic">行程結束，晚安！</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: 記帳 Expenses */}
          {activeTab === 'expenses' && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <Wallet size={160} className="absolute -right-8 -bottom-8 text-white/5" />
                <p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-1">Total Budget</p>
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-4xl font-bold">${totalSpent.toLocaleString()}</span>
                  <span className="text-stone-500 text-lg">/ {budget.toLocaleString()}</span>
                  <button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Edit3 size={14}/></button>
                </div>
                
                {isEditingBudget && (
                  <div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2">
                    <input type="number" value={newBudgetInput} onChange={(e) => setNewBudgetInput(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none w-32" />
                    <button onClick={() => { setBudget(parseInt(newBudgetInput)); setIsEditingBudget(false); }} className="bg-green-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600">儲存</button>
                  </div>
                )}

                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2">
                  <div className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${budgetPercentage}%` }}></div>
                </div>
                <div className="flex justify-between text-xs text-stone-400">
                  <span>已使用 {Math.round(budgetPercentage)}%</span>
                  <span>剩餘 ${ (budget - totalSpent).toLocaleString() }</span>
                </div>
              </div>

              {/* Add Button */}
              <button onClick={() => setIsAddExpenseOpen(true)} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 border border-stone-200 border-dashed">
                <PlusCircle size={20}/> 新增一筆消費
              </button>

              {/* Settlement Section */}
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><ArrowRightLeft size={18} /> 智慧結算</h3>
                {debts.length === 0 ? <p className="text-stone-400 text-sm text-center py-4">目前沒有款項需結算</p> : (
                  <div className="space-y-3">
                    {debts.map((debt, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-3 bg-stone-50 rounded-xl">
                        <div className="flex items-center gap-2"><img src={debt.from.avatar} className="w-6 h-6 rounded-full" alt={debt.from.name} /><span className="font-bold text-stone-700">{debt.from.name}</span></div>
                        <span className="text-xs text-stone-400">給</span>
                        <div className="flex items-center gap-2"><img src={debt.to.avatar} className="w-6 h-6 rounded-full" alt={debt.to.name} /><span className="font-bold text-stone-700">{debt.to.name}</span></div>
                        <span className="font-bold text-stone-800">${debt.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* History */}
              <div className="space-y-4">
                <h3 className="font-bold text-stone-800 text-lg">消費紀錄</h3>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-4 bg-white border border-stone-100 rounded-2xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-500"><Wallet size={18}/></div>
                      <div>
                        <p className="font-bold text-stone-800">{exp.title}</p>
                        <p className="text-xs text-stone-400">{exp.date} • {participants.find(p => p.id === exp.payerId)?.name} 付款</p>
                      </div>
                    </div>
                    <span className="font-bold text-stone-900">${exp.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: 行前清單 Checklist */}
          {activeTab === 'checklist' && (
             <div className="p-6 md:p-10 space-y-8 min-h-[60vh]">
               <div className="flex justify-between items-end mb-4">
                 <div>
                   <h2 className="text-2xl font-bold text-stone-800">行李清單</h2>
                   <p className="text-stone-400 text-sm mt-1">Checklist before you go</p>
                 </div>
               </div>

               {packingList.map((category, catIdx) => (
                 <div key={catIdx} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                   <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2">
                     <div className="w-2 h-2 bg-stone-400 rounded-full"></div> {category.category}
                   </h3>
                   <div className="space-y-3">
                     {category.items.map((item) => (
                       <div key={item.id} className="flex items-center gap-3 group cursor-pointer" onClick={() => togglePackingItem(category.category, item.id)}>
                         <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-stone-800 border-stone-800' : 'border-stone-300 bg-white'}`}>
                           {item.checked && <CheckCircle2 size={14} className="text-white" />}
                         </div>
                         <span className={`text-sm transition-all ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{item.name}</span>
                       </div>
                     ))}
                     {/* Add Item Input (Simple) */}
                     <div className="flex gap-2 mt-4 pt-2 border-t border-stone-200/50">
                        <input 
                          type="text" 
                          placeholder="新增項目..." 
                          className="flex-1 bg-transparent text-sm focus:outline-none"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          onKeyDown={(e) => {
                            if(e.key === 'Enter') handleAddPackingItem(catIdx);
                          }}
                        />
                        <button onClick={() => handleAddPackingItem(catIdx)} className="text-stone-400 hover:text-stone-800"><PlusCircle size={16}/></button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}

        </div>
      </div>

      {/* Mobile Bottom Nav (Fixed) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 pb-safe z-50 flex justify-around shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <button onClick={() => setActiveTab('schedule')} className={`flex flex-col items-center transition-colors ${activeTab === 'schedule' ? 'text-stone-900' : 'text-stone-400'}`}><Calendar size={24}/><span className="text-[10px] mt-1 font-medium">行程</span></button>
        <button onClick={() => { if(activeTab === 'expenses') setIsAddExpenseOpen(true); else setActiveTab('expenses'); }} className={`flex flex-col items-center transition-colors ${activeTab === 'expenses' ? 'text-stone-900' : 'text-stone-400'}`}>
          {activeTab === 'expenses' ? <PlusCircle size={24}/> : <Wallet size={24}/>}
          <span className="text-[10px] mt-1 font-medium">{activeTab === 'expenses' ? '新增' : '記帳'}</span>
        </button>
        <button onClick={() => setActiveTab('checklist')} className={`flex flex-col items-center transition-colors ${activeTab === 'checklist' ? 'text-stone-900' : 'text-stone-400'}`}><CheckSquare size={24}/><span className="text-[10px] mt-1 font-medium">清單</span></button>
      </div>

      {/* Add Expense Modal */}
      {isAddExpenseOpen && (
        <div className="fixed inset-0 z-[70] bg-stone-900/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 pb-8 shadow-2xl animate-in slide-in-from-bottom-20 relative">
            <button onClick={() => setIsAddExpenseOpen(false)} className="absolute top-4 right-4 p-2 bg-stone-100 rounded-full text-stone-500"><X size={20}/></button>
            <h3 className="text-xl font-bold mb-6">新增消費</h3>
            <div className="space-y-4">
              <input type="text" placeholder="項目名稱 (如: 晚餐)" className="w-full p-4 bg-stone-50 rounded-xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900" value={newExpense.title} onChange={e => setNewExpense({...newExpense, title: e.target.value})} autoFocus />
              <div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span><input type="number" placeholder="0" className="w-full p-4 pl-8 bg-stone-50 rounded-xl border border-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-900 font-bold text-lg" value={newExpense.amount} onChange={e => setNewExpense({...newExpense, amount: e.target.value})} /></div>
              <div>
                <p className="text-xs text-stone-400 mb-2 font-bold uppercase">誰付款?</p>
                <div className="flex gap-2 overflow-x-auto pb-2">{participants.map(p => (<button key={p.id} onClick={() => setNewExpense({...newExpense, payerId: p.id})} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${newExpense.payerId === p.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200'}`}><img src={p.avatar} className="w-5 h-5 rounded-full" alt=""/> <span className="text-xs font-bold">{p.name}</span></button>))}</div>
              </div>
              <button onClick={handleAddExpense} className="w-full py-4 bg-stone-900 text-white rounded-xl font-bold text-lg hover:bg-stone-800 transition-colors shadow-lg">確認新增</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Person Modal */}
      {isAddPersonOpen && (
        <div className="fixed inset-0 z-[80] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
             <button onClick={() => setIsAddPersonOpen(false)} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600"><X size={20}/></button>
             
             {/* List of current participants for management */}
             <div className="mb-6 text-left">
                <h4 className="text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">目前成員</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3">
                        <img src={p.avatar} className="w-8 h-8 rounded-full" alt={p.name} />
                        <span className="font-medium text-stone-700">{p.name}</span>
                      </div>
                      {/* Prevent removing the last person or specific logic can be added */}
                      <button 
                        onClick={() => handleRemovePerson(p.id)}
                        className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="移除"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
             </div>

             <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-400"><UserPlus size={32}/></div>
             <h3 className="text-lg font-bold mb-4">新增旅伴</h3>
             <input type="text" placeholder="輸入名字..." className="w-full p-3 bg-stone-50 border border-stone-100 rounded-xl mb-4 text-center focus:outline-none focus:ring-2 focus:ring-stone-900" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} />
             <button onClick={handleAddPerson} className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold">加入行程</button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 3. 主程式入口 (App) ---

export default function App() {
  const [isLocked, setIsLocked] = useState(!!TRIP_DATA.password);

  // 如果沒有設定密碼，直接進入 Dashboard
  if (!isLocked) {
    return <TripDashboard tripData={TRIP_DATA} onBack={() => {}} />;
  }

  // 否則顯示鎖定畫面
  return (
    <div className="font-sans text-stone-700 antialiased selection:bg-stone-200">
      <TripLoginModal 
        trip={TRIP_DATA} 
        onUnlock={() => setIsLocked(false)} 
        onClose={() => {}} // 單一行程模式下關閉按鈕無作用
      />
    </div>
  );
}