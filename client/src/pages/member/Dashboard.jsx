import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, Users, BookOpen, Heart, TrendingUp, Bell, Settings, User, ChevronRight, Eye, Download, Share2, MessageCircle, Gift
} from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/ui/Button';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { getDashboard } from '../../services/memberService';

const Dashboard = () => {
  useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getDashboard();
        setDashboardData(data);
      } catch (err) {
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your dashboard..." />
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            variant="primary"
            size="md"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }
  if (!dashboardData) return null;

  const { member, stats, upcomingEvents, recentSermons, givingHistory, notifications, spiritualGrowth } = dashboardData;
  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <>
      <Helmet>
        <title>Dashboard - Haven Word Church</title>
        <meta name="description" content="Your personal church dashboard with attendance, giving, events, and spiritual growth tracking." />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b mt-20 sm:mt-24 md:mt-28">
        <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-gray-300 rounded-full overflow-hidden relative">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  ) : (
                    <div className="avatar-fallback w-full h-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold absolute inset-0">
                      {member.name?.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Welcome back, {member.name?.split(' ')[0] || 'Member'}!</h1>
                  <p className="text-gray-600">Member since {member.membershipDate ? formatDate(member.membershipDate) : 'your registration date'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4 md:mt-0">
                <div className="relative">
                  <Bell className="w-6 h-6 text-gray-600 hover:text-blue-600 cursor-pointer" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </div>
                <Link
                  to="/member/profile"
                  className="flex items-center text-gray-600 hover:text-blue-600"
                >
                  <Settings className="w-5 h-5 mr-1" />
                  Settings
                </Link>
              </div>
            </div>
          </div>
        </div>
        {/* Dashboard Content */}
        <div className="container mx-auto px-4 py-8 pt-20 sm:pt-24 md:pt-28">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{stats.attendanceRate}%</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Attendance Rate</h3>
              <p className="text-sm text-gray-600">{stats.servicesAttended} of {stats.totalServices} services</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-green-600" />
                </div>
                <span className="text-2xl font-bold text-green-600">{formatCurrency(stats.givingThisYear)}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Giving This Year</h3>
              <p className="text-sm text-gray-600">Total contributions</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Heart className="w-6 h-6 text-purple-600" />
                </div>
                <span className="text-2xl font-bold text-purple-600">{stats.prayerRequestsSubmitted}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Prayer Requests</h3>
              <p className="text-sm text-gray-600">Submitted this year</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-orange-100 w-12 h-12 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-orange-600" />
                </div>
                <span className="text-2xl font-bold text-orange-600">{stats.ministryInvolvement}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Ministries</h3>
              <p className="text-sm text-gray-600">Active involvement</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">
              {/* Upcoming Events */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Upcoming Events</h2>
                    <Link
                      to="/events"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {upcomingEvents.length === 0 ? (
                    <div className="text-gray-500 text-center">No upcoming events yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
                        <div key={event._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                            <Calendar className="w-6 h-6 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{event.title}</h3>
                            <p className="text-sm text-gray-600">{formatDate(event.date)} • {event.location}</p>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              event.type === 'service' ? 'bg-green-100 text-green-800' :
                              event.type === 'ministry' ? 'bg-blue-100 text-blue-800' :
                              'bg-purple-100 text-purple-800'
                            }`}>
                              {event.type}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Recent Sermons */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Sermons</h2>
                    <Link
                      to="/sermons"
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center"
                    >
                      View All
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {recentSermons.length === 0 ? (
                    <div className="text-gray-500 text-center">No recent sermons yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {recentSermons.map((sermon) => (
                        <div key={sermon._id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                          <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                            <img
                              src={sermon.thumbnail}
                              alt={sermon.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white" style={{display: 'none'}}>
                              <BookOpen className="w-6 h-6" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{sermon.title}</h3>
                            <p className="text-sm text-gray-600">{sermon.pastor} • {formatDate(sermon.date)}</p>
                            <p className="text-sm text-gray-500">{sermon.duration}</p>
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Giving History */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Giving</h2>
                    <Link className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center" to="/member/my-donations">
                      View History
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  {givingHistory.length === 0 ? (
                    <div className="text-gray-500 text-center">No giving history yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {givingHistory.slice(0, 3).map((giving) => (
                        <div key={giving._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center">
                              <Gift className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{giving.type}</h3>
                              <p className="text-sm text-gray-600">{formatDate(giving.date)} • {giving.method}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">{formatCurrency(giving.amount)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Right Column */}
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
                    {unreadNotifications > 0 && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        {unreadNotifications} new
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  {notifications.length === 0 ? (
                    <div className="text-gray-500 text-center">No notifications yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {notifications.slice(0, 4).map((notification) => (
                        <div
                          key={notification._id}
                          className={`p-4 rounded-lg cursor-pointer transition-colors ${
                            notification.read ? 'bg-gray-50' : 'bg-blue-50 border border-blue-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              notification.type === 'event' ? 'bg-blue-100' :
                              notification.type === 'prayer' ? 'bg-purple-100' :
                              'bg-green-100'
                            }`}>
                              {notification.type === 'event' ? <Calendar className="w-4 h-4 text-blue-600" /> :
                               notification.type === 'prayer' ? <Heart className="w-4 h-4 text-purple-600" /> :
                               <MessageCircle className="w-4 h-4 text-green-600" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm">{notification.title}</h3>
                              <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-500 mt-2">{formatDate(notification.date)}</p>
                            </div>
                            {!notification.read && (
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              {/* Spiritual Growth */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Spiritual Growth</h2>
                </div>
                <div className="p-6">
                  {spiritualGrowth ? (
                    <>
                      {/* Bible Reading Plan */}
                      <div className="mb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-medium text-gray-900">{spiritualGrowth.bibleReadingPlan?.name || 'Bible Reading Plan'}</h3>
                          <span className="text-sm font-medium text-blue-600">{spiritualGrowth.bibleReadingPlan?.progress || 0}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${spiritualGrowth.bibleReadingPlan?.progress || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">Currently reading: {spiritualGrowth.bibleReadingPlan?.currentReading || '-'}</p>
                      </div>
                      {/* Prayer Goals */}
                      <div>
                        <h3 className="font-medium text-gray-900 mb-3">Prayer Goals</h3>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Daily Prayer</span>
                            <div className={`w-4 h-4 rounded-full ${spiritualGrowth.prayerGoals?.dailyPrayer ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Weekly Fasting</span>
                            <div className={`w-4 h-4 rounded-full ${spiritualGrowth.prayerGoals?.weeklyFasting ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Daily Devotional</span>
                            <div className={`w-4 h-4 rounded-full ${spiritualGrowth.prayerGoals?.dailyDevotional ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-gray-500 text-center">No spiritual growth data yet.</div>
                  )}
                </div>
              </div>
              {/* Quick Actions */}
              <div className="bg-white rounded-xl shadow-sm">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-3">
                    <Link
                      to="/member/prayer-request"
                      className="bg-purple-50 text-purple-700 p-4 rounded-lg text-center hover:bg-purple-100 transition-colors"
                    >
                      <Heart className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Prayer Request</span>
                    </Link>
                    <Link
                      to="/events"
                      className="bg-blue-50 text-blue-700 p-4 rounded-lg text-center hover:bg-blue-100 transition-colors"
                    >
                      <Calendar className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">RSVP Event</span>
                    </Link>
                    <Link
                      to="/member/my-donations"
                      className="bg-green-50 text-green-700 p-4 rounded-lg text-center hover:bg-green-100 transition-colors"
                    >
                      <Gift className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Give Online</span>
                    </Link>
                    <Link
                      to="/member/profile"
                      className="bg-orange-50 text-orange-700 p-4 rounded-lg text-center hover:bg-orange-100 transition-colors"
                    >
                      <User className="w-6 h-6 mx-auto mb-2" />
                      <span className="text-sm font-medium">Update Profile</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
