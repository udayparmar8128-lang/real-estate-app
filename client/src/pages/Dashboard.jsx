import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyProperties, getMyProfile } from '../api/user';
import { deleteProperty } from '../api/properties';

// ── Colored stat tile ──────────────────────────────────────────────────────
const StatTile = ({ icon, label, value, statClass, iconColor }) => (
  <div className={`rounded-2xl shadow-soft p-5 flex items-center gap-4 ${statClass}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-white/70 shadow-sm ${iconColor}`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-black text-gray-900">{value}</p>
      <p className="text-xs font-medium text-gray-500 mt-0.5">{label}</p>
    </div>
  </div>
);

// ── Property row ───────────────────────────────────────────────────────────
const PropertyRow = ({ property, onDelete }) => {
  const [deleting, setDeleting] = useState(false);
  const img   = property.images?.[0]?.url;
  const price = Number(property.price).toLocaleString('en-IN');
  const isSale = property.listingType === 'sale';

  const handleDelete = async () => {
    if (!window.confirm('Remove this listing permanently?')) return;
    setDeleting(true);
    try {
      await deleteProperty(property._id);
      onDelete(property._id);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-4 flex items-start sm:items-center gap-4 flex-col sm:flex-row hover:shadow-glow hover:border-blue-100 transition-all duration-300">
      {/* Thumbnail */}
      <div className="w-full sm:w-24 h-20 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shrink-0">
        {img
          ? <img src={img} alt={property.title} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-2xl opacity-30">🏢</div>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/properties/${property._id}`}
          className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 text-sm">
          {property.title}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">
          📍 {property.location?.city}, {property.location?.state}
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          <span className={`badge ${isSale ? 'badge-blue' : 'badge-green'}`}>
            {isSale ? '🔵 Sale' : '🟢 Rent'}
          </span>
          <span className="badge badge-gray">{property.type}</span>
          <span className="text-xs font-bold text-primary-600">₹{price}</span>
          {property.views > 0 && (
            <span className="badge badge-purple">👁 {property.views} views</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 self-start sm:self-center shrink-0">
        <Link to={`/properties/${property._id}`}
          className="text-xs py-2 px-3 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors font-medium">
          View
        </Link>
        <Link to={`/edit-property/${property._id}`}
          className="text-xs py-2 px-3 rounded-lg bg-primary-50 border border-primary-200 text-primary-700 hover:bg-primary-100 transition-colors font-medium">
          ✏️ Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="text-xs py-2 px-3 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50 font-medium"
        >
          {deleting ? '…' : '🗑 Delete'}
        </button>
      </div>
    </div>
  );
};

// ── Dashboard Page ─────────────────────────────────────────────────────────
const Dashboard = () => {
  const { user, logout }  = useAuth();
  const navigate          = useNavigate();
  const [properties, setProperties] = useState([]);
  const [profile, setProfile]       = useState(null);
  const [loading, setLoading]       = useState(true);

  const load = useCallback(async () => {
    try {
      const [propRes, profileRes] = await Promise.all([
        getMyProperties(),
        getMyProfile(),
      ]);
      setProperties(propRes.data.data  ?? []);
      setProfile(profileRes.data.data);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = (id) => setProperties(p => p.filter(x => x._id !== id));

  const totalViews = properties.reduce((s, p) => s + (p.views || 0), 0);
  const forSale    = properties.filter(p => p.listingType === 'sale').length;
  const forRent    = properties.filter(p => p.listingType === 'rent').length;

  if (loading) return (
    <div className="container-xl section">
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-shimmer" />)}
        </div>
        {[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-soft">
        <div className="container-xl py-6 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-0.5">
              Welcome back, <span className="font-semibold text-primary-600">{user?.name?.split(' ')[0]}</span>! 👋
            </p>
          </div>
          <Link to="/post-property" className="btn-primary">
            + List Property
          </Link>
        </div>
      </div>

      <div className="container-xl py-8 space-y-8">

        {/* ── Stats ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile icon="🏠" label="Total Listings" value={properties.length}
            statClass="stat-blue"   iconColor="text-blue-600" />
          <StatTile icon="💰" label="For Sale"       value={forSale}
            statClass="stat-green"  iconColor="text-success-600" />
          <StatTile icon="🔑" label="For Rent"       value={forRent}
            statClass="stat-orange" iconColor="text-amber-600" />
          <StatTile icon="👁" label="Total Views"    value={totalViews}
            statClass="stat-purple" iconColor="text-purple-600" />
        </div>

        {/* ── Profile Card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-6">
          <h2 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
            <span className="w-1 h-5 bg-gradient-blue rounded-full inline-block" />
            My Profile
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center shadow-sm">
              <span className="text-primary-700 font-black text-2xl">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="font-bold text-gray-900 text-lg">{profile?.name || user?.name}</p>
              <p className="text-gray-500 text-sm">{profile?.email || user?.email}</p>
              {profile?.phone && <p className="text-gray-500 text-sm">📞 {profile.phone}</p>}
              <span className={`badge mt-1 ${profile?.role === 'admin' ? 'badge-purple' : 'badge-blue'}`}>
                {profile?.role || 'User'}
              </span>
            </div>
          </div>
        </div>

        {/* ── My Listings ───────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-1 h-5 bg-gradient-green rounded-full inline-block" />
              My Listings
              <span className="badge badge-blue ml-1">{properties.length}</span>
            </h2>
            {properties.length > 0 && (
              <Link to="/properties" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                Browse all →
              </Link>
            )}
          </div>

          {properties.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-soft p-12 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">📋</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">No listings yet</h3>
              <p className="text-gray-500 text-sm mb-6">Start by posting your first property.</p>
              <Link to="/post-property" className="btn-primary">Post a Property</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {properties.map(p => (
                <PropertyRow key={p._id} property={p} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>

        {/* ── Quick Links ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/wishlist"
            className="bg-gradient-to-br from-red-50 to-pink-50 border border-red-100 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <span className="text-3xl">❤️</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">My Wishlist</p>
              <p className="text-xs text-gray-500">Saved properties</p>
            </div>
          </Link>
          <Link to="/post-property"
            className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <span className="text-3xl">➕</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Post Property</p>
              <p className="text-xs text-gray-500">List a new property</p>
            </div>
          </Link>
          <Link to="/properties"
            className="bg-gradient-to-br from-success-50 to-emerald-50 border border-success-400/20 rounded-2xl p-5 flex items-center gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
            <span className="text-3xl">🔍</span>
            <div>
              <p className="font-semibold text-gray-900 text-sm">Browse Market</p>
              <p className="text-xs text-gray-500">All listings</p>
            </div>
          </Link>
        </div>

        {/* ── Account ───────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-red-100 shadow-soft p-6">
          <h3 className="font-semibold text-red-700 mb-1 text-sm flex items-center gap-2">
            <span className="w-1 h-4 bg-red-400 rounded-full inline-block" />
            Account
          </h3>
          <p className="text-gray-500 text-xs mb-4">Sign out from all devices.</p>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="text-sm py-2 px-4 rounded-lg bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 hover:border-red-300 transition-colors font-medium"
          >
            🚪 Sign Out
          </button>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
