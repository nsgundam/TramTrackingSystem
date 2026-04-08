# Tram Tracking System

Welcome to the **Tram Tracking System**! This is a full-stack web application designed for real-time tracking of trams or shuttles. It provides a live map interface for end-users to see the current location of vehicles and an administrative interface to manage routes, stops, and track the overall operation of the fleet.

## System Architecture

The project is split into two main components:
- **Frontend (`shuttle-tracking-web`)**: A Next.js application providing the web interface (user tools and map tracking views).
- **Backend (`shuttle-tracking-backend`)**: A Node.js API with Express, Socket.io for real-time updates, and Prisma ORM with PostgreSQL for data persistence.

---

## Getting Started

To get this project up and running locally for development and testing purposes, please follow the instructions below.

### Prerequisites

Please ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
- [PostgreSQL](https://www.postgresql.org/) database server instance running.

### Installation Steps

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone https://github.com/nsgundam/TramTrackingSystem.git
   cd TramTrackingSystem
   ```

2. **Setup the Backend Services**:
   - Navigate to the backend directory:
     ```bash
     cd shuttle-tracking-backend
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file referencing your Postgres connection string (see backend README for details).
   - Run the database migrations and seed to populate default data:
     ```bash
     npm run db:migrate
     npm run db:seed
     ```
   - Start the backend development server:
     ```bash
     npm run dev
     ```

3. **Setup the Frontend Client**:
   - Open a new terminal window and navigate to the frontend directory:
     ```bash
     cd shuttle-tracking-web
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Create a `.env` file (if you have specific environment flags like API URLs). By default, it communicates with the local backend socket.
   - Start the frontend development server:
     ```bash
     npm run dev
     ```

4. **View the Application**:
   - The application should now be accessible. 
   - Open your browser and navigate to `http://localhost:3000` to see the map tracking interface.

---

## Contributing

You can find more detailed documentation in the respective directories for both the backend and frontend components.

- [Frontend Documentation](./shuttle-tracking-web/README.md)
- [Backend Documentation](./shuttle-tracking-backend/README.md)

## Authors

- Narunat Suthhibut: Full Stack Developer (Backend & Frontend Admin page)
- SoraP: Frontend Developer (Frontend Public page)
- Paracetamol: Mobile Developer (Tracking App)