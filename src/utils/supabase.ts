import { createClient } from '@supabase/supabase-js';
import { TentangKami, ProgramKerja, Informasi, DokumenGaleri, Materi, MateriUser, User, ChatMessage } from '../types';

// Load credentials with standard safe fallbacks
const SUPABASE_URL = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://mgipervnltbxciaowfya.supabase.co';
const SUPABASE_ANON_KEY = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Jk2ycxkGICGbVj8mSK6avQ_sHBiwnsN';

// Standard clean base URL
const cleanUrl = SUPABASE_URL.trim().replace(/\/rest\/v1\/?$/, '');

// Create Supabase Client
export const supabase = createClient(cleanUrl, SUPABASE_ANON_KEY);

// Helper state to track if a table is verified to exist or missing
export const supabaseStatus = {
  isConnected: true,
  missingTables: [] as string[],
};

// Key helper mapping functions to bridge modern DB standards and React's camelCase interfaces
const mappers = {
  tentangKami: {
    toDb: (item: TentangKami) => ({
      id: item.id,
      deskripsi: item.deskripsi,
      visi: item.visi,
      misi: item.misi,
      date: item.date
    }),
    toApp: (row: any): TentangKami => ({
      id: row.id,
      deskripsi: row.deskripsi || '',
      visi: row.visi || '',
      misi: row.misi || '',
      date: row.date || ''
    })
  },
  programKerja: {
    toDb: (item: ProgramKerja) => ({
      id: item.id,
      judul: item.judul,
      deskripsi: item.deskripsi
    }),
    toApp: (row: any): ProgramKerja => ({
      id: row.id,
      judul: row.judul || '',
      deskripsi: row.deskripsi || ''
    })
  },
  informasi: {
    toDb: (item: Informasi) => ({
      id: item.id,
      tanggal: item.tanggal,
      judul: item.judul,
      isi: item.isi,
      pdf_name: item.pdfName,
      pdf_data: item.pdfData
    }),
    toApp: (row: any): Informasi => ({
      id: row.id,
      tanggal: row.tanggal || '',
      judul: row.judul || '',
      isi: row.isi || '',
      pdfName: row.pdf_name || '',
      pdfData: row.pdf_data || ''
    })
  },
  galeri: {
    toDb: (item: DokumenGaleri) => ({
      id: item.id,
      judul: item.judul,
      sub_judul: item.subJudul,
      deskripsi: item.deskripsi,
      foto: item.foto
    }),
    toApp: (row: any): DokumenGaleri => ({
      id: row.id,
      judul: row.judul || '',
      subJudul: row.sub_judul || '',
      deskripsi: row.deskripsi || '',
      foto: row.foto || ''
    })
  },
  materi: {
    toDb: (item: Materi) => ({
      id: item.id,
      no: item.no,
      materi: JSON.stringify({
        judul: item.judulFile || item.materi,
        mapel: item.mapel || 'Umum',
        kelas: item.kelas || 'Semua Kelas',
        namaFile: item.namaFile || item.pdfName,
        fileFormat: item.fileFormat || 'pdf'
      }),
      pdf_name: item.pdfName,
      pdf_data: item.pdfData
    }),
    toApp: (row: any): Materi => {
      let isJson = false;
      let parsed: any = {};
      const rawText = row.materi || '';
      if (rawText.trim().startsWith('{')) {
        try {
          parsed = JSON.parse(rawText);
          isJson = true;
        } catch (e) {
          // ignore parsing error
        }
      }
      return {
        id: row.id,
        no: row.no || '',
        materi: isJson ? (parsed.judul || '') : rawText,
        pdfName: row.pdf_name || '',
        pdfData: row.pdf_data || '',
        mapel: isJson ? (parsed.mapel || 'Umum') : 'Umum',
        kelas: isJson ? (parsed.kelas || 'Semua Kelas') : 'Semua Kelas',
        namaFile: isJson ? (parsed.namaFile || row.pdf_name || '') : (row.pdf_name || ''),
        judulFile: isJson ? (parsed.judul || '') : rawText,
        fileFormat: isJson ? (parsed.fileFormat || 'pdf') : 'pdf'
      };
    }
  },
  materiUser: {
    toDb: (item: MateriUser) => ({
      id: item.id,
      no: item.no,
      materi: JSON.stringify({
        judul: item.judulFile || item.materi,
        mapel: item.mapel || 'Umum',
        kelas: item.kelas || 'Semua Kelas',
        namaFile: item.namaFile || item.pdfName,
        fileFormat: item.fileFormat || 'pdf'
      }),
      pdf_name: item.pdfName,
      pdf_data: item.pdfData,
      user_id: item.userId || '',
      user_name: item.userName || '',
      user_sekolah: item.userSekolah || ''
    }),
    toApp: (row: any): MateriUser => {
      let isJson = false;
      let parsed: any = {};
      const rawText = row.materi || '';
      if (rawText.trim().startsWith('{')) {
        try {
          parsed = JSON.parse(rawText);
          isJson = true;
        } catch (e) {
          // ignore parsing error
        }
      }
      return {
        id: row.id,
        no: row.no || '',
        materi: isJson ? (parsed.judul || '') : rawText,
        pdfName: row.pdf_name || '',
        pdfData: row.pdf_data || '',
        mapel: isJson ? (parsed.mapel || 'Umum') : 'Umum',
        kelas: isJson ? (parsed.kelas || 'Semua Kelas') : 'Semua Kelas',
        namaFile: isJson ? (parsed.namaFile || row.pdf_name || '') : (row.pdf_name || ''),
        judulFile: isJson ? (parsed.judul || '') : rawText,
        fileFormat: isJson ? (parsed.fileFormat || 'pdf') : 'pdf',
        userId: row.user_id || '',
        userName: row.user_name || '',
        userSekolah: row.user_sekolah || ''
      };
    }
  },
  user: {
    toDb: (item: User) => ({
      id: item.id,
      nama: item.nama,
      sekolah: item.sekolah || '',
      username: item.username,
      password: item.password,
      nip: item.nip || '',
      jabatan: item.jabatan || '',
      foto: item.foto || '',
      role: item.role,
      email: item.email || ''
    }),
    toApp: (row: any): User => ({
      id: row.id,
      nama: row.nama || '',
      sekolah: row.sekolah || '',
      username: row.username || '',
      password: row.password || '',
      nip: row.nip || '',
      jabatan: row.jabatan || '',
      foto: row.foto || '',
      role: (row.role === 'admin' ? 'admin' : 'user'),
      email: row.email || ''
    })
  },
  chat: {
    toDb: (item: ChatMessage) => ({
      id: item.id,
      sender_id: item.senderId,
      sender_name: item.senderName,
      sender_role: item.senderRole,
      sender_foto: item.senderFoto || '',
      text: item.text,
      timestamp: item.timestamp,
      file_url: item.fileUrl || null,
      file_name: item.fileName || null,
      file_type: item.fileType || null,
      deleted_by: item.deletedBy ? JSON.stringify(item.deletedBy) : '[]',
      deleted_for_all: !!item.deletedForAll
    }),
    toApp: (row: any): ChatMessage => {
      let parsedDeletedBy: string[] = [];
      try {
        if (typeof row.deleted_by === 'string') {
          parsedDeletedBy = JSON.parse(row.deleted_by);
        } else if (Array.isArray(row.deleted_by)) {
          parsedDeletedBy = row.deleted_by;
        }
      } catch (e) {
        parsedDeletedBy = [];
      }
      return {
        id: row.id,
        senderId: row.sender_id || '',
        senderName: row.sender_name || '',
        senderRole: row.sender_role === 'admin' ? 'admin' : 'user',
        senderFoto: row.sender_foto || '',
        text: row.text || '',
        timestamp: row.timestamp || '',
        fileUrl: row.file_url || undefined,
        fileName: row.file_name || undefined,
        fileType: row.file_type || undefined,
        deletedBy: parsedDeletedBy,
        deletedForAll: !!row.deleted_for_all
      };
    }
  }
};

