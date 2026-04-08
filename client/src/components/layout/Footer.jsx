import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="bg-gray-950 text-gray-400 mt-auto">
    <div className="container-xl pt-14 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

        {/* Brand column */}
        <div className="md:col-span-5">
          <Link to="/" className="flex items-center gap-2.5 mb-4 group w-fit">
            <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-md group-hover:bg-primary-500 transition-colors">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="font-bold text-xl text-white tracking-tight">
              Estate<span className="text-primary-400">Hub</span>
            </span>
          </Link>
          <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
            India's trusted platform to buy, sell, and rent properties. Find your perfect home with ease.
          </p>
          {/* Social icons */}
          <div className="flex gap-3 mt-6">
            {[
              { label: 'Twitter', path: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z' },
              { label: 'Facebook', path: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z' },
              { label: 'Instagram', path: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01M6.5 19.5h11a3 3 0 003-3v-11a3 3 0 00-3-3h-11a3 3 0 00-3 3v11a3 3 0 003 3z' },
            ].map(({ label, path }) => (
              <a key={label} href="#"
                aria-label={label}
                className="w-9 h-9 rounded-xl bg-gray-800 hover:bg-primary-600 flex items-center justify-center transition-all duration-200 hover:-translate-y-0.5">
                <svg className="w-4 h-4 text-gray-400 hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d={path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        {/* Explore */}
        <div className="md:col-span-3">
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Explore</h4>
          <ul className="space-y-3 text-sm">
            {[
              { label: 'All Properties', to: '/properties' },
              { label: 'Post a Property', to: '/post-property' },
              { label: 'My Dashboard', to: '/dashboard' },
              { label: 'My Wishlist', to: '/wishlist' },
            ].map(({ label, to }) => (
              <li key={label}>
                <Link to={to}
                  className="text-gray-500 hover:text-white transition-colors hover:translate-x-0.5 inline-flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal */}
        <div className="md:col-span-4">
          <h4 className="text-white font-semibold mb-5 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-3 text-sm">
            {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Contact Us'].map(item => (
              <li key={item}>
                <a href="#"
                  className="text-gray-500 hover:text-white transition-colors hover:translate-x-0.5 inline-flex items-center gap-1.5 group">
                  <span className="w-1 h-1 rounded-full bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800/60 mt-12 pt-7 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-gray-600">
        <p>© {new Date().getFullYear()} EstateHub Technologies Pvt. Ltd. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Made with
          <svg className="w-3 h-3 text-red-500 fill-current" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
          </svg>
          for India's real estate market
        </p>
      </div>
    </div>
  </footer>
);

export default Footer;
