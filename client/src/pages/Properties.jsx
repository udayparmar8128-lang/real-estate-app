import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';

// ── Skeleton card ──────────────────────────────────────────────────────────
const Skeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden animate-pulse">
    <div className="h-52 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-4/5" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/5" />
      <div className="flex gap-3 pt-3 border-t border-gray-100 mt-4">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  </div>
);

// ── Filter sidebar ─────────────────────────────────────────────────────────
const FilterSidebar = ({ filters, setFilters, onApply, onReset }) => {
  const Field = ({ label, children }) => (
    <div>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );

  return (
    <form onSubmit={onApply} className="bg-white rounded-2xl border border-gray-100 shadow-soft p-5 sticky top-24 space-y-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Filters</h3>
        <button type="button" onClick={onReset}
          className="text-xs text-primary-600 hover:text-primary-700 font-medium transition-colors">
          Reset all
        </button>
      </div>

      <Field label="Keyword">
        <input
          className="input text-sm"
          placeholder="Title, city, description…"
          defaultValue={filters.search}
          onChange={(e) => {
            filters.search = e.target.value;
          }}
        />
      </Field>

      <Field label="City">
        <input
          className="input text-sm"
          placeholder="e.g. Mumbai"
          defaultValue={filters.city}
          onChange={(e) => {
            filters.city = e.target.value;
          }}
        />
      </Field>

      <Field label="Property Type">
        <select className="input text-sm" value={filters.type}
          onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}>
          <option value="">All Types</option>
          {['Apartment', 'House', 'Villa', 'Plot', 'Commercial', 'PG/Co-living'].map(t => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>

      <Field label="Listing For">
        <select className="input text-sm" value={filters.listingType}
          onChange={e => setFilters(f => ({ ...f, listingType: e.target.value }))}>
          <option value="">Sale &amp; Rent</option>
          <option value="sale">Sale</option>
          <option value="rent">Rent</option>
        </select>
      </Field>

      <Field label="Price Range (₹)">
        <div className="flex gap-2">
          <input className="input text-sm w-full" type="number" placeholder="Min"
            value={filters.minPrice}
            onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} />
          <input className="input text-sm w-full" type="number" placeholder="Max"
            value={filters.maxPrice}
            onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} />
        </div>
      </Field>

      <button type="submit" className="btn-primary w-full text-sm py-2.5">
        Apply Filters
      </button>
    </form>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────
const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);

  // ── Initialise filters from URL (lazy init — runs before first render, no race) ──
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    listingType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
  });

  // 🔥 NEW STATE (IMPORTANT)
  const [appliedFilters, setAppliedFilters] = useState({
    search: '',
    type: '',
    listingType: '',
    city: '',
    minPrice: '',
    maxPrice: '',
  });

  // ── Fetch ────────────────────────────────────────────────────────────────
  const fetchProperties = async (f = appliedFilters) => {
    setLoading(true);
    setError('');
    try {
      const params = Object.fromEntries(
        Object.entries(f).filter(([, v]) => v !== '')
      );
      const { data } = await getProperties(params);
      setProperties(data.data ?? []);
      setTotal(data.count ?? 0);
    } catch (err) {
      console.error('[Properties] fetch error:', err);
      setError('Failed to load properties. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Fetch on mount ────────────────────────────────────────────────────────
  // filters is already correctly initialised from URL params via lazy useState above,
  // so no race condition — this runs exactly once with the right initial values.
  useEffect(() => {
    fetchProperties(appliedFilters);
  }, [appliedFilters]);


  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleApply = (e) => {
    e.preventDefault();
    setAppliedFilters(filters);
  };
  const handleReset = () => {
    const empty = {
      search: '',
      type: '',
      listingType: '',
      city: '',
      minPrice: '',
      maxPrice: '',
    };

    setFilters(empty);
    setAppliedFilters(empty);
  };

  // ── Active filter count (for badge) ──────────────────────────────────────
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Hero header ──────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-xl py-8">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Browse Properties</h1>
              <p className="text-gray-500 text-sm mt-1">
                {loading
                  ? 'Fetching listings…'
                  : total === 0
                    ? 'No properties match your criteria'
                    : `${total.toLocaleString()} propert${total !== 1 ? 'ies' : 'y'} found`}
              </p>
            </div>

            {/* Quick CTA */}
            <Link to="/post-property" className="btn-accent shrink-0">
              + List Your Property
            </Link>
          </div>

          {/* Active filter pills */}
          {activeCount > 0 && !loading && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(filters).map(([key, val]) =>
                val ? (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary-700 text-xs font-medium"
                  >
                    {key === 'listingType' ? (val === 'sale' ? 'For Sale' : 'For Rent')
                      : key === 'minPrice' ? `Min ₹${Number(val).toLocaleString('en-IN')}`
                        : key === 'maxPrice' ? `Max ₹${Number(val).toLocaleString('en-IN')}`
                          : val}
                    <button
                      onClick={() => {
                        const next = { ...filters, [key]: '' };
                        const params = Object.fromEntries(
                          Object.entries(next).filter(([, v]) => v !== '')
                        );
                        setSearchParams(params);
                      }}
                      className="text-primary-500 hover:text-primary-700 font-bold leading-none"
                    >

                    </button>
                  </span>
                ) : null
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="container-xl py-8">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── Sidebar ────────────────────────────────────────────────── */}
          <aside className="lg:w-72 shrink-0">
            <FilterSidebar
              filters={filters}
              setFilters={setFilters}
              onApply={handleApply}
              onReset={handleReset}
            />
          </aside>

          {/* ── Grid ───────────────────────────────────────────────────── */}
          <section className="flex-1 min-w-0">

            {/* Error state */}
            {error && (
              <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4 mb-6">
                <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
                <button onClick={() => fetchProperties()} className="ml-auto text-xs underline font-medium">
                  Retry
                </button>
              </div>
            )}

            {/* Loading skeleton */}
            {loading && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            )}

            {/* Empty state */}
            {!loading && !error && properties.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-16 text-center">
                <div className="text-6xl mb-4">🏚️</div>
                <h3 className="font-semibold text-gray-900 mb-2">No properties found</h3>
                <p className="text-gray-500 text-sm mb-6">
                  {activeCount > 0
                    ? 'Try adjusting or resetting your filters.'
                    : 'Be the first to list a property!'}
                </p>
                <div className="flex gap-3 justify-center flex-wrap">
                  {activeCount > 0 && (
                    <button onClick={handleReset} className="btn-outline text-sm">
                      Reset Filters
                    </button>
                  )}
                  <Link to="/post-property" className="btn-primary text-sm">
                    Post a Property
                  </Link>
                </div>
              </div>
            )}

            {/* Property grid */}
            {!loading && properties.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {properties.map(p => (
                  <PropertyCard key={p._id} property={p} />
                ))}
              </div>
            )}
          </section>

        </div>
      </div>
    </div>
  );
};

export default Properties;
