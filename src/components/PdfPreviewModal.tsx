import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, FileText, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface PdfPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfName: string;
  pdfTitle?: string;
  pdfData?: string;
}

export default function PdfPreviewModal({ isOpen, onClose, pdfName, pdfTitle, pdfData }: PdfPreviewModalProps) {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 3;
  const [downloaded, setDownloaded] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloaded(true);
    setTimeout(() => {
      setDownloaded(false);
    }, 2000);
    
    // Simulate downloading by creating a dummy text file
    const element = document.createElement("a");
    const file = new Blob([`Simulated PDF Content for ${pdfName}\n\nThis is a placeholder document representing KKG GUGUS PADAAWAS PASIRWANGI educational material.`], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = pdfName;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Generate realistic text lines based on pdfName to make the preview look organic and actual
  const getSimulatedPdfContent = (page: number) => {
    const isMateri = pdfName.toLowerCase().includes('modul') || pdfName.toLowerCase().includes('pedoman') || pdfName.toLowerCase().includes('materi');
    const displayTitle = pdfTitle || pdfName.replace(/_/g, ' ').replace('.pdf', '').toUpperCase();

    if (page === 1) {
      return {
        header: "DINAS PENDIDIKAN KECAMATAN PASIRWANGI",
        subHeader: "KELOMPOK KERJA GURU (KKG) GUGUS PADAAWAS",
        mainTitle: displayTitle,
        sectionTitle: "DOKUMEN UTAMA & LEMBAR PENGESAHAN",
        bodyText: [
          "Dokumen ini diterbitkan secara elektronik oleh Pengurus KKG GUGUS PADAAWAS untuk dipergunakan oleh seluruh anggota aktif sebagai rujukan, panduan, atau bahan ajar resmi.",
          "Tahun Pelajaran: 2025 / 2026",
          "Lokasi Konsolidasi: UPTD Satuan Pendidikan se-Gugus Padaawas, Kecamatan Pasirwangi, Kabupaten Garut.",
          "Status Verifikasi: Selesai diuji dan diverifikasi oleh Badan Pengurus Harian KKG Pasirwangi.",
          "Ditetapkan di: Pasirwangi, Kabupaten Garut."
        ]
      };
    } else if (page === 2) {
      return {
        header: "BAGIAN II: TATA CARA & PANDUAN PELAKSANAAN",
        subHeader: "KKG GUGUS PADAAWAS - PASIRWANGI",
        mainTitle: displayTitle,
        sectionTitle: isMateri ? "BAB I: METODE PEMBELAJARAN & MATERI" : "BAB I: KETENTUAN UMUM KEGIATAN",
        bodyText: isMateri ? [
          "1. Pembelajaran diarahkan fokus pada pengembangan kompetensi akademik, karakter, dan kreativitas bagi seluruh kategori peserta didik di kelas.",
          "2. Pemanfaatan alat peraga edukatif (APE) yang kreatif dari lingkungan sekitar sangat disarankan untuk merangsang kognisi anak.",
          "3. Kegiatan belajar mengajar (KBM) interaktif harian wajib diawali dengan kegiatan literasi atau apersepsi yang menyenangkan.",
          "4. Evaluasi murid dinilai dari tiga pilar capaian: Keterampilan Sikap (Afektif), Pemahaman Sains/Kognisi (Kognitif), serta Portofolio/Karya (Psikomotor)."
        ] : [
          "1. Setiap utusan sekolah wajib mengirimkan perwakilan pendidik Guru Kelas minimal 1 (satu) orang dalam setiap forum musyawarah berkala.",
          "2. Anggota yang berhalangan hadir wajib menyampaikan surat ijin resmi secara tertulis atau unggah surat dispensasi melalui Portal Admin.",
          "3. Seluruh hasil keputusan rapat bersifat mengikat dan wajib diimplementasikan di unit kerja masing-masing sekolah dasar.",
          "4. Pembiayaan operasional kegiatan KKG disokong melalui dana bantuan operasional sekolah (BOS) dan iuran kas rutin sesuai mufakat."
        ]
      };
    } else {
      return {
        header: "BAGIAN III: REKOMENDASI & HASIL SIDANG AKHIR",
        subHeader: "KKG GUGUS PADAAWAS - PASIRWANGI",
        mainTitle: displayTitle,
        sectionTitle: "LEMBAR CATATAN & REKOMENDASI",
        bodyText: [
          "Penyempurnaan dokumen ini akan ditinjau ulang secara kolektif pada rapat evaluasi tengah semester mendatang.",
          "Saran, masukan, dan revisi praktis dapat didiskusikan secara terbuka melalui Forum Chatting Anggota KKG GUGUS PADAAWAS di dashboard portal.",
          "Terima kasih atas dedikasi dan kerja keras seluruh rekan-rekan Guru Kelas Kecamatan Pasirwangi yang senantiasa menjaga profesionalisme dan mendidik dengan hati.",
          "Salam Edukasi, Cerdas Mulia!"
        ]
      };
    }
  };

  const content = getSimulatedPdfContent(currentPage);

  return (
    <div id="pdf-modal-container" className="fixed inset-0 bg-[#0f172a]/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
      <div id="pdf-modal-card" className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* PDF Reader Header Bar */}
        <div className="bg-[#1e293b] text-white px-5 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="bg-red-500 rounded p-1.5 flex items-center justify-center shrink-0">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm md:text-base leading-tight truncate">{pdfTitle || pdfName}</h3>
              <p className="text-gray-400 text-xs truncate">Pratinjau Browser Resmi KKG Padaawas</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="hidden md:flex items-center gap-2 bg-[#0f172a] rounded px-3 py-1 text-xs">
              <button 
                onClick={() => setZoom(Math.max(50, zoom - 10))} 
                className="hover:text-amber-500 transition-colors p-1"
                title="Perkecil"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono">{zoom}%</span>
              <button 
                onClick={() => setZoom(Math.min(200, zoom + 10))} 
                className="hover:text-amber-500 transition-colors p-1"
                title="Perbesar"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Download Action */}
            <button
              onClick={handleDownload}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                downloaded 
                ? 'bg-[#10b981] text-white' 
                : 'bg-amber-500 hover:bg-amber-600 text-[#0f172a]'
              }`}
            >
              {downloaded ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              <span>{downloaded ? 'Mengunduh...' : 'Unduh'}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg p-1.5 transition-colors ml-1"
              id="close-pdf-btn"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Reader Document Area */}
        <div className="flex-1 bg-gray-100 p-4 overflow-y-auto flex justify-center items-start">
          <div 
            style={{ width: `${zoom}%` }}
            className="bg-white min-h-[70vh] max-w-full rounded-md shadow-lg p-8 md:p-14 relative flex flex-col transition-all duration-200 border border-gray-200"
          >
            {/* Watermark Logo background */}
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] select-none pointer-events-none">
              <span className="text-[70px] md:text-9xl font-bold uppercase tracking-widest text-[#0f172a] rotate-12 select-none font-sans">
                GUGUS PADAAWAS
              </span>
            </div>

            {/* Simulated Official Header */}
            <div className="border-b-4 border-double border-gray-800 pb-5 mb-6 text-center select-text relative z-10">
              <span className="text-[10px] font-bold tracking-wider text-gray-400 uppercase font-mono block">
                {content.header}
              </span>
              <h2 className="text-sm md:text-base font-bold text-gray-800 uppercase mt-1 tracking-wide">
                {content.subHeader}
              </h2>
              <div className="text-xs text-indigo-900 font-semibold mt-1">
                Kecamatan Pasirwangi, Kabupaten Garut, Jawa Barat
              </div>
            </div>

            {/* Simulated Official Title & Body */}
            <div className="flex-1 relative z-10 select-text">
              <div className="text-center mb-8">
                <span className="text-[10px] uppercase font-bold px-2 py-1 bg-amber-100 text-amber-800 rounded font-mono">
                  Dokumen Resmi KKG
                </span>
                <h1 className="text-base md:text-xl font-extrabold text-[#111827] mt-3 tracking-tight uppercase max-w-xl mx-auto leading-tight">
                  {content.mainTitle}
                </h1>
                <div className="w-16 h-1 bg-amber-500 mx-auto mt-3 rounded-full" />
              </div>

              <div className="mb-6">
                <h4 className="text-xs md:text-sm font-bold text-gray-700 bg-gray-50 border-l-4 border-amber-500 py-1.5 px-3 mb-4 rounded-r">
                  {content.sectionTitle}
                </h4>

                <div className="space-y-4 text-gray-700 text-xs md:text-sm leading-relaxed font-sans">
                  {content.bodyText.map((line, idx) => (
                    <p key={idx} className="indent-4 text-justify font-normal text-gray-600">
                      {line}
                    </p>
                  ))}
                </div>
              </div>
              
              {/* Dummy stamp & signatures for realism */}
              {currentPage === 3 && (
                <div id="simulated-signatures" className="mt-12 pt-8 border-t border-dashed border-gray-200 flex justify-between items-center text-[11px] text-gray-500">
                  <div className="text-center">
                    <p className="mb-8">Mengetahui,<br/><strong>Camat Pasirwangi</strong></p>
                    <p className="font-bold underline text-gray-800">Drs. H. Dadang, M.Si.</p>
                    <p className="text-[10px]">NIP. 19690123 199203 1 002</p>
                  </div>
                  <div className="text-center relative">
                    {/* Simulated Stamp overlay */}
                    <div className="absolute top-2 left-6 w-20 h-20 rounded-full border-4 border-blue-500/30 flex items-center justify-center rotate-12 pointer-events-none select-none">
                      <span className="text-[7px] text-blue-500/50 font-bold uppercase text-center leading-tight">
                        KKG GUGUS<br/>PADAAWAS<br/>★
                      </span>
                    </div>
                    <p className="mb-8">Ketua Organisasi KKG,<br/><strong>KKG GUGUS PADAAWAS</strong></p>
                    <p className="font-bold underline text-gray-800">H. Cecep Supriatna, S.Pd.</p>
                    <p className="text-[10px]">NIP. 19780512 200801 1 003</p>
                  </div>
                </div>
              )}
            </div>

            {/* Simulated Official Footer */}
            <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between text-[9px] text-gray-400 font-mono select-none">
              <span>Halaman {currentPage} dari {totalPages}</span>
              <span>Dokumen Digital Resmi KKG - Pasirwangi</span>
              <span>Kode: {pdfName.substring(0, 10).toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* PDF Reader Pagination Bar */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between select-none">
          <p className="text-xs text-gray-500">
            Halaman <span className="font-semibold text-gray-800">{currentPage}</span> dari <span className="font-semibold text-gray-800">{totalPages}</span>
          </p>
          
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="p-1 px-3 bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 disabled:hover:bg-gray-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Sebelumnya
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="p-1 px-3 bg-[#1e293b] text-white hover:bg-[#334155] disabled:opacity-50 disabled:hover:bg-[#1e293b] rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Selanjutnya
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
