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

Copy the template to `.env.local` (preferred) or `.env`:

```bash
cp .env.example .env.local
```

The template uses the preferred local configuration:

```env
# Node.js API and Socket.IO origin; no `/api` suffix.
NEXT_PUBLIC_BACKEND_ORIGIN=http://localhost:3001
```

`NEXT_PUBLIC_*` values are included in browser JavaScript, so they must never contain a password,
token, database URL, Redis URL, or webhook/source secret. `NEXT_PUBLIC_BACKEND_URL` and
`NEXT_PUBLIC_API_BASE_URL` are legacy aliases; use only one form unless their values resolve to the
same backend origin. In the documented production topology the browser, API, and Socket.IO share
one HTTPS origin through a reverse proxy, so leave all three public backend variables unset and the
application uses `/api` and the current browser origin automatically.

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
