import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Send, Users, MessageCircle, MoreVertical, Clock, Trash2, X, Eye, History, Ban, CheckCircle, UserX, UserCheck, AlertTriangle, ArrowLeft } from 'lucide-react';
import { ChatMessage, User } from '../../types';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { formatTime } from '../../utils/format';
import { t } from '../../data/constants';
import { ConfirmationModal } from '../ui/ConfirmationModal';
import { Modal } from '../ui/Modal';

// Interfaz de Props
interface CommunityProps {
  onViewCollection?: (user: User) => void;
  onViewHistory?: (user: User) => void;
  forcedUser?: User;
  readOnly?: boolean;
  onBack?: () => void;
}

// ==========================================
// 1. HOOK DE LÓGICA
// ==========================================
const useCommunityLogic = (user: User | null, forcedUser?: User, readOnly?: boolean) => {
  // Datos Persistentes
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try { return JSON.parse(localStorage.getItem('community_messages') || '[]'); } 
    catch { return []; }
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<Record<string, number>>(() => {
    try { return JSON.parse(localStorage.getItem('magika_banned_users') || '{}'); } 
    catch { return {}; }
  });
  const [blocks, setBlocks] = useState<Record<string, string[]>>(() => {
    try { return JSON.parse(localStorage.getItem('magika_blocks') || '{}'); } 
    catch { return {}; }
  });

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; type: 'error' | 'info' } | null>(null);

  // Efectos de Persistencia
  useEffect(() => { localStorage.setItem('community_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('magika_banned_users', JSON.stringify(bannedUsers)); }, [bannedUsers]);
  useEffect(() => { localStorage.setItem('magika_blocks', JSON.stringify(blocks)); }, [blocks]);

  // Sincronización de mensajes para detectar nuevos en tiempo real (entre pestañas)
  useEffect(() => {
    const syncMessages = () => {
      const saved = localStorage.getItem('community_messages');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed.length !== messages.length) {
            setMessages(parsed);
          }
        } catch (e) {}
      }
    };
    const interval = setInterval(syncMessages, 1000); // Polling cada segundo para ver mensajes nuevos
    return () => clearInterval(interval);
  }, [messages]);

  // Carga de usuarios
  useEffect(() => {
    const loadUsers = () => {
      try { setAvailableUsers(JSON.parse(localStorage.getItem('magika_users') || '[]')); } 
      catch { setAvailableUsers([]); }
    };
    loadUsers();
    const interval = setInterval(loadUsers, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helpers
  const isUserBanned = (userId: string) => {
    const banUntil = bannedUsers[userId];
    return banUntil ? banUntil > Date.now() : false;
  };

  const isBlockedBy = (blockerId: string, targetId: string) => {
    return blocks[blockerId]?.includes(targetId) || false;
  };

  // Acciones
  const sendMessage = (text: string) => {
    if (!user) return;
    if (isUserBanned(user.id)) {
      setAlertInfo({ title: "Acción Restringida", message: "Has sido vetado temporalmente de la comunidad.", type: 'error' });
      return;
    }
    if (selectedUser && isBlockedBy(selectedUser.id, user.id)) {
      setAlertInfo({ title: "Mensaje no enviado", message: `No puedes enviar mensajes a ${selectedUser.username} porque te ha bloqueado.`, type: 'error' });
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      sender: user,
      message: text,
      timestamp: new Date().toISOString(),
      isPrivate: !!selectedUser,
      recipient: selectedUser || undefined,
      read: true // El mensaje propio nace leído
    };
    
    // IMPORTANTE: Si es mensaje privado, necesitamos crear la copia "no leída" para el destinatario
    // Pero como compartimos el array de mensajes, basta con asegurarnos que el filtro de "read" funcione bien.
    // En este modelo simplificado de chat local, el mensaje se guarda una sola vez.
    // Para simular que el OTRO no lo ha leído, deberíamos marcarlo como read: false si soy el sender.
    // Pero la lógica de visualización actual asume que si yo lo envié, está leído.
    // Ajuste: Para que el OTRO vea la notificación, el mensaje debe tener read: false.
    // Como compartimos DB, si pongo read: false, yo lo veré no leído también.
    // Solución: El campo `read` debería ser un array de IDs de quienes lo leyeron, o simplificar:
    // El mensaje nace `read: false`. Si soy el sender, lo veo normal. Si soy el recipient, lo veo como no leído hasta que entro al chat.
    
    if (selectedUser) {
        newMessage.read = false; // Mensaje privado nace NO LEÍDO
    } else {
        newMessage.read = true; // Mensaje público nace leído (simplificación)
    }

    setMessages(prev => [...prev, newMessage]);
  };

  const deleteMessage = (messageId: string) => {
    setMessages(prev => prev.filter(m => m.id !== messageId));
  };

  const toggleBlock = (targetId: string) => {
    if (!user) return;
    setBlocks(prev => {
      const currentBlocks = prev[user.id] || [];
      const newBlocks = currentBlocks.includes(targetId) 
        ? currentBlocks.filter(id => id !== targetId)
        : [...currentBlocks, targetId];
      return { ...prev, [user.id]: newBlocks };
    });
  };

  const toggleBan = (targetId: string, durationMinutes?: number) => {
    if (isUserBanned(targetId)) {
      const newBanned = { ...bannedUsers };
      delete newBanned[targetId];
      setBannedUsers(newBanned);
    } else if (durationMinutes !== undefined) {
      const until = durationMinutes === -1 
        ? Date.now() + (100 * 365 * 24 * 60 * 60 * 1000) 
        : Date.now() + (durationMinutes * 60 * 1000);
      setBannedUsers(prev => ({ ...prev, [targetId]: until }));
    }
  };

  const markAsRead = () => {
    if (!selectedUser || !user) return;
    // Marcar como leídos los mensajes donde YO soy el receptor y el OTRO es el emisor
    setMessages(prev => prev.map(msg => 
      (msg.sender.id === selectedUser.id && msg.recipient?.id === user.id && !msg.read) 
        ? { ...msg, read: true } 
        : msg
    ));
  };

  // Datos Computados
  const categorizedUsers = useMemo(() => {
    const filtered = availableUsers.filter(u => u.id !== user?.id && u.username.toLowerCase().includes(searchTerm.toLowerCase()));
    const online = filtered.filter(u => u.isOnline);
    const offline = filtered.filter(u => !u.isOnline);

    const usersWithHistory = offline.map(u => {
      const interactions = messages.filter(m => 
        (m.sender.id === user?.id && m.recipient?.id === u.id) || (m.sender.id === u.id && m.recipient?.id === user?.id)
      );
      const lastTime = interactions.length > 0 ? Math.max(...interactions.map(m => new Date(m.timestamp).getTime())) : 0;
      return { user: u, lastTime };
    });

    return {
      online,
      recent: usersWithHistory.filter(i => i.lastTime > 0).sort((a, b) => b.lastTime - a.lastTime).map(i => i.user),
      others: usersWithHistory.filter(i => i.lastTime === 0).map(i => i.user)
    };
  }, [availableUsers, searchTerm, user, messages]);

  const filteredMessages = useMemo(() => {
    if (selectedUser) {
      return messages.filter(msg => 
        msg.isPrivate && ((msg.sender.id === user?.id && msg.recipient?.id === selectedUser.id) || (msg.sender.id === selectedUser.id && msg.recipient?.id === user?.id))
      );
    }
    return messages.filter(msg => !msg.isPrivate);
  }, [messages, selectedUser, user]);

  // Conteo de no leídos: Mensajes privados donde yo soy el receptor y read es false
  const getUnreadCount = (otherUserId: string) => {
    if (!user) return 0;
    return messages.filter(m => 
      m.isPrivate && 
      m.sender.id === otherUserId && 
      m.recipient?.id === user.id && 
      !m.read
    ).length;
  };

  return {
    messages: filteredMessages,
    users: categorizedUsers,
    actions: { sendMessage, deleteMessage, toggleBlock, toggleBan, markAsRead, setSearchTerm, setSelectedUser, setAlertInfo },
    state: { searchTerm, selectedUser, alertInfo, isUserBanned, isBlockedBy, getUnreadCount }
  };
};

// ==========================================
// 2. SUB-COMPONENTES
// ==========================================

const UserSidebar: React.FC<{
  users: { online: User[], recent: User[], others: User[] },
  searchTerm: string,
  onSearchChange: (val: string) => void,
  onSelectUser: (u: User | null) => void,
  selectedUserId?: string,
  getUnreadCount: (id: string) => number,
  isUserBanned: (id: string) => boolean,
  currentUser: User | null,
  isHistoryMode: boolean,
  onBack?: () => void
}> = ({ users, searchTerm, onSearchChange, onSelectUser, selectedUserId, getUnreadCount, isUserBanned, currentUser, isHistoryMode, onBack }) => {
  
  const UserItem = ({ u }: { u: User }) => {
    const unread = getUnreadCount(u.id);
    const banned = isUserBanned(u.id);
    return (
      <button onClick={() => onSelectUser(u)} className={`w-full text-left p-2 rounded-xl transition-all duration-200 flex items-center group relative mb-1 ${selectedUserId === u.id ? 'bg-blue-900/30 text-blue-300 ring-1 ring-blue-800' : 'text-gray-300 hover:bg-gray-800'}`}>
        <div className="relative mr-3">
          <img src={u.avatar || `https://placehold.co/100x100/1f2937/9ca3af?text=${u.username.charAt(0).toUpperCase()}`} alt={u.username} className={`w-10 h-10 rounded-full object-cover shadow-sm ring-2 ${banned ? 'ring-red-500 grayscale' : 'ring-gray-800'}`} />
          
          {/* Estado Online (Abajo Derecha) */}
          <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-gray-900 ${u.isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          
          {/* --- ICONO DE MENSAJE NUEVO (ARRIBA DERECHA) --- */}
          {unread > 0 && (
            <div className="absolute -top-1.5 -right-1.5 bg-blue-600 text-white rounded-full p-1 border-2 border-gray-900 flex items-center justify-center shadow-md z-10 animate-bounce">
              <MessageCircle className="w-3 h-3 fill-current" />
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center">
            <p className={`font-semibold text-sm truncate ${banned ? 'text-red-400 line-through' : ''}`}>{u.username}</p>
            {/* También mostramos el contador numérico si quieres doble confirmación, o lo quitamos si solo quieres el icono. Aquí dejo ambos. */}
            {unread > 0 && <span className="ml-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-sm">{unread}</span>}
          </div>
          <p className="text-xs truncate text-gray-500 group-hover:text-gray-400">{banned ? 'Baneado' : (u.isOnline ? t('Online') : t('Offline'))}</p>
        </div>
      </button>
    );
  };

  return (
    <div className="lg:col-span-1 bg-gray-900 rounded-2xl shadow-lg border border-gray-800 flex flex-col overflow-hidden">
      <div className="p-4 border-b border-gray-800 bg-gray-900">
        {isHistoryMode ? (
          <div className="flex items-center gap-3 mb-4">
             {onBack && <button onClick={onBack} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white"><ArrowLeft className="h-5 w-5" /></button>}
             <div><h2 className="font-bold text-lg text-white">Historial</h2><p className="text-xs text-gray-400">Viendo como <span className="text-blue-400">@{currentUser?.username}</span></p></div>
          </div>
        ) : (
          <div className="flex items-center text-gray-100 mb-4"><Users className="h-5 w-5 mr-2 text-blue-500" /><h2 className="font-bold text-lg">Comunidad</h2></div>
        )}
        <Input placeholder={t('Search users')} className="text-sm bg-gray-800 border-gray-700 text-gray-200" value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} />
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-4 custom-scrollbar">
        <div className="mb-2">
          <button onClick={() => onSelectUser(null)} className={`w-full text-left p-3 rounded-xl transition-all flex items-center ${!selectedUserId ? 'bg-blue-900/30 text-blue-300 ring-1 ring-blue-800' : 'text-gray-400 hover:bg-gray-800'}`}>
            <div className={`p-2 rounded-full mr-3 ${!selectedUserId ? 'bg-blue-900/50' : 'bg-gray-800'}`}><MessageCircle className="h-5 w-5" /></div>
            <span className="font-bold text-sm">{t('General Chat')}</span>
          </button>
        </div>
        {users.online.length > 0 && <div><div className="px-3 pb-2 text-xs font-bold text-green-500 uppercase flex items-center">En Línea <span className="ml-2 bg-green-500/20 text-green-400 px-1.5 rounded-full text-[10px]">{users.online.length}</span></div>{users.online.map(u => <UserItem key={u.id} u={u} />)}</div>}
        {users.recent.length > 0 && <div><div className="px-3 pb-2 text-xs font-bold text-blue-400 uppercase flex items-center mt-2"><Clock className="w-3 h-3 mr-1.5" /> Recientes</div>{users.recent.map(u => <UserItem key={u.id} u={u} />)}</div>}
        {users.others.length > 0 && <div><div className="px-3 pb-2 text-xs font-bold text-gray-600 uppercase mt-2">Otros</div>{users.others.map(u => <UserItem key={u.id} u={u} />)}</div>}
      </div>
    </div>
  );
};

const ChatWindow: React.FC<{
  messages: ChatMessage[],
  selectedUser: User | null,
  currentUser: User | null,
  onSendMessage: (text: string) => void,
  onDeleteMessage: (id: string) => void,
  onAvatarClick: (u: User) => void,
  onToggleBlock: () => void,
  isUserBanned: (id: string) => boolean,
  isBlockedBy: (blocker: string, target: string) => boolean,
  readOnly: boolean,
  availableUsersCount: number
}> = ({ messages, selectedUser, currentUser, onSendMessage, onDeleteMessage, onAvatarClick, onToggleBlock, isUserBanned, isBlockedBy, readOnly, availableUsersCount }) => {
  const [inputText, setInputText] = useState('');
  const [selectedMsgId, setSelectedMsgId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText);
    setInputText('');
  };

  const amIBanned = currentUser ? isUserBanned(currentUser.id) : false;

  return (
    <div className="lg:col-span-3 bg-gray-900 rounded-2xl shadow-lg border border-gray-800 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-900 z-10 shadow-sm">
        <div className="flex items-center">
          {selectedUser ? (
            <>
              <img src={selectedUser.avatar || `https://placehold.co/100x100/1f2937/9ca3af?text=${selectedUser.username.charAt(0).toUpperCase()}`} alt={selectedUser.username} className="w-10 h-10 rounded-full mr-3 border border-gray-700 cursor-pointer hover:border-blue-500 object-cover" onClick={() => onAvatarClick(selectedUser)} />
              <div>
                <h2 className="text-lg font-bold text-gray-100">{selectedUser.username}</h2>
                {isUserBanned(selectedUser.id) ? <p className="text-xs font-bold text-red-500">USUARIO BANEADO</p> : <p className={`text-xs font-medium ${selectedUser.isOnline ? 'text-green-500' : 'text-gray-500'}`}>{selectedUser.isOnline ? t('Online') : t('Offline')}</p>}
              </div>
            </>
          ) : (
            <>
              <div className="p-2 bg-blue-900/30 rounded-full mr-3 text-blue-400"><Users className="h-6 w-6" /></div>
              <div><h2 className="text-lg font-bold text-gray-100">{t('General Chat')}</h2><p className="text-xs text-gray-500">{availableUsersCount} participantes</p></div>
            </>
          )}
        </div>
        {selectedUser && !readOnly && (
          <button onClick={onToggleBlock} className={`p-2 rounded-full transition-colors ${currentUser && isBlockedBy(currentUser.id, selectedUser.id) ? 'text-red-400 bg-red-900/30' : 'text-gray-400 hover:text-red-400'}`}>
            {currentUser && isBlockedBy(currentUser.id, selectedUser.id) ? <UserCheck className="h-5 w-5" /> : <UserX className="h-5 w-5" />}
          </button>
        )}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-black/20 custom-scrollbar">
        {messages.map((msg) => {
          const isMe = msg.sender.id === currentUser?.id;
          const isSelected = selectedMsgId === msg.id;
          const isSenderBanned = isUserBanned(msg.sender.id);
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex max-w-[85%] sm:max-w-[75%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && (
                  <img src={msg.sender.avatar || `https://placehold.co/100x100/1f2937/9ca3af?text=${msg.sender.username.charAt(0).toUpperCase()}`} className={`w-8 h-8 rounded-full self-end mb-1 mr-2 cursor-pointer object-cover ${isSenderBanned ? 'grayscale opacity-50' : ''}`} onClick={() => onAvatarClick(msg.sender)} />
                )}
                <div className="flex flex-col">
                  {!isMe && !selectedUser && <div className="flex items-center gap-2 mb-1 ml-1"><span className="text-xs text-gray-500">{msg.sender.username}</span>{isSenderBanned && <span className="text-[10px] bg-red-900/50 text-red-300 px-1 rounded">Baneado</span>}</div>}
                  <div className={`flex items-center gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div onClick={() => setSelectedMsgId(isSelected ? null : msg.id)} className={`px-4 py-3 rounded-2xl shadow-md text-sm cursor-pointer border ${isMe ? 'bg-blue-600 text-white rounded-br-none border-blue-500' : 'bg-gray-800 text-gray-200 rounded-bl-none border-gray-700'} ${isSelected ? 'ring-2 ring-white/50' : ''}`}>
                      {msg.message}
                    </div>
                    {isSelected && !readOnly && <button onClick={() => onDeleteMessage(msg.id)} className="p-2 bg-red-900/50 hover:bg-red-600 text-red-200 hover:text-white rounded-full"><Trash2 className="h-4 w-4" /></button>}
                  </div>
                  <div className={`flex items-center mt-1 text-[10px] text-gray-500 ${isMe ? 'justify-end mr-1' : 'ml-1'}`}><span>{formatTime(msg.timestamp)}</span>{isMe && msg.isPrivate && <span className="ml-1 text-blue-400">✓✓</span>}</div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {!readOnly ? (
          <form onSubmit={handleSubmit} className="flex gap-3 items-center">
            <Input value={inputText} onChange={(e) => setInputText(e.target.value)} placeholder={amIBanned ? 'Has sido vetado.' : (selectedUser ? `Mensaje para ${selectedUser.username}...` : t('Type a message'))} className="bg-gray-800 border-gray-700 text-gray-200" disabled={amIBanned} />
            <Button type="submit" disabled={!inputText.trim() || amIBanned} className="rounded-full w-12 h-12 p-0 flex items-center justify-center bg-blue-600"><Send className="h-5 w-5 ml-0.5" /></Button>
          </form>
        ) : (
          <div className="py-2 text-center text-gray-500 text-sm italic">Modo solo lectura.</div>
        )}
      </div>
    </div>
  );
};

const CommunityModals: React.FC<{
  userToDelete: string | null,
  userToBlock: User | null,
  viewingUser: User | null,
  isBanOpen: boolean,
  alertInfo: any,
  isUserBanned: (id: string) => boolean,
  actions: any
}> = ({ userToDelete, userToBlock, viewingUser, isBanOpen, alertInfo, isUserBanned, actions }) => {
  return (
    <>
      <ConfirmationModal isOpen={!!userToDelete} onClose={() => actions.setMessageToDelete(null)} onConfirm={actions.confirmDeleteMessage} title="Eliminar Mensaje" message="¿Eliminar mensaje?" />
      <ConfirmationModal isOpen={!!userToBlock} onClose={() => actions.setIsBlockConfirmOpen(false)} onConfirm={actions.confirmBlockUser} title="Bloquear Usuario" message={`¿Bloquear a ${userToBlock?.username}?`} />
      <Modal isOpen={!!alertInfo} onClose={() => actions.setAlertInfo(null)} className="max-w-sm !bg-gray-900 border border-gray-800" showCloseButton={false}>
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-900/30 mb-4"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
          <h3 className="text-lg font-bold text-white mb-2">{alertInfo?.title}</h3>
          <p className="text-gray-400 text-sm mb-6">{alertInfo?.message}</p>
          <Button onClick={() => actions.setAlertInfo(null)} className="w-full bg-gray-800 hover:bg-gray-700 text-white border border-gray-700">Aceptar</Button>
        </div>
      </Modal>
      <Modal isOpen={!!viewingUser} onClose={() => actions.setViewingUserOptions(null)} className="max-w-sm !bg-gray-900 border border-gray-800" showCloseButton={false}>
        <div className="flex justify-between items-center p-4 border-b border-gray-800"><h2 className="text-lg font-bold text-white">Opciones</h2><button onClick={() => actions.setViewingUserOptions(null)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button></div>
        {viewingUser && (
          <div className="p-6 flex flex-col items-center">
            <img src={viewingUser.avatar || `https://placehold.co/100x100/1f2937/9ca3af?text=${viewingUser.username.charAt(0).toUpperCase()}`} className={`w-24 h-24 rounded-full border-4 shadow-xl object-cover ${isUserBanned(viewingUser.id) ? 'border-red-600 grayscale' : 'border-gray-800'}`} />
            <h3 className="text-xl font-bold text-white mb-6">{viewingUser.username}</h3>
            <div className="w-full flex flex-col gap-3">
              <div className="flex gap-3">
                <Button onClick={actions.handleStartChat} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"><MessageCircle className="h-4 w-4 mr-2" /> Chatear</Button>
                <Button onClick={actions.handleViewCollection} variant="secondary" className="flex-1 bg-gray-800 border-gray-700 text-gray-200"><Eye className="h-4 w-4 mr-2" /> Ver Colección</Button>
              </div>
              <div className="flex gap-3">
                <Button onClick={actions.handleViewHistory} variant="secondary" className="flex-1 bg-gray-800 border-gray-700 text-gray-200"><History className="h-4 w-4 mr-2" /> Historial</Button>
                {isUserBanned(viewingUser.id) ? (
                  <Button onClick={actions.handleBanClick} className="flex-1 bg-green-600 text-white border border-green-800"><CheckCircle className="h-4 w-4 mr-2" /> Desbanear</Button>
                ) : (
                  <Button onClick={actions.handleBanClick} variant="destructive" className="flex-1 bg-red-900/50 border-red-800 text-red-200"><Ban className="h-4 w-4 mr-2" /> Bannear</Button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
      <Modal isOpen={isBanOpen} onClose={() => actions.setIsBanDurationModalOpen(false)} className="max-w-xs !bg-gray-900 border border-gray-800" showCloseButton={false}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 text-center">Duración del Veto</h3>
          <div className="space-y-3">
            {[15, 60, 1440].map(m => <Button key={m} onClick={() => actions.confirmBan(m)} variant="secondary" className="w-full justify-start bg-gray-800 border-gray-700 text-gray-300"><Clock className="h-4 w-4 mr-3" /> {m === 1440 ? '1 Día' : m === 60 ? '1 Hora' : '15 Minutos'}</Button>)}
            <Button onClick={() => actions.confirmBan(-1)} variant="destructive" className="w-full justify-start bg-red-900/30 border-red-800 text-red-300"><Ban className="h-4 w-4 mr-3" /> Permanente</Button>
          </div>
          <Button onClick={() => actions.setIsBanDurationModalOpen(false)} variant="ghost" className="w-full mt-4 text-gray-500">Cancelar</Button>
        </div>
      </Modal>
    </>
  );
};

// ==========================================
// 3. COMPONENTE PRINCIPAL
// ==========================================

export const Community: React.FC<CommunityProps> = ({ onViewCollection, onViewHistory, forcedUser, readOnly = false, onBack }) => {
  const { user: authUser } = useAuth();
  const currentUser = forcedUser || authUser;
  
  const { messages, users, actions, state } = useCommunityLogic(currentUser, forcedUser, readOnly);
  
  // Estado local para modales que requieren lógica de UI directa
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isBlockConfirmOpen, setIsBlockConfirmOpen] = useState(false);
  const [viewingUserOptions, setViewingUserOptions] = useState<User | null>(null);
  const [isBanDurationModalOpen, setIsBanDurationModalOpen] = useState(false);

  // Wrappers de acciones para conectar UI con Logic
  const uiActions = {
    ...actions,
    setMessageToDelete,
    setIsBlockConfirmOpen,
    setViewingUserOptions,
    setIsBanDurationModalOpen,
    confirmDeleteMessage: () => { if (messageToDelete) { actions.deleteMessage(messageToDelete); setMessageToDelete(null); } },
    confirmBlockUser: () => { if (state.selectedUser) { actions.toggleBlock(state.selectedUser.id); setIsBlockConfirmOpen(false); } },
    handleStartChat: () => { if (!readOnly && viewingUserOptions) { actions.setSelectedUser(viewingUserOptions); setViewingUserOptions(null); } },
    handleViewCollection: () => { 
      if (viewingUserOptions && onViewCollection) { onViewCollection(viewingUserOptions); setViewingUserOptions(null); }
      else actions.setAlertInfo({ title: "Info", message: "Navegación no disponible", type: 'info' });
    },
    handleViewHistory: () => {
      if (viewingUserOptions && onViewHistory) { onViewHistory(viewingUserOptions); setViewingUserOptions(null); }
      else actions.setAlertInfo({ title: "Info", message: "Historial no disponible", type: 'info' });
    },
    handleBanClick: () => {
      if (readOnly || !viewingUserOptions) return;
      if (state.isUserBanned(viewingUserOptions.id)) actions.toggleBan(viewingUserOptions.id);
      else setIsBanDurationModalOpen(true);
    },
    confirmBan: (duration: number) => { if (viewingUserOptions) { actions.toggleBan(viewingUserOptions.id, duration); setIsBanDurationModalOpen(false); } }
  };

  // Efecto para marcar leídos al cambiar de usuario
  useEffect(() => { actions.markAsRead(); }, [state.selectedUser, messages.length]);

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 h-[calc(100vh-4rem)]">
      <div className="grid lg:grid-cols-4 gap-6 h-full">
        <UserSidebar 
          users={users} 
          searchTerm={state.searchTerm} 
          onSearchChange={actions.setSearchTerm} 
          onSelectUser={actions.setSelectedUser} 
          selectedUserId={state.selectedUser?.id}
          getUnreadCount={state.getUnreadCount}
          isUserBanned={state.isUserBanned}
          currentUser={currentUser}
          isHistoryMode={!!forcedUser}
          onBack={onBack}
        />
        <ChatWindow 
          messages={messages} 
          selectedUser={state.selectedUser} 
          currentUser={currentUser}
          onSendMessage={actions.sendMessage}
          onDeleteMessage={setMessageToDelete}
          onAvatarClick={(u) => u.id !== currentUser?.id && setViewingUserOptions(u)}
          onToggleBlock={() => {
            if (state.selectedUser && state.isBlockedBy(currentUser?.id || '', state.selectedUser.id)) actions.toggleBlock(state.selectedUser.id);
            else setIsBlockConfirmOpen(true);
          }}
          isUserBanned={state.isUserBanned}
          isBlockedBy={state.isBlockedBy}
          readOnly={!!readOnly}
          availableUsersCount={users.online.length + users.recent.length + users.others.length + 1}
        />
      </div>
      <CommunityModals 
        userToDelete={messageToDelete} 
        userToBlock={isBlockConfirmOpen ? state.selectedUser : null}
        viewingUser={viewingUserOptions}
        isBanOpen={isBanDurationModalOpen}
        alertInfo={state.alertInfo}
        isUserBanned={state.isUserBanned}
        actions={uiActions}
      />
    </div>
  );
};