// Log missing table helper and connection status tracking
let isOfflineFlag = false;

// Helper to determine if we should fail fast to prevent connection warnings spam
const checkOffline = (error: any): boolean => {
  if (error) {
    const errorStr = String(error.message || error).toLowerCase();
    if (
      errorStr.includes('failed to fetch') || 
      errorStr.includes('fetch') || 
      errorStr.includes('networkerror') || 
      errorStr.includes('load failed') ||
      errorStr.includes('csp') ||
      errorStr.includes('cors')
    ) {
      if (!isOfflineFlag) {
        isOfflineFlag = true;
        console.log("%c[DATABASE SUBLIME FALLBACK] Koneksi Supabase offline/tidak terjangkau. Beralih menggunakan Penyimpanan Lokal secara optimal dan hening.", "color: #0284c7; font-weight: bold;");
      }
      return true;
    }
  }
  return isOfflineFlag;
};

function markMissingTable(rawTableName: string, err: any) {
  if (checkOffline(err)) return;
  const pgresTableNotExistCodes = ['42P01'];
  if (err && pgresTableNotExistCodes.includes(err.code)) {
    if (!supabaseStatus.missingTables.includes(rawTableName)) {
      supabaseStatus.missingTables.push(rawTableName);
    }
  }
}

// Durable Database Actions API
export const db = {
  // 1. TENTANG KAMI
  async getTentangKami(localFallback: TentangKami[]): Promise<TentangKami[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('tentang_kami').select('*').order('id', { ascending: true });
      if (error) {
        markMissingTable('tentang_kami', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.tentangKami.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading tentang_kami path failed.', e);
      }
      return localFallback;
    }
  },
  async saveTentangKami(items: TentangKami[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const mapped = items.map(mappers.tentangKami.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('tentang_kami').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving tentang_kami to Supabase:', e);
      }
    }
  },

  // 2. PROGRAM KERJA
  async getProgramKerja(localFallback: ProgramKerja[]): Promise<ProgramKerja[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('program_kerja').select('*').order('id', { ascending: true });
      if (error) {
        markMissingTable('program_kerja', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.programKerja.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading program_kerja failed.', e);
      }
      return localFallback;
    }
  },
  async saveProgramKerja(items: ProgramKerja[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      // First try deleting items that are no longer present
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('program_kerja').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.programKerja.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('program_kerja').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving program_kerja to Supabase:', e);
      }
    }
  },

  // 3. INFORMASI
  async getInformasi(localFallback: Informasi[]): Promise<Informasi[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('informasi').select('*').order('tanggal', { ascending: false });
      if (error) {
        markMissingTable('informasi', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.informasi.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading informasi failed.', e);
      }
      return localFallback;
    }
  },
  async saveInformasi(items: Informasi[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('informasi').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.informasi.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('informasi').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving informasi to Supabase:', e);
      }
    }
  },

  // 4. DOKUMEN GALERI
  async getDokumenGaleri(localFallback: DokumenGaleri[]): Promise<DokumenGaleri[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('dokumen_galeri').select('*').order('id', { ascending: true });
      if (error) {
        markMissingTable('dokumen_galeri', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.galeri.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading galeri failed.', e);
      }
      return localFallback;
    }
  },
  async saveDokumenGaleri(items: DokumenGaleri[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('dokumen_galeri').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.galeri.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('dokumen_galeri').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving galeri to Supabase:', e);
      }
    }
  },

  // 5. MATERI
  async getMateri(localFallback: Materi[]): Promise<Materi[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('materi').select('*').order('no', { ascending: true });
      if (error) {
        markMissingTable('materi', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.materi.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading materi failed.', e);
      }
      return localFallback;
    }
  },
  async saveMateri(items: Materi[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('materi').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.materi.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('materi').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving materi to Supabase:', e);
      }
    }
  },

  // 10. MATERI_USER (Materi Khusus untuk User)
  async getMateriUser(localFallback: MateriUser[]): Promise<MateriUser[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('materi_user').select('*').order('no', { ascending: true });
      if (error) {
        markMissingTable('materi_user', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.materiUser.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading materi_user failed.', e);
      }
      return localFallback;
    }
  },
  async saveMateriUser(items: MateriUser[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('materi_user').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.materiUser.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('materi_user').upsert(item);
        if (error) throw error;
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving materi_user to Supabase:', e);
        throw e;
      }
    }
  },

  // 6. USERS
  async getUsers(localFallback: User[]): Promise<User[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('users').select('*').order('nama', { ascending: true });
      if (error) {
        markMissingTable('users', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.user.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading users failed.', e);
      }
      return localFallback;
    }
  },
  async saveUsers(items: User[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        await supabase.from('users').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.user.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('users').upsert(item);
        if (error) {
          // Check for undefined column (PostgreSQL code 42703 or message indicates email column error)
          if (error.code === '42703' || (error.message && error.message.toLowerCase().includes('email'))) {
            const { email, ...itemWithoutEmail } = item;
            const { error: retryError } = await supabase.from('users').upsert(itemWithoutEmail);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving users to Supabase:', e);
      }
    }
  },

  // 7. CHATS
  async getChats(localFallback: ChatMessage[]): Promise<ChatMessage[]> {
    if (isOfflineFlag) return localFallback;
    try {
      const { data, error } = await supabase.from('chats').select('*').order('timestamp', { ascending: true });
      if (error) {
        markMissingTable('chats', error);
        throw error;
      }
      return data && data.length > 0 ? data.map(mappers.chat.toApp) : localFallback;
    } catch (e) {
      if (!checkOffline(e)) {
        console.warn('Fallback: reading chats failed.', e);
      }
      return localFallback;
    }
  },
  async saveChats(items: ChatMessage[]): Promise<void> {
    if (isOfflineFlag) return;
    try {
      const itemIds = items.map(i => i.id);
      if (itemIds.length > 0) {
        // delete chats older or deleted
        await supabase.from('chats').delete().not('id', 'in', `(${itemIds.join(',')})`);
      }
      
      const mapped = items.map(mappers.chat.toDb);
      for (const item of mapped) {
        const { error } = await supabase.from('chats').upsert(item);
        if (error) {
          // Check for missing custom new features columns (deleted_by or deleted_for_all)
          if (error.code === '42703' || (error.message && (error.message.toLowerCase().includes('deleted_by') || error.message.toLowerCase().includes('deleted_for_all')))) {
            const { deleted_by, deleted_for_all, ...itemWithoutNewCols } = item;
            const { error: retryError } = await supabase.from('chats').upsert(itemWithoutNewCols);
            if (retryError) throw retryError;
          } else {
            throw error;
          }
        }
      }
    } catch (e) {
      if (!checkOffline(e)) {
        console.error('Error saving chats to Supabase:', e);
      }
    }
  },

  // One-click Migration Tool: Push all current localStorage values into Supabase tables
  async migrateLocalToSupabase(
    tk: TentangKami[],
    pk: ProgramKerja[],
    info: Informasi[],
    g: DokumenGaleri[],
    mat: Materi[],
    usr: User[],
    ch: ChatMessage[],
    matUser: MateriUser[]
  ): Promise<{ success: boolean; attempted: string[]; failed: { table: string; error: string }[] }> {
    const attempted: string[] = [];
    const failed: { table: string; error: string }[] = [];

    if (isOfflineFlag) {
      return {
        success: false,
        attempted: [],
        failed: [{ table: 'all', error: 'Koneksi cloud Supabase offline atau tidak terjangkau.' }]
      };
    }

    const uploadTable = async (tableName: string, items: any[], mapFn: (item: any) => any) => {
      attempted.push(tableName);
      try {
        const mapped = items.map(mapFn);
        for (const item of mapped) {
          const { error } = await supabase.from(tableName).upsert(item);
          if (error) {
            // Check for missing columns error (PostgreSQL undefined column 42703)
            if (error.code === '42703' || (error.message && error.message.toLowerCase().includes('column'))) {
              if (tableName === 'users') {
                const { email, ...itemWithoutEmail } = item;
                const { error: retryError } = await supabase.from(tableName).upsert(itemWithoutEmail);
                if (retryError) throw retryError;
              } else if (tableName === 'chats') {
                const { deleted_by, deleted_for_all, ...itemWithoutNewCols } = item;
                const { error: retryError } = await supabase.from(tableName).upsert(itemWithoutNewCols);
                if (retryError) throw retryError;
              } else {
                throw error;
              }
            } else {
              throw error;
            }
          }
        }
        // Remove from missingTables list if it is present
        supabaseStatus.missingTables = supabaseStatus.missingTables.filter(t => t !== tableName);
      } catch (err: any) {
        if (!checkOffline(err)) {
          console.error(`Migration error on table [${tableName}]:`, err);
        }
        failed.push({ table: tableName, error: err.message || JSON.stringify(err) });
        markMissingTable(tableName, err);
      }
    };

    if (tk.length > 0) await uploadTable('tentang_kami', tk, mappers.tentangKami.toDb);
    if (pk.length > 0) await uploadTable('program_kerja', pk, mappers.programKerja.toDb);
    if (info.length > 0) await uploadTable('informasi', info, mappers.informasi.toDb);
    if (g.length > 0) await uploadTable('dokumen_galeri', g, mappers.galeri.toDb);
    if (mat.length > 0) await uploadTable('materi', mat, mappers.materi.toDb);
    if (usr.length > 0) await uploadTable('users', usr, mappers.user.toDb);
    if (ch.length > 0) await uploadTable('chats', ch, mappers.chat.toDb);
    if (matUser.length > 0) await uploadTable('materi_user', matUser, mappers.materiUser.toDb);

    return {
      success: failed.length === 0,
      attempted,
      failed
    };
  }
};
