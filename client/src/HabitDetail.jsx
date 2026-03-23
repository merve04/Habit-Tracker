import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import axios from 'axios';
import { 
  FiArrowLeft, FiCalendar, FiTarget, FiPlus, 
  FiCheck, FiX, FiClock, FiEdit2, FiTrash2, FiBarChart2
} from 'react-icons/fi';
import { FaFire } from 'react-icons/fa';
import './HabitDetail.css';

export default function HabitDetail({ habit, onBack }) {
  const [logs, setLogs] = useState(habit.logs || []);
  const [streak, setStreak] = useState(habit.streak || 0);
  const [goals, setGoals] = useState(habit.goals || []);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [newValue, setNewValue] = useState("");
  const [newColor, setNewColor] = useState("blue");

  const colorPalette = [
    { name: "Mavi", value: "blue", hex: "#3b82f6", light: "#eff6ff" },
    { name: "Kırmızı", value: "red", hex: "#ef4444", light: "#fef2f2" },
    { name: "Yeşil", value: "green", hex: "#22c55e", light: "#f0fdf4" },
    { name: "Sarı", value: "yellow", hex: "#eab308", light: "#fefce8" },
    { name: "Mor", value: "purple", hex: "#a855f7", light: "#faf5ff" },
    { name: "Turuncu", value: "orange", hex: "#f97316", light: "#fff7ed" }
  ];

  const getTileClassName = ({ date, view }) => {
    if (view === 'month') {
      const dateString = date.toLocaleDateString('en-CA');
      const log = logs.find(l => l.date === dateString);
      
      if (log) {
        const matchedGoal = goals.find(g => g.targetValue === log.value);
        if (matchedGoal) return `habit-day bg-${matchedGoal.color}`;
        return 'habit-day bg-blue';
      }
    }
    return 'habit-day';
  };

  const handleAddGoal = async () => {
    if (!newValue) return;
    if (isNaN(newValue) || parseInt(newValue) <= 0) {
      alert("Lütfen geçerli bir miktar girin!");
      return;
    }

    const updatedGoals = [...goals, { 
      targetValue: parseInt(newValue), 
      color: newColor,
      id: Date.now()
    }];
    
    try {
      await axios.put(`http://localhost:5000/api/habits/${habit._id}/goals`, { goals: updatedGoals });
      setGoals(updatedGoals);
      setNewValue("");
      setShowGoalForm(false);
    } catch (err) {
      console.error(err);
      alert("Hedef eklenemedi.");
    }
  };

  const handleEditGoal = async (goal) => {
    if (!newValue) {
      setNewValue(goal.targetValue);
      setNewColor(goal.color);
      setEditingGoal(goal);
      setShowGoalForm(true);
    } else {
      const updatedGoals = goals.map(g => 
        g.id === goal.id ? { ...g, targetValue: parseInt(newValue), color: newColor } : g
      );
      
      try {
        await axios.put(`http://localhost:5000/api/habits/${habit._id}/goals`, { goals: updatedGoals });
        setGoals(updatedGoals);
        setNewValue("");
        setEditingGoal(null);
        setShowGoalForm(false);
      } catch (err) {
        console.error(err);
        alert("Hedef güncellenemedi.");
      }
    }
  };

  const handleDeleteGoal = async (goalToDelete) => {
    if (!window.confirm("Bu hedefi silmek istediğinize emin misiniz?")) return;
    
    const updatedGoals = goals.filter(g => g.id !== goalToDelete.id);
    
    try {
      await axios.put(`http://localhost:5000/api/habits/${habit._id}/goals`, { goals: updatedGoals });
      setGoals(updatedGoals);
    } catch (err) {
      console.error(err);
      alert("Hedef silinemedi.");
    }
  };

  const handleDayClick = (value) => {
    setSelectedDate(value);
  };

  const handleLogData = async (targetValue) => {
    if (!selectedDate) return;
    
    const dateString = selectedDate.toLocaleDateString('en-CA');
    
    try {
      const res = await axios.post("http://localhost:5000/api/habits/log", {
        habitId: habit._id,
        date: dateString,
        value: targetValue
      });
      setLogs(res.data.logs);
      setStreak(res.data.streak);
      setSelectedDate(null);
    } catch (err) {
      console.error(err);
      alert("Kayıt hatası!");
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={onBack} style={styles.backButton}>
          <FiArrowLeft size={20} />
          <span>Geri Dön</span>
        </button>
        
        <div style={styles.titleSection}>
          <div style={styles.habitIcon}>
            <FiTarget size={28} color="#6366f1" />
          </div>
          <div>
            <h1 style={styles.habitTitle}>{habit.title}</h1>
            <p style={styles.habitSubtitle}>Alışkanlık Detayları ve Takip</p>
          </div>
        </div>

        <div style={styles.streakBadge}>
          <FaFire size={24} color="#f97316" />
          <div>
            <span style={styles.streakNumber}>{streak}</span>
            <span style={styles.streakLabel}>Günlük Seri</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {/* Calendar Section */}
        <div style={styles.calendarSection}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              <FiCalendar size={20} color="#6366f1" />
              Takvim
            </h2>
            <p style={styles.sectionSubtitle}>İlerlemeni görsel olarak takip et</p>
          </div>
          
          <Calendar 
            onClickDay={handleDayClick} 
            tileClassName={getTileClassName}
            formatShortWeekday={(locale, date) => 
              ['P', 'S', 'Ç', 'P', 'C', 'C', 'P'][date.getDay()]
            }
          />

          {selectedDate && (
            <div style={styles.selectedDateInfo}>
              <FiClock size={16} color="#6366f1" />
              <span>Seçilen Tarih: <strong>{formatDate(selectedDate)}</strong></span>
            </div>
          )}
        </div>

        {/* Actions Section */}
        <div style={styles.actionsSection}>
          {/* Log Entry */}
          <div style={styles.logEntryCard}>
            <h3 style={styles.cardTitle}>
              <FiTarget size={18} color="#6366f1" />
              {selectedDate ? `${formatDate(selectedDate)} için Giriş` : 'Gün Seçin'}
            </h3>
            
            {selectedDate ? (
              goals.length > 0 ? (
                <div style={styles.goalButtons}>
                  {goals.map((goal, index) => {
                    const colorInfo = colorPalette.find(c => c.value === goal.color) || colorPalette[0];
                    return (
                      <button
                        key={index}
                        onClick={() => handleLogData(goal.targetValue)}
                        style={{
                          ...styles.goalButton,
                          backgroundColor: colorInfo.hex,
                          boxShadow: `0 4px 12px ${colorInfo.hex}40`
                        }}
                      >
                        <span style={styles.goalButtonValue}>{goal.targetValue}</span>
                        <span style={styles.goalButtonLabel}>Birim</span>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div style={styles.emptyGoals}>
                  <p style={styles.emptyGoalsText}>
                    Henüz hedef eklenmemiş
                  </p>
                  <p style={styles.emptyGoalsSubtext}>
                    Aşağıdan hedef ekleyerek başlayın
                  </p>
                </div>
              )
            ) : (
              <div style={styles.selectDateMessage}>
                <FiCalendar size={32} color="#9ca3af" />
                <p>Takvimden bir gün seçin</p>
              </div>
            )}
          </div>

          {/* Goals Management */}
          <div style={styles.goalsCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardTitle}>
                <FiBarChart2 size={18} color="#6366f1" />
                Hedefler ve Renkler
              </h3>
              <button
                onClick={() => setShowGoalForm(!showGoalForm)}
                style={styles.addButton}
              >
                <FiPlus size={16} />
                <span>Yeni Hedef</span>
              </button>
            </div>

            {showGoalForm && (
              <div style={styles.goalForm}>
                <h4 style={styles.formTitle}>
                  {editingGoal ? 'Hedef Düzenle' : 'Yeni Hedef Ekle'}
                </h4>
                <div style={styles.formContent}>
                  <input
                    type="number"
                    placeholder="Miktar"
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    style={styles.formInput}
                  />
                  <select
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    style={styles.formSelect}
                  >
                    {colorPalette.map(color => (
                      <option key={color.value} value={color.value}>
                        {color.name}
                      </option>
                    ))}
                  </select>
                  <div style={styles.formActions}>
                    <button
                      onClick={editingGoal ? () => handleEditGoal(editingGoal) : handleAddGoal}
                      style={styles.formSubmitButton}
                    >
                      <FiCheck size={16} />
                      {editingGoal ? 'Güncelle' : 'Ekle'}
                    </button>
                    <button
                      onClick={() => {
                        setShowGoalForm(false);
                        setEditingGoal(null);
                        setNewValue("");
                      }}
                      style={styles.formCancelButton}
                    >
                      <FiX size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div style={styles.goalsList}>
              {goals.map((goal, index) => {
                const colorInfo = colorPalette.find(c => c.value === goal.color) || colorPalette[0];
                return (
                  <div key={index} style={styles.goalItem}>
                    <div style={styles.goalItemInfo}>
                      <span style={{
                        ...styles.goalColorDot,
                        backgroundColor: colorInfo.hex
                      }} />
                      <span style={styles.goalItemText}>
                        {goal.targetValue} Birim
                      </span>
                    </div>
                    <div style={styles.goalItemActions}>
                      <button
                        onClick={() => handleEditGoal(goal)}
                        style={styles.goalItemButton}
                      >
                        <FiEdit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal)}
                        style={{ ...styles.goalItemButton, color: '#ef4444' }}
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              
              {goals.length === 0 && !showGoalForm && (
                <div style={styles.noGoals}>
                  <p>Henüz hedef eklenmemiş</p>
                  <p style={styles.noGoalsSubtext}>Yeni hedef ekleyerek başlayın</p>
                </div>
              )}
            </div>
          </div>
        </div>
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
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '30px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#f3f4f6',
      transform: 'translateX(-2px)',
    },
  },
  titleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },
  habitIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    backgroundColor: '#e0e7ff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '5px',
  },
  habitSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  streakBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 24px',
    backgroundColor: '#fff7ed',
    borderRadius: '50px',
    border: '1px solid #fed7aa',
  },
  streakNumber: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#f97316',
    lineHeight: '1',
    marginRight: '5px',
  },
  streakLabel: {
    fontSize: '12px',
    color: '#9a5c1a',
  },
  mainContent: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '30px',
  },
  calendarSection: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
    marginLeft: 'auto',
  },
  selectedDateInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginTop: '20px',
    padding: '12px',
    backgroundColor: '#e0e7ff',
    borderRadius: '8px',
    fontSize: '14px',
    color: '#4b5563',
  },
  actionsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  logEntryCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  goalsCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '24px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '8px 16px',
    backgroundColor: '#e0e7ff',
    border: 'none',
    borderRadius: '30px',
    color: '#6366f1',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      backgroundColor: '#c7d2fe',
    },
  },
  goalButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
    gap: '10px',
  },
  goalButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '15px',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    transition: 'all 0.3s',
    ':hover': {
      transform: 'translateY(-2px)',
    },
  },
  goalButtonValue: {
    fontSize: '18px',
    fontWeight: '700',
  },
  goalButtonLabel: {
    fontSize: '12px',
    opacity: 0.9,
  },
  emptyGoals: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
  },
  emptyGoalsText: {
    fontSize: '14px',
    color: '#4b5563',
    marginBottom: '5px',
  },
  emptyGoalsSubtext: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  selectDateMessage: {
    textAlign: 'center',
    padding: '40px 20px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    color: '#9ca3af',
  },
  goalForm: {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '20px',
  },
  formTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '15px',
  },
  formContent: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  },
  formInput: {
    flex: '1',
    minWidth: '100px',
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    ':focus': {
      borderColor: '#6366f1',
      boxShadow: '0 0 0 3px rgba(99,102,241,0.1)',
    },
  },
  formSelect: {
    flex: '1',
    minWidth: '120px',
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: 'white',
  },
  formActions: {
    display: 'flex',
    gap: '5px',
  },
  formSubmitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    padding: '10px 16px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  formCancelButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '38px',
    padding: '10px',
    backgroundColor: '#f3f4f6',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    color: '#6b7280',
    cursor: 'pointer',
  },
  goalsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  goalItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '8px',
  },
  goalItemInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  goalColorDot: {
    width: '20px',
    height: '20px',
    borderRadius: '6px',
  },
  goalItemText: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#111827',
  },
  goalItemActions: {
    display: 'flex',
    gap: '5px',
  },
  goalItemButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '30px',
    height: '30px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    color: '#6b7280',
    cursor: 'pointer',
    ':hover': {
      backgroundColor: '#f3f4f6',
    },
  },
  noGoals: {
    textAlign: 'center',
    padding: '30px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    color: '#6b7280',
  },
  noGoalsSubtext: {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '5px',
  },
};