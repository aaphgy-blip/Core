import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CategoryCarousel } from './CategoryCarousel.tsx';
import { RestaurantCard } from './RestaurantCard.tsx';
import { Search, Flame, Sparkles } from 'lucide-react';

export const ExploreView: React.FC = () => {
  const {
    restaurants,
    isLoadingRestaurants,
    openRestaurant,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Extract all unique category tags
  const allCategoryTags = Array.from(
    new Set(restaurants.flatMap((r) => r.category_tags))
  ).map((name, i) => ({ id: `cat_${i}`, name }));

  const filteredRestaurants = restaurants.filter((r) => {
    if (selectedCategory && !r.category_tags.includes(selectedCategory)) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6 space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-orange-950 via-zinc-900 to-amber-950 border border-zinc-800/80 p-6 sm:p-10 shadow-2xl">
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DIRECTAURANTE CORE V2</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
            Comida deliciosa, precios justos, directo del restaurante.
          </h1>

          <p className="text-sm text-zinc-300 leading-relaxed">
            Pide en línea con tarifas transparentes, opciones de entrega a domicilio o recolección en local, y cálculo soberano en tiempo real.
          </p>

          {/* Search bar inside hero */}
          <div className="pt-2">
            <div className="relative max-w-md">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar taquerías, hamburguesas, pizzas..."
                className="w-full bg-zinc-950/90 border border-zinc-700/80 rounded-2xl pl-10 pr-4 py-3 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-orange-500 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-96 h-96 bg-orange-500/10 blur-3xl pointer-events-none rounded-full" />
      </div>

      {/* Category filter pills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-zinc-300 text-xs font-bold">
          <Flame className="w-4 h-4 text-orange-500" />
          <span>Categorías Populares</span>
        </div>
        <CategoryCarousel
          categories={allCategoryTags}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Restaurants Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white tracking-tight">
            Restaurantes Disponibles
          </h2>
          <span className="text-xs text-zinc-400">
            {filteredRestaurants.length} establecimientos en Pénjamo
          </span>
        </div>

        {isLoadingRestaurants ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-zinc-900 border border-zinc-800 animate-pulse" />
            ))}
          </div>
        ) : filteredRestaurants.length === 0 ? (
          <div className="text-center py-16 bg-zinc-900/40 rounded-3xl border border-zinc-800">
            <p className="text-sm text-zinc-400">No se encontraron restaurantes con los filtros aplicados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRestaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant.id}
                restaurant={restaurant}
                onClick={() => openRestaurant(restaurant.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
