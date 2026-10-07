import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cart,
    cartRestaurant,
    updateQuantity,
    removeFromCart,
    clearCart,
    cartSubtotalCents,
    setIsCheckoutOpen,
  } = useApp();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-zinc-950 border-l border-zinc-800 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-orange-500" />
            <h2 className="font-bold text-base text-white">Tu Carrito</h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Restaurant banner inside cart */}
        {cartRestaurant && cart.length > 0 && (
          <div className="px-5 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between text-xs">
            <div className="truncate">
              <span className="text-zinc-400">Restaurante: </span>
              <span className="font-semibold text-zinc-200">{cartRestaurant.name}</span>
            </div>
            <button
              onClick={clearCart}
              className="text-[11px] text-rose-400 hover:text-rose-300 transition shrink-0 ml-2"
            >
              Vaciar
            </button>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-600">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-bold text-sm text-zinc-300">Tu carrito está vacío</h3>
              <p className="text-xs text-zinc-500 max-w-xs">
                Explora el menú y agrega tus platillos favoritos con tus ingredientes preferidos.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.id}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-2xl p-3.5 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-bold text-sm text-white">{item.product.name}</h4>
                    <span className="text-xs font-semibold text-orange-400">
                      ${(item.unitPrice / 100).toFixed(2)} MXN c/u
                    </span>

                    {/* Selected variants and toppings */}
                    {item.selectedVariants.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {item.selectedVariants.map((v) => (
                          <p key={v.group_id} className="text-[11px] text-zinc-400">
                            • {v.group_name}: <span className="text-zinc-300">{v.option_name}</span>
                          </p>
                        ))}
                      </div>
                    )}

                    {item.selectedToppings.length > 0 && (
                      <div className="mt-0.5">
                        <p className="text-[11px] text-zinc-400">
                          • Extras:{' '}
                          <span className="text-zinc-300">
                            {item.selectedToppings.map((t) => t.name).join(', ')}
                          </span>
                        </p>
                      </div>
                    )}

                    {item.notes && (
                      <p className="text-[11px] text-amber-400/90 italic mt-1">"{item.notes}"</p>
                    )}
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Quantity and line item total */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 px-2.5 py-1 rounded-xl">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-bold text-white w-4 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="text-zinc-400 hover:text-white p-0.5"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <span className="font-extrabold text-xs text-white">
                    ${((item.unitPrice * item.quantity) / 100).toFixed(2)} MXN
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {cart.length > 0 && (
          <div className="p-4 sm:p-5 bg-zinc-900/90 border-t border-zinc-800 space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Subtotal del pedido:</span>
              <span className="font-extrabold text-white text-base">
                ${(cartSubtotalCents / 100).toFixed(2)} MXN
              </span>
            </div>

            <p className="text-[11px] text-zinc-500">
              * El costo de entrega y servicio será validado y calculado directamente por el Core en el siguiente paso.
            </p>

            <button
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 active:scale-[0.98] transition"
            >
              <span>Confirmar Pedido</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
