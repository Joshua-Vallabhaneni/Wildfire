# FireSync: Wildfire Relief Volunteer App

A full-stack React/Node.js application that matches volunteers with wildfire relief tasks. Uses RAG model for smart matching, real-time messaging, and interactive maps.

## Key Features
- Smart task matching using DeepSeek backed RAG model.
- Real-time messaging between volunteers and requesters
- Interactive map showing relief opportunities
- Background verification for volunteers
- Impact tracking dashboard
- Separate flows for volunteers and help requesters

## Tech Stack
- **Frontend:** React, React Router, Leaflet.js, Tailwind CSS
- **Backend:** Node.js, Express, MongoDB, DeepSeek
- **Real-time features:** WebSocket for messaging

## Quick Start

### 1. Clone and install:
```bash
git clone https://github.com/yourusername/firesync.git
cd firesync

# Install dependencies
cd server && npm install
cd ../client && npm install
```

### 2. Set up environment:

Create a `.env` file in the `server/` directory:
```
MONGO_URI=your_mongodb_uri
OPENAI_API_KEY=your_openai_key
PORT=8080
```

Create a `.env` file in the `client/` directory:
```
REACT_APP_API_URL=http://localhost:8080
```

### 3. Run the app:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2 
cd client && npm start
```

Visit [http://localhost:3000](http://localhost:3000)


## Core Components
- **`MapView`**: Relief opportunity visualization
- **`MatchingDashboard`**: Task/volunteer matching interface 
- **`DirectMessageInterface`**: Real-time messaging
- **`matchingService`**: OpenAI-powered matching algorithm

## License
MIT
