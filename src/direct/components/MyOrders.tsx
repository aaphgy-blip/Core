import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { OrderStatus } from '../types.ts';
import {
  ClipboardList,
  Clock,
  CheckCircle,
  Truck,
  RotateCw,
  ShoppingBag,
  Store,
  Bike,
  XCircle,
} from 'lucide-react';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; step: number; color: string; badge: string; icon: any }
> = {
  pending: {
    label: 'Recibido por el restaurante',
    step: 1,
    color: 'text-amber-400',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    icon: Clock,
  },
  confirmed: {
    label: 'Confirmado por cocina',
    step: 2,
    color: 'text-sky-400',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    icon: CheckCircle,
  },
  preparing: {
    label: 'Preparando tus platillos',
    step: 3,
    color: 'text-orange-400',
    badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
    icon: Store,
  },
  ready: {
    label: 'Listo en mostrador',
    step: 4,
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle,
  },
  assigned: {
    label: 'Repartidor asignado',
    step: 5,
    color: 'text-indigo-400',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    icon: Bike,
  },
  picked_up: {
    label: 'Pedido recolectado',
    step: 6,
    color: 'text-blue-400',
    badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    icon: Bike,
  },
  delivering: {
    label: 'En camino a tu ubicación',
    step: 7,
    color: 'text-violet-400',
    badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
    icon: Truck,
  },
  delivered: {
    label: 'Entregado exitosamente',
    step: 8,
    color: 'text-emerald-400',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    icon: CheckCircle,
  },
  cancelled: {
    label: 'Pedido Cancelado',
    step: 0,
    color: 'text-rose-400',
    badge: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    icon: XCircle,
  },
};

export const MyOrders: React.FC = () => {
  const { orders, isLoadingOrders, loadOrders, setActiveView } = useApp();

  return (
    <div className="max-w-4xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-orange-500" />
            <span>Historial y Estado de Pedidos</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Supervisión en tiempo real gestionada por el Core V2
          </p>
        </div>

        <button
          onClick={loadOrders}
          disabled={isLoadingOrders}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white hover:border-zinc-700 transition"
        >
          <RotateCw className={`w-3.5 h-3.5 ${isLoadingOrders ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600 mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-200">Aún no tienes pedidos registrados</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto mt-1">
              Explora los restaurantes de Directaurante y realiza tu primer pedido con validación soberana del Core.
            </p>
          </div>
          <button
            onClick={() => setActiveView('explore')}
            className="bg-orange-500 hover:bg-orange-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition"
          >
            Explorar Restaurantes
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusInfo = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
            const StatusIcon = statusInfo.icon;
            const formattedDate = new Date(order.createdAt).toLocaleDateString('es-MX', {
              day: '2-digit',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });

            return (
              <div
                key={order.id}
                className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-5"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-base text-white">
                        {order.restaurant_name}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusInfo.badge}`}
                      >
                        {order.status.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      Pedido #{order.id.slice(-6).toUpperCase()} • {formattedDate}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-lg font-extrabold text-orange-400">
                      ${(order.total / 100).toFixed(2)} MXN
                    </span>
                    <p className="text-[11px] text-zinc-400 capitalize">
                      {order.order_type === 'delivery' ? 'Entrega a domicilio' : 'Recoger en mostrador'} • Pago: {order.payment_method}
                    </p>
                  </div>
                </div>

                {/* State Progress Banner */}
                <div className="bg-zinc-950 p-4 rounded-2xl border border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 ${statusInfo.color}`}>
                      <StatusIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
                        Estado Actual
                      </p>
                      <p className={`text-sm font-extrabold ${statusInfo.color}`}>
                        {statusInfo.label}
                      </p>
                    </div>
                  </div>

                  {order.status_history && order.status_history.length > 0 && (
                    <span className="text-[10px] text-zinc-500 font-mono hidden sm:inline">
                      {new Date(order.status_history[order.status_history.length - 1].timestamp).toLocaleTimeString()}
                    </span>
                  )}
                </div>

                {/* Items Summary */}
                <div className="space-y-2 pt-2 border-t border-zinc-800/80 text-xs">
                  <p className="font-bold text-zinc-300">Detalle de productos:</p>
                  <div className="space-y-1.5 pl-2">
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-zinc-400">
                        <span>
                          {it.quantity}x {it.product_name}
                          {it.variants && it.variants.length > 0 && (
                            <span className="text-zinc-500"> ({it.variants.map((v) => v.option_name).join(', ')})</span>
                          )}
                        </span>
                        <span className="text-zinc-300 font-medium">
                          ${(it.subtotal / 100).toFixed(2)} MXN
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Financial Breakdown */}
                  <div className="pt-3 border-t border-zinc-800/60 flex flex-wrap items-center justify-between gap-4 text-[11px] text-zinc-400">
                    <div>
                      <span>Subtotal: ${(order.subtotal / 100).toFixed(2)}</span>
                      {order.delivery_fee > 0 && <span> • Envío: ${(order.delivery_fee / 100).toFixed(2)}</span>}
                      <span> • Servicio: ${(order.service_fee / 100).toFixed(2)}</span>
                      {order.tip_amount > 0 && <span> • Propina: ${(order.tip_amount / 100).toFixed(2)}</span>}
                    </div>

                    {order.has_allergies && order.allergies && (
                      <div className="text-amber-400/90 font-medium">
                        ⚠️ Alergias notificadas: {order.allergies}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
