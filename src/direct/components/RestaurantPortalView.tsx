import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { directApi } from '../api/client.ts';
import { Order, OrderStatus } from '../types.ts';
import {
  Store,
  RotateCw,
  CheckCircle,
  XCircle,
  Clock,
  ChefHat,
  Bike,
  PackageCheck,
  AlertTriangle,
} from 'lucide-react';

export const RestaurantPortalView: React.FC = () => {
  const { user, addToast, setActiveView } = useApp();
  const [restaurantOrders, setRestaurantOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState('rest_tacos_guero');

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const list = await directApi.getRestaurantOrders(selectedRestaurantId);
      setRestaurantOrders(list);
    } catch (err: any) {
      addToast('error', err.message || 'Error cargando pedidos del restaurante');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedRestaurantId]);

  const handleAccept = async (orderId: string) => {
    try {
      await directApi.acceptOrder(orderId);
      addToast('success', `Pedido #${orderId.slice(-6)} aceptado`);
      await fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Error al aceptar pedido');
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Indica motivo del rechazo:') || 'Rechazado por cocina';
    try {
      await directApi.rejectOrder(orderId, reason);
      addToast('info', `Pedido #${orderId.slice(-6)} rechazado`);
      await fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Error al rechazar pedido');
    }
  };

  const handleAdvanceStatus = async (orderId: string, nextStatus: OrderStatus) => {
    try {
      await directApi.updateOrderStatus(orderId, nextStatus, `Avanzado a ${nextStatus} desde panel`);
      addToast('success', `Pedido #${orderId.slice(-6)} actualizado a: ${nextStatus}`);
      await fetchOrders();
    } catch (err: any) {
      addToast('error', err.message || 'Error al actualizar estado');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-orange-950/40 p-6 rounded-3xl border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30">
              <Store className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              KDS / Panel Operativo Restaurante
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Gestión soberana de pedidos entrantes, confirmación y avance de estados
          </p>
        </div>

        {/* Restaurant selector switch */}
        <div className="flex items-center gap-3">
          <select
            value={selectedRestaurantId}
            onChange={(e) => setSelectedRestaurantId(e.target.value)}
            className="bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-200 px-3.5 py-2 rounded-xl focus:outline-none focus:border-orange-500"
          >
            <option value="rest_tacos_guero">Taquería El Güero</option>
            <option value="rest_burger_lab">The Burger Lab</option>
            <option value="rest_pizza_napoli">Pizzeria Di Napoli</option>
          </select>

          <button
            onClick={fetchOrders}
            disabled={isLoading}
            className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 transition"
            title="Refrescar pedidos"
          >
            <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Board */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-zinc-200">
            Pedidos para {selectedRestaurantId === 'rest_tacos_guero' ? 'Taquería El Güero' : selectedRestaurantId} ({restaurantOrders.length})
          </h2>
          <span className="text-xs text-zinc-500">
            Actualización inmediata con el Core
          </span>
        </div>

        {restaurantOrders.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <Clock className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-zinc-300">No hay pedidos registrados para este restaurante</p>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Realiza un pedido desde la vista de cliente para verlo aparecer aquí instantáneamente.
            </p>
            <button
              onClick={() => setActiveView('explore')}
              className="mt-4 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-xs font-semibold"
            >
              Ir a vista de cliente
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {restaurantOrders.map((order) => (
              <div
                key={order.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4"
              >
                {/* Header card */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-extrabold text-white">
                        Pedido #{order.id.slice(-6).toUpperCase()}
                      </span>
                      <p className="text-xs text-zinc-400">
                        Cliente: <span className="text-zinc-200 font-bold">{order.customer_name}</span> ({order.customer_phone})
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                        order.status === 'pending'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                          : order.status === 'confirmed'
                          ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                          : order.status === 'preparing'
                          ? 'bg-orange-500/20 text-orange-300 border-orange-500/40'
                          : order.status === 'ready'
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                          : 'bg-zinc-800 text-zinc-300 border-zinc-700'
                      }`}
                    >
                      {order.status.toUpperCase()}
                    </span>
                  </div>

                  <p className="text-[11px] text-zinc-400 mt-1">
                    Tipo: <strong className="text-zinc-300">{order.order_type === 'delivery' ? 'Entrega a domicilio' : 'Recoger en local'}</strong>
                    {order.delivery_address && ` • ${order.delivery_address}`}
                  </p>

                  {/* Allergy Warning */}
                  {order.has_allergies && order.allergies && (
                    <div className="mt-2.5 p-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-1.5 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                      <span>Alerta de alergias: {order.allergies}</span>
                    </div>
                  )}

                  {/* Items */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 space-y-1.5 text-xs">
                    {order.items.map((it, i) => (
                      <div key={i} className="flex justify-between text-zinc-300">
                        <span>
                          <strong>{it.quantity}x</strong> {it.product_name}
                          {it.variants?.length > 0 && (
                            <span className="text-zinc-400"> ({it.variants.map((v) => v.option_name).join(', ')})</span>
                          )}
                          {it.toppings?.length > 0 && (
                            <span className="text-zinc-400"> +{it.toppings.map((t) => t.name).join(', ')}</span>
                          )}
                        </span>
                        <span className="text-zinc-400">${(it.subtotal / 100).toFixed(2)}</span>
                      </div>
                    ))}
                    {order.notes && (
                      <p className="text-[11px] text-zinc-400 italic mt-1">Nota: "{order.notes}"</p>
                    )}
                  </div>
                </div>

                {/* Footer and Operational Actions */}
                <div className="pt-3 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-400">Total a cobrar:</span>
                    <span className="text-sm font-extrabold text-orange-400">
                      ${(order.total / 100).toFixed(2)} MXN
                    </span>
                  </div>

                  {/* Actions according to state */}
                  {order.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleAccept(order.id)}
                        className="py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Aceptar Pedido</span>
                      </button>
                      <button
                        onClick={() => handleReject(order.id)}
                        className="py-2.5 px-3 rounded-xl bg-zinc-800 hover:bg-rose-950 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition border border-zinc-700 hover:border-rose-800"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Rechazar</span>
                      </button>
                    </div>
                  )}

                  {order.status === 'confirmed' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'preparing')}
                      className="w-full py-2.5 px-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <ChefHat className="w-4 h-4" />
                      <span>Iniciar Preparación en Cocina</span>
                    </button>
                  )}

                  {order.status === 'preparing' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'ready')}
                      className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <PackageCheck className="w-4 h-4" />
                      <span>Marcar como Listo para Entrega</span>
                    </button>
                  )}

                  {order.status === 'ready' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'delivering')}
                      className="w-full py-2.5 px-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <Bike className="w-4 h-4" />
                      <span>Despachar / En Camino</span>
                    </button>
                  )}

                  {order.status === 'delivering' && (
                    <button
                      onClick={() => handleAdvanceStatus(order.id, 'delivered')}
                      className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Confirmar Entrega Completada</span>
                    </button>
                  )}

                  {order.status === 'delivered' && (
                    <p className="text-center text-[11px] text-emerald-400 font-bold py-1">
                      ✓ Pedido finalizado
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
