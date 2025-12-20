import React, { useState, useEffect } from 'react';
import { Calendar, Lock, ArrowRight, Plus, Archive, RefreshCw, MoreVertical, Trash2, CheckCircle2 } from 'lucide-react';
import { collection, onSnapshot, query, orderBy, setDoc, doc, updateDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from '../config/firebase';
import { TRIP_REGISTRY } from '../config/tripsData'; // 用作種子資料

const TripListScreen = ({ onSelectTrip }) => {
  const [trips, setTrips] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTripData, setNewTripData] = useState({ title: '', subtitle: '', dates: '', password: '1234' });

  // 1. 從 Firebase 讀取旅程列表
  useEffect(() => {
    const tripsRef = collection(db, 'artifacts', 'travel-app-master', 'trips');
    const q = query(tripsRef, orderBy('dates', 'desc')); // 按日期排序

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) {
        // 如果是第一次使用 (空的)，把種子資料匯入
        console.log("Initializing Seed Data...");
        const batch = writeBatch(db);
        TRIP_REGISTRY.forEach(trip => {
          const docRef = doc(tripsRef, trip.id);
          batch.set(docRef, { ...trip, status: 'active', createdAt: serverTimestamp() });
        });
        batch.commit();
      } else {
        const loadedTrips = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setTrips(loadedTrips);
      }
    });

    return () => unsubscribe();
  }, []);

  // 2. 新增旅程
  const handleAddTrip = async () => {
    if (!newTripData.title) return;
    const newId = `trip_${Date.now()}`;
    const coverImages = [
      "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop", // Travel
      "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop", // Boat
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2073&auto=format&fit=crop", // Beach
      "https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop", // Mountain
    ];
    const randomCover = coverImages[Math.floor(Math.random() * coverImages.length)];

    await setDoc(doc(db, 'artifacts', 'travel-app-master', 'trips', newId), {
      id: newId,
      title: newTripData.title,
      subtitle: newTripData.subtitle || '新旅程',
      dates: newTripData.dates || '未定日期',
      password: newTripData.password,
      coverImage: randomCover,
      status: 'active',
      defaultPassword: newTripData.password,
      createdAt: serverTimestamp()
    });

    setIsAddModalOpen(false);
    setNewTripData({ title: '', subtitle: '', dates: '', password: '1234' });
  };

  // 3. 切換狀態 (進行中 <-> 已結束)
  const toggleTripStatus = async (e, trip) => {
    e.stopPropagation(); // 避免觸發點擊卡片
    const newStatus = trip.status === 'completed' ? 'active' : 'completed';
    await updateDoc(doc(db, 'artifacts', 'travel-app-master', 'trips', trip.id), {
      status: newStatus
    });
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-8 mt-4 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">我的旅程</h1>
          <p className="text-stone-400 text-sm mt-1">Ready for your next adventure?</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-stone-900 text-white p-3 rounded-full shadow-lg hover:bg-stone-700 hover:scale-105 transition-all"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {trips.map((trip) => {
          const isCompleted = trip.status === 'completed';
          return (
            <div 
              key={trip.id}
              onClick={() => onSelectTrip(trip)}
              className={`bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer hover:shadow-xl transition-all duration-300 group relative h-80 flex flex-col ${isCompleted ? 'grayscale opacity-80' : ''}`}
            >
              {/* 狀態切換按鈕 */}
              <button 
                onClick={(e) => toggleTripStatus(e, trip)}
                className="absolute top-4 right-4 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-md p-2 rounded-full text-white transition-colors"
                title={isCompleted ? "設為進行中" : "封存旅程"}
              >
                {isCompleted ? <RefreshCw size={14} /> : <Archive size={14} />}
              </button>

              <div className="h-48 relative overflow-hidden flex-shrink-0">
                <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                
                {isCompleted && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="border-2 border-white text-white px-4 py-1 rounded-full font-bold tracking-widest uppercase text-sm">已結束</span>
                  </div>
                )}

                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="font-bold text-xl mb-1 shadow-sm leading-tight">{trip.title}</h3>
                  <p className="text-xs opacity-90 font-medium flex items-center gap-1">
                    <Calendar size={12} /> {trip.dates.split(' - ')[0]} 起
                  </p>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center bg-white flex-1">
                <div>
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">TRIP</p>
                  <p className="text-sm text-stone-600 line-clamp-1">{trip.subtitle}</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-800 group-hover:text-white transition-all">
                  <ArrowRight size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 新增旅程 Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-stone-800">新增旅程</h3>
            <div className="space-y-3">
              <input 
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" 
                placeholder="旅程名稱 (如: 東京賞櫻)" 
                value={newTripData.title}
                onChange={e => setNewTripData({...newTripData, title: e.target.value})}
              />
              <input 
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" 
                placeholder="副標題 (如: 購物、美食)" 
                value={newTripData.subtitle}
                onChange={e => setNewTripData({...newTripData, subtitle: e.target.value})}
              />
              <input 
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" 
                placeholder="日期 (如: 2025.04.01)" 
                value={newTripData.dates}
                onChange={e => setNewTripData({...newTripData, dates: e.target.value})}
              />
              <input 
                className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200" 
                placeholder="設定密碼 (預設: 1234)" 
                value={newTripData.password}
                onChange={e => setNewTripData({...newTripData, password: e.target.value})}
              />
            </div>
            <div className="flex gap-2 mt-6">
              <button onClick={() => setIsAddModalOpen(false)} className="flex-1 py-3 text-stone-500 font-bold hover:bg-stone-100 rounded-xl">取消</button>
              <button onClick={handleAddTrip} className="flex-1 py-3 bg-stone-900 text-white font-bold rounded-xl shadow-lg">建立</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TripListScreen;