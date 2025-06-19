# Haven Word Church - Full Stack Web Application

A modern, responsive web application for Haven Word Church built with React.js frontend and Node.js backend.

## 🎨 Design
- **Primary Color**: Deep Blue `#003DA5`
- **Secondary Color**: Bright Orange `#FF6A13`
- **Responsive Design**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant

## 🚀 Features

### Public Features
- **Homepage**: Church mission, vision, and welcome message
- **About Us**: Church history, leadership team, and beliefs
- **Events**: Interactive calendar with RSVP functionality
- **Sermons**: Archive with streaming and download options
- **Ministries**: Overview of church ministries and programs
- **Blog**: Church news, articles, and announcements
- **Contact**: Contact form with integrated map

### Member Area (Secure)
- **Dashboard**: Personalized member dashboard
- **Profile Management**: Update personal information
- **Attendance Tracking**: View attendance history
- **Event RSVPs**: Manage event registrations

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Tailwind CSS** - Styling framework
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Cloudinary** - Media management

## 📁 Project Structure

```
haven-word-church/
├── client/          # React frontend
├── server/          # Node.js backend
├── shared/          # Shared utilities
└── docs/           # Documentation
```

## 🏃‍♂️ Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd haven-word-church
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Set up environment variables**
   - Copy `server/.env.example` to `server/.env`
   - Copy `client/.env.local.example` to `client/.env.local`
   - Fill in your configuration values

4. **Start development servers**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend at `http://localhost:3000`
   - Backend at `http://localhost:5000`

## 📜 Available Scripts

- `npm run dev` - Start both client and server in development mode
- `npm run client` - Start only the frontend
- `npm run server` - Start only the backend
- `npm run build` - Build the client for production
- `npm run install-all` - Install dependencies for both client and server

## 🌐 Deployment

This application is configured for deployment on Render, Heroku, or similar platforms.

### Environment Variables

#### Server (.env)
```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_HOST=your_email_host
EMAIL_PORT=your_email_port
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
```

#### Client (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

## 🌐 Deployment on Render

This project is designed to be deployed on Render using two services:

### 1. Web Service (Node/Express Backend)
- **Root Directory:** `server`
- **Build Command:**
  ```sh
  cd ../client && npm install && npm run build && cd ../server && npm install
  ```
- **Start Command:**
  ```sh
  node server.js
  ```
- This ensures the React app is built before the server starts, and the server can serve static files from `client/build`.

### 2. Static Site (React Frontend)
- **Root Directory:** `client`
- **Build Command:**
  ```sh
  npm install && npm run build
  ```
- **Publish Directory:**
  ```
  build
  ```
- This will serve your React app as a static site directly from the `client/build` folder.

### Important Notes
- The backend serves API requests and can also serve the React build for SSR or fallback.
- The static site serves the React frontend directly for best performance.
- In your React app, set API URLs to the backend service URL (not relative `/api`).
- Make sure both services are deployed and running on Render for full functionality.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support or questions, please contact the Haven Word Church development team.

---

Built with ❤️ for Haven Word Church