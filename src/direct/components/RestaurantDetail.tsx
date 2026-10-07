import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Product } from '../types.ts';
import { ArrowLeft, Star, Clock, Bike, MapPin, Phone, Plus, Info } from 'lucide-react';

export const RestaurantDetail: React.FC = () => {
  const {
    selectedRestaurant,
    restaurantProducts,
    isLoadingProducts,
    setSelectedProduct,
    setActiveView,
  } = useApp();

  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  if (!selectedRestaurant) return null;

  const categories = Array.from(new Set(restaurantProducts.map((p) => p.category)));

  const filteredProducts = activeCategoryFilter
    ? restaurantProducts.filter((p) => p.category === activeCategoryFilter)
    : restaurantProducts;

  const deliveryFeeText =
    selectedRestaurant.delivery_fee === 0
      ? 'Envío Gratis'
      : `$${(selectedRestaurant.delivery_fee / 100).toFixed(2)} MXN`;

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8 animate-in fade-in duration-300">
      {/* Back button */}
      <button
        onClick={() => setActiveView('explore')}
        className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-zinc-100 transition px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 w-fit"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Volver a Restaurantes</span>
      </button>

      {/* Hero Banner Card */}
      <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-900 shadow-2xl">
        <div className="relative h-64 sm:h-80 w-full overflow-hidden">
          <img
            src={selectedRestaurant.banner_url}
            alt={selectedRestaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        </div>

        {/* Restaurant Header Info Overlay */}
        <div className="p-6 sm:p-8 -mt-20 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-start sm:items-center gap-5">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-zinc-700 shadow-2xl bg-zinc-900 shrink-0">
              <img
                src={selectedRestaurant.logo_url}
                alt={selectedRestaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {selectedRestaurant.name}
                </h1>
                <span className="flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-300" />
                  {selectedRestaurant.rating.toFixed(1)}
                </span>
              </div>

              <p className="text-sm text-zinc-300 max-w-2xl">{selectedRestaurant.description}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {selectedRestaurant.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-zinc-500" />
                  {selectedRestaurant.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-zinc-800 self-start md:self-auto">
            <div className="text-center px-3 border-r border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Envío</span>
              <p className="text-xs font-bold text-emerald-400 flex items-center gap-1 justify-center mt-0.5">
                <Bike className="w-3.5 h-3.5" />
                {deliveryFeeText}
              </p>
            </div>
            <div className="text-center px-3 border-r border-zinc-800">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Tiempo</span>
              <p className="text-xs font-bold text-zinc-200 flex items-center gap-1 justify-center mt-0.5">
                <Clock className="w-3.5 h-3.5 text-zinc-400" />
                {selectedRestaurant.delivery_time_min || 25}-{selectedRestaurant.delivery_time_max || 40}m
              </p>
            </div>
            <div className="text-center px-3">
              <span className="text-[10px] text-zinc-400 uppercase font-semibold">Min. Orden</span>
              <p className="text-xs font-bold text-zinc-200 mt-0.5">
                ${(selectedRestaurant.min_order / 100).toFixed(0)} MXN
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Categories Bar */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Menú y Especialidades</h2>
          <span className="text-xs text-zinc-400">{filteredProducts.length} platillos disponibles</span>
        </div>

        {categories.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                activeCategoryFilter === null
                  ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
              }`}
            >
              Todos los platillos
            </button>
            {categories.map((c) => (
              <button
                key={c}
                onClick={() => setActiveCategoryFilter(activeCategoryFilter === c ? null : c)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  activeCategoryFilter === c
                    ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                    : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Products Grid */}
      {isLoadingProducts ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-44 rounded-2xl bg-zinc-900/60 border border-zinc-800 animate-pulse" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-zinc-900/40 rounded-2xl border border-zinc-800">
          <Info className="w-8 h-8 text-zinc-500 mx-auto mb-2" />
          <p className="text-sm text-zinc-400">No hay productos en esta categoría.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="group bg-zinc-900/70 border border-zinc-800 rounded-2xl p-4 flex gap-4 hover:border-zinc-700 hover:shadow-xl hover:shadow-black/30 transition cursor-pointer relative overflow-hidden"
            >
              {/* Product Info */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400">
                    {product.category}
                  </span>
                  <h3 className="font-bold text-sm text-zinc-100 group-hover:text-orange-400 transition mt-0.5 line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 mt-2 border-t border-zinc-800/60">
                  <span className="font-extrabold text-sm text-white">
                    ${(product.price / 100).toFixed(2)} MXN
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedProduct(product);
                    }}
                    className="flex items-center gap-1 bg-zinc-800 hover:bg-orange-500 text-zinc-200 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold transition active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Agregar</span>
                  </button>
                </div>
              </div>

              {/* Product Thumbnail */}
              <div className="w-24 h-24 rounded-xl overflow-hidden bg-zinc-950 shrink-0 border border-zinc-800/80">
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
