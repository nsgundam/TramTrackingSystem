# Shuttle Tracking Web Interface

This is the frontend client for the **Tram Tracking System**, built with [Next.js](https://nextjs.org/) and React. It provides two main viewing angles:
1. **Public Tracking Interface**: A beautifully designed map showing active routes, vehicle positions, and stops overlaid with real-time Socket.io updates.
2. **Admin Management Dashboard**: Tools for adding, removing, and altering shuttle operations securely, gated behind authentication.

## Tech Stack

- **Framework**: Next.js 16 / React 19
- **Mapping Engine**: Leaflet & React-Leaflet
- **Styling**: Tailwind CSS integration
- **Real-time Sync**: Socket.io-client
- **UI Icons**: Lucide React

## Getting Started

### Installation

Navigate to the current working environment and install all necessary NPM packages:

```bash
npm install
```

### Environment Variables

If needed, create a `.env.local` or `.env` file in the root directory. Common variables you might define:

```env
# URL for the Node.js API backend (optional if using proxy)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

### Running the App Locally

To start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result. The pages auto-update on save.

### Building for Production

To create an optimized production build:
```bash
npm run build
npm start
```
