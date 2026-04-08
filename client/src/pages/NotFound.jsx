import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
    <div className="text-8xl font-black text-primary-100 mb-4 select-none">404</div>
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
    <p className="text-gray-500 mb-8 max-w-sm">
      The page you're looking for doesn't exist or has been moved.
    </p>
    <Link to="/" className="btn-primary">← Back to Home</Link>
  </div>
);

export default NotFound;
