import { TentangKami, ProgramKerja, Informasi, DokumenGaleri, Materi, MateriUser, User, ChatMessage } from '../types';

// Default Mock Data
const DEFAULT_TENTANG_KAMI: TentangKami[] = [
  {
    id: "tk-1",
    deskripsi: "KKG Gugus Padaawas Pasirwangi adalah wadah kerja profesional seluruh guru kelas di wilayah Kecamatan Pasirwangi. Berdiri atas dasar kebutuhan meningkatkan kualifikasi, literasi, kompetensi pedagogik, serta profesionalisme guru kelas demi menumbuhkan anak didik yang unggul, kreatif, dan berkarakter luhur.",
    visi: "Mewujudkan forum guru kelas Gugus Padaawas yang profesional, bersinergi, unggul dalam literasi pembelajaran, serta berkarakter Islami dan literat teknologi pada tahun 2028.",
    misi: "1. Menggelar forum ilmiah, bedah kisi-kisi, serta penyusunan modul ajar Kurikulum Merdeka secara kontinyu bagi guru kelas.\n2. Mengembangkan metode pembelajaran yang kreatif, inovatif, dan menyenangkan untuk kelas awal maupun kelas tinggi.\n3. Membangun jejaring komunikasi aktif antar guru kelas se-Pasirwangi untuk meningkatkan kualitas pendidikan dasar.",
    date: "2026-06-06"
  }
];

const DEFAULT_PROGRAM_KERJA: ProgramKerja[] = [
  {
    id: "pk-1",
    judul: "Workshop Asesmen Pembelajaran Kurikulum Merdeka bagi Guru Kelas",
    deskripsi: "Penyusunan instrumen penilaian harian dan asesmen sumatif sekolah dasar berbasis aplikasi digital untuk memudahkan guru kelas mengelola nilai rapor."
  },
  {
    id: "pk-2",
    judul: "Festival Sains & Kreativitas Pelajar Gugus Padaawas (FSKP)",
    deskripsi: "Mengembangkan kreativitas, minat sains, dan bakat seni murid tingkat sekolah dasar se-Gugus Padaawas secara berkala."
  },
  {
    id: "pk-3",
    judul: "Pelatihan Literasi & Numerasi Kreatif Guru Kelas Pasirwangi",
    deskripsi: "Penerapan metode bermain sambil belajar untuk meningkatkan pemahaman literasi membaca dan numerasi di sekolah dasar."
  }
];

const DEFAULT_INFORMASI: Informasi[] = [
  {
    id: "info-1",
    tanggal: "2026-06-05",
    judul: "Undangan Rapat Kerja Bulanan KKG Gugus Padaawas",
    isi: "Yth. Rekan-rekan Guru Kelas se-Gugus Padaawas. Diharapkan kehadirannya pada rapat rutin penutupan program akademik semester genap yang akan diadakan di SDN 3 Padaawas pada hari Rabu, 10 Juni 2026.",
    pdfName: "undangan_rapat_rutin_juni_2026.pdf",
    pdfData: "MOCK_PDF_DATA_UNDANGAN"
  },
  {
    id: "info-2",
    tanggal: "2026-06-02",
    judul: "Petunjuk Teknis FLS2N & OSN Tingkat Kecamatan Pasirwangi Tahun 2026",
    isi: "Berikut disampaikan berkas juknis resmi pelaksanaan Festival Lomba Seni Siswa Nasional (FLS2N) dan OSN tingkat Kecamatan Pasirwangi untuk siswa sekolah dasar.",
    pdfName: "juknis_fls2n_pasirwangi_2026.pdf",
    pdfData: "MOCK_PDF_DATA_JUKNIS"
  }
];

const DEFAULT_DOKUMEN_GALERI: DokumenGaleri[] = [
  {
    id: "gal-1",
    judul: "Workshop Pembuatan Alat Peraga Edukatif Guru Pasirwangi",
    subJudul: "Sinergi Guru Kelas",
    deskripsi: "Pembuatan alat peraga pembelajaran ramah lingkungan guna menunjang pemahaman materi di dalam kelas dasar.",
    foto: "DEFAULT_IMAGE_1"
  },
  {
    id: "gal-2",
    judul: "Penyusunan Silabus dan Kisi-kisi Evaluasi Belajar",
    subJudul: "Kurikulum Merdeka",
    deskripsi: "Pengurus KKG memberikan contoh panduan penyusunan capaian pembelajaran terbaru untuk tingkat SD Kelas 1-6.",
    foto: "DEFAULT_IMAGE_2"
  }
];

