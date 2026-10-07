import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CartItemTopping, CartItemVariant, Product } from '../types.ts';
import { X, Plus, Minus, Check } from 'lucide-react';

interface ProductCustomizeModalProps {
  product: Product;
  onClose: () => void;
}

export const ProductCustomizeModal: React.FC<ProductCustomizeModalProps> = ({ product, onClose }) => {
  const { addToCart } = useApp();

  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  // Default select first option for required variant groups
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    for (const g of product.variants) {
      if (g.required && g.options.length > 0) {
        initial[g.id] = g.options[0].id;
      }
    }
    return initial;
  });

  const [selectedToppingIds, setSelectedToppingIds] = useState<string[]>([]);

  // Calculate live price per unit in cents
  let extraVariantsPerUnit = 0;
  for (const [groupId, optionId] of Object.entries(selectedVariants)) {
    const group = product.variants.find((g) => g.id === groupId);
    const option = group?.options.find((o) => o.id === optionId);
    if (option) {
      extraVariantsPerUnit += option.price_delta;
    }
  }

  let extraToppingsPerUnit = 0;
  for (const topId of selectedToppingIds) {
    const topping = product.toppings.find((t) => t.id === topId);
    if (topping) {
      extraToppingsPerUnit += topping.price;
    }
  }

  const unitPriceCents = product.price + extraVariantsPerUnit + extraToppingsPerUnit;
  const totalCents = unitPriceCents * quantity;

  const handleSelectOption = (groupId: string, optionId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [groupId]: optionId,
    }));
  };

  const handleToggleTopping = (toppingId: string) => {
    setSelectedToppingIds((prev) =>
      prev.includes(toppingId) ? prev.filter((id) => id !== toppingId) : [...prev, toppingId]
    );
  };

  const handleAdd = () => {
    // Validate required variant groups
    for (const group of product.variants) {
      if (group.required && !selectedVariants[group.id]) {
        alert(`Por favor selecciona una opción para '${group.name}'`);
        return;
      }
    }

    const variantsList: CartItemVariant[] = [];
    for (const [groupId, optionId] of Object.entries(selectedVariants)) {
      const group = product.variants.find((g) => g.id === groupId);
      const option = group?.options.find((o) => o.id === optionId);
      if (group && option) {
        variantsList.push({
          group_id: group.id,
          group_name: group.name,
          option_id: option.id,
          option_name: option.name,
          price_delta: option.price_delta,
        });
      }
    }

    const toppingsList: CartItemTopping[] = [];
    for (const topId of selectedToppingIds) {
      const topping = product.toppings.find((t) => t.id === topId);
      if (topping) {
        toppingsList.push({
          id: topping.id,
          name: topping.name,
          price: topping.price,
        });
      }
    }

    addToCart({
      product,
      quantity,
      selectedVariants: variantsList,
      selectedToppings: toppingsList,
      notes: notes.trim() || undefined,
      unitPrice: unitPriceCents,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Image */}
        <div className="relative h-48 w-full bg-zinc-950 shrink-0">
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-black/30" />
          <button
            onClick={onClose}
            className="absolute top-3 right-3 bg-zinc-950/70 text-zinc-300 hover:text-white p-2 rounded-full backdrop-blur-md transition"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div>
            <h2 className="text-xl font-extrabold text-white">{product.name}</h2>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{product.description}</p>
            <div className="mt-2 text-base font-extrabold text-orange-400">
              Base: ${(product.price / 100).toFixed(2)} MXN
            </div>
          </div>

          {/* Variants selection */}
          {product.variants.map((group) => (
            <div key={group.id} className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">{group.name}</span>
                {group.required ? (
                  <span className="text-[10px] font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">
                    Obligatorio
                  </span>
                ) : (
                  <span className="text-[10px] text-zinc-400">Opcional</span>
                )}
              </div>

              <div className="space-y-2">
                {group.options.map((opt) => {
                  const isChecked = selectedVariants[group.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      onClick={() => handleSelectOption(group.id, opt.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? 'bg-orange-500/10 border-orange-500/50 text-white'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center transition ${
                            isChecked ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-600'
                          }`}
                        >
                          {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                        </div>
                        <span>{opt.name}</span>
                      </div>
                      <span className="text-zinc-400">
                        {opt.price_delta > 0 ? `+$${(opt.price_delta / 100).toFixed(2)}` : 'Incluido'}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Toppings (Extras) */}
          {product.toppings.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-zinc-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200">Ingredientes Extras / Complementos</span>
                <span className="text-[10px] text-zinc-400">Opcional</span>
              </div>

              <div className="space-y-2">
                {product.toppings.map((top) => {
                  const isChecked = selectedToppingIds.includes(top.id);
                  return (
                    <label
                      key={top.id}
                      onClick={() => handleToggleTopping(top.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition ${
                        isChecked
                          ? 'bg-orange-500/10 border-orange-500/50 text-white'
                          : 'bg-zinc-800/40 border-zinc-800 text-zinc-300 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-4 h-4 rounded-md border flex items-center justify-center transition ${
                            isChecked ? 'border-orange-500 bg-orange-500 text-white' : 'border-zinc-600'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span>{top.name}</span>
                      </div>
                      <span className="text-zinc-400">+${(top.price / 100).toFixed(2)} MXN</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <label className="text-xs font-bold text-zinc-200 block">Instrucciones especiales</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ej: Sin cebolla, salsa aparte, bien dorado..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
          </div>
        </div>

        {/* Footer with quantity and Add button */}
        <div className="p-4 sm:p-5 bg-zinc-950/80 border-t border-zinc-800/80 flex items-center justify-between gap-4 shrink-0">
          {/* Quantity modifiers */}
          <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-xl">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className="text-zinc-400 hover:text-white disabled:opacity-30 transition p-1"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xs font-extrabold text-white w-5 text-center">{quantity}</span>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className="text-zinc-400 hover:text-white transition p-1"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={handleAdd}
            className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-between shadow-lg shadow-orange-600/20 active:scale-[0.98] transition"
          >
            <span>Agregar al pedido</span>
            <span>${(totalCents / 100).toFixed(2)} MXN</span>
          </button>
        </div>
      </div>
    </div>
  );
};
