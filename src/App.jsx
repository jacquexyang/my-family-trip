import React, { useState, useEffect } from 'react';
// --- Firebase Imports ---
import { signInAnonymously } from "firebase/auth";
import { auth } from './config/firebase'; 

// --- Components ---
import TripListScreen from './components/TripListScreen';
import TripLoginScreen from './components/TripLoginScreen';
import TripDashboard from './components/TripDashboard';

// --- Data ---
import { TRIP_REGISTRY } from './config/tripsData';

export default function App() {
  const [screen, setScreen] = useState('list'); // list, login, dashboard
  const [selectedTripId, setSelectedTripId] = useState(null);

  // Load auth state from local storage on mount
  useEffect(() => {
     // 啟動匿名登入，確保後續資料庫存取權限
     signInAnonymously(auth).catch(console.error);
  }, []);

  const handleSelectTrip = (id) => {
    setSelectedTripId(id);
    setScreen('login');
  };

  const handleUnlock = () => {
    setScreen('dashboard');
  };

  const handleBack = () => {
    setSelectedTripId(null);
    setScreen('list');
  };

  const getTripInfo = (id) => TRIP_REGISTRY.find(t => t.id === id);

  return (
    <div className="font-sans text-stone-700 antialiased selection:bg-stone-200">
      {screen === 'list' && (
        <TripListScreen 
          onSelectTrip={handleSelectTrip} 
          tripRegistry={TRIP_REGISTRY} 
        />
      )}
      
      {screen === 'login' && selectedTripId && (
        <TripLoginScreen 
          tripInfo={getTripInfo(selectedTripId)} 
          onUnlock={handleUnlock} 
          onBack={handleBack}
        />
      )}

      {screen === 'dashboard' && selectedTripId && (
        <TripDashboard 
          tripId={selectedTripId} 
          tripInfo={getTripInfo(selectedTripId)}
          onBack={handleBack} 
        />
      )}
    </div>
  );
}