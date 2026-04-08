import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createProperty } from '../api/properties';

// ── helpers ────────────────────────────────────────────────────────────────
const Label = ({ children, required }) => (
  <label className="block text-sm font-medium text-gray-700 mb-1.5">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const SectionHeader = ({ step, title, subtitle }) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold shrink-0">
      {step}
    </div>
    <div>
      <h3 className="font-semibold text-gray-900">{title}</h3>
      <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  </div>
);

// ── Image preview card ─────────────────────────────────────────────────────
const ImageThumb = ({ item, onRemove }) => (
  <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-square">
    <img src={item.preview} alt="preview" className="w-full h-full object-cover" />
    {item.isCover && (
      <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
        Cover
      </div>
    )}
    <button
      type="button"
      onClick={() => onRemove(item.id)}
      className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
    >
      ✕
    </button>
  </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const PostProperty = () => {
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  const [form, setForm] = useState({
    title: '', description: '', type: 'Apartment', listingType: 'sale',
    price: '', area: '', bedrooms: '', bathrooms: '', furnished: 'Unfurnished',
    address: '', city: '', state: '', pincode: '',
  });

  // Each item: { id, file (File), preview (object URL), isCover }
  const [images,  setImages]  = useState([]);
  const [error,   setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  // ── Image selection ───────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const MAX       = 5;
    const remaining = MAX - images.length;
    const toAdd     = files.slice(0, remaining);

    const newItems = toAdd.map((file, i) => ({
      id:      `${Date.now()}_${i}`,
      file,
      preview: URL.createObjectURL(file),
      isCover: images.length === 0 && i === 0,
    }));

    setImages(prev => [...prev, ...newItems]);
    e.target.value = '';   // reset so same file can be re-selected
  };

  const removeImage = (id) => {
    setImages(prev => {
      const next = prev.filter(x => x.id !== id);
      // Re-assign cover to first remaining image
      if (next.length > 0) next[0] = { ...next[0], isCover: true };
      return next;
    });
  };

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = () => {
    if (!form.title.trim())       return 'Property title is required.';
    if (!form.description.trim()) return 'Description is required.';
    if (!form.price)              return 'Price is required.';
    if (!form.area)               return 'Area is required.';
    if (!form.address.trim())     return 'Address is required.';
    if (!form.city.trim())        return 'City is required.';
    if (!form.state.trim())       return 'State is required.';
    return null;
  };

  // ── Submit — single FormData request ─────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); window.scrollTo(0, 0); return; }

    setError('');
    setLoading(true);

    try {
      // Build FormData — images key must match upload.array('images', 5) on backend
      const fd = new FormData();

      fd.append('title',       form.title.trim());
      fd.append('description', form.description.trim());
      fd.append('type',        form.type);
      fd.append('listingType', form.listingType);
      fd.append('price',       form.price);
      fd.append('area',        form.area);
      fd.append('bedrooms',    form.bedrooms  || '0');
      fd.append('bathrooms',   form.bathrooms || '0');
      fd.append('furnished',   form.furnished);
      fd.append('address',     form.address.trim());
      fd.append('city',        form.city.trim());
      fd.append('state',       form.state.trim());
      fd.append('pincode',     form.pincode.trim());

      // Append each selected image file under the key 'images'
      images.forEach(item => fd.append('images', item.file));

      await createProperty(fd);   // axiosInstance interceptor sets correct Content-Type

      setSuccess('Property listed successfully! Redirecting…');
      setTimeout(() => navigate('/properties'), 1200);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create property. Please try again.';
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const Select = ({ name, options }) => (
    <select name={name} value={form[name]} onChange={handleChange} className="input">
      {options.map((o) => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-xl py-6">
          <h1 className="text-2xl font-bold text-gray-900">List Your Property</h1>
          <p className="text-gray-500 text-sm mt-1">
            Fill in the details below to list your property on EstateHub
          </p>
        </div>
      </div>

      <div className="container-xl py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
            <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Left column ──────────────────────────────────────────── */}
            <div className="lg:col-span-2 space-y-6">

              {/* Section 1: Basic Info */}
              <div className="card p-6">
                <SectionHeader step="1" title="Basic Information" subtitle="Tell us about your property" />
                <div className="space-y-4">
                  <div>
                    <Label required>Property Title</Label>
                    <input name="title" type="text" value={form.title} onChange={handleChange}
                      className="input" placeholder="e.g. Spacious 3 BHK Apartment with Sea View" maxLength={120} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label required>Property Type</Label>
                      <Select name="type" options={['Apartment','House','Villa','Plot','Commercial','PG/Co-living']} /></div>
                    <div><Label required>Listing For</Label>
                      <Select name="listingType" options={[{value:'sale',label:'Sale'},{value:'rent',label:'Rent'}]} /></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label required>Price (₹)</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium text-sm">₹</span>
                        <input name="price" type="number" min="0" value={form.price} onChange={handleChange}
                          className="input pl-7" placeholder="e.g. 4500000" />
                      </div>
                    </div>
                    <div><Label required>Area (sq ft)</Label>
                      <input name="area" type="number" min="0" value={form.area} onChange={handleChange}
                        className="input" placeholder="e.g. 1200" /></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div><Label>Bedrooms</Label>
                      <input name="bedrooms" type="number" min="0" value={form.bedrooms} onChange={handleChange} className="input" placeholder="0" /></div>
                    <div><Label>Bathrooms</Label>
                      <input name="bathrooms" type="number" min="0" value={form.bathrooms} onChange={handleChange} className="input" placeholder="0" /></div>
                    <div><Label>Furnished</Label>
                      <Select name="furnished" options={['Unfurnished','Semi-Furnished','Fully Furnished']} /></div>
                  </div>

                  <div>
                    <Label required>Description</Label>
                    <textarea name="description" value={form.description} onChange={handleChange}
                      rows={4} maxLength={2000} className="input resize-none"
                      placeholder="Describe the property — highlights, nearby landmarks, floor plan details…" />
                    <p className="text-xs text-gray-400 mt-1 text-right">{form.description.length}/2000</p>
                  </div>
                </div>
              </div>

              {/* Section 2: Location */}
              <div className="card p-6">
                <SectionHeader step="2" title="Location Details" subtitle="Where is the property located?" />
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><Label required>City</Label>
                      <input name="city" type="text" value={form.city} onChange={handleChange} className="input" placeholder="e.g. Mumbai" /></div>
                    <div><Label required>State</Label>
                      <input name="state" type="text" value={form.state} onChange={handleChange} className="input" placeholder="e.g. Maharashtra" /></div>
                  </div>
                  <div>
                    <Label required>Full Address</Label>
                    <input name="address" type="text" value={form.address} onChange={handleChange}
                      className="input" placeholder="e.g. 12, MG Road, Bandra West" />
                  </div>
                  <div className="sm:w-1/2">
                    <Label>Pincode</Label>
                    <input name="pincode" type="text" value={form.pincode} onChange={handleChange}
                      className="input" placeholder="e.g. 400050" maxLength={6} />
                  </div>
                </div>
              </div>

              {/* Section 3: Photos */}
              <div className="card p-6">
                <SectionHeader step="3" title="Property Photos"
                  subtitle="Select up to 5 photos. First image is the cover. Photos upload when you submit." />

                {/* Click zone */}
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => images.length < 5 && fileInput.current?.click()}
                  onKeyDown={e => e.key === 'Enter' && images.length < 5 && fileInput.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors duration-200 ${
                    images.length >= 5
                      ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                      : 'border-primary-300 bg-primary-50/40 hover:bg-primary-50 cursor-pointer'
                  }`}
                >
                  <div className="text-3xl mb-2">📸</div>
                  <p className="text-sm font-medium text-gray-700">
                    {images.length >= 5 ? 'Maximum 5 images reached' : 'Click to select photos'}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5 MB each · Up to 5 images</p>
                  {images.length > 0 && images.length < 5 && (
                    <p className="text-xs text-primary-600 mt-2 font-medium">{images.length}/5 selected</p>
                  )}
                </div>

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {/* Preview grid */}
                {images.length > 0 && (
                  <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {images.map(item => (
                      <ImageThumb key={item.id} item={item} onRemove={removeImage} />
                    ))}
                  </div>
                )}

                {images.length > 0 && (
                  <p className="mt-3 text-xs text-gray-500">
                    💡 Images will be uploaded to Cloudinary when you submit the form.
                  </p>
                )}
              </div>
            </div>

            {/* ── Right column: summary + submit ───────────────────────── */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                {/* Cover preview */}
                {images[0] ? (
                  <div className="mb-5 rounded-xl overflow-hidden h-36 bg-gray-100">
                    <img src={images[0].preview} alt="Cover" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="mb-5 rounded-xl h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <span className="text-4xl opacity-30">🏢</span>
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-4">Property Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Type</span>
                    <span className="font-medium text-gray-800">{form.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Listing</span>
                    <span className={`badge ${form.listingType === 'sale' ? 'badge-blue' : 'badge-green'}`}>
                      For {form.listingType === 'sale' ? 'Sale' : 'Rent'}
                    </span>
                  </div>
                  {form.price && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Price</span>
                      <span className="font-bold text-primary-600">₹{Number(form.price).toLocaleString('en-IN')}</span>
                    </div>
                  )}
                  {form.city && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">City</span>
                      <span className="font-medium text-gray-800">{form.city}</span>
                    </div>
                  )}
                  {form.area && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Area</span>
                      <span className="font-medium text-gray-800">{form.area} sq ft</span>
                    </div>
                  )}
                  {images.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Photos</span>
                      <span className="font-medium text-gray-700">{images.length} selected</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-100 my-5" />

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      {images.length > 0 ? 'Uploading & Saving…' : 'Saving…'}
                    </span>
                  ) : '🏠 Submit Property'}
                </button>

                <p className="text-xs text-gray-400 text-center mt-3">
                  {images.length > 0
                    ? 'Images will be uploaded to Cloudinary on submit.'
                    : 'Your listing will be live immediately after submission.'}
                </p>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default PostProperty;
