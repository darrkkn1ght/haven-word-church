const mongoose = require('mongoose');
const Ministry = require('./models/Ministry');
require('dotenv').config();

const ministries = [
  {
    name: 'Haven Teens and Children Mission',
    slug: 'haven-teens-and-children-mission',
    type: 'ministry',
    category: 'children',
    tags: ['children', 'teens'],
    description: 'Helping teens and children grow in Christ through fun, interactive activities.',
    detailedDescription: 'Helping teens and children grow in Christ through fun, interactive activities. We provide a safe and engaging environment for spiritual growth and friendship.',
    image: '/api/placeholder/600/400',
    leader: { name: 'Jane Doe', title: 'Children Pastor' },
    contact: {
      phone: '',
      email: ''
    },
    meetingTime: '',
    location: '',
    ageGroup: 'Children & Teens',
    members: null,
    activities: [
      'Bible Stories',
      'Worship Songs',
      'Games',
      'Arts & Crafts'
    ],
    upcomingEvents: []
  },
  {
    name: 'Church Planting Mission',
    slug: 'church-planting-mission',
    type: 'ministry',
    category: 'outreach',
    tags: ['outreach', 'all ages'],
    description: 'Spreading the gospel through new church plants and outreach efforts.',
    detailedDescription: 'Spreading the gospel through new church plants and outreach efforts. We are passionate about reaching new communities for Christ.',
    image: '/api/placeholder/600/400',
    leader: { name: 'John Smith', title: 'Outreach Leader' },
    contact: {
      phone: '',
      email: ''
    },
    meetingTime: '',
    location: '',
    ageGroup: 'All ages',
    members: null,
    activities: [
      'Evangelism',
      'Community Service',
      'Discipleship Training'
    ],
    upcomingEvents: []
  },
  {
    name: 'Flames Mission',
    slug: 'flames-mission',
    type: 'ministry',
    category: 'youth',
    tags: ['youth', 'teens'],
    description: 'Raising a generation of passionate, on-fire youths for Christ.',
    detailedDescription: 'Raising a generation of passionate, on-fire youths for Christ. We empower young people to lead and serve with zeal.',
    image: '/api/placeholder/600/400',
    leader: { name: 'Sarah Johnson', title: 'Youth Pastor' },
    contact: {
      phone: '',
      email: ''
    },
    meetingTime: '',
    location: '',
    ageGroup: 'Teens & Youth',
    members: null,
    activities: [
      'Youth Services',
      'Prayer Meetings',
      'Leadership Training'
    ],
    upcomingEvents: []
  },
  {
    name: 'Campus Fellowship Mission',
    slug: 'campus-fellowship-mission',
    type: 'ministry',
    category: 'fellowship',
    tags: ['students', 'young adults'],
    description: 'Bringing Christ to the campuses and empowering students.',
    detailedDescription: 'Bringing Christ to the campuses and empowering students. We foster spiritual growth and mentorship for students and young adults.',
    image: '/api/placeholder/600/400',
    leader: { name: 'David Lee', title: 'Campus Pastor' },
    contact: {
      phone: '',
      email: ''
    },
    meetingTime: '',
    location: '',
    ageGroup: 'Students & Young Adults',
    members: null,
    activities: [
      'Campus Bible Study',
      'Worship Nights',
      'Mentorship'
    ],
    upcomingEvents: []
  },
  {
    name: 'Anagkazo Mission',
    slug: 'anagkazo-mission',
    type: 'ministry',
    category: 'outreach',
    tags: ['evangelism', 'all ages'],
    description: 'A mission focused on aggressive evangelism and soul winning.',
    detailedDescription: 'A mission focused on aggressive evangelism and soul winning. We are committed to reaching the lost through various outreach events.',
    image: '/api/placeholder/600/400',
    leader: { name: 'Mary Ann', title: 'Evangelism Leader' },
    contact: {
      phone: '',
      email: ''
    },
    meetingTime: '',
    location: '',
    ageGroup: 'All ages',
    members: null,
    activities: [
      'Street Preaching',
      'Gospel Campaigns',
      'Outreach Events'
    ],
    upcomingEvents: []
  }
];

async function seedMinistries() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    await Ministry.deleteMany({});
    await Ministry.insertMany(ministries);
    console.log('✅ Ministries seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error seeding ministries:', err);
    process.exit(1);
  }
}

seedMinistries(); 