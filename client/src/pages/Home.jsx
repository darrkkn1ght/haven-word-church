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
  const [selectedService, setSelectedService] = useState(null);

  // API calls for dynamic content
  const { data: upcomingEvents, loading: eventsLoading } = useApi('/api/events/upcoming?limit=3');

  // Refactor serviceSchedule to merge Sunday services
  const serviceSchedule = [
    {
      day: 'Sunday',
      services: [
        { name: 'First Service', time: '7:30 AM' },
        { name: 'Second Service', time: '10:00 AM' }
      ]
    },
    {
      day: 'Wednesday',
      services: [
        { name: 'Midweek Service', time: '5:30 PM' }
      ]
    },
    {
      day: 'Friday',
      services: [
        { name: 'Mission Group Meetings', time: '5:30 PM' }
      ]
    }
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
        <section
          className="relative overflow-hidden font-sans py-32 pt-48"
          style={{
            backgroundImage: "url('/assets/images/hannah-busing-FF049vNP1eg-unsplash.jpg')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          {/* Overlay */}
          <div className="absolute inset-0 bg-blue-900 bg-opacity-80 dark:bg-gray-950 dark:bg-opacity-90 backdrop-blur-sm z-0"></div>
          {/* Wave separator at bottom */}
          <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-none pointer-events-none">
            <svg viewBox="0 0 1440 100" className="w-full h-16" preserveAspectRatio="none">
              <path fill="#fff" d="M0,0 C480,100 960,0 1440,100 L1440,100 L0,100 Z"></path>
            </svg>
          </div>
          <div className="container mx-auto px-4 text-center relative z-10 flex flex-col items-center justify-center min-h-[480px]">
            <h1 className="font-accent text-5xl md:text-7xl font-bold mb-8 text-white drop-shadow-xl">
              <span className="block">We Are a City…</span>
              <span className="block bg-gradient-to-r from-primary-200 via-primary-400 to-primary-600 bg-clip-text text-transparent animate-gradient-text">We Are Spreading!</span>
            </h1>
            <p className="text-xl md:text-2xl mb-2 max-w-2xl mx-auto font-sans text-white drop-shadow-lg">
              Raising a multitude of preachers in countless cities,
            </p>
            <p className="text-xl md:text-2xl mb-12 max-w-2xl mx-auto font-sans text-white drop-shadow-lg">
              full of faith and the Holy Ghost.
            </p>
            {/* Modern Uiverse.io-inspired Button */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="relative group">
              <Button 
                  className="relative inline-block font-semibold leading-6 text-white bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500 dark:from-blue-700 dark:via-cyan-600 dark:to-purple-700 shadow-2xl shadow-blue-400/40 dark:shadow-cyan-900/60 rounded-2xl transition-transform duration-300 ease-in-out hover:scale-105 active:scale-95 text-base px-8 py-3 min-w-[160px] focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-cyan-800 before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-r before:from-blue-400 before:via-cyan-300 before:to-purple-400 before:opacity-0 group-hover:before:opacity-30 before:transition-opacity before:duration-300 after:absolute after:inset-0 after:rounded-2xl after:shadow-[0_8px_30px_0_rgba(59,130,246,0.25)] after:opacity-80 after:pointer-events-none"
                  style={{ boxShadow: '0 6px 24px 0 rgba(59,130,246,0.25), 0 1.5px 4px 0 rgba(59,130,246,0.15)' }}
                  onClick={() => setIsRSVPOpen(true)}
                variant="primary" 
                size="lg"
                  icon={
                    <svg
                      className="w-5 h-5 transition-transform duration-500 group-hover:translate-x-1 drop-shadow"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z"
                        fillRule="evenodd"
                      ></path>
                    </svg>
                  }
                >
                  <span className="relative z-10 flex items-center space-x-2">
                    <span className="transition-all duration-500 group-hover:translate-x-1 text-sm md:text-base font-bold drop-shadow-lg">
                Join Us This Sunday
                    </span>
                  </span>
              </Button>
              </div>
            </div>
          </div>
          {/* Custom Animations */}
          <style>{`
            @keyframes gradient-move {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient-move {
              animation: gradient-move 8s ease-in-out infinite;
            }
            @keyframes gradient-text {
              0%,100% { filter: brightness(1) saturate(1); }
              50% { filter: brightness(1.2) saturate(1.5); }
            }
            .animate-gradient-text {
              animation: gradient-text 3s ease-in-out infinite;
            }
            @keyframes fade-in {
              0% { opacity: 0; transform: translateY(40px); }
              100% { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
              animation: fade-in 1.2s cubic-bezier(0.23, 1, 0.32, 1) both;
            }
          `}</style>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {serviceSchedule.map((schedule, index) => (
                <div
                  key={index}
                  className="relative p-12 rounded-[2.5rem] text-center shadow-2xl hover:scale-105 transition-transform duration-300 min-h-[270px] flex flex-col justify-center items-center overflow-hidden cursor-pointer group"
                  style={{
                    background: `linear-gradient(135deg, var(--color-primary, #2563eb) 0%, #7f5af0 60%, #00c6fb 100%)`,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                  }}
                  onClick={() => {
                    setSelectedService(schedule);
                    setIsRSVPOpen(true);
                  }}
                  tabIndex={0}
                  role="button"
                  aria-label={`RSVP for ${schedule.day}`}
                  onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { setSelectedService(schedule); setIsRSVPOpen(true); } }}
                >
                  {/* Glassmorphism overlay */}
                  <div className="absolute inset-0 bg-white/20 dark:bg-gray-900/30 backdrop-blur-[6px] rounded-[2.5rem] pointer-events-none z-0 group-hover:bg-white/30 group-hover:dark:bg-gray-900/40 transition" />
                  <h3 className="relative z-10 text-3xl md:text-4xl font-extrabold text-white mb-6 drop-shadow-xl">
                    {schedule.day}
                  </h3>
                  {schedule.services.map((svc, i) => (
                    <div key={i} className="relative z-10 mb-4 last:mb-0">
                      <p className="text-xl md:text-2xl font-semibold text-white/90 mb-1 drop-shadow">
                        {svc.name}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                        {svc.time}
                      </p>
                    </div>
                  ))}
                  {/* 3D border highlight */}
                  <div className="absolute inset-0 rounded-[2.5rem] border-2 border-white/30 dark:border-primary-900/40 pointer-events-none z-10" />
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
          title={selectedService ? `RSVP for ${selectedService.day}` : "RSVP for Service"}
          size="md"
        >
          <RSVPForm
            eventData={selectedService ? {
              title: selectedService.day,
              description: selectedService.services.map(svc => `${svc.name} at ${svc.time}`).join(' | '),
              date: selectedService.day,
              time: selectedService.services.map(svc => svc.time).join(' / '),
              location: 'Haven Word Church',
            } : null}
            onSubmit={() => setIsRSVPOpen(false)}
          />
        </Modal>
      </div>
    </>
  );
};

export default Home;