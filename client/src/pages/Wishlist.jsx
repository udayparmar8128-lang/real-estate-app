import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getMyWishlist, toggleWishlist } from '../api/user';
import PropertyCard from '../components/PropertyCard';

// ── Skeleton ───────────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden animate-pulse">
    <div className="h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-4/5" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/5" />
      <div className="h-8 bg-gray-100 rounded-xl mt-4" />
    </div>
  </div>
);

// ── Wishlist Card wrapper — adds Remove button over PropertyCard ────────────
const WishlistCard = ({ property, onRemove, removing }) => {
  return (
    <div className="relative group">
      <PropertyCard property={property} />

      {/* Remove button — floats at the bottom, appears on card hover */}
      <div className="px-3 pb-3 -mt-1 bg-white rounded-b-2xl border-x border-b border-gray-100 shadow-card">
        <button
          onClick={() => onRemove(property._id)}
          disabled={removing === property._id}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-medium
                     text-red-500 border border-red-100 bg-red-50
                     hover:bg-red-500 hover:text-white hover:border-red-500
                     disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          {removing === property._id ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Removing…
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
              Remove from Wishlist
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const Wishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');
  const [removing, setRemoving]     = useState(null); // property._id being removed

  const fetchWishlist = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyWishlist();
      setProperties(data.data ?? []);
    } catch (err) {
      console.error('[Wishlist] fetch error:', err);
      setError('Failed to load your wishlist. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchWishlist(); }, [fetchWishlist]);

  const handleRemove = async (propertyId) => {
    setRemoving(propertyId);
    try {
      await toggleWishlist(propertyId); // toggles = removes since it's already saved
      // Optimistic update — remove from local state
      setProperties(prev => prev.filter(p => p._id !== propertyId));
    } catch (err) {
      console.error('[Wishlist] remove error:', err);
      setError('Could not remove property. Please try again.');
    } finally {
      setRemoving(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-xl py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
              </div>
              <p className="text-gray-500 text-sm">
                {loading
                  ? 'Loading saved properties…'
                  : properties.length === 0
                    ? 'No saved properties yet'
                    : `${properties.length} saved propert${properties.length !== 1 ? 'ies' : 'y'}`}
              </p>
            </div>
            <Link to="/properties" className="btn-outline shrink-0 text-sm">
              Browse Properties
            </Link>
          </div>
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────────── */}
      <div className="container-xl py-8">

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 mb-6">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
            <button onClick={fetchWishlist} className="ml-auto text-xs underline font-medium">
              Retry
            </button>
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && properties.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-16 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-300" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2 text-lg">No saved properties yet</h3>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Browse properties and tap the heart icon to save your favourites here.
            </p>
            <Link to="/properties" className="btn-primary">
              Browse Properties
            </Link>
          </div>
        )}

        {/* Wishlist grid */}
        {!loading && properties.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {properties.map(property => (
              <WishlistCard
                key={property._id}
                property={property}
                onRemove={handleRemove}
                removing={removing}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
