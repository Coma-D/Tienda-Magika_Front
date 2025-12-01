import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  showCloseButton?: boolean; // Nueva propiedad
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className,
  showCloseButton = true // Por defecto es true
}) => {
  
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity" onClick={onClose} />
        <div className={cn(
          'relative bg-white rounded-xl shadow-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all',
          className
        )}>
          {title && (
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* Solo mostramos la X por defecto si no hay título Y si showCloseButton es true */}
          {!title && showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 p-2 bg-white/80 hover:bg-white rounded-full text-gray-500 hover:text-gray-800 transition-all shadow-sm backdrop-blur-sm"
            >
              <X className="h-5 w-5" />
            </button>
          )}
          
          <div className="p-0 h-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};