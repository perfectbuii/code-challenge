# API Flow Diagrams

## User Action Triggering (Two Approaches)

### Approach 1: Direct API Call
```mermaid
sequenceDiagram
    participant USER as User
    participant APP as Client App
    participant SCORE_FLOW as Score Update Flow

    Note over USER,SCORE_FLOW: Direct synchronous approach
    USER->>APP: Complete Action (level, quiz, challenge)
    APP->>APP: Validate action completion locally
    APP->>SCORE_FLOW: POST /api/scores/update + JWT token
    Note over SCORE_FLOW: See "Score Update Flow" below
    SCORE_FLOW-->>APP: 200 OK + new score
    APP-->>USER: Show score increase notification
```

### Approach 2: Event-Driven
```mermaid
sequenceDiagram
    participant USER as User
    participant APP as Client App
    participant ACTION as Action Service
    participant QUEUE as Message Queue
    participant SCORE_FLOW as Score Update Flow

    Note over USER,SCORE_FLOW: Asynchronous decoupled approach
    USER->>APP: Complete Action (level, quiz, challenge)
    APP->>APP: Validate action completion locally
    APP->>ACTION: POST /api/actions/complete + JWT token
    ACTION->>ACTION: Record action completion
    ACTION->>QUEUE: PUBLISH action_completed_event
    ACTION-->>APP: 200 OK - Action recorded
    APP-->>USER: Show action completion confirmation
    
    Note over QUEUE,SCORE_FLOW: Async processing
    QUEUE->>SCORE_FLOW: Trigger score update process
    Note over SCORE_FLOW: See "Score Update Flow" below
```

## Score Update Flow

```mermaid
sequenceDiagram
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant AUTH as Auth Service
    participant SCORE as Score Service
    participant DB as PostgreSQL
    participant REDIS as Redis Cache
    participant RT as Real-time Service
    participant BOARD as Scoreboard (All Users)

    Note over LB,BOARD: Core score update processing
    LB->>AGW: POST /api/scores/update + JWT token
    AGW->>AUTH: Validate JWT token & user permissions
    AUTH-->>AGW: Token valid + user info
    
    AGW->>SCORE: Process score update request
    Note over SCORE: Security validations & business rules
    SCORE->>SCORE: Validate action type & score change
    SCORE->>SCORE: Check rate limits (prevent spam)
    SCORE->>SCORE: Verify user is not suspended
    
    SCORE->>DB: BEGIN TRANSACTION
    SCORE->>DB: UPDATE user_scores SET current_score = current_score + points
    SCORE->>DB: INSERT INTO score_history (user_id, score_change, action_type)
    SCORE->>DB: COMMIT TRANSACTION
    
    SCORE->>REDIS: Update cached leaderboard
    SCORE->>REDIS: PUBLISH score_update_event
    SCORE-->>AGW: Success response
    AGW-->>LB: Success response
    
    Note over REDIS,BOARD: Real-time scoreboard update
    REDIS->>RT: score_update_event received
    RT->>RT: Calculate new top 10 rankings
    RT->>BOARD: Broadcast updated leaderboard via WebSocket
    Note over BOARD: All users see live scoreboard update
```

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant AUTH as Auth Service
    participant SCORE as Score Service
    participant DB as PostgreSQL
    participant REDIS as Redis Cache
    participant RT as Real-time Service
    participant WS as WebSocket Clients

    Client->>LB: POST /api/scores/update
    LB->>AGW: Forward request
    AGW->>AUTH: Validate JWT token
    AUTH-->>AGW: Token valid + user info
    AGW->>SCORE: Update score request
    
    SCORE->>SCORE: Validate business rules
    SCORE->>DB: BEGIN TRANSACTION
    SCORE->>DB: UPDATE user_scores
    SCORE->>DB: INSERT score_history
    SCORE->>DB: COMMIT
    
    SCORE->>REDIS: Update leaderboard cache
    SCORE->>REDIS: PUBLISH score_update event
    SCORE-->>AGW: Success response
    AGW-->>LB: Success response
    LB-->>Client: 200 OK
    
    REDIS->>RT: score_update event
    RT->>RT: Calculate new top 10
    RT->>WS: Broadcast updated leaderboard
