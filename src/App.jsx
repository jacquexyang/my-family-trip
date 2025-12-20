import React, { useState, useEffect } from 'react';
// --- Firebase Imports ---
import { signInAnonymously } from "firebase/auth";
import { auth } from './config/firebase'; 

// --- Components ---
import TripListScreen from './components/TripListScreen';
import TripLoginScreen from './components/TripLoginScreen';
import TripDashboard from './components/TripDashboard';

export default function App() {
  const [screen, setScreen] = useState('list'); // list, login, dashboard
  const [selectedTrip, setSelectedTrip] = useState(null); // 改存整個物件，不只 ID

  // Load auth state from local storage on mount
  useEffect(() => {
     // 啟動匿名登入，確保後續資料庫存取權限
     signInAnonymously(auth).catch(console.error);
  }, []);

  const handleSelectTrip = (trip) => {
    setSelectedTrip(trip);
    setScreen('login');
  };

  const handleUnlock = () => {
    setScreen('dashboard');
  };

  const handleBack = () => {
    setSelectedTrip(null);
    setScreen('list');
  };

  return (
    <div className="font-sans text-stone-700 antialiased selection:bg-stone-200">
      {screen === 'list' && (
        <TripListScreen 
          onSelectTrip={handleSelectTrip} 
        />
      )}
      
      {screen === 'login' && selectedTrip && (
        <TripLoginScreen 
          tripInfo={selectedTrip} 
          onUnlock={handleUnlock} 
          onBack={handleBack}
        />
      )}

      {screen === 'dashboard' && selectedTrip && (
        <TripDashboard 
          tripId={selectedTrip.id} 
          tripInfo={selectedTrip}
          onBack={handleBack} 
        />
      )}
    </div>
  );
}