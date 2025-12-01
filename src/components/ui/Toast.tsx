import React, { useEffect } from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';

export type ToastType = 'success' | 'error';

interface ToastProps {
  message: string;
  type?: ToastType;
  isVisible: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ 
  message, 
  type = 'success', 
  isVisible, 
  onClose 
}) => {
  useEffect(() => {
    if (isVisible) {
      // Auto-ocultar después de 3 segundos
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-[100] animate-fade-in-up">
      <div className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl border ${
        type === 'success' 
          ? 'bg-white border-green-100 text-gray-800' 
          : 'bg-white border-red-100 text-gray-800'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
        ) : (
          <XCircle className="h-6 w-6 text-red-500 flex-shrink-0" />
        )}
        
        <div className="flex flex-col">
          <span className={`text-sm font-bold ${type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
            {type === 'success' ? '¡Éxito!' : 'Error'}
          </span>
          <span className="text-sm text-gray-600 font-medium">
            {message}
          </span>
        </div>

        <button 
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};