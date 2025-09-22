# API Specification

> **Real-time Scoreboard API v1.0**  
> RESTful API for managing user scores and real-time leaderboard updates

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Core API Endpoints](#core-api-endpoints)
3. [WebSocket API](#websocket-api)
4. [Request/Response Schemas](#request-response-schemas)
5. [Rate Limiting](#rate-limiting)
6. [Error Handling](#error-handling)
7. [Security Headers](#security-headers)

## 🔐 Authentication

### JWT Token Structure
```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "user-uuid",
    "email": "user@example.com",
    "role": "user|moderator|admin",
    "iat": 1640995200,
    "exp": 1640996100,
    "iss": "scoreboard-api",
    "aud": "scoreboard-client"
  }
}
```

### Authentication Endpoints

#### POST /api/auth/login
**Description**: Authenticate user and receive JWT tokens

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "rt_7f9a8b6c5d4e3f2g1h0i9j8k7l6m5n4o",
    "expiresIn": 900,
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "user@example.com",
      "username": "john_doe",
      "role": "user"
    }
  }
}
```

#### POST /api/auth/refresh
**Description**: Refresh access token using refresh token

**Request Body**:
```json
{
  "refreshToken": "rt_7f9a8b6c5d4e3f2g1h0i9j8k7l6m5n4o"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 900
  }
}
```

#### POST /api/auth/logout
**Description**: Revoke refresh token and invalidate session

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully logged out"
}
```

## 🔌 Core API Endpoints

### Leaderboard Endpoints

#### GET /api/leaderboard
**Description**: Get current top 10 leaderboard

**Query Parameters**:
- `period`: `daily|weekly|monthly|all-time` (default: `all-time`)
- `limit`: Number of results (max: 100, default: 10)

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "user": {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "username": "top_player",
          "firstName": "John",
          "lastName": "Doe"
        },
        "score": 15420,
        "lastUpdated": "2025-01-15T14:30:00Z"
      }
    ],
    "period": "all-time",
    "totalUsers": 5432,
    "lastRefresh": "2025-01-15T14:30:15Z"
  }
}
```

#### GET /api/leaderboard/user/{userId}
**Description**: Get specific user's ranking and nearby players

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "userRank": {
      "rank": 245,
      "score": 3250,
      "user": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "player123",
        "firstName": "Jane",
        "lastName": "Smith"
      }
    },
    "nearby": [
      {
        "rank": 243,
        "score": 3280,
        "user": { "username": "player_above" }
      },
      {
        "rank": 247,
        "score": 3210,
        "user": { "username": "player_below" }
      }
    ]
  }
}
```

### Score Management Endpoints

#### POST /api/scores/update
**Description**: Update user score (requires authentication)

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scoreChange": 100,
  "actionType": "level_completion",
  "actionSource": "level_15",
  "metadata": {
    "level": 15,
    "timeCompleted": "2025-01-15T14:30:00Z",
    "accuracy": 95.5
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "newScore": 3350,
    "previousScore": 3250,
    "scoreChange": 100,
    "newRank": 240,
    "previousRank": 245,
    "timestamp": "2025-01-15T14:30:15Z"
  }
}
```

#### GET /api/scores/history/{userId}
**Description**: Get user's score history

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `limit`: Number of records (max: 100, default: 20)
- `offset`: Pagination offset (default: 0)
- `startDate`: ISO date string
- `endDate`: ISO date string

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "hist_550e8400-e29b-41d4-a716-446655440000",
        "scoreChange": 100,
        "scoreBefore": 3250,
        "scoreAfter": 3350,
        "actionType": "level_completion",
        "actionSource": "level_15",
        "timestamp": "2025-01-15T14:30:15Z"
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

### User Management Endpoints

#### GET /api/users/profile
**Description**: Get current user's profile and score summary

**Headers**:
```
Authorization: Bearer <access_token>
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "username": "john_doe",
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "createdAt": "2025-01-01T00:00:00Z"
    },
    "scoreInfo": {
      "currentScore": 3350,
      "lifetimeScore": 15420,
      "currentRank": 240,
      "bestRank": 180,
      "lastUpdated": "2025-01-15T14:30:15Z"
    }
  }
}
```

### Admin Endpoints

#### GET /api/admin/users
**Description**: Get all users with pagination (admin only)

**Headers**:
```
Authorization: Bearer <access_token>
```

**Query Parameters**:
- `limit`: Number of users (max: 100, default: 20)
- `offset`: Pagination offset (default: 0)
- `search`: Search by username or email
- `role`: Filter by role
- `isActive`: Filter by active status

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "username": "john_doe",
        "email": "john@example.com",
        "role": "user",
        "isActive": true,
        "currentScore": 3350,
        "currentRank": 240,
        "lastActivity": "2025-01-15T14:30:15Z"
      }
    ],
    "pagination": {
      "total": 5432,
      "limit": 20,
      "offset": 0,
      "hasMore": true
    }
  }
}
```

