import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// ── Pages ──────────────────────────────────────────────────────────────────
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import PostProperty from './pages/PostProperty';
import Properties from './pages/Properties';
import PropertyDetail from './pages/PropertyDetail';
import Dashboard    from './pages/Dashboard';
import Wishlist     from './pages/Wishlist';
import EditProperty from './pages/EditProperty';

// ── Layout wrapper with Navbar + Footer ────────────────────────────────────
const MainLayout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-1 page-enter">
      <Outlet />
    </main>
    <Footer />
  </div>
);

// ── Auth layout (no navbar/footer) ─────────────────────────────────────────
const AuthLayout = () => <Outlet />;

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* ── Main routes with Navbar + Footer ─────────────────────── */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:id" element={<PropertyDetail />} />

          {/* ── Protected routes ────────────────────────────────────── */}
          <Route path="/post-property"      element={<ProtectedRoute><PostProperty /></ProtectedRoute>} />
          <Route path="/dashboard"          element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/wishlist"           element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
          <Route path="/edit-property/:id" element={<ProtectedRoute><EditProperty /></ProtectedRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>

        {/* ── Auth routes (no navbar) ───────────────────────────────── */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
