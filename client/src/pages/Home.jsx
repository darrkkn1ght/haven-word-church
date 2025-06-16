import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Calendar from '../components/ui/Calendar';
import EventCard from '../components/cards/EventCard';
import SermonCard from '../components/cards/SermonCard';
import ContactForm from '../components/forms/ContactForm';
import RSVPForm from '../components/forms/RSVPForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { useApi } from '../hooks/useApi';
import { formatDate } from '../utils/helpers';

const Home = () => {
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubmitted, setNewsletterSubmitted] = useState(false);

  // API calls for dynamic content
  const { data: upcomingEvents, loading: eventsLoading } = useApi('/api/events/upcoming?limit=3');
  const { data: recentSermons, loading: sermonsLoading } = useApi('/api/sermons/recent?limit=3');
  const { data: featuredMinistry, loading: ministryLoading } = useApi('/api/ministries/featured');

  // Mock data for demonstration (remove when API is ready)
  const mockUpcomingEvents = [
    {
      id: 1,
      title: 'Sunday Morning Service',
      date: '2024-06-23',
      time: '10:00 AM',
      location: 'Main Sanctuary',
      description: 'Join us for worship, fellowship, and the Word of God.',
      image: '/images/sunday-service.jpg',
      category: 'service'
    },
    {
      id: 2,
      title: 'Youth Fellowship Night',
      date: '2024-06-25',
      time: '6:00 PM',
      location: 'Youth Hall',
      description: 'An evening of praise, games, and fellowship for young adults.',
      image: '/images/youth-fellowship.jpg',
      category: 'youth'
    },
    {
      id: 3,
      title: 'Community Outreach',
      date: '2024-06-29',
      time: '2:00 PM',
      location: 'Ibadan Central Market',
      description: 'Reaching out to our community with love and support.',
      image: '/images/outreach.jpg',
      category: 'outreach'
    }
  ];

  const mockRecentSermons = [
    {
      id: 1,
      title: 'Walking in Faith',
      pastor: 'Pastor Emmanuel Adebayo',
      date: '2024-06-16',
      duration: '45 min',
      description: 'Understanding what it means to truly walk by faith and not by sight.',
      audioUrl: '/sermons/walking-in-faith.mp3',
      image: '/images/sermon1.jpg',
      series: 'Faith Series'
    },
    {
      id: 2,
      title: 'The Power of Prayer',
      pastor: 'Pastor Sarah Adebayo',
      date: '2024-06-09',
      duration: '38 min',
      description: 'Discovering the transformative power of consistent prayer.',
      audioUrl: '/sermons/power-of-prayer.mp3',
      image: '/images/sermon2.jpg',
      series: 'Prayer Life'
    },
    {
      id: 3,
      title: 'Love Your Neighbor',
      pastor: 'Pastor Emmanuel Adebayo',
      date: '2024-06-02',
      duration: '42 min',
      description: 'Practical ways to show Christ\'s love to those around us.',
      audioUrl: '/sermons/love-your-neighbor.mp3',
      image: '/images/sermon3.jpg',
      series: 'Love in Action'
    }
  ];

  const serviceSchedule = [
    { day: 'Sunday', service: 'Morning Service', time: '10:00 AM' },
    { day: 'Tuesday', service: 'Bible Study', time: '6:00 PM' },
    { day: 'Thursday', service: 'Prayer Meeting', time: '6:00 PM' },
    { day: 'Friday', service: 'Youth Service', time: '6:00 PM' },
    { day: 'Saturday', service: 'Workers Meeting', time: '4:00 PM' }
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
        title="Welcome to Haven Word Church - Your Spiritual Home in Ibadan"
        description="Join Haven Word Church in Ibadan for worship, fellowship, and spiritual growth. Experience God's love in a welcoming community."
        keywords="church, Ibadan, worship, fellowship, Christianity, Nigeria, spiritual growth"
      />
      
      <div className="min-h-screen bg-gray-50">
        <Header />
        
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-blue-900 to-purple-900 text-white py-20 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div className="absolute inset-0 bg-church-pattern opacity-10"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                Welcome to<br />
                <span className="text-yellow-400">Haven Word Church</span>
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                Your Spiritual Home in the Heart of Ibadan
              </p>
              <p className="text-lg mb-10 max-w-2xl mx-auto opacity-80">
                Experience God's love, grow in faith, and connect with a community 
                that cares. Join us as we journey together in worship, fellowship, and service.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={() => setIsRSVPOpen(true)}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                >
                  Join Us This Sunday
                </Button>
                <Button 
                  variant="secondary" 
                  size="lg"
                  onClick={() => setIsCalendarOpen(true)}
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  View Calendar
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => setIsContactOpen(true)}
                  className="border-white text-white hover:bg-white hover:text-gray-900"
                >
                  Contact Us
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Service Schedule */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Join Us for Worship
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Come as you are and experience the presence of God with us
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {serviceSchedule.map((schedule, index) => (
                <div key={index} className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg text-center hover:shadow-lg transition-shadow">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {schedule.day}
                  </h3>
                  <p className="text-lg text-blue-600 font-medium mb-1">
                    {schedule.service}
                  </p>
                  <p className="text-gray-600 text-lg">
                    {schedule.time}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Upcoming Events */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Upcoming Events
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Stay connected with our church community through these upcoming events
              </p>
            </div>
            
            {eventsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(upcomingEvents || mockUpcomingEvents).map((event) => (
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
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ministry Spotlight
              </h2>
              <p className="text-lg text-gray-600 mb-12">
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
                    className="bg-white text-blue-600 hover:bg-gray-100"
                  >
                    Learn More
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="border-white text-white hover:bg-white hover:text-blue-600"
                  >
                    Join Ministry
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Sermons */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Recent Sermons
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Grow in your faith with these inspiring messages from our pastors
              </p>
            </div>
            
            {sermonsLoading ? (
              <div className="flex justify-center">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {(recentSermons || mockRecentSermons).map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))}
              </div>
            )}
            
            <div className="text-center mt-12">
              <Link to="/sermons">
                <Button variant="primary" size="lg">
                  View All Sermons
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Community Impact */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                    Making a Difference in Ibadan
                  </h2>
                  <p className="text-lg text-gray-600 mb-6">
                    At Haven Word Church, we believe in being the hands and feet of Jesus 
                    in our local community. Through our various outreach programs, we've 
                    been blessed to impact thousands of lives across Ibadan and Oyo State.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                      <div className="text-gray-600">Families Helped</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-600 mb-2">50+</div>
                      <div className="text-gray-600">Outreach Events</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600 mb-2">1000+</div>
                      <div className="text-gray-600">Lives Touched</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600 mb-2">25+</div>
                      <div className="text-gray-600">Partner Organizations</div>
                    </div>
                  </div>
                  
                  <Button variant="primary" size="lg">
                    Join Our Outreach
                  </Button>
                </div>
                
                <div className="relative">
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-lg p-8 h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500">
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
                    className="flex-1 px-4 py-3 rounded-lg text-gray-900 border-0 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    required
                  />
                  <Button 
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
                  >
                    Subscribe
                  </Button>
                </div>
              </form>
              
              {newsletterSubmitted && (
                <div className="mt-4 p-4 bg-green-600 rounded-lg">
                  <p className="font-medium">Thank you for subscribing! You'll receive our latest updates soon.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        <Footer />

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