import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export const AddressesManager: React.FC = () => {
  const { addresses, selectedAddress, setSelectedAddress, createAddress, deleteAddress } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [label, setLabel] = useState('Casa');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [colony, setColony] = useState('Centro');
  const [city, setCity] = useState('Pénjamo');
  const [references, setReferences] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!street || !number) return;

    await createAddress({
      label,
      street,
      number,
      colony,
      city,
      state: 'Guanajuato',
      postal_code: '36900',
      references,
      is_default: addresses.length === 0,
    });

    setStreet('');
    setNumber('');
    setReferences('');
    setIsAdding(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-sm text-zinc-200 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-orange-500" />
          <span>Direcciones Guardadas</span>
        </h3>

        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1 text-xs font-semibold text-orange-400 hover:text-orange-300"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Dirección</span>
          </button>
        )}
      </div>

      {isAdding && (
        <form
          onSubmit={handleSubmit}
          className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3 text-xs"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-zinc-400 block mb-1">Etiqueta</label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Ej: Casa, Trabajo"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                required
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Ciudad</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="text-zinc-400 block mb-1">Calle</label>
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                placeholder="Av. Morelos"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                required
              />
            </div>
            <div>
              <label className="text-zinc-400 block mb-1">Número</label>
              <input
                type="text"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
                placeholder="64"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Colonia</label>
            <input
              type="text"
              value={colony}
              onChange={(e) => setColony(e.target.value)}
              placeholder="Centro"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
            />
          </div>

          <div>
            <label className="text-zinc-400 block mb-1">Referencias de entrega</label>
            <input
              type="text"
              value={references}
              onChange={(e) => setReferences(e.target.value)}
              placeholder="Portón café, entre Hidalgo y Zaragoza"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-zinc-200"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-xl border border-zinc-800 text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-400 text-white font-bold"
            >
              Guardar en Core
            </button>
          </div>
        </form>
      )}

      {/* Address cards */}
      <div className="space-y-2.5">
        {addresses.map((addr) => {
          const isSelected = selectedAddress?.id === addr.id;
          return (
            <div
              key={addr.id}
              onClick={() => setSelectedAddress(addr)}
              className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                isSelected
                  ? 'bg-zinc-800/80 border-orange-500 text-white'
                  : 'bg-zinc-900/50 border-zinc-800 text-zinc-300 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-xl ${
                    isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-500'
                  }`}
                >
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs">{addr.label}</span>
                    {addr.is_default && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-emerald-400 font-semibold">
                        Predeterminada
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {addr.street} #{addr.number}, {addr.colony}, {addr.city}
                  </p>
                  {addr.references && (
                    <p className="text-[10px] text-zinc-500 italic mt-0.5">{addr.references}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isSelected && <CheckCircle2 className="w-4 h-4 text-orange-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteAddress(addr.id);
                  }}
                  className="text-zinc-500 hover:text-rose-400 p-1.5 rounded-lg transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
