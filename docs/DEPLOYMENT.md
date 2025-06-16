# Haven Word Church - Deployment Guide

## Overview

This guide covers deploying the Haven Word Church full-stack application to production environments. The application consists of a React frontend, Node.js/Express backend, and MongoDB database.

## Prerequisites

Before deploying, ensure you have:
- Node.js 18+ installed
- MongoDB database (local or cloud)
- Domain name (optional but recommended)
- SSL certificate (for HTTPS)
- Paystack account for payment processing

## Environment Setup

### Required Environment Variables

Create a `.env` file in the server directory with the following variables:

```bash
# Application
NODE_ENV=production
PORT=5000

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/haven-word-church

# Authentication
JWT_SECRET=your-super-secure-jwt-secret-key-here
JWT_EXPIRES_IN=7d

# Payment Processing (Paystack)
PAYSTACK_SECRET_KEY=sk_live_your_paystack_secret_key
PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key

# Email (Optional - for notifications)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# File Upload (Optional)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret

# CORS Origins
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Client Environment Variables

Create a `.env` file in the client directory:

```bash
# API Configuration
REACT_APP_API_URL=https://api.yourdomain.com
REACT_APP_API_VERSION=v1

# Payment
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_live_your_paystack_public_key

# Google Maps (Optional)
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-key

# Analytics (Optional)
REACT_APP_GA_TRACKING_ID=your-google-analytics-id
```

## Deployment Options

### Option 1: Traditional VPS/Server Deployment

#### 1. Server Setup (Ubuntu 20.04+)

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Install MongoDB (if hosting locally)
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod
```

#### 2. Application Deployment

```bash
# Clone repository
git clone https://github.com/yourusername/haven-word-church.git
cd haven-word-church

# Install dependencies
npm install
cd client && npm install && cd ..
cd server && npm install && cd ..

# Build client
cd client
npm run build
cd ..

# Set up environment variables
cp server/.env.example server/.env
# Edit server/.env with your production values

# Start server with PM2
cd server
pm2 start npm --name "haven-word-church-api" -- start
pm2 save
pm2 startup
```

#### 3. Nginx Configuration

Create `/etc/nginx/sites-available/haven-word-church`:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;

    # Serve React app
    location / {
        root /path/to/haven-word-church/client/build;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
        
        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # API proxy
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Increase timeout for large requests
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types
        application/atom+xml
        application/javascript
        application/json
        application/rss+xml
        application/vnd.ms-fontobject
        application/x-font-ttf
        application/x-web-app-manifest+json
        application/xhtml+xml
        application/xml
        font/opentype
        image/svg+xml
        image/x-icon
        text/css
        text/plain
        text/x-component;
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/haven-word-church /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add this line:
# 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Heroku Deployment

#### 1. Prepare Application

Create `Procfile` in root directory:
```
web: cd server && npm start
```

Create `package.json` in root directory:
```json
{
  "name": "haven-word-church",
  "version": "1.0.0",
  "scripts": {
    "build": "cd client && npm install && npm run build",
    "start": "cd server && npm start",
    "heroku-postbuild": "npm run build"
  },
  "engines": {
    "node": "18.x"
  }
}
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI
# Create Heroku app
heroku create haven-word-church-app

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret
heroku config:set PAYSTACK_SECRET_KEY=your-paystack-secret
heroku config:set PAYSTACK_PUBLIC_KEY=your-paystack-public

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Scale dynos
heroku ps:scale web=1
```

### Option 3: Vercel + Railway Deployment

#### Frontend (Vercel)

1. Connect your GitHub repository to Vercel
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/build`
4. Add environment variables in Vercel dashboard

#### Backend (Railway)

1. Connect your GitHub repository to Railway
2. Set root directory: `server`
3. Add environment variables in Railway dashboard
4. Deploy automatically on push

### Option 4: Docker Deployment

#### Dockerfile (Server)

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodeuser -u 1001

USER nodeuser

EXPOSE 5000

CMD ["npm", "start"]
```

#### Dockerfile (Client)

```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  client:
    build: ./client
    ports:
      - "3000:80"
    depends_on:
      - server

  server:
    build: ./server
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - MONGODB_URI=mongodb://mongo:27017/haven-word-church
      - JWT_SECRET=${JWT_SECRET}
      - PAYSTACK_SECRET_KEY=${PAYSTACK_SECRET_KEY}
    depends_on:
      - mongo

  mongo:
    image: mongo:6.0
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## Database Setup

### MongoDB Atlas (Recommended)

1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create new cluster
3. Set up database user
4. Whitelist IP addresses
5. Get connection string
6. Update `MONGODB_URI` in environment variables

### Local MongoDB Setup

```bash
# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create database and user
mongo
use haven-word-church
db.createUser({
  user: "haven_user",
  pwd: "secure_password",
  roles: ["readWrite"]
})
```

## Security Configuration

### 1. Environment Security

```bash
# Set proper file permissions
chmod 600 .env
chown root:root .env

# Use environment variable management
# Consider using tools like:
# - HashiCorp Vault
# - AWS Systems Manager Parameter Store
# - Azure Key Vault
```

### 2. Database Security

```javascript
// In server/config/database.js
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  authSource: 'admin',
  ssl: true,
  sslValidate: true
});
```

### 3. API Security Headers

Already implemented in the server middleware:
- Helmet.js for security headers
- CORS configuration
- Rate limiting
- Input validation
- JWT authentication

## Monitoring and Logging

### 1. Application Monitoring

```bash
# Install monitoring tools
npm install -g @pm2/pm2-plus

