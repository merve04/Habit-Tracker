const mongoose = require('mongoose');

const HabitSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { type: String, required: true }, // Örn: "Su İçme"
  
  // Kullanıcının belirlediği hedefler ve renkler
  // Örn: [{ min: 1, color: "blue" }, { min: 2, color: "red" }]
  goals: [{
    targetValue: Number, // 1 (litre)
    color: String        // "blue"
  }],

  // Takvimde görünecek geçmiş kayıtlar
  logs: [{
    date: { type: String }, // "2023-10-27" formatında tutacağız
    value: { type: Number } // O gün ne kadar yaptı? Örn: 2
  }],

  // Güncel Streak (Seri) sayısı
  streak: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model('Habit', HabitSchema);