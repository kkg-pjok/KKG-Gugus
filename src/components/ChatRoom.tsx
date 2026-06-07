import React, { useState, useRef, useEffect } from 'react';
import { Send, Smile, Paperclip, Trash2, CheckCircle2, Image, FileText, Download, Shield, Sparkles, User, Info } from 'lucide-react';
import { ChatMessage, User as UserType } from '../types';
import { openNativePreview } from '../utils/preview';

interface ChatRoomProps {
  currentUser: UserType;
  chats: ChatMessage[];
  onSaveChats: (updatedChats: ChatMessage[]) => void;
}

const POPULAR_EMOJIS = [
  '😀', '😂', '👍', '🙏', '🔥', '🏆', '⚽', '🏃', '🏸', '🏊', '🎯', 
  '📝', '🏫', '💡', '🎉', '👏', '❤️', '🙌', '💪', '🚀', '🤝', '😊'
];

export default function ChatRoom({ currentUser, chats, onSaveChats }: ChatRoomProps) {
  const [inputText, setInputText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [attachment, setAttachment] = useState<{ name: string; url: string; type: string } | null>(null);

  const handleDownloadFile = (e: React.MouseEvent, fileName: string, fileUrl: string) => {
    e.preventDefault();
    if (!fileUrl) return;

    // Check if it's base64 or blob URL
    if (fileUrl.startsWith('data:') || fileUrl.startsWith('blob:')) {
      openNativePreview(fileName, fileName, fileUrl);
    } else {
      // Standard HTTP URL, we can open in a new tab which allows downloading safely
      const win = window.open(fileUrl, '_blank');
      if (!win) {
        // Fallback
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };
  
  // Dynamic Deletion Confirmation State
  const [deleteConf, setDeleteConf] = useState<{
    isOpen: boolean;
    msgId: string | null;
    actionType: 'forMe' | 'forAll' | null;
    title: string;
    description: string;
    snippet: string;
  }>({
    isOpen: false,
    msgId: null,
    actionType: null,
    title: '',
    description: '',
    snippet: ''
  });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the bottom of the chat list
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chats]);

  // Click outside listener to close emoji picker
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.nama,
      senderRole: currentUser.role,
      senderFoto: currentUser.foto,
      text: inputText,
      timestamp: timeString,
      fileUrl: attachment?.url,
      fileName: attachment?.name,
      fileType: attachment?.type,
      deletedBy: []
    };

    onSaveChats([...chats, newMsg]);
    setInputText('');
    setAttachment(null);
    setShowEmojiPicker(false);
  };

  const handleInsertEmoji = (emoji: string) => {
    setInputText(prev => prev + emoji);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setAttachment({
        name: file.name,
        url: reader.result as string,
        type: file.type
      });
    };
    reader.readAsDataURL(file);
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleDeleteForMe = (msgId: string) => {
    const msg = chats.find(c => c.id === msgId);
    const textSnippet = msg?.text ? (msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text) : (msg?.fileName || 'File berkas');
    setDeleteConf({
      isOpen: true,
      msgId,
      actionType: 'forMe',
      title: 'Hapus Pesan Untuk Saya',
      description: 'Apakah Anda yakin ingin menyembunyikan/menghapus pesan chat ini dari tampilan Anda pribadi?',
      snippet: textSnippet
    });
  };

  const handleDeleteForAll = (msgId: string) => {
    const msg = chats.find(c => c.id === msgId);
    const textSnippet = msg?.text ? (msg.text.length > 50 ? msg.text.substring(0, 50) + '...' : msg.text) : (msg?.fileName || 'File berkas');
    setDeleteConf({
      isOpen: true,
      msgId,
      actionType: 'forAll',
      title: 'Hapus Pesan Untuk Semua orang',
      description: 'Apakah Anda yakin ingin menghapus & meralat isi pesan ini untuk semua orang di kelompok diskusi?',
      snippet: textSnippet
    });
  };

  const executeConfirmedChatDelete = () => {
    const { msgId, actionType } = deleteConf;
    if (!msgId || !actionType) return;

    if (actionType === 'forMe') {
      const updated = chats.map(msg => {
        if (msg.id === msgId) {
          const deletedBy = msg.deletedBy || [];
          if (!deletedBy.includes(currentUser.id)) {
            return { ...msg, deletedBy: [...deletedBy, currentUser.id] };
          }
        }
        return msg;
      });
      onSaveChats(updated);
    } else {
      const updated = chats.map(msg => {
        if (msg.id === msgId) {
          return { 
            ...msg, 
            text: "Pesan ini telah dihapus untuk semua orang",
            fileUrl: undefined,
            fileName: undefined,
            fileType: undefined,
            deletedForAll: true 
          };
        }
        return msg;
      });
      onSaveChats(updated);
    }

    setDeleteConf({ isOpen: false, msgId: null, actionType: null, title: '', description: '', snippet: '' });
  };

  // Filter out messages that this user has deleted for themselves
  const visibleChats = chats.filter(msg => {
    const deletedBy = msg.deletedBy || [];
    return !deletedBy.includes(currentUser.id);
  });

  return (
    <div id="whatsapp-chat-container" className="flex flex-col h-[75vh] md:h-[80vh] bg-[#f8fafc] rounded-2xl border border-gray-100 overflow-hidden shadow-xl">
      
      {/* WhatsApp Header Bar */}
      <div className="bg-[#0284c7] text-white p-4 flex items-center justify-between shadow-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white overflow-hidden flex items-center justify-center shadow-inner border border-white/20 p-1">
              <img 
                src="https://i.imgur.com/Q0wCTRY.png" 
                alt="Logo KKG Gugus Padaawas" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#0284c7]"></span>
          </div>
          <div>
            <h4 className="font-bold text-sm md:text-base tracking-wide flex items-center gap-1.5">
              <span>FORUM DISKUSI GUGUS PADAAWAS</span>
              <span className="text-[10px] bg-emerald-500/80 text-white px-2 py-0.5 rounded-full font-mono uppercase">Grup</span>
            </h4>
            <p className="text-sky-100 text-xs truncate max-w-[250px] md:max-w-md">
              Diskusi Aktif Guru Kelas se-Gugus Padaawas Pasirwangi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden lg:flex flex-col items-end text-xs">
            <span className="font-semibold text-sky-100">{currentUser.nama}</span>
            <span className="text-[9px] bg-white/20 text-white px-1.5 py-0.5 rounded uppercase font-mono">{currentUser.role}</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs" title="Portal Chat Handal">
            <Shield className="w-4 h-4 text-amber-400" />
          </div>
        </div>
      </div>

      {/* Main Discussion Feed */}
      <div 
        id="chat-feed-area"
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4 custom-scrollbar"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='80' height='80' viewBox='0 0 80 80'%3E%3Cpath d='M10 10l4 4-4 4-4-4zm40 40l4 4-4 4-4-4z' fill='%230284c7' fill-opacity='0.02'/%3E%3C/svg%3E")`,
          backgroundColor: '#F0F2F5'
        }}
      >
        {/* Welcome Notice Bubble */}
        <div className="flex justify-center mb-6">
          <div className="bg-white/80 border border-sky-100 backdrop-blur-xs text-[#0f172a] rounded-xl px-5 py-3 max-w-md text-center text-xs space-y-1 shadow-xs">
            <p className="font-bold text-sky-800 flex items-center justify-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Selamat Datang di Forum Komunikasi KKG
            </p>
            <p className="text-gray-500">
              Media silahturahmi dan koordinasi kegiatan guru se-Pasirwangi. Pesan tersimpan permanen di browser Anda.
            </p>
          </div>
        </div>

        {visibleChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-center">
            <Smile className="w-12 h-12 stroke-[1.5] text-gray-300 mb-2" />
            <p className="text-sm">Belum ada obrolan hangat hari ini.</p>
            <p className="text-xs text-gray-400 mt-1">Gunakan kotak di bawah untuk memulai obrolan!</p>
          </div>
        ) : (
          visibleChats.map((msg) => {
            const isMe = msg.senderId === currentUser.id;
            const isAdminMsg = msg.senderRole === 'admin';
            
            return (
              <div 
                key={msg.id} 
                className={`flex gap-2.5 max-w-[85%] md:max-w-[70%] ${isMe ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Sender Avatar Icon */}
                <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold shadow-xs text-xs ${
                  isAdminMsg ? 'bg-amber-600' : 'bg-[#059669]'
                }`}>
                  {msg.senderFoto ? (
                    <img src={msg.senderFoto} alt={msg.senderName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{msg.senderName.substring(0, 1)}</span>
                  )}
                </div>

                {/* Message Bubble Frame */}
                <div className="flex flex-col group">
                  {/* Sender Metadata */}
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-1 px-1">
                      <span className="text-xs font-bold text-slate-700">{msg.senderName}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold uppercase ${
                        isAdminMsg ? 'bg-amber-100 text-amber-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {msg.senderRole}
                      </span>
                    </div>
                  )}

                  {/* Bubble Content Body */}
                  <div className={`relative px-4 py-2.5 shadow-sm border transition-colors ${
                    isMe 
                    ? 'chat-bubble-right border-green-200 text-slate-900 font-medium' 
                    : 'chat-bubble-left border-gray-200 text-slate-800'
                  }`}>
                    {/* Render attachment if available */}
                    {msg.fileUrl && (
                      <div className={`mb-2 pb-2 rounded-lg border flex items-center gap-2.5 max-w-md ${
                        isMe ? 'bg-[#0369a1] border-sky-600 text-white' : 'bg-gray-50 border-gray-100 text-slate-800'
                      }`}>
                        <div className="p-2 rounded bg-amber-500 text-[#0f172a] ml-2">
                          {msg.fileType?.startsWith('image/') ? (
                            <Image className="w-5 h-5" />
                          ) : (
                            <FileText className="w-5 h-5" />
                          )}
                        </div>
                        <div className="min-w-0 pr-3">
                          <p className="text-xs font-bold truncate">{msg.fileName}</p>
                          <button
                            onClick={(e) => handleDownloadFile(e, msg.fileName || 'file', msg.fileUrl || '')}
                            className={`text-[10px] underline font-semibold flex items-center gap-1 mt-0.5 cursor-pointer hover:opacity-80 transition-opacity ${
                              isMe ? 'text-amber-300' : 'text-blue-600'
                            }`}
                          >
                            <Download className="w-3 h-3" />
                            Unduh File
                          </button>
                        </div>
                        
                        {msg.fileType?.startsWith('image/') && (
                          <div className="w-12 h-12 rounded overflow-hidden mr-2 shrink-0">
                            <img src={msg.fileUrl} alt="attachment" className="w-full h-full object-cover" />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Chat text message */}
                    <p className={`text-sm leading-relaxed ${msg.deletedForAll ? 'italic text-opacity-10 text-gray-400' : ''}`}>
                      {msg.text}
                    </p>

                    {/* Message Timestamp */}
                    <span className={`block text-[9px] text-right mt-1 font-mono ${
                      isMe ? 'text-[#065F46]/70' : 'text-gray-400'
                    }`}>
                      {msg.timestamp}
                    </span>

                    {/* Action buttons (Appear on hover) */}
                    <div className={`absolute top-1/2 -translate-y-1/2 flex gap-1 bg-white border border-gray-100 shadow-md p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${
                      isMe ? 'right-full mr-2' : 'left-full ml-2'
                    }`}>
                      <button
                        onClick={() => handleDeleteForMe(msg.id)}
                        className="text-gray-500 hover:text-amber-600 p-1.5 rounded hover:bg-gray-50 transition-colors"
                        title="Hapus untuk Saya"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span className="sr-only">Hapus Saya</span>
                      </button>
                      
                      {/* Only sender OR administrator can delete for everyone */}
                      {(isMe || currentUser.role === 'admin') && !msg.deletedForAll && (
                        <button
                          onClick={() => handleDeleteForAll(msg.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded transition-colors"
                          title="Hapus untuk Semua"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messageEndRef} />
      </div>

      {/* Input Message Area & Attachments */}
      <form onSubmit={handleSend} className="bg-white border-t border-gray-200 p-4 relative z-20">
        
        {/* Render live attachment display before sending */}
        {attachment && (
          <div className="flex items-center justify-between p-2.5 bg-sky-50 rounded-lg border border-sky-100 mb-3 text-xs">
            <div className="flex items-center gap-2 text-[#0f172a]">
              <Paperclip className="w-4 h-4 text-sky-600 shrink-0" />
              <span className="font-semibold truncate max-w-sm">{attachment.name}</span>
              <span className="text-[10px] text-sky-500 bg-white px-2 py-0.5 rounded font-mono border border-sky-100">
                {(attachment.url.length * 0.75 / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
            <button 
              type="button" 
              onClick={() => setAttachment(null)} 
              className="text-red-500 hover:text-red-700 font-bold px-2 py-1 bg-white hover:bg-red-50 rounded border border-red-200 transition-colors"
            >
              Batalkan
            </button>
          </div>
        )}

        {/* Input Control Console */}
        <div className="flex items-center gap-2">
          
          {/* File picker triggers */}
          <button
            type="button"
            onClick={handleTriggerUpload}
            className="p-2.5 text-gray-500 hover:text-[#0284c7] hover:bg-gray-100 rounded-full transition-all shrink-0"
            title="Sematkan File Media"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            id="chat-upload-field"
          />

          {/* Emoji/smiles Trigger */}
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className={`p-2.5 text-gray-400 hover:text-amber-500 rounded-full transition-all ${showEmojiPicker ? 'bg-amber-50 text-amber-500' : 'hover:bg-gray-100'}`}
              title="Masukkan Emoji"
            >
              <Smile className="w-5 h-5" />
            </button>

            {/* Simulated Floating Custom Emoji Board */}
            {showEmojiPicker && (
              <div 
                ref={emojiPickerRef}
                className="absolute bottom-full left-0 mb-3 bg-white border border-gray-200 rounded-xl shadow-2xl p-3 w-64 z-50 animate-bounce-in"
              >
                <div className="grid grid-cols-6 gap-2">
                  {POPULAR_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleInsertEmoji(emoji)}
                      className="text-xl p-1.5 hover:bg-gray-100 active:scale-95 rounded text-center transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Text Input Block */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ketik pesan hangat Anda disini..."
            className="flex-1 border border-gray-200 bg-gray-50 focus:bg-white text-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-200 transition-all shadow-inner"
          />

          {/* Send Trigger */}
          <button
            type="submit"
            className="p-3 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl shadow-md cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center justify-center"
            id="send-message-btn"
          >
            <Send className="w-4.5 h-4.5 text-white" />
          </button>
        </div>
      </form>

      {/* Dynamic Pop-up Modal for Safe Delete Confirmation */}
      {deleteConf.isOpen && (
        <div id="chat-delete-confirmation-modal" className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-[999] animate-fade-in" style={{ animationDuration: '200ms' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 border border-red-100 flex flex-col items-center text-center animate-scale-in" style={{ animationDuration: '200ms' }}>
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4 text-red-500 animate-bounce">
              <Trash2 className="w-7 h-7 stroke-[2]" />
            </div>
            <h3 className="text-base font-extrabold text-slate-800 uppercase tracking-wide">
              {deleteConf.title}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed mt-2.5 max-w-xs">
              {deleteConf.description}
            </p>
            {deleteConf.snippet && (
              <div className="w-full mt-3 bg-red-50/50 p-2.5 rounded-xl border border-dotted border-red-200">
                <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider block text-center">Isi Pesan</span>
                <span className="text-[11px] text-slate-700 font-extrabold block truncate mt-0.5 max-w-full text-center">{deleteConf.snippet}</span>
              </div>
            )}
            <div className="flex gap-2.5 w-full mt-6">
              <button
                type="button"
                onClick={() => setDeleteConf({ isOpen: false, msgId: null, actionType: null, title: '', description: '', snippet: '' })}
                className="w-1/2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all duration-150 cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={executeConfirmedChatDelete}
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
