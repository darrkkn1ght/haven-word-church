# Haven Word Church API Documentation

## Overview

The Haven Word Church API provides a comprehensive REST API for managing church operations, member engagement, and administrative functions. This API is designed to support both public access and authenticated member/admin features.

**Base URL:** `https://api.havenwordchurch.org`  
**Version:** v1  
**Content-Type:** `application/json`

## Table of Contents

1. [Authentication](#authentication)
2. [Error Handling](#error-handling)
3. [Rate Limiting](#rate-limiting)
4. [Public Endpoints](#public-endpoints)
5. [Authentication Endpoints](#authentication-endpoints)
6. [Member Endpoints](#member-endpoints)
7. [Admin Endpoints](#admin-endpoints)
8. [Webhooks](#webhooks)
9. [SDKs & Libraries](#sdks--libraries)

## Authentication

### JWT Token Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Token Format

```json
{
  "id": "user-id",
  "email": "user@example.com",
  "role": "member|admin|pastor",
  "iat": 1640995200,
  "exp": 1641600000
}
```

### Role-Based Access

- **Public**: No authentication required
- **Member**: Authenticated users with member role
- **Admin**: Authenticated users with admin role
- **Pastor**: Authenticated users with pastor role

## Error Handling

### Standard Error Response

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field": "Field-specific error message"
  },
  "code": "ERROR_CODE",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Validation Error |
| 429 | Rate Limited |
| 500 | Internal Server Error |

### Common Error Codes

| Code | Description |
|------|-------------|
| `INVALID_CREDENTIALS` | Invalid email/password |
| `TOKEN_EXPIRED` | JWT token has expired |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `RESOURCE_NOT_FOUND` | Requested resource not found |
| `DUPLICATE_ENTRY` | Resource already exists |

## Rate Limiting

- **Public endpoints**: 100 requests per minute
- **Authenticated endpoints**: 1000 requests per minute
- **Admin endpoints**: 2000 requests per minute

Rate limit headers are included in responses:

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Public Endpoints

### Get Events

```http
GET /api/events
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `upcoming` (boolean): Show only upcoming events
- `featured` (boolean): Show only featured events

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "_id": "event-id",
        "title": "Sunday Service",
        "description": "Weekly Sunday service",
        "date": "2024-01-07T10:00:00Z",
        "startTime": "10:00",
        "endTime": "12:00",
        "location": {
          "venue": "Main Auditorium",
          "address": "123 Church Street, Lagos"
        },
        "category": "service",
        "isFeatured": true,
        "status": "published"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalEvents": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Sermons

```http
GET /api/sermons
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `series` (string): Filter by sermon series
- `preacher` (string): Filter by preacher
- `featured` (boolean): Show only featured sermons

**Response:**
```json
{
  "success": true,
  "data": {
    "sermons": [
      {
        "_id": "sermon-id",
        "title": "Walking in Faith",
        "description": "A message about faith",
        "preacher": "Pastor Anthonia Amadi",
        "date": "2024-01-07T10:00:00Z",
        "scriptureReference": "Hebrews 11:1",
        "duration": 45,
        "media": {
          "audio": {
            "url": "https://example.com/sermon.mp3",
            "duration": 2700
          }
        },
        "views": 150,
        "downloads": 25
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalSermons": 30,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Get Ministries

```http
GET /api/ministries
```

**Response:**
```json
{
  "success": true,
  "data": {
    "ministries": [
      {
        "_id": "ministry-id",
        "name": "Youth Ministry",
        "description": "Ministry for young people",
        "category": "youth",
        "leader": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "memberCount": 45,
        "meetingSchedule": {
          "frequency": "weekly",
          "dayOfWeek": "friday",
          "time": "18:00"
        }
      }
    ]
  }
}
```

### Get Blog Posts

```http
GET /api/blog
```

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "post-id",
        "title": "Church News Update",
        "excerpt": "Latest updates from our church",
        "content": "Full blog post content...",
        "author": {
          "name": "Pastor Anthonia Amadi",
          "role": "Senior Pastor"
        },
        "publishedAt": "2024-01-01T12:00:00Z",
        "category": "news",
        "tags": ["church", "news", "update"],
        "views": 120
      }
    ]
  }
}
```

## Authentication Endpoints

### Register User

```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "phone": "+2348012345678",
  "dateOfBirth": "1990-01-01",
  "gender": "male",
  "address": "123 Test Street, Lagos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "member",
      "isActive": true,
      "emailVerified": false
    },
    "token": "jwt-token-here"
  }
}
```

### Login User

```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@example.com",
      "role": "member"
    },
    "token": "jwt-token-here"
  }
}
```

### Forgot Password

```http
POST /api/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "john.doe@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### Reset Password

```http
POST /api/auth/reset-password
```

**Request Body:**
```json
{
  "token": "reset-token",
  "password": "NewSecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

### Get Current User

```http
GET /api/auth/me
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "role": "member",
    "phone": "+2348012345678",
    "profilePicture": "https://example.com/avatar.jpg"
  }
}
```

### Update Profile

```http
PUT /api/auth/profile
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+2348098765432",
  "address": "456 Updated Street, Lagos"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user-id",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "+2348098765432",
    "address": "456 Updated Street, Lagos"
  }
}
```

## Member Endpoints

### Get Member Dashboard

```http
GET /api/members/dashboard
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user-id",
      "firstName": "John",
      "lastName": "Doe"
    },
    "stats": {
      "attendanceRate": 85,
      "totalServices": 52,
      "attendedServices": 44,
      "prayerRequests": 5,
      "donations": 150000
    },
    "recentActivity": [
      {
        "type": "attendance",
        "date": "2024-01-07",
        "description": "Attended Sunday Service"
      }
    ],
    "upcomingEvents": [
      {
        "_id": "event-id",
        "title": "Youth Conference",
        "date": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

### Prayer Requests

#### Get Prayer Requests

```http
GET /api/prayers
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prayers": [
      {
        "_id": "prayer-id",
        "title": "Health Prayer",
        "description": "Prayer for good health",
        "category": "personal",
        "urgency": "normal",
        "status": "pending",
        "anonymous": false,
        "createdAt": "2024-01-01T12:00:00Z"
      }
    ]
  }
}
```

#### Create Prayer Request

```http
POST /api/prayers
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "title": "Health Prayer",
  "description": "Prayer for good health",
  "category": "personal",
  "urgency": "normal",
  "anonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "prayer-id",
    "title": "Health Prayer",
    "status": "pending",
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### Attendance

#### Get Attendance History

```http
GET /api/attendance
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "attendance": [
      {
        "_id": "attendance-id",
        "serviceDate": "2024-01-07",
        "serviceType": "Sunday Service",
        "status": "present",
        "recordedAt": "2024-01-07T10:00:00Z"
      }
    ],
    "stats": {
      "totalServices": 52,
      "attended": 44,
      "attendanceRate": 85
    }
  }
}
```

#### Check In

```http
POST /api/attendance/checkin
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "serviceId": "service-id",
  "location": "Main Auditorium"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in successful",
  "data": {
    "attendanceId": "attendance-id",
    "checkInTime": "2024-01-07T10:00:00Z"
  }
}
```

### Donations

#### Get Donation History

```http
GET /api/donations/history
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "_id": "donation-id",
        "amount": 50000,
        "category": "tithe",
        "paymentMethod": "bank_transfer",
        "status": "completed",
        "date": "2024-01-01T12:00:00Z",
        "reference": "TXN123456"
      }
    ],
    "summary": {
      "totalAmount": 150000,
      "totalDonations": 3,
      "thisYear": 150000
    }
  }
}
```

#### Create Donation

```http
POST /api/donations
```

**Headers:**
```http
Authorization: Bearer <jwt-token>
```

**Request Body:**
```json
{
  "amount": 50000,
  "category": "tithe",
  "paymentMethod": "card",
  "description": "Monthly tithe"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "donationId": "donation-id",
    "paymentUrl": "https://checkout.paystack.com/...",
    "reference": "TXN123456"
  }
}
```

## Admin Endpoints

### Get Admin Dashboard

```http
GET /api/admin/dashboard
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalMembers": 250,
      "activeMembers": 200,
      "newMembersThisMonth": 15,
      "totalDonations": 5000000,
      "attendanceRate": 75
    },
    "recentActivity": [
      {
        "type": "new_member",
        "user": "John Doe",
        "date": "2024-01-01T12:00:00Z"
      }
    ],
    "upcomingEvents": [
      {
        "_id": "event-id",
        "title": "Youth Conference",
        "registrations": 45
      }
    ]
  }
}
```

### User Management

#### Get All Users

```http
GET /api/admin/users
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Query Parameters:**
- `page` (number): Page number
- `limit` (number): Items per page
- `role` (string): Filter by role
- `status` (string): Filter by status (active/inactive)
- `search` (string): Search by name or email

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "user-id",
        "firstName": "John",
        "lastName": "Doe",
        "email": "john.doe@example.com",
        "role": "member",
        "isActive": true,
        "lastLogin": "2024-01-01T12:00:00Z",
        "createdAt": "2023-01-01T12:00:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalUsers": 250
    }
  }
}
```

#### Update User Role

```http
PUT /api/admin/users/:userId/role
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "role": "pastor"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user-id",
    "role": "pastor",
    "updatedAt": "2024-01-01T12:00:00Z"
  }
}
```

### Content Management

#### Get All Blog Posts (Admin)

```http
GET /api/admin/blog
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "posts": [
      {
        "_id": "post-id",
        "title": "Church News Update",
        "status": "published",
        "author": "Pastor Anthonia Amadi",
        "publishedAt": "2024-01-01T12:00:00Z",
        "views": 120,
        "moderationStatus": "approved"
      }
    ]
  }
}
```

#### Approve/Reject Content

```http
PUT /api/admin/content/:contentId/moderate
```

**Headers:**
```http
Authorization: Bearer <admin-jwt-token>
```

**Request Body:**
```json
{
  "action": "approve",
  "notes": "Content approved for publication"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "content-id",
    "moderationStatus": "approved",
    "moderatedBy": "admin-id",
    "moderatedAt": "2024-01-01T12:00:00Z"
  }
}
```

## Webhooks

### Paystack Webhook

```http
POST /api/webhooks/paystack
```

**Headers:**
```http
X-Paystack-Signature: <signature>
```

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "TXN123456",
    "amount": 50000,
    "status": "success"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

## SDKs & Libraries

### JavaScript/Node.js

```bash
npm install haven-word-church-api
```

```javascript
const HavenChurchAPI = require('haven-word-church-api');

const api = new HavenChurchAPI({
  baseUrl: 'https://api.havenwordchurch.org',
  token: 'your-jwt-token'
});

// Get events
const events = await api.events.getAll();

// Create prayer request
const prayer = await api.prayers.create({
  title: 'Health Prayer',
  description: 'Prayer for good health'
});
```

### Python

```bash
pip install haven-word-church-api
```

```python
from haven_church_api import HavenChurchAPI

api = HavenChurchAPI(
    base_url='https://api.havenwordchurch.org',
    token='your-jwt-token'
)

# Get events
events = api.events.get_all()

# Create prayer request
prayer = api.prayers.create({
    'title': 'Health Prayer',
    'description': 'Prayer for good health'
})
```

## Support

For API support and questions:

- **Email:** api-support@havenwordchurch.org
- **Documentation:** https://docs.havenwordchurch.org
- **Status Page:** https://status.havenwordchurch.org
- **GitHub:** https://github.com/haven-word-church/api

## Changelog

### v1.0.0 (2024-01-01)
- Initial API release
- Authentication system
- Member management
- Content management
- Payment integration
- Sends confirmation notifications