# System Architecture Diagram

```mermaid
graph TB
    subgraph "Client Layer"
        WEB[Web Client]
        MOB[Mobile App]
        ADMIN[Admin Dashboard]
    end

    subgraph "CDN & Load Balancing"
        CDN[CloudFlare CDN]
        LB[NGINX Load Balancer]
    end

    subgraph "API Gateway Layer"
        AGW[API Gateway<br/>Kong/Express]
        WSG[WebSocket Gateway<br/>Socket.io]
    end

    subgraph "Microservices"
        AUTH[Authentication Service<br/>JWT + RBAC]
        SCORE[Score Service<br/>Business Logic]
        REALTIME[Real-time Service<br/>WebSocket Manager]
        AUDIT[Audit Service<br/>Logging & Compliance]
    end

    subgraph "Data Layer"
        REDIS[(Redis Cache<br/>+ Pub/Sub)]
        POSTGRES[(PostgreSQL<br/>Primary DB)]
        REPLICA[(PostgreSQL<br/>Read Replica)]
    end

    subgraph "Infrastructure"
        MONITOR[Monitoring<br/>Prometheus + Grafana]
        LOGS[Logging<br/>ELK Stack]
        SECRETS[Secrets Manager]
    end

    %% Client connections
    WEB --> CDN
    MOB --> CDN
    ADMIN --> CDN
    CDN --> LB

    %% Load balancer routing
    LB --> AGW
    LB --> WSG

    %% API Gateway routing
    AGW --> AUTH
    AGW --> SCORE
    AGW --> AUDIT

    %% WebSocket connections
    WSG --> REALTIME

    %% Service interactions
    AUTH --> POSTGRES
    AUTH --> REDIS
    
    SCORE --> POSTGRES
    SCORE --> REPLICA
    SCORE --> REDIS
    SCORE --> REALTIME

    REALTIME --> REDIS
    REALTIME --> WSG

    AUDIT --> POSTGRES

    %% Infrastructure monitoring
    AUTH --> MONITOR
    SCORE --> MONITOR
    REALTIME --> MONITOR
    AUDIT --> MONITOR

    AUTH --> LOGS
    SCORE --> LOGS
    REALTIME --> LOGS
    AUDIT --> LOGS

    %% Styling
    classDef client fill:#74b9ff,stroke:#0984e3,stroke-width:2px,color:#2d3436
    classDef gateway fill:#fd79a8,stroke:#e84393,stroke-width:2px,color:#2d3436
    classDef service fill:#55a3ff,stroke:#2980b9,stroke-width:2px,color:#2d3436
    classDef data fill:#ffeaa7,stroke:#fdcb6e,stroke-width:2px,color:#2d3436
    classDef infra fill:#a29bfe,stroke:#6c5ce7,stroke-width:2px,color:#2d3436

    class WEB,MOB,ADMIN client
    class CDN,LB,AGW,WSG gateway
    class AUTH,SCORE,REALTIME,AUDIT service
    class REDIS,POSTGRES,REPLICA data
    class MONITOR,LOGS,SECRETS infra
```

## Component Descriptions

### Client Layer
- **Web Client**: React/Vue.js SPA with real-time scoreboard display
- **Mobile App**: React Native/Flutter app with push notifications
- **Admin Dashboard**: Administrative interface for system management

### Gateway Layer
- **API Gateway**: Request routing, authentication, rate limiting, logging
- **WebSocket Gateway**: Manages real-time connections with fallback support

### Microservices
- **Authentication Service**: JWT token management and RBAC
- **Score Service**: Core business logic for score management and validation
- **Real-time Service**: WebSocket connection management and broadcasting
- **Audit Service**: Security logging and compliance tracking

### Data Layer
- **Redis**: Caching layer and pub/sub for real-time updates
- **PostgreSQL**: Primary database with read replicas for scaling
- **Read Replicas**: Dedicated read instances for query performance