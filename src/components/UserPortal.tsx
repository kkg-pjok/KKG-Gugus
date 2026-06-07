import React, { useState, useRef } from 'react';
import { 
  FileText, MessageSquare, ExternalLink, ShieldCheck, Edit, LogOut, 
  ChevronLeft, ChevronRight, BookOpen, User, Check, Menu, X, ArrowUpRight,
  AlertCircle, Search, Upload, Trash2
} from 'lucide-react';
import { 
  Informasi, Materi, MateriUser, User as UserType, ChatMessage 
} from '../types';
import ChatRoom from './ChatRoom';
import PdfPreviewModal from './PdfPreviewModal';
import { openNativePreview } from '../utils/preview';

interface UserPortalProps {
  currentUser: UserType;
  onUpdateCurrentUser: (updated: UserType) => void;
  onLogout: () => void;
  informasi: Informasi[];
  materi: Materi[];
  onSaveMateri?: (list: Materi[]) => void;
  materiUser: MateriUser[];
  onSaveMateriUser?: (list: MateriUser[]) => void;
  chats: ChatMessage[];
  onSaveChats: (updatedChats: ChatMessage[]) => void;
  supabaseStatus?: { isConnected: boolean; missingTables: string[] };
}

export default function UserPortal({
  currentUser,
  onUpdateCurrentUser,
  onLogout,
  informasi,
  materi,
  onSaveMateri,
  materiUser = [],
  onSaveMateriUser,
  chats,
  onSaveChats,
  supabaseStatus = { isConnected: true, missingTables: [] }
}: UserPortalProps) {
  
  const [activeTab, setActiveTab] = useState<string>('informasi');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedPdfItem, setSelectedPdfItem] = useState<{ name: string; title: string } | null>(null);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Profile Edit fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profName, setProfName] = useState(currentUser.nama);
  const [profNip, setProfNip] = useState(currentUser.nip);
  const [profSchool, setProfSchool] = useState(currentUser.sekolah);
  const [profJabatan, setProfJabatan] = useState(currentUser.jabatan);
  const [profFoto, setProfFoto] = useState(currentUser.foto);

  // Pagination setups (View Only)
  const limit = 5;
  const materiLimit = 10;
  const [currPageInfo, setCurrPageInfo] = useState(1);
  const [currPageMat, setCurrPageMat] = useState(1);

  // New Pustaka Digital Form States
  const [formMapel, setFormMapel] = useState('');
  const [formKelas, setFormKelas] = useState('Kelas 1');
  const [formNamaFile, setFormNamaFile] = useState('');
  const [formJudulFile, setFormJudulFile] = useState('');
  const [formFileType, setFormFileType] = useState<'pdf' | 'word'>('pdf');
  const [formFileName, setFormFileName] = useState('');
  const [formFileBase64, setFormFileBase64] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [isSavingMat, setIsSavingMat] = useState(false);

  // Search & Filter States
  const [searchMapel, setSearchMapel] = useState('');
  const [searchNamaFile, setSearchNamaFile] = useState('');

  // Sub-tab under 'materi': 'bawaan' (shared library templates) | 'unggahan' (user uploaded templates)
  const [materiSubTab, setMateriSubTab] = useState<'bawaan' | 'unggahan'>('unggahan');

  const handleUpdateProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = {
      ...currentUser,
      nama: profName,
      nip: profNip,
      sekolah: profSchool,
      jabatan: profJabatan,
      foto: profFoto
    };
    onUpdateCurrentUser(updated);
    setIsEditingProfile(false);
    setShowProfileDropdown(false);
  };

  const handleProfilePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfFoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const paginate = (items: any[], currentPage: number) => {
    const start = (currentPage - 1) * limit;
    return items.slice(start, start + limit);
  };

  // Filter materi list based on search filters
  const filteredMateri = materi.filter(item => {
    const itemMapel = (item.mapel || 'Umum').toLowerCase();
    const matchMapel = itemMapel.includes(searchMapel.toLowerCase());
    
    const itemFileName = (item.namaFile || item.pdfName || '').toLowerCase();
    const matchFileName = itemFileName.includes(searchNamaFile.toLowerCase());
    
    return matchMapel && matchFileName;
  });

  const filteredMateriUser = (materiUser || []).filter(item => {
    const itemMapel = (item.mapel || 'Umum').toLowerCase();
    const matchMapel = itemMapel.includes(searchMapel.toLowerCase());
    
    const itemFileName = (item.namaFile || item.pdfName || '').toLowerCase();
    const matchFileName = itemFileName.includes(searchNamaFile.toLowerCase());
    
    return matchMapel && matchFileName;
  });

  const paginateMateri = (items: any[], currentPage: number) => {
    const start = (currentPage - 1) * materiLimit;
    return items.slice(start, start + materiLimit);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans relative">
      
      {/* Top Navbar Header - Z-INDEX 50 is configured for dropdown prevent overlays */}
      <header className="h-16 bg-white border-b border-gray-200 sticky top-0 flex items-center justify-between px-6 z-30 shadow-xs">
        
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-gray-200 flex items-center justify-center p-0.5 shadow-md">
            <img 
              src="https://i.imgur.com/Q0wCTRY.png" 
              alt="Logo KKG Gugus Padaawas" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h2 className="text-xs md:text-sm font-black text-slate-900 leading-tight uppercase tracking-wider">
              PORTAL ANGGOTA KKG
            </h2>
            <p className="text-[9px] text-[#0284c7] font-extrabold tracking-widest uppercase">
              RUANG KERJA GURU
            </p>
          </div>
        </div>

        {/* Profile Control */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 transition-colors cursor-pointer"
            id="user-profile-trigger"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden border border-indigo-500 shadow-inner">
              {currentUser.foto ? (
                <img src={currentUser.foto} alt={currentUser.nama} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.nama.substring(0, 1)}</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight truncate max-w-[125px]">{currentUser.nama}</span>
              <span className="text-[9px] text-gray-400 leading-none">{currentUser.sekolah}</span>
            </div>
          </button>

          {/* Profile Dropdown Layout - Z-INDEX 50 avoids clip errors */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-200 w-64 p-4 z-50 animate-bounce-in">
              <div className="flex flex-col items-center text-center pb-3 border-b border-gray-150">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center overflow-hidden mb-2">
                  {currentUser.foto ? (
                    <img src={currentUser.foto} alt={currentUser.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span>{currentUser.nama.substring(0, 1)}</span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-tight truncate w-full">{currentUser.nama}</h4>
                <p className="text-[9px] text-slate-400 mt-0.5">{currentUser.sekolah}</p>
                <p className="text-[9px] bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full mt-1.5 uppercase font-mono">{currentUser.role === 'user' ? 'GURU / ANGGOTA' : currentUser.role}</p>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5 text-slate-500" />
                  <span>Ubah Profil Saya</span>
                </button>
                
                <button
                  onClick={onLogout}
                  className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 rounded-lg font-bold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar / Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </header>

      {/* Main Structural Boundary */}
      <div className="flex-1 flex flex-col md:flex-row bg-[#F0F2F5]">
        
        {/* User Sidebar Panel */}
        <aside className="w-full md:w-64 sidebar-gradient text-white p-4 shrink-0 flex flex-col justify-between border-r border-white/10 shadow-lg">
          <div className="space-y-6">
            
            <div className="hidden md:block px-1">
              <span className="text-[10px] text-orange-400 font-mono tracking-widest font-extrabold uppercase bg-white/10 px-2.5 py-1 rounded">RUANG ANGGOTA KKG</span>
            </div>

            <nav className="space-y-1">
              
              <button
                onClick={() => setActiveTab('informasi')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'informasi' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <FileText className="w-4.5 h-4.5 text-white" />
                <span>Informasi Organisasi</span>
              </button>

              <button
                onClick={() => setActiveTab('materi')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'materi' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <BookOpen className="w-4.5 h-4.5 text-white" />
                <span>Pustaka Digital</span>
              </button>

              <button
                onClick={() => setActiveTab('chatting')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'chatting' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4.5 h-4.5 text-white" />
                <span>Chatting WA Guru</span>
              </button>

              {/* Admin Guru - Under construction overlay notification */}
              <button
                type="button"
                onClick={() => setShowUnderConstruction(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-orange-300 hover:bg-white/5 hover:text-white border-t border-white/10 pt-4 cursor-pointer text-left transition-colors"
                id="laporan-admin-external"
              >
                <span className="flex items-center gap-3">
                  <ExternalLink className="w-4.5 h-4.5 text-orange-300" />
                  <span>Admin Guru</span>
                </span>
                <span className="text-[10px] bg-orange-500/15 text-orange-300 px-1.5 py-0.5 rounded font-mono">LINK</span>
              </button>

            </nav>
          </div>

          <div className="pt-4 border-t border-white/10 text-[10px] text-white/50">
            <p>Sesi Masuk: {currentUser.jabatan || 'Guru Kelas'}</p>
            <p className="mt-1">© 2026 KKG GUGUS PADAAWAS</p>
          </div>
        </aside>

        {/* Working Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* Welcome Banner Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-teal-700 to-[#0284c7] rounded-3xl p-5 md:p-6 text-white mb-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
            <div className="relative z-10 space-y-1">
              <span className="text-[10px] bg-white/20 text-white font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">{currentUser.sekolah}</span>
              <h2 className="text-xl md:text-2xl font-black">Selamat Mengajar, {currentUser.nama}!</h2>
              <p className="text-xs text-emerald-50/90 max-w-xl">
                Gunakan menu di samping kiri untuk mengunduh file terbaru dari pengurus KKG, membaca mufakat hasil rapat bulanan, atau berdiskusi langsung di Chatting anggota.
              </p>
            </div>
          </div>

          {/* TAB 1: INFORMASI VIEW ONLY */}
          {activeTab === 'informasi' && (
            <div className="space-y-6">
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
                <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Informasi Terbaru dari Pengurus</h3>
                <p className="text-xs text-gray-400 mt-1">Daftar keputusan rapat, surat edaran penting, serta pengumuman resmi internal KKG.</p>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Pengumuman & Surat Edaran Aktif
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-28">Tanggal</th>
                        <th className="p-4 w-4/12">Informasi / Kabar</th>
                        <th className="p-4 w-5/12">Rangkuman KKG</th>
                        <th className="p-4 text-center w-28">Aksi PDF</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(informasi, currPageInfo).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/55 transition-colors">
                          <td className="p-4 font-mono text-gray-400 text-xs">{item.tanggal}</td>
                          <td className="p-4 font-bold text-slate-800 uppercase leading-snug">{item.judul}</td>
                          <td className="p-4 text-slate-600 leading-relaxed text-xs">{item.isi}</td>
                          <td className="p-4 text-center">
                            {item.pdfName ? (
                              <button
                                onClick={() => openNativePreview(item.pdfName, item.judul)}
                                className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 px-2.5 py-1 rounded border border-emerald-150 font-bold text-[10px]"
                              >
                                Pratinjau
                              </button>
                            ) : (
                              <span className="text-gray-400 text-[10px] italic">Tidak Ada File</span>
                            )}
                          </td>
                        </tr>
                      ))}
                      {informasi.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">Belum ada informasi terbaru dari pengurus.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {informasi.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {informasi.length} entri</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageInfo(Math.max(1, currPageInfo - 1))} 
                        disabled={currPageInfo === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold animate-pulse-once"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPageInfo(Math.min(Math.ceil(informasi.length / limit), currPageInfo + 1))}
                        disabled={currPageInfo * limit >= informasi.length}
                        className="p-1 px-2.5 bg-slate-850 hover:bg-slate-750 text-white disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: MATERI AND PANDUAN */}
          {activeTab === 'materi' && (
            <div className="space-y-6">
              {/* Header Title */}
              <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-[#0284c7]" />
                    Pustaka Digital Guru
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">Sistem perekaman berkas, modul Kurikulum Merdeka, dan administrasi Guru Kelas.</p>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#0284c7] bg-sky-50 px-3 py-1 rounded-full border border-sky-100">
                  Total Pustaka: {filteredMateri.length} items
                </span>
              </div>

              {/* Form Input Data - Pustaka Digital */}
              <div className="bg-white p-6 rounded-3xl border border-gray-150 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1.5 h-6 bg-emerald-500 rounded-full"></div>
                  <h4 className="text-xs font-black text-slate-950 uppercase tracking-wider">Formulir Rekam Berkas Pustaka</h4>
                </div>
                
                {submitSuccess && (
                  <div className="mb-4 bg-emerald-50 border border-emerald-150 text-emerald-800 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold animate-fade-in">
                    <Check className="w-4 h-4" />
                    <span>Data berkas pustaka digital berhasil disimpan!</span>
                  </div>
                )}
                {submitError && (
                  <div className="mb-4 bg-red-50 border border-red-150 text-red-700 text-xs px-4 py-3 rounded-xl flex items-center gap-2 font-semibold">
                    <AlertCircle className="w-4 h-4" />
                    <span>{submitError}</span>
                  </div>
                )}

                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!formMapel.trim()) {
                    setSubmitError('Mata Pelajaran (Mapel) harus diisi!');
                    return;
                  }
                  if (!formNamaFile.trim()) {
                    setSubmitError('Nama File harus diisi!');
                    return;
                  }
                  if (!formJudulFile.trim()) {
                    setSubmitError('Judul File harus diisi!');
                    return;
                  }

                  setIsSavingMat(true);
                  setSubmitError('');
                  setSubmitSuccess(false);

                  const nextNo = ((materiUser || []).length + 1).toString();
                  const newMateriUserItem: MateriUser = {
                    id: 'matu-' + Date.now(),
                    no: nextNo,
                    materi: formJudulFile.trim(),
                    pdfName: formNamaFile.trim(),
                    pdfData: formFileBase64 || 'MOCK_ATTACHMENT_DATA_FALLBACK',
                    mapel: formMapel.trim(),
                    kelas: formKelas,
                    namaFile: formNamaFile.trim(),
                    judulFile: formJudulFile.trim(),
                    fileFormat: formFileType,
                    userId: currentUser.id,
                    userName: currentUser.nama,
                    userSekolah: currentUser.sekolah || 'Gugus Padaawas'
                  };

                  try {
                    if (onSaveMateriUser) {
                      await onSaveMateriUser([...(materiUser || []), newMateriUserItem]);
                    }
                    
                    // Reset form fields
                    setFormMapel('');
                    setFormKelas('Kelas 1');
                    setFormNamaFile('');
                    setFormJudulFile('');
                    setFormFileType('pdf');
                    setFormFileName('');
                    setFormFileBase64('');
                    setSubmitError('');
                    setSubmitSuccess(true);
                    setTimeout(() => setSubmitSuccess(false), 4000);
                  } catch (err: any) {
                    console.error('Gagal menyimpan pustaka mandiri guru:', err);
                    setSubmitError('Gagal menyimpan ke database Supabase: ' + (err.message || 'Koneksi error'));
                  } finally {
                    setIsSavingMat(false);
                  }
                }} className="space-y-4">
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Mapel Field */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 tracking-wider uppercase block">Mata Pelajaran (Mapel)</label>
                      <input
                        type="text"
                        placeholder="Misal: PJOK, IPAS, Bahasa Indonesia, Matematika"
                        value={formMapel}
                        onChange={(e) => setFormMapel(e.target.value)}
                        className="w-full bg-gray-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0284c7] focus:bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Kelas Field */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-gray-500 tracking-wider uppercase block">Kelas (1 sampai 6)</label>
                      <select
                        value={formKelas}
                        onChange={(e) => setFormKelas(e.target.value)}
                        className="w-full bg-gray-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0284c7] focus:bg-white cursor-pointer transition-all"
                      >
                        <option value="Kelas 1">Kelas 1</option>
                        <option value="Kelas 2">Kelas 2</option>
                        <option value="Kelas 3">Kelas 3</option>
                        <option value="Kelas 4">Kelas 4</option>
                        <option value="Kelas 5">Kelas 5</option>
                        <option value="Kelas 6">Kelas 6</option>
                      </select>
                    </div>

                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* Nama File */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 tracking-wider uppercase block">Nama File</label>
                      <input
                        type="text"
                        placeholder="Misal: RPP_PJOK_KELAS1.pdf atau modul_ajar_mtk_k1.docx"
                        value={formNamaFile}
                        onChange={(e) => setFormNamaFile(e.target.value)}
                        className="w-full bg-gray-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0284c7] focus:bg-white transition-all"
                        required
                      />
                    </div>

                    {/* Judul File */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-500 tracking-wider uppercase block">Judul File</label>
                      <input
                        type="text"
                        placeholder="Misal: MODUL PENGEMBANGAN TEKNOLOGI PEMBELAJARAN"
                        value={formJudulFile}
                        onChange={(e) => setFormJudulFile(e.target.value)}
                        className="w-full bg-gray-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-[#0284c7] focus:bg-white transition-all"
                        required
                      />
                    </div>

                  </div>

                  {/* Input File option block */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-dashed border-gray-200 space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <span className="text-[10px] font-black text-gray-500 tracking-wider uppercase block">Input File Berkas</span>
                        <p className="text-[10px] text-gray-400">Pilih format input file: PDF atau Word (.doc, .docx).</p>
                      </div>
                      
                      {/* Tipe format Selector */}
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileType('pdf');
                            if (formNamaFile.endsWith('.doc') || formNamaFile.endsWith('.docx')) {
                              setFormNamaFile(formNamaFile.replace(/\.docx?$/, '') + '.pdf');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-colors cursor-pointer ${
                            formFileType === 'pdf'
                              ? 'bg-amber-100 text-amber-800 border-amber-300'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Format PDF (.pdf)
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormFileType('word');
                            if (formNamaFile.endsWith('.pdf')) {
                              setFormNamaFile(formNamaFile.replace(/\.pdf$/, '') + '.docx');
                            }
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-wider uppercase border transition-colors cursor-pointer ${
                            formFileType === 'word'
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-white text-gray-500 border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          Format Word (.docx, .doc)
                        </button>
                      </div>
                    </div>

                    {/* File chooser button */}
                    <div className="relative flex items-center justify-center p-4 bg-white rounded-xl border border-gray-200 shadow-xs hover:border-sky-400 transition-all group">
                      <input
                        type="file"
                        accept={formFileType === 'pdf' ? '.pdf' : '.doc,.docx'}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          setFormFileName(file.name);
                          setFormNamaFile(file.name);

                          const cleanName = file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " ");
                          if (!formJudulFile) {
                            setFormJudulFile(cleanName.toUpperCase());
                          }

                          const reader = new FileReader();
                          reader.onload = () => {
                            setFormFileBase64(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="flex flex-col items-center text-center">
                        <Upload className="w-6 h-6 text-slate-400 group-hover:text-sky-500 group-hover:scale-110 transition-all" />
                        <span className="text-[10px] font-bold text-gray-700 mt-1.5 uppercase">
                          {formFileName ? `Berkas Terpilih: ${formFileName}` : 'Klik untuk Memilih File'}
                        </span>
                        <span className="text-[9px] text-gray-400">Word (.doc, .docx) ATAU PDF (.pdf) sesuai pilihan jenis format</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#0284c7] hover:bg-sky-600 text-white rounded-xl text-xs font-bold tracking-wider uppercase flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                  </div>

                </form>
              </div>

              {/* Search Filters */}
              <div className="bg-white p-5 rounded-3xl border border-gray-150 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-sky-500" />
                  <h4 className="text-[10px] font-black text-slate-800 tracking-wider uppercase">Mesin Pencarian Pustaka</h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Filter Mapel */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter berdasarkan Mata Pelajaran..."
                      value={searchMapel}
                      onChange={(e) => {
                        setSearchMapel(e.target.value);
                        setCurrPageMat(1);
                      }}
                      className="w-full bg-slate-50 text-slate-700 text-xs pl-8.5 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-sky-400 focus:bg-white transition-all"
                    />
                  </div>

                  {/* Filter Nama File */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Search className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      placeholder="Filter berdasarkan Nama File..."
                      value={searchNamaFile}
                      onChange={(e) => {
                        setSearchNamaFile(e.target.value);
                        setCurrPageMat(1);
                      }}
                      className="w-full bg-slate-50 text-slate-700 text-xs pl-8.5 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:border-sky-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Data Table */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-3 font-bold text-xs uppercase tracking-wider flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setMateriSubTab('unggahan');
                        setCurrPageMat(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                        materiSubTab === 'unggahan'
                          ? 'bg-[#0284c7] text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Pustaka Mandiri Guru
                    </button>
                    <button
                      onClick={() => {
                        setMateriSubTab('bawaan');
                        setCurrPageMat(1);
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold tracking-wider transition-all cursor-pointer ${
                        materiSubTab === 'bawaan'
                          ? 'bg-[#0284c7] text-white shadow-xs'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      Pustaka Acuan Pusat
                    </button>
                  </div>
                  <span className="text-[10px] bg-slate-800 text-slate-200 px-2.5 py-1 rounded-full font-bold">
                    {materiSubTab === 'bawaan' ? filteredMateri.length : filteredMateriUser.length} Entri
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="p-4 w-20 text-center">Urutan</th>
                        <th className="p-4 w-2/12">Mapel</th>
                        <th className="p-4 w-2/12">Kelas</th>
                        <th className="p-4 w-3/12">{materiSubTab === 'bawaan' ? 'Nama File' : 'Nama File / Pengunggah'}</th>
                        <th className="p-4 w-3/12">Judul File</th>
                        <th className="p-4 text-center w-36">Pratinjau / Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {materiSubTab === 'bawaan' ? (
                        filteredMateri.length > 0 ? (
                          paginateMateri(filteredMateri, currPageMat).map((item, idx) => {
                            const sequentialNo = ((currPageMat - 1) * materiLimit) + idx + 1;
                            const formattedNo = sequentialNo < 10 ? `0${sequentialNo}` : `${sequentialNo}`;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/55 transition-colors text-[11px]">
                                <td className="p-4 font-bold font-mono text-slate-500 text-center">{formattedNo}</td>
                                <td className="p-4">
                                  <span className="font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                                    {item.mapel || 'Umum'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-teal-800 bg-teal-55/70 border border-teal-100 px-2.5 py-0.5 rounded">
                                    {item.kelas || 'Semua Kelas'}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-gray-500 max-w-[140px] truncate" title={item.namaFile || item.pdfName}>
                                  {item.namaFile || item.pdfName}
                                </td>
                                <td className="p-4 font-extrabold text-slate-800 uppercase leading-snug">
                                  {item.judulFile || item.materi}
                                </td>
                                <td className="p-4 text-center">
                                  <button
                                    onClick={() => openNativePreview(
                                      item.pdfName || item.namaFile || 'berkas.pdf', 
                                      item.judulFile || item.materi,
                                      item.pdfData
                                    )}
                                    className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg px-3 py-1.5 border border-emerald-200 text-[10px] cursor-pointer shadow-xs"
                                  >
                                    Lihat
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                              Belum ada berkas pustaka acuan pusat yang ditemukan.
                            </td>
                          </tr>
                        )
                      ) : (
                        filteredMateriUser.length > 0 ? (
                          paginateMateri(filteredMateriUser, currPageMat).map((item, idx) => {
                            const sequentialNo = ((currPageMat - 1) * materiLimit) + idx + 1;
                            const formattedNo = sequentialNo < 10 ? `0${sequentialNo}` : `${sequentialNo}`;

                            return (
                              <tr key={item.id} className="hover:bg-slate-50/55 transition-colors text-[11px]">
                                <td className="p-4 font-bold font-mono text-slate-500 text-center">{formattedNo}</td>
                                <td className="p-4">
                                  <span className="font-bold text-[#0284c7] bg-sky-50 border border-sky-100 px-2 py-0.5 rounded">
                                    {item.mapel || 'Umum'}
                                  </span>
                                </td>
                                <td className="p-4">
                                  <span className="font-semibold text-teal-800 bg-teal-55/70 border border-teal-100 px-2.5 py-0.5 rounded">
                                    {item.kelas || 'Semua Kelas'}
                                  </span>
                                </td>
                                <td className="p-4 font-mono text-gray-500 max-w-[140px] truncate" title={item.namaFile || item.pdfName}>
                                  <div className="font-bold">{item.namaFile || item.pdfName}</div>
                                  <div className="text-[9px] text-[#0284c7] font-semibold mt-0.5 lowercase font-sans">
                                    oleh: {item.userName || 'Guru'} ({item.userSekolah || 'Padaawas'})
                                  </div>
                                </td>
                                <td className="p-4 font-extrabold text-slate-800 uppercase leading-snug">
                                  {item.judulFile || item.materi}
                                </td>
                                <td className="p-4 text-center">
                                  <div className="flex justify-center items-center gap-1.5">
                                    <button
                                      onClick={() => openNativePreview(
                                        item.pdfName || item.namaFile || 'berkas.pdf', 
                                        item.judulFile || item.materi,
                                        item.pdfData
                                      )}
                                      className="inline-flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg px-3 py-1.5 border border-emerald-200 text-[10px] cursor-pointer shadow-xs"
                                    >
                                      Lihat
                                    </button>
                                    {(item.userId === currentUser.id || currentUser.role === 'admin') && (
                                      <button
                                        onClick={() => {
                                          if (confirm(`Hapus berkas "${item.judulFile || item.materi}"?`)) {
                                            if (onSaveMateriUser) {
                                              onSaveMateriUser((materiUser || []).filter(m => m.id !== item.id));
                                            }
                                          }
                                        }}
                                        className="inline-flex items-center justify-center bg-red-55 hover:bg-red-100 text-red-650 p-1.5 border border-red-200 rounded-lg cursor-pointer"
                                        title="Hapus berkas unggahan Anda"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                              Belum ada berkas mandiri guru yang diunggah.
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {((materiSubTab === 'bawaan' ? filteredMateri.length : filteredMateriUser.length) > materiLimit) && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-[10px] text-gray-400 font-semibold">
                      Total: {materiSubTab === 'bawaan' ? filteredMateri.length : filteredMateriUser.length} entri
                    </span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageMat(Math.max(1, currPageMat - 1))} 
                        disabled={currPageMat === 1}
                        className="p-1 py-1.5 px-3 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded-lg transition-colors font-bold cursor-pointer"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => {
                          const total = materiSubTab === 'bawaan' ? filteredMateri.length : filteredMateriUser.length;
                          setCurrPageMat(Math.min(Math.ceil(total / materiLimit), currPageMat + 1));
                        }}
                        disabled={currPageMat * materiLimit >= (materiSubTab === 'bawaan' ? filteredMateri.length : filteredMateriUser.length)}
                        className="p-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-50 text-[10px] rounded-lg transition-colors font-bold cursor-pointer"
                      >
                        Berikutnya
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CHATTING WA GURU */}
          {activeTab === 'chatting' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-xs flex justify-between items-center select-none">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-[#10b981] rounded-full block animate-pulse"></div>
                  <span className="font-bold text-slate-800">Media Diskusi Anggota KKG GUGUS PADAAWAS</span>
                </div>
                <span className="text-gray-400 text-[10px]">Tersambung langsung antar guru se-Kecamatan</span>
              </div>

              <ChatRoom
                currentUser={currentUser}
                chats={chats}
                onSaveChats={onSaveChats}
              />
            </div>
          )}

        </main>

      </div>

      {/* FOOTER ON ALL PAGES WITH LOW-CASE STANDARD */}
      <footer className="bg-slate-900 text-slate-500 text-[11px] py-4 border-t border-slate-800 text-center select-none relative z-10 w-full mt-auto">
        <p>@2026 kkg gugus padaawas kecamatan pasirwangi</p>
      </footer>

      {/* PROFILE SUNTING DIALOG FOR USER */}
      {isEditingProfile && (
        <div id="user-prof-modal" className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 md:p-8 animate-fade-in text-slate-800">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-5">
              <h3 className="font-extrabold text-sm md:text-base text-slate-900 uppercase tracking-wide">Sunting Profil Saya</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-slate-800 font-bold p-1 hover:bg-gray-100 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block uppercase">Nama & Gelar Saya</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block uppercase">NIP Pegawai</label>
                <input
                  type="text"
                  value={profNip}
                  onChange={(e) => setProfNip(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-750 block uppercase">Asal Sekolah</label>
                  <input
                    type="text"
                    value={profSchool}
                    onChange={(e) => setProfSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7]"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-705 block uppercase">Jabatan Struktural</label>
                  <input
                    type="text"
                    value={profJabatan}
                    onChange={(e) => setProfJabatan(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7]"
                    required
                  />
                </div>
              </div>

              {/* Photo component */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block uppercase">Foto Profil Baru (Unggah offline)</label>
                <div className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-gray-200">
                  <div className="w-11 h-11 bg-gray-200 rounded-full overflow-hidden flex items-center justify-center shrink-0">
                    {profFoto ? (
                      <img src={profFoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePhotoChange}
                    className="text-xs text-transparent focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-white file:text-[#0284c7] file:shadow cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-3">
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  Sunting Profil
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* PDF simulation readers */}
      {selectedPdfItem && (
        <PdfPreviewModal
          isOpen={true}
          onClose={() => setSelectedPdfItem(null)}
          pdfName={selectedPdfItem.name}
          pdfTitle={selectedPdfItem.title}
        />
      )}

      {/* Dynamic Pop-up Modal for Under Construction / Maintenance */}
      {showUnderConstruction && (
        <div id="under-construction-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-amber-100 flex flex-col items-center text-center animate-scale-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4 text-amber-500 animate-pulse">
              <AlertCircle className="w-10 h-10 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Halaman Sedang Dibangun
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-2.5 max-w-xs">
              Menu <span className="font-semibold text-slate-800">Admin Guru</span> sedang dalam tahap penyempurnaan dan proses pembangunan infrastruktur digital. Fitur-fitur administrasi hebat akan segera hadir di sini!
            </p>
            <button
              type="button"
              onClick={() => setShowUnderConstruction(false)}
              className="mt-6 w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-[#0f172a] text-[10px] font-black rounded-xl shadow-md uppercase tracking-wider cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150"
            >
              Mengerti, Terima Kasih
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
