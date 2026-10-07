import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { directApi } from '../api/client.ts';
import { AddressesManager } from './AddressesManager.tsx';
import { User as UserIcon, Mail, Phone, Shield, LogOut, Check } from 'lucide-react';

export const UserProfile: React.FC = () => {
  const { user, refreshProfile, logout, addToast } = useApp();

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) return null;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await directApi.updateProfile({ name, phone });
      await refreshProfile();
      addToast('success', 'Perfil actualizado en el Core');
    } catch (err: any) {
      addToast('error', err.message || 'Error al actualizar perfil');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 lg:px-8 py-8 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-wrap items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-orange-500/20">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">{user.name}</h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-zinc-800 text-orange-400 border border-zinc-700">
                {user.role}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-zinc-500" />
              {user.email}
            </p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 hover:border-rose-800 text-rose-400 hover:bg-rose-950/30 text-xs font-bold transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar Sesión</span>
        </button>
      </div>

      {/* Edit Profile Form */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <UserIcon className="w-4 h-4 text-orange-500" />
          <span>Información de la Cuenta</span>
        </h2>

        <form onSubmit={handleUpdate} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 block mb-1.5 font-semibold">Nombre Completo</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-semibold">Teléfono Móvil</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isUpdating}
              className="bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-white font-bold py-2.5 px-5 rounded-xl transition flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Guardar Cambios</span>
            </button>
          </div>
        </form>
      </div>

      {/* Addresses Manager */}
      <div className="bg-zinc-900/70 border border-zinc-800 rounded-3xl p-6 sm:p-8">
        <AddressesManager />
      </div>
    </div>
  );
};