const DEFAULT_MATERI: Materi[] = [
  {
    id: "mat-1",
    no: "1",
    materi: "Modul Ringkas Pengajaran Calistung dan Pembelajaran Berdiferensiasi",
    pdfName: "modul_atletik_kids_2026.pdf",
    pdfData: "MOCK_PDF_MATERI_1"
  },
  {
    id: "mat-2",
    no: "2",
    materi: "Pedoman Kriteria Ketercapaian Tujuan Pembelajaran (KKTP) Guru Kelas SD",
    pdfName: "pedoman_kktp_kelas6.pdf",
    pdfData: "MOCK_PDF_MATERI_2"
  },
  {
    id: "mat-3",
    no: "3",
    materi: "Video Panduan Media Pembelajaran Berbasis STEM di Sekolah Dasar",
    pdfName: "panduan_media_pembelajaran_stem.pdf",
    pdfData: "MOCK_PDF_MATERI_3"
  }
];

const DEFAULT_USERS: User[] = [
  {
    id: "usr-admin",
    nama: "H. Cecep Supriatna, S.Pd., M.M.",
    sekolah: "SDN 1 Padaawas",
    username: "admin",
    password: "ggspds",
    nip: "197805122008011003",
    jabatan: "Ketua KKG Gugus Padaawas",
    foto: "",
    role: "admin"
  },
  {
    id: "usr-1",
    nama: "Budi Gunawan, S.Pd.",
    sekolah: "",
    username: "budi",
    password: "123",
    nip: "199408222020121013",
    jabatan: "Sekretaris KKG / Guru Kelas",
    foto: "",
    role: "user"
  },
  {
    id: "usr-2",
    nama: "Siti Rahmawati, S.Pd.",
    sekolah: "SDN 3 Padaawas",
    username: "siti",
    password: "123",
    nip: "199105152019032009",
    jabatan: "Bendahara KKG / Guru Kelas",
    foto: "",
    role: "user"
  }
];

const DEFAULT_CHATS: ChatMessage[] = [
  {
    id: "chat-1",
    senderId: "usr-admin",
    senderName: "H. Cecep Supriatna, S.Pd.",
    senderRole: "admin",
    senderFoto: "",
    text: "Assalamualaikum rekan-rekan guru kelas Gugus Padaawas. Jangan lupa membawa draf modul ajar besok pagi ya saat rapat.",
    timestamp: "08:15"
  },
  {
    id: "chat-2",
    senderId: "usr-1",
    senderName: "Budi Gunawan, S.Pd.",
    senderRole: "user",
    senderFoto: "",
    text: "Waalaikumussalam Pak Ketua. Siap, draf modul ajar kelas IV dan V sudah dicetak dan siap dipresentasikan.",
    timestamp: "08:30"
  },
  {
    id: "chat-3",
    senderId: "usr-2",
    senderName: "Siti Rahmawati, S.Pd.",
    senderRole: "user",
    senderFoto: "",
    text: "Insya Allah hadir membawa rekapitulasi iuran kas KKG.",
    timestamp: "08:42"
  }
];

