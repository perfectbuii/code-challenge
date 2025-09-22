# Problem 5: RESTful API Server

A production-ready RESTful API server built with Node.js, Express.js, TypeScript, and PostgreSQL.

## Features

- RESTful API with full CRUD operations for resources
- PostgreSQL database with connection pooling
- Input validation and sanitization using express-validator
- Comprehensive error handling with proper HTTP status codes
- Structured logging with Winston
- Security features: Helmet, CORS, rate limiting
- Unit and integration tests with Jest and Supertest
- Complete Docker Compose setup for local development
- Automated database schema management

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL 15
- **ORM**: Native pg (PostgreSQL driver)
- **Testing**: Jest + Supertest
- **Logging**: Winston
- **Security**: Helmet, CORS, express-rate-limit
- **Infrastructure**: Docker & Docker Compose

## Quick Start
### Prerequisites
- Docker and Docker Compose
- Make

### Run
```bash
make start
```

This automatically:
- Starts PostgreSQL database
- Creates database schema with init.sql
- Seeds sample data automatically  
- Starts the API server
- API available at `http://localhost:3000`


```bash
make test
```
Run the integration tests

## Example Usage API

### Create a Resource

```bash
curl -X POST http://localhost:3000/api/resources \
  -H "Content-Type: application/json" \
  -d '{
    "name": "User Authentication API",
    "description": "API for user login and registration",
    "category": "Authentication"
  }'
```

### Get All Resources

```bash
curl http://localhost:3000/api/resources
```

### Filter Resources

```bash
# Filter by category
curl "http://localhost:3000/api/resources?category=Authentication"

# Filter by name
curl "http://localhost:3000/api/resources?name=User"
```

### Get Specific Resource

```bash
curl http://localhost:3000/api/resources/{resource-id}
```

### Update Resource

```bash
curl -X PUT http://localhost:3000/api/resources/{resource-id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated API Name",
    "description": "Updated description"
  }'
```

### Delete Resource

```bash
curl -X DELETE http://localhost:3000/api/resources/{resource-id}
```

## Project Structure

```
src/problem5/
├── src/
│   ├── controllers/         # Request handlers
│   ├── repositories/       # Data access layer
│   ├── middleware/         # Express middleware
│   ├── routes/            # Route definitions
│   ├── database/          # Database configuration and migrations
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   └── app.ts             # Express application setup
├── tests/             # Test files
├── docker-compose.yml     # Docker services configuration
├── Dockerfile            # Application container
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```