#### PUT /api/admin/users/{userId}/score
**Description**: Manually adjust user score (admin/moderator only)

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "scoreChange": -500,
  "reason": "score_correction",
  "adminNote": "Correcting duplicate level completion bug"
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "data": {
    "newScore": 2850,
    "previousScore": 3350,
    "scoreChange": -500,
    "adjustedBy": "admin_user_id",
    "reason": "score_correction",
    "timestamp": "2025-01-15T14:35:00Z"
  }
}
```

## 🌐 WebSocket API

### Connection Establishment
```javascript
const socket = io('wss://api.scoreboard.com', {
  auth: {
    token: 'jwt_access_token'
  }
});
```

### Event Types

#### Client Events

##### subscribe_leaderboard
**Description**: Subscribe to real-time leaderboard updates

```javascript
socket.emit('subscribe_leaderboard', {
  period: 'all-time'  // optional: daily, weekly, monthly, all-time
});
```

##### unsubscribe_leaderboard
**Description**: Unsubscribe from leaderboard updates

```javascript
socket.emit('unsubscribe_leaderboard');
```

##### subscribe_user_updates
**Description**: Subscribe to personal score updates

```javascript
socket.emit('subscribe_user_updates', {
  userId: '550e8400-e29b-41d4-a716-446655440000'
});
```

#### Server Events

##### leaderboard_update
**Description**: Real-time leaderboard update

```javascript
socket.on('leaderboard_update', (data) => {
  console.log(data);
  /*
  {
    "type": "leaderboard_update",
    "data": {
      "leaderboard": [...],  // Top 10 users
      "changes": [
        {
          "userId": "user_id",
          "oldRank": 5,
          "newRank": 3,
          "scoreChange": 200
        }
      ],
      "timestamp": "2025-01-15T14:30:15Z"
    }
  }
  */
});
```

##### user_score_update
**Description**: Personal score update notification

```javascript
socket.on('user_score_update', (data) => {
  console.log(data);
  /*
  {
    "type": "user_score_update",
    "data": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "newScore": 3350,
      "scoreChange": 100,
      "newRank": 240,
      "previousRank": 245,
      "timestamp": "2025-01-15T14:30:15Z"
    }
  }
  */
});
```

##### rank_achievement
**Description**: Rank milestone notification

```javascript
socket.on('rank_achievement', (data) => {
  console.log(data);
  /*
  {
    "type": "rank_achievement",
    "data": {
      "userId": "550e8400-e29b-41d4-a716-446655440000",
      "achievement": "top_100",
      "newRank": 97,
      "timestamp": "2025-01-15T14:30:15Z"
    }
  }
  */
});
```

##### connection_status
**Description**: Connection status updates

```javascript
socket.on('connection_status', (data) => {
  console.log(data);
  /*
  {
    "type": "connection_status",
    "status": "connected|disconnected|reconnecting",
    "message": "Successfully connected to real-time updates",
    "timestamp": "2025-01-15T14:30:15Z"
  }
  */
});
```

## 📊 Request/Response Schemas

### Common Response Format
```json
{
  "success": true|false,
  "data": {},  // Response data (success only)
  "error": {   // Error details (failure only)
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": {}  // Additional error context
  },
  "meta": {
    "requestId": "req_550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-01-15T14:30:15Z",
    "version": "1.0"
  }
}
```

### User Schema
```json
{
  "id": "string (UUID)",
  "username": "string (3-50 chars, alphanumeric + underscore)",
  "email": "string (valid email)",
  "firstName": "string (1-100 chars, optional)",
  "lastName": "string (1-100 chars, optional)",
  "role": "enum (user|moderator|admin)",
  "isActive": "boolean",
  "createdAt": "string (ISO 8601)",
  "updatedAt": "string (ISO 8601)"
}
```

### Score Schema
```json
{
  "currentScore": "integer (>= 0)",
  "lifetimeScore": "integer (>= 0)",
  "rankPosition": "integer (>= 1)",
  "lastUpdated": "string (ISO 8601)"
}
```

### Score History Schema
```json
{
  "id": "string (UUID)",
  "scoreChange": "integer",
  "scoreBefore": "integer (>= 0)",
  "scoreAfter": "integer (>= 0)",
  "actionType": "string (enum: level_completion|achievement|bonus|correction)",
  "actionSource": "string (optional)",
  "metadata": "object (optional)",
  "timestamp": "string (ISO 8601)"
}
```

## ⚡ Rate Limiting

### Rate Limit Policies

| Endpoint Category | Authenticated | Unauthenticated | Window |
|------------------|---------------|-----------------|--------|
| Authentication | 10 requests | 5 requests | 1 minute |
| Leaderboard | 100 requests | 20 requests | 1 minute |
| Score Updates | 60 requests | N/A | 1 minute |
| User Profile | 200 requests | N/A | 1 minute |
| Admin Operations | 1000 requests | N/A | 1 minute |

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
X-RateLimit-Window: 60
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again in 60 seconds.",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetTime": "2025-01-15T14:31:00Z"
    }
  }
}
```

