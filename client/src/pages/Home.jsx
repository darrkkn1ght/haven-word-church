import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Calendar from '../components/ui/Calendar';
import EventCard from '../components/cards/EventCard';
import ContactForm from '../components/forms/ContactForm';
import RSVPForm from '../components/forms/RSVPForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';

const Home = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // API calls for dynamic content
  const { data: upcomingEvents, loading: eventsLoading } = useApi('/api/events/upcoming?limit=3');

  const serviceSchedule = [
    { day: 'Sunday', service: 'First Service', time: '7:30 AM' },
    { day: 'Sunday', service: 'Second Service', time: '10:00 AM' },
    { day: 'Wednesday', service: 'Midweek Service', time: '5:30 PM' },
    { day: 'Friday', service: 'Cell Meetings', time: '5:30 PM' }
  ];

  const handleEventRSVP = (event) => {
    setSelectedEvent(event);
    setIsRSVPOpen(true);
  };

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    try {
      // API call to subscribe to newsletter
      // await api.post('/api/newsletter/subscribe', { email: newsletterEmail });
      setNewsletterSubmitted(true);
      setNewsletterEmail('');
      setTimeout(() => setNewsletterSubmitted(false), 3000);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
    }
  };

  return (
    <>
      <SEOHead 
        title="Haven Word Church – The Spread City"
        description="Join Haven Word Church in Ibadan for worship, fellowship, and spiritual growth. Experience God's love in a welcoming community."
        keywords="church, Ibadan, worship, fellowship, Christianity, Nigeria, spiritual growth"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section - Refined for Haven Word Church Theme */}
        <section className="relative bg-gradient-to-br from-white via-gray-50 to-blue-50 dark:bg-gradient-to-br dark:from-primary-900 dark:to-primary-700 py-20 pt-36 overflow-hidden font-sans">
          {/* Decorative blue accent shape */}
          <div className="absolute -top-16 -left-16 w-96 h-96 bg-gradient-to-br from-primary-100 via-primary-200 to-primary-300 opacity-30 dark:from-primary-800 dark:via-primary-900 dark:to-primary-700 dark:opacity-40 rounded-full blur-2xl z-0"></div>
          {/* Wave separator at bottom */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
            <svg viewBox="0 0 1440 100" className="w-full h-16" preserveAspectRatio="none">
              <path fill="#fff" d="M0,0 C480,100 960,0 1440,100 L1440,100 L0,100 Z"></path>
            </svg>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10">
            <img src="/logo.jpeg" alt="Haven Word Church Logo" className="mx-auto mb-6 h-28 w-28 rounded-full shadow-lg object-contain" style={{ maxHeight: 112 }} />
            <h1 className="font-accent text-5xl md:text-7xl font-bold mb-6 drop-shadow-lg">
            <span className="text-primary-700 dark:text-primary-100">Welcome to</span> <span className="bg-gradient-to-r from-primary-700 via-primary-500 to-primary-300 bg-clip-text text-transparent drop-shadow-lg dark:bg-gradient-to-r dark:from-primary-200 dark:to-primary-400 dark:bg-clip-text dark:text-transparent">Haven Word Church</span>
            </h1>
            <div className="flex justify-center mb-8">
              <span className="inline-block px-10 py-3 rounded-full bg-white border-2 border-primary-300 shadow-soft text-primary-700 font-semibold text-xl md:text-2xl tracking-wide dark:bg-primary-900 dark:border-primary-400 dark:text-primary-100 transition-all">
                ...The Spread City...
              </span>
            </div>
            <p className="text-lg mb-10 max-w-2xl mx-auto font-sans opacity-80">
              Experience God&apos;s love, grow in faith, and connect with a community that cares. Join us as we journey together in worship, fellowship, and service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setIsRSVPOpen(true)}
                className="bg-secondary-500 text-white rounded-lg px-8 py-3 font-semibold shadow-soft hover:bg-secondary-600 transition border-2 border-secondary-500"
              >
                Join Us This Sunday
              </Button>
              <Button 
                variant="secondary" 
                size="lg"
                onClick={() => setIsCalendarOpen(true)}
                className="bg-primary-100 text-primary-700 border-2 border-primary-500 rounded-lg px-8 py-3 font-semibold shadow-soft hover:bg-primary-200 hover:text-primary-900 transition dark:bg-primary-500 dark:text-white dark:border-primary-400 dark:hover:bg-primary-600"
              >
                View Calendar
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => setIsContactOpen(true)}
                className="bg-white text-secondary-500 border-2 border-secondary-500 rounded-lg px-8 py-3 font-semibold shadow-soft hover:bg-secondary-50 transition"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </section>

        {/* Service Schedule */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Join Us for Worship
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Come as you are and experience the presence of God with us
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {serviceSchedule.map((schedule, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900 dark:to-purple-900 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    {schedule.day}
                  </h3>
                  <p className="text-lg text-blue-600 dark:text-blue-300 font-medium mb-1">
                    {schedule.service}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300 text-lg">
                    {schedule.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Stay connected with our church community through these upcoming events
              </p>
            </div>
            
            {eventsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(upcomingEvents || []).map((event) => (
                  <EventCard 
                    key={event.id} 
                    event={event}
                    onRSVP={() => handleEventRSVP(event)}
                  />
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link to="/events">
                <Button variant="primary" size="lg">
                  View All Events
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Ministry Spotlight */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Ministry Spotlight
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-12">
                Discover how you can serve and grow in our vibrant ministry community
              </p>
              
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 md:p-12 text-white">
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  Community Outreach Ministry
                </h3>
                <p className="text-lg mb-6 opacity-90">
                  Join us in reaching out to our Ibadan community with practical love and support. 
                  We organize food drives, medical outreaches, and educational programs to serve 
                  those in need around us.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    variant="secondary" 
                    size="lg"
                    className="bg-white text-blue-600 hover:bg-gray-100 dark:bg-gray-900 dark:text-blue-300 dark:hover:bg-gray-800"
                  >
                    Learn More
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600 dark:border-gray-700 dark:text-blue-200 dark:hover:bg-gray-800 dark:hover:text-white"
                  >
                    Join Ministry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sermons */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                Recent Sermons
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Grow in your faith with these inspiring messages from our pastors
              </p>
            </div>
            
            <div className="flex flex-col items-center justify-center py-16">
              <h3 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">Sermons Coming Soon</h3>
              <p className="text-gray-500 dark:text-gray-400">Our latest sermons will be available here soon. Stay tuned!</p>
            </div>
          </div>
        </section>

        {/* Community Impact */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    Making a Difference in Ibadan
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
                    At Haven Word Church, we believe in being the hands and feet of Jesus 
                    in our local community. Through our various outreach programs, we&apos;ve
                    been blessed to impact thousands of lives across Ibadan and Oyo State.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                      <div className="text-gray-600 dark:text-gray-300">Families Helped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                      <div className="text-gray-600 dark:text-gray-300">Outreach Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                      <div className="text-gray-600 dark:text-gray-300">Lives Touched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-secondary-500 mb-2">25+</div>
                      <div className="text-gray-600 dark:text-gray-300">Partner Organizations</div>
                    </div>
                  </div>
                  
                  <Button variant="primary" size="lg">
                    Join Our Outreach
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg p-8 h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-300">
                      <svg className="w-24 h-24 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                      <p>Community Impact Gallery</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Stay Connected
              </h2>
              <p className="text-lg mb-8 opacity-90">
                Subscribe to our newsletter to receive updates on events, sermons, and church news
              </p>
              
              <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto">
                <div className="flex flex-col sm:flex-row gap-4">
                  <input
                    type="email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400 dark:bg-gray-900 dark:text-white"
                    required
                  />
                  <Button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold dark:bg-yellow-600 dark:hover:bg-yellow-700 dark:text-white"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
              
              {newsletterSubmitted && (
                <div className="mt-4 p-4 bg-green-600 rounded-lg">
                  <p className="font-medium">Thank you for subscribing! You&apos;ll receive our latest updates soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Modals */}
        <Modal
          isOpen={isCalendarOpen}
          onClose={() => setIsCalendarOpen(false)}
          title="Church Calendar"
          size="lg"
        >
          <Calendar />
        </Modal>

        <Modal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          title="Contact Us"
          size="md"
        >
          <ContactForm onSubmit={() => setIsContactOpen(false)} />
        </Modal>

        <Modal
          isOpen={isRSVPOpen}
          onClose={() => setIsRSVPOpen(false)}
          title={selectedEvent ? `RSVP for ${selectedEvent.title}` : "RSVP for Service"}
          size="md"
        >
          <RSVPForm 
            event={selectedEvent}
            onSubmit={() => setIsRSVPOpen(false)} 
          />
        </Modal>
      </div>
    </>
  );
};

export default Home;