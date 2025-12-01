import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface ForgotPasswordFormProps {
  onBack: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onBack }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await resetPassword(email);
    
    if (success) {
      setSent(true);
    } else {
      setError('Correo no encontrado. Verifica tu dirección de email.');
    }
    
    setLoading(false);
  };

  if (sent) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-8 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">¡Correo enviado!</h1>
          <p className="text-gray-400 mb-6">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>. 
            Revisa tu bandeja de entrada y sigue las instrucciones.
          </p>
          <Button 
            onClick={onBack} 
            variant="outline" 
            className="w-full border-gray-700 bg-transparent text-gray-300 hover:bg-gray-800 hover:text-white"
          >
            Volver al inicio de sesión
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-8">
        <div className="flex items-center mb-6">
          <button
            onClick={onBack}
            className="mr-3 p-2 hover:bg-gray-800 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Recuperar contraseña</h1>
            <p className="text-gray-400 mt-1">Te enviaremos un enlace de recuperación</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo electrónico"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="tu@email.com"
            required
          />

          {error && (
            <div className="bg-red-900/20 border border-red-900/50 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-900/20"
            loading={loading}
          >
            Enviar enlace de recuperación
          </Button>
        </form>
      </div>
    </div>
  );
};