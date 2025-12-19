// --- components/TripListScreen.jsx ---
const TripListScreen = ({ onSelectTrip, tripRegistry }) => {
  return (
    <div className="w-full min-h-screen bg-[#FDFBF7] p-6 flex flex-col items-center">
      <div className="w-full max-w-5xl mb-8 mt-4">
        <h1 className="text-3xl font-bold text-stone-800">我的旅程</h1>
        <p className="text-stone-400 text-sm mt-1">Ready for your next adventure?</p>
      </div>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-6">
        {tripRegistry.map((trip) => (
          <div key={trip.id} onClick={() => onSelectTrip(trip.id)} className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group relative h-80 flex flex-col">
            <div className="absolute top-4 right-4 z-10 bg-black/30 backdrop-blur-md p-2 rounded-full text-white"><Lock size={14} /></div>
            <div className="h-48 relative overflow-hidden flex-shrink-0">
              <img src={trip.coverImage} alt={trip.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-bold text-xl mb-1 shadow-sm leading-tight">{trip.title}</h3>
                <p className="text-xs opacity-90 font-medium flex items-center gap-1"><Calendar size={12} /> {trip.dates.split(' - ')[0]} 起</p>
              </div>
            </div>
            <div className="p-5 flex justify-between items-center bg-white flex-1">
              <div><p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">TRIP</p><p className="text-sm text-stone-600 line-clamp-1">{trip.subtitle}</p></div>
              <div className="w-10 h-10 rounded-full bg-stone-50 border border-stone-100 flex items-center justify-center text-stone-400 group-hover:bg-stone-800 group-hover:text-white transition-all"><ArrowRight size={20} /></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};