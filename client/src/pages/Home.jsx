import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getProperties } from '../api/properties';
import PropertyCard from '../components/PropertyCard';
import Reveal from '../components/Reveal';

// ── Animated counter ───────────────────────────────────────────────────────
const StatCard = ({ value, label }) => (
  <div className="text-center">
    <div className="text-2xl sm:text-4xl font-black text-white drop-shadow">{value}</div>
    <div className="text-blue-200 text-sm mt-1 font-medium">{label}</div>
  </div>
);

// ── Feature card ───────────────────────────────────────────────────────────
const Feature = ({ icon, title, desc }) => (
  <div className="card p-6 hover:-translate-y-2 hover:shadow-xl transition-all duration-300 group">
    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center mb-5 text-3xl group-hover:scale-110 transition-transform duration-300">
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-2 text-base">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
  </div>
);

// ── Property type chip ─────────────────────────────────────────────────────
const TypeChip = ({ label, icon }) => (
  <Link
    to={`/properties?type=${label}`}
    className="card p-5 flex flex-col items-center gap-3
               hover:border-primary-300 hover:shadow-lg hover:-translate-y-1
               transition-all duration-300 cursor-pointer group"
  >
    <span className="text-4xl group-hover:scale-110 transition-transform duration-300">{icon}</span>
    <span className="text-sm font-semibold text-gray-700 group-hover:text-primary-600 transition-colors">{label}</span>
  </Link>
);

// ── Skeleton for featured section ──────────────────────────────────────────
const FeaturedSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden animate-pulse">
    <div className="h-52 animate-shimmer" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded-lg w-4/5" />
      <div className="h-3 bg-gray-100 rounded-lg w-2/5" />
      <div className="flex gap-3 pt-3 border-t border-gray-100">
        <div className="h-3 bg-gray-100 rounded w-16" />
        <div className="h-3 bg-gray-100 rounded w-16" />
      </div>
    </div>
  </div>
);

