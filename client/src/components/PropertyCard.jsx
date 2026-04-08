import { Link } from 'react-router-dom';

const TYPE_EMOJI = {
  Apartment:      '🏢',
  House:          '🏡',
  Villa:          '🏖️',
  Plot:           '🌳',
  Commercial:     '🏪',
  'PG/Co-living': '🛌',
};

const PropertyCard = ({ property }) => {
  const img      = property.images?.[0]?.url;
  const price    = Number(property.price).toLocaleString('en-IN');
  const city     = property.location?.city  || '';
  const state    = property.location?.state || '';
  const location = [city, state].filter(Boolean).join(', ') || '—';
  const isSale   = property.listingType === 'sale';
  const emoji    = TYPE_EMOJI[property.type] ?? '🏗️';

  return (
    <Link
      to={`/properties/${property._id}`}
      className="group flex flex-col rounded-2xl border border-gray-100 shadow-card overflow-hidden
                 bg-gradient-to-br from-white to-gray-50/80
                 hover:-translate-y-1.5 hover:shadow-glow hover:border-blue-100
                 transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-52 bg-gradient-to-br from-primary-50 to-blue-100 overflow-hidden shrink-0">
        {img ? (
          <img
            src={img}
            alt={property.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-30 select-none">
            <span className="text-5xl">{emoji}</span>
            <span className="text-xs text-primary-500 font-medium">{property.type}</span>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shadow-sm
            ${isSale ? 'bg-blue-600 text-white' : 'bg-emerald-500 text-white'}`}>
            {isSale ? '🔵 For Sale' : '🟢 For Rent'}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-black/40 text-white backdrop-blur-sm">
            {property.type}
          </span>
        </div>

        {/* Price pill */}
        <div className="absolute bottom-3 right-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-black
                           bg-white/95 backdrop-blur-sm text-primary-700 shadow-md">
            ₹{price}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-5">
        <h3 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 mb-2
                       group-hover:text-primary-600 transition-colors">
          {property.title}
        </h3>

        <p className="flex items-center gap-1 text-gray-500 text-xs mb-4">
          <svg className="w-3 h-3 shrink-0 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span className="truncate">{location}</span>
        </p>

        {/* Stats */}
        <div className="mt-auto flex flex-wrap gap-3 text-xs text-gray-500 border-t border-gray-100 pt-3">
          {property.bedrooms  > 0 && <span className="flex items-center gap-0.5">🛏 <b className="text-gray-700">{property.bedrooms}</b> Bed</span>}
          {property.bathrooms > 0 && <span className="flex items-center gap-0.5">🚿 <b className="text-gray-700">{property.bathrooms}</b> Bath</span>}
          {property.area      > 0 && <span className="flex items-center gap-0.5">📐 <b className="text-gray-700">{property.area.toLocaleString()}</b> sqft</span>}
          {property.furnished && property.furnished !== 'Unfurnished' && (
            <span className="badge badge-green text-[10px]">{property.furnished}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PropertyCard;
