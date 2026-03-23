import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

export default function HabitStats({ logs }) {
  
  // --- 1. Veri Hazırlama (Son 7 Gün) ---
  const getLast7DaysData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-CA'); // "2023-11-26"
      
      // O tarihteki logu bul
      const log = logs.find(l => l.date === dateString);
      
      data.push({
        name: d.toLocaleDateString('tr-TR', { weekday: 'short' }), // "Pzt"
        miktar: log ? log.value : 0 // Kayıt yoksa 0
      });
    }
    return data;
  };

  const chartData = getLast7DaysData();

  // --- 2. Basit Hesaplamalar ---
  const totalEntry = logs.length;
  const totalAmount = logs.reduce((acc, curr) => acc + curr.value, 0);
  const maxAmount = Math.max(...logs.map(l => l.value), 0);

  return (
    <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f0f9ff', borderRadius: '15px' }}>
      <h3>📊 İstatistikler</h3>
      
      {/* Özet Kartları */}
      <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '20px' }}>
        <div style={styles.card}>
          <span style={styles.number}>{totalEntry}</span>
          <span style={styles.label}>Toplam Gün</span>
        </div>
        <div style={styles.card}>
          <span style={styles.number}>{totalAmount}</span>
          <span style={styles.label}>Toplam Miktar</span>
        </div>
        <div style={styles.card}>
          <span style={styles.number}>{maxAmount}</span>
          <span style={styles.label}>En Yüksek</span>
        </div>
      </div>

      {/* Grafik */}
      <div style={{ width: '100%', height: 250 }}>
        <h4>Son 7 Gün Performansı</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="miktar" fill="#8884d8" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Basit stil tanımları
const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'white',
    padding: '10px',
    borderRadius: '10px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    width: '30%'
  },
  number: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  label: {
    fontSize: '12px',
    color: '#666'
  }
};