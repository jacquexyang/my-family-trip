import React, { useState, useEffect, useMemo } from 'react';
import { 
  ChevronLeft, LayoutGrid, Languages, MessageCircle, Map, Calculator, Train, CheckCircle2, Share2, UserPlus, 
  Calendar, Sun, Wallet, Edit3, PlusCircle, CheckSquare, Trash2, ArrowRightLeft, Clock, Navigation, Sparkles,
  MapPin, Copy, ExternalLink // Added missing imports
} from 'lucide-react';
import { 
  collection, doc, addDoc, updateDoc, deleteDoc, onSnapshot, query, orderBy, writeBatch, serverTimestamp 
} from "firebase/firestore";
import { signInAnonymously } from "firebase/auth";

// Imports
import { db, auth } from '../config/firebase';
import { ALL_TRIPS_CONFIG, DEFAULT_PACKING_LIST } from '../config/tripsData';
import { calculateDebts } from '../utils/helpers';
import Tag from './Tag';
import ItemDetailModal from './ItemDetailModal';

const TripDashboard = ({ tripId, tripInfo, onBack }) => {
  const [activeTab, setActiveTab] = useState('schedule'); 
  const [activeDay, setActiveDay] = useState(1);
  const [copiedId, setCopiedId] = useState(null);
  
  // Data
  const tripData = ALL_TRIPS_CONFIG[tripId] ? ALL_TRIPS_CONFIG[tripId].data : null;

  // State
  const [participants, setParticipants] = useState([]);
  const [packingList, setPackingList] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [budget, setBudget] = useState(tripData?.budget || 50000);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isToolsOpen, setIsToolsOpen] = useState(false);

  // UI State
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [newBudgetInput, setNewBudgetInput] = useState(budget);
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [newExpense, setNewExpense] = useState({ title: '', amount: '', payerId: 1, beneficiaryIds: [], splitWeights: {} });
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAddPersonOpen, setIsAddPersonOpen] = useState(false);
  const [newPersonName, setNewPersonName] = useState('');
  const [newItemName, setNewItemName] = useState('');

  const currentDayData = tripData?.days?.find(d => d.day === activeDay) || tripData?.days?.[0] || { items: [] };

  // --- Firebase Listeners ---
  useEffect(() => {
     if (!tripId || !tripData) return;

     // 1. Packing List
     const packingRef = collection(db, 'artifacts', tripId, 'public', 'data', 'packing-list');
     const unsubPacking = onSnapshot(query(packingRef, orderBy('createdAt')), (snapshot) => {
         if (snapshot.empty) {
            if (tripId === 'seoul_2025' && DEFAULT_PACKING_LIST) {
                const batch = writeBatch(db);
                DEFAULT_PACKING_LIST.forEach(item => {
                   const docRef = doc(packingRef);
                   batch.set(docRef, { ...item, checked: false, createdAt: serverTimestamp() });
                });
                batch.commit().catch(console.error);
            }
         } else {
             const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
             const grouped = Object.values(items.reduce((acc, item) => {
                 if (!acc[item.category]) acc[item.category] = { category: item.category, items: [] };
                 acc[item.category].items.push(item);
                 return acc;
             }, {}));
             setPackingList(grouped);
         }
     });

     // 2. Expenses
     const expRef = collection(db, 'artifacts', tripId, 'public', 'data', 'expenses');
     const unsubExp = onSnapshot(query(expRef, orderBy('createdAt', 'desc')), (snapshot) => {
         setExpenses(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
     });

     // 3. Participants
     const partRef = collection(db, 'artifacts', tripId, 'public', 'data', 'participants');
     const unsubPart = onSnapshot(query(partRef, orderBy('id')), (snapshot) => {
        if (!snapshot.empty) {
           setParticipants(snapshot.docs.map(doc => ({ ...doc.data(), docId: doc.id })));
        } else {
           if (tripData.defaultParticipants) {
               const batch = writeBatch(db);
               tripData.defaultParticipants.forEach((p, index) => {
                   const docRef = doc(partRef);
                   batch.set(docRef, { ...p, id: index + 1, createdAt: serverTimestamp() });
               });
               batch.commit().catch(console.error);
           }
        }
     });

     // Init auth
     signInAnonymously(auth).catch(console.error);

     return () => { unsubPacking(); unsubExp(); unsubPart(); };
  }, [tripId, tripData]);

  // Handlers
  const handleAddExpense = async () => {
    if (!newExpense.title || !newExpense.amount) return;
    const finalBeneficiaries = newExpense.beneficiaryIds.length > 0 ? newExpense.beneficiaryIds : participants.map(p => p.id);
    await addDoc(collection(db, 'artifacts', tripId, 'public', 'data', 'expenses'), {
      title: newExpense.title,
      amount: parseInt(newExpense.amount),
      payerId: parseInt(newExpense.payerId),
      beneficiaryIds: finalBeneficiaries,
      splitWeights: newExpense.splitWeights,
      date: currentDayData.date?.split(' ')[0] || 'Today',
      createdAt: serverTimestamp()
    });
    setNewExpense({ title: '', amount: '', payerId: 1, beneficiaryIds: [], splitWeights: {} });
    setIsAddExpenseOpen(false);
  };

  const handleDeleteExpense = async (id) => {
    await deleteDoc(doc(db, 'artifacts', tripId, 'public', 'data', 'expenses', id));
  };

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return;
    const newId = participants.length > 0 ? Math.max(...participants.map(p => p.id)) + 1 : 1;
    await addDoc(collection(db, 'artifacts', tripId, 'public', 'data', 'participants'), {
      id: newId,
      name: newPersonName,
      avatar: `https://i.pravatar.cc/150?u=${newId + 10}`,
      createdAt: serverTimestamp()
    });
    setNewPersonName('');
    setIsAddPersonOpen(false);
  };

  const handleRemovePerson = async (docId) => {
    if (docId) await deleteDoc(doc(db, 'artifacts', tripId, 'public', 'data', 'participants', docId));
  };
  
  const togglePackingItem = async (cat, itemId) => {
     // Check local state for checked status
     let currentChecked = false;
     for(const c of packingList) {
        const found = c.items.find(i => i.id === itemId);
        if(found) { currentChecked = found.checked; break; }
     }
     const itemRef = doc(db, 'artifacts', tripId, 'public', 'data', 'packing-list', itemId);
     await updateDoc(itemRef, { checked: !currentChecked });
  };
  
  const handleDeletePackingItem = async (itemId) => {
    const itemRef = doc(db, 'artifacts', tripId, 'public', 'data', 'packing-list', itemId);
    await deleteDoc(itemRef);
  };

  const handleAddPackingItem = async (categoryName) => {
    if (!newItemName.trim()) return;
    await addDoc(collection(db, 'artifacts', tripId, 'public', 'data', 'packing-list'), {
       category: categoryName,
       name: newItemName,
       checked: false,
       createdAt: serverTimestamp()
    });
    setNewItemName('');
  };
  
  const handleShare = () => {
    const url = window.location.href;
    const text = `✈️ ${tripInfo.title}\n📅 ${tripInfo.dates}\n密碼: ${tripInfo.defaultPassword}\n連結: ${url}`;
    navigator.clipboard.writeText(text);
    setShowShareModal(true);
    setTimeout(() => setShowShareModal(false), 3000);
  };

  const copyAddress = (text, id) => { navigator.clipboard.writeText(text); setCopiedId(id); setTimeout(() => setCopiedId(null), 2000); };
  const handleNavigation = (location, title) => { const query = location || title; const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; window.open(url, '_blank'); };
  const handleItemClick = (item) => setSelectedItem(item);
  const handleUpdateBudget = () => { setBudget(parseInt(newBudgetInput)); setIsEditingBudget(false); };
  const toggleBeneficiary = (id) => { setNewExpense(prev => { const current = prev.beneficiaryIds; return current.includes(id) ? { ...prev, beneficiaryIds: current.filter(i => i !== id) } : { ...prev, beneficiaryIds: [...current, id] }; }); };
  const handleWeightChange = (id, val) => { setNewExpense(prev => ({ ...prev, splitWeights: { ...prev.splitWeights, [id]: val } })); };

  const debts = useMemo(() => calculateDebts(expenses, participants), [expenses, participants]);
  const totalSpent = expenses.reduce((sum, item) => sum + item.amount, 0);
  const budgetPercentage = Math.min((totalSpent / budget) * 100, 100);

  const isEqualSplit = (exp) => { 
    const b = exp.beneficiaryIds || []; 
    if (b.length === 0) return true; 
    const w = exp.splitWeights || {}; 
    const f = parseFloat(w[b[0]]) || 1; 
    return b.every(id => (parseFloat(w[id]) || 1) === f); 
  };
  
  const getRatioString = (exp) => { 
    const b = exp.beneficiaryIds || []; 
    const w = exp.splitWeights || {}; 
    return b.map(id => parseFloat(w[id]) || 1).join(':'); 
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] pb-24 md:pb-0">
      {/* Hero Header */}
      <div className="relative w-full h-[40vh] md:h-[50vh]">
        <img src={tripInfo.coverImage} alt={tripInfo.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 via-stone-900/20 to-stone-900/40"></div>
        <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex justify-between items-center z-10 max-w-7xl mx-auto w-full">
           <div className="relative">
             <button onClick={() => setIsToolsOpen(!isToolsOpen)} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium"><LayoutGrid size={18} /> <span className="hidden md:inline">工具</span></button>
             {isToolsOpen && (
               <div className="absolute top-12 left-0 w-48 bg-white rounded-2xl shadow-xl border border-stone-100 p-2 animate-in fade-in zoom-in duration-200 origin-top-left z-50">
                 <button onClick={() => window.open('https://translate.google.com/?sl=auto&tl=ko', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-blue-50 text-blue-500 rounded-lg"><Languages size={16}/></div> Google 翻譯</button>
                 <button onClick={() => window.open('https://papago.naver.com/', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-green-50 text-green-500 rounded-lg"><MessageCircle size={16}/></div> Papago 翻譯</button>
                 <button onClick={() => window.open('https://map.naver.com/v5/', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-green-50 text-green-600 rounded-lg"><Map size={16}/></div> Naver 地圖</button>
                 <button onClick={() => window.open('https://www.google.com/search?q=TWD+to+KRW', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-yellow-50 text-yellow-600 rounded-lg"><Calculator size={16}/></div> 匯率試算</button>
                 <button onClick={() => window.open('https://www.seoulmetro.co.kr/en/cyberStation.do', '_blank')} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-stone-50 text-left text-sm text-stone-700 transition-colors"><div className="p-1.5 bg-orange-50 text-orange-500 rounded-lg"><Train size={16}/></div> 地鐵圖</button>
               </div>
             )}
           </div>
          <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all border border-white/10 text-sm font-medium">{copiedId === 'share-btn' ? <CheckCircle2 size={18} className="text-green-400"/> : <Share2 size={18} />} <span className="hidden md:inline">分享行程</span></button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full text-white">
          <div className="flex items-center gap-2 mb-2 opacity-90 text-sm tracking-widest uppercase font-medium"><span className="bg-white/20 px-2 py-0.5 rounded text-xs backdrop-blur-sm border border-white/10">{tripInfo.dates.split('-')[0]}</span><span className="hidden md:inline">| {tripInfo.subtitle}</span></div>
          <h1 className="text-3xl md:text-6xl font-bold leading-tight drop-shadow-sm mb-4">{tripInfo.title}</h1>
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">{participants.map(p => (<img key={p.id} src={p.avatar} className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-white/20" alt={p.name} title={p.name} />))}</div>
            <button onClick={() => setIsAddPersonOpen(true)} className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-colors border border-white/10 text-white"><UserPlus size={16} /></button>
          </div>
        </div>
      </div>

      {showShareModal && <div className="fixed top-24 left-1/2 transform -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full text-sm shadow-xl z-50 animate-in fade-in zoom-in duration-300 flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400"/> 已複製連結！</div>}

      <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-stone-100 overflow-hidden min-h-[60vh]">
          {/* Tabs */}
          <div className="hidden md:flex border-b border-stone-100 sticky top-0 bg-white z-30">
            <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'schedule' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Calendar size={20}/> 行程規劃</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'expenses' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><Wallet size={20}/> 預算記帳</button>
            <div className="w-px bg-stone-100 my-4"></div>
            <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-5 font-bold text-lg flex justify-center items-center gap-2 transition-colors ${activeTab === 'checklist' ? 'text-stone-900 border-b-2 border-stone-900' : 'text-stone-400 hover:text-stone-600'}`}><CheckSquare size={20}/> 行前清單</button>
          </div>
          <div className="md:hidden flex p-2 bg-stone-100/50 rounded-t-3xl border-b border-stone-200">
             <button onClick={() => setActiveTab('schedule')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'schedule' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>行程</button>
             <button onClick={() => setActiveTab('expenses')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'expenses' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>記帳</button>
             <button onClick={() => setActiveTab('checklist')} className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === 'checklist' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-400'}`}>清單</button>
          </div>

          {/* Schedule */}
          {activeTab === 'schedule' && (
            <div className="pb-12">
              <div className="sticky top-0 md:top-[74px] z-20 bg-white/95 backdrop-blur-md border-b border-stone-100 pt-4 pb-2 px-4 md:px-8">
                <div className="flex justify-between items-end mb-3">
                  <div><h2 className="text-2xl font-bold text-stone-800">Day {currentDayData.day}</h2><p className="text-stone-400 text-sm">{currentDayData.date}</p></div>
                  <div className="px-3 py-1 bg-stone-50 rounded-full border border-stone-100 flex items-center gap-1.5 text-xs font-medium text-stone-600">{currentDayData.weather === 'snow' ? <span className="text-blue-400">❄️ 下雪</span> : <><Sun size={14} className="text-amber-400"/> 晴朗</>}</div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">{tripData.days.map((d) => (<button key={d.day} onClick={() => setActiveDay(d.day)} className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${activeDay === d.day ? "bg-stone-900 text-white shadow-md scale-105" : "bg-stone-100 text-stone-400 hover:bg-stone-200"}`}>Day {d.day}</button>))}</div>
              </div>
              <div className="px-4 md:px-8 py-8">
                <div className="relative border-l-2 border-stone-200 ml-3 md:ml-4 space-y-10 pl-8 md:pl-10 py-2">
                  {currentDayData.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.id} className="relative group">
                        <div className={`absolute -left-[41px] md:-left-[49px] top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 ${item.type === 'transport' ? 'bg-blue-500 text-white' : item.type === 'food' ? 'bg-orange-500 text-white' : item.type === 'sightseeing' ? 'bg-emerald-500 text-white' : item.type === 'info' ? 'bg-red-500 text-white' : 'bg-stone-400 text-white'}`}><Icon size={14} strokeWidth={3} /></div>
                        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md transition-shadow p-5 relative overflow-hidden">
                          <div className={`absolute left-0 top-0 bottom-0 w-1 ${item.type === 'transport' ? 'bg-blue-500' : item.type === 'food' ? 'bg-orange-500' : item.type === 'sightseeing' ? 'bg-emerald-500' : item.type === 'info' ? 'bg-red-500' : 'bg-stone-400'}`}></div>
                          <div className="flex justify-between items-start mb-2 pl-2">
                            <span className="text-xs font-bold text-stone-400 flex items-center gap-1 bg-stone-50 px-2 py-1 rounded"><Clock size={12}/> {item.time}</span>
                            <Tag type={item.type} />
                          </div>
                          <div className="pl-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => handleItemClick(item)}>
                            <h3 className="text-lg font-bold text-stone-800 mb-1 flex items-center gap-2">{item.title}{item.location && item.type !== 'food' && <Navigation size={14} className="text-blue-500" />}{item.type === 'food' && <Sparkles size={14} className="text-orange-500" />}</h3>
                            <p className="text-sm text-stone-600 mb-3 flex items-start gap-1.5"><MapPin size={14} className="mt-0.5 shrink-0 text-stone-400"/> {item.note}</p>
                            {item.desc && <div className="text-xs text-stone-500 bg-stone-50 p-3 rounded-xl leading-relaxed mb-4 whitespace-pre-line">{item.desc}</div>}
                          </div>
                          <div className="flex gap-2">
                            {item.location && (<button onClick={() => copyAddress(item.location, item.id)} className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${copiedId === item.id ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}>{copiedId === item.id ? <CheckCircle2 size={14}/> : <Copy size={14}/>} 複製地址</button>)}
                            {item.link && (<a href={item.link} target="_blank" rel="noreferrer" className="flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 bg-stone-900 text-white hover:bg-stone-700 transition-colors"><ExternalLink size={14}/> 查看詳情</a>)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div className="relative pl-2"><div className="absolute -left-[35px] md:-left-[43px] top-1.5 w-4 h-4 bg-stone-300 rounded-full border-2 border-white"></div><p className="text-xs text-stone-400 italic">行程結束，晚安！</p></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Expenses */}
          {activeTab === 'expenses' && (
            <div className="p-6 md:p-10 space-y-8">
              <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <Wallet size={160} className="absolute -right-8 -bottom-8 text-white/5" /><p className="text-xs font-bold text-stone-400 tracking-widest uppercase mb-1">Total Budget</p>
                <div className="flex items-center gap-2 mb-6"><span className="text-4xl font-bold">${totalSpent.toLocaleString()}</span><span className="text-stone-500 text-lg">/ {budget.toLocaleString()}</span><button onClick={() => setIsEditingBudget(!isEditingBudget)} className="p-1.5 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Edit3 size={14}/></button></div>
                {isEditingBudget && (<div className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2"><input type="number" value={newBudgetInput} onChange={(e) => setNewBudgetInput(e.target.value)} className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm text-white focus:outline-none w-32" /><button onClick={() => { setBudget(parseInt(newBudgetInput)); setIsEditingBudget(false); }} className="bg-green-500 px-3 py-1 rounded-lg text-xs font-bold hover:bg-green-600">儲存</button></div>)}
                <div className="relative w-full h-3 bg-white/10 rounded-full overflow-hidden mb-2"><div className={`absolute left-0 top-0 bottom-0 transition-all duration-1000 ${budgetPercentage > 90 ? 'bg-red-500' : 'bg-emerald-400'}`} style={{ width: `${budgetPercentage}%` }}></div></div>
                <div className="flex justify-between text-xs text-stone-400"><span>已使用 {Math.round(budgetPercentage)}%</span><span>剩餘 ${ (budget - totalSpent).toLocaleString() }</span></div>
              </div>
              <button onClick={() => setIsAddExpenseOpen(true)} className="w-full py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-colors flex items-center justify-center gap-2 border border-stone-200 border-dashed"><PlusCircle size={20}/> 新增一筆消費</button>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-stone-100">
                <h3 className="font-bold text-stone-800 mb-4 flex items-center gap-2"><ArrowRightLeft size={18} /> 智慧結算</h3>
                {debts.length === 0 ? <p className="text-stone-400 text-sm text-center py-4">目前沒有款項需結算</p> : (<div className="space-y-3">{debts.map((debt, idx) => (<div key={idx} className="flex items-center justify-between text-sm p-3 bg-stone-50 rounded-xl"><div className="flex items-center gap-2"><img src={debt.from.avatar} className="w-6 h-6 rounded-full" alt={debt.from.name} /><span className="font-bold text-stone-700">{debt.from.name}</span></div><span className="text-xs text-stone-400">給</span><div className="flex items-center gap-2"><img src={debt.to.avatar} className="w-6 h-6 rounded-full" alt={debt.to.name} /><span className="font-bold text-stone-700">{debt.to.name}</span></div><span className="font-bold text-stone-800">${debt.amount.toLocaleString()}</span></div>))}</div>)}
              </div>
              <div className="space-y-4">
                <h3 className="font-bold text-stone-800 text-lg">消費紀錄</h3>
                {expenses.map((exp) => (
                  <div key={exp.id} className="flex justify-between items-center p-4 bg-white border border-stone-100 rounded-2xl hover:shadow-sm transition-shadow">
                    <div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-500"><Wallet size={18}/></div><div><p className="font-bold text-stone-800">{exp.title}</p><div className="flex items-center gap-1 text-xs text-stone-400"><span>{exp.date}</span><span className="text-stone-300 mx-1">•</span><span>{participants.find(p => p.id === exp.payerId)?.name} 付款</span><span className="text-stone-300 mx-1">•</span><span>{exp.beneficiaryIds && exp.beneficiaryIds.length === participants.length ? (isEqualSplit(exp) ? "全員分攤" : `全員分攤 (比例 ${getRatioString(exp)})`) : `由 ${exp.beneficiaryIds ? exp.beneficiaryIds.length : participants.length} 人分攤 ${!isEqualSplit(exp) ? `(比例 ${getRatioString(exp)})` : ''}`}</span></div></div></div>
                    <div className="flex items-center gap-3"><span className="font-bold text-stone-900">${exp.amount.toLocaleString()}</span><button onClick={() => handleDeleteExpense(exp.id)} className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={18} /></button></div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Checklist */}
          {activeTab === 'checklist' && (
             <div className="p-6 md:p-10 space-y-8 min-h-[60vh]">
               <div className="flex justify-between items-end mb-4"><div><h2 className="text-2xl font-bold text-stone-800">行李清單</h2><p className="text-stone-400 text-sm mt-1">Checklist before you go</p></div></div>
               {packingList.map((category, catIdx) => (
                 <div key={catIdx} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                   <h3 className="font-bold text-stone-700 mb-4 flex items-center gap-2"><div className="w-2 h-2 bg-stone-400 rounded-full"></div> {category.category}</h3>
                   <div className="space-y-3">
                     {category.items.map((item) => (
                       <div key={item.id} className="flex items-center justify-between group">
                         <div className="flex items-center gap-3 cursor-pointer" onClick={() => togglePackingItem(category.category, item.id)}>
                           <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${item.checked ? 'bg-stone-800 border-stone-800' : 'border-stone-300 bg-white'}`}>{item.checked && <CheckCircle2 size={14} className="text-white" />}</div>
                           <span className={`text-sm transition-all ${item.checked ? 'text-stone-400 line-through' : 'text-stone-700'}`}>{item.name}</span>
                         </div>
                         <button onClick={async () => {
                           // Find doc id and delete
                           const itemRef = doc(db, 'artifacts', tripId, 'public', 'data', 'packing-list', item.id);
                           await deleteDoc(itemRef);
                         }} className="text-stone-300 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14}/></button>
                       </div>
                     ))}
                     <div className="flex gap-2 mt-4 pt-2 border-t border-stone-200/50">
                        <input type="text" placeholder="新增項目..." className="flex-1 bg-transparent text-sm focus:outline-none" value={newItemName} onChange={(e) => setNewItemName(e.target.value)} onKeyDown={(e) => { if(e.key === 'Enter') handleAddPackingItem(category.category); }} />
                        <button onClick={() => handleAddPackingItem(category.category)} className="text-stone-400 hover:text-stone-800"><PlusCircle size={16}/></button>
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          )}
        </div>
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
              
              {/* 付款人選擇 */}
              <div>
                <p className="text-xs text-stone-400 mb-2 font-bold uppercase">誰先付錢?</p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">{participants.map(p => (<button key={p.id} onClick={() => setNewExpense({...newExpense, payerId: p.id})} className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${newExpense.payerId === p.id ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-500 border-stone-200'}`}><img src={p.avatar} className="w-5 h-5 rounded-full" alt=""/> <span className="text-xs font-bold">{p.name}</span></button>))}</div>
              </div>

              {/* 分攤對象選擇 */}
              <div>
                <p className="text-xs text-stone-400 mb-2 font-bold uppercase">分攤給誰?</p>
                <div className="flex flex-col gap-2">
                    {participants.map(p => {
                        const isSelected = newExpense.beneficiaryIds.includes(p.id);
                        return (
                            <div key={p.id} className="flex items-center justify-between p-2 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors">
                                <button onClick={() => toggleBeneficiary(p.id)} className={`flex items-center gap-3 flex-1 ${isSelected ? 'opacity-100' : 'opacity-50'}`}><img src={p.avatar} className="w-8 h-8 rounded-full" alt=""/> <span className="text-sm font-bold">{p.name}</span></button>
                                {isSelected && (<div className="flex items-center gap-2"><span className="text-xs text-stone-400 font-bold">權重</span><input type="number" className="w-12 p-1 text-center bg-white border border-stone-200 rounded-lg text-sm font-bold focus:outline-none focus:ring-1 focus:ring-stone-900" value={newExpense.splitWeights?.[p.id] || 1} onChange={(e) => handleWeightChange(p.id, e.target.value)} step="0.5" min="0" /></div>)}
                            </div>
                        );
                    })}
                </div>
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
             <div className="mb-6 text-left">
                <h4 className="text-sm font-bold text-stone-500 mb-3 uppercase tracking-wider">目前成員</h4>
                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {participants.map(p => (
                    <div key={p.id} className="flex justify-between items-center p-2 bg-stone-50 rounded-xl">
                      <div className="flex items-center gap-3"><img src={p.avatar} className="w-8 h-8 rounded-full" alt={p.name} /><span className="font-medium text-stone-700">{p.name}</span></div>
                      <button onClick={() => handleRemovePerson(p.docId)} className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors" title="移除"><Trash2 size={16} /></button>
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

      {selectedItem && (
        <ItemDetailModal 
          item={selectedItem} 
          onClose={() => setSelectedItem(null)} 
        />
      )}
    </div>
  );
};

export default TripDashboard;