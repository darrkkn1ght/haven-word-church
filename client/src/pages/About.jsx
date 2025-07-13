import React, { useState } from 'react';
// Using public/assets, so no import needed for pastor-anthonia.jpg
import { Link } from 'react-router-dom';
import SEOHead from '../components/common/SEOHead';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import ContactForm from '../components/forms/ContactForm';

const About = () => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [selectedLeader, setSelectedLeader] = useState(null);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = useState(false);

  // Leadership team data
  const leadershipTeam = [
    {
      id: 1,
      name: 'Pastor Anthonia Amadi',
      position: 'Senior Pastor',
      image: '/assets/images/pastor-anthonia.jpg', // Update this path with your real image
      bio: 'Pastor Anthonia Amadi has been leading Haven Word Church since its founding. She is passionate about community transformation through the Gospel and raising supernatural believers.',
      education: 'M.Div - Nigerian Baptist Theological Seminary',
      experience: '5+ years in ministry',
      specialization: 'Church Leadership, Community Development',
      contact: 'pastor.anthonia@havenwordchurch.org'
    }
  ];

  // Core values data
  const coreValues = [
    {
      title: 'Word-Centered',
      description: 'We believe the Bible is God\'s infallible Word and the foundation for all faith and practice.',
      icon: '📖'
    },
    {
      title: 'Spirit-Led',
      description: 'We depend on the Holy Spirit to guide our worship, decisions, and ministry efforts.',
      icon: '🕊️'
    },
    {
      title: 'Community-Focused',
      description: 'We are committed to serving and transforming our local Ibadan community with Christ\'s love.',
      icon: '🤝'
    },
    {
      title: 'Family-Oriented',
      description: 'We create a welcoming environment where every person is valued as part of God\'s family.',
      icon: '👨‍👩‍👧‍👦'
    },
    {
      title: 'Mission-Driven',
      description: 'We actively participate in God\'s mission to reach the lost and make disciples.',
      icon: '🌍'
    },
    {
      title: 'Excellence-Pursuing',
      description: 'We strive for excellence in all we do, giving our best to honor God.',
      icon: '⭐'
    }
  ];

  // Statement of faith points
  const statementOfFaith = [
    'We believe in one true and living God, our Father, who has revealed Himself to us through Jesus Christ and is always with us by His Spirit.',
    'We believe that Jesus is God\'s Son, sent because of His great love for us. He lived a sinless life, died for our sins, and rose again. Through Him, we see the Father and receive eternal life.',
    'We believe the Bible is God\'s inspired Word. It builds us, trains us, and equips us for the work of ministry.',
    'We believe that whoever believes in Jesus will not perish but have everlasting life. Salvation is a gift of grace, not something we earn. Once a man believes, he is saved forever and made new.',
    'We believe we are sent to preach Christ — from one man to another, one city to the next — until the whole earth is filled with His glory.'
  ];

  const handleLeaderClick = (leader) => {
    setSelectedLeader(leader);
    setIsLeaderModalOpen(true);
  };

  return (
    <>
      <SEOHead 
        title="About Haven Word Church - Our Story, Leadership &amp; Mission in Ibadan"
        description="Learn about Haven Word Church&apos;s history, mission, and leadership team. Discover our commitment to serving the Ibadan community through faith, love, and service."
        keywords="Haven Word Church, about us, church history, leadership, mission, vision, Ibadan church, Nigeria"
      />
      
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <Header />
        
        {/* Hero Section with Image */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden pt-20">
          {/* Replace 'hero-placeholder.jpg' with your real hero image in assets/images */}
          <img src="/assets/images/hero-placeholder.jpg" alt="Church Hero" className="absolute inset-0 w-full h-full object-cover z-0" />
          <div className="absolute inset-0 bg-gradient-to-b from-blue-900/80 via-blue-900/60 to-purple-900/80 z-10" />
          <div className="relative z-20 flex flex-col items-center text-center w-full px-4">
            <span className="rounded-full bg-blue-700/80 text-white text-xs uppercase font-bold tracking-widest px-4 py-2 mb-4 shadow-lg">Welcome to Haven Word Church</span>
            <h1 className="text-4xl md:text-5xl font-bold uppercase text-white mb-4 leading-tight drop-shadow-xl">
              About Haven Word Church
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-3xl mx-auto">
              Discover our story, our mission, and our commitment to 
              serving God and the Ibadan community with love and excellence.
            </p>
          </div>
        </section>

        {/* Church Story with Image */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div>
                  <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-6">
                    Our Story
                  </h2>
                  <div className="prose prose-lg text-gray-600 dark:text-gray-300">
                    <p className="mb-6 font-bold text-2xl">Our Story</p>
                    <p className="mb-6">
                      Haven Word Church was birthed from a divine vision entrusted to Pastor Anthonia Amadi, who answered God&apos;s call to establish a spiritual haven for souls seeking His word and love.
                    </p>
                    <p className="mb-6">
                      Our journey began humbly in 2021 as &quot;The Father&apos;s Family&quot; at the Alumni Building of the University of Ibadan. As God&apos;s hand moved upon our growing congregation, we transitioned to &quot;The Father&apos;s Tribe&quot; while remaining in the same Alumni Building during the 2021/2022 season. The Lord continued to expand our borders, and we relocated to Abadina Classroom within the university grounds, carrying the name &quot;The Father&apos;s Tribe&quot; as we ministered to students and the broader community.
                    </p>
                    <p className="mb-6">
                      Trusting in God&apos;s provision and timing, we made another significant move to a new facility at Richbam Place in Mokola, Ibadan. From there, our faith journey led us to worship under a tent at Bethel, where we experienced the beauty of praising God under the open sky. On May 5th, a date that will forever be etched in our hearts, we established our current home at 9VXM+797, 107D Akintola Road, Ibadan 200284, Oyo State.
                    </p>
                    <p className="mb-6">
                      It was during this transformative period that God revealed our new identity - Haven Word Church. This name perfectly captures our mission: to be a true haven where God&apos;s word is proclaimed with power, where weary souls find rest, and where families are built in the love of Christ.
                    </p>
                    <p className="mb-6">
                      Today, by God&apos;s amazing grace, our church family has grown to over 100 members and continues to expand. From a small gathering to a thriving community, we remain committed to our founding vision of being a sanctuary where every person can encounter God&apos;s transforming word and experience His unconditional love.
                    </p>
                    <p className="mb-6">
                      Haven Word Church stands as a testament to God&apos;s faithfulness, growing not just in numbers but in spiritual maturity, community impact, and kingdom influence throughout Ibadan and beyond.
                    </p>
                  </div>
                </div>
                {/* Replace 'story-placeholder.jpg' with a real image showing your church's journey */}
                <div className="space-y-6 flex flex-col items-center">
                  <img src="/assets/images/story-placeholder.jpg" alt="Church Story" className="rounded-2xl shadow-lg w-full max-w-md mb-6" />
                  <div className="bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-lg p-8 text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-2">A Journey of Faith (2021��Present)</div>
                    <div className="text-gray-700 dark:text-gray-300">From a humble gathering at UI Alumni Building to our vibrant home today, our story is one of faith, obedience, and God&apos;s leading.</div>
                  </div>
                  <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-lg p-8 text-center">
                    <div className="text-2xl font-bold text-purple-600 mb-2">Transformed Lives</div>
                    <div className="text-gray-700 dark:text-gray-300">Over 100 members and counting—each life a testimony to God&apos;s power, love, and the impact of a true spiritual family.</div>
                  </div>
                  <div className="bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900 dark:to-blue-900 rounded-lg p-8 text-center">
                    <div className="text-2xl font-bold text-green-600 mb-2">A True Haven</div>
                    <div className="text-gray-700 dark:text-gray-300">More than a name—Haven Word Church is a sanctuary where God&apos;s word is proclaimed, weary souls find rest, and families are built in Christ&apos;s love.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              {/* Mission & Vision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <div className="bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900 dark:to-purple-950 rounded-2xl p-10 shadow-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-blue-200 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">🌟</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-blue-900 dark:text-white tracking-tight mb-2">Our Mission</h3>
                    <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto">We exist to fulfill God&apos;s call and raise supernatural believers, empowered by the Holy Spirit and rooted in Christ&apos;s gospel.</p>
                  </div>
                  <ul className="space-y-6 max-w-2xl mx-auto">
                    <li className="flex items-start bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-blue-500 dark:border-blue-400">
                      <span className="text-2xl mr-4">📣</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">WE ARE CALLED OF GOD TO PREACH CHRIST&apos;S GOSPEL TO EVERY MAN</span>
                    </li>
                    <li className="flex items-start bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-purple-500 dark:border-purple-400">
                      <span className="text-2xl mr-4">🔥</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">WE GIVE OURSELVES TO THE TRAINING OF THE HOLY SPIRIT AND ARE PERFECTED FOR THE WORK OF MINISTRY</span>
                    </li>
                    <li className="flex items-start bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-green-500 dark:border-green-400">
                      <span className="text-2xl mr-4">🕊️</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">TILL EVERYMAN IS MADE GOD&apos;S MAN! FULL OF FAITH AND OF THE HOLY GHOST.</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-purple-100 dark:from-blue-900 dark:to-purple-950 rounded-2xl p-10 shadow-2xl border border-blue-200 dark:border-blue-800">
                  <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-purple-200 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <span className="text-4xl">👁️</span>
                    </div>
                    <h3 className="text-3xl font-extrabold text-purple-900 dark:text-white tracking-tight mb-2">Our Vision</h3>
                  </div>
                  <ul className="space-y-6 max-w-2xl mx-auto">
                    <li className="flex items-start bg-white dark:bg-gray-800 rounded-lg shadow p-5 border-l-4 border-purple-500 dark:border-purple-400">
                      <span className="text-2xl mr-4">🌍</span>
                      <span className="font-semibold text-gray-800 dark:text-gray-100">Raising a multitude of preachers in countless cities</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Core Values */}
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Core Values
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  These values guide everything we do and shape our church culture
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coreValues.map((value, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-center mb-4">
                      <div className="text-3xl mb-2">{value.icon}</div>
                      <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{value.title}</h4>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 text-center">{value.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Leadership Team
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                  Meet the dedicated leaders who shepherd our church family with wisdom, 
                  love, and biblical guidance
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leadershipTeam.map((leader) => (
                  <div 
                    key={leader.id} 
                    className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                    onClick={() => handleLeaderClick(leader)}
                  >
                    {/* Dual-image layout: small avatar + large subtle background */}
                    <div className="relative aspect-w-3 aspect-h-4 bg-gradient-to-b from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 overflow-hidden flex items-center justify-center">
                      {/* Large subtle background image */}
                      {/* Large bold background image with overlay for text readability */}
                      <div
                        className="absolute inset-0 w-full h-full"
                        style={{
                          backgroundImage: `url('${leader.image}')`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          opacity: 1,
                          zIndex: 1
                        }}
                        aria-hidden="true"
                      ></div>
                      {/* Overlay for text readability */}
                      <div
                        className="absolute inset-0 w-full h-full bg-black bg-opacity-40 z-10"
                        aria-hidden="true"
                      ></div>
                      {/* Small circular avatar */}
                      <img 
                        src={leader.image || "/assets/images/leader-placeholder.jpg"} 
                        alt={leader.name} 
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg mt-6 relative z-10" 
                        onError={e => e.target.src = "/assets/images/leader-placeholder.jpg"}
                      />
                    </div>
                    <div className="p-6 text-center relative z-10">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                        {leader.name}
                      </h3>
                      <p className="text-blue-600 dark:text-blue-300 font-medium mb-3">
                        {leader.position}
                      </p>
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3">
                        {leader.bio}
                      </p>
                      <div className="mt-4">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Statement of Faith */}
        <section className="py-16 bg-gray-50 dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  What We Believe
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Our statement of faith reflects our biblical convictions and theological foundation
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                <div className="space-y-6">
                  {statementOfFaith.map((belief, index) => (
                    <div key={index} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 dark:text-blue-300 font-semibold text-sm">{index + 1}</span>
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{belief}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Location & Facilities */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  Our Location & Facilities
                </h2>
                <p className="text-lg text-gray-600 dark:text-gray-300">
                  Visit us at our beautiful church facility in the heart of Ibadan
                </p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Find Us Here</h3>
                  <div className="space-y-4 mb-8">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 text-blue-600 mr-3 mt-1">
                        📍
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Address</p>
                        <p className="text-gray-600 dark:text-gray-300">
                          9VXM+797, 107D Akintola Road<br />
                          Ibadan 200284, Oyo State, Nigeria
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 text-blue-600 mr-3 mt-1">
                        📞
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Phone</p>
                        <p className="text-gray-600 dark:text-gray-300"></p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="flex-shrink-0 w-6 h-6 text-blue-600 mr-3 mt-1">
                        ✉️
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">Email</p>
                        <p className="text-gray-600 dark:text-gray-300">havenwordchurch@gmail.com</p>
                      </div>
                    </div>
                  </div>
                  
                  <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Our Facilities</h4>
                  <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Main Sanctuary (seating for 1,000)
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Children&apos;s Church Halls
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Youth Fellowship Center
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Conference and Meeting Rooms
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Parking for 200+ vehicles
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-blue-600 rounded-full mr-3"></span>
                      Audio/Visual Recording Studio
                    </li>
                  </ul>
                </div>
                
                <div>
                  <div className="bg-gray-200 dark:bg-gray-800 rounded-lg h-96 flex items-center justify-center">
                    <div className="text-center text-gray-500 dark:text-gray-300">
                      <svg className="w-16 h-16 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <p className="text-lg font-medium">Interactive Map</p>
                      <p className="text-sm">Google Maps integration coming soon</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-16 bg-gradient-to-r from-blue-900 to-purple-900 text-white">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Join Our Church Family
              </h2>
              <p className="text-lg mb-8 opacity-90">
                We&apos;d love to welcome you to Haven Word Church. Come as you are 
                and discover the love, community, and purpose God has for you.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/events">
                  <Button variant="primary" size="lg">
                    Join Us Sunday
                  </Button>
                </Link>
                <Button variant="outline" size="lg" onClick={() => setIsContactOpen(true)}>
                  Get in Touch
                </Button>
              </div>
            </div>
          </div>
        </section>

        <Footer />

        {/* Leadership Details Modal */}
        <Modal
          isOpen={isLeaderModalOpen}
          onClose={() => setIsLeaderModalOpen(false)}
          title={selectedLeader?.name}
          size="lg"
        >
          {selectedLeader && (
            <div className="space-y-6">
              <div className="text-center">
                {/* Replace with real headshot in assets/images/leadername.jpg */}
                <img 
                  src={selectedLeader.image || "/assets/images/leader-placeholder.jpg"} 
                  alt={selectedLeader.name} 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg mx-auto mb-4" 
                  onError={e => e.target.src = "/assets/images/leader-placeholder.jpg"}
                />
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedLeader.name}</h3>
                <p className="text-lg text-blue-600 font-medium">{selectedLeader.position}</p>
              </div>
              <div className="prose prose-gray max-w-none">
                <p>{selectedLeader.bio}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Education</h4>
                  <p className="text-gray-600">{selectedLeader.education}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Experience</h4>
                  <p className="text-gray-600">{selectedLeader.experience}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Specialization</h4>
                  <p className="text-gray-600">{selectedLeader.specialization}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Contact</h4>
                  <p className="text-blue-600">{selectedLeader.contact}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Dedicated Lead Pastor Section */}
        <section className="relative bg-blue-900 py-16 px-4 flex flex-col md:flex-row items-center gap-10">
          {/* Replace 'pastor-placeholder.jpg' with your real pastor's image in assets/images */}
          <div className="flex-1 bg-cover bg-center rounded-2xl h-80 md:h-[400px] w-full md:w-1/2" style={{ backgroundImage: "url('/assets/images/pastor-anthonia.jpg')" }}></div>
          <div className="flex-1 max-w-xl mx-auto text-white">
            <img src="/assets/images/logo-placeholder.jpg" alt="Logo" className="mb-6 h-10 w-auto" />
            <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Our Lead Pastor</h2>
            <p className="font-medium leading-7 mb-6">[Pastor&apos;s name and bio here. Replace this text with your lead pastor&apos;s real info and message.]</p>
            <Button variant="outline" size="md" className="mx-auto mt-4 block">
              Read More
            </Button>
          </div>
        </section>

        {/* Testimonials/Member Stories Section */}
        <section className="bg-white dark:bg-gray-950 px-1 py-12 md:py-16">
          <h5 className="mx-auto w-fit rounded-full bg-blue-100 px-4 py-1.5 text-center text-xs font-bold tracking-widest text-blue-700">📖 MEMBER STORIES</h5>
          <h6 className="my-2 text-center text-2xl font-black tracking-wide md:mt-5 md:text-4xl text-blue-900 dark:text-white">MY HAVEN WORD EXPERIENCE</h6>
          <p className="mb-2 text-center text-xl text-gray-700 dark:text-gray-200">Real people, Endless Life</p>
          <div className="mx-auto my-4 max-w-7xl text-center md:my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Replace with real testimonials and member images */}
            {[
              {
                name: 'Ogochukwu',
                title: 'Impartation of Spiritual Gifts',
                text: 'I just realized I&apos;ve been living my testimony all year. It started during a live stream... Glory to God!!!',
                img: '/assets/images/member1-placeholder.jpg',
              },
              {
                name: 'Harry',
                title: 'El Roi',
                text: 'Last year December I have been attending for midweek services and really enjoyed my time there... I can&apos;t wait for another camp, and I pray to be there live.',
                img: '/assets/images/member2-placeholder.jpg',
              },
              {
                name: 'Tere',
                title: 'Divine Healing',
                text: 'I want to share this testimony because it shows how much God pays attention to us. And how he can remove obstacles that hinder us from fellowshipping with him... Glory to Jesus, our intentional God!',
                img: '/assets/images/member3-placeholder.jpg',
              },
            ].map((t, idx) => (
              <div key={idx} className="bg-blue-50 dark:bg-blue-900 rounded-2xl shadow p-6 flex flex-col items-center">
                <img src={t.img} alt={t.name} className="w-16 h-16 rounded-full object-cover mb-2" />
                <h3 className="mb-2 text-lg font-semibold text-blue-900 dark:text-white">{t.title}</h3>
                <p className="my-1 text-gray-700 dark:text-gray-200">{t.text}</p>
                <p className="font-semibold text-blue-700 dark:text-blue-300 mt-2">{t.name}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Modal */}
        <Modal
          isOpen={isContactOpen}
          onClose={() => setIsContactOpen(false)}
          title="Contact Us"
          size="md"
        >
          <ContactForm onSubmit={() => setIsContactOpen(false)} />
        </Modal>
      </div>
    </>
  );
};

export default About;