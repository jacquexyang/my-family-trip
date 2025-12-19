import React, { useState } from 'react';
import { ChevronLeft, Lock, X } from 'lucide-react';
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from '../config/firebase'; // 引用設定檔

const TripLoginScreen = ({ tripInfo, onUnlock, onBack }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const docRef = doc(db, 'artifacts', tripInfo.id, 'public', 'config');
      const docSnap = await getDoc(docRef);
      let validPassword = "";
      if (docSnap.exists()) {
        validPassword = docSnap.data().password;
      } else {
        await setDoc(docRef, { password: tripInfo.defaultPassword });
        validPassword = tripInfo.defaultPassword;
      }
      if (input === validPassword) onUnlock();
      else { setError(true); setTimeout(() => setError(false), 2000); }
    } catch (err) { console.error("Auth Error", err); setError(true); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
      <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl relative text-center border border-stone-100">
        <button onClick={onBack} className="absolute top-6 left-6 p-2 text-stone-400 hover:text-stone-600 transition-colors"><ChevronLeft size={20} /></button>
        <div className="flex justify-center mb-6"><div className="bg-stone-100 p-4 rounded-2xl text-stone-700 shadow-inner"><Lock size={32} /></div></div>
        <h3 className="text-xl font-bold text-stone-800 mb-2">行程已鎖定</h3>
        <p className="text-sm text-stone-500 mb-6">請輸入「{tripInfo.title}」的通關密語</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" inputMode="numeric" pattern="[0-9]*" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Passcode" className="w-full bg-stone-50 border-2 border-stone-100 rounded-xl px-4 py-3 text-center text-2xl font-bold tracking-widest text-stone-800 focus:outline-none focus:border-stone-800 focus:bg-white transition-all" autoFocus disabled={loading} />
          <button type="submit" disabled={loading} className="w-full bg-stone-900 text-white rounded-xl py-3 font-bold text-lg hover:bg-stone-800 transition-all shadow-lg active:scale-95 disabled:opacity-50">{loading ? "驗證中..." : "解鎖"}</button>
        </form>
        {error && <p className="mt-4 text-red-500 text-sm font-bold animate-pulse flex justify-center gap-1"><X size={16} /> 密碼錯誤</p>}
      </div>
    </div>
  );
};

export default TripLoginScreen;