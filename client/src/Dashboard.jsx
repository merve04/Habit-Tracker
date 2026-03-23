import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FiPlus, FiTrash2, FiCalendar, FiTrendingUp, 
  FiAward, FiClock, FiCheckCircle, FiZap,
  FiBarChart2, FiTarget, FiSun
} from 'react-icons/fi';
import { 
  FaWater, FaBook, FaRunning, FaSmokingBan, 
  FaBullseye, FaFire, FaStar, FaHeart,
  FaDumbbell, FaBrain, FaCoffee, FaMoon
} from 'react-icons/fa';

export default function Dashboard({ user, onSelectHabit }) {
  const [habits, setHabits] = useState([]);
  const [newHabitName, setNewHabitName] = useState("");
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [stats, setStats] = useState({
    totalStreak: 0,
    completedToday: 0,
    bestStreak: 0
  });

  const API_URL = "http://localhost:5000/api/habits";

  // Alışkanlık şablonları ve ikonları (düzeltilmiş)
  const defaultHabits = [
    { icon: FaWater, title: "💧 Düzenli Su Tüketimi", color: "#3b82f6", desc: "Günde 8 bardak" },
    { icon: FaBook, title: "📚 Günlük Okuma Hedefi", color: "#8b5cf6", desc: "30 dakika" },
    { icon: FaRunning, title: "🏃 Düzenli Egzersiz", color: "#10b981", desc: "45 dakika" },
    { icon: FaHeart, title: "🧘 Zihinsel Farkındalık", color: "#f59e0b", desc: "15 dakika meditasyon" },
    { icon: FaSmokingBan, title: "🚭 Tütünsüz Yaşam", color: "#ef4444", desc: "Sigarasız günler" },
    { icon: FaBullseye, title: "🎯 Odaklı Çalışma", color: "#6366f1", desc: "Pomodoro tekniği" }
  ];

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await axios.get(`${API_URL}/${user._id}`);
        setHabits(res.data);
        
        // İstatistikleri hesapla
        if (res.data.length > 0) {
          const totalStreak = res.data.reduce((acc, h) => acc + (h.streak || 0), 0);
          const bestStreak = Math.max(...res.data.map(h => h.streak || 0), 0);
          setStats({
            totalStreak,
            bestStreak,
            completedToday: res.data.filter(h => {
              const today = new Date().toDateString();
              return h.lastCompleted === today;
            }).length
          });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchHabits();
  }, [user._id]);

  const addHabit = async (e, defaultTitle = null, defaultIcon = null) => {
    if (e) e.preventDefault();
    const titleToSave = defaultTitle || newHabitName;
    if (!titleToSave) return;

    const newHabit = {
      userId: user._id,
      title: titleToSave,
      icon: defaultIcon || 'FiTarget',
      goals: [],
      streak: 0,
      lastCompleted: null,
      createdAt: new Date().toISOString()
    };

    try {
      const res = await axios.post(API_URL, newHabit);
      setHabits([...habits, res.data]);
      if (!defaultTitle) {
        setNewHabitName("");
        setShowQuickAdd(false);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deleteHabit = async (habitId) => {
    if (!window.confirm("Bu alışkanlığı ve tüm geçmişini silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/${habitId}`);
      setHabits(habits.filter((habit) => habit._id !== habitId));
    } catch (err) {
      console.error("Silme hatası:", err);
    }
  };

  // İkon seçici
  const getHabitIcon = (iconName) => {
    const icons = {
      FaWater, FaBook, FaRunning, FaHeart, FaSmokingBan, FaBullseye,
      FiTarget, FiSun, FiZap, FaStar, FaDumbbell, FaBrain, FaCoffee, FaMoon
    };
    return icons[iconName] || FiTarget;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.welcome}>
            Hoş Geldin, <span style={styles.userName}>{user.username}</span>
          </h1>
          <p style={styles.date}>
            {new Date().toLocaleDateString('tr-TR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div style={styles.quoteBox}>
          <FiZap size={20} color="#f59e0b" />
          <span style={styles.quote}>
            "Küçük adımlar, büyük değişimler yaratır."
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#ecfdf5', color: '#10b981' }}>
            <FaFire size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>Toplam Streak</p>
            <p style={styles.statValue}>{stats.totalStreak} <span style={styles.statUnit}>gün</span></p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <FiCheckCircle size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>Bugün Tamamlanan</p>
            <p style={styles.statValue}>{stats.completedToday} <span style={styles.statUnit}>alışkanlık</span></p>
          </div>
        </div>
        
        <div style={styles.statCard}>
          <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <FiAward size={24} />
          </div>
          <div>
            <p style={styles.statLabel}>En İyi Streak</p>
            <p style={styles.statValue}>{stats.bestStreak} <span style={styles.statUnit}>gün</span></p>
          </div>
        </div>
      </div>

      {/* Quick Add Toggle */}
      <button 
        onClick={() => setShowQuickAdd(!showQuickAdd)}
        style={styles.quickAddToggle}
      >
        <FiPlus size={20} />
        <span>Hızlı Ekle</span>
      </button>

      {/* Quick Add Panel */}
      {showQuickAdd && (
        <div style={styles.quickAddPanel}>
          <h3 style={styles.quickAddTitle}>Yeni Alışkanlık Ekle</h3>
          <form onSubmit={(e) => addHabit(e)} style={styles.quickAddForm}>
            <input
              type="text"
              placeholder="Alışkanlık adı..."
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              style={styles.quickAddInput}
              autoFocus
            />
            <button type="submit" style={styles.quickAddButton}>
              <FiPlus size={18} />
              Ekle
            </button>
          </form>
        </div>
      )}

      {/* Suggested Habits */}
      <div style={styles.suggestedSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Önerilen Alışkanlıklar</h2>
          <p style={styles.sectionSubtitle}>Başlamak için birini seç</p>
        </div>
        <div style={styles.suggestedGrid}>
          {defaultHabits.map((habit, index) => {
            const Icon = habit.icon;
            return (
              <button
                key={index}
                onClick={() => addHabit(null, habit.title, Icon.name)}
                style={styles.suggestedCard}
              >
                <div style={{ ...styles.suggestedIcon, backgroundColor: `${habit.color}20`, color: habit.color }}>
                  <Icon size={24} />
                </div>
                <div style={styles.suggestedContent}>
                  <h3 style={styles.suggestedTitle}>{habit.title}</h3>
                  <p style={styles.suggestedDesc}>{habit.desc}</p>
                </div>
                <FiPlus style={styles.suggestedAdd} size={20} color={habit.color} />
              </button>
            );
          })}
        </div>
      </div>

      {/* My Habits */}
      <div style={styles.habitsSection}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Alışkanlıklarım</h2>
          <p style={styles.habitCount}>{habits.length} alışkanlık</p>
        </div>

        {habits.length === 0 ? (
          <div style={styles.emptyState}>
            <FiTarget size={48} color="#9ca3af" />
            <p style={styles.emptyStateText}>Henüz alışkanlık eklemedin</p>
            <p style={styles.emptyStateSubtext}>Yukarıdan bir şablon seçerek başlayabilirsin</p>
          </div>
        ) : (
          <div style={styles.habitsGrid}>
            {habits.map((habit) => {
              const IconComponent = getHabitIcon(habit.icon);
              const streakColor = habit.streak > 30 ? '#10b981' : habit.streak > 7 ? '#f59e0b' : '#6b7280';
              
              return (
                <div key={habit._id} style={styles.habitCard}>
                  <button
                    onClick={() => deleteHabit(habit._id)}
                    style={styles.deleteButton}
                    title="Alışkanlığı Sil"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  <div style={styles.habitHeader}>
                    <div style={{ ...styles.habitIcon, backgroundColor: `${streakColor}20`, color: streakColor }}>
                      <IconComponent size={24} />
                    </div>
                    <div style={styles.habitInfo}>
                      <h3 style={styles.habitTitle}>{habit.title}</h3>
                      <div style={styles.habitStreak}>
                        <FaFire size={14} color={streakColor} />
                        <span style={{ ...styles.streakText, color: streakColor }}>
                          {habit.streak || 0} günlük seri
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.habitFooter}>
                    <div style={styles.habitStats}>
                      <FiClock size={14} color="#9ca3af" />
                      <span style={styles.habitStatText}>
                        {habit.lastCompleted ? 'Bugün tamamlandı' : 'Bugün bekliyor'}
                      </span>
                    </div>
                    <button
                      onClick={() => onSelectHabit(habit)}
                      style={styles.viewButton}
                    >
                      <FiCalendar size={16} />
                      <span>Takvim</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f9fafb',
    minHeight: '100vh',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '30px',
    flexWrap: 'wrap',
    gap: '20px',
  },
  welcome: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '5px',
  },
  userName: {
    color: '#6366f1',
    position: 'relative',
  },
  date: {
    fontSize: '14px',
    color: '#6b7280',
  },
  quoteBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'white',
    borderRadius: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  quote: {
    fontSize: '14px',
    color: '#4b5563',
    fontStyle: 'italic',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  statIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
  },
  statUnit: {
    fontSize: '12px',
    color: '#9ca3af',
    fontWeight: 'normal',
  },
  quickAddToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginBottom: '20px',
    transition: 'all 0.3s',
  },
  quickAddPanel: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  quickAddTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '15px',
  },
  quickAddForm: {
    display: 'flex',
    gap: '10px',
  },
  quickAddInput: {
    flex: 1,
    padding: '12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
  },
  quickAddButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  suggestedSection: {
    marginBottom: '40px',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  suggestedGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '15px',
  },
  suggestedCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '15px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.3s',
    position: 'relative',
    width: '100%',
    textAlign: 'left',
  },
  suggestedIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedContent: {
    flex: 1,
  },
  suggestedTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '4px',
  },
  suggestedDesc: {
    fontSize: '12px',
    color: '#6b7280',
  },
  suggestedAdd: {
    opacity: 0.5,
  },
  habitsSection: {
    marginTop: '20px',
  },
  habitCount: {
    fontSize: '14px',
    color: '#6366f1',
    fontWeight: '600',
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    backgroundColor: 'white',
    borderRadius: '12px',
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#4b5563',
    marginTop: '15px',
    marginBottom: '5px',
  },
  emptyStateSubtext: {
    fontSize: '14px',
    color: '#9ca3af',
  },
  habitsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  habitCard: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '20px',
    position: 'relative',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    transition: 'all 0.3s',
  },
  deleteButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
  },
  habitHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px',
  },
  habitIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '5px',
  },
  habitStreak: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  streakText: {
    fontSize: '12px',
    fontWeight: '500',
  },
  habitFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e5e7eb',
  },
  habitStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
  },
  habitStatText: {
    fontSize: '12px',
    color: '#6b7280',
  },
  viewButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    backgroundColor: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    color: '#4b5563',
    fontSize: '12px',
    cursor: 'pointer',
  },
};