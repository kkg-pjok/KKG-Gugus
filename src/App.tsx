import React, { useState, useEffect } from 'react';
import { storage } from './utils/storage';
import { db, supabaseStatus } from './utils/supabase';
import { TentangKami, ProgramKerja, Informasi, DokumenGaleri, Materi, MateriUser, User as UserType, ChatMessage } from './types';
import LandingPage from './components/LandingPage';
import AuthLayout from './components/AuthLayout';
import AdminPortal from './components/AdminPortal';
import UserPortal from './components/UserPortal';

export default function App() {
  // Navigation Router state: 'landing' | 'login' | 'dashboard'
  const [view, setView] = useState<'landing' | 'login' | 'dashboard'>('landing');
  
  // App-wide Persistent States
  const [tentangKami, setTentangKami] = useState<TentangKami[]>([]);
  const [programKerja, setProgramKerja] = useState<ProgramKerja[]>([]);
  const [informasi, setInformasi] = useState<Informasi[]>([]);
  const [galeri, setGaleri] = useState<DokumenGaleri[]>([]);
  const [materi, setMateri] = useState<Materi[]>([]);
  const [materiUser, setMateriUser] = useState<MateriUser[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [chats, setChats] = useState<ChatMessage[]>([]);

  // Supabase Connection/Table configuration status
  const [supabaseStatusState, setSupabaseStatusState] = useState<{
    isConnected: boolean;
    missingTables: string[];
  }>({ isConnected: true, missingTables: [] });

  // Current session state
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Load real-time data from Supabase or fallback
  const loadSupabaseData = async () => {
    try {
      const dbTk = await db.getTentangKami(storage.getTentangKami());
      setTentangKami(dbTk);
      storage.saveTentangKami(dbTk);

      const dbPk = await db.getProgramKerja(storage.getProgramKerja());
      setProgramKerja(dbPk);
      storage.saveProgramKerja(dbPk);

      const dbInfo = await db.getInformasi(storage.getInformasi());
      setInformasi(dbInfo);
      storage.saveInformasi(dbInfo);

      const dbG = await db.getDokumenGaleri(storage.getDokumenGaleri());
      setGaleri(dbG);
      storage.saveDokumenGaleri(dbG);

      const dbMat = await db.getMateri(storage.getMateri());
      setMateri(dbMat);
      storage.saveMateri(dbMat);

      const dbMatUser = await db.getMateriUser(storage.getMateriUser());
      setMateriUser(dbMatUser);
      storage.saveMateriUser(dbMatUser);

      const dbUsr = await db.getUsers(storage.getUsers());
      setUsers(dbUsr);
      storage.saveUsers(dbUsr);

      const dbCh = await db.getChats(storage.getChats());
      setChats(dbCh);
      storage.saveChats(dbCh);

      setSupabaseStatusState({
        isConnected: true,
        missingTables: [...supabaseStatus.missingTables],
      });
    } catch (err) {
      console.error("Error loading initial data from Supabase:", err);
      setSupabaseStatusState({
        isConnected: false,
        missingTables: [...supabaseStatus.missingTables],
      });
    }
  };

  // Initialize all databases from local storage once on mount
  useEffect(() => {
    // Phase 1: fast cache loading for high-performance visual experience
    setTentangKami(storage.getTentangKami());
    setProgramKerja(storage.getProgramKerja());
    setInformasi(storage.getInformasi());
    setGaleri(storage.getDokumenGaleri());
    setMateri(storage.getMateri());
    setMateriUser(storage.getMateriUser());
    setUsers(storage.getUsers());
    setChats(storage.getChats());

    // Recover user session if exists and is valid
    const sessionData = localStorage.getItem('kkg_session');
    if (sessionData) {
      try {
        let parsed = JSON.parse(sessionData);
        if (parsed && typeof parsed === 'object' && parsed.id && parsed.nama && parsed.role) {
          if (parsed.sekolah) {
            const orig = parsed.sekolah;
            if (parsed.sekolah === "UPTD SDN 2 Padaawas" || parsed.sekolah === "UPTD SD N 2 Padaawas") {
              parsed.sekolah = "";
            } else if (parsed.sekolah.startsWith("UPTD ")) {
              parsed.sekolah = parsed.sekolah.replace(/^UPTD\s+/i, '').trim();
            }
            if (parsed.sekolah !== orig) {
              localStorage.setItem('kkg_session', JSON.stringify(parsed));
            }
          }
          setCurrentUser(parsed);
          setView('dashboard');
        } else {
          localStorage.removeItem('kkg_session');
        }
      } catch (e) {
        localStorage.removeItem('kkg_session');
      }
    }

    // Phase 2: Pull fresh data from cloud Supabase asynchronously
    loadSupabaseData();
  }, []);

  // --- PERSISTENCE WRAPPER SYNCERS ---

  const handleUpdateTentangKami = (updated: TentangKami[]) => {
    setTentangKami(updated);
    storage.saveTentangKami(updated);
    db.saveTentangKami(updated);
  };

  const handleUpdateProgramKerja = (updated: ProgramKerja[]) => {
    setProgramKerja(updated);
    storage.saveProgramKerja(updated);
    db.saveProgramKerja(updated);
  };

  const handleUpdateInformasi = (updated: Informasi[]) => {
    setInformasi(updated);
    storage.saveInformasi(updated);
    db.saveInformasi(updated);
  };

  const handleUpdateGaleri = (updated: DokumenGaleri[]) => {
    setGaleri(updated);
    storage.saveDokumenGaleri(updated);
    db.saveDokumenGaleri(updated);
  };

  const handleUpdateMateri = (updated: Materi[]) => {
    setMateri(updated);
    storage.saveMateri(updated);
    db.saveMateri(updated);
  };

  const handleUpdateMateriUser = async (updated: MateriUser[]) => {
    setMateriUser(updated);
    storage.saveMateriUser(updated);
    await db.saveMateriUser(updated);
  };

  const handleUpdateUsers = (updated: UserType[]) => {
    setUsers(updated);
    storage.saveUsers(updated);
    db.saveUsers(updated);
    
    // If the currently edited user is ourselves, sync session also!
    if (currentUser) {
      const freshSelf = updated.find(u => u.id === currentUser.id);
      if (freshSelf) {
        setCurrentUser(freshSelf);
        localStorage.setItem('kkg_session', JSON.stringify(freshSelf));
      }
    }
  };

  const handleUpdateChats = (updated: ChatMessage[]) => {
    setChats(updated);
    storage.saveChats(updated);
    db.saveChats(updated);
  };

  // --- PORTAL ROUTINGS ---

  const handleLoginSuccess = (userSession: UserType) => {
    setCurrentUser(userSession);
    localStorage.setItem('kkg_session', JSON.stringify(userSession));
    setView('dashboard');

  };

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const executeLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('kkg_session');
    setView('landing');
    setShowLogoutModal(false);
  };

  const handleRegisterUser = (newUser: UserType) => {
    const updatedUsers = [...users, newUser];
    handleUpdateUsers(updatedUsers);
  };

  const handleUpdateCurrentUserDirectly = (updatedSelf: UserType) => {
    setCurrentUser(updatedSelf);
    localStorage.setItem('kkg_session', JSON.stringify(updatedSelf));

    // Also update this profile info in our users registry
    const updatedUsers = users.map(u => u.id === updatedSelf.id ? updatedSelf : u);
    handleUpdateUsers(updatedUsers);
  };

  return (
    <div className="w-full min-h-screen bg-slate-50">
      
      {/* 1. PUBLIC LANDING PAGE */}
      {view === 'landing' && (
        <LandingPage
          onEnterPortal={() => setView('login')}
          isLoggedIn={currentUser !== null}
          currentUserRole={currentUser?.role}
          onGoToDashboard={() => setView('dashboard')}
          tentangKami={tentangKami}
          programKerja={programKerja}
          informasi={informasi}
          galeri={galeri}
          totalUsers={users.length}
          totalMateri={materi.length}
        />
      )}

      {/* 2. AUTHENTICATION & REGISTRATION SCREEN */}
      {view === 'login' && (
        <AuthLayout
          onBackToLanding={() => setView('landing')}
          onLoginSuccess={handleLoginSuccess}
          users={users}
          onRegisterUser={handleRegisterUser}
        />
      )}

      {/* 3. WORKING PORTAL SUITES */}
      {view === 'dashboard' && currentUser && (
        currentUser.role === 'admin' ? (
          <AdminPortal
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUserDirectly}
            onLogout={handleLogout}
            users={users}
            onSaveUsers={handleUpdateUsers}
            tentangKami={tentangKami}
            onSaveTentangKami={handleUpdateTentangKami}
            programKerja={programKerja}
            onSaveProgramKerja={handleUpdateProgramKerja}
            informasi={informasi}
            onSaveInformasi={handleUpdateInformasi}
            galeri={galeri}
            onSaveGaleri={handleUpdateGaleri}
            materi={materi}
            onSaveMateri={handleUpdateMateri}
            materiUser={materiUser}
            onSaveMateriUser={handleUpdateMateriUser}
            chats={chats}
            onSaveChats={handleUpdateChats}
            supabaseStatus={supabaseStatusState}
            onReloadSupabaseData={loadSupabaseData}
          />
        ) : (
          <UserPortal
            currentUser={currentUser}
            onUpdateCurrentUser={handleUpdateCurrentUserDirectly}
            onLogout={handleLogout}
            informasi={informasi}
            materi={materi}
            onSaveMateri={handleUpdateMateri}
            materiUser={materiUser}
            onSaveMateriUser={handleUpdateMateriUser}
            chats={chats}
            onSaveChats={handleUpdateChats}
            supabaseStatus={supabaseStatusState}
          />
        )
      )}

      {/* Modern custom logout confirmation modal - bypasses browser-blocking iframe restriction */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-all duration-300">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 text-sm shrink-0 font-bold">
              ⚠️
            </div>
            <h3 className="text-center text-lg font-black text-slate-900 uppercase tracking-wide">
              Konfirmasi Keluar
            </h3>
            <p className="text-center text-xs text-slate-500 mt-2 leading-relaxed">
              Apakah Anda yakin ingin keluar dari sistem KKG Gugus Padaawas? Anda harus log in kembali untuk mengakses data dashboard.
            </p>
            <div className="mt-6 flex gap-3 w-full">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer text-center"
              >
                Batal / Kembali
              </button>
              <button
                onClick={executeLogout}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 transition-colors cursor-pointer text-center"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
