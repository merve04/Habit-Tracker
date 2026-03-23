import { useState } from 'react';
import axios from 'axios';
import { 
  FiMail, FiLock, FiUser, FiLogIn, FiUserPlus, 
  FiArrowRight, FiCheckCircle, FiAlertCircle 
} from 'react-icons/fi';
import { FaBrain, FaChartLine, FaCalendarCheck } from 'react-icons/fa';

// Görseli buradan import ediyoruz
import userAvatar from './44.png'; 

export default function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);

  const API_URL = "http://localhost:5000/api/auth";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        setMessage({ 
          text: "Giriş Başarılı! Yönlendiriliyorsunuz...", 
          type: "success" 
        });
        setTimeout(() => onLogin(res.data), 1500);
      } else {
        await axios.post(`${API_URL}/register`, { username, email, password });
        setMessage({ 
          text: "Kayıt Başarılı! Şimdi giriş yapabilirsiniz.", 
          type: "success" 
        });
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data || "Sunucuya ulaşılamadı.", 
        type: "error" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Sol Taraf - Hero Section */}
      <div style={styles.heroSection}>
        <div style={styles.heroContent}>
          <div style={styles.logo}>
            <FaBrain size={40} color="#6366f1" />
            <span style={styles.logoText}>HabitFlow</span>
          </div>
          
          <h1 style={styles.heroTitle}>
            Alışkanlıklarını <span style={styles.gradientText}>Güçlendir</span>
          </h1>
          
          <p style={styles.heroSubtitle}>
            Hedeflerine ulaşman için ihtiyacın olan tüm araçlar bir arada
          </p>

          <div style={styles.features}>
            {[
              { icon: FaChartLine, text: "İlerlemeni Takip Et" },
              { icon: FaCalendarCheck, text: "Günlük Hatırlatıcılar" },
              { icon: FaBrain, text: "Kişisel Analizler" }
            ].map((feature, index) => (
              <div key={index} style={styles.featureItem}>
                <feature.icon size={20} color="#6366f1" />
                <span style={styles.featureText}>{feature.text}</span>
              </div>
            ))}
          </div>

          <div style={styles.testimonial}>
            <div style={styles.testimonialStars}>★★★★★</div>
            <p style={styles.testimonialText}>
              "HabitFlow ile her güb Burak ile birlikte gençofiste bu uygulamayı kullanarak yazılımcı oldum."
            </p>
            <div style={styles.testimonialAuthor}>
              <img 
                src={userAvatar} // Import edilen değişkeni burada kullandık
                alt="user" 
                style={styles.testimonialAvatar}
              />
              <div>
                <p style={styles.testimonialName}>Ahmet Sefa Ayaz</p>
                <p style={styles.testimonialTitle}>Mid Level Developer</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sağ Taraf - Auth Form */}
      <div style={styles.authSection}>
        <div style={styles.authCard}>
          <div style={styles.authHeader}>
            <h2 style={styles.authTitle}>
              {isLogin ? "Hoş Geldiniz" : "Hesap Oluşturun"}
            </h2>
            <p style={styles.authSubtitle}>
              {isLogin 
                ? "Devam etmek için giriş yapın" 
                : "Ücretsiz hesap oluşturun ve başlayın"}
            </p>
          </div>

          {message.text && (
            <div style={{
              ...styles.message,
              backgroundColor: message.type === 'success' ? '#ecfdf5' : '#fef2f2',
              borderColor: message.type === 'success' ? '#34d399' : '#f87171',
              color: message.type === 'success' ? '#065f46' : '#991b1b'
            }}>
              {message.type === 'success' ? 
                <FiCheckCircle size={18} /> : 
                <FiAlertCircle size={18} />
              }
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            {!isLogin && (
              <div style={styles.inputGroup}>
                <FiUser style={styles.inputIcon} size={18} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  style={styles.input}
                  required
                />
              </div>
            )}

            <div style={styles.inputGroup}>
              <FiMail style={styles.inputIcon} size={18} color="#9ca3af" />
              <input
                type="email"
                placeholder="Email Adresi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <FiLock style={styles.inputIcon} size={18} color="#9ca3af" />
              <input
                type="password"
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            {isLogin && (
              <div style={styles.forgotPassword}>
                <a href="#" style={styles.forgotPasswordLink}>
                  Şifremi unuttum
                </a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                ...styles.submitButton,
                opacity: isLoading ? 0.7 : 1,
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                "İşleniyor..."
              ) : (
                <>
                  {isLogin ? "Giriş Yap" : "Hesap Oluştur"}
                  <FiArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div style={styles.divider}>
            <span style={styles.dividerText}>veya</span>
          </div>

          <button style={styles.googleButton}>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              style={styles.googleIcon}
            />
            Google ile devam et
          </button>

          <div style={styles.switchMode}>
            <p style={styles.switchModeText}>
              {isLogin ? "Hesabın yok mu?" : "Zaten hesabın var mı?"}
            </p>
            <button
              onClick={() => setIsLogin(!isLogin)}
              style={styles.switchModeButton}
            >
              {isLogin ? "Ücretsiz Kaydol" : "Giriş Yap"}
              <FiArrowRight size={14} />
            </button>
          </div>

          <p style={styles.terms}>
            Devam ederek{' '}
            <a href="#" style={styles.termsLink}>Kullanım Şartları</a> 
            {' '}ve{' '}
            <a href="#" style={styles.termsLink}>Gizlilik Politikası</a>'nı kabul etmiş olursunuz.
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  heroSection: {
    flex: 1,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },
  heroContent: {
    maxWidth: '500px',
    color: 'white',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '40px',
  },
  logoText: {
    fontSize: '24px',
    fontWeight: 'bold',
  },
  heroTitle: {
    fontSize: '48px',
    fontWeight: '800',
    marginBottom: '20px',
    lineHeight: 1.2,
  },
  gradientText: {
    background: 'linear-gradient(135deg, #f6d5f7 0%, #fbe9d7 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  heroSubtitle: {
    fontSize: '18px',
    marginBottom: '40px',
    opacity: 0.9,
    lineHeight: 1.6,
  },
  features: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '60px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  featureText: {
    fontSize: '16px',
  },
  testimonial: {
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '12px',
    padding: '20px',
  },
  testimonialStars: {
    color: '#FFD700',
    marginBottom: '10px',
  },
  testimonialText: {
    fontSize: '14px',
    lineHeight: 1.6,
    marginBottom: '15px',
    fontStyle: 'italic',
  },
  testimonialAuthor: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  testimonialAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  testimonialName: {
    fontSize: '14px',
    fontWeight: '600',
  },
  testimonialTitle: {
    fontSize: '12px',
    opacity: 0.8,
  },
  authSection: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    backgroundColor: '#f9fafb',
  },
  authCard: {
    maxWidth: '400px',
    width: '100%',
    padding: '40px',
    backgroundColor: 'white',
    borderRadius: '20px',
    boxShadow: '0 20px 40px rgba(0,0,0,0.08)',
  },
  authHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  authTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '8px',
  },
  authSubtitle: {
    fontSize: '14px',
    color: '#6b7280',
  },
  message: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px',
    borderRadius: '8px',
    marginBottom: '20px',
    borderWidth: '1px',
    borderStyle: 'solid',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },
  inputGroup: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputIcon: {
    position: 'absolute',
    left: '12px',
  },
  input: {
    width: '100%',
    padding: '12px 12px 12px 40px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none',
  },
  forgotPassword: {
    textAlign: 'right',
  },
  forgotPasswordLink: {
    fontSize: '13px',
    color: '#6366f1',
    textDecoration: 'none',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: '#6366f1',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'background-color 0.3s',
  },
  divider: {
    position: 'relative',
    textAlign: 'center',
    margin: '20px 0',
  },
  dividerText: {
    position: 'relative',
    backgroundColor: 'white',
    padding: '0 10px',
    fontSize: '12px',
    color: '#9ca3af',
  },
  googleButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginBottom: '20px',
  },
  googleIcon: {
    width: '18px',
    height: '18px',
  },
  switchMode: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  switchModeText: {
    fontSize: '14px',
    color: '#6b7280',
  },
  switchModeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    color: '#6366f1',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  terms: {
    marginTop: '20px',
    fontSize: '12px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  termsLink: {
    color: '#6b7280',
    textDecoration: 'none',
  },
};