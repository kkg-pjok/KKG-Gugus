export interface TentangKami {
  id: string;
  deskripsi: string;
  visi: string;
  misi: string;
  date: string;
}

export interface ProgramKerja {
  id: string;
  judul: string;
  deskripsi: string;
}

export interface Informasi {
  id: string;
  tanggal: string;
  judul: string;
  isi: string;
  pdfName: string;
  pdfData: string; // Base64 data or mock base64 placeholder
}

export interface DokumenGaleri {
  id: string;
  judul: string;
  subJudul: string;
  deskripsi: string;
  foto: string; // Base64 data uploaded from disk
}

export interface Materi {
  id: string;
  no: string;
  materi: string;
  pdfName: string;
  pdfData: string; // Base64 data
  mapel?: string;
  kelas?: string;
  namaFile?: string;
  judulFile?: string;
  fileFormat?: 'pdf' | 'word';
}

export interface MateriUser {
  id: string;
  no: string;
  materi: string;
  pdfName: string;
  pdfData: string; // Base64 data
  mapel?: string;
  kelas?: string;
  namaFile?: string;
  judulFile?: string;
  fileFormat?: 'pdf' | 'word';
  userId?: string;     // ID user yang mengunggah
  userName?: string;   // Nama user yang mengunggah
  userSekolah?: string; // Sekolah asal user yang mengunggah
}

export interface User {
  id: string;
  nama: string;
  sekolah: string;
  username: string;
  password: string;
  nip: string;
  jabatan: string;
  foto: string; // Base64 data uploaded from disk
  role: 'admin' | 'user';
  email?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: 'admin' | 'user';
  senderFoto: string;
  text: string;
  timestamp: string;
  fileUrl?: string; // base64 attachment
  fileName?: string;
  fileType?: string; // e.g. 'image/png' or 'application/pdf'
  deletedBy?: string[]; // user IDs who deleted this message for themselves
  deletedForAll?: boolean;
}
