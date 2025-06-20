import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send, 
  MessageSquare, 
  Users, 
  Heart,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import ContactForm from '../components/forms/ContactForm';

/**
 * Contact Page Component
 * Comprehensive contact page with multiple contact methods, location info,
 * service times, and integrated contact form
 */
const Contact = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  /**
   * Handle successful form submission
   */
  const handleFormSuccess = () => {
    setFormSubmitted(true);
    setSubmitError(null);
    // Reset success message after 5 seconds
    setTimeout(() => {
      setFormSubmitted(false);
    }, 5000);
  };

  /**
   * Handle form submission error
   */
  const handleFormError = (error) => {
    setSubmitError(error);
    setFormSubmitted(false);
  };

  // Contact information data
  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: [
        '9VXM+797, 107D Akintola Road',
        'Ibadan 200284, Oyo State, Nigeria'
      ],
      action: 'Get Directions',
      actionLink: 'https://maps.google.com/?q=9VXM%2B797%2C%20107D%20Akintola%20Road%2C%20Ibadan%20200284%2C%20Oyo%20State%2C%20Nigeria'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: [
        '+234 803 123 4567 (Main)',
        '+234 805 987 6543 (Pastor)',
        '+234 807 555 0123 (Admin)'
      ],
      action: 'Call Now',
      actionLink: 'tel:+2348031234567'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: [
        'havenwordchurch@gmail.com'
      ],
      action: 'Send Email',
      actionLink: 'mailto:havenwordchurch@gmail.com'
    },
    {
      icon: Clock,
      title: 'Service Hours',
      details: [
        'Sundays: 7:30 AM & 10:00 AM',
        'Wednesdays (Bible Study): 5:30 PM',
        'Fridays (Cell Meetings): 5:30 PM'
      ],
      action: 'View Calendar',
      actionLink: '/events'
    }
  ];

  // Staff contact information
  const staffContacts = [
    {
      name: 'Pastor Anthonia Amadi',
      role: 'Senior Pastor',
      phone: '+234 805 987 6543',
      email: 'havenwordchurch@gmail.com',
      image: '/images/pastor-michael.jpg',
      availability: 'Mon-Fri: 9AM-5PM'
    },
    {
      name: 'Mrs. Grace Okafor',
      role: 'Church Administrator',
      phone: '+234 803 123 4567',
      email: 'havenwordchurch@gmail.com',
      image: '/images/grace-okafor.jpg',
      availability: 'Mon-Fri: 8AM-4PM'
    },
    {
      name: 'Pastor Anthonia Amadi',
      role: 'Youth Pastor',
      phone: '+234 807 555 0123',
      email: 'havenwordchurch@gmail.com',
      image: '/images/pastor-david.jpg',
      availability: 'Tue-Sat: 2PM-8PM'
    }
  ];

  // Social media links
  const socialLinks = [
    {
      icon: Facebook,
      name: 'Facebook',
      url: 'https://facebook.com/havenwordchurch',
      followers: '2.5K'
    },
    {
      icon: Instagram,
      name: 'Instagram',
      url: 'https://instagram.com/havenwordchurch',
      followers: '1.8K'
    },
    {
      icon: Twitter,
      name: 'Twitter',
      url: 'https://twitter.com/havenwordchurch',
      followers: '1.2K'
    },
    {
      icon: Youtube,
      name: 'YouTube',
      url: 'https://youtube.com/havenwordchurch',
      followers: '3.1K'
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: 'What should I expect on my first visit?',
      answer: 'We welcome everyone! Come as you are. Our services are warm and welcoming, with contemporary worship, biblical teaching, and friendly people. Greeters will help you find your way and answer any questions.'
    },
    {
      question: 'Do you have programs for children?',
      answer: 'Yes! We have Sunday School for all ages, children&apos;s church during main service, and various youth programs throughout the week. Our children&apos;s ministry is safe, fun, and Bible-centered.'
    },
    {
      question: 'How can I get involved in ministry?',
      answer: 'There are many ways to serve! Contact our church office or speak with Pastor Anthonia Amadi about opportunities in worship, children&apos;s ministry, community outreach, and more. We&apos;ll help you find where your gifts can best serve God&apos;s kingdom.'
    },
    {
      question: 'Do you offer counseling services?',
      answer: 'Yes, Pastor Anthonia Amadi provides biblical counseling by appointment. We also have referrals to Christian counselors in the community for specialized needs. Contact the church office to schedule.'
    }
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - Haven Word Church</title>
        <meta 
          name="description" 
          content="Get in touch with Haven Word Church in Ibadan. Find our location, service times, contact information, and connect with our pastoral team." 
        />
        <meta name="keywords" content="Haven Word Church contact, Ibadan church, church location, service times, pastor contact" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Contact Us
              </h1>
              <p className="text-xl md:text-2xl mb-8 opacity-90">
                We&apos;d love to hear from you and welcome you into our church family
              </p>
              
              {/* Quick Contact Cards */}
              <div className="grid md:grid-cols-3 gap-6 mt-12">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <MessageSquare className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Get in Touch</h3>
                  <p className="text-sm opacity-90">Send us a message anytime</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Visit Us</h3>
                  <p className="text-sm opacity-90">Join us for worship</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
                  <Heart className="w-8 h-8 mx-auto mb-3" />
                  <h3 className="font-semibold mb-2">Prayer Request</h3>
                  <p className="text-sm opacity-90">We&apos;re here to pray with you</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Success/Error Messages */}
        {formSubmitted && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 m-4">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
              <p className="text-green-700 font-medium">
                Thank you for your message! We&apos;ll get back to you soon.
              </p>
            </div>
          </div>
        )}

        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 m-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
              <p className="text-red-700 font-medium">{submitError}</p>
            </div>
          </div>
        )}

        {/* Contact Information Grid */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Get In Touch</h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Whether you&apos;re new to faith or looking for a church home, we&apos;re here to help
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {contactInfo.map((info, index) => {
                const IconComponent = info.icon;
                return (
                  <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <IconComponent className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{info.title}</h3>
                    <div className="space-y-1 mb-4">
                      {info.details.map((detail, idx) => (
                        <p key={idx} className="text-gray-600">{detail}</p>
                      ))}
                    </div>
                    <a
                      href={info.actionLink}
                      className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
                      {...(info.actionLink.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {info.action}
                      <Send className="w-4 h-4 ml-1" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Send Us a Message</h2>
                <p className="text-xl text-gray-600">
                  Have questions or need prayer? We&apos;d love to hear from you
                </p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-8">
                <ContactForm 
                  onSuccess={handleFormSuccess}
                  onError={handleFormError}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Staff Contact Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Meet Our Team</h2>
              <p className="text-xl text-gray-600">
                Connect directly with our pastoral and administrative team
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {staffContacts.map((staff, index) => (
                <div key={index} className="bg-gray-50 rounded-xl p-6 text-center">
                  <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 overflow-hidden">
                    <img
                      src={staff.image}
                      alt={staff.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold" style={{display: 'none'}}>
                      {staff.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">{staff.name}</h3>
                  <p className="text-blue-600 font-medium mb-4">{staff.role}</p>
                  
                  <div className="space-y-2 mb-4">
                    <a
                      href={`tel:${staff.phone}`}
                      className="flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Phone className="w-4 h-4 mr-2" />
                      {staff.phone}
                    </a>
                    <a
                      href={`mailto:${staff.email}`}
                      className="flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      {staff.email}
                    </a>
                  </div>
                  
                  <p className="text-sm text-gray-500">{staff.availability}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Us</h2>
              <p className="text-xl text-gray-600">
                Located in the heart of Ibadan, easy to find and plenty of parking
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 h-96">
                {/* Placeholder for Google Maps embed */}
                <div className="bg-gray-200 flex items-center justify-center">
                  <div className="text-center">
                    <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Interactive map will be embedded here</p>
                    <a
                      href="https://maps.google.com/?q=9VXM%2B797%2C%20107D%20Akintola%20Road%2C%20Ibadan%20200284%2C%20Oyo%20State%2C%20Nigeria"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-blue-50">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
                    <p className="text-gray-600">
                      9VXM+797, 107D Akintola Road<br />
                      Ibadan 200284, Oyo State, Nigeria
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Parking & Accessibility</h3>
                    <p className="text-gray-600">
                      Free parking available<br />
                      Wheelchair accessible<br />
                      Public transport nearby
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Media Section */}
        <section className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect With Us</h2>
              <p className="text-xl text-gray-600">
                Follow us on social media for updates, inspiration, and community
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {socialLinks.map((social, index) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-gray-50 rounded-xl p-6 text-center hover:shadow-lg transition-shadow group"
                  >
                    <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-600 transition-colors">
                      <IconComponent className="w-8 h-8 text-blue-600 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{social.name}</h3>
                    <p className="text-gray-600">{social.followers} followers</p>
                  </a>
                );
              })}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                <p className="text-xl text-gray-600">
                  Common questions from visitors and new members
                </p>
              </div>

              <div className="space-y-6">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>

              <div className="text-center mt-12">
                <p className="text-gray-600 mb-4">Have another question?</p>
                <a
                  href="mailto:havenwordchurch@gmail.com"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Ask Us Anything
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="py-12 bg-red-50 border-t-4 border-red-400">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl font-bold text-red-800 mb-4">Need Immediate Prayer or Help?</h2>
              <p className="text-red-700 mb-6">
                If you&apos;re facing a crisis or need urgent prayer, please don&apos;t hesitate to reach out
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+2348059876543"
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors inline-flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Prayer Line
                </a>
                <a
                  href="mailto:havenwordchurch@gmail.com"
                  className="bg-white text-red-600 border border-red-600 px-6 py-3 rounded-lg hover:bg-red-50 transition-colors inline-flex items-center justify-center"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Prayer Request Email
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;