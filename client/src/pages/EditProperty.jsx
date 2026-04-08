import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getPropertyById, updateProperty } from '../api/properties';

// ── helpers ─────────────────────────────────────────────────────────────────
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

// ── Image preview thumb ──────────────────────────────────────────────────────
const ImageThumb = ({ src, label, onRemove }) => (
  <div className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-square bg-gray-50">
    <img src={src} alt={label} className="w-full h-full object-cover" />
    {label && (
      <div className="absolute bottom-1 left-1 bg-primary-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-full">
        {label}
      </div>
    )}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="absolute top-1 right-1 w-6 h-6 bg-black/60 hover:bg-black/80 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs"
      >
        ✕
      </button>
    )}
  </div>
);

// ── Main Page ────────────────────────────────────────────────────────────────
const EditProperty = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const fileInput = useRef(null);

  // ── State ────────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '', description: '', type: 'Apartment', listingType: 'sale',
    price: '', area: '', bedrooms: '', bathrooms: '', furnished: 'Unfurnished',
    address: '', city: '', state: '', pincode: '',
  });

  // Existing images from the database (shown as preview, kept if no new images selected)
  const [existingImages, setExistingImages] = useState([]); // [{url, public_id}]
  // New images selected by user (File objects + preview URL)
  const [newImages, setNewImages]           = useState([]); // [{id, file, preview}]

  const [fetching, setFetching] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');
  const [success,  setSuccess]  = useState('');

  // ── Fetch property ────────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getPropertyById(id);
        const p = data.data;
        setForm({
          title:       p.title       || '',
          description: p.description || '',
          type:        p.type        || 'Apartment',
          listingType: p.listingType || 'sale',
          price:       p.price       ?? '',
          area:        p.area        ?? '',
          bedrooms:    p.bedrooms    ?? '',
          bathrooms:   p.bathrooms   ?? '',
          furnished:   p.furnished   || 'Unfurnished',
          address:     p.location?.address || '',
          city:        p.location?.city    || '',
          state:       p.location?.state   || '',
          pincode:     p.location?.pincode || '',
        });
        setExistingImages(p.images || []);
      } catch (err) {
        setFetchErr(
          err.response?.status === 403
            ? "You don't have permission to edit this property."
            : err.response?.status === 404
              ? "Property not found."
              : "Failed to load property. Please try again."
        );
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  // ── New image selection ────────────────────────────────────────────────────
  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const MAX = 5;
    const remaining = MAX - newImages.length;
    const toAdd = files.slice(0, remaining).map((file, i) => ({
      id: `${Date.now()}_${i}`,
      file,
      preview: URL.createObjectURL(file),
    }));
    setNewImages(prev => [...prev, ...toAdd]);
    e.target.value = '';
  };

  const removeNewImage = (id) =>
    setNewImages(prev => prev.filter(x => x.id !== id));

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

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); window.scrollTo(0, 0); return; }

    setError('');
    setLoading(true);

    try {
      const fd = new FormData();

      // Text fields
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

      // Append new image files (if any)
      newImages.forEach(item => fd.append('images', item.file));

      await updateProperty(id, fd);

      setSuccess('Property updated successfully! Redirecting to dashboard…');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update property. Please try again.';
      setError(msg);
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const Select = ({ name, options }) => (
    <select name={name} value={form[name]} onChange={handleChange} className="input">
      {options.map(o => (
        <option key={o.value ?? o} value={o.value ?? o}>{o.label ?? o}</option>
      ))}
    </select>
  );

  // ── Loading / error states ────────────────────────────────────────────────
  if (fetching) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-100">
          <div className="container-xl py-6">
            <div className="h-7 w-48 bg-gray-200 rounded-lg animate-pulse" />
            <div className="h-4 w-72 bg-gray-100 rounded mt-2 animate-pulse" />
          </div>
        </div>
        <div className="container-xl py-8 space-y-6">
          {[1,2,3].map(i => (
            <div key={i} className="card p-6 animate-pulse space-y-4">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="grid grid-cols-2 gap-4">
                <div className="h-10 bg-gray-100 rounded-xl" />
                <div className="h-10 bg-gray-100 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (fetchErr) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-8">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card p-12 text-center max-w-sm">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="font-semibold text-gray-900 mb-2">{fetchErr}</h2>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-6">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const totalImages = existingImages.length + newImages.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="container-xl py-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Property</h1>
            <p className="text-gray-500 text-sm mt-1">
              Update the details for your listing
            </p>
          </div>
          <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">
            ← Back to Dashboard
          </button>
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
                <SectionHeader step="1" title="Basic Information" subtitle="Update your property details" />
                <div className="space-y-4">
                  <div>
                    <Label required>Property Title</Label>
                    <input name="title" type="text" value={form.title} onChange={handleChange}
                      className="input" placeholder="e.g. Spacious 3 BHK Apartment" maxLength={120} />
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
                      placeholder="Describe the property…" />
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
                  subtitle="Replace photos by selecting new ones, or keep existing." />

                {/* Existing images */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      Current Photos {newImages.length > 0 && '(will be replaced)'}
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {existingImages.map((img, i) => (
                        <ImageThumb
                          key={img.public_id || i}
                          src={img.url}
                          label={i === 0 ? 'Cover' : null}
                        />
                      ))}
                    </div>
                    {newImages.length > 0 && (
                      <p className="mt-2 text-xs text-amber-600 font-medium">
                        ⚠️ Selecting new photos will replace all existing photos.
                      </p>
                    )}
                  </div>
                )}

                {/* New images preview */}
                {newImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                      New Photos to Upload
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      {newImages.map((item, i) => (
                        <ImageThumb
                          key={item.id}
                          src={item.preview}
                          label={i === 0 ? 'Cover' : null}
                          onRemove={() => removeNewImage(item.id)}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload zone */}
                {totalImages < 5 && (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => fileInput.current?.click()}
                    onKeyDown={e => e.key === 'Enter' && fileInput.current?.click()}
                    className="border-2 border-dashed border-primary-300 bg-primary-50/40 hover:bg-primary-50 rounded-xl p-6 text-center cursor-pointer transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-700">
                      {existingImages.length > 0
                        ? '+ Add replacement photos'
                        : '+ Select photos'}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">JPG, PNG, WebP · Max 5 MB each · Up to {5 - newImages.length} more</p>
                  </div>
                )}

                <input
                  ref={fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {newImages.length === 0 && existingImages.length > 0 && (
                  <p className="mt-3 text-xs text-green-600 font-medium">
                    ✓ Existing photos will be kept as-is.
                  </p>
                )}
              </div>
            </div>

            {/* ── Right column: summary + submit ───────────────────────── */}
            <div className="lg:col-span-1">
              <div className="card p-6 sticky top-24">
                {/* Cover preview */}
                {(newImages[0]?.preview || existingImages[0]?.url) ? (
                  <div className="mb-5 rounded-xl overflow-hidden h-36 bg-gray-100">
                    <img
                      src={newImages[0]?.preview || existingImages[0]?.url}
                      alt="Cover"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="mb-5 rounded-xl h-36 bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
                    <span className="text-4xl opacity-30">🏢</span>
                  </div>
                )}

                <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
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
                      {newImages.length > 0 ? 'Uploading & Saving…' : 'Saving…'}
                    </span>
                  ) : '💾 Save Changes'}
                </button>

                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="btn-ghost w-full mt-2 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProperty;
