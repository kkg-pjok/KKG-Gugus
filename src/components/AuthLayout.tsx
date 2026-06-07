import React, { useState, useRef } from 'react';
import { User as UserType } from '../types';
import { Eye, EyeOff, Shield, User, School, FileText, Lock, Key, ArrowLeft, Upload, CheckCircle, Mail, Loader2 } from 'lucide-react';
import { supabase } from '../utils/supabase';

interface AuthLayoutProps {
  onBackToLanding: () => void;
  onLoginSuccess: (user: UserType) => void;
  users: UserType[];
  onRegisterUser: (newUser: UserType) => void;
}

export default function AuthLayout({ onBackToLanding, onLoginSuccess, users, onRegisterUser }: AuthLayoutProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot_password'>('login');
  const [isLoading, setIsLoading] = useState(false);
  
  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Registration state
  const [regEmail, setRegEmail] = useState('');
  const [regName, setRegName] = useState('');
  const [regSchool, setRegSchool] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regNip, setRegNip] = useState('');
  const [regJabatan, setRegJabatan] = useState('Guru Kelas');
  const [regFoto, setRegFoto] = useState('');
  const [regError, setRegError] = useState('');
  const [isRegSuccess, setIsRegSuccess] = useState(false);

  // Forgot Password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotSent, setForgotSent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle Login validation
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoading(true);

    if (!loginUsername) {
      setLoginError('Harap masukkan Username atau Email Anda!');
      setIsLoading(false);
      return;
    }

    if (!loginPassword) {
      setLoginError('Harap masukkan kata sandi Anda!');
      setIsLoading(false);
      return;
    }

    const inputVal = loginUsername.trim();

    try {
      // 1. If it looks like an email address, use Supabase Auth
      if (inputVal.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: inputVal,
          password: loginPassword,
        });

        if (error) {
          throw new Error(error.message === 'Invalid login credentials' 
            ? 'Email atau password Supabase salah.' 
            : error.message);
        }

        if (data && data.user) {
          // Check if custom user exists in our DB table
          let matchedUser = users.find(u => u.email?.toLowerCase() === inputVal.toLowerCase() || u.id === data.user.id);
          
          if (!matchedUser) {
            // Fetch user profile again from cloud users database table
            try {
              const { data: dbUser } = await supabase.from('users').select('*').eq('id', data.user.id).maybeSingle();
              if (dbUser) {
                matchedUser = {
                  id: dbUser.id,
                  nama: dbUser.nama || '',
                  sekolah: dbUser.sekolah || '',
                  username: dbUser.username || '',
                  password: dbUser.password || '',
                  nip: dbUser.nip || '',
                  jabatan: dbUser.jabatan || '',
                  foto: dbUser.foto || '',
                  role: (dbUser.role === 'admin' ? 'admin' : 'user'),
                  email: dbUser.email || data.user.email
                };
              }
            } catch (err) {
              console.error('Failed to retrieve user profile from DB table during login:', err);
            }
          }

          if (!matchedUser) {
            // Build fallback user object from Supabase Auth metadata
            matchedUser = {
              id: data.user.id,
              nama: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'Guru Anggota',
              sekolah: data.user.user_metadata?.school || '',
              username: data.user.user_metadata?.username || data.user.email?.split('@')[0] || 'guru',
              password: '', 
              nip: data.user.user_metadata?.nip || '',
              jabatan: data.user.user_metadata?.jabatan || 'Guru Kelas',
              foto: data.user.user_metadata?.photo || '',
              role: 'user',
              email: data.user.email
            };
          }

          onLoginSuccess(matchedUser);
        }
      } else {
        // 2. Otherwise use local fallback
        const matchedUser = users.find(
          u => u.username.toLowerCase() === inputVal.toLowerCase() && 
          u.password === loginPassword
        );

        if (matchedUser) {
          onLoginSuccess(matchedUser);
        } else {
          setLoginError('Username atau password tidak cocok (atau coba gunakan masukan Email).');
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Gagal masuk. Silakan periksa koneksi internet Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert uploaded image to Base64
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setRegFoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  // Handle self registration for Guru
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');
    setIsLoading(true);

    if (!regEmail || !regName || !regSchool || !regUsername || !regPassword || !regNip) {
      setRegError('Kecuali Foto, semua kolom termasuk Email wajib diisi dengan lengkap!');
      setIsLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setRegError('Kata sandi keamanan Supabase minimal harus sepanjang 6 karakter!');
      setIsLoading(false);
      return;
    }

    // Check locally if username already exists
    const exists = users.some(u => u.username.toLowerCase() === regUsername.toLowerCase().trim() || u.email?.toLowerCase() === regEmail.toLowerCase().trim());
    if (exists) {
      setRegError('Username atau Email tersebut sudah digunakan oleh guru lain!');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sign up through Supabase Authentication
      const { data, error } = await supabase.auth.signUp({
        email: regEmail.trim(),
        password: regPassword,
        options: {
          data: {
            name: regName,
            school: regSchool,
            username: regUsername.trim(),
            nip: regNip,
            jabatan: regJabatan,
            photo: regFoto
          }
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      const uid = data.user?.id || `usr-${Date.now()}`;

      // 2. Create the User object
      const newUser: UserType = {
        id: uid,
        nama: regName,
        sekolah: regSchool,
        username: regUsername.trim(),
        password: regPassword,
        nip: regNip,
        jabatan: regJabatan,
        foto: regFoto, // base64 string
        role: 'user',
        email: regEmail.trim()
      };

      // 3. Register user locally & cloud tables
      onRegisterUser(newUser);
      setIsRegSuccess(true);
      
      // Auto redirect after 3.5s
      setTimeout(() => {
        setIsRegSuccess(false);
        setMode('login');
        setLoginUsername(regEmail); // pre-populate with registered email
        setLoginPassword(regPassword);
        // reset registration form
        setRegEmail('');
        setRegName('');
        setRegSchool('');
        setRegUsername('');
        setRegPassword('');
        setRegNip('');
        setRegFoto('');
      }, 3500);

    } catch (err: any) {
      setRegError(err.message || 'Gagal mendaftar ke Supabase.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle real forgot password
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotSent(true);
    setIsLoading(true);

    try {
      await supabase.auth.resetPasswordForEmail(forgotEmail.trim(), {
        redirectTo: window.location.origin
      });
    } catch (err) {
      console.warn('Forgot password request failed:', err);
    } finally {
      setIsLoading(false);
    }

    setTimeout(() => {
      setForgotSent(false);
      setMode('login');
      setForgotEmail('');
    }, 6000);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-cover bg-center relative font-sans"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url("https://i.imgur.com/pQjcPSP.png")`,
        backgroundAttachment: 'fixed'
      }}
    >
      
      {/* Absolute Back Link */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 md:left-12 flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-4 py-2 rounded-xl transition-all border border-white/10 backdrop-blur-xs text-xs md:text-sm font-semibold cursor-pointer select-none"
      >
        <ArrowLeft className="w-4 h-4 text-white" />
        Kembali ke Halaman Utama
      </button>

      {/* Main card panel */}
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-white/25 transition-all text-slate-800 p-6 md:p-10 my-12 relative">
        
        {/* Dynamic header */}
        <div className="flex flex-col items-center text-center pb-6 border-b border-gray-150 mb-6">
          <div className="w-14 h-14 bg-white rounded-2xl overflow-hidden border border-gray-200 flex items-center justify-center p-1 shadow-lg shadow-sky-500/5 mb-4 rotate-3 animate-pulse">
            <img 
              src="https://i.imgur.com/Q0wCTRY.png" 
              alt="Logo KKG Gugus Padaawas" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-[#0f172a] uppercase tracking-wide">
            {mode === 'login' && 'PORTAL ANGGOTA KKG'}
            {mode === 'register' && 'REGISTRASI ANGGOTA BARU'}
            {mode === 'forgot_password' && 'RESET PASSWORD GURU'}
          </h2>
          <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
            {mode === 'login' && 'Asosiasi Kelompok Kerja Guru Kecamatan Pasirwangi, Garut'}
            {mode === 'register' && 'Daftarkan akun Guru/User secara instan untuk berkolaborasi'}
            {mode === 'forgot_password' && 'Dapatkan bantuan pemulihan kata sandi akun KKG Anda'}
          </p>
        </div>

        {/* LOGIN MODE */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {loginError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Email / Username / NIP Guru
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder="Contoh: email@domain.com atau admin"
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                  Password Keamanan
                </label>
                <button
                  type="button"
                  onClick={() => setMode('forgot_password')}
                  className="text-xs text-orange-600 hover:text-orange-800 hover:underline font-bold"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan kata sandi Anda..."
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-10 py-2.5 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-extrabold text-sm md:text-base tracking-wide uppercase cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              id="login-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Memproses Masuk...</span>
                </>
              ) : (
                'Login'
              )}
            </button>

            <div className="flex flex-col items-center gap-2 pt-4 border-t border-gray-150 text-xs">
              <p className="text-slate-500 font-medium">Belum memiliki akun guru di gugus kami?</p>
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-[#10b981] hover:text-emerald-700 hover:underline font-extrabold"
              >
                Daftar Akun Guru Baru Disini
              </button>
            </div>

            <div className="flex justify-center border-t border-gray-100 pt-4 text-[10px] text-slate-400 font-medium">
              <span>@Privacy Policy - Akses dilindungi</span>
            </div>

          </form>
        )}

        {/* REGISTRATION GURU MODE */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            
            {regError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl text-center">
                ⚠️ {regError}
              </div>
            )}

            {isRegSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 text-green-800 text-xs font-bold rounded-xl flex items-center justify-center gap-2.5 text-center shadow-xs">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 animate-bounce" />
                <div>
                  <p className="font-extrabold text-sm text-emerald-800">REGISTRASI BERHASIL!</p>
                  <p className="font-normal text-emerald-600 mt-0.5">Sistem mengalihkan ke form masuk secara otomatis...</p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Email Akun (Supabase Auth)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="w-3.5 h-3.5" />
                </span>
                <input
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="Contoh: nama_anda@domain.com"
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Nama Lengkap & Gelar</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Contoh: Drs. Tatang Sutisna, M.Pd."
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">NIP Pegawai Negeri (NIP)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-3.5 h-3.5" />
                </span>
                <input
                  type="text"
                  value={regNip}
                  onChange={(e) => setRegNip(e.target.value)}
                  placeholder="Contoh: 198205122010041001"
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Asal Sekolah</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <School className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={regSchool}
                    onChange={(e) => setRegSchool(e.target.value)}
                    placeholder="Contoh: SDN 3 Padaawas"
                    className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Jabatan</label>
                <select
                  value={regJabatan}
                  onChange={(e) => setRegJabatan(e.target.value)}
                  className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl px-3 py-2 outline-none text-sm transition-all"
                >
                  <option value="Guru Kelas">Guru Kelas</option>
                  <option value="Guru Kelas Utama">Guru Kelas Utama</option>
                  <option value="Pendidik Kelas">Pendidik Kelas</option>
                  <option value="Sekretaris Gugus">Sekretaris Gugus</option>
                  <option value="Pengurus KKG">Pengurus KKG</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Username Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    placeholder="Contoh: guru_tatang"
                    className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Lock className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-[#0284c7] focus:ring-2 focus:ring-sky-200 rounded-xl pl-10 pr-4 py-2 outline-none text-sm transition-all"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Photo input is strictly deskop upload as base64 format */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                Foto Profil Guru (Upload dari Komputer/HP)
              </label>
              
              <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-gray-200">
                <div className="w-12 h-12 rounded-full border border-gray-350 bg-gray-200 shrink-0 flex items-center justify-center overflow-hidden">
                  {regFoto ? (
                    <img src={regFoto} alt="Avatar Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-slate-600 truncate font-semibold">
                    {regFoto ? 'Foto Anda terkonversi sebagai file offline' : 'Belum memilih berkas foto'}
                  </p>
                  <p className="text-[10px] text-gray-400">Dukungan format: PNG, JPG, GIF hingga 2MB</p>
                </div>

                <button
                  type="button"
                  onClick={handleTriggerUpload}
                  className="px-3 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-bold text-slate-700 flex items-center gap-1 shrink-0 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5 text-gray-600" />
                  Pilih Foto
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handlePhotoSelect}
                  className="hidden"
                  id="reg-avatar-upload"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-xl shadow-md font-extrabold text-sm uppercase tracking-wide cursor-pointer flex items-center justify-center gap-2 disabled:bg-slate-300 disabled:cursor-not-allowed"
              id="signup-submit-btn"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mendaftarkan Guru...</span>
                </>
              ) : (
                'Daftar Sekarang'
              )}
            </button>

            <div className="text-center pt-4 border-t border-gray-150">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-[#0284c7] hover:text-[#0369a1] hover:underline font-bold"
              >
                Sudah punya akun? Masuk disini
              </button>
            </div>

          </form>
        )}

        {/* FORGOT PASSWORD GURU MODE */}
        {mode === 'forgot_password' && (
          <form onSubmit={handleForgotSubmit} className="space-y-4">
            {forgotSent ? (
              <div className="p-4 bg-[#fffbeb] border border-amber-200 text-[#78350f] text-xs font-semibold rounded-xl space-y-2.5 shadow-sm text-center">
                <CheckCircle className="w-6 h-6 text-amber-500 mx-auto" />
                <h4 className="font-bold text-sm text-amber-800">INTRUKSI DIKIRIMKAN!</h4>
                <p className="leading-relaxed">
                  Permintaan reset password telah dikirim ke email Supabase Anda! Periksa kotak masuk untuk instruksi pemulihan. Silakan juga hubungi Bapak H. Cecep Supriatna, S.Pd. selaku Ketua KKG jika membutuhkan bantuan manual.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-xs text-slate-500 leading-relaxed bg-amber-50/50 p-3 rounded-xl border border-amber-100/50">
                  Masukkan email akun Supabase terdaftar Anda untuk mengirim tautan pemulihan kata sandi KKG secara langsung.
                </p>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">
                    Email Akun Terdaftar
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="Contoh: guru.kerja@email.com"
                      className="w-full bg-slate-50 focus:bg-white text-slate-800 border border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-100 rounded-xl pl-10 pr-4 py-2.5 outline-none text-sm transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="py-2.5 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                  >
                    Kembali Masuk
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="py-2.5 bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-extrabold rounded-xl text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kirim Link Reset'}
                  </button>
                </div>
              </div>
            )}
          </form>
        )}

      </div>
    </div>
  );
}
