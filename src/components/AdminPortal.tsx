import React, { useState, useRef } from 'react';
import { 
  Users, Calendar, Image as ImageIcon, FileText, Settings, 
  MessageSquare, ExternalLink, HelpCircle, LayoutDashboard, 
  Sparkles, LogOut, ShieldCheck, Plus, Check, Edit, Trash2, 
  ChevronLeft, ChevronRight, Upload, User, BookOpen, AlertCircle, File,
  Database, Copy, Wifi, RefreshCw
} from 'lucide-react';
import { 
  TentangKami, ProgramKerja, Informasi, DokumenGaleri, Materi, MateriUser, User as UserType, ChatMessage 
} from '../types';
import ChatRoom from './ChatRoom';
import PdfPreviewModal from './PdfPreviewModal';
import { db } from '../utils/supabase';
import { openNativePreview } from '../utils/preview';

interface AdminPortalProps {
  currentUser: UserType;
  onUpdateCurrentUser: (updated: UserType) => void;
  onLogout: () => void;
  users: UserType[];
  onSaveUsers: (updated: UserType[]) => void;
  tentangKami: TentangKami[];
  onSaveTentangKami: (updated: TentangKami[]) => void;
  programKerja: ProgramKerja[];
  onSaveProgramKerja: (updated: ProgramKerja[]) => void;
  informasi: Informasi[];
  onSaveInformasi: (updated: Informasi[]) => void;
  galeri: DokumenGaleri[];
  onSaveGaleri: (updated: DokumenGaleri[]) => void;
  materi: Materi[];
  onSaveMateri: (updated: Materi[]) => void;
  materiUser: MateriUser[];
  onSaveMateriUser: (updated: MateriUser[]) => void;
  chats: ChatMessage[];
  onSaveChats: (updated: ChatMessage[]) => void;
  supabaseStatus?: { isConnected: boolean; missingTables: string[] };
  onReloadSupabaseData?: () => void;
}

