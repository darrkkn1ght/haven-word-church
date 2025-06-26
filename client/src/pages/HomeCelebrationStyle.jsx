import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

const heroBg = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80'; // Placeholder
const aboutImg = 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80';
const connectImg = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80';
const celebrationsImg = 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=600&q=80';

export default function HomeCelebrationStyle() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <img src={heroBg} alt="Hero" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/60 to-primary-700/80 z-10" />
        <div className="relative z-20 flex flex-col items-center text-center w-full px-4">
          <span className="rounded-full bg-primary-700/80 text-white text-xs uppercase font-bold tracking-widest px-4 py-2 mb-4 shadow-lg">🌍 Our Vision</span>
          <h1 className="font-accent text-4xl md:text-6xl lg:text-7xl font-bold uppercase text-white mb-4 leading-tight drop-shadow-xl">
            We envision all men celebrating endless <br />
            <span className="bg-gradient-to-r from-secondary-500 to-primary-300 bg-clip-text text-transparent">life in Christ</span>
          </h1>
          <Link to="/sermons" className="inline-block mt-6 px-8 py-3 rounded-full bg-secondary-500 text-white font-bold text-lg shadow-lg hover:bg-secondary-600 transition">Watch Live</Link>
        </div>
      </section>

      {/* Welcome/Intro Section */}
      <section className="bg-white dark:bg-primary-900 py-16 text-center">
        <h2 className="font-accent text-3xl md:text-5xl font-bold mb-4 text-primary-700 dark:text-white">WELCOME HOME!</h2>
        <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto mb-8">Dive into our teachings, events and community. Your journey of faith begins here.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/about" className="px-8 py-3 rounded-full bg-primary-100 text-primary-700 font-semibold shadow hover:bg-primary-200 transition">Learn More</Link>
          <Link to="/contact" className="px-8 py-3 rounded-full bg-secondary-500 text-white font-semibold shadow hover:bg-secondary-600 transition">Connect with Us</Link>
        </div>
      </section>

      {/* Image Card Grid */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4">
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[{
              img: aboutImg,
              title: 'About Us',
              desc: 'Learn about our mission, vision, and leadership.',
              link: '/about',
            }, {
              img: connectImg,
              title: 'Connect with Us',
              desc: 'Join our community and get involved in ministries.',
              link: '/contact',
            }, {
              img: celebrationsImg,
              title: 'Celebrations',
              desc: 'See how we celebrate milestones and testimonies.',
              link: '/celebrations',
            }].map((card, idx) => (
              <div key={idx} className="min-w-[320px] max-w-xs bg-white dark:bg-primary-800 rounded-2xl shadow-lg overflow-hidden relative group">
                <img src={card.img} alt={card.title} className="w-full h-48 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/70 to-transparent group-hover:from-primary-700/80 transition" />
                <div className="relative z-10 p-6 flex flex-col h-full justify-end">
                  <h3 className="text-xl font-bold text-white mb-2">{card.title}</h3>
                  <p className="text-white/80 mb-4">{card.desc}</p>
                  <Link to={card.link} className="inline-block px-6 py-2 rounded-full bg-secondary-500 text-white font-semibold shadow hover:bg-secondary-600 transition">Learn More</Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Community/Ministries Section */}
      <section className="py-16 bg-primary-50 dark:bg-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl md:text-5xl font-bold mb-4 text-primary-700 dark:text-white">We do community differently at Haven Word Church</h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-8">More than a church, a place to grow</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[{
              title: 'Mission Group',
              desc: 'Join our Friday Mission Group at 5:00 PM for outreach and impact.',
            }, {
              title: 'Bible Study',
              desc: 'Wednesdays at 5:30 PM – Grow deeper in the Word with us.',
            }, {
              title: 'Sunday Services',
              desc: 'First Service: 7:30 AM | Second Service: 10:00 AM',
            }].map((ministry, idx) => (
              <div key={idx} className="bg-white dark:bg-primary-800 rounded-2xl shadow-lg p-8 flex flex-col items-center">
                <h3 className="text-2xl font-bold text-primary-700 dark:text-white mb-2">{ministry.title}</h3>
                <p className="text-gray-700 dark:text-gray-200">{ministry.desc}</p>
              </div>
            ))}
          </div>
          <Link to="/ministries" className="inline-block mt-10 px-8 py-3 rounded-full bg-primary-100 text-primary-700 font-semibold shadow hover:bg-primary-200 transition">See All Ministries</Link>
        </div>
      </section>

      {/* Testimonial/Impact Section */}
      <section className="relative py-20 bg-primary-700">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80')] bg-cover bg-center opacity-30" />
        <div className="relative z-10 container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl md:text-5xl font-bold mb-4 text-white">We are a move of God that cannot be stopped!</h2>
          <h3 className="text-2xl md:text-4xl font-bold text-secondary-100 mb-6">A billion souls in 10,000 cities</h3>
          <Link to="/about" className="inline-block px-8 py-3 rounded-full bg-secondary-500 text-white font-semibold shadow hover:bg-secondary-600 transition">Learn More</Link>
        </div>
      </section>

      {/* Mailing List/Newsletter Signup */}
      <section className="py-16 bg-white dark:bg-primary-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="font-accent text-3xl md:text-5xl font-bold mb-4 text-primary-700 dark:text-white">Join Our Mailing List</h2>
          <p className="text-lg text-gray-700 dark:text-gray-200 mb-8 max-w-2xl mx-auto">We promise not to spam you, but send you edifying and amazing content regularly from Haven Word Church.</p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4 justify-center">
            <input type="email" placeholder="Email address" className="flex-1 px-4 py-3 rounded-full text-gray-900 border-2 border-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-400 dark:bg-primary-800 dark:text-white" required />
            <button type="submit" className="px-8 py-3 rounded-full bg-secondary-500 text-white font-semibold shadow hover:bg-secondary-600 transition">Submit</button>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}
