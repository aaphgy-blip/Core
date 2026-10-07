import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { ShoppingBag, MapPin, User as UserIcon, Store, ClipboardList, LogIn } from 'lucide-react';

export const Header: React.FC = () => {
  const {
    user,
    isAuthenticated,
    activeView,
    setActiveView,
    cartCount,
    setIsCartOpen,
    setIsAuthOpen,
    selectedAddress,
    orders,
  } = useApp();

  const activeOrdersCount = orders.filter(
    (o) => o.status !== 'delivered' && o.status !== 'cancelled'
  ).length;

  return (
    <header className="sticky top-0 z-40 bg-zinc-950/85 backdrop-blur-md border-b border-zinc-800/80 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveView('explore')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 via-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
            <span className="text-white font-extrabold text-xl tracking-tight">D</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-100 tracking-tight">Directaurante</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                CORE V2
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 hidden sm:block">Plataforma Gastronómica Directa</p>
          </div>
        </div>

        {/* Address badge (Consumer) */}
        {activeView !== 'restaurant_portal' && (
          <button
            onClick={() => setActiveView('profile')}
            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 hover:border-zinc-700 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="truncate max-w-[200px]">
              {selectedAddress
                ? `${selectedAddress.label}: ${selectedAddress.street} #${selectedAddress.number}`
                : 'Pénjamo, GTO (Seleccionar)'}
            </span>
          </button>
        )}

        {/* Right Nav Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Restaurant Portal Toggle */}
          <button
            onClick={() => setActiveView(activeView === 'restaurant_portal' ? 'explore' : 'restaurant_portal')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
              activeView === 'restaurant_portal'
                ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
            title="Portal de Restaurante"
          >
            <Store className="w-4 h-4" />
            <span className="hidden sm:inline">Panel Restaurante</span>
          </button>

          {/* Customer Orders */}
          <button
            onClick={() => setActiveView('orders')}
            className={`relative p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeView === 'orders'
                ? 'bg-zinc-800 text-white border-zinc-700'
                : 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700'
            }`}
            title="Mis Pedidos"
          >
            <ClipboardList className="w-4 h-4 text-orange-400" />
            <span className="hidden sm:inline">Mis Pedidos</span>
            {activeOrdersCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-zinc-950">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white px-3.5 py-2 rounded-xl font-semibold text-xs shadow-md shadow-orange-600/20 transition active:scale-95"
            aria-label="Abrir carrito"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden sm:inline">Carrito</span>
            {cartCount > 0 && (
              <span className="w-5 h-5 flex items-center justify-center rounded-full bg-white text-orange-600 font-extrabold text-[11px]">
                {cartCount}
              </span>
            )}
          </button>

          {/* User Profile / Login */}
          {isAuthenticated ? (
            <button
              onClick={() => setActiveView('profile')}
              className={`p-2 rounded-xl border flex items-center justify-center transition ${
                activeView === 'profile'
                  ? 'bg-zinc-800 border-zinc-700 text-orange-400'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
              title={user?.name || 'Perfil'}
            >
              <UserIcon className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsAuthOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 hover:border-zinc-700 transition"
            >
              <LogIn className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
