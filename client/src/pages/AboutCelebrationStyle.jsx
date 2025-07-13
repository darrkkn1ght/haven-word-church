import React from 'react';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import Button from '../components/ui/Button';

const heroImg = 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=1200&q=80';
const openViewImg = 'https://images.unsplash.com/photo-1503676382389-4809596d5290?auto=format&fit=crop&w=1440&q=80';
const pasteyImg = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=600&q=80';

export default function AboutCelebrationStyle() {
  return (
    <div className="bg-white dark:bg-gray-950 min-h-screen flex flex-col">
      <Header />
      {/* Hero Section */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
        <img src={heroImg} alt="About Hero" className="absolute inset-0 w-full h-full object-cover z-0" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary-900/80 via-primary-900/60 to-primary-700/80 z-10" />
        <div className="relative z-20 flex flex-col items-center text-center w-full px-4">
          <span className="rounded-full bg-primary-700/80 text-white text-xs uppercase font-bold tracking-widest px-4 py-2 mb-4 shadow-lg">🌍 The Family at Haven Word</span>
          <h1 className="font-accent text-4xl md:text-6xl font-bold uppercase text-white mb-4 leading-tight drop-shadow-xl">
            In Christ, For Christ,<br />
            <span className="bg-gradient-to-r from-secondary-500 to-primary-300 bg-clip-text text-transparent">With Joy!</span>
          </h1>
        </div>
      </section>

      {/* Vision/Mission Section */}
      <section className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-2 gap-12 px-6 py-12">
        <div>
          <h2 className="font-accent text-3xl md:text-5xl mb-6 text-primary-700 dark:text-white">WE SERVE GOD <span className="block text-secondary-500">BY HIS SPIRIT</span></h2>
        </div>
        <div className="text-gray-700 dark:text-gray-200 text-justify md:text-left">
          <p className="mb-6">Haven Word Church is a mission-minded teaching ministry. Our vision is to see all people celebrate endless life in Christ Jesus and fully embrace the power of His death, burial, and resurrection.<br /><br />We are committed to knowing Christ deeply and making Him known across the world. We nurture spiritual growth through in-depth teaching, powerful prayer, and outreach programs, empowering believers to live out their faith boldly. Our services are marked by the gifts of the Spirit, where prayer, prophecies, and spiritual songs flow freely in an atmosphere of worship.</p>
          <p>We hold firmly to the Word of God as the ultimate standard for doctrine, and we believe that the greatest demonstration of God&apos;s love is found in the redemptive work of Christ. Through His grace, we are blessed and righteous in His sight.<br /><br />Under our leadership, Haven Word Church is growing into a global ministry. We are the hands and feet of Christ, spreading the gospel to the uttermost parts of the earth. A billion souls, in 10,000 cities!</p>
        </div>
      </section>

      {/* Beliefs Section */}
      <section className="bg-primary-50 dark:bg-primary-900 py-12 px-4">
        <div className="max-w-3xl mx-auto bg-white dark:bg-primary-800 rounded-2xl shadow-lg p-8 md:p-12">
          <h4 className="font-accent text-3xl md:text-5xl mb-6 uppercase">We <span className="text-secondary-500">Believe</span></h4>
          <ul className="space-y-4 text-gray-700 dark:text-gray-200">
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary-500"></span>
              <span>The gifts of the Spirit are at work in the life of the believer, so our services are an experience of the uninhibited flow of the Spirit through prayer, prophecies, and spiritual songs.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary-500"></span>
              <span>The Word of God is the ultimate standard for doctrine.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary-500"></span>
              <span>The Father&apos;s biggest display of affection towards us is in the redemptive work of Christ.</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 w-2 h-2 rounded-full bg-primary-500"></span>
              <span>We are blessed because righteousness is credited to us through the grace of our Lord Jesus Christ.</span>
            </li>
          </ul>
        </div>
      </section>

      {/* Approach Section */}
      <section className="bg-white dark:bg-gray-950 px-1 py-12 md:py-16">
        <h2 className="text-center font-accent text-2xl md:text-4xl mb-2 text-primary-700 dark:text-white">Our Approach</h2>
        <p className="mt-2 text-center text-sm text-gray-700 dark:text-gray-200 md:text-lg mb-8">Celebrating endless life in Christ Jesus demands that you:</p>
        <div className="mx-auto mt-8 flex max-w-7xl flex-wrap justify-center gap-6">
          {[{
            title: 'Know it',
            desc: 'The word of God is emphasized to ensure every member knows and understands the lordship of Jesus, and experiences progress and joy in the faith.',
            img: 'https://images.unsplash.com/photo-1465101178521-c1a9136a3b99?auto=format&fit=crop&w=100&q=80',
          }, {
            title: 'Live it',
            desc: 'Your life should reflect the death and resurrection of Jesus Christ every single day. It’s not enough to simply know that Jesus is Lord—you must live out that truth in everything you do.',
            img: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=100&q=80',
          }, {
            title: 'Tell it',
            desc: 'Celebrating the finished work of Jesus means sharing it with the world. We are called to boldly proclaim His love and grace to as many people as we can.',
            img: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=100&q=80',
          }].map((item, idx) => (
            <div key={idx} className="w-full max-w-[346px] space-y-4 bg-primary-50 dark:bg-primary-900 rounded-2xl shadow p-6 flex flex-col items-center">
              <img src={item.img} alt={item.title} className="w-12 h-12 rounded-full object-cover" />
              <h3 className="text-2xl font-medium text-primary-700 dark:text-white">{item.title}</h3>
              <p className="text-gray-700 dark:text-gray-200">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Open View Image Section */}
      <section className="my-16">
        <img src={openViewImg} alt="Open View" className="mx-auto w-full max-w-screen-2xl md:h-full rounded-2xl shadow-lg" />
      </section>

      {/* Lead Pastor Section */}
      <section className="relative bg-primary-900 py-16 px-4 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-1 bg-cover bg-center rounded-2xl h-80 md:h-[400px] w-full md:w-1/2" style={{ backgroundImage: `url(${pasteyImg})` }}></div>
        <div className="flex-1 max-w-xl mx-auto text-white">
          <img src="/logo.jpeg" alt="Logo" className="mb-6 h-10 w-auto" />
          <h2 className="text-2xl font-black uppercase tracking-widest mb-4">Our Lead Pastor</h2>
          <p className="font-medium leading-7 mb-6">Apostle Emmanuel Iren is the visionary founder and Lead Pastor of Celebration Church International (CCI), a fast-growing global ministry... (replace with your own pastor&apos;s info)</p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mx-auto mt-4 block rounded-full border border-white bg-transparent px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white hover:bg-white hover:text-primary-900 transition"
          >
            Read More
          </Button>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-white dark:bg-gray-950 px-1 py-12 md:py-16">
        <h5 className="mx-auto w-fit rounded-full bg-primary-100 px-4 py-1.5 text-center text-xs font-bold tracking-widest text-primary-700">📖 MEMBER STORIES</h5>
        <h6 className="my-2 text-center text-2xl font-black tracking-wide md:mt-5 md:text-4xl text-primary-700 dark:text-white">MY HAVEN WORD EXPERIENCE</h6>
        <p className="mb-2 text-center text-xl text-gray-700 dark:text-gray-200">Real people, Endless Life</p>
        <div className="mx-auto my-4 max-w-7xl text-center md:my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[{
            name: 'Ogochukwu',
            title: 'Impartation of Spiritual Gifts',
            text: 'I just realized I&apos;ve been living my testimony all year. It started during a live stream... Glory to God!!!',
          }, {
            name: 'Harry',
            title: 'El Roi',
            text: 'Last year December I have been attending for midweek services and really enjoyed my time there... I can&apos;t wait for another camp, and I pray to be there live.',
          }, {
            name: 'Tere',
            title: 'Divine Healing',
            text: 'I want to share this testimony because it shows how much God pays attention to us. And how he can remove obstacles that hinder us from fellowshipping with him... Glory to Jesus, our intentional God!',
          }].map((t, idx) => (
            <div key={idx} className="bg-primary-50 dark:bg-primary-900 rounded-2xl shadow p-6 flex flex-col items-center">
              <h3 className="mb-2 text-lg font-semibold text-primary-700 dark:text-white">{t.title}</h3>
              <p className="my-1 text-gray-700 dark:text-gray-200">{t.text}</p>
              <p className="font-semibold text-primary-500 dark:text-secondary-500 mt-2">{t.name}</p>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