```

## Leaderboard Retrieval Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant SCORE as Score Service
    participant REDIS as Redis Cache
    participant DB as PostgreSQL

    Client->>LB: GET /api/leaderboard
    LB->>AGW: Forward request
    AGW->>SCORE: Get leaderboard
    
    SCORE->>REDIS: Check cache for top 10
    alt Cache Hit
        REDIS-->>SCORE: Return cached leaderboard
        SCORE-->>AGW: Leaderboard data
    else Cache Miss
        SCORE->>DB: Query top 10 scores
        DB-->>SCORE: Score data
        SCORE->>REDIS: Cache leaderboard (TTL: 5s)
        SCORE-->>AGW: Leaderboard data
    end
    
    AGW-->>LB: Leaderboard response
    LB-->>Client: 200 OK + leaderboard
```

## WebSocket Connection Flow

```mermaid
sequenceDiagram
    participant Client
    participant WSG as WebSocket Gateway
    participant AUTH as Auth Service
    participant RT as Real-time Service
    participant REDIS as Redis

    Client->>WSG: WebSocket connection request
    WSG->>AUTH: Validate connection token
    AUTH-->>WSG: Token valid
    WSG->>RT: Register client connection
    RT->>RT: Add to active connections
    RT-->>WSG: Connection established
    WSG-->>Client: WebSocket connected
    
    loop Real-time Updates
        REDIS->>RT: score_update event
        RT->>RT: Process update
        RT->>WSG: Broadcast to clients
        WSG->>Client: Push leaderboard update
    end
```

## Authentication Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant AUTH as Auth Service
    participant DB as PostgreSQL
    participant REDIS as Redis Cache

    Client->>LB: POST /api/auth/login
    LB->>AGW: Forward request
    AGW->>AUTH: Login request
    
    AUTH->>AUTH: Validate credentials
    AUTH->>DB: Verify user credentials
    DB-->>AUTH: User data
    
    AUTH->>AUTH: Generate JWT + Refresh tokens
    AUTH->>REDIS: Store refresh token
    AUTH-->>AGW: Tokens + user info
    AGW-->>LB: Login response
    LB-->>Client: 200 OK + tokens

    Note over Client: Store JWT in memory/sessionStorage
    Note over Client: Store refresh token in httpOnly cookie
```

## Error Handling Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant SERVICE as Microservice
    participant AUDIT as Audit Service

    Client->>LB: API Request
    LB->>AGW: Forward request
    AGW->>SERVICE: Service request
    
    SERVICE->>SERVICE: Process request
    alt Service Error
        SERVICE-->>AGW: Error response
        AGW->>AUDIT: Log error event
        AGW-->>LB: Formatted error response
        LB-->>Client: 4xx/5xx Error
    else Success
        SERVICE-->>AGW: Success response
        AGW-->>LB: Success response
        LB-->>Client: 200 OK
    end
```

## Rate Limiting Flow

```mermaid
sequenceDiagram
    participant Client
    participant LB as Load Balancer
    participant AGW as API Gateway
    participant REDIS as Redis Cache
    participant SERVICE as Microservice

    Client->>LB: API Request
    LB->>AGW: Forward request
    AGW->>REDIS: Check rate limit for user/IP
    
    alt Rate Limit Exceeded
        REDIS-->>AGW: Limit exceeded
        AGW-->>LB: 429 Too Many Requests
        LB-->>Client: Rate limit error
    else Within Limits
        REDIS-->>AGW: Request allowed
        AGW->>REDIS: Increment counter
        AGW->>SERVICE: Forward request
        SERVICE-->>AGW: Response
        AGW-->>LB: Response
        LB-->>Client: Response
    end
```