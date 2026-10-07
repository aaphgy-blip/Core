import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Lock, Mail, User as UserIcon, Phone, CheckCircle2, Store } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const { isAuthOpen, setIsAuthOpen, login, register } = useApp();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('4621234567');
  const [role, setRole] = useState<'customer' | 'restaurant'>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({
          name,
          email,
          password,
          phone,
          role,
        });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error de autenticación');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (targetEmail: string, targetPass: string) => {
    setMode('login');
    setEmail(targetEmail);
    setPassword(targetPass);
    setErrorMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => setIsAuthOpen(false)}
          className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg shadow-orange-500/20 mb-3">
            D
          </div>
          <h2 className="text-xl font-extrabold text-white">
            {mode === 'login' ? 'Iniciar Sesión en Core V2' : 'Crear Cuenta en Directaurante'}
          </h2>
          <p className="text-xs text-zinc-400">
            {mode === 'login'
              ? 'Accede a tus pedidos y direcciones guardadas'
              : 'Regístrate para pedir directamente sin comisiones infladas'}
          </p>
        </div>

        {/* Mode Switch Tabs */}
        <div className="grid grid-cols-2 p-1 bg-zinc-950 border border-zinc-800 rounded-2xl mb-5 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition ${
              mode === 'login' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMsg('');
            }}
            className={`py-2 rounded-xl transition ${
              mode === 'register' ? 'bg-orange-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            Registrarse
          </button>
        </div>

        {/* Error notification */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-300 text-xs font-medium">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Nombre Completo</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Carlos Pérez"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Teléfono</label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="4621234567"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-zinc-300 block mb-1 font-semibold">Tipo de Cuenta</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      role === 'customer'
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Cliente / Comensal
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('restaurant')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold ${
                      role === 'restaurant'
                        ? 'bg-orange-500/20 border-orange-500 text-white'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                    }`}
                  >
                    Restaurante / Dueño
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="text-zinc-300 block mb-1 font-semibold">Correo Electrónico</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ejemplo@email.com"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-300 block mb-1 font-semibold">Contraseña</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-lg shadow-orange-600/20 transition active:scale-[0.98] mt-2"
          >
            {isSubmitting
              ? 'Procesando...'
              : mode === 'login'
              ? 'Iniciar Sesión'
              : 'Registrar Cuenta'}
          </button>
        </form>

        {/* Quick Test Demo Accounts */}
        <div className="mt-6 pt-5 border-t border-zinc-800 text-center space-y-2">
          <p className="text-[11px] text-zinc-500 uppercase tracking-wider font-semibold">
            Cuentas Demo para Pruebas
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => handleQuickFill('carlos@directaurante.com', 'cliente123')}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition"
            >
              👤 Carlos (Cliente)
            </button>
            <button
              onClick={() => handleQuickFill('donpepe@tacoselguero.com', 'tacos123')}
              className="text-[11px] px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-300 hover:border-zinc-700 transition"
            >
              🌮 Don Pepe (Restaurante)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
