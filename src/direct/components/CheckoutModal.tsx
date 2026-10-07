import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { directApi } from '../api/client.ts';
import {
  X,
  Bike,
  Store,
  MapPin,
  CreditCard,
  Banknote,
  Send,
  AlertTriangle,
  Lock,
  CheckCircle2,
} from 'lucide-react';
import { OrderType, PaymentMethod } from '../types.ts';

export const CheckoutModal: React.FC = () => {
  const {
    isCheckoutOpen,
    setIsCheckoutOpen,
    cart,
    cartRestaurant,
    cartSubtotalCents,
    user,
    addresses,
    selectedAddress,
    clearCart,
    loadOrders,
    setActiveView,
    addToast,
    fees,
    setIsAuthOpen,
  } = useApp();

  const [orderType, setOrderType] = useState<OrderType>('delivery');
  const [selectedAddressId, setSelectedAddressId] = useState<string>(selectedAddress?.id || '');
  const [manualAddress, setManualAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>(user?.phone || '4621234567');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [hasAllergies, setHasAllergies] = useState<boolean>(false);
  const [allergiesText, setAllergiesText] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [tipCents, setTipCents] = useState<number>(1500); // $15.00 MXN default tip
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!isCheckoutOpen || !cartRestaurant) return null;

  // Breakdown preview (Core will calculate sovereign truth)
  const deliveryFeePreview = orderType === 'pickup' ? 0 : cartRestaurant.delivery_fee;
  const serviceFeePreview = fees?.service_fee || 500;
  const totalPreview = cartSubtotalCents + deliveryFeePreview + serviceFeePreview + tipCents;

  const handlePlaceOrder = async () => {
    if (!user) {
      addToast('info', 'Por favor inicia sesión para completar tu pedido');
      setIsAuthOpen(true);
      return;
    }

    if (orderType === 'delivery' && !selectedAddressId && !manualAddress) {
      addToast('error', 'Por favor selecciona o ingresa una dirección de entrega');
      return;
    }

    setIsSubmitting(true);

    // Format items matching Core V2 contract
    const itemsPayload = cart.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
      variants: item.selectedVariants.map((v) => ({
        group_id: v.group_id,
        option_id: v.option_id,
      })),
      toppings: item.selectedToppings.map((t) => t.id),
      notes: item.notes,
    }));

    // Generate idempotency key for network safety & duplicate protection
    const idempotencyKey = `idemp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const orderPayload = {
      restaurant_id: cartRestaurant.id,
      order_type: orderType,
      address_id: orderType === 'delivery' ? selectedAddressId || undefined : null,
      delivery_address: orderType === 'delivery' ? manualAddress || undefined : null,
      customer_phone: phone,
      items: itemsPayload,
      payment_method: paymentMethod,
      tip_amount: tipCents,
      has_allergies: hasAllergies,
      allergies: hasAllergies ? allergiesText : undefined,
      notes: notes.trim() || undefined,
      idempotency_key: idempotencyKey,
    };

    try {
      const result = await directApi.createOrder(orderPayload, idempotencyKey);

      clearCart();
      setIsCheckoutOpen(false);
      await loadOrders();
      setActiveView('orders');

      addToast(
        'success',
        result.isDuplicate
          ? 'Pedido recuperado exitosamente (idempotente)'
          : `¡Pedido #${result.order.id.slice(-6).toUpperCase()} creado y enviado al restaurante!`
      );
    } catch (err: any) {
      addToast('error', err.message || 'Error al procesar el pedido con el Core');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-extrabold text-base text-white">Confirmar Pedido</h2>
            <p className="text-xs text-zinc-400">Restaurante: {cartRestaurant.name}</p>
          </div>
          <button
            onClick={() => setIsCheckoutOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. Order Type (Delivery vs Pickup) */}
          <div className="space-y-2">
            <label className="font-bold text-zinc-200 block">Tipo de Pedido</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('delivery')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition font-semibold ${
                  orderType === 'delivery'
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Bike className="w-5 h-5 text-orange-400" />
                <div className="text-left">
                  <p className="font-bold">A Domicilio</p>
                  <p className="text-[10px] text-zinc-400">
                    Envío: ${(cartRestaurant.delivery_fee / 100).toFixed(2)} MXN
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOrderType('pickup')}
                className={`p-3.5 rounded-2xl border flex items-center gap-3 transition font-semibold ${
                  orderType === 'pickup'
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Store className="w-5 h-5 text-emerald-400" />
                <div className="text-left">
                  <p className="font-bold">Para Recoger</p>
                  <p className="text-[10px] text-emerald-400 font-semibold">Sin costo de envío</p>
                </div>
              </button>
            </div>
          </div>

          {/* 2. Address Selection (if Delivery) */}
          {orderType === 'delivery' && (
            <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
              <label className="font-bold text-zinc-200 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-orange-500" />
                <span>Dirección de Entrega</span>
              </label>

              {addresses.length > 0 ? (
                <div className="space-y-2">
                  {addresses.map((addr) => (
                    <label
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                        selectedAddressId === addr.id
                          ? 'bg-zinc-800/70 border-orange-500 text-white'
                          : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <input
                          type="radio"
                          name="address"
                          checked={selectedAddressId === addr.id}
                          onChange={() => setSelectedAddressId(addr.id)}
                          className="text-orange-500"
                        />
                        <div>
                          <p className="font-bold">{addr.label}</p>
                          <p className="text-[11px] text-zinc-400">
                            {addr.street} #{addr.number}, {addr.colony}, {addr.city}
                          </p>
                        </div>
                      </div>
                      {addr.is_default && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400">
                          Predeterminada
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              ) : (
                <input
                  type="text"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  placeholder="Calle, número exterior, colonia y referencias..."
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
                />
              )}
            </div>
          )}

          {/* 3. Customer Phone & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80">
            <div className="space-y-1.5">
              <label className="font-bold text-zinc-200">Teléfono de contacto</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="4621234567"
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-zinc-200">Notas de entrega</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Tocar el timbre dos veces..."
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-zinc-200 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* 4. Allergies declaration (Core Sovereign Requirement) */}
          <div className="space-y-2.5 pt-2 border-t border-zinc-800/80 p-3 rounded-2xl bg-zinc-950/60 border border-zinc-800">
            <div className="flex items-center justify-between">
              <label className="font-bold text-zinc-200 flex items-center gap-1.5 cursor-pointer">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>¿Tienes alguna alergia alimentaria?</span>
              </label>
              <input
                type="checkbox"
                checked={hasAllergies}
                onChange={(e) => setHasAllergies(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500 cursor-pointer"
              />
            </div>

            {hasAllergies && (
              <input
                type="text"
                value={allergiesText}
                onChange={(e) => setAllergiesText(e.target.value)}
                placeholder="Indica qué alérgenos: Cacahuate, mariscos, gluten, lácteos..."
                className="w-full bg-zinc-900 border border-amber-500/50 rounded-xl px-3 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none"
              />
            )}
          </div>

          {/* 5. Payment Method */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="font-bold text-zinc-200">Método de Pago</label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-semibold text-center ${
                  paymentMethod === 'cash'
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Banknote className="w-4 h-4 text-emerald-400" />
                <span>Efectivo</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('transfer')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-semibold text-center ${
                  paymentMethod === 'transfer'
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition font-semibold text-center ${
                  paymentMethod === 'card'
                    ? 'bg-orange-500/15 border-orange-500 text-white'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                }`}
              >
                <CreditCard className="w-4 h-4 text-purple-400" />
                <span>Tarjeta</span>
              </button>
            </div>
          </div>

          {/* 6. Tip selector */}
          <div className="space-y-2 pt-2 border-t border-zinc-800/80">
            <label className="font-bold text-zinc-200">Propina voluntaria para el repartidor</label>
            <div className="grid grid-cols-4 gap-2">
              {[0, 1500, 2500, 5000].map((amount) => (
                <button
                  key={amount}
                  type="button"
                  onClick={() => setTipCents(amount)}
                  className={`py-2 rounded-xl border font-bold text-xs transition ${
                    tipCents === amount
                      ? 'bg-orange-500 text-white border-orange-400'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {amount === 0 ? 'Sin propina' : `$${(amount / 100).toFixed(0)} MXN`}
                </button>
              ))}
            </div>
          </div>

          {/* 7. Sovereign Financial Breakdown */}
          <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
            <div className="flex justify-between text-zinc-400">
              <span>Subtotal de productos ({cart.length}):</span>
              <span className="text-zinc-200 font-semibold">${(cartSubtotalCents / 100).toFixed(2)} MXN</span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Costo de envío ({orderType === 'pickup' ? 'Recoger' : 'Domicilio'}):</span>
              <span className={orderType === 'pickup' ? 'text-emerald-400 font-bold' : 'text-zinc-200'}>
                {orderType === 'pickup' ? 'GRATIS' : `$${(deliveryFeePreview / 100).toFixed(2)} MXN`}
              </span>
            </div>

            <div className="flex justify-between text-zinc-400">
              <span>Tarifa de servicio Directaurante:</span>
              <span className="text-zinc-200 font-semibold">${(serviceFeePreview / 100).toFixed(2)} MXN</span>
            </div>

            {tipCents > 0 && (
              <div className="flex justify-between text-zinc-400">
                <span>Propina:</span>
                <span className="text-zinc-200 font-semibold">${(tipCents / 100).toFixed(2)} MXN</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800 flex justify-between text-sm font-extrabold text-white">
              <span>Total a pagar:</span>
              <span className="text-base text-orange-400">${(totalPreview / 100).toFixed(2)} MXN</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="p-4 sm:p-5 bg-zinc-950 border-t border-zinc-800 flex items-center justify-between gap-4 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-zinc-500">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Validación soberana por Directaurante Core V2</span>
          </div>

          <button
            onClick={handlePlaceOrder}
            disabled={isSubmitting}
            className="flex-1 sm:flex-initial w-full sm:w-auto bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 disabled:opacity-50 text-white font-bold py-3.5 px-8 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30 active:scale-[0.98] transition"
          >
            {isSubmitting ? (
              <span>Validando y procesando...</span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Realizar Pedido (${(totalPreview / 100).toFixed(2)} MXN)</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