## 🚨 Error Handling

### HTTP Status Codes

| Status Code | Description | Example Use Case |
|-------------|-------------|------------------|
| 200 | Success | Successful API call |
| 201 | Created | User registration |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate username |
| 422 | Unprocessable Entity | Business rule violation |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server-side error |
| 503 | Service Unavailable | Maintenance mode |

### Error Response Format
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": {
      "field": "email",
      "constraint": "must be a valid email address",
      "value": "invalid-email"
    }
  },
  "meta": {
    "requestId": "req_550e8400-e29b-41d4-a716-446655440000",
    "timestamp": "2025-01-15T14:30:15Z"
  }
}
```

### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Input validation failed |
| `AUTHENTICATION_REQUIRED` | 401 | JWT token missing |
| `TOKEN_EXPIRED` | 401 | JWT token expired |
| `TOKEN_INVALID` | 401 | JWT token invalid |
| `INSUFFICIENT_PERMISSIONS` | 403 | Role-based access denied |
| `RESOURCE_NOT_FOUND` | 404 | Requested resource not found |
| `DUPLICATE_RESOURCE` | 409 | Resource already exists |
| `BUSINESS_RULE_VIOLATION` | 422 | Business logic constraint |
| `RATE_LIMIT_EXCEEDED` | 429 | API rate limit exceeded |
| `INTERNAL_ERROR` | 500 | Unexpected server error |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

## 🔒 Security Headers

### Required Security Headers
```http
# Security Headers
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'
Referrer-Policy: strict-origin-when-cross-origin

# API Headers
X-API-Version: 1.0
X-Request-ID: req_550e8400-e29b-41d4-a716-446655440000
Cache-Control: no-cache, no-store, must-revalidate
```

### CORS Configuration
```http
Access-Control-Allow-Origin: https://scoreboard.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
```

---

## 📋 API Testing

### Sample cURL Commands

#### Authentication
```bash
# Login
curl -X POST "https://api.scoreboard.com/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get leaderboard
curl -X GET "https://api.scoreboard.com/api/leaderboard" \
  -H "Authorization: Bearer <access_token>"

# Update score
curl -X POST "https://api.scoreboard.com/api/scores/update" \
  -H "Authorization: Bearer <access_token>" \
  -H "Content-Type: application/json" \
  -d '{"scoreChange":100,"actionType":"level_completion","actionSource":"level_15"}'
```

This comprehensive API specification provides all the necessary details for implementing and consuming the real-time scoreboard API, including authentication, endpoints, WebSocket events, rate limiting, and security considerations.