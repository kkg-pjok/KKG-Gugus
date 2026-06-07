import React, { useState } from 'react';
import { 
  Award, BookOpen, Calendar, ChevronRight, FileText, Globe, 
  MapPin, Shield, Sparkles, Users, Image as ImageIcon, Info, ArrowUpRight, Search, File
} from 'lucide-react';
import { TentangKami, ProgramKerja, Informasi, DokumenGaleri } from '../types';
import PdfPreviewModal from './PdfPreviewModal';
import { openNativePreview } from '../utils/preview';

interface LandingPageProps {
  onEnterPortal: () => void;
  isLoggedIn: boolean;
  currentUserRole?: string;
  onGoToDashboard: () => void;
  tentangKami: TentangKami[];
  programKerja: ProgramKerja[];
  informasi: Informasi[];
  galeri: DokumenGaleri[];
  totalUsers?: number;
  totalMateri?: number;
}

export default function LandingPage({
  onEnterPortal,
  isLoggedIn,
  currentUserRole,
  onGoToDashboard,
  tentangKami,
  programKerja,
  informasi,
  galeri,
  totalUsers = 0,
  totalMateri = 0
}: LandingPageProps) {
  const [selectedPdf, setSelectedPdf] = useState<{ name: string; title: string } | null>(null);
  const [activeGal, setActiveGal] = useState<DokumenGaleri | null>(null);
  
  // Pagination for Informasi table on Landing Page
  const [infoPage, setInfoPage] = useState(1);
  const itemsPerPage = 3;
  const totalInfoPages = Math.ceil(informasi.length / itemsPerPage);
  const paginatedInfo = informasi.slice((infoPage - 1) * itemsPerPage, infoPage * itemsPerPage);

  // Active 'Tentang Kami' data or use fallback
  const activeAbout = tentangKami[0] || {
    deskripsi: "KKG Gugus Padaawas Pasirwangi adalah wadah kerja profesional seluruh guru kelas di wilayah Kecamatan Pasirwangi. Berdiri atas dasar kebutuhan meningkatkan kualifikasi, kompetensi pedagogik, serta profesionalisme guru kelas demi menumbuhkan anak didik yang unggul, kreatif, dan berkarakter luhur.",
    visi: "Mewujudkan forum guru kelas Gugus Padaawas yang profesional, bersinergi, unggul dalam literasi pembelajaran, serta berkarakter Islami dan literat teknologi pada tahun 2028.",
    misi: "Meningkatkan kompetensi guru kelas se-Gugus Padaawas."
  };

  return (
    <div className="bg-[#f8fafc] text-slate-800 min-h-screen flex flex-col font-sans selection:bg-amber-500 selection:text-white">
      
      {/* Dynamic Nav Header */}
      <header className="sticky top-0 bg-white/95 backdrop-blur-md border-b border-gray-100 z-40 transition-shadow hover:shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl overflow-hidden bg-white border border-gray-150 flex items-center justify-center p-0.5 shadow-md rotate-3 hover:rotate-0 transition-transform">
              <img 
                src="https://i.imgur.com/Q0wCTRY.png" 
                alt="Logo KKG Gugus Padaawas" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <h1 className="font-extrabold text-sm md:text-base text-slate-800 leading-tight uppercase tracking-wider">
                KKG Gugus Padaawas
              </h1>
              <p className="text-[10px] text-emerald-600 font-bold tracking-widest uppercase">
                Pasirwangi - Garut
              </p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-600">
            <a href="#tentang-kami" className="hover:text-[#0284c7] transition-colors">Tentang Kami</a>
            <a href="#informasi-terbaru" className="hover:text-[#0284c7] transition-colors">Informasi</a>
            <a href="#program-kerja" className="hover:text-[#0284c7] transition-colors">Program Kerja</a>
            <a href="#galeri" className="hover:text-[#0284c7] transition-colors">Galeri</a>
          </nav>

          <div id="nav-actions">
            {isLoggedIn ? (
              <button
                onClick={onGoToDashboard}
                className="flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0284c7] hover:bg-[#0369a1] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Masuk Dashboard ({currentUserRole === 'admin' ? 'Admin' : 'Guru'})</span>
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            ) : (
              <button
                onClick={onEnterPortal}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0f172a] text-xs font-extrabold shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                id="portal-anggota-btn"
              >
                <span>Portal Anggota</span>
                <Users className="w-4 h-4 text-[#0f172a]" />
              </button>
            )}
          </div>

        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white py-20 lg:py-28 px-4 border-b-8 border-amber-500">
        {/* Animated Background Gradients & Grids */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(2,132,199,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[#000]/10 select-none pointer-events-none" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cpath d='M0 0h20v20H0zm20 20h20v20H20z' fill='%23fff' fill-opacity='0.02'/%3E%3C/svg%3E")`
          }} 
        />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-lg border border-white/10 text-xs text-amber-400 font-bold uppercase tracking-widest animate-pulse">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Kecamatan Pasirwangi, Kabupaten Garut</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-none uppercase">
              <span className="shine-text-white block pb-2">KKG GUGUS PADAAWAS</span>
              <span className="shine-text-amber block">PASIRWANGI</span>
            </h1>
            <p className="text-base md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed font-light">
              "Membangun Guru Profesional, Kreatif, dan Sportif untuk Pendidikan Indonesia Gembira"
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <button
              onClick={isLoggedIn ? onGoToDashboard : onEnterPortal}
              className="px-8 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-[#0f172a] font-extrabold text-sm md:text-base shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {isLoggedIn ? 'Masuk Dashboard KKG' : 'Portal Anggota KKG'}
            </button>
            <a
              href="#tentang-kami"
              className="px-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-sm md:text-base border border-white/10 transition-all backdrop-blur-md"
            >
              Mengenal KKG Gugus Padaawas
            </a>
          </div>

          {/* Quick Stat Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-10 border-t border-white/5">
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-2xl md:text-3xl font-black text-amber-400 block">60+</span>
              <span className="text-xs text-gray-400 font-medium">Guru Kelas Aktif</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-2xl md:text-3xl font-black text-[#10b981] block">{totalUsers}</span>
              <span className="text-xs text-gray-400 font-medium">User Aktif</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-2xl md:text-3xl font-black text-sky-400 block">{totalMateri}+</span>
              <span className="text-xs text-gray-400 font-medium">Modul & Materi Ajar</span>
            </div>
            <div className="p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="text-2xl md:text-3xl font-black text-orange-400 block">{programKerja ? programKerja.length : 0}+</span>
              <span className="text-xs text-gray-400 font-medium">Program Kerja</span>
            </div>
          </div>

        </div>
      </section>

      {/* Tentang Kami Section */}
      <section id="tentang-kami" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider block w-fit mx-auto mb-4">
              Profil Kelompok Kerja
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
              Mengenal Lebih Dekat <br/>
              <span className="bg-gradient-to-r from-[#0284c7] to-[#10b981] bg-clip-text text-transparent uppercase">
                KKG GUGUS PADAAWAS
              </span>
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="grid md:grid-cols-12 gap-8 items-center">
            
            {/* Visual Brand Card Left Column */}
            <div className="md:col-span-5 bg-gradient-to-tr from-[#0284c7] via-[#2563eb] to-[#10b981] rounded-3xl p-8 text-white relative shadow-2xl min-h-[350px] flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />
              
              <div className="relative z-10">
                <span className="text-[10px] font-mono tracking-widest uppercase bg-white/25 px-2.5 py-1 rounded">
                  Kelompok Kerja Guru
                </span>
                <div className="text-4xl mt-6">🏫</div>
                <h3 className="text-2xl font-black mt-4 font-sans tracking-wide">
                  GUGUS PADAAWAS
                </h3>
                <p className="text-[#e0f2fe] text-xs leading-relaxed mt-2 italic">
                  "Guyub, Rukun, Cerdas, Kreatif, Kompeten, Edukatif"
                </p>
              </div>

              <div className="relative z-10 pt-10 border-t border-white/20 flex gap-4 text-xs font-mono">
                <div>
                  <span className="text-[#a5f3fc] block">Sekolah Inti:</span>
                  <span className="font-bold">SDN 3 Padaawas</span>
                </div>
                <div>
                  <span className="text-[#a5f3fc] block">Lokasi:</span>
                  <span className="font-bold">Pasirwangi - Garut</span>
                </div>
              </div>
            </div>

            {/* Dynamic Content Right Column */}
            <div className="md:col-span-7 space-y-6">
              <div className="prose text-slate-600 max-w-none text-sm md:text-base leading-relaxed">
                <p className="whitespace-pre-line text-[#475569] bg-slate-50 p-6 rounded-2xl border-l-4 border-[#0284c7] text-justify">
                  {activeAbout.deskripsi}
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-5 pt-4">
                
                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold mb-3.5">
                    🎯
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Visi KKG</h4>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line text-justify">
                    {activeAbout.visi}
                  </p>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs hover:shadow-md transition-shadow">
                  <div className="w-9 h-9 rounded-xl bg-sky-100 text-[#0284c7] flex items-center justify-center font-bold mb-3.5">
                    🚀
                  </div>
                  <h4 className="font-bold text-slate-900 mb-2">Misi KKG</h4>
                  <p className="text-slate-600 text-xs leading-relaxed whitespace-pre-line text-justify">
                    {activeAbout.misi}
                  </p>
                </div>

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* PEMISAH HERO - BANNER SEPARATOR */}
      <section className="bg-gradient-to-r from-amber-500 via-orange-500 to-[#0284c7] text-[#0f172a] py-6 px-4 font-sans border-y border-orange-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg shadow">
              📢
            </div>
            <div>
              <h3 className="font-black text-sm md:text-base text-white tracking-wide uppercase">
                AGENDA & PROGRAM KERJA STRATEGIS
              </h3>
              <p className="text-white/80 text-[11px] leading-tight font-medium">
                Pemisah Informasi Aktual & Program Kerja Pendidik Guru Kelas Gugus Padaawas
              </p>
            </div>
          </div>
          <div className="text-xs bg-[#0f172a] text-white px-4 py-1.5 rounded-full font-bold uppercase tracking-wider shadow-sm">
            Tahun Ajaran 2025/2026
          </div>
        </div>
      </section>

      {/* Informasi Terbaru Section */}
      <section id="informasi-terbaru" className="py-20 bg-slate-50 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="mb-10 text-center md:text-left">
            <span className="text-xs font-semibold text-sky-600 uppercase tracking-widest bg-sky-50 px-3.5 py-1.5 rounded-full block w-fit mb-3 mx-auto md:mx-0">
              Pengumuman & Surat Edaran
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900">
              Informasi Terbaru
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1">
              Daftar kegiatan, rujukan surat keputusan, dan pengumuman resmi pengurus KKG.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#1e293b] text-white text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6 w-32">Tanggal</th>
                    <th className="py-4 px-6 w-3/12">Judul Informasi</th>
                    <th className="py-4 px-6 w-5/12">Deskripsi Ringkas</th>
                    <th className="py-4 px-6 text-center w-32">Dokumen PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                  {paginatedInfo.map((info) => (
                    <tr key={info.id} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-4 px-6 font-mono text-slate-500 text-xs">{info.tanggal}</td>
                      <td className="py-4 px-6 font-bold text-slate-800 leading-snug">{info.judul}</td>
                      <td className="py-4 px-6 text-slate-600 leading-relaxed text-xs">{info.isi}</td>
                      <td className="py-4 px-6 text-center">
                        {info.pdfName ? (
                          <button
                            onClick={() => openNativePreview(info.pdfName, info.judul)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold transition-all border border-emerald-150 cursor-pointer"
                          >
                            <File className="w-3.5 h-3.5" />
                            <span>Buka PDF</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-xs italic">Tanpa File</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {paginatedInfo.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-gray-400 italic text-xs">
                        Belum ada data informasi terupload.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalInfoPages > 1 && (
              <div className="bg-slate-50 border-t border-gray-100 px-6 py-3 flex items-center justify-between select-none">
                <span className="text-xs text-gray-500">
                  Halaman <span className="font-semibold text-slate-900">{infoPage}</span> dari <span className="font-semibold text-slate-900">{totalInfoPages}</span>
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setInfoPage(Math.max(1, infoPage - 1))}
                    disabled={infoPage === 1}
                    className="px-3 py-1 bg-white border border-gray-200 text-slate-600 hover:bg-gray-100 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
                  >
                    Sebelumnya
                  </button>
                  <button 
                    onClick={() => setInfoPage(Math.min(totalInfoPages, infoPage + 1))}
                    disabled={infoPage === totalInfoPages}
                    className="px-3 py-1 bg-[#1e293b] text-white hover:bg-slate-800 disabled:opacity-50 text-xs font-bold rounded-lg transition-colors"
                  >
                    Selanjutnya
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Program Kerja Strategis Section */}
      <section id="program-kerja" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider block w-fit mx-auto mb-4">
              Konsep Kerja Nyata
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#0f172a] uppercase">
              AGENDA UTAMA – Program Kerja Strategis
            </h2>
            <div className="w-16 h-1 bg-[#10b981] mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 text-xs md:text-sm mt-3">
              Misi peningkatan standar dan layanan guru olahraga di lingkungan Padaawas Pasirwangi.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {programKerja.map((program, idx) => (
              <div 
                key={program.id}
                className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-6 relative hover:-translate-y-1 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 font-black flex items-center justify-center">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm md:text-base text-slate-900 uppercase">
                      {program.judul}
                    </h3>
                    <p className="text-slate-600 text-xs leading-relaxed mt-2 text-justify">
                      {program.deskripsi}
                    </p>
                  </div>
                </div>
                <div className="pt-4 mt-4 border-t border-slate-200/50 flex justify-between items-center text-xs font-bold text-[#0284c7]">
                  <span>Status: Terencana</span>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500 block"></div>
                </div>
              </div>
            ))}

            {programKerja.length === 0 && (
              <div className="col-span-3 text-center py-10 bg-slate-50 rounded-2xl text-gray-400 italic text-sm">
                Belum ada program kerja ditambahkan.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Galeri & Kegiatan Terbaru Section */}
      <section id="galeri" className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold text-[#0284c7] bg-sky-50 px-3.5 py-1.5 rounded-full uppercase tracking-wider block w-fit mx-auto mb-4">
              Dokumentasi Fisik
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 uppercase">
              Galeri & Kegiatan Terbaru
            </h2>
            <div className="w-16 h-1 bg-amber-500 mx-auto mt-4 rounded-full" />
            <p className="text-slate-500 text-xs md:text-sm mt-3">
              Foto dan kegiatan nyata guru kelas Gugus Padaawas dalam forum keprofesian berkelanjutan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {galeri.map((gal) => {
              const hasCustomPhoto = gal.foto && gal.foto.startsWith('data:');
              
              return (
                <div 
                  key={gal.id}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-xs hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Photo area */}
                  <div className="h-48 relative overflow-hidden bg-gradient-to-tr from-[#0284c7]/20 to-[#10b981]/10 flex items-center justify-center group/img">
                    {hasCustomPhoto ? (
                      <ZoomableImage 
                        src={gal.foto} 
                        alt={gal.judul} 
                        onClick={() => setActiveGal(gal)}
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <ImageIcon className="w-10 h-10 text-emerald-500 stroke-[1.25]" />
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                          DOKUMENTASI KKG
                        </span>
                      </div>
                    )}
                    <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-xs text-slate-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs uppercase tracking-wider">
                      {gal.subJudul || 'Kegiatan'}
                    </span>
                  </div>

                  {/* Caption */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-extrabold text-sm md:text-base text-slate-900 uppercase mb-2 leading-snug">
                        {gal.judul}
                      </h3>
                      <p className="text-slate-600 text-xs leading-relaxed font-normal text-justify">
                        {gal.deskripsi}
                      </p>
                    </div>
                    <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-semibold text-gray-400">
                      <span>Status: Terarsip</span>
                      <span>100% Sporty</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {galeri.length === 0 && (
              <div className="col-span-3 text-center py-10 bg-white rounded-2xl border border-gray-100 text-gray-400 italic text-sm">
                Belum ada foto galeri ditambahkan.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* Footer on all pages */}
      <footer className="mt-auto bg-[#0f172a] text-gray-400 py-10 px-4 border-t-4 border-[#10b981]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-center md:text-left">
          
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2.5 text-white">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-white p-0.5 shrink-0 flex items-center justify-center">
                <img 
                  src="https://i.imgur.com/Q0wCTRY.png" 
                  alt="Logo KKG Gugus Padaawas" 
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-extrabold tracking-wider uppercase">KKG Gugus Padaawas</span>
            </div>
            <p className="text-gray-400 max-w-sm">
              Wadah peningkatan kapasitas, pedagogi, dan koordinasi guru kelas se-Pasirwangi, Garut.
            </p>
          </div>

          <div className="space-y-1">
            <span className="block font-bold text-gray-300">Hubungi Kami:</span>
            <span className="block text-gray-400">Gugus Padaawas, Pasirwangi, KKG Gugus Padaawas, Kabupaten Garut.</span>
            <span className="block text-xs uppercase tracking-widest text-[#10b981]">Guru Indonesia Hebat & Adaptif!</span>
          </div>

        </div>
        
        {/* Strictly required footer case-insensitive wording */}
        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-white/5 text-center text-gray-500">
          <p className="text-[11px] leading-relaxed">
            @2026 KKG Gugus Padaaws Kecamatan Pasirwangi
          </p>
        </div>
      </footer>

      {/* Render the Custom PDF reader modal inline if open */}
      {selectedPdf && (
        <PdfPreviewModal
          isOpen={true}
          onClose={() => setSelectedPdf(null)}
          pdfName={selectedPdf.name}
          pdfTitle={selectedPdf.title}
        />
      )}

      {/* Lightbox / Detail Zoom Modal */}
      {activeGal && (
        <div className="fixed inset-0 bg-slate-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 md:p-10 transition-all duration-300">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden max-w-4xl w-full max-h-[90vh] flex flex-col md:flex-row shadow-2xl relative">
            
            {/* Close button */}
            <button 
              onClick={() => setActiveGal(null)}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-950/75 hover:bg-slate-950 text-white/90 hover:text-white flex items-center justify-center border border-white/10 transition-colors cursor-pointer shadow-md"
              title="Tutup Preview"
            >
              <span className="text-xl font-bold">×</span>
            </button>

            {/* Left/Main content: Zoomable Image under magnifier */}
            <div className="flex-1 min-h-[300px] md:min-h-[450px] bg-slate-950 flex flex-col justify-between relative overflow-hidden">
              {activeGal.foto && (
                <ZoomableImage src={activeGal.foto} alt={activeGal.judul} />
              )}
            </div>

            {/* Right content: Information */}
            <div className="w-full md:w-80 p-6 md:p-8 flex flex-col justify-between border-t md:border-t-0 md:border-l border-slate-800 bg-slate-900 text-white">
              <div>
                <span className="text-[10px] font-bold text-sky-400 bg-sky-950/50 border border-sky-900/30 px-3 py-1 rounded-full uppercase tracking-widest block w-fit mb-4">
                  {activeGal.subJudul || 'Kegiatan'}
                </span>
                
                <h3 className="text-base md:text-lg font-black tracking-wide uppercase text-slate-100 mb-4 leading-snug">
                  {activeGal.judul}
                </h3>
                
                <p className="text-slate-400 text-xs leading-relaxed text-justify mb-6 max-h-[180px] overflow-y-auto pr-2">
                  {activeGal.deskripsi}
                </p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between text-[10px] text-slate-500 font-semibold uppercase">
                  <span>Status Dokumentasi</span>
                  <span className="text-emerald-400 font-bold bg-emerald-950/40 border border-emerald-950/20 px-2.5 py-0.5 rounded-md">Terarsip</span>
                </div>
                <p className="text-[10px] text-slate-500 text-center italic mt-2">
                  Arahkan kursor Anda ke gambar di sebelah kiri untuk melihat detail foto secara super jelas.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

interface ZoomableImageProps {
  src: string;
  alt: string;
  onClick?: () => void;
  className?: string;
}

function ZoomableImage({ src, alt, onClick, className = "w-full h-full object-cover transition-transform duration-200 ease-out" }: ZoomableImageProps) {
  const [coords, setCoords] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setCoords({ x, y });
  };

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${onClick ? 'cursor-zoom-in group' : 'cursor-crosshair'}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCoords({ x: 50, y: 50 });
      }}
      onMouseMove={handleMouseMove}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          transformOrigin: `${coords.x}% ${coords.y}%`,
          transform: isHovered ? 'scale(2.2)' : 'scale(1)',
        }}
        referrerPolicy="no-referrer"
      />
      {/* Zoom Indicator overlay */}
      {!isHovered && (
        <div className="absolute inset-0 bg-slate-950/20 backdrop-blur-[1px] opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="bg-slate-900/90 text-white px-3 py-1.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 uppercase tracking-wider shadow-lg">
            <Search className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
            {onClick ? 'Klik & Zoom' : 'Arahkan untuk Zoom'}
          </div>
        </div>
      )}
    </div>
  );
}
