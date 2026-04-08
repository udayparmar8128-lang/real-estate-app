import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { getPropertyById } from '../api/properties';
import { toggleWishlist } from '../api/user';
import { useAuth } from '../context/AuthContext';

const PropertyDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [property, setProperty]   = useState(null);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [imgIdx, setImgIdx]       = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getPropertyById(id);
        setProperty(data.data);
      } catch {
        setError('Property not found or failed to load.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleWishlist = async () => {
    if (!user) return navigate('/login');
    try {
      await toggleWishlist(id);
      setWishlisted(w => !w);
    } catch { /* silent */ }
  };

  if (loading) return (
    <div className="container-xl section">
      <div className="animate-pulse space-y-6">
        <div className="h-72 bg-gray-200 rounded-2xl" />
        <div className="h-6 bg-gray-200 rounded w-2/3" />
        <div className="h-4 bg-gray-100 rounded w-1/2" />
      </div>
    </div>
  );

  if (error) return (
    <div className="container-xl section text-center">
      <div className="text-5xl mb-4">🏚️</div>
      <h2 className="font-semibold text-gray-900 mb-2">{error}</h2>
      <Link to="/properties" className="btn-primary">Back to Properties</Link>
    </div>
  );

  const images = property.images?.length ? property.images : [];
  const price  = Number(property.price).toLocaleString('en-IN');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-xl py-8">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2">
          <Link to="/properties" className="hover:text-primary-600 transition-colors">Properties</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium truncate max-w-xs">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* ── Left: images + info ──────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="card overflow-hidden">
              {images.length > 0 ? (
                <div>
                  <div className="h-72 sm:h-96 overflow-hidden relative">
                    <img
                      src={images[imgIdx].url}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                    {images.length > 1 && (
                      <>
                        <button
                          onClick={() => setImgIdx(i => (i - 1 + images.length) % images.length)}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        >‹</button>
                        <button
                          onClick={() => setImgIdx(i => (i + 1) % images.length)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                        >›</button>
                        <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                          {imgIdx + 1}/{images.length}
                        </div>
                      </>
                    )}
                  </div>
                  {images.length > 1 && (
                    <div className="flex gap-2 p-3 overflow-x-auto">
                      {images.map((img, i) => (
                        <button key={i} onClick={() => setImgIdx(i)}
                          className={`h-16 w-24 shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${i === imgIdx ? 'border-primary-500' : 'border-transparent'}`}>
                          <img src={img.url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-72 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                  <span className="text-7xl opacity-30">🏢</span>
                </div>
              )}
            </div>

            {/* Title / Price / Badges */}
            <div className="card p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`badge ${property.listingType === 'sale' ? 'badge-blue' : 'badge-green'}`}>
                      For {property.listingType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                    <span className="badge badge-gray">{property.type}</span>
                    {property.furnished !== 'Unfurnished' && (
                      <span className="badge badge-gray">{property.furnished}</span>
                    )}
                  </div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{property.title}</h1>
                  <p className="text-gray-500 text-sm flex items-center gap-1">
                    <svg className="w-4 h-4 text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {[property.location?.address, property.location?.city, property.location?.state]
                      .filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-2xl font-bold text-primary-600">₹{price}</p>
                  {property.area && <p className="text-xs text-gray-400 mt-1">{property.area} sq ft</p>}
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-gray-100">
                {[
                  { icon: '🛏', label: 'Bedrooms',  value: property.bedrooms || '—' },
                  { icon: '🚿', label: 'Bathrooms', value: property.bathrooms || '—' },
                  { icon: '📐', label: 'Area',      value: property.area ? `${property.area} sqft` : '—' },
                  { icon: '👁', label: 'Views',     value: property.views || 0 },
                ].map(s => (
                  <div key={s.label} className="text-center bg-gray-50 rounded-xl p-3">
                    <div className="text-xl mb-1">{s.icon}</div>
                    <div className="font-semibold text-gray-900 text-sm">{s.value}</div>
                    <div className="text-xs text-gray-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="card p-6">
              <h2 className="font-semibold text-gray-900 mb-3">About this Property</h2>
              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          </div>

          {/* ── Right: Contact + Actions ─────────────────────────────── */}
          <div className="lg:col-span-1 space-y-5">
            {/* Owner Card */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Listed by</h3>
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                  <span className="text-primary-700 font-bold text-sm">
                    {property.owner?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm">{property.owner?.name}</p>
                  <p className="text-xs text-gray-500">{property.owner?.email}</p>
                </div>
              </div>

              {user ? (
                <>
                  {property.owner?.phone && (
                    <a href={`tel:${property.owner.phone}`} className="btn-primary w-full flex items-center justify-center gap-2 mb-3 text-sm">
                      📞 Call Owner
                    </a>
                  )}
                  <a href={`mailto:${property.owner?.email}?subject=Inquiry: ${property.title}`}
                    className="btn-outline w-full flex items-center justify-center gap-2 text-sm">
                    ✉️ Email Owner
                  </a>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-sm text-gray-500 mb-3">Login to contact the owner</p>
                  <Link to="/login" className="btn-primary w-full text-sm">Sign In</Link>
                </div>
              )}
            </div>

            {/* Save / Wishlist */}
            <div className="card p-6">
              <button
                onClick={handleWishlist}
                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all duration-200 ${
                  wishlisted
                    ? 'border-red-400 bg-red-50 text-red-600 hover:bg-red-100'
                    : 'border-gray-200 text-gray-600 hover:border-primary-300 hover:text-primary-600'
                }`}
              >
                <span>{wishlisted ? '❤️' : '🤍'}</span>
                {wishlisted ? 'Saved to Wishlist' : 'Save to Wishlist'}
              </button>
            </div>

            {/* Map placeholder */}
            {property.location?.pincode && (
              <div className="card p-6">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Location</h3>
                <div className="bg-gray-100 rounded-xl h-36 flex flex-col items-center justify-center gap-1">
                  <span className="text-2xl">📍</span>
                  <p className="text-xs text-gray-500 text-center">
                    {[property.location?.address, property.location?.city, property.location?.state].filter(Boolean).join(', ')}
                    {property.location?.pincode && ` — ${property.location.pincode}`}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetail;