export default function AdminPortal({
  currentUser,
  onUpdateCurrentUser,
  onLogout,
  users,
  onSaveUsers,
  tentangKami,
  onSaveTentangKami,
  programKerja,
  onSaveProgramKerja,
  informasi,
  onSaveInformasi,
  galeri,
  onSaveGaleri,
  materi,
  onSaveMateri,
  materiUser,
  onSaveMateriUser,
  chats,
  onSaveChats,
  supabaseStatus = { isConnected: true, missingTables: [] },
  onReloadSupabaseData
}: AdminPortalProps) {
  
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [selectedPdfToView, setSelectedPdfToView] = useState<{ name: string; title: string } | null>(null);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);

  // Profile Edit fields inside an inline modal or top drawer
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profName, setProfName] = useState(currentUser.nama);
  const [profNip, setProfNip] = useState(currentUser.nip);
  const [profSchool, setProfSchool] = useState(currentUser.sekolah);
  const [profJabatan, setProfJabatan] = useState(currentUser.jabatan);
  const [profFoto, setProfFoto] = useState(currentUser.foto);

  // Generic Pagination Limit
  const limit = 4;

  // Supabase Integration & Direct Local-to-Cloud Migration States
  const [migrationStatus, setMigrationStatus] = useState<'idle' | 'running' | 'success' | 'error'>('idle');
  const [migrationError, setMigrationError] = useState<string>('');
  const [copiedSql, setCopiedSql] = useState(false);

  const SCHEMA_SQL = `-- SCHEMA SQL UNTUK SUPABASE KKG GUGUS PADAAWAS
-- Salin seluruh kode di bawah ini dan jalankan di SQL Editor dashboard Supabase Anda.
-- Dashboard URL: https://supabase.com/dashboard/project/mgipervnltbxciaowfya/sql

-- 1. Tabel: tentang_kami
CREATE TABLE IF NOT EXISTS tentang_kami (
    id TEXT PRIMARY KEY,
    deskripsi TEXT NOT NULL,
    visi TEXT NOT NULL,
    misi TEXT NOT NULL,
    date TEXT NOT NULL
);

-- 2. Tabel: program_kerja
CREATE TABLE IF NOT EXISTS program_kerja (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL
);

-- 3. Tabel: informasi
CREATE TABLE IF NOT EXISTS informasi (
    id TEXT PRIMARY KEY,
    tanggal TEXT NOT NULL,
    judul TEXT NOT NULL,
    isi TEXT NOT NULL,
    pdf_name TEXT NOT NULL,
    pdf_data TEXT NOT NULL
);

-- 4. Tabel: dokumen_galeri
CREATE TABLE IF NOT EXISTS dokumen_galeri (
    id TEXT PRIMARY KEY,
    judul TEXT NOT NULL,
    sub_judul TEXT NOT NULL,
    deskripsi TEXT NOT NULL,
    foto TEXT NOT NULL
);

-- 5. Tabel: materi
CREATE TABLE IF NOT EXISTS materi (
    id TEXT PRIMARY KEY,
    no TEXT NOT NULL,
    materi TEXT NOT NULL,
    pdf_name TEXT NOT NULL,
    pdf_data TEXT NOT NULL
);

-- 6. Tabel: users
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    nama TEXT NOT NULL,
    sekolah TEXT NOT NULL,
    username TEXT NOT NULL,
    password TEXT NOT NULL,
    nip TEXT NOT NULL,
    jabatan TEXT NOT NULL,
    foto TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    email TEXT DEFAULT ''
);

-- JALANKAN ALTER INI JIKA ANDA MEMPERBARUI DARI VERSI SEBELUMNYA (Supabase sudah memiliki tabel)
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';
ALTER TABLE chats ADD COLUMN IF NOT EXISTS deleted_by JSONB DEFAULT '[]'::jsonb;
ALTER TABLE chats ADD COLUMN IF NOT EXISTS deleted_for_all BOOLEAN DEFAULT FALSE;

-- 7. Tabel: chats
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL,
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    sender_foto TEXT,
    text TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    file_url TEXT,
    file_name TEXT,
    file_type TEXT,
    deleted_by JSONB DEFAULT '[]'::jsonb,
    deleted_for_all BOOLEAN DEFAULT FALSE
);

-- 8. Tabel: materi_user
CREATE TABLE IF NOT EXISTS materi_user (
    id TEXT PRIMARY KEY,
    no TEXT NOT NULL,
    materi TEXT NOT NULL,
    pdf_name TEXT NOT NULL,
    pdf_data TEXT NOT NULL,
    user_id TEXT NOT NULL,
    user_name TEXT NOT NULL,
    user_sekolah TEXT NOT NULL
);

-- Aktifkan RLS dan bypass dengan kebijakan publik demi kemudahan integrasi client-side
ALTER TABLE tentang_kami ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_kerja ENABLE ROW LEVEL SECURITY;
ALTER TABLE informasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumen_galeri ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE materi_user ENABLE ROW LEVEL SECURITY;

-- Buat policies hanya jika belum ada untuk menghindari error duplikasi di Supabase
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'tentang_kami' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON tentang_kami FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'program_kerja' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON program_kerja FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'informasi' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON informasi FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'dokumen_galeri' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON dokumen_galeri FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materi' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON materi FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'users' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON users FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'chats' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON chats FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'materi_user' AND policyname = 'Allow public read-write') THEN
        CREATE POLICY "Allow public read-write" ON materi_user FOR ALL USING (true) WITH CHECK (true);
    END IF;
END $$;`;

  const handleMigrateToSupabase = async () => {
    setMigrationStatus('running');
    setMigrationError('');
    try {
      const res = await db.migrateLocalToSupabase(
        tentangKami,
        programKerja,
        informasi,
        galeri,
        materi,
        users,
        chats,
        materiUser
      );
      if (res.success) {
        setMigrationStatus('success');
        if (onReloadSupabaseData) {
          onReloadSupabaseData();
        }
      } else {
        setMigrationStatus('error');
        const isUsersFailed = res.failed.some(f => f.table === 'users');
        if (isUsersFailed) {
          setMigrationError(`Gagal menghubungkan tabel: users. Kemungkinan kolom 'email' belum ada di tabel milik Anda. Silakan salin & jalankan perintah SQL berikut di SQL Editor Supabase Anda untuk memperbarui tabel:

ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT DEFAULT '';

Setelah itu, silakan coba lagi.`);
        } else {
          setMigrationError(`Gagal menghubungkan tabel: ${res.failed.map(f => f.table).join(', ')}. Harap pastikan skema SQL sudah Anda jalankan di editor SQL Supabase terlebih dahulu.`);
        }
      }
    } catch (err: any) {
      setMigrationStatus('error');
      setMigrationError(err.message || 'Error koneksi tidak terduga.');
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SCHEMA_SQL);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // 1. TENTANG KAMI State & Pagination
  const [tkDesc, setTkDesc] = useState('');
  const [tkVisi, setTkVisi] = useState('');
  const [tkMisi, setTkMisi] = useState('');
  const [tkEditId, setTkEditId] = useState<string | null>(null);
  const [currPageTk, setCurrPageTk] = useState(1);

  // 2. PROGRAM KERJA State & Pagination
  const [pkJudul, setPkJudul] = useState('');
  const [pkDesc, setPkDesc] = useState('');
  const [pkEditId, setPkEditId] = useState<string | null>(null);
  const [currPagePk, setCurrPagePk] = useState(1);

  // 3. DOKUMEN/GALERI State & Pagination
  const [galJudul, setGalJudul] = useState('');
  const [galSub, setGalSub] = useState('');
  const [galDesc, setGalDesc] = useState('');
  const [galFoto, setGalFoto] = useState('');
  const [galEditId, setGalEditId] = useState<string | null>(null);
  const [currPageGal, setCurrPageGal] = useState(1);

  // 4. INFORMASI State & Pagination
  const [infoDate, setInfoDate] = useState('2026-06-06');
  const [infoJudul, setInfoJudul] = useState('');
  const [infoIsi, setInfoIsi] = useState('');
  const [infoPdfName, setInfoPdfName] = useState('');
  const [infoEditId, setInfoEditId] = useState<string | null>(null);
  const [currPageInfo, setCurrPageInfo] = useState(1);

  // 5. MATERI State & Pagination
  const [matNo, setMatNo] = useState('');
  const [matJudul, setMatJudul] = useState('');
  const [matPdfName, setMatPdfName] = useState('');
  const [matEditId, setMatEditId] = useState<string | null>(null);
  const [currPageMat, setCurrPageMat] = useState(1);

  // 6. PENGATURAN USER State & Pagination
  const [usrNama, setUsrNama] = useState('');
  const [usrSekolah, setUsrSekolah] = useState('');
  const [usrUsername, setUsrUsername] = useState('');
  const [usrPassword, setUsrPassword] = useState('');
  const [usrFoto, setUsrFoto] = useState('');
  const [usrEditId, setUsrEditId] = useState<string | null>(null);
  const [currPageUsr, setCurrPageUsr] = useState(1);

  const fileRef = useRef<HTMLInputElement>(null);

  // Handle Profile Update
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

  // Dynamic Confirmation Modal State for deletion
  const [deleteConf, setDeleteConf] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    idToDelete: string | null;
    type: 'tentang-kami' | 'program-kerja' | 'galeri' | 'informasi' | 'materi' | 'user' | null;
    itemName?: string;
  }>({
    isOpen: false,
    title: '',
    description: '',
    idToDelete: null,
    type: null,
    itemName: ''
  });

  const confirmDeleteAction = (): boolean => {
    return true; // Legacy fallback
  };

  const executeConfirmedDelete = () => {
    const { idToDelete, type } = deleteConf;
    if (!idToDelete || !type) return;

    if (type === 'tentang-kami') {
      const filtered = tentangKami.filter(t => t.id !== idToDelete);
      onSaveTentangKami(filtered);
    } else if (type === 'program-kerja') {
      const filtered = programKerja.filter(p => p.id !== idToDelete);
      onSaveProgramKerja(filtered);
    } else if (type === 'galeri') {
      const filtered = galeri.filter(g => g.id !== idToDelete);
      onSaveGaleri(filtered);
    } else if (type === 'informasi') {
      const filtered = informasi.filter(i => i.id !== idToDelete);
      onSaveInformasi(filtered);
    } else if (type === 'materi') {
      const filtered = materi.filter(m => m.id !== idToDelete);
      onSaveMateri(filtered);
    } else if (type === 'user') {
      const filtered = users.filter(u => u.id !== idToDelete);
      onSaveUsers(filtered);
    }

    setDeleteConf({ isOpen: false, idToDelete: null, type: null, title: '', description: '', itemName: '' });
  };

  // --- TENTANG KAMI CRUD ---
  const handleSaveTentangKami = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tkDesc || !tkVisi || !tkMisi) return;

    if (tkEditId) {
      const updated = tentangKami.map(t => t.id === tkEditId ? { ...t, deskripsi: tkDesc, visi: tkVisi, misi: tkMisi } : t);
      onSaveTentangKami(updated);
      setTkEditId(null);
    } else {
      const newItem: TentangKami = {
        id: `tk-${Date.now()}`,
        deskripsi: tkDesc,
        visi: tkVisi,
        misi: tkMisi,
        date: new Date().toISOString().split('T')[0]
      };
      onSaveTentangKami([...tentangKami, newItem]);
    }
    // Reset Form
    setTkDesc('');
    setTkVisi('');
    setTkMisi('');
  };

  const handleEditTentangKami = (item: TentangKami) => {
    setTkEditId(item.id);
    setTkDesc(item.deskripsi);
    setTkVisi(item.visi);
    setTkMisi(item.misi);
  };

  const handleDeleteTentangKami = (id: string) => {
    const item = tentangKami.find(t => t.id === id);
    const snip = item?.deskripsi ? (item.deskripsi.length > 50 ? item.deskripsi.substring(0, 50) + '...' : item.deskripsi) : 'Deskripsi Profil KKG';
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Profil Tentang Kami',
      description: 'Apakah Anda yakin ingin menghapus data deskripsi profil atau visi-misi ini secara permanen dari basis data cloud?',
      idToDelete: id,
      type: 'tentang-kami',
      itemName: snip
    });
  };


  // --- PROGRAM KERJA CRUD ---
  const handleSaveProgramKerja = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pkJudul || !pkDesc) return;

    if (pkEditId) {
      const updated = programKerja.map(p => p.id === pkEditId ? { ...p, judul: pkJudul, deskripsi: pkDesc } : p);
      onSaveProgramKerja(updated);
      setPkEditId(null);
    } else {
      const newItem: ProgramKerja = {
        id: `pk-${Date.now()}`,
        judul: pkJudul,
        deskripsi: pkDesc
      };
      onSaveProgramKerja([...programKerja, newItem]);
    }
    setPkJudul('');
    setPkDesc('');
  };

  const handleEditProgramKerja = (item: ProgramKerja) => {
    setPkEditId(item.id);
    setPkJudul(item.judul);
    setPkDesc(item.deskripsi);
  };

  const handleDeleteProgramKerja = (id: string) => {
    const item = programKerja.find(p => p.id === id);
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Rencana Program Kerja',
      description: 'Apakah Anda yakin ingin menghapus rencana program kerja ini dari kalender kerja Gugus?',
      idToDelete: id,
      type: 'program-kerja',
      itemName: item?.judul || 'Program Kerja'
    });
  };


  // --- DOKUMEN/GALERI CRUD ---
  const handleSaveGaleri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!galJudul || !galSub || !galDesc) return;

    if (galEditId) {
      const updated = galeri.map(g => g.id === galEditId ? { ...g, judul: galJudul, subJudul: galSub, deskripsi: galDesc, foto: galFoto } : g);
      onSaveGaleri(updated);
      setGalEditId(null);
    } else {
      const newItem: DokumenGaleri = {
        id: `gal-${Date.now()}`,
        judul: galJudul,
        subJudul: galSub,
        deskripsi: galDesc,
        foto: galFoto // base64 representation
      };
      onSaveGaleri([...galeri, newItem]);
    }
    // reset
    setGalJudul('');
    setGalSub('');
    setGalDesc('');
    setGalFoto('');
  };

  const handleGalFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setGalFoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditGaleri = (item: DokumenGaleri) => {
    setGalEditId(item.id);
    setGalJudul(item.judul);
    setGalSub(item.subJudul);
    setGalDesc(item.deskripsi);
    setGalFoto(item.foto);
  };

  const handleDeleteGaleri = (id: string) => {
    const item = galeri.find(g => g.id === id);
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Dokumen Foto Galeri',
      description: 'Apakah Anda yakin ingin membuang item kenangan/galeri visual guru ini?',
      idToDelete: id,
      type: 'galeri',
      itemName: item?.judul || 'Foto Galeri'
    });
  };


  // --- INFORMASI (Landings & User Table) CRUD ---
  const handleSaveInformasi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!infoJudul || !infoIsi) return;

    if (infoEditId) {
      const updated = informasi.map(i => i.id === infoEditId ? { ...i, tanggal: infoDate, judul: infoJudul, isi: infoIsi, pdfName: infoPdfName } : i);
      onSaveInformasi(updated);
      setInfoEditId(null);
    } else {
      const newItem: Informasi = {
        id: `info-${Date.now()}`,
        tanggal: infoDate,
        judul: infoJudul,
        isi: infoIsi,
        pdfName: infoPdfName || 'document_informasi.pdf',
        pdfData: 'MOCK_ATTACH_DATA'
      };
      onSaveInformasi([...informasi, newItem]);
    }
    // reset
    setInfoJudul('');
    setInfoIsi('');
    setInfoPdfName('');
  };

  const handleInfoPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInfoPdfName(file.name);
    }
  };

  const handleEditInformasi = (item: Informasi) => {
    setInfoEditId(item.id);
    setInfoDate(item.tanggal);
    setInfoJudul(item.judul);
    setInfoIsi(item.isi);
    setInfoPdfName(item.pdfName);
  };

  const handleDeleteInformasi = (id: string) => {
    const item = informasi.find(i => i.id === id);
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Publikasi Informasi',
      description: 'Apakah Anda yakin ingin menghapus rilis pengumuman / berita guru ini secara permanen?',
      idToDelete: id,
      type: 'informasi',
      itemName: item?.judul || 'Rilis Pengumuman'
    });
  };


  // --- MATERI CRUD (With Browser PDF Native Preview) ---
  const handleSaveMateri = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matNo || !matJudul) return;

    if (matEditId) {
      const updated = materi.map(m => m.id === matEditId ? { ...m, no: matNo, materi: matJudul, pdfName: matPdfName } : m);
      onSaveMateri(updated);
      setMatEditId(null);
    } else {
      const newItem: Materi = {
        id: `mat-${Date.now()}`,
        no: matNo,
        materi: matJudul,
        pdfName: matPdfName || 'materi_kkg.pdf',
        pdfData: 'MOCK_PDF_DATA'
      };
      onSaveMateri([...materi, newItem]);
    }
    setMatNo('');
    setMatJudul('');
    setMatPdfName('');
  };

  const handleMateriPdfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setMatPdfName(file.name);
    }
  };

  const handleEditMateri = (item: Materi) => {
    setMatEditId(item.id);
    setMatNo(item.no);
    setMatJudul(item.materi);
    setMatPdfName(item.pdfName);
  };

  const handleDeleteMateri = (id: string) => {
    const item = materi.find(m => m.id === id);
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Modul Materi KKG',
      description: 'Apakah Anda yakin ingin menghapus file modul materi pembelajaran guru ini?',
      idToDelete: id,
      type: 'materi',
      itemName: item?.materi || 'Materi KKG'
    });
  };


  // --- PENGATURAN USER CRUD ---
  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usrNama || !usrSekolah || !usrUsername || !usrPassword) return;

    if (usrEditId) {
      const updated = users.map(u => u.id === usrEditId ? { ...u, nama: usrNama, sekolah: usrSekolah, username: usrUsername, password: usrPassword, foto: usrFoto } : u);
      onSaveUsers(updated);
      setUsrEditId(null);
    } else {
      const newUser: UserType = {
        id: `usr-${Date.now()}`,
        nama: usrNama,
        sekolah: usrSekolah,
        username: usrUsername,
        password: usrPassword,
        nip: '19901231' + Math.floor(Math.random() * 100000),
        jabatan: 'Guru Kelas',
        foto: usrFoto,
        role: 'user'
      };
      onSaveUsers([...users, newUser]);
    }
    // reset
    setUsrNama('');
    setUsrSekolah('');
    setUsrUsername('');
    setUsrPassword('');
    setUsrFoto('');
  };

  const handleUsrFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUsrFoto(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleEditUser = (item: UserType) => {
    setUsrEditId(item.id);
    setUsrNama(item.nama);
    setUsrSekolah(item.sekolah);
    setUsrUsername(item.username);
    setUsrPassword(item.password);
    setUsrFoto(item.foto);
  };

  const handleDeleteUser = (id: string) => {
    const item = users.find(u => u.id === id);
    setDeleteConf({
      isOpen: true,
      title: 'Hapus Akun Anggota Guru',
      description: 'Apakah Anda yakin ingin mencabut akses keanggotaan dan menghapus profil guru ini dari sistem?',
      idToDelete: id,
      type: 'user',
      itemName: item?.nama || 'Akun Guru'
    });
  };

  // Helper for generic list pagination
  const paginate = (items: any[], currentPage: number) => {
    const start = (currentPage - 1) * limit;
    return items.slice(start, start + limit);
  };

  // Stats calculation
  const totalGurus = users.filter(u => u.role === 'user').length;
  const totalUsers = users.length;
  const totalPrograms = programKerja.length;
  const totalInfos = informasi.length;
  const totalMateri = materi.length;

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-slate-800 flex flex-col font-sans relative">
      
      {/* Top Main Navbar - Z-INDEX 40 is safe but profile dropdown is Z-50 */}
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
            <h2 className="text-sm md:text-base font-black text-slate-900 leading-tight uppercase">
              PORTAL ADMIN KKG
            </h2>
            <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">
              Gugus Padaawas - Pasirwangi
            </p>
          </div>
        </div>

        {/* Current user role & Profile actions */}
        <div className="relative">
          <button
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 hover:bg-slate-50 px-3 py-1.5 rounded-xl border border-gray-100 transition-colors cursor-pointer"
            id="profile-dropdown-trigger"
          >
            {/* User photo uploaded */}
            <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden border border-emerald-500 shadow-inner">
              {currentUser.foto ? (
                <img src={currentUser.foto} alt={currentUser.nama} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.nama.substring(0, 1)}</span>
              )}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-bold leading-tight truncate max-w-[120px]">{currentUser.nama}</span>
              <span className="text-[9px] text-gray-400 leading-none">Ketua KKG (Admin)</span>
            </div>
          </button>

          {/* Profil Dropdown Menu - EXACTLY z-50 to avoid getting covered! */}
          {showProfileDropdown && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-150 w-64 p-4 z-50 animate-bounce-in">
              <div className="flex flex-col items-center text-center pb-3 border-b border-gray-150">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center overflow-hidden mb-2">
                  {currentUser.foto ? (
                    <img src={currentUser.foto} alt={currentUser.nama} className="w-full h-full object-cover" />
                  ) : (
                    <span>A</span>
                  )}
                </div>
                <h4 className="font-bold text-xs text-slate-800 leading-tight truncate w-full">{currentUser.nama}</h4>
                <p className="text-[9px] text-gray-400 mt-0.5">{currentUser.nip || 'NIP Belum Diisi'}</p>
                <p className="text-[9px] bg-sky-100 text-[#0284c7] font-semibold px-2 py-0.5 rounded-full mt-1 uppercase font-mono">{currentUser.role}</p>
              </div>

              <div className="py-2 space-y-1">
                <button
                  onClick={() => {
                    setIsEditingProfile(true);
                    setShowProfileDropdown(false);
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-amber-50 hover:text-amber-800 rounded-lg font-semibold flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <Edit className="w-3.5 h-3.5" />
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

      {/* Main Container: Sidebar + Working Frame Layout */}
      <div className="flex-1 flex flex-col md:flex-row bg-[#F0F2F5]">
        
        {/* Left Sidebar Menu */}
        <aside className="w-full md:w-64 sidebar-gradient text-white p-4 shrink-0 flex flex-col justify-between border-r border-white/10 shadow-lg">
          <div className="space-y-6">
            
            <div className="hidden md:block px-1">
              <span className="text-[10px] text-orange-400 font-mono tracking-widest font-extrabold uppercase bg-white/10 px-2.5 py-1 rounded">MENU KONTROL PANEL</span>
            </div>

            <nav className="space-y-1">
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'dashboard' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutDashboard className="w-4.5 h-4.5 text-white" />
                <span>Dashboard Utama</span>
              </button>

              <button
                onClick={() => setActiveTab('tentang-kami')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'tentang-kami' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Sparkles className="w-4.5 h-4.5 text-white" />
                <span>Tentang Kami (Gugus Padaawas)</span>
              </button>

              <button
                onClick={() => setActiveTab('program-kerja')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'program-kerja' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Settings className="w-4.5 h-4.5 text-white" />
                <span>Program Kerja</span>
              </button>

              <button
                onClick={() => setActiveTab('dokumen-galeri')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'dokumen-galeri' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <ImageIcon className="w-4.5 h-4.5 text-white" />
                <span>Dokumen / Galeri</span>
              </button>

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
                <span>Materi & Modul</span>
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

              <button
                onClick={() => setActiveTab('pengaturan-user')}
                className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'pengaturan-user' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Users className="w-4.5 h-4.5 text-white" />
                  <span>Pengaturan User</span>
                </span>
              </button>

              <button
                onClick={() => setActiveTab('koneksi-supabase')}
                className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'koneksi-supabase' ? 'bg-white/10 text-white font-bold' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Database className="w-4.5 h-4.5 text-white" />
                  <span>Koneksi Supabase</span>
                </span>
                {supabaseStatus.missingTables.length > 0 ? (
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                )}
              </button>

              {/* Admin Guru - Under construction overlay notification */}
              <button
                type="button"
                onClick={() => setShowUnderConstruction(true)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-orange-300 hover:bg-white/5 hover:text-white border-t border-white/10 pt-4 cursor-pointer text-left transition-colors"
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
            <p>Admin Login Mode</p>
            <p className="mt-1">© 2026 KKG GUGUS PADAAWAS</p>
          </div>
        </aside>

        {/* Main Workspace Frame */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl mx-auto w-full">
          
          {/* 1. DASHBOARD OVERVIEW TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-slate-900 to-[#1e293b] rounded-2xl p-6 text-white flex flex-col md:flex-row items-center justify-between gap-4 shadow-md">
                <div>
                  <h2 className="text-xl md:text-2xl font-black tracking-wide">
                    Selamat Datang Kembali, {currentUser.nama}!
                  </h2>
                  <p className="text-xs text-slate-300 mt-1 max-w-xl">
                    Anda masuk sebagai Ketua & Administrator utama. Berikut rekapitulasi data anggota guru kelas yang terregistrasi di Kecamatan Pasirwangi.
                  </p>
                </div>
                <div className="bg-amber-500 text-[#0f172a] px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider block shrink-0">
                  GUGUS PADAAWAS
                </div>
              </div>

              {/* STAT CARDS BOX */}
              <div id="stat-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5">
                
                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-sky-100 text-[#0284c7] rounded-xl flex items-center justify-center text-lg shrink-0">
                    👥
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Anggota Guru</span>
                    <span className="text-2xl font-black text-slate-900">{totalGurus}</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-lg shrink-0">
                    🏆
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Program Kerja</span>
                    <span className="text-2xl font-black text-slate-900">{totalPrograms}</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-lg shrink-0">
                    👤
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Jumlah User</span>
                    <span className="text-2xl font-black text-slate-900">{totalUsers}</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-2xl border border-gray-200 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-lg shrink-0">
                    📖
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 block font-bold uppercase tracking-wider">Materi Ajar</span>
                    <span className="text-2xl font-black text-slate-900">{totalMateri}</span>
                  </div>
                </div>

              </div>

              {/* GRAPH & COMPACT CALENDAR LEVEL */}
              <div className="grid md:grid-cols-12 gap-6 pt-2">
                
                {/* 1. Activities Simulated Math SVG Graph */}
                <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs flex flex-col justify-between">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Grafik Partisipasi Kegiatan Utama KKG</h3>
                    <p className="text-[10px] text-gray-400 mt-1">Keaktifan kontribusi guru kelas pada forum bulanan semester ini.</p>
                  </div>
                  
                  {/* Styled pure HTML/CSS columns representing interactive graph bar */}
                  <div className="h-44 relative flex items-end justify-around px-4 pt-6 pb-2 border-b border-gray-100 font-mono text-[9px] text-gray-400">
                    
                    {/* Background dashed horizontal lines for metric bounds */}
                    <div className="absolute inset-x-0 bottom-8 top-6 flex flex-col justify-between pointer-events-none opacity-40">
                      <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                      <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                      <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                      <div className="border-b border-dashed border-gray-200 w-full h-0"></div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-[#0284c7] to-[#38bdf8] hover:from-amber-500 hover:to-amber-400 transition-all duration-300 rounded-t-md h-28 hover:-translate-y-1 shadow-xs" title="Pelatihan APE Kelas: 78% Guru Hadir"></div>
                      <span className="truncate max-w-[50px] font-bold text-slate-500">Jan 26</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-[#0284c7] to-[#38bdf8] hover:from-amber-500 hover:to-amber-400 transition-all duration-300 rounded-t-md h-36 hover:-translate-y-1 shadow-xs" title="KKG Rapat kerja: 92% Guru Hadir"></div>
                      <span className="truncate max-w-[50px] font-bold text-slate-500">Feb 26</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-[#0284c7] to-[#38bdf8] hover:from-amber-500 hover:to-amber-400 transition-all duration-300 rounded-t-md h-20 hover:-translate-y-1 shadow-xs" title="Bedah Modul Ajar: 60% Guru Hadir"></div>
                      <span className="truncate max-w-[50px] font-bold text-slate-500">Mar 26</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-[#0284c7] to-[#38bdf8] hover:from-amber-500 hover:to-amber-400 transition-all duration-300 rounded-t-md h-40 hover:-translate-y-1 shadow-xs" title="Media Pembelajaran STEM: 100% Guru Hadir"></div>
                      <span className="truncate max-w-[50px] font-bold text-slate-500">Apr 26</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-[#0284c7] to-[#38bdf8] hover:from-amber-500 hover:to-amber-400 transition-all duration-300 rounded-t-md h-32 hover:-translate-y-1 shadow-xs" title="Evaluasi Asesmen Belajar: 84% Guru Hadir"></div>
                      <span className="truncate max-w-[50px] font-bold text-slate-500">Mei 26</span>
                    </div>

                    <div className="flex flex-col items-center gap-1.5 w-12 relative z-10 group cursor-help">
                      <div className="w-7 md:w-8 bg-gradient-to-t from-orange-500 to-amber-500 transition-all duration-300 rounded-t-md h-38 animate-pulse hover:-translate-y-1 shadow-xs" title="Agenda Bulan Juni: Sangat Dinamis"></div>
                      <span className="truncate max-w-[50px] font-bold text-orange-600 font-extrabold text-[10px]">Juni 26</span>
                    </div>

                  </div>
                  
                  <div className="flex justify-between text-[11px] font-bold text-[#0284c7] pt-2">
                    <span>* Satuan persentasi keaktifan kelas</span>
                    <span className="text-gray-400">Total: 6 Kegiatan Aktif</span>
                  </div>
                </div>

                {/* 2. Compact Academic Calendar Beside Graph */}
                <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-gray-100 shadow-xs font-sans">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-extrabold text-slate-900 text-xs md:text-sm uppercase text-sky-800">Kalender Agenda KKG</h3>
                    <span className="text-[10px] bg-sky-50 text-[#0284c7] px-2 py-0.5 rounded-full font-mono font-bold">Juni 2026</span>
                  </div>

                  {/* Calendar view */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs">
                    {['S', 'S', 'R', 'K', 'J', 'S', 'M'].map((day, dIdx) => (
                      <span key={dIdx} className="font-bold text-gray-400 py-1">{day}</span>
                    ))}
                    {/* Dummy days to start June 2026 */}
                    <span className="text-gray-300 py-1.5">1</span>
                    <span className="text-gray-300 py-1.5">2</span>
                    <span className="text-gray-300 py-1.5">3</span>
                    <span className="text-gray-300 py-1.5">4</span>
                    <span className="text-gray-300 py-1.5">5</span>
                    <span className="text-slate-800 font-bold py-1.5 bg-sky-50 rounded-lg">6</span>
                    <span className="text-slate-800 py-1.5">7</span>

                    <span className="text-slate-800 py-1.5 font-bold">8</span>
                    <span className="text-slate-800 py-1.5 font-bold">9</span>
                    
                    {/* Highlighted Agenda KKG rapat */}
                    <span className="text-white bg-orange-500 rounded-lg py-1.5 font-extrabold flex items-center justify-center text-xs shadow-xs hover:scale-105 transition-transform cursor-help" title="Agenda Rapat KKG Gugus Padaawas">10</span>
                    
                    <span className="text-slate-800 py-1.5">11</span>
                    <span className="text-slate-800 py-1.5">12</span>
                    <span className="text-slate-800 py-1.5">13</span>
                    <span className="text-slate-800 py-1.5">14</span>

                    <span className="text-slate-800 py-1.5">15</span>
                    <span className="text-slate-800 py-1.5">16</span>
                    <span className="text-slate-800 py-1.5">17</span>
                    <span className="text-slate-800 py-1.5">18</span>
                    <span className="text-slate-800 py-1.5">19</span>
                    <span className="text-slate-800 py-1.5">20</span>
                    <span className="text-slate-800 py-1.5">21</span>
                  </div>

                  <div className="text-[10px] text-slate-500 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-4 space-y-1">
                    <p className="font-bold text-amber-800 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      Kegiatan Terdekat Terjadwal:
                    </p>
                    <p>• 10 Juni 2026: Rapat rutin evaluasi guru kelas se-Padaawas.</p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* 2. TENTANG KAMI TAB */}
          {activeTab === 'tentang-kami' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Tentang Kami</h3>
                  <p className="text-[10px] text-gray-400">Atur deskripsi, visi, dan misi KKG Gugus Padaawas yang tampil di halaman landing utama.</p>
                </div>

                <form onSubmit={handleSaveTentangKami} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Mengenal Lebih Dekat KKG Gugus Padaawas (Pengantar)</label>
                    <textarea
                      value={tkDesc}
                      onChange={(e) => setTkDesc(e.target.value)}
                      placeholder="Masukkan profil, visi utama, dan pengantar komprehensif..."
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                      required
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Visi KKG</label>
                      <textarea
                        value={tkVisi}
                        onChange={(e) => setTkVisi(e.target.value)}
                        placeholder="Uraikan visi masa depan KKG..."
                        rows={3}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Misi KKG</label>
                      <textarea
                        value={tkMisi}
                        onChange={(e) => setTkMisi(e.target.value)}
                        placeholder="Pisahkan misi dengan baris baru..."
                        rows={3}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-white" />
                    <span>{tkEditId ? 'Simpan Suntingan' : 'Simpan Profil'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Daftar Profil Tersimpan (Tentang Kami)
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-32">Tanggal</th>
                        <th className="p-4 w-3/12">Deskripsi Ringkat</th>
                        <th className="p-4 w-3/12">Visi KKG</th>
                        <th className="p-4 w-3/12">Misi KKGs</th>
                        <th className="p-4 text-center w-32">Aksi Kolektif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(tentangKami, currPageTk).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-4 text-gray-400 font-mono">{item.date}</td>
                          <td className="p-4 font-medium text-slate-700 truncate max-w-sm">{item.deskripsi}</td>
                          <td className="p-4 text-slate-600 truncate max-w-xs">{item.visi}</td>
                          <td className="p-4 text-slate-600 truncate max-w-xs whitespace-pre-line">{item.misi}</td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleEditTentangKami(item)}
                                className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-md transition-all text-[10px]"
                                title="Edit"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteTentangKami(item.id)}
                                className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-md transition-all text-[10px]"
                                title="Hapus"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {tentangKami.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-8 text-center text-gray-400 italic">Belum ada konten Tentang Kami terinput.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Table Pagination */}
                {tentangKami.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {tentangKami.length} entri</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageTk(Math.max(1, currPageTk - 1))} 
                        disabled={currPageTk === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPageTk(Math.min(Math.ceil(tentangKami.length / limit), currPageTk + 1))}
                        disabled={currPageTk * limit >= tentangKami.length}
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

          {/* 3. PROGRAM KERJA TAB */}
          {activeTab === 'program-kerja' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Agenda & Program Kerja</h3>
                  <p className="text-[10px] text-gray-400">Input agenda program kerja strategis KKG Gugus Padaawas yang langsung diekspos di landing pages utama.</p>
                </div>

                <form onSubmit={handleSaveProgramKerja} className="space-y-4">
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Judul Program Kerja</label>
                    <input
                      type="text"
                      value={pkJudul}
                      onChange={(e) => setPkJudul(e.target.value)}
                      placeholder="Contoh: Klinik Renang & Penyelamatan Air"
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Deskripsi Singkat Program</label>
                    <textarea
                      value={pkDesc}
                      onChange={(e) => setPkDesc(e.target.value)}
                      placeholder="Tuliskan sasaran, jadwal pengajaran, dan metodologi ringkas..."
                      rows={2}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{pkEditId ? 'Simpan Suntingan' : 'Tambah Program Kerja'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Daftar Program Kerja KKG Strategis
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-4/12">Judul Agenda / Program</th>
                        <th className="p-4 w-6/12">Deskripsi Kerja Terperinci</th>
                        <th className="p-4 text-center w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(programKerja, currPagePk).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold text-slate-800 uppercase">{item.judul}</td>
                          <td className="p-4 text-slate-600 leading-relaxed">{item.deskripsi}</td>
                          <td className="p-4 text-center">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => handleEditProgramKerja(item)}
                                className="p-1 px-2.5 bg-blue-50 hover:bg-blue-100 text-blue-750 font-bold rounded-md transition-all text-[10px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteProgramKerja(item.id)}
                                className="p-1 px-2.5 bg-red-50 hover:bg-red-155 text-red-600 font-bold rounded-md transition-all text-[10px]"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {programKerja.length === 0 && (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-400 italic">Belum ada Program Kerja terinput.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {programKerja.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {programKerja.length} entri</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPagePk(Math.max(1, currPagePk - 1))} 
                        disabled={currPagePk === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPagePk(Math.min(Math.ceil(programKerja.length / limit), currPagePk + 1))}
                        disabled={currPagePk * limit >= programKerja.length}
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

          {/* 4. DOKUMEN/GALERI TAB */}
          {activeTab === 'dokumen-galeri' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Galeri & Dokumentasi Kegiatan</h3>
                  <p className="text-[10px] text-gray-400">Arsip kegiatan, foto bersam-sama, kompetisi olahraga, rapat instansi, dan unggah foto asli dari komputer Anda.</p>
                </div>

                <form onSubmit={handleSaveGaleri} className="space-y-4">
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Judul Dokumentasi</label>
                      <input
                        type="text"
                        value={galJudul}
                        onChange={(e) => setGalJudul(e.target.value)}
                        placeholder="Contoh: Sosialisasi Senam SKJ 2026"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Sub Judul / Kategori</label>
                      <input
                        type="text"
                        value={galSub}
                        onChange={(e) => setGalSub(e.target.value)}
                        placeholder="Contoh: Olahraga Tradisional Jawa Barat"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Deskripsi Lengkap Kegiatan</label>
                    <textarea
                      value={galDesc}
                      onChange={(e) => setGalDesc(e.target.value)}
                      placeholder="Masukkan detil, lokasi sekolah, siapa saja yang hadir, dan hasil kegiatan fisik..."
                      rows={2}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                      required
                    />
                  </div>

                  {/* Photo upload from directory exclusively */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Berkas Gambar Kegiatan (Unggah dari Komputer)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-gray-250">
                      
                      <div className="w-14 h-14 bg-gray-200 rounded-lg overflow-hidden border border-gray-300 flex items-center justify-center shrink-0">
                        {galFoto ? (
                          <img src={galFoto} alt="Preview Upload" className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-xs">
                        <p className="font-semibold text-slate-750 truncate">
                          {galFoto ? 'Gambar berhasil diunggah' : 'Belum memilih file dari komputer'}
                        </p>
                        <p className="text-[10px] text-gray-400">Akan disimpan terkompresi langsung di browser</p>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalFotoChange}
                        className="text-xs text-transparent focus:outline-none file:mr-4 file:py-1.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0284c7] file:shadow hover:file:bg-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-white" />
                    <span>{galEditId ? 'Simpan Suntingan' : 'Simpan Foto Galeri'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Daftar Koleksi Foto & Kegiatan Terdaftar
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-44">Tampilan / Preview</th>
                        <th className="p-4 w-4/12">Judul Foto & Kategori</th>
                        <th className="p-4 w-5/12">Deskripsi Arsip</th>
                        <th className="p-4 text-center w-32">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(galeri, currPageGal).map((item) => {
                        const hasImage = item.foto && item.foto.startsWith('data:');
                        return (
                          <tr key={item.id} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="w-16 h-12 rounded bg-gray-150 overflow-hidden flex items-center justify-center border border-gray-200">
                                {hasImage ? (
                                  <img src={item.foto} alt="gal" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[9px] font-mono font-bold text-gray-400">NO IMAGE</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <span className="font-bold text-slate-800 text-xs block uppercase leading-snug">{item.judul}</span>
                              <span className="text-[10px] text-blue-600 font-semibold">{item.subJudul}</span>
                            </td>
                            <td className="p-4 text-slate-600 leading-relaxed truncate max-w-sm">{item.deskripsi}</td>
                            <td className="p-4 text-center">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleEditGaleri(item)}
                                  className="p-1 px-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[10px]"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteGaleri(item.id)}
                                  className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[10px]"
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {galeri.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">Belum ada Galeri terinput.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {galeri.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {galeri.length} entri</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageGal(Math.max(1, currPageGal - 1))} 
                        disabled={currPageGal === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPageGal(Math.min(Math.ceil(galeri.length / limit), currPageGal + 1))}
                        disabled={currPageGal * limit >= galeri.length}
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

          {/* 5. INFORMASI TAB */}
          {activeTab === 'informasi' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Berita & Informasi Resmi Organisasi</h3>
                  <p className="text-[10px] text-gray-400">Surat edaran, rapat rutin KKG Bulanan, undangan O2SN kecamatan, dan unggah lampiran file PDF langsung.</p>
                </div>

                <form onSubmit={handleSaveInformasi} className="space-y-4">
                  
                  <div className="grid sm:grid-cols-3 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Tanggal Penerbitan</label>
                      <input
                        type="date"
                        value={infoDate}
                        onChange={(e) => setInfoDate(e.target.value)}
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Judul Informasi / Kabar Utama</label>
                      <input
                        type="text"
                        value={infoJudul}
                        onChange={(e) => setInfoJudul(e.target.value)}
                        placeholder="Contoh: Undangan Rapat Konsolidasi Program Kegiatan KKG"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Isi Informasi Resmi (Lengkap)</label>
                    <textarea
                      value={infoIsi}
                      onChange={(e) => setInfoIsi(e.target.value)}
                      placeholder="Masukkan agenda rapat, instruksi pengerjaan kerja guru..."
                      rows={3}
                      className="w-full bg-slate-50 border border-gray-200 rounded-xl p-3 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                      required
                    />
                  </div>

                  {/* Input pdf lampiran */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Lampirkan Berkas Surat PDF (Unggah berkas nyata)</label>
                    <div className="flex items-center gap-3 bg-[#f8fafc] border border-gray-200 p-3 rounded-xl">
                      <File className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{infoPdfName || 'Belum memilih Berkas PDF'}</p>
                        <p className="text-[10px] text-gray-400">Akan dikonversi sebagai dokumen PDF digital web</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleInfoPdfChange}
                        className="text-xs text-transparent focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0284c7] file:shadow hover:file:bg-slate-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{infoEditId ? 'Simpan Suntingan' : 'Terbitkan Informasi'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Arsip Penerbitan Surat & Informasi KKG
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-28">Tanggal</th>
                        <th className="p-4 w-4/12">Kabar Informasi</th>
                        <th className="p-4 w-5/12">File PDF Lampiran</th>
                        <th className="p-4 text-center w-36">Aksi Kolektif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(informasi, currPageInfo).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-mono text-gray-450 text-xs">{item.tanggal}</td>
                          <td className="p-4 font-bold text-slate-800 leading-snug">
                            {item.judul}
                            <p className="text-[10px] text-gray-400 font-normal mt-1 leading-snug truncate max-w-md">{item.isi}</p>
                          </td>
                          <td className="p-4 text-red-600 font-semibold">{item.pdfName || 'N/A'}</td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => openNativePreview(item.pdfName, item.judul)}
                                className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[9px]"
                              >
                                Lihat
                              </button>
                              <button
                                onClick={() => handleEditInformasi(item)}
                                className="p-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-705 font-bold rounded text-[9px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteInformasi(item.id)}
                                className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[9px]"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {informasi.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">Belum ada Informasi Terbagikan.</td>
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
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
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

          {/* 6. MATERI TAB */}
          {activeTab === 'materi' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Modul & Materi Ajar</h3>
                  <p className="text-[10px] text-gray-400">Materi kurikulum merdeka SD, buku penilaian, panduan mengajar, dan pratinjau browser terintegrasi.</p>
                </div>

                <form onSubmit={handleSaveMateri} className="space-y-4">
                  
                  <div className="grid sm:grid-cols-4 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">No Urutan / Kode</label>
                      <input
                        type="number"
                        value={matNo}
                        onChange={(e) => setMatNo(e.target.value)}
                        placeholder="Contoh: 1 atau 2"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="sm:col-span-3 space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Judul Modul Pembelajaran / Materi</label>
                      <input
                        type="text"
                        value={matJudul}
                        onChange={(e) => setMatJudul(e.target.value)}
                        placeholder="Contoh: Modul Ajar Atletik Kids Fase C Kelas VI"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  {/* PDF Upload from computer */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Bahan Buku PDF Materi (Unggah berkas nyata)</label>
                    <div className="flex items-center gap-3 bg-[#f8fafc] border border-gray-200 p-3 rounded-xl">
                      <File className="w-5 h-5 text-red-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{matPdfName || 'Belum memilih Berkas PDF berekstensi .pdf'}</p>
                        <p className="text-[10px] text-gray-400">Akan tersimpan permanen sebagai pustaka digital guru-guru</p>
                      </div>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleMateriPdfChange}
                        className="text-xs text-transparent focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0284c7] file:shadow hover:file:bg-slate-100 cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{matEditId ? 'Simpan Suntingan' : 'Tambah Modul Ajar'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Katalog Materi Pembelajaran Guru Kelas
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-20">Katalog No</th>
                        <th className="p-4 w-6/12">Berkas Panduan / Materi</th>
                        <th className="p-4 w-3/12">Nama File Terarsip</th>
                        <th className="p-4 text-center w-36">Aksi Utama</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(materi, currPageMat).map((item) => (
                        <tr key={item.id} className="hover:bg-slate-50/50">
                          <td className="p-4 font-bold font-mono text-slate-600 text-center text-xs">0{item.no}</td>
                          <td className="p-4 font-bold text-slate-800 uppercase leading-snug">{item.materi}</td>
                          <td className="p-4 font-mono text-red-650 font-semibold">{item.pdfName || 'materi.pdf'}</td>
                          <td className="p-4">
                            <div className="flex gap-1 justify-center">
                              <button
                                onClick={() => openNativePreview(
                                  item.pdfName || item.namaFile || 'materi.pdf', 
                                  item.judulFile || item.materi,
                                  item.pdfData
                                )}
                                className="p-1 px-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded text-[9px]"
                                title="Pratinjau Asli Browser"
                              >
                                Lihat
                              </button>
                              <button
                                onClick={() => handleEditMateri(item)}
                                className="p-1 px-1.5 bg-blue-50 hover:bg-blue-105 text-blue-700 font-bold rounded text-[9px]"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteMateri(item.id)}
                                className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded text-[9px]"
                              >
                                Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      {materi.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-8 text-center text-gray-400 italic">Belum ada materi terupload.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {materi.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {materi.length} entri</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageMat(Math.max(1, currPageMat - 1))} 
                        disabled={currPageMat === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPageMat(Math.min(Math.ceil(materi.length / limit), currPageMat + 1))}
                        disabled={currPageMat * limit >= materi.length}
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

          {/* 7. CHATTING TAB */}
          {activeTab === 'chatting' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-xs text-xs flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full block animate-pulse"></div>
                  <span className="font-bold text-slate-800">Ruang Obrolan Terenkripsi Internal</span>
                </div>
                <span className="text-slate-400">Semua pesan tersimpan di peramban browser</span>
              </div>
              
              <ChatRoom
                currentUser={currentUser}
                chats={chats}
                onSaveChats={onSaveChats}
              />
            </div>
          )}

          {/* 8. PENGATURAN USER TAB */}
          {activeTab === 'pengaturan-user' && (
            <div className="space-y-6">
              
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs">
                <div className="mb-4">
                  <h3 className="font-extrabold text-slate-900 text-sm md:text-base uppercase">Kelola Anggota Guru & Otoritas Masuk</h3>
                  <p className="text-[10px] text-gray-400">Pendaftaran guru olahraga baru, sunting instansi sekolah, pasang password baru, serta unggah avatar anggota dari berkas komputer.</p>
                </div>

                <form onSubmit={handleSaveUser} className="space-y-4">
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Nama Lengkap & Gelar Akademik</label>
                      <input
                        type="text"
                        value={usrNama}
                        onChange={(e) => setUsrNama(e.target.value)}
                        placeholder="Contoh: Ahmad Hidayat, S.Pd."
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Asal Sekolah Dasar</label>
                      <input
                        type="text"
                        value={usrSekolah}
                        onChange={(e) => setUsrSekolah(e.target.value)}
                        placeholder="Contoh: SDN 1 Sukamaju"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Username Pengguna</label>
                      <input
                        type="text"
                        value={usrUsername}
                        onChange={(e) => setUsrUsername(e.target.value)}
                        placeholder="Contoh: ahmad_guru"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Kata Sandi Masuk</label>
                      <input
                        type="text"
                        value={usrPassword}
                        onChange={(e) => setUsrPassword(e.target.value)}
                        placeholder="Tentukan kunci minimal 3 digit"
                        className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-[#0284c7] text-slate-800"
                        required
                      />
                    </div>
                  </div>

                  {/* Foto Input from disk */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 block uppercase tracking-wider">Unggah Foto Anggota Guru (Dari Komputer)</label>
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-gray-250">
                      
                      <div className="w-12 h-12 rounded-full border border-gray-300 bg-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                        {usrFoto ? (
                          <img src={usrFoto} alt="Avatar profile" className="w-full h-full object-cover" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0 text-xs text-slate-600">
                        <p className="font-semibold truncate">{usrFoto ? 'Foto guru berhasil diload' : 'Belum memilih file'}</p>
                        <p className="text-[10px] text-gray-400">Mendukung format PNG atau JPG</p>
                      </div>

                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUsrFotoChange}
                        className="text-xs text-transparent focus:outline-none file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-white file:text-[#0284c7] file:shadow hover:file:bg-slate-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-[#10b981] hover:bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5 text-white" />
                    <span>{usrEditId ? 'Simpan Suntingan Anggota' : 'Daftarkan Guru Baru'}</span>
                  </button>

                </form>
              </div>

              {/* Data Table with Pagination */}
              <div className="bg-white rounded-2xl border border-gray-150 shadow-xs overflow-hidden">
                <div className="bg-[#1e293b] text-white p-4 font-bold text-xs uppercase tracking-wider">
                  Daftar Anggota KKG Terdaftar & Kunci Masuk
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-sans text-xs">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200 text-gray-500 font-bold uppercase">
                        <th className="p-4 w-12 text-center">Foto</th>
                        <th className="p-4 w-4/12">Nama Lengkap & NIP</th>
                        <th className="p-4 w-3/12">Asal Sekolah</th>
                        <th className="p-4 w-2/12">Username / Sandi</th>
                        <th className="p-4 text-center w-36">Aksi Kolektif</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {paginate(users, currPageUsr).map((u) => {
                        const hasImage = u.foto && u.foto.startsWith('data:');
                        return (
                          <tr key={u.id} className="hover:bg-slate-50/50">
                            <td className="p-4">
                              <div className="w-9 h-9 rounded-full bg-sky-200 border border-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                                {hasImage ? (
                                  <img src={u.foto} alt="profile" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-[#0284c7]">{u.nama.substring(0, 1)}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <p className="font-bold text-slate-800 text-xs">{u.nama}</p>
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{u.nip || 'Anggota Mandiri'}</p>
                            </td>
                            <td className="p-4 text-slate-600 font-semibold">{u.sekolah}</td>
                            <td className="p-4 font-mono">
                              <span className="text-emerald-700 font-bold block">U: {u.username}</span>
                              <span className="text-gray-400">P: {u.password}</span>
                            </td>
                            <td className="p-4">
                              <div className="flex gap-1 justify-center">
                                <button
                                  onClick={() => handleEditUser(u)}
                                  className="p-1 px-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded text-[9px]"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u.id)}
                                  disabled={u.role === 'admin'}
                                  className="p-1 px-1.5 bg-red-50 hover:bg-red-100 text-red-650 font-bold rounded disabled:opacity-30 text-[9px]"
                                  title={u.role === 'admin' ? 'Akun admin utama tidak bisa dibuang' : 'Hapus'}
                                >
                                  Hapus
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {users.length > limit && (
                  <div className="p-4 bg-slate-50 flex items-center justify-between border-t border-gray-200">
                    <span className="text-xs text-gray-400">Total: {users.length} pengguna</span>
                    <div className="flex gap-1.5">
                      <button 
                        onClick={() => setCurrPageUsr(Math.max(1, currPageUsr - 1))} 
                        disabled={currPageUsr === 1}
                        className="p-1 px-2.5 bg-white border border-gray-200 hover:bg-gray-100 disabled:opacity-50 text-[10px] rounded transition-colors font-bold"
                      >
                        Kembali
                      </button>
                      <button 
                        onClick={() => setCurrPageUsr(Math.min(Math.ceil(users.length / limit), currPageUsr + 1))}
                        disabled={currPageUsr * limit >= users.length}
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

          {activeTab === 'koneksi-supabase' && (
            <div className="space-y-6 animate-fade-in text-slate-800">
              
              {/* Header Info */}
              <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-[#0284c7] font-black text-xs uppercase tracking-widest">
                    <Database className="w-4 h-4 text-emerald-500 animate-bounce" />
                    <span>Integrasi Supabase Cloud</span>
                  </div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-slate-900 mt-1 uppercase">
                    Koneksi & Sinkronisasi Database
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-2xl">
                    Sistem ini terhubung langsung ke project Supabase <span className="font-bold text-slate-700">KKG Gugus Padaawas</span> secara cloud real-time. Anda dapat memantau status koneksi, menjalankan migrasi data lokal, dan menyalin skema database di bawah ini.
                  </p>
                </div>
                
                <div className="flex flex-col items-end shrink-0">
                  {supabaseStatus.missingTables.length > 0 ? (
                    <div className="bg-amber-50 border border-amber-200 text-amber-750 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">Perlu Setup Tabel</span>
                    </div>
                  ) : (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xs">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      <span className="text-[11px] font-extrabold uppercase tracking-wider font-sans">Koneksi Aktif & Sempurna</span>
                    </div>
                  )}
                  <p className="text-[9px] text-gray-400 font-mono mt-1 w-full text-right uppercase tracking-wider">Project ID: mgipervnltbxciaowfya</p>
                </div>
              </div>

              {/* Status Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* 1. Koneksi Details */}
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-4">Informasi Project</h3>
                    <div className="space-y-3.5">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Project Name</span>
                        <span className="text-xs font-bold text-slate-800">KKG Gugus Padaawas</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">API Gateway URL</span>
                        <span className="text-[10px] font-mono break-all text-slate-650 bg-slate-50 p-2 rounded-lg border border-slate-100 block mt-1">https://mgipervnltbxciaowfya.supabase.co</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase font-bold">Public Key</span>
                        <div className="relative mt-1">
                          <input 
                            type="password" 
                            value="sb_publishable_Jk2ycxkGICGbVj8mSK6avQ_sHBiwnsN" 
                            disabled 
                            className="w-full text-[10px] font-mono bg-slate-50 border border-slate-100 rounded-lg p-2 pr-10 text-slate-400 select-none" 
                          />
                          <span className="absolute right-3 top-2.5 text-[9px] text-emerald-600 font-mono font-bold uppercase select-none">Anon Key</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                      <Wifi className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase font-black tracking-wider">Gateway Status</p>
                      <p className="text-xs font-extrabold text-slate-800">Online & Siap Pakai</p>
                    </div>
                  </div>
                </div>

                {/* 2. Migration Seeder Engine */}
                <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 lg:col-span-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Unggah Cadangan Lokal ke Cloud (Migrasi)</h3>
                      <span className="text-[9px] bg-sky-500/10 text-sky-600 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider font-sans">Pencadangan Instan</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Layanan ini memindahkan seluruh data lokal yang saat ini tersimpan di browser Anda (<span className="font-semibold text-slate-700">localStorage</span>) langsung naik ke cloud database <span className="font-semibold text-slate-700">Supabase</span> Anda. Berguna untuk sinkronisasi awal saat setup selesai dilakukan atau sebagai fungsi backup terjadwal.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5">
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[11px] font-black text-slate-800 block">{tentangKami.length}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-bold mt-0.5">Tentang Kami</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[11px] font-black text-slate-800 block">{programKerja.length}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-bold mt-0.5">Prog Kerja</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[11px] font-black text-slate-800 block">{informasi.length}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-bold mt-0.5">Informasi</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center">
                        <span className="text-[11px] font-black text-slate-800 block">{users.length}</span>
                        <span className="text-[9px] text-gray-400 uppercase tracking-wider block font-bold mt-0.5">Pengguna</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100">
                    {migrationStatus === 'running' ? (
                      <div className="flex items-center gap-3 text-xs font-bold text-[#0284c7] bg-sky-50/50 p-3 rounded-2xl border border-sky-100">
                        <RefreshCw className="w-4 h-4 animate-spin text-[#0284c7]" />
                        <span>Mengeksekusi migrasi data... Harap tunggu beberapa saat.</span>
                      </div>
                    ) : migrationStatus === 'success' ? (
                      <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-3 rounded-2xl text-[11px] leading-relaxed mb-4">
                        <p className="font-extrabold flex items-center gap-2 text-emerald-700 uppercase tracking-wider">🎉 SINKRONISASI BERHASIL!</p>
                        <p className="text-emerald-600 mt-1">Seluruh data lokal Anda telah berhasil dipublikasikan naik ke sistem cloud database Supabase. Semua guru sekarang akan membaca data cloud yang sama!</p>
                      </div>
                    ) : migrationStatus === 'error' ? (
                      <div className="bg-red-50 border border-red-100 text-red-800 p-3 rounded-2xl text-[11px] leading-relaxed mb-4">
                        <p className="font-extrabold flex items-center gap-2 text-red-750 uppercase tracking-wider">⚠️ SINKRONISASI CO-MIGRATION GAGAL</p>
                        <p className="text-red-600 mt-1">{migrationError}</p>
                      </div>
                    ) : null}

                    {migrationStatus !== 'running' && (
                      <button
                        onClick={handleMigrateToSupabase}
                        className="w-full flex items-center justify-center gap-2.5 py-3 px-5 bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-semibold uppercase tracking-widest rounded-2xl shadow-md transition-all cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <RefreshCw className="w-4.5 h-4.5" />
                        <span>Luncurkan Sinkronisasi Data Lokal ke Supabase Cloud</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

              {/* Step-by-Step setup SQL Codeblock section */}
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-650 flex items-center justify-center font-bold text-xs">🛠️</span>
                      Panduan Setup Awal (Jalankan SQL di Supabase)
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Jika Anda mengalami error migrasi, itu dikarenakan tabel belum dibuat. Silakan salin script SQL di bawah dan jalankan di Dashboard Supabase Anda.
                    </p>
                  </div>
                  
                  <button
                    onClick={handleCopySql}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    {copiedSql ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600 animate-scale-in" />
                        <span className="text-emerald-700">Tersalin ke Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4 text-slate-600" />
                        <span>Salin Script SQL Lengkap</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                    <p className="text-[11px] text-slate-600 leading-relaxed font-bold">
                      Langkah-langkah Eksekusi di Supabase:
                    </p>
                    <ol className="list-decimal text-slate-500 text-[11px] space-y-1.5 pl-4 mt-2">
                      <li>Buka Dashboard Supabase Anda: <a href="https://supabase.com/dashboard/project/mgipervnltbxciaowfya/sql" target="_blank" rel="noreferrer" className="text-[#0284c7] font-semibold underline">SQL Editor Link</a></li>
                      <li>Klik tombol <span className="font-semibold text-slate-705">"New Query"</span> di sidebar bagian kiri atas.</li>
                      <li>Klik tombol <span className="font-bold text-[#0284c7]">"Salin Script SQL Lengkap"</span> di atas, lalu <span className="font-semibold text-slate-705">Paste (Ctrl+V)</span> seluruh kode ke dalam SQL Editor Supabase.</li>
                      <li>Klik tombol <span className="font-extrabold text-emerald-600">"RUN"</span> di sudut kanan bawah editor.</li>
                      <li>Selesai! Skema database siap dan Anda bisa langsung menekan tombol <span className="font-semibold">"Luncurkan Sincronisasi"</span> di atas.</li>
                    </ol>
                  </div>

                  {/* Schema SQL Preview code box */}
                  <div className="relative rounded-2xl overflow-hidden border border-slate-200 bg-[#0f172a] text-slate-205 text-[10px] font-mono leading-relaxed max-h-[300px] overflow-y-auto">
                    <div className="absolute top-3 right-3 z-10">
                      <span className="bg-white/10 px-2 py-0.5 rounded text-[8px] text-slate-400 uppercase tracking-wider font-sans select-none">SQL Schema (Ready)</span>
                    </div>
                    <pre className="p-4 whitespace-pre-wrap select-all">{SCHEMA_SQL}</pre>
                  </div>
                </div>
              </div>

            </div>
          )}

        </main>

      </div>

      {/* FOOTER ON ALL PAGES */}
      <footer className="bg-slate-900 text-slate-500 text-[11px] py-4 border-t border-slate-800 text-center select-none relative z-10 w-full mt-auto">
        <p>@2026 kkg gugus padaawas kecamatan pasirwangi</p>
      </footer>

      {/* 2. INLINE PROFILE SUNTING MODAL DISPLAY */}
      {isEditingProfile && (
        <div id="prof-modal" className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-lg p-6 md:p-8 animate-fade-in text-slate-800">
            
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 mb-5">
              <h3 className="font-extrabold text-sm md:text-base text-slate-900 uppercase tracking-wide">Sunting Profil Guru</h3>
              <button 
                onClick={() => setIsEditingProfile(false)}
                className="text-gray-400 hover:text-slate-800 font-bold p-1 hover:bg-gray-100 rounded-lg text-xs"
              >
                Tutup
              </button>
            </div>

            <form onSubmit={handleUpdateProfileSubmit} className="space-y-4">
              
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block uppercase">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-755 block uppercase">NIP Pegawai</label>
                <input
                  type="text"
                  value={profNip}
                  onChange={(e) => setProfNip(e.target.value)}
                  className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-705 block uppercase">Sekolah Induk</label>
                  <input
                    type="text"
                    value={profSchool}
                    onChange={(e) => setProfSchool(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-705 block uppercase">Jabatan Struktural</label>
                  <input
                    type="text"
                    value={profJabatan}
                    onChange={(e) => setProfJabatan(e.target.value)}
                    className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              {/* Photo component */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-705 block uppercase">Unggah Foto Baru Anda (Base64)</label>
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
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Simpan Perubahan</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Render selected PDF inline modal reader preview */}
      {selectedPdfToView && (
        <PdfPreviewModal
          isOpen={true}
          onClose={() => setSelectedPdfToView(null)}
          pdfName={selectedPdfToView.name}
          pdfTitle={selectedPdfToView.title}
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

      {/* Dynamic Pop-up Modal for Safe Delete Confirmation */}
      {deleteConf.isOpen && (
        <div id="delete-confirmation-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in" style={{ animationDuration: '200ms' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-red-100 flex flex-col items-center text-center animate-scale-in animate-duration-200" style={{ animationDuration: '200ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-500 animate-bounce">
              <Trash2 className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
              {deleteConf.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-2.5 max-w-xs">
              {deleteConf.description}
            </p>
            {deleteConf.itemName && (
              <div className="w-full mt-3 bg-red-50/50 p-2.5 rounded-xl border border-dotted border-red-200">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block">Item yang Dipilih</span>
                <span className="text-[11px] text-slate-700 font-extrabold block truncate mt-0.5">{deleteConf.itemName}</span>
              </div>
            )}
            <div className="flex gap-2.5 w-full mt-6">
              <button
                type="button"
                onClick={() => setDeleteConf({ isOpen: false, idToDelete: null, type: null, title: '', description: '', itemName: '' })}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedDelete}
                className="w-1/2 py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-xl shadow-md uppercase tracking-wider transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
