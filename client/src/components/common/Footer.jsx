import React from 'react';
import { Link } from 'react-router-dom';
import { MINISTRIES_LIST } from '../../utils/constants';
// import { useAuth } from '../../hooks/useAuth';

/**
 * Footer Component
 * Main footer for Haven Word Church website
 * Features church information, quick links, contact details, and social media
 * Includes Nigerian context and accessibility features
 */
const Footer = () => {
  // (Removed: user and useAuth)
  const currentYear = new Date().getFullYear();

  // Quick navigation links
  const quickLinks = [
    { name: 'About Us', path: '/about' },
    { name: 'Events', path: '/events' },
    { name: 'Sermons', path: '/sermons' },
    { name: 'Ministries', path: '/ministries' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' }
  ];

  // (Removed: memberLinks)

  // Ministries List (imported from constants)
// (import moved to top)

  // Social media links
  const socialLinks = [
    {
      name: 'Facebook',
      href: 'https://facebook.com/havenwordchurch',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Instagram',
      href: 'https://instagram.com/havenwordchurch',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987c6.62 0 11.987-5.367 11.987-11.987C24.014 5.367 18.637.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.72 13.718 3.72 12.421c0-1.297.478-2.474 1.406-3.372.928-.898 2.079-1.347 3.376-1.347c1.297 0 2.448.449 3.323 1.347.875.898 1.353 2.075 1.353 3.372c0 1.297-.478 2.474-1.353 3.27-.875.807-2.026 1.297-3.376 1.297z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'YouTube',
      href: 'https://youtube.com/havenwordchurch',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C21.998 8.746 22 12 22 12s0 3.255-.418 4.814a2.504 2.504 0 0 1-1.768 1.768c-1.56.419-7.814.419-7.814.419s-6.255 0-7.814-.419a2.505 2.505 0 0 1-1.768-1.768C2 15.255 2 12 2 12s0-3.255.417-4.814a2.507 2.507 0 0 1 1.768-1.768C5.744 5 11.998 5 11.998 5s6.255 0 7.814.418ZM15.194 12 10 15V9l5.194 3Z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'WhatsApp',
      href: 'https://wa.me/2348123456789',
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
        </svg>
      )
    }
  ];

  return (
    <footer className="bg-gray-900 text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Content */}
        <div className="py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            
            {/* Church Information */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/logo.jpeg" alt="Haven Word Church Logo" className="w-12 h-12 rounded-full object-contain shadow" />
                <div>
                  <h3 className="text-xl font-bold">Haven Word Church</h3>
                  <p className="text-gray-400 text-sm italic">...Raising supernatural believers</p>
                </div>
              </div>
              
              <p className="text-gray-300 mb-6 leading-relaxed">
                Haven Word Church is a true haven where God's word is proclaimed, weary souls find rest, and families are built in the love of Christ. Led by Pastor Anthonia Amadi in Ibadan, Oyo State, Nigeria.
              </p>

              {/* Social Media Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-gray-800 hover:bg-blue-600 transition-colors duration-200 group"
                    aria-label={`Follow us on ${social.name}`}
                  >
                    <span className="text-gray-400 group-hover:text-white transition-colors duration-200">
                      {social.icon}
                    </span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Quick Links</h4>
              <ul className="space-y-3">
                {quickLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Ministries */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Our Ministries</h4>
              <ul className="space-y-3">
                {MINISTRIES_LIST.map((ministry) => (
                  <li key={ministry.id}>
                    <Link
                      to={`/ministries#${ministry.id}`}
                      className="text-gray-300 hover:text-blue-400 transition-colors duration-200 block"
                    >
                      {ministry.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact & Service Times */}
            <div>
              <h4 className="text-lg font-semibold mb-6">Contact & Services</h4>
              
              {/* Contact Information */}
              <div className="space-y-4 mb-6">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-300">9VXM+797, 107D Akintola Road</p>
                    <p className="text-gray-300">Ibadan 200284, Oyo State, Nigeria</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <a href="tel:+2348123456789" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    +234 812 345 6789
                  </a>
                </div>

                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <a href="mailto:havenwordchurch@gmail.com" className="text-gray-300 hover:text-blue-400 transition-colors duration-200">
                    havenwordchurch@gmail.com
                  </a>
                </div>
              </div>

              {/* Service Times */}
              <div>
                <h5 className="font-medium text-white mb-3">Service Times</h5>
                <div className="space-y-2 text-sm text-gray-300">
                  <div className="flex justify-between">
                    <span>Sundays:</span>
                    <span>7:30 AM & 10:00 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wednesdays (Bible Study):</span>
                    <span>5:30 PM</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fridays (Cell Meetings):</span>
                    <span>5:30 PM</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">(West Africa Time - WAT)</p>
                </div>
              </div>
            </div>
          </div>

          {/* (Removed: Member Links Section) */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-center md:text-left">
              <p className="text-gray-400 text-sm">
                © {currentYear} Haven Word Church. All rights reserved.
              </p>
              <p className="text-gray-500 text-xs mt-1">
                Built with love for our community in Ibadan, Nigeria
              </p>
            </div>
            
            <div className="flex space-x-6 text-sm">
              <Link to="/privacy" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                Terms of Service
              </Link>
              <Link to="/sitemap" className="text-gray-400 hover:text-blue-400 transition-colors duration-200">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;