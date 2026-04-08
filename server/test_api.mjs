// ─── Real Estate API Test — Node.js ─────────────────────────────────────────
// Run: node test_api.mjs  (while server is running on port 5000)

const BASE = 'http://localhost:5000/api';

let token = '';
let propId = '';

async function callApi(method, path, body = null, auth = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth && token) headers['Authorization'] = `Bearer ${token}`;

  const opts = { method, headers };
  if (body) opts.body = JSON.stringify(body);

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json();

  const icon = res.ok ? '✅' : '❌';
  console.log(`\n${icon}  ${method} ${path}  →  HTTP ${res.status}`);
  console.log(JSON.stringify(data, null, 2));
  return { ok: res.ok, status: res.status, data };
}

function sep(title) {
  console.log('\n' + '='.repeat(60));
  console.log(' ' + title);
  console.log('='.repeat(60));
}

(async () => {
  // ── 1. Register (first run creates user; subsequent runs → 400 expected) ───
  sep('1. POST /api/auth/register');
  await callApi('POST', '/auth/register', {
    name: 'Test User',
    email: 'testuser@realestate.com',
    password: 'Test@1234',
  });

  // ── 2. Register fresh unique user ─────────────────────────────────────────
  sep('2. POST /api/auth/register  (fresh unique email)');
  const ts = Date.now();
  const freshEmail = `freshuser${ts}@realestate.com`;
  console.log(`   Using: ${freshEmail}`);
  const regRes = await callApi('POST', '/auth/register', {
    name: 'Fresh User',
    email: freshEmail,
    password: 'Fresh@1234',
  });
  if (regRes.ok) {
    console.log(`\n   ✔ Register OK — _id: ${regRes.data.data._id}`);
  }

  // ── 3. Login ──────────────────────────────────────────────────────────────
  sep('3. POST /api/auth/login');
  const loginRes = await callApi('POST', '/auth/login', {
    email: 'testuser@realestate.com',
    password: 'Test@1234',
  });
  if (loginRes.ok && loginRes.data.data?.token) {
    token = loginRes.data.data.token;
    console.log(`\n   🔑 JWT captured: ${token.slice(0, 40)}...`);
  }

  // ── 4. GET /api/auth/me ───────────────────────────────────────────────────
  sep('4. GET /api/auth/me  (requires JWT)');
  await callApi('GET', '/auth/me', null, true);

  // ── 5. Create Property ────────────────────────────────────────────────────
  sep('5. POST /api/properties  (requires JWT)');
  const propRes = await callApi('POST', '/properties', {
    title: 'Luxury 3BHK Apartment in Mumbai',
    description: 'A beautiful fully furnished apartment with sea view in Bandra West.',
    type: 'Apartment',
    listingType: 'sale',
    price: 9500000,
    area: 1450,
    bedrooms: 3,
    bathrooms: 2,
    furnished: 'Fully Furnished',
    amenities: ['Gym', 'Swimming Pool', 'Parking', 'Security'],
    location: {
      address: 'Bandra West',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400050',
    },
  }, true);
  if (propRes.ok) {
    propId = propRes.data.data._id;
    console.log(`\n   🏠 Property created — _id: ${propId}`);
  }

  // ── 6. GET All Properties ─────────────────────────────────────────────────
  sep('6. GET /api/properties  (public)');
  const allRes = await callApi('GET', '/properties');
  if (allRes.ok) {
    console.log(`\n   Total listings returned: ${allRes.data.count}`);
  }

  // ── 7. GET Single Property ────────────────────────────────────────────────
  if (propId) {
    sep(`7. GET /api/properties/${propId}`);
    await callApi('GET', `/properties/${propId}`);
  }

  // ── 8. Create Property WITHOUT token (should 401) ─────────────────────────
  sep('8. POST /api/properties  (NO token — expect 401)');
  await callApi('POST', '/properties', {
    title: 'Should fail', description: 'x', type: 'Apartment',
    listingType: 'sale', price: 100, area: 100,
    location: { address: 'x', city: 'x', state: 'x' },
  }, false);

  // ── 9. Health Check ───────────────────────────────────────────────────────
  sep('9. GET /api/health');
  await callApi('GET', '/health');

  console.log('\n' + '='.repeat(60));
  console.log(' ALL TESTS COMPLETE');
  console.log('='.repeat(60) + '\n');
})();
