const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Gerçek projede şifreler hash'lenmeli ama şimdilik düz tutuyoruz.
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);