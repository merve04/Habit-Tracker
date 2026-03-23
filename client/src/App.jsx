import { useState } from 'react';
import Auth from './Auth';
import Dashboard from './Dashboard';
import HabitDetail from './HabitDetail';
import Statistics from './Statistics'; // 👈 YENİ İSTATİSTİK SAYFAMIZ

function App() {
  const [user, setUser] = useState(null);
  
  // Hangi sayfanın açık olduğunu tutan state: 'dashboard', 'habitDetail', 'statistics'
  const [currentView, setCurrentView] = useState('dashboard'); 
  const [selectedHabit, setSelectedHabit] = useState(null);

  const handleLogout = () => {
    setUser(null);
    setSelectedHabit(null);
    setCurrentView('dashboard');
  };

  const goToHabitDetail = (habit) => {
    setSelectedHabit(habit);
    setCurrentView('habitDetail');
  };

  return (
    <div>
      {!user ? (
        <Auth onLogin={(userData) => setUser(userData)} />
      ) : (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          
          {/* ÜST MENÜ (NAVBAR) */}
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 20px', backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0', marginBottom: '20px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <button 
                onClick={() => setCurrentView('dashboard')} 
                style={{ padding: '8px 15px', cursor: 'pointer', border: 'none', background: currentView === 'dashboard' ? '#e2e8f0' : 'transparent', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px' }}
              >
                🏠 Ana Sayfa
              </button>
              <button 
                onClick={() => setCurrentView('statistics')} 
                style={{ padding: '8px 15px', cursor: 'pointer', border: 'none', background: currentView === 'statistics' ? '#e2e8f0' : 'transparent', borderRadius: '5px', fontWeight: 'bold', fontSize: '16px' }}
              >
                📊 İstatistikler
              </button>
            </div>
            <button onClick={handleLogout} style={{ padding: '8px 15px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
              Çıkış Yap
            </button>
          </div>

          {/* İÇERİK (Hangi sekme seçiliyse o gösterilir) */}
          {currentView === 'dashboard' && (
            <Dashboard user={user} onSelectHabit={goToHabitDetail} />
          )}

          {currentView === 'habitDetail' && (
            <HabitDetail habit={selectedHabit} onBack={() => setCurrentView('dashboard')} />
          )}

          {currentView === 'statistics' && (
            <Statistics user={user} />
          )}

        </div>
      )}
    </div>
  );
}

export default App;