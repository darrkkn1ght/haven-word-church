# Haven Word Church - API Documentation

## Overview

The Haven Word Church API provides endpoints for managing church operations including events, testimonies, prayer requests, donations, and user authentication. The API follows REST principles and returns JSON responses.

**Base URL:** `http://localhost:5000/api` (development)  
**API Version:** v1  
**Content-Type:** `application/json`

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. Register/Login to receive JWT token
2. Include token in subsequent requests
3. Token expires after 7 days

## Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information (development only)"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "phone": "+234 803 123 4567"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+234 803 123 4567",
      "role": "member",
      "createdAt": "2025-06-16T10:30:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "member"
    },
    "token": "jwt_token_here"
  }
}
```

#### Get Current User
```http
GET /api/auth/me
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "+234 803 123 4567",
      "role": "member",
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

### Events

#### Get All Events
```http
GET /api/events
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `category` (optional) - Filter by category
- `upcoming` (optional) - Filter upcoming events (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": "event_id",
        "title": "Sunday Service",
        "description": "Weekly worship service",
        "date": "2025-06-22T08:00:00.000Z",
        "time": "08:00",
        "location": "Haven Word Church, Ibadan",
        "category": "worship",
        "capacity": 500,
        "registeredCount": 250,
        "createdAt": "2025-06-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Single Event
```http
GET /api/events/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "event": {
      "id": "event_id",
      "title": "Sunday Service",
      "description": "Weekly worship service",
      "date": "2025-06-22T08:00:00.000Z",
      "time": "08:00",
      "location": "Haven Word Church, Ibadan",
      "category": "worship",
      "capacity": 500,
      "registeredCount": 250,
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

#### Create Event
```http
POST /api/events
```
*Requires Authentication (Admin/Pastor)*

**Request Body:**
```json
{
  "title": "Prayer Night",
  "description": "Special prayer session for the community",
  "date": "2025-06-25T19:00:00.000Z",
  "time": "19:00",
  "location": "Haven Word Church, Ibadan",
  "category": "prayer",
  "capacity": 200
}
```

**Response:**
```json
{
  "success": true,
  "message": "Event created successfully",
  "data": {
    "event": {
      "id": "new_event_id",
      "title": "Prayer Night",
      "description": "Special prayer session for the community",
      "date": "2025-06-25T19:00:00.000Z",
      "time": "19:00",
      "location": "Haven Word Church, Ibadan",
      "category": "prayer",
      "capacity": 200,
      "registeredCount": 0,
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

#### Register for Event
```http
POST /api/events/:id/register
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "Successfully registered for event",
  "data": {
    "registration": {
      "id": "registration_id",
      "eventId": "event_id",
      "userId": "user_id",
      "registeredAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

### Testimonies

#### Get All Testimonies
```http
GET /api/testimonies
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `approved` (optional) - Filter by approval status

**Response:**
```json
{
  "success": true,
  "data": {
    "testimonies": [
      {
        "id": "testimony_id",
        "title": "God's Faithfulness",
        "content": "I want to share how God has been faithful...",
        "author": {
          "name": "John Doe",
          "id": "user_id"
        },
        "approved": true,
        "createdAt": "2025-06-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 25,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Create Testimony
```http
POST /api/testimonies
```
*Requires Authentication*

**Request Body:**
```json
{
  "title": "Healing Testimony",
  "content": "I want to share how God healed me from illness..."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Testimony submitted successfully",
  "data": {
    "testimony": {
      "id": "new_testimony_id",
      "title": "Healing Testimony",
      "content": "I want to share how God healed me from illness...",
      "author": {
        "name": "John Doe",
        "id": "user_id"
      },
      "approved": false,
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

#### Approve Testimony
```http
PUT /api/testimonies/:id/approve
```
*Requires Authentication (Admin/Pastor)*

**Response:**
```json
{
  "success": true,
  "message": "Testimony approved successfully"
}
```

### Prayer Requests

#### Get All Prayer Requests
```http
GET /api/prayer-requests
```

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `category` (optional) - Filter by category
- `urgent` (optional) - Filter urgent requests (true/false)

**Response:**
```json
{
  "success": true,
  "data": {
    "prayerRequests": [
      {
        "id": "prayer_request_id",
        "title": "Prayer for Healing",
        "description": "Please pray for my mother's recovery",
        "category": "health",
        "urgent": true,
        "anonymous": false,
        "author": {
          "name": "John Doe",
          "id": "user_id"
        },
        "prayedCount": 15,
        "createdAt": "2025-06-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 4,
      "totalItems": 35,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Create Prayer Request
```http
POST /api/prayer-requests
```
*Requires Authentication*

**Request Body:**
```json
{
  "title": "Prayer for Job",
  "description": "Please pray for me as I search for employment",
  "category": "career",
  "urgent": false,
  "anonymous": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Prayer request submitted successfully",
  "data": {
    "prayerRequest": {
      "id": "new_prayer_request_id",
      "title": "Prayer for Job",
      "description": "Please pray for me as I search for employment",
      "category": "career",
      "urgent": false,
      "anonymous": false,
      "author": {
        "name": "John Doe",
        "id": "user_id"
      },
      "prayedCount": 0,
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

#### Add Prayer
```http
POST /api/prayer-requests/:id/pray
```
*Requires Authentication*

**Response:**
```json
{
  "success": true,
  "message": "Prayer added successfully",
  "data": {
    "prayedCount": 16
  }
}
```

### Donations

#### Get All Donations
```http
GET /api/donations
```
*Requires Authentication (Admin/Pastor)*

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `purpose` (optional) - Filter by purpose
- `status` (optional) - Filter by status

**Response:**
```json
{
  "success": true,
  "data": {
    "donations": [
      {
        "id": "donation_id",
        "amount": 50000,
        "currency": "NGN",
        "purpose": "tithe",
        "donor": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "status": "completed",
        "paymentMethod": "paystack",
        "reference": "ps_ref_123456",
        "createdAt": "2025-06-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 95,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Create Donation
```http
POST /api/donations
```
*Requires Authentication*

**Request Body:**
```json
{
  "amount": 25000,
  "currency": "NGN",
  "purpose": "offering",
  "donorName": "John Doe",
  "donorEmail": "john@example.com",
  "donorPhone": "+234 803 123 4567",
  "paymentMethod": "paystack"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation initiated successfully",
  "data": {
    "donation": {
      "id": "new_donation_id",
      "amount": 25000,
      "currency": "NGN",
      "purpose": "offering",
      "status": "pending",
      "paymentUrl": "https://checkout.paystack.com/...",
      "reference": "ps_ref_789012",
      "createdAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

#### Verify Donation
```http
POST /api/donations/verify
```

**Request Body:**
```json
{
  "reference": "ps_ref_789012"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Donation verified successfully",
  "data": {
    "donation": {
      "id": "donation_id",
      "amount": 25000,
      "currency": "NGN",
      "purpose": "offering",
      "status": "completed",
      "reference": "ps_ref_789012",
      "verifiedAt": "2025-06-16T10:35:00.000Z"
    }
  }
}
```

### User Management

#### Get All Users
```http
GET /api/users
```
*Requires Authentication (Admin)*

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `role` (optional) - Filter by role

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "user_id",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "+234 803 123 4567",
        "role": "member",
        "createdAt": "2025-06-16T10:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 8,
      "totalItems": 75,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Update User Role
```http
PUT /api/users/:id/role
```
*Requires Authentication (Admin)*

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
  "message": "User role updated successfully",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "pastor",
      "updatedAt": "2025-06-16T10:30:00.000Z"
    }
  }
}
```

## Data Models

### User Roles
- `admin` - Full system access
- `pastor` - Can manage events, approve testimonies
- `member` - Basic user access

### Event Categories
- `worship` - Worship services
- `prayer` - Prayer meetings
- `fellowship` - Fellowship gatherings
- `conference` - Conferences and seminars
- `outreach` - Community outreach
- `youth` - Youth programs
- `children` - Children's programs

### Prayer Request Categories
- `health` - Health and healing
- `family` - Family matters
- `career` - Career and employment
- `spiritual` - Spiritual growth
- `financial` - Financial needs
- `general` - General requests

### Donation Purposes
- `tithe` - Tithe payments
- `offering` - General offerings
- `building` - Building fund
- `missions` - Missions support
- `welfare` - Welfare assistance
- `special` - Special projects

## Nigerian Context

### Timezone
All timestamps are stored in UTC but should be displayed in West Africa Time (WAT, UTC+1) for Nigerian users.

### Currency
- Primary currency: Nigerian Naira (NGN)
- Minimum donation amount: ₦1,000
- Maximum donation amount: ₦10,000,000

### Phone Numbers
Phone numbers should be in Nigerian format: `+234 XXX XXX XXXX`

### Payment Integration
The API integrates with Paystack for payment processing, which is optimized for Nigerian users and supports:
- Bank transfers
- Card payments
- USSD
- Bank deposits

## Rate Limiting

- Authentication endpoints: 5 requests per minute
- General endpoints: 100 requests per minute
- File upload endpoints: 10 requests per minute

## Development Notes

### Testing
Use the following test credentials for development:
- **Admin User:** admin@havenword.com / AdminPass123!
- **Pastor User:** pastor@havenword.com / PastorPass123!
- **Member User:** member@havenword.com / MemberPass123!

### Environment Variables
Required environment variables:
- `NODE_ENV`
- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_PUBLIC_KEY`

### Webhooks
Paystack webhook endpoint: `POST /api/donations/webhook`
- Verifies payment completion
- Updates donation status
- Sends confirmation notifications