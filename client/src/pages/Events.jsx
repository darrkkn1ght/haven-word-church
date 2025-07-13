import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';

// Placeholder event data
const events = [
  {
    id: 1,
    title: 'Sunday Worship Service',
    date: 'July 14, 2024',
    time: '10:00 AM',
    location: 'Haven Word Church Auditorium',
    description: 'Join us for a powerful time of worship, teaching, and fellowship.'
  },
  {
    id: 2,
    title: 'Midweek Bible Study',
    date: 'July 17, 2024',
    time: '5:30 PM',
    location: 'Church Hall',
    description: 'Grow deeper in the Word with our interactive Bible study sessions.'
  },
  {
    id: 3,
    title: 'Youth Outreach',
    date: 'July 20, 2024',
    time: '3:00 PM',
    location: 'Community Center',
    description: 'A special outreach event for teens and young adults.'
  }
];

const Events = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-16 lg:pt-20 flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20 pt-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Upcoming Events</h1>
          <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-2xl mx-auto">
            Stay connected and join us for our upcoming services, programs, and special events!
          </p>
        </div>
      </section>

      {/* Events Grid */}
      <section className="py-16 bg-white dark:bg-gray-900 flex-1">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map(event => (
              <div key={event.id} className="bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-2xl shadow-lg p-8 flex flex-col justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-blue-700 dark:text-white mb-2">{event.title}</h2>
                  <p className="text-gray-700 dark:text-gray-200 mb-2">{event.description}</p>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{event.date} &bull; {event.time}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-4">{event.location}</div>
                </div>
                <Link
                  to={`/events/${event.id}`}
                  className="inline-block mt-4 px-6 py-2 rounded-full bg-secondary-500 text-white font-semibold shadow hover:bg-secondary-600 transition"
                >
                  View Details / RSVP
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default Events;