// LocalStorage helpers with type safety
export const storage = {
  getTentangKami(): TentangKami[] {
    const data = localStorage.getItem('kkg_tentang_kami');
    if (!data) {
      localStorage.setItem('kkg_tentang_kami', JSON.stringify(DEFAULT_TENTANG_KAMI));
      return DEFAULT_TENTANG_KAMI;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_tentang_kami', JSON.stringify(DEFAULT_TENTANG_KAMI));
      return DEFAULT_TENTANG_KAMI;
    }
  },
  saveTentangKami(list: TentangKami[]): void {
    localStorage.setItem('kkg_tentang_kami', JSON.stringify(list));
  },

  getProgramKerja(): ProgramKerja[] {
    const data = localStorage.getItem('kkg_program_kerja');
    if (!data) {
      localStorage.setItem('kkg_program_kerja', JSON.stringify(DEFAULT_PROGRAM_KERJA));
      return DEFAULT_PROGRAM_KERJA;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_program_kerja', JSON.stringify(DEFAULT_PROGRAM_KERJA));
      return DEFAULT_PROGRAM_KERJA;
    }
  },
  saveProgramKerja(list: ProgramKerja[]): void {
    localStorage.setItem('kkg_program_kerja', JSON.stringify(list));
  },

  getInformasi(): Informasi[] {
    const data = localStorage.getItem('kkg_informasi');
    if (!data) {
      localStorage.setItem('kkg_informasi', JSON.stringify(DEFAULT_INFORMASI));
      return DEFAULT_INFORMASI;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_informasi', JSON.stringify(DEFAULT_INFORMASI));
      return DEFAULT_INFORMASI;
    }
  },
  saveInformasi(list: Informasi[]): void {
    localStorage.setItem('kkg_informasi', JSON.stringify(list));
  },

  getDokumenGaleri(): DokumenGaleri[] {
    const data = localStorage.getItem('kkg_galeri');
    if (!data) {
      localStorage.setItem('kkg_galeri', JSON.stringify(DEFAULT_DOKUMEN_GALERI));
      return DEFAULT_DOKUMEN_GALERI;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_galeri', JSON.stringify(DEFAULT_DOKUMEN_GALERI));
      return DEFAULT_DOKUMEN_GALERI;
    }
  },
  saveDokumenGaleri(list: DokumenGaleri[]): void {
    localStorage.setItem('kkg_galeri', JSON.stringify(list));
  },

  getMateri(): Materi[] {
    const data = localStorage.getItem('kkg_materi');
    if (!data) {
      localStorage.setItem('kkg_materi', JSON.stringify(DEFAULT_MATERI));
      return DEFAULT_MATERI;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_materi', JSON.stringify(DEFAULT_MATERI));
      return DEFAULT_MATERI;
    }
  },
  saveMateri(list: Materi[]): void {
    localStorage.setItem('kkg_materi', JSON.stringify(list));
  },

  getMateriUser(): MateriUser[] {
    const data = localStorage.getItem('kkg_materi_user');
    if (!data) {
      localStorage.setItem('kkg_materi_user', JSON.stringify([]));
      return [];
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_materi_user', JSON.stringify([]));
      return [];
    }
  },
  saveMateriUser(list: MateriUser[]): void {
    localStorage.setItem('kkg_materi_user', JSON.stringify(list));
  },

  getUsers(): User[] {
    const data = localStorage.getItem('kkg_users');
    if (!data) {
      localStorage.setItem('kkg_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    let parsedUsers: User[] = [];
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        parsedUsers = parsed;
      } else {
        throw new Error('Not an array');
      }
    } catch (e) {
      localStorage.setItem('kkg_users', JSON.stringify(DEFAULT_USERS));
      return DEFAULT_USERS;
    }
    let hasChanged = false;
    const migratedUsers = parsedUsers.map(u => {
      let updatedSchool = u.sekolah || "";
      if (updatedSchool === "UPTD SDN 2 Padaawas" || updatedSchool === "UPTD SD N 2 Padaawas") {
        updatedSchool = "";
      } else if (updatedSchool.startsWith("UPTD ")) {
        updatedSchool = updatedSchool.replace(/^UPTD\s+/i, '').trim();
      }
      
      if (updatedSchool !== u.sekolah) {
        hasChanged = true;
        return { ...u, sekolah: updatedSchool };
      }
      return u;
    });
    if (hasChanged) {
      localStorage.setItem('kkg_users', JSON.stringify(migratedUsers));
      return migratedUsers;
    }
    return parsedUsers;
  },
  saveUsers(list: User[]): void {
    localStorage.setItem('kkg_users', JSON.stringify(list));
  },

  getChats(): ChatMessage[] {
    const data = localStorage.getItem('kkg_chats');
    if (!data) {
      localStorage.setItem('kkg_chats', JSON.stringify(DEFAULT_CHATS));
      return DEFAULT_CHATS;
    }
    try {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
      throw new Error('Not an array');
    } catch (e) {
      localStorage.setItem('kkg_chats', JSON.stringify(DEFAULT_CHATS));
      return DEFAULT_CHATS;
    }
  },
  saveChats(list: ChatMessage[]): void {
    localStorage.setItem('kkg_chats', JSON.stringify(list));
  }
};
