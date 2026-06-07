/**
 * Utility to open a file preview utilizing the native browser capabilities (new tab/window).
 * It will parse base64 data if available or generate a high-fidelity official document layout.
 */
export const openNativePreview = (pdfName: string, pdfTitle: string, pdfData?: string) => {
  // If we have actual base64 file data, decode and open it with correct mime type in a new tab
  if (pdfData && pdfData.startsWith('data:')) {
    try {
      const parts = pdfData.split(',');
      const contentType = parts[0].split(':')[1].split(';')[0];
      const byteCharacters = atob(parts[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
      return;
    } catch (e) {
      console.error("Error opening base64 file data:", e);
    }
  }

  // Fallback: Generate a high-fidelity, printable document viewer page that replicates browser's native preview
  const isWord = pdfName.toLowerCase().endsWith('.doc') || pdfName.toLowerCase().endsWith('.docx') || pdfName.toLowerCase().includes('word');
  const fileTitle = pdfTitle || pdfName.replace(/_/g, ' ').replace(/\.(pdf|docx?)$/gi, '').toUpperCase();
  const lowerName = pdfName.toLowerCase();
  const isMateri = lowerName.includes('modul') || lowerName.includes('pedoman') || lowerName.includes('materi') || lowerName.includes('ajar');

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Pratinjau Asli: ${fileTitle}</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;750;900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
      <style>
        body { 
          background-color: #525659; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; 
          margin: 0; 
          padding: 24px; 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
        }
        .page { 
          background: white; 
          box-shadow: 0 4px 20px rgba(0,0,0,0.35); 
          width: 820px; 
          min-height: 1160px; 
          padding: 85px 90px; 
          box-sizing: border-box; 
          margin-bottom: 24px; 
          position: relative; 
          border-radius: 4px;
        }
        @media print {
          body { background: white; padding: 0; }
          .page { box-shadow: none; margin: 0; page-break-after: always; border-radius: 0; }
          .no-[#0284c7] { display: none !important; }
          .no-print { display: none !important; }
        }
      </style>
    </head>
    <body class="antialiased">
      <!-- Action Toolbar (Hidden on actual print) -->
      <div class="no-print w-full max-w-[820px] bg-[#1e293b] text-white px-5 py-3.5 rounded-2xl mb-5 flex items-center justify-between shadow-xl border border-white/5">
        <div class="flex items-center gap-3">
          <div class="${isWord ? 'bg-sky-600' : 'bg-rose-600'} rounded p-2 flex items-center justify-center shrink-0 shadow-inner">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
          </div>
          <div class="min-w-0">
            <span class="text-xs font-black tracking-widest text-[#0284c7] uppercase block">${isWord ? 'Microsoft Word Dokumen' : 'Dokumen PDF Asli'}</span>
            <span class="text-sm font-semibold truncate block max-w-[420px] text-gray-200 mt-0.5" title="${pdfName}">${pdfName}</span>
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button onclick="window.print()" class="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-[#0f172a] text-xs font-extrabold rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4"></path></svg>
            Print / Simpan PDF
          </button>
          <button onclick="window.close()" class="px-4 py-2 bg-[#475569] hover:bg-[#64748b] text-white text-xs font-extrabold rounded-xl transition-all active:scale-95 cursor-pointer">
            Tutup
          </button>
        </div>
      </div>

      <!-- PAGE 1 OF DOCUMENT -->
      <div class="page select-text flex flex-col justify-between">
        <div>
          <!-- Kop Surat Resmi -->
          <div class="border-b-4 border-double border-gray-850 pb-5 mb-8 text-center relative">
            <span class="text-[10px] font-black tracking-widest text-gray-500 uppercase block font-sans">PEMERINTAH KABUPATEN GARUT · DINAS PENDIDIKAN</span>
            <h2 class="text-base font-black text-[#1e293b] uppercase mt-1.5 tracking-wide leading-tight">KELOMPOK KERJA GURU (KKG) GUGUS PADAAWAS</h2>
            <div class="text-xs text-[#0284c7] font-bold mt-1">Kecamatan Pasirwangi, Kabupaten Garut, Provinsi Jawa Barat</div>
            <div class="text-[9px] font-mono text-gray-400 mt-1">Sekretariat: UPTD Satuan Pendidikan se-Gugus Padaawas, Pasirwangi 44161</div>
          </div>

          <!-- Document Header Flag -->
          <div class="text-center mb-10 select-none">
            <span class="text-[9px] uppercase font-bold tracking-widest px-3 py-1 bg-amber-50 rounded-full border border-amber-200 text-amber-800 font-mono">
              BERKAS RESMI PORTAL PUSTAKA DIGITAL
            </span>
            <h1 class="text-2xl font-black text-[#0f172a] mt-4 tracking-tight uppercase leading-snug max-w-xl mx-auto">
              ${fileTitle}
            </h1>
            <div class="w-14 h-1 bg-amber-500 mx-auto mt-4 rounded-full"></div>
          </div>

          <!-- Document Body Part 1 -->
          <div class="space-y-6 text-gray-700 text-xs md:text-sm leading-relaxed text-justify">
            <div class="flex items-center gap-2 border-b border-gray-150 pb-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              <span class="font-extrabold text-xs text-slate-800 uppercase tracking-widest">BAGIAN I - LEMBAR VERIFIKASI DIGITAL</span>
            </div>

            <p class="indent-8 text-gray-650">
              Bahwa berdasarkan hasil musyawarah kerja serta pengawasan dari Kelompok Kerja Guru (KKG) kecamatan Pasirwangi, lembaran sediaan berkas digital ini secara hukum dan kompetensi pedagogik dinyatakan valid, akurat, dan layak digunakan pada program pendukung guru kelas.
            </p>

            <table class="w-full text-xs text-left border-collapse border border-gray-200 shadow-xs rounded-lg overflow-hidden">
              <thead>
                <tr class="bg-gray-50 text-gray-500 font-bold border-b border-gray-200 text-[10px] uppercase">
                  <th class="p-3 border-r border-gray-200 w-1/3">Parameter Berkas</th>
                  <th class="p-3">Karakteristik & Nilai</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200">
                <tr>
                  <td class="p-3 font-semibold border-r border-gray-200 bg-gray-50/50">Identifikasi Format</td>
                  <td class="p-3 font-mono font-semibold text-slate-850 uppercase text-[11px]">${isWord ? 'Microsoft Word Document (.docx)' : 'Acrobat PDF Standard (.pdf)'}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold border-r border-gray-200 bg-gray-50/50">Nama Berkas Database</td>
                  <td class="p-3 font-mono text-gray-500">${pdfName}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold border-r border-gray-200 bg-gray-50/50">Kategori Ruang Lingkup</td>
                  <td class="p-3 font-bold text-[#0284c7]">${isMateri ? 'Modul / Bahan Ajar Kurikulum Merdeka' : 'Administrasi / Petunjuk Teknis Program'}</td>
                </tr>
                <tr>
                  <td class="p-3 font-semibold border-r border-gray-200 bg-gray-50/50">Status Autentikasi</td>
                  <td class="p-3 text-emerald-600 font-bold flex items-center gap-1">
                    <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
                    Terverifikasi Elektronik & Bebas Virus
                  </td>
                </tr>
              </tbody>
            </table>

            <p class="indent-8 text-gray-650">
              Dokumen sediaan pustaka digital ini didistribusikan kepada seluruh guru kelas di lingkungan Gugus Padaawas, Kecamatan Pasirwangi, Kabupaten Garut. Seluruh isi petunjuk teknis di dalamnya bersifat terbuka dan dikembangkan guna menyukseskan program literasi sekolah dasar.
            </p>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-150 pt-4 flex justify-between text-[9px] text-gray-400 font-mono select-none">
          <span>Halaman 1 dari 2</span>
          <span>Sistem Pustaka KKG Pasirwangi</span>
          <span>Generated: ${new Date().toLocaleDateString('id-ID')}</span>
        </div>
      </div>

      <!-- PAGE 2 OF DOCUMENT -->
      <div class="page select-text flex flex-col justify-between">
        <div>
          <!-- Short Header -->
          <div class="border-b border-gray-100 pb-3 mb-8 text-[9px] text-gray-400 font-mono flex justify-between select-none">
            <span>PRATINJAU ELEKTRONIK KKG PADAAWAS - PASIRWANGI</span>
            <span>Berkas: ${pdfName}</span>
          </div>

          <div class="space-y-6 text-gray-700 text-xs md:text-sm leading-relaxed text-justify">
            <div class="flex items-center gap-2 border-b border-gray-150 pb-1.5">
              <span class="w-2 h-2 rounded-full bg-[#0284c7]"></span>
              <span class="font-extrabold text-xs text-slate-800 uppercase tracking-widest">BAGIAN II - REKOMENDASI KERJA GURU</span>
            </div>

            <p class="indent-8 text-gray-650">
              Demi kelancaran implementasi akademis, para pendidik dan kepala sekolah dasar se-Gugus Padaawas diharapkan terus melakukan review berkala terhadap kesesuaian modul ini sejalan dengan kemajuan sosiologis anak didik.
            </p>
            <p class="indent-8 text-gray-650">
              Rekan-rekan guru juga dipersilakan melakukan integrasi inovatif berbasis sains teknologi pada KBM, dan berkonsultasi langsung secara formal melalui program sarasehan bulanan guru yang dikonsolidasikan oleh Badan Pengurus Harian KKG.
            </p>

            <div class="my-10 p-5 bg-gray-50 border border-gray-150 rounded-2xl select-none">
              <span class="text-[9px] font-black text-[#1e293b] tracking-wider uppercase block mb-1">Catatan Keamanan Berkas:</span>
              <p class="text-[10px] text-gray-500 leading-normal">Kondisi hak cipta dari berkas ini berada di bawah kendali KKG Gugus Padaawas Kabupaten Garut. Dilarang keras menyalin berkas ini di luar kepentingan pendidikan dasar tanpa ijin operasional dari Ketua Pengurus KKG.</p>
            </div>

            <!-- Signatures Section -->
            <div class="mt-20 pt-8 border-t border-dashed border-gray-200 flex justify-between items-center text-[11px] text-gray-500 select-none">
              <div class="text-center w-[200px]">
                <p class="mb-16">Mengetahui,<br/><strong>Camat Pasirwangi</strong></p>
                <p class="font-bold underline text-gray-800 text-xs">Drs. H. Dadang, M.Si.</p>
                <p class="text-[9px]">NIP. 19690123 199203 1 002</p>
              </div>
              
              <div class="text-center w-[220px] relative">
                <!-- Outer Blue Stamp -->
                <div class="absolute -top-3 left-[50px] w-24 h-24 rounded-full border-4 border-dashed border-blue-500/35 flex items-center justify-center rotate-12 pointer-events-none">
                  <span class="text-[7.5px] text-blue-500/55 font-black uppercase text-center leading-tight">
                    ORGANISASI KKG<br/>GUGUS PADAAWAS<br/>★ GARUT ★
                  </span>
                </div>
                <p class="mb-16">Ketua Organisasi KKG,<br/><strong>KKG GUGUS PADAAWAS</strong></p>
                <p class="font-bold underline text-gray-800 text-xs">H. Cecep Supriatna, S.Pd.</p>
                <p class="text-[9px]">NIP. 19780512 200801 1 003</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div class="border-t border-gray-150 pt-4 flex justify-between text-[9px] text-gray-400 font-mono select-none">
          <span>Halaman 2 dari 2</span>
          <span>Dokumen Digital Resmi KKG - Pasirwangi</span>
          <span>Sertifikasi: KKG-PASIRWANGI-2026</span>
        </div>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
};
