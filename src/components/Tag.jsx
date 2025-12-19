// --- components/Tag.jsx ---
const Tag = ({ type }) => {
  const styles = {
    food: "bg-orange-50 text-orange-600 border-orange-100",
    sightseeing: "bg-emerald-50 text-emerald-600 border-emerald-100",
    transport: "bg-blue-50 text-blue-600 border-blue-100",
    hotel: "bg-purple-50 text-purple-600 border-purple-100",
    info: "bg-gray-50 text-gray-600 border-gray-100",
  };
  const labelMap = { food: '餐飲', sightseeing: '景點', transport: '交通', hotel: '住宿', info: '資訊' };
  return <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${styles[type] || "bg-gray-50 text-gray-600"}`}>{labelMap[type] || '其他'}</span>;
};