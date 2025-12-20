import React, { useState, useEffect } from 'react';
import { X, Save, Clock, MapPin, AlignLeft, DollarSign, Tag, Star } from 'lucide-react';

const ScheduleFormModal = ({ item, dayIndex, onSave, onClose }) => {
  // 預設表單資料
  const [formData, setFormData] = useState({
    id: Date.now(),
    time: '',
    title: '',
    type: 'sightseeing',
    location: '',
    address: '',
    note: '',
    desc: '',
    price: '',
    rating: '',
    link: ''
  });

  // 如果是編輯模式，載入原有資料
  useEffect(() => {
    if (item) {
      setFormData(item);
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(dayIndex, formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] bg-stone-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600"><X size={20}/></button>
        
        <h3 className="text-xl font-bold mb-6 text-stone-800">{item ? '編輯行程' : '新增行程'}</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 時間 & 類型 */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">時間</label>
              <div className="relative">
                <Clock size={16} className="absolute left-3 top-3 text-stone-400" />
                <input name="time" value={formData.time} onChange={handleChange} placeholder="09:00" className="w-full pl-9 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" required />
              </div>
            </div>
            <div className="flex-1">
              <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">類型</label>
              <div className="relative">
                <Tag size={16} className="absolute left-3 top-3 text-stone-400" />
                <select name="type" value={formData.type} onChange={handleChange} className="w-full pl-9 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none appearance-none">
                  <option value="sightseeing">景點</option>
                  <option value="food">餐飲</option>
                  <option value="shopping">購物</option>
                  <option value="transport">交通</option>
                  <option value="hotel">住宿</option>
                  <option value="info">資訊</option>
                </select>
              </div>
            </div>
          </div>

          {/* 標題 */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">標題</label>
            <input name="title" value={formData.title} onChange={handleChange} placeholder="輸入行程名稱..." className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 font-bold text-stone-800 focus:ring-2 focus:ring-stone-900 outline-none" required />
          </div>

          {/* 備註 (Subtitle) */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">備註 (小標題)</label>
            <input name="note" value={formData.note} onChange={handleChange} placeholder="例如：必吃、推薦..." className="w-full p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
          </div>

          {/* 地點 & 地址 */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">地點資訊</label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3 top-3 text-stone-400" />
              <input name="location" value={formData.location} onChange={handleChange} placeholder="顯示地點名稱 (如: 弘大)" className="w-full pl-9 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none mb-2" />
            </div>
            <input name="address" value={formData.address} onChange={handleChange} placeholder="真實導航地址 (給 Google Map 用)" className="w-full p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-500 focus:ring-2 focus:ring-stone-900 outline-none" />
          </div>

          {/* 預算 & 評分 */}
          <div className="flex gap-3">
             <div className="flex-1 relative">
                <DollarSign size={14} className="absolute left-3 top-3 text-stone-400" />
                <input name="price" value={formData.price} onChange={handleChange} placeholder="預算" className="w-full pl-8 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none" />
             </div>
             <div className="flex-1 relative">
                <Star size={14} className="absolute left-3 top-3 text-stone-400" />
                <input name="rating" value={formData.rating} onChange={handleChange} placeholder="評分 (e.g. 4.5)" className="w-full pl-8 p-2.5 bg-stone-50 rounded-xl border border-stone-200 text-xs focus:ring-2 focus:ring-stone-900 outline-none" />
             </div>
          </div>

          {/* 詳細描述 */}
          <div>
            <label className="text-xs font-bold text-stone-400 uppercase mb-1 block">詳細說明</label>
            <div className="relative">
              <AlignLeft size={16} className="absolute left-3 top-3 text-stone-400" />
              <textarea name="desc" value={formData.desc} onChange={handleChange} placeholder="輸入詳細資訊、必吃菜色、注意事項..." rows={3} className="w-full pl-9 p-3 bg-stone-50 rounded-xl border border-stone-200 text-sm focus:ring-2 focus:ring-stone-900 outline-none" />
            </div>
          </div>

          <button type="submit" className="w-full py-3 bg-stone-900 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-stone-800 transition-all shadow-lg mt-2">
            <Save size={18} /> 儲存行程
          </button>
        </form>
      </div>
    </div>
  );
};

export default ScheduleFormModal;