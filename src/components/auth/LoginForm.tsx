import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../hooks/useAuth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSwitchToRegister,
  onSwitchToForgotPassword,
  onSuccess
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = await login(email, password);
    
    if (success) {
      onSuccess();
    } else {
      setError('Credenciales inválidas. Verifica tu correo y contraseña.');
    }
    
    setLoading(false);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-gray-900 rounded-xl shadow-2xl border border-gray-800 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Iniciar Sesión</h1>
          <p className="text-gray-400 mt-2">Accede a tu cuenta de CardTrader</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Usuario o correo electrónico"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin o tu@email.com"
            required
          />

          <div className="relative">
            <Input
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-8 text-gray-400 hover:text-gray-200 transition-colors"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>

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
            Iniciar Sesión
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <button
            onClick={onSwitchToForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </button>
          <div className="text-sm text-gray-400">
            ¿No tienes cuenta?{' '}
            <button
              onClick={onSwitchToRegister}
              className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Registrarse
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};