// ── Home Page ──────────────────────────────────────────────────────────────
const Home = () => {
  const navigate = useNavigate();
  const [search, setSearch]       = useState('');
  const [listingType, setListing] = useState('');
  const [propType, setPropType]   = useState('');
  const [featured, setFeatured]   = useState([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);

  // Fetch latest 6 properties for Featured section
  useEffect(() => {
    getProperties({ limit: 6 })
      .then(({ data }) => setFeatured(data.data?.slice(0, 6) ?? []))
      .catch(() => {}) // silent — just won't show featured
      .finally(() => setLoadingFeatured(false));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim())   params.set('search',      search.trim());
    if (listingType)     params.set('listingType',  listingType);
    if (propType)        params.set('type',         propType);
    navigate(`/properties?${params.toString()}`);
  };

  const propertyTypes = [
    { label: 'Apartment',    icon: '🏢' },
    { label: 'House',        icon: '🏡' },
    { label: 'Villa',        icon: '🏖️' },
    { label: 'Plot',         icon: '🌳' },
    { label: 'Commercial',   icon: '🏪' },
    { label: 'PG/Co-living', icon: '🛌' },
  ];

  const features = [
    { icon: '🔍', title: 'Smart Search',    desc: 'Filter by city, type, price range, and more to find exactly what you need.' },
    { icon: '💬', title: 'Direct Contact',  desc: 'Message property owners directly without any middlemen or brokers.' },
    { icon: '📸', title: 'Rich Listings',   desc: 'Detailed listings with multiple photos, amenities, and full property info.' },
    { icon: '🔐', title: 'Secure Platform', desc: 'JWT-based auth and verified listings ensure a safe experience for all.' },
  ];

  return (
    <div className="min-h-screen page-enter">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative bg-gradient-to-br from-primary-900 via-primary-800 to-primary-600 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[480px] h-[480px] bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[360px] h-[360px] bg-accent-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-primary-400/5 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl pointer-events-none" />

        <div className="container-xl relative z-10 py-28 pb-36">
          {/* Badge */}
          <Reveal animation="fade-up">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-accent-400 animate-pulse" />
              #1 Real Estate Platform in India
            </span>
          </Reveal>

          <Reveal animation="fade-up" delay="80ms">
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-white leading-[1.05] mb-6 tracking-tight">
              Find Your <span className="text-accent-400">Dream Home</span>
              <br className="hidden sm:block" />
              With Confidence
            </h1>
          </Reveal>

          <Reveal animation="fade-up" delay="160ms">
            <p className="text-blue-200 text-lg sm:text-xl mb-10 leading-relaxed max-w-xl font-medium">
              Browse thousands of verified properties across India. Buy, sell, or rent — all in one place.
            </p>
          </Reveal>

          <Reveal animation="fade-up" delay="240ms">
            <div className="flex flex-wrap gap-4">
              <Link to="/properties" className="btn-accent text-base px-8 py-3.5 shadow-xl hover:shadow-accent-500/30">
                Browse Properties →
              </Link>
              <Link to="/register"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 active:scale-[0.97] transition-all duration-200">
                List Your Property
              </Link>
            </div>
          </Reveal>

          {/* Stats */}
          <Reveal animation="fade-up" delay="320ms">
            <div className="mt-16 flex flex-wrap gap-x-12 gap-y-6">
              <StatCard value="10,000+" label="Active Listings" />
              <div className="w-px h-10 bg-white/20 self-center hidden sm:block" />
              <StatCard value="50,000+" label="Happy Families" />
              <div className="w-px h-10 bg-white/20 self-center hidden sm:block" />
              <StatCard value="200+"    label="Cities Covered" />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Floating Search Card ────────────────────────────────────────────── */}
      <section className="container-xl -mt-10 relative z-20">
        <Reveal animation="zoom-in">
          <form onSubmit={handleSearch}
            className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-5">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Keyword */}
              <div className="flex-1 relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  className="input pl-10 h-12"
                  placeholder="Search by city, locality, or project name…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {/* Type */}
              <select className="input sm:w-44 h-12" value={propType} onChange={e => setPropType(e.target.value)}>
                <option value="">All Types</option>
                {['Apartment','House','Villa','Plot','Commercial','PG/Co-living'].map(t => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              {/* Listing */}
              <select className="input sm:w-40 h-12" value={listingType} onChange={e => setListing(e.target.value)}>
                <option value="">Sale / Rent</option>
                <option value="sale">For Sale</option>
                <option value="rent">For Rent</option>
              </select>
              <button type="submit" className="btn-primary h-12 px-8 text-base whitespace-nowrap shadow-lg">
                Search
              </button>
            </div>
          </form>
        </Reveal>
      </section>

      {/* ── Browse by Type ─────────────────────────────────────────────────── */}
      <section className="section container-xl">
        <Reveal animation="fade-up">
          <div className="text-center mb-12">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">Explore</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Browse by Property Type</h2>
            <p className="text-gray-500 max-w-lg mx-auto">Explore the category that suits your needs</p>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {propertyTypes.map((t, i) => (
            <Reveal key={t.label} animation="fade-up" delay={`${i * 60}ms`}>
              <TypeChip {...t} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ─────────────────────────────────────────────── */}
      <section className="section bg-gradient-to-b from-gray-50 to-white">
        <div className="container-xl">
          <Reveal animation="fade-up">
            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
              <div>
                <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-1">New & Trending</p>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Latest Properties</h2>
                <p className="text-gray-500 mt-1">Fresh listings added recently</p>
              </div>
              <Link to="/properties" className="btn-outline">
                View All Listings →
              </Link>
            </div>
          </Reveal>

          {loadingFeatured ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1,2,3].map(i => <FeaturedSkeleton key={i} />)}
            </div>
          ) : featured.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featured.map((p, i) => (
                <Reveal key={p._id} animation="fade-up" delay={`${i * 80}ms`}>
                  <PropertyCard property={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            /* Fallback placeholder cards when no data yet */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                { beds:3, baths:2, area:1450, loc:'Bandra West, Mumbai', price:'₹45L' },
                { beds:2, baths:1, area:980,  loc:'Koramangala, Bengaluru', price:'₹90L' },
                { beds:4, baths:3, area:2100, loc:'Jubilee Hills, Hyderabad', price:'₹1.35Cr' },
              ].map((c, i) => (
                <Reveal key={i} animation="fade-up" delay={`${i * 80}ms`}>
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-card overflow-hidden group hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300">
                    <div className="h-52 bg-gradient-to-br from-primary-100 to-primary-200 relative flex items-center justify-center">
                      <span className="text-6xl opacity-40">🏢</span>
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-600 text-white">For Sale</span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-white/90 text-primary-700 shadow">{c.price}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 mb-1">3 BHK Luxury Apartment</h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mb-4">📍 {c.loc}</p>
                      <div className="flex gap-4 text-xs text-gray-500 border-t border-gray-100 pt-3">
                        <span>🛏 {c.beds} Beds</span>
                        <span>🚿 {c.baths} Baths</span>
                        <span>📐 {c.area} sqft</span>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <Reveal animation="fade-up" delay="200ms">
            <div className="text-center mt-10">
              <Link to="/properties" className="btn-primary px-10 py-3.5 text-base shadow-lg">
                Explore All Properties
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Why Choose Us ──────────────────────────────────────────────────── */}
      <section className="section container-xl">
        <Reveal animation="fade-up">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">Why Us</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Why EstateHub?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">Everything you need to make the right property decision</p>
          </div>
        </Reveal>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <Reveal key={f.title} animation="fade-up" delay={`${i * 80}ms`}>
              <Feature {...f} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="section bg-gray-50">
        <div className="container-xl">
          <Reveal animation="fade-up">
            <div className="text-center mb-14">
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide mb-2">Simple Process</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">How It Works</h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { step: '01', icon: '🔍', title: 'Search Properties', desc: 'Use smart filters to find your ideal property in minutes.' },
              { step: '02', icon: '💬', title: 'Contact Owner', desc: 'Reach out directly to property owners with no brokerage.' },
              { step: '03', icon: '🏠', title: 'Move In', desc: 'Close the deal and settle into your new home.' },
            ].map((item, i) => (
              <Reveal key={item.step} animation="fade-up" delay={`${i * 120}ms`}>
                <div className="text-center group">
                  <div className="relative inline-flex">
                    <div className="w-20 h-20 rounded-3xl bg-white shadow-lg border border-gray-100 flex items-center justify-center text-4xl mb-5 group-hover:-translate-y-2 transition-transform duration-300">
                      {item.icon}
                    </div>
                    <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-black flex items-center justify-center">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ─────────────────────────────────────────────────────── */}
      <section className="section relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-accent-600">
        <div className="absolute inset-0 opacity-10 pointer-events-none"
          style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="container-xl relative z-10 text-center">
          <Reveal animation="zoom-in">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
                Ready to List Your Property?
              </h2>
              <p className="text-blue-200 mb-10 text-lg leading-relaxed">
                Reach thousands of serious buyers and tenants. Free to post — no hidden charges.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link to="/register" className="btn-accent text-base px-10 py-4 shadow-2xl hover:shadow-accent-500/40">
                  Post for Free →
                </Link>
                <Link to="/properties"
                  className="inline-flex items-center gap-2 px-10 py-4 rounded-xl border-2 border-white/30 text-white font-semibold text-base hover:bg-white/10 active:scale-[0.97] transition-all">
                  Browse Listings
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

    </div>
  );
};

export default Home;
