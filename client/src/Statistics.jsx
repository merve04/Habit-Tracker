import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, LineChart, Line, AreaChart, Area
} from 'recharts';
import { 
  FiTrendingUp, FiCalendar, FiTarget, FiAward, FiBarChart2,
  FiActivity, FiSun, FiMoon, FiCloud, FiZap, FiCheckCircle
} from 'react-icons/fi';
import { 
  FaFire, FaChartLine, FaStar, FaMedal, FaRocket,
  FaBrain, FaCalendarAlt, FaClock, FaTrophy
} from 'react-icons/fa';

export default function Statistics({ user }) {
  const [habits, setHabits] = useState([]);
  const [selectedHabitId, setSelectedHabitId] = useState("");
  const [timeRange, setTimeRange] = useState('week'); // week, month, year
  const [chartType, setChartType] = useState('bar'); // bar, line, area

  // Renk paleti
  const colors = {
    primary: '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    pink: '#ec4899'
  };

  const chartColors = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  useEffect(() => {
    axios.get(`http://localhost:5000/api/habits/${user._id}`)
      .then(res => {
        setHabits(res.data);
        if (res.data.length > 0) {
          setSelectedHabitId(res.data[0]._id);
        }
      })
      .catch(err => console.error(err));
  }, [user._id]);

  const selectedHabit = habits.find(h => h._id === selectedHabitId);

  // İstatistik hesaplamaları
  const calculateStats = () => {
    if (!selectedHabit || !selectedHabit.logs) {
      return {
        totalUnits: 0,
        currentMonthDays: 0,
        prevMonthDays: 0,
        mostProductiveDay: "Veri Yok",
        dailyAverage: 0,
        maxStreak: 0,
        consistency: 0,
        bestMonth: "Veri Yok",
        weeklyAverage: 0,
        monthlyAverage: 0,
        totalDays: 0,
        completionRate: 0,
        growth: 0,
        chartData: []
      };
    }

    const logs = selectedHabit.logs;
    
    // Toplam Birim
    const totalUnits = logs.reduce((sum, log) => sum + log.value, 0);

    const now = new Date();
    const currentMonth = now.getMonth();
    const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

    const dayCounts = {};
    const monthCounts = {};
    let currentMonthDays = 0;
    let prevMonthDays = 0;

    logs.forEach(log => {
      const logDate = new Date(log.date);
      
      // Aylık karşılaştırma
      if (logDate.getMonth() === currentMonth) currentMonthDays++;
      if (logDate.getMonth() === prevMonth) prevMonthDays++;

      // Gün analizleri
      const dayName = logDate.toLocaleDateString('tr-TR', { weekday: 'long' });
      dayCounts[dayName] = (dayCounts[dayName] || 0) + log.value;

      // Ay analizleri
      const monthKey = logDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' });
      monthCounts[monthKey] = (monthCounts[monthKey] || 0) + log.value;
    });

    // En verimli gün
    let mostProductiveDay = "Veri Yok";
    if (Object.keys(dayCounts).length > 0) {
      mostProductiveDay = Object.keys(dayCounts).reduce((a, b) => 
        dayCounts[a] > dayCounts[b] ? a : b
      );
    }

    // En verimli ay
    let bestMonth = "Veri Yok";
    if (Object.keys(monthCounts).length > 0) {
      bestMonth = Object.keys(monthCounts).reduce((a, b) => 
        monthCounts[a] > monthCounts[b] ? a : b
      );
    }

    // Günlük Ortalama
    const dailyAverage = logs.length > 0 ? (totalUnits / logs.length).toFixed(1) : 0;

    // Haftalık Ortalama
    const weeklyAverage = logs.length > 0 ? (totalUnits / (logs.length / 7)).toFixed(1) : 0;

    // Aylık Ortalama
    const monthlyAverage = logs.length > 0 ? (totalUnits / (logs.length / 30)).toFixed(1) : 0;

    // En yüksek streak
    let maxStreak = 0;
    if (logs.length > 0) {
      const uniqueDates = [...new Set(logs.map(l => l.date))];
      const sortedDates = uniqueDates.sort((a, b) => new Date(a) - new Date(b));
      
      let tempStreak = 1;
      maxStreak = 1;

      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        
        const diffTime = currDate - prevDate;
        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)); 

        if (diffDays === 1) {
          tempStreak++;
          if (tempStreak > maxStreak) maxStreak = tempStreak;
        } else {
          tempStreak = 1;
        }
      }
    }

    // Tutarlılık Skoru (Consistency)
    const totalDays = logs.length;
    const startDate = logs.length > 0 ? new Date(logs[0].date) : new Date();
    const daysSinceStart = Math.round((now - startDate) / (1000 * 60 * 60 * 24));
    const consistency = daysSinceStart > 0 ? Math.round((totalDays / daysSinceStart) * 100) : 0;

    // Tamamlanma Oranı
    const completionRate = selectedHabit.goals?.length > 0 
      ? Math.round((totalUnits / (selectedHabit.goals[0]?.targetValue * totalDays)) * 100) 
      : 0;

    // Grafik Verisi - Zaman aralığına göre
    const chartData = [];
    const daysToShow = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : 365;
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-CA');
      const log = logs.find(l => l.date === dateString);
      
      chartData.push({
        name: timeRange === 'week' 
          ? d.toLocaleDateString('tr-TR', { weekday: 'short' })
          : d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' }),
        Birim: log ? log.value : 0,
        fullDate: d.toLocaleDateString('tr-TR')
      });
    }

    // Büyüme Oranı
    let growth = 0;
    if (prevMonthDays > 0) {
      growth = Math.round(((currentMonthDays - prevMonthDays) / prevMonthDays) * 100);
    } else if (currentMonthDays > 0) {
      growth = 100;
    }

    return {
      totalUnits,
      currentMonthDays,
      prevMonthDays,
      mostProductiveDay,
      dailyAverage,
      maxStreak,
      consistency,
      bestMonth,
      weeklyAverage,
      monthlyAverage,
      totalDays: logs.length,
      completionRate,
      growth,
      chartData
    };
  };

  const stats = calculateStats();

  // Grafik render fonksiyonu
  const renderChart = () => {
    const ChartComponent = {
      bar: BarChart,
      line: LineChart,
      area: AreaChart
    }[chartType];

    const DataComponent = {
      bar: Bar,
      line: Line,
      area: Area
    }[chartType];

    return (
      <ResponsiveContainer width="100%" height="100%">
        <ChartComponent data={stats.chartData}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: '#6b7280' }}
            axisLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'white',
              border: 'none',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              padding: '10px'
            }}
            cursor={{ fill: '#f3f4f6' }}
          />
          {chartType === 'bar' ? (
            <Bar 
              dataKey="Birim" 
              fill={colors.primary}
              radius={[6, 6, 0, 0]}
            />
          ) : chartType === 'line' ? (
            <Line 
              type="monotone" 
              dataKey="Birim" 
              stroke={colors.primary}
              strokeWidth={3}
              dot={{ fill: colors.primary, strokeWidth: 2 }}
              activeDot={{ r: 8 }}
            />
          ) : (
            <Area 
              type="monotone" 
              dataKey="Birim" 
              stroke={colors.primary}
              strokeWidth={2}
              fill={`${colors.primary}20`}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    );
  };

  if (habits.length === 0) {
    return (
      <div style={styles.emptyState}>
        <FiTarget size={64} color="#9ca3af" />
        <h2 style={styles.emptyStateTitle}>Henüz Veri Yok</h2>
        <p style={styles.emptyStateText}>
          İstatistikleri görmek için alışkanlık eklemelisin.
        </p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            <FiBarChart2 size={28} color={colors.primary} />
            İstatistikler
          </h1>
          <p style={styles.subtitle}>
            Alışkanlıklarının detaylı analizini görüntüle
          </p>
        </div>
      </div>

      {/* Kontrol Paneli */}
      <div style={styles.controlPanel}>
        {/* Alışkanlık Seçici */}
        <div style={styles.habitSelector}>
          <label style={styles.selectorLabel}>
            <FiTarget size={16} color={colors.primary} />
            Alışkanlık
          </label>
          <select 
            value={selectedHabitId} 
            onChange={(e) => setSelectedHabitId(e.target.value)}
            style={styles.select}
          >
            {habits.map(h => (
              <option key={h._id} value={h._id}>{h.title}</option>
            ))}
          </select>
        </div>

        {/* Zaman Aralığı Seçici */}
        <div style={styles.timeRangeSelector}>
          <label style={styles.selectorLabel}>
            <FiCalendar size={16} color={colors.primary} />
            Zaman Aralığı
          </label>
          <div style={styles.buttonGroup}>
            {['week', 'month', 'year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                style={{
                  ...styles.rangeButton,
                  backgroundColor: timeRange === range ? colors.primary : 'white',
                  color: timeRange === range ? 'white' : '#4b5563',
                  borderColor: timeRange === range ? colors.primary : '#e5e7eb'
                }}
              >
                {range === 'week' ? 'Hafta' : range === 'month' ? 'Ay' : 'Yıl'}
              </button>
            ))}
          </div>
        </div>

        {/* Grafik Tipi Seçici */}
        <div style={styles.chartTypeSelector}>
          <label style={styles.selectorLabel}>
            <FiActivity size={16} color={colors.primary} />
            Grafik Tipi
          </label>
          <div style={styles.buttonGroup}>
            {['bar', 'line', 'area'].map((type) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                style={{
                  ...styles.rangeButton,
                  backgroundColor: chartType === type ? colors.primary : 'white',
                  color: chartType === type ? 'white' : '#4b5563',
                  borderColor: chartType === type ? colors.primary : '#e5e7eb'
                }}
              >
                {type === 'bar' ? 'Sütun' : type === 'line' ? 'Çizgi' : 'Alan'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {selectedHabit && (
        <>
          {/* Ana İstatistik Kartları */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#ecfdf5', color: colors.success }}>
                <FaFire size={24} />
              </div>
              <div>
                <p style={styles.statLabel}>Mevcut Seri</p>
                <p style={styles.statValue}>{selectedHabit.streak || 0}</p>
                <p style={styles.statUnit}>gün</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#fef3c7', color: colors.warning }}>
                <FaTrophy size={24} />
              </div>
              <div>
                <p style={styles.statLabel}>En Yüksek Rekor</p>
                <p style={styles.statValue}>{stats.maxStreak}</p>
                <p style={styles.statUnit}>gün</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#e0e7ff', color: colors.primary }}>
                <FaChartLine size={24} />
              </div>
              <div>
                <p style={styles.statLabel}>Toplam Birim</p>
                <p style={styles.statValue}>{stats.totalUnits}</p>
                <p style={styles.statUnit}>birim</p>
              </div>
            </div>

            <div style={styles.statCard}>
              <div style={{ ...styles.statIcon, backgroundColor: '#fae8ff', color: colors.purple }}>
                <FaBrain size={24} />
              </div>
              <div>
                <p style={styles.statLabel}>Tutarlılık</p>
                <p style={styles.statValue}>{stats.consistency}%</p>
                <p style={styles.statUnit}>oran</p>
              </div>
            </div>
          </div>

          {/* Detaylı İstatistikler */}
          <div style={styles.detailedStats}>
            <div style={styles.statsRow}>
              <div style={styles.statsColumn}>
                <h3 style={styles.sectionTitle}>
                  <FaCalendarAlt size={18} color={colors.primary} />
                  Zaman Analizi
                </h3>
                <div style={styles.statsList}>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Bu Ay Toplam:</span>
                    <span style={styles.statItemValue}>{stats.currentMonthDays} gün</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Geçen Ay:</span>
                    <span style={styles.statItemValue}>{stats.prevMonthDays} gün</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Büyüme Oranı:</span>
                    <span style={{
                      ...styles.statItemValue,
                      color: stats.growth >= 0 ? colors.success : colors.danger
                    }}>
                      {stats.growth >= 0 ? '▲' : '▼'} %{Math.abs(stats.growth)}
                    </span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Toplam Gün:</span>
                    <span style={styles.statItemValue}>{stats.totalDays} gün</span>
                  </div>
                </div>
              </div>

              <div style={styles.statsColumn}>
                <h3 style={styles.sectionTitle}>
                  <FiTrendingUp size={18} color={colors.primary} />
                  Performans Analizi
                </h3>
                <div style={styles.statsList}>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Günlük Ortalama:</span>
                    <span style={styles.statItemValue}>{stats.dailyAverage} birim</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Haftalık Ortalama:</span>
                    <span style={styles.statItemValue}>{stats.weeklyAverage} birim</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Aylık Ortalama:</span>
                    <span style={styles.statItemValue}>{stats.monthlyAverage} birim</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Tamamlama Oranı:</span>
                    <span style={styles.statItemValue}>%{stats.completionRate}</span>
                  </div>
                </div>
              </div>

              <div style={styles.statsColumn}>
                <h3 style={styles.sectionTitle}>
                  <FaStar size={18} color={colors.primary} />
                  Başarılar
                </h3>
                <div style={styles.statsList}>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>En Verimli Gün:</span>
                    <span style={styles.statItemValue}>{stats.mostProductiveDay}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>En İyi Ay:</span>
                    <span style={styles.statItemValue}>{stats.bestMonth}</span>
                  </div>
                  <div style={styles.statItem}>
                    <span style={styles.statItemLabel}>Mevcut Rütbe:</span>
                    <span style={styles.statItemValue}>
                      {stats.maxStreak >= 30 ? '🏆 Uzman' : 
                       stats.maxStreak >= 14 ? '⭐ Profesyonel' : 
                       stats.maxStreak >= 7 ? '🌱 Başlangıç' : '🆕 Acemi'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Grafik Alanı */}
          <div style={styles.chartContainer}>
            <div style={styles.chartHeader}>
              <h3 style={styles.sectionTitle}>
                <FiActivity size={18} color={colors.primary} />
                {timeRange === 'week' ? 'Son 7 Gün' : 
                 timeRange === 'month' ? 'Son 30 Gün' : 'Son Yıl'} Performansı
              </h3>
            </div>
            <div style={styles.chartWrapper}>
              {renderChart()}
            </div>
          </div>

          {/* Günlük Detay Tablosu */}
          <div style={styles.tableContainer}>
            <h3 style={styles.sectionTitle}>
              <FiCalendar size={18} color={colors.primary} />
              Günlük Detaylar
            </h3>
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Tarih</th>
                    <th style={styles.tableHeader}>Değer</th>
                    <th style={styles.tableHeader}>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.chartData.filter(d => d.Birim > 0).slice(0, 10).map((data, index) => (
                    <tr key={index} style={styles.tableRow}>
                      <td style={styles.tableCell}>{data.fullDate}</td>
                      <td style={styles.tableCell}>{data.Birim} birim</td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.statusBadge,
                          backgroundColor: data.Birim > stats.dailyAverage ? '#ecfdf5' : '#fef3c7',
                          color: data.Birim > stats.dailyAverage ? colors.success : colors.warning
                        }}>
                          {data.Birim > stats.dailyAverage ? 'Ortalama Üstü' : 'Ortalama Altı'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
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
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh',
    textAlign: 'center',
  },
  emptyStateTitle: {
    fontSize: '24px',
    fontWeight: '600',
    color: '#111827',
    marginTop: '20px',
    marginBottom: '10px',
  },
  emptyStateText: {
    fontSize: '16px',
    color: '#6b7280',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  controlPanel: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
    padding: '20px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  habitSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  timeRangeSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  chartTypeSelector: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  selectorLabel: {
    fontSize: '13px',
    fontWeight: '500',
    color: '#4b5563',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  select: {
    padding: '10px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: 'white',
  },
  buttonGroup: {
    display: 'flex',
    gap: '8px',
  },
  rangeButton: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
    gap: '20px',
    marginBottom: '30px',
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    padding: '24px',
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  statIcon: {
    width: '56px',
    height: '56px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statLabel: {
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '4px',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    lineHeight: 1,
    marginBottom: '4px',
  },
  statUnit: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  detailedStats: {
    marginBottom: '30px',
  },
  statsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '20px',
  },
  statsColumn: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  statItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #f3f4f6',
  },
  statItemLabel: {
    fontSize: '14px',
    color: '#6b7280',
  },
  statItemValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  chartContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '30px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  chartHeader: {
    marginBottom: '20px',
  },
  chartWrapper: {
    width: '100%',
    height: '400px',
  },
  tableContainer: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeader: {
    textAlign: 'left',
    padding: '12px',
    fontSize: '13px',
    fontWeight: '600',
    color: '#6b7280',
    borderBottom: '2px solid #e5e7eb',
  },
  tableRow: {
    ':hover': {
      backgroundColor: '#f9fafb',
    },
  },
  tableCell: {
    padding: '12px',
    fontSize: '14px',
    color: '#111827',
    borderBottom: '1px solid #f3f4f6',
  },
  statusBadge: {
    display: 'inline-block',
    padding: '4px 8px',
    borderRadius: '20px',
    fontSize: '11px',
    fontWeight: '500',
  },
};