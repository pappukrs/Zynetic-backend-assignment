# Energy Ingestion Engine

A high-scale backend system for ingesting telemetry data from Smart Meters and EV Vehicles, built with NestJS and PostgreSQL.

## Overview

This engine handles two high-frequency data streams arriving every 60 seconds from each device:
- **Smart Meter Stream**: AC power consumption metrics.
- **Vehicle Stream**: DC power delivery and battery status.

I designed the system to correlate these two streams so charging efficiency and power loss can be calculated at a fleet level.

---

## Getting Started

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (if running locally)

### Running with Docker (Recommended)
1. **Clone and setup**:
   ```bash
   git clone https://github.com/pappu-kumar-singh/Zynetic-backend-assignment.git
   cd Zynetic-backend-assignment
   cp .env.example .env
   ```
2. **Start services**:
   ```bash
   docker-compose up -d --build
   ```
3. **Access**:
   - **API**: http://localhost:3000
   - **pgAdmin**: http://localhost:5050 (Credentials: `admin@zynetic.com` / `admin`)

---

## Architecture & Design Decisions

### Hot/Cold Storage Strategy
The most important decision I made was to split the data into two separate storage paths. This solved the problem of trying to run fast dashboard queries against a history table that could grow very large over time.

**1. Cold Storage (Event History)**
- I use `meter_telemetry_history` and `vehicle_telemetry_history` as append-only tables.
- **Why?**: This keeps ingestion extremely fast and creates an immutable audit trail.
- **Optimization**: I added composite indexes on `(device_id, timestamp)` so that analytics queries only scan the exact range they need instead of the whole table.

**2. Hot Storage (Live Status)**
- I maintain `meter_status` and `vehicle_status` tables which hold exactly one row per device.
- **Why?**: This allows the dashboard to get the "current state" of any device in less than 5ms using a simple Primary Key lookup via a PostgreSQL `UPSERT`.

### Data Correlation
For this assignment, I implemented a naming convention where `METER-001` is assumed to be the charger for `VEH-001`. While a production system would use a configuration table for this mapping, this approach keeps the logic clean for the efficiency calculations required.

### Technical Choices
- **PostgreSQL**: Chosen for its reliability and excellent support for both relational and time-series data.
- **Performance**: I ensured no query performs a full table scan. Analytics are backed by composite indexes, and status lookups are O(1).
- **Scalability**: The design supports horizontal scaling of the stateless NestJS app. For larger scales, history tables can be partitioned by time, and read replicas can be added for analytics.

---

## Assumptions & Trade-offs

- **Device Mapping**: I assumed a 1:1 mapping between `vehicleId` and `meterId` for simplicity in efficiency calculation.
- **Data Integrity**: I skipped foreign key constraints on telemetry tables to maximize write throughput during heavy ingestion.
- **Statelessness**: The application is stateless to allow for easy scaling behind a load balancer.

---

## API Endpoints

The API is intentionally small and focused on ingestion, analytics, and live status queries.

### Ingestion
- `POST /v1/ingest/meter`: Ingest single meter reading
- `POST /v1/ingest/vehicle`: Ingest single vehicle reading
- `POST /v1/ingest/meter/batch`: Optimized batch ingestion
- `POST /v1/ingest/vehicle/batch`: Optimized batch ingestion

### Analytics & Status
- `GET /v1/analytics/performance/:vehicleId`: 24h efficiency summary
- `GET /v1/analytics/fleet/inefficient`: List low-efficiency vehicles
- `GET /v1/status/vehicle/:vehicleId`: Current live status

---

## Testing

### Automated Test Data
The script simulates multiple devices sending telemetry at fixed intervals to populate the database for testing:
```bash
chmod +x ./scripts/generate-test-data.sh
./scripts/generate-test-data.sh
```

### Manual Testing with Postman
I have included a Postman collection to make it easier to test the endpoints manually. You can import the file found at `postman/postman_collection.json` into Postman to see the full list of requests and example payloads.

---

## Author
Pappu Kumar
