import React from 'react';

/**
 * LogoWithDivider
 * - Top-center logo: circular icon with script "Haven" + right-side text "HAVEN WORD CHURCH"
 * - Horizontal divider line starts at vertical center of text and runs right
 * - Below: "KNOW WHERE YOU BELONG" slogan
 */
const LogoWithDivider = ({ className = '' }) => (
  <div className={`w-full flex flex-col items-center ${className}`}>
    {/* Logo Row */}
    <div className="flex items-center justify-center w-full max-w-2xl mx-auto relative">
      {/* Circular Icon with script "Haven" */}
      <div className="flex-shrink-0 flex items-center justify-center rounded-full bg-white shadow-soft border-2 border-primary-200 h-20 w-20 md:h-24 md:w-24 mr-4">
        <span
          className="text-3xl md:text-4xl font-accent text-primary-700"
          style={{ fontFamily: 'Poppins, cursive, sans-serif', fontWeight: 700 }}
        >
          Haven
        </span>
      </div>
      {/* Text part of logo */}
      <div className="flex flex-col justify-center">
        <span className="text-xl md:text-2xl font-bold uppercase text-primary-700 tracking-widest font-sans">
          HAVEN WORD CHURCH
        </span>
      </div>
      {/* Divider line */}
      <div className="flex-1 flex items-center ml-4">
        <div className="h-0.5 bg-primary-200 w-full relative top-1" style={{ minWidth: 40 }} />
      </div>
    </div>
    {/* Slogan below */}
    <div className="mt-6">
      <span className="inline-block bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white px-4 py-2 rounded-full font-bold text-lg shadow-soft">
        KNOW WHERE YOU BELONG
      </span>
    </div>
  </div>
);

export default LogoWithDivider;
