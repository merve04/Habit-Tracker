const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const User = require('./models/User');
const Habit = require('./models/Habit');

const app = express();

app.use(express.json());
app.use(cors());

const MONGO_URI = 'mongodb+srv://admin:sifre123@cluster0.dzrpsbi.mongodb.net/?appName=Cluster0';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas Bağlantısı BAŞARILI!'))
  .catch((err) => console.error('❌ Bağlantı Hatası:', err));

// --- YARDIMCI FONKSİYON: GERÇEK STREAK HESABI ---
// --- YARDIMCI FONKSİYON: SUNUM İÇİN GELECEK DESTEKLİ STREAK HESABI ---
const calculateStreak = (logs) => {
  if (!logs || logs.length === 0) return 0;

  // Aynı güne birden fazla kayıt girildiyse onları tekilleştir ve en yeniden en eskiye sırala
  const uniqueDates = [...new Set(logs.map(l => l.date))];
  const sortedDates = uniqueDates.sort((a, b) => new Date(b) - new Date(a));

  // Tarihi "YYYY-MM-DD" formatına çeviren fonksiyon
  const formatDate = (date) => {
    return date.getFullYear() + "-" + 
           String(date.getMonth() + 1).padStart(2, '0') + "-" + 
           String(date.getDate()).padStart(2, '0');
  };

  let streak = 0;
  
  // Zincirin başlangıç noktası "Bugün" değil, kullanıcının girdiği EN İLERİ tarih (Gelecek de olabilir)
  let checkDate = new Date(sortedDates[0]); 

  // O en ileri tarihten geriye doğru gün gün git ve boşluk var mı kontrol et
  while (true) {
    let checkDateStr = formatDate(checkDate);
    if (sortedDates.includes(checkDateStr)) {
      streak++; // O gün yapılmış, seriyi artır
      checkDate.setDate(checkDate.getDate() - 1); // Bir önceki güne geç (geriye doğru say)
    } else {
      break; // Boşluk bulundu, zincir kırıldı, saymayı bırak
    }
  }

  return streak;
};

// --- API ROTALARI ---

// 1. KAYIT OLMA (Register)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 2. GİRİŞ YAPMA (Login)
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("Kullanıcı bulunamadı!");

    if (user.password !== req.body.password) {
      return res.status(400).json("Şifre yanlış!");
    }

    const { password, ...others } = user._doc;
    res.status(200).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 3. YENİ ALIŞKANLIK EKLEME
app.post('/api/habits', async (req, res) => {
  try {
    const { userId, title, goals } = req.body;
    const newHabit = new Habit({ userId, title, goals, logs: [], streak: 0 });
    const savedHabit = await newHabit.save();
    res.status(201).json(savedHabit);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 4. KULLANICININ ALIŞKANLIKLARINI GETİRME (Streak burada dinamik hesaplanır)
app.get('/api/habits/:userId', async (req, res) => {
  try {
    let habits = await Habit.find({ userId: req.params.userId });
    
    // Kullanıcı sayfayı her açtığında streak'leri güncel tarihe göre tekrar hesapla
    const updatedHabits = habits.map(habit => {
      const realStreak = calculateStreak(habit.logs);
      return { ...habit._doc, streak: realStreak };
    });

    res.status(200).json(updatedHabits);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 5. GÜNLÜK KAYIT (LOG) EKLEME
app.post('/api/habits/log', async (req, res) => {
  try {
    const { habitId, date, value } = req.body; 
    const habit = await Habit.findById(habitId);
    
    const logIndex = habit.logs.findIndex(l => l.date === date);
    if (logIndex > -1) {
      habit.logs[logIndex].value = value;
    } else {
      habit.logs.push({ date, value });
    }

    // Yeni veriye göre streak'i hesapla ve kaydet
    habit.streak = calculateStreak(habit.logs); 
    await habit.save();
    
    res.status(200).json(habit);
  } catch (err) {
    res.status(500).json(err);
  }
});

// 6. ALIŞKANLIK SİLME
app.delete('/api/habits/:id', async (req, res) => {
  try {
    await Habit.findByIdAndDelete(req.params.id);
    res.status(200).json("Alışkanlık başarıyla silindi.");
  } catch (err) {
    res.status(500).json(err);
  }
});

// 7. ALIŞKANLIK HEDEFLERİNİ GÜNCELLEME
app.put('/api/habits/:id/goals', async (req, res) => {
  try {
    const habit = await Habit.findById(req.params.id);
    habit.goals = req.body.goals;
    await habit.save();
    res.status(200).json(habit);
  } catch (err) {
    res.status(500).json(err);
  }
});

// Sunucuyu Başlat
app.listen(5000, () => {
  console.log('🚀 Sunucu 5000 portunda çalışıyor...');
});