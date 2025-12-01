import React, { useState } from 'react';
import { X, History, ChevronLeft, Inbox } from 'lucide-react';
import { Notification } from '../../context/NotificationContext';

interface NotificationsPanelProps {
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onClose: () => void;
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({ 
  notifications, 
  onMarkAsRead, 
  onClose 
}) => {
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
  const [showHistory, setShowHistory] = useState(false);

  const displayedNotifications = showHistory
    ? notifications
    : notifications.filter(n => !n.read);

  const handleSelect = (notif: Notification) => {
    setSelectedNotification(notif);
    if (!notif.read) {
      onMarkAsRead(notif.id);
    }
  };

  const parseMessage = (msg: string) => {
    if (msg.includes('Asunto:')) {
      const [headerPart, rest] = msg.split('Asunto:');
      const [subject, ...bodyParts] = rest.split('\n\n');
      
      const cleanHeader = headerPart
        .replace('Soporte:', '')
        .replace(/\s*\(@.*?\)/, '')
        .trim();

      return { 
        header: cleanHeader, 
        subject: subject.trim(), 
        content: bodyParts.join('\n\n').trim() 
      };
    }
    return { header: 'Sistema', subject: 'Notificación', content: msg };
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden z-50 flex flex-col max-h-[450px] animate-fade-in-up">
      
      {/* CABECERA */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-gray-900/95 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center gap-1">
          {selectedNotification ? (
            <button 
              onClick={() => setSelectedNotification(null)} 
              className="p-1 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors"
              title="Volver"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          ) : null}
          
          {/* Texto un poco más grande (text-sm) */}
          <h3 className="font-bold text-gray-100 text-sm flex items-center gap-2">
            {selectedNotification ? 'Detalles del Mensaje' : 'Notificaciones'}
          </h3>

          {!selectedNotification && (
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className={`ml-1 p-1 rounded-md transition-colors ${showHistory ? 'bg-blue-900/30 text-blue-400' : 'hover:bg-gray-800 text-gray-500 hover:text-white'}`}
              title={showHistory ? "Ver solo nuevas" : "Ver historial completo"}
            >
              <History className="h-4 w-4" />
            </button>
          )}
        </div>
        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900">
        {selectedNotification ? (
          // --- VISTA DETALLE ---
          <div className="p-4">
            <div className="mb-4">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider bg-gray-800 px-2 py-0.5 rounded border border-gray-700">
                  {parseMessage(selectedNotification.message).header}
                </span>
                <span className="text-xs text-gray-500">{selectedNotification.date}</span>
              </div>
              <h4 className="text-base font-bold text-white mt-1 leading-snug">
                {parseMessage(selectedNotification.message).subject}
              </h4>
            </div>
            
            <div className="bg-gray-800/40 p-4 rounded-lg border border-gray-800 text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
              {parseMessage(selectedNotification.message).content}
            </div>
          </div>
        ) : (
          // --- VISTA LISTA ---
          <div className="divide-y divide-gray-800">
            {displayedNotifications.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center text-gray-500">
                <Inbox className="h-8 w-8 mb-2 opacity-20" />
                <p className="text-sm">
                  {showHistory ? 'Historial vacío.' : 'Estás al día.'}
                </p>
              </div>
            ) : (
              displayedNotifications.map(notif => {
                const { subject, content } = parseMessage(notif.message);
                return (
                  <div 
                    key={notif.id} 
                    onClick={() => handleSelect(notif)}
                    className={`p-4 hover:bg-gray-800/60 transition-all cursor-pointer relative group border-l-2 ${!notif.read ? 'bg-blue-900/5 border-l-blue-500' : 'border-l-transparent'}`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-semibold pr-2 line-clamp-1 ${!notif.read ? 'text-blue-400' : 'text-gray-300'}`}>
                        {subject}
                      </h4>
                      <span className="text-xs text-gray-600 flex-shrink-0 whitespace-nowrap">{notif.date}</span>
                    </div>
                    <p className="text-xs text-gray-400 line-clamp-2 leading-snug">
                      {content}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      
      {/* Pie de página */}
      <div className="py-2 border-t border-gray-800 bg-gray-900 text-center">
        <span className="text-xs text-gray-600 uppercase tracking-wider font-medium">
          {showHistory ? `${notifications.length} Totales` : `${displayedNotifications.length} Nuevas`}
        </span>
      </div>
    </div>
  );
};