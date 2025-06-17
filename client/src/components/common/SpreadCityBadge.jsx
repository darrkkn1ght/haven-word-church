import React from 'react';

/**
 * SpreadCityBadge
 * Modern, pill-shaped badge for "...the spread city..."
 * - Uses brand colors, rounded corners, soft shadow
 * - Responsive and visually appealing
 * - Place anywhere in your layout (hero, footer, etc.)
 */
const SpreadCityBadge = ({ className = '' }) => (
  <div
    className={`inline-block px-6 py-2 rounded-full bg-white/90 dark:bg-gray-900/80 border-2 border-primary-100 shadow-soft font-accent text-lg md:text-xl text-primary-700 dark:text-white tracking-wide font-semibold backdrop-blur-sm ${className}`}
    style={{ minWidth: 220, letterSpacing: '0.04em' }}
    aria-label="The Spread City"
  >
    <span className="text-primary-300 text-2xl align-middle mr-1">…</span>
    the spread city
    <span className="text-primary-300 text-2xl align-middle ml-1">…</span>
  </div>
);

export default SpreadCityBadge;