# Monitor with PM2
pm2 monitor

# Set up log rotation
pm2 install pm2-logrotate
```

### 2. Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- New Relic for performance monitoring

### 3. Uptime Monitoring

Set up monitoring with:
- Pingdom
- UptimeRobot
- StatusCake

## Backup Strategy

### 1. Database Backup

```bash
# Daily MongoDB backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri="$MONGODB_URI" --out="/backups/mongodb_$DATE"
tar -czf "/backups/mongodb_$DATE.tar.gz" "/backups/mongodb_$DATE"
rm -rf "/backups/mongodb_$DATE"

# Keep only last 7 days
find /backups -name "mongodb_*.tar.gz" -mtime +7 -delete
```

### 2. File Backup

```bash
# Application backup
tar -czf "/backups/app_$(date +%Y%m%d).tar.gz" /path/to/haven-word-church
```

### 3. Automated Backups

Set up cron jobs:
```bash
# Daily database backup at 2 AM
0 2 * * * /path/to/backup-script.sh

# Weekly full backup at 3 AM Sunday
0 3 * * 0 /path/to/full-backup-script.sh
```

## Performance Optimization

### 1. Client-Side Optimization

- Enable gzip compression
- Use CDN for static assets
- Implement code splitting
- Optimize images
- Enable browser caching

### 2. Server-Side Optimization

```javascript
// In server/app.js
const compression = require('compression');
app.use(compression());

// Database indexing
// In your models, add indexes for frequently queried fields
userSchema.index({ email: 1 });
eventSchema.index({ date: 1, category: 1 });
```

### 3. Database Optimization

```javascript
// MongoDB optimization
db.users.createIndex({ "email": 1 }, { unique: true })
db.events.createIndex({ "date": 1, "category": 1 })
db.testimonies.createIndex({ "approved": 1, "createdAt": -1 })
```

## Scaling Considerations

### 1. Horizontal Scaling

- Use load balancers (Nginx, HAProxy)
- Deploy multiple server instances
- Implement session management (Redis)
- Use database read replicas

### 2. Vertical Scaling

- Monitor resource usage
- Scale server resources as needed
- Optimize database queries
- Implement caching strategies

## Maintenance

### 1. Regular Updates

```bash
# Update dependencies
npm update
npm audit fix

# Update system packages
sudo apt update && sudo apt upgrade
```

### 2. Health Checks

```bash
# Check application status
pm2 status
pm2 logs

# Check database status
systemctl status mongod

# Check Nginx status
systemctl status nginx
```

### 3. Log Management

```bash
# Clean old logs
find /var/log -name "*.log" -mtime +30 -delete

# Monitor disk usage
df -h
du -sh /var/log/*
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo lsof -i :5000
   sudo kill -9 <PID>
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER /path/to/project
   chmod +x scripts/*
   ```

3. **Database connection failed**
   - Check MongoDB service status
   - Verify connection string
   - Check firewall settings

4. **SSL certificate issues**
   ```bash
   sudo certbot renew --dry-run
   sudo systemctl reload nginx
   ```

### Log Locations

- Application logs: `~/.pm2/logs/`
- Nginx logs: `/var/log/nginx/`
- MongoDB logs: `/var/log/mongodb/`
- System logs: `/var/log/syslog`

## Support

For deployment issues:
1. Check application logs
2. Verify environment variables
3. Test database connectivity
4. Review Nginx configuration
5. Check SSL certificate status

Contact the development team with:
- Error messages
- Log excerpts
- Environment details
- Steps to reproduce

## Checklist

Before going live:

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] SSL certificate installed
- [ ] Domain DNS configured
- [ ] Payment gateway tested
- [ ] Backup strategy implemented
- [ ] Monitoring set up
- [ ] Security headers configured
- [ ] Performance optimized
- [ ] Error tracking enabled
- [ ] Admin users created
- [ ] Email notifications working
- [ ] Mobile responsiveness tested
- [ ] Cross-browser compatibility verified

---

**Remember:** Always test your deployment in a staging environment before going live with production!