import React, { useState, useRef } from 'react';
import { User as UserIcon, Mail, Calendar, Shield, Package, Lock, Unlock, CheckCircle, AlertCircle, X, Camera } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCollection } from '../../hooks/useCollection';
import { Button } from '../ui/Button';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';

export const Profile: React.FC = () => {
  // Ahora destructuramos también updateUser
  const { user, changePassword, updateUser } = useAuth();
  const { getCollectionStats } = useCollection(user?.id);
  const stats = getCollectionStats();
  
  // Referencia para el input de archivo oculto
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados para Cambiar Contraseña
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passForm, setPassForm] = useState({ current: '', new: '', confirm: '' });
  const [changeStatus, setChangeStatus] = useState<{ type: 'error' | 'success' | null, message: string }>({ type: null, message: '' });
  
  // Estados para Revelar Contraseña
  const [isRevealModalOpen, setIsRevealModalOpen] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [revealInput, setRevealInput] = useState('');
  const [revealError, setRevealError] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);

  if (!user) return null;

  const roleLabel = user.username === 'admin' ? 'Administrador' : 'Usuario';
  const roleColor = user.username === 'admin' 
    ? 'bg-red-900/30 text-red-300 border-red-800' 
    : 'bg-blue-900/30 text-blue-300 border-blue-800';

  // --- LÓGICA CAMBIAR FOTO ---
  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Actualizamos el usuario en el contexto y localStorage
        updateUser({ avatar: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- LÓGICA CAMBIAR CONTRASEÑA ---
  const handlePassChange = (field: string, value: string) => {
    setPassForm(prev => ({ ...prev, [field]: value }));
    if (changeStatus.type === 'error') setChangeStatus({ type: null, message: '' });
  };

  const handleSubmitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setChangeStatus({ type: null, message: '' });

    if (!passForm.current || passForm.new.length < 6 || passForm.new !== passForm.confirm) {
      setChangeStatus({ type: 'error', message: 'Verifica los datos ingresados.' });
      setIsLoading(false);
      return;
    }

    const result = await changePassword(passForm.current, passForm.new);

    if (result.success) {
      setChangeStatus({ type: 'success', message: result.message });
      setIsPasswordVisible(false); 
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPassForm({ current: '', new: '', confirm: '' });
        setChangeStatus({ type: null, message: '' });
      }, 1500);
    } else {
      setChangeStatus({ type: 'error', message: result.message });
    }
    setIsLoading(false);
  };

  // --- LÓGICA REVELAR CONTRASEÑA ---
  const handleLockClick = () => {
    if (isPasswordVisible) {
      setIsPasswordVisible(false);
    } else {
      setIsRevealModalOpen(true);
      setRevealInput('');
      setRevealError('');
    }
  };

  const handleSubmitReveal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user.password && revealInput === user.password) {
      setIsPasswordVisible(true);
      setIsRevealModalOpen(false);
      setRevealInput('');
    } else {
      setRevealError('Contraseña incorrecta');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-100 mb-8">Mi Perfil</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tarjeta de Información Principal */}
        <div className="md:col-span-1">
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6 flex flex-col items-center text-center">
            
            {/* AVATAR INTERACTIVO */}
            <div className="relative mb-4 group cursor-pointer" onClick={handleAvatarClick} title="Cambiar foto de perfil">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-blue-600 shadow-xl transition-opacity group-hover:opacity-75" 
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-blue-600 shadow-xl bg-gray-800 flex items-center justify-center text-4xl font-bold text-gray-400 group-hover:bg-gray-700 transition-colors">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
              
              {/* Overlay de cámara al hacer hover */}
              <div className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="w-10 h-10 text-white drop-shadow-md" />
              </div>

              {/* Indicador de estado online */}
              <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-4 border-gray-900 ${user.isOnline ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              
              {/* Input oculto */}
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange} 
              />
            </div>
            
            <h2 className="text-xl font-bold text-white mb-6">{user.username}</h2>
            <div className="w-full pt-4 border-t border-gray-800 flex justify-center">
               <span className={`px-4 py-1.5 rounded-full text-sm font-bold border ${roleColor}`}>
                 {roleLabel}
               </span>
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-gray-200 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Información de Cuenta
              </h3>
            </div>

            <div className="space-y-4">
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <UserIcon className="h-5 w-5 text-gray-500 mr-4" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Nombre Completo</p>
                  <p className="text-gray-200 font-medium">{user.name}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <Mail className="h-5 w-5 text-gray-500 mr-4" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Correo Electrónico</p>
                  <p className="text-gray-200 font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <Calendar className="h-5 w-5 text-gray-500 mr-4" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider">ID de Usuario</p>
                  <p className="text-gray-200 font-medium font-mono text-sm">{user.id}</p>
                </div>
              </div>

              {/* SECCIÓN CONTRASEÑA */}
              <div className="flex items-center p-3 bg-gray-800/50 rounded-lg border border-gray-800/50">
                <button 
                  onClick={handleLockClick}
                  className="mr-4 text-gray-500 hover:text-blue-400 transition-colors focus:outline-none"
                  title={isPasswordVisible ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {isPasswordVisible ? (
                    <Unlock className="h-5 w-5 text-blue-400" />
                  ) : (
                    <Lock className="h-5 w-5" />
                  )}
                </button>
                
                <div className="flex-1">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">Contraseña</p>
                  <p className="text-gray-200 font-medium font-mono text-sm tracking-widest min-h-[20px]">
                    {isPasswordVisible ? user.password : '••••••••'}
                  </p>
                </div>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-xs text-blue-400 hover:text-blue-300 h-7 px-3 hover:bg-transparent"
                  onClick={() => setIsPasswordModalOpen(true)}
                >
                  Cambiar
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 rounded-xl shadow-lg border border-gray-800 p-6">
            <h3 className="text-lg font-bold text-gray-200 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2 text-purple-500" />
              Resumen de Colección
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-800">
                <p className="text-3xl font-extrabold text-white mb-1">{stats.totalCards}</p>
                <p className="text-xs text-gray-400 uppercase">Cartas Totales</p>
              </div>
              <div className="bg-gray-800/50 p-4 rounded-lg text-center border border-gray-800">
                <p className="text-3xl font-extrabold text-yellow-500 mb-1">{stats.favoriteCards}</p>
                <p className="text-xs text-gray-400 uppercase">Favoritas</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL 1: REVELAR CONTRASEÑA */}
      <Modal 
        isOpen={isRevealModalOpen} 
        onClose={() => setIsRevealModalOpen(false)}
        className="max-w-sm !bg-gray-900 border border-gray-800"
        showCloseButton={false}
      >
        <div className="flex justify-between items-center p-5 border-b border-gray-800">
          <h2 className="text-lg font-bold text-white">Verificar Identidad</h2>
          <button onClick={() => setIsRevealModalOpen(false)} className="text-gray-400 hover:text-white"><X className="h-5 w-5" /></button>
        </div>
        <div className="p-5">
          <form onSubmit={handleSubmitReveal} className="space-y-4">
            <p className="text-sm text-gray-400 mb-2">Ingresa tu contraseña para mostrarla:</p>
            <Input 
              type="password"
              placeholder="Contraseña"
              value={revealInput}
              onChange={(e) => {
                setRevealInput(e.target.value);
                setRevealError('');
              }}
              className="bg-gray-800 border-gray-700 text-white"
              autoFocus
            />
            {revealError && <p className="text-xs text-red-400 mt-1">{revealError}</p>}
            <div className="flex gap-3 mt-4">
              <Button type="button" variant="secondary" onClick={() => setIsRevealModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700">Cancelar</Button>
              <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">Verificar</Button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL 2: CAMBIAR CONTRASEÑA */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)}
        className="max-w-md !bg-gray-900 border border-gray-800"
        showCloseButton={false}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Cambiar Contraseña</h2>
          <button onClick={() => setIsPasswordModalOpen(false)} className="text-gray-400 hover:text-white transition-colors"><X className="h-5 w-5" /></button>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmitChange} className="space-y-4">
            <div className="p-3 bg-blue-900/20 border border-blue-900/50 rounded-lg mb-4">
              <p className="text-sm text-blue-200">Por seguridad, verificamos tu contraseña actual.</p>
            </div>

            <Input 
              label="Contraseña Actual" 
              type="password"
              placeholder="••••••••"
              value={passForm.current}
              onChange={(e) => handlePassChange('current', e.target.value)}
              className="bg-gray-800 border-gray-700 text-white"
            />
            
            <div className="border-t border-gray-800 my-4 pt-4">
              <Input 
                label="Nueva Contraseña" 
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={passForm.new}
                onChange={(e) => handlePassChange('new', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white mb-4"
              />
              <Input 
                label="Confirmar Nueva Contraseña" 
                type="password"
                placeholder="Repite la nueva contraseña"
                value={passForm.confirm}
                onChange={(e) => handlePassChange('confirm', e.target.value)}
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>

            {changeStatus.message && (
              <div className={`p-3 rounded-lg flex items-center gap-2 ${
                changeStatus.type === 'error' ? 'bg-red-900/30 text-red-200 border border-red-800' : 'bg-green-900/30 text-green-200 border border-green-800'
              }`}>
                {changeStatus.type === 'error' ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                <p className="text-sm font-medium">{changeStatus.message}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Button type="button" variant="secondary" onClick={() => setIsPasswordModalOpen(false)} className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 border-gray-700">Cancelar</Button>
              <Button type="submit" loading={isLoading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-900/20">Actualizar</Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};