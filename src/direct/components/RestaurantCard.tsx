import React from 'react';
import { Restaurant } from '../types.ts';
import { Star, Clock, Bike, MapPin } from 'lucide-react';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onClick: () => void;
}

export const RestaurantCard: React.FC<RestaurantCardProps> = ({ restaurant, onClick }) => {
  const deliveryFeeFormatted =
    restaurant.delivery_fee === 0
      ? 'Envío Gratis'
      : `$${(restaurant.delivery_fee / 100).toFixed(2)} MXN`;

  const timeEst =
    restaurant.delivery_time_min && restaurant.delivery_time_max
      ? `${restaurant.delivery_time_min}-${restaurant.delivery_time_max} min`
      : '30-45 min';

  return (
    <div
      onClick={onClick}
      className="group relative bg-zinc-900/70 border border-zinc-800 rounded-2xl overflow-hidden hover:border-zinc-700 hover:shadow-xl hover:shadow-black/40 transition-all duration-200 cursor-pointer flex flex-col"
    >
      {/* Banner */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-950">
        <img
          src={restaurant.banner_url}
          alt={restaurant.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-black/20" />

        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-zinc-950/85 backdrop-blur-md px-2.5 py-1 rounded-full text-xs font-bold text-amber-400 border border-zinc-800">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{restaurant.rating.toFixed(1)}</span>
        </div>

        {/* Logo */}
        <div className="absolute -bottom-3 left-4 w-14 h-14 rounded-2xl overflow-hidden border-2 border-zinc-900 shadow-md bg-zinc-800">
          <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 pt-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-bold text-base text-zinc-100 group-hover:text-orange-400 transition tracking-tight">
              {restaurant.name}
            </h3>
            {restaurant.distance_km && (
              <span className="text-[11px] text-zinc-400 flex items-center gap-0.5 shrink-0">
                <MapPin className="w-3 h-3 text-zinc-500" />
                {restaurant.distance_km.toFixed(1)} km
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
            {restaurant.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {restaurant.category_tags.map((tag) => (
              <span
                key={tag}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer logistics */}
        <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-800/60 text-xs text-zinc-400 font-medium">
          <div className="flex items-center gap-1 text-zinc-300">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>{timeEst}</span>
          </div>

          <div className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Bike className="w-3.5 h-3.5" />
            <span>{deliveryFeeFormatted}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
