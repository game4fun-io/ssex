# Deployment Guide

This application is containerized using Docker, which builds the React client and serves it via the Node.js Express server.

## Prerequisites
- Docker installed on your machine.

## Build the Docker Image
Run the following command in the root directory of the project:

```bash
docker build -t ssex-app .
```

## Run the Container
Run the container, mapping port 5002:

```bash
docker run -p 5002:5002 \
  -e MONGO_URI="mongodb://host.docker.internal:27017/ssex" \
  -e JWT_SECRET="your_production_secret" \
  -e ADMIN_EMAIL="admin@admin.com" \
  -e ADMIN_PASSWORD="your_secure_password" \
  ssex-app
```

> **Note**: `host.docker.internal` is used to access the MongoDB running on your host machine. If using a cloud MongoDB (e.g., Atlas), replace it with the connection string.

## Access the Application
Open your browser and navigate to:
`http://localhost:5002`

## Environment Variables
| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `5002` |
| `MONGO_URI` | MongoDB connection string | - |
| `JWT_SECRET` | Secret for JWT tokens | - |
| `NODE_ENV` | Environment mode | `production` |

## Using Docker Compose (Recommended)
To run both the application and a local MongoDB instance easily:

```bash
docker-compose up --build -d
```

This will:
1.  Build the application image.
2.  Start a MongoDB container.
3.  Start the application container connected to the MongoDB.
4.  Expose the app on port `5003`.

To stop:
```bash
docker-compose down
```

## Seeding the Database
After starting the containers for the first time, you need to populate the database:

```bash
docker-compose exec app npm run seed
```

## Access the Application
Open your browser and navigate to:
`http://localhost:5003`

## Local Development (Hot Reloading)
For local development with hot reloading for both client and server:

```bash
docker-compose -f docker-compose.dev.yml up --build
```

This will start:
- Client: `http://localhost:5173`
- Server: `http://localhost:5002`
- Mongo: `localhost:27019`

### Seeding in Development
To seed the development database:

```bash
docker-compose -f docker-compose.dev.yml exec app-dev npm run seed
```
