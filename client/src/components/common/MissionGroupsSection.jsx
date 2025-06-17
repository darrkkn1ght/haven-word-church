import React from 'react';
import { FaFacebookF, FaInstagram, FaYoutube } from 'react-icons/fa';

const missionGroups = [
  {
    name: 'HAVEN TEENS AND CHILDREN MISSION',
    tagline: 'Join a Mission Group Today',
  },
  {
    name: 'CHURCH PLANTING MISSION',
    tagline: 'Join a Mission Group Today',
  },
  {
    name: 'FLAMES MISSION',
    tagline: 'Join a Mission Group Today',
  },
  {
    name: 'CAMPUS FELLOWSHIP MISSION',
    tagline: 'Join a Mission Group Today',
  },
  {
    name: 'ANAGKAZO MISSION',
    tagline: 'Join a Mission Group Today',
  },
];

const MissionGroupsSection = () => (
  <section className="py-16 bg-gray-50 dark:bg-gray-900 border-t border-b border-gray-200 dark:border-gray-800">
    <div className="container mx-auto px-4 max-w-4xl text-center">
      <h2 className="font-accent text-4xl md:text-5xl font-bold uppercase text-primary-700 dark:text-white mb-2 tracking-wider">
        THE SPREAD CITY
      </h2>
      <h3 className="text-xl md:text-2xl text-primary-500 dark:text-primary-200 font-semibold mb-2">
        Haven Word Church
      </h3>
      <div className="mb-8">
        <span className="inline-block bg-primary-100 dark:bg-primary-800 text-primary-700 dark:text-white px-4 py-2 rounded-full font-bold text-lg shadow-soft">
          KNOW WHERE YOU BELONG
        </span>
      </div>
      <div className="mb-10">
        <h4 className="text-2xl font-bold text-secondary-500 mb-6 tracking-wide">MISSION GROUPS</h4>
        <ul className="grid gap-6 md:grid-cols-2">
          {missionGroups.map((group, idx) => (
            <li key={group.name} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 flex flex-col items-center border border-gray-100 dark:border-gray-700">
              <span className="font-accent text-lg md:text-xl font-semibold text-primary-700 dark:text-primary-200 mb-2 text-center uppercase tracking-wide">{group.name}</span>
              <span className="text-sm text-gray-500 dark:text-gray-300 italic">{group.tagline}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-8">
        <span className="block text-2xl md:text-3xl font-bold text-secondary-500 dark:text-secondary-400 mb-2 tracking-wide">
          BE PART OF A MISSION GROUP TODAY!!!
        </span>
      </div>
      <div className="flex justify-center gap-6 mt-6">
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-primary-500 hover:text-secondary-500 text-2xl transition">
          <FaFacebookF />
        </a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-primary-500 hover:text-secondary-500 text-2xl transition">
          <FaInstagram />
        </a>
        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-primary-500 hover:text-secondary-500 text-2xl transition">
          <FaYoutube />
        </a>
      </div>
      <div className="mt-6 text-sm text-gray-400 dark:text-gray-500 font-accent tracking-wide">
        The Spread City
      </div>
    </div>
  </section>
);

export default MissionGroupsSection;
