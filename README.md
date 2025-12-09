# IVR-Command-Center

# IVR Demo

A complete Interactive Voice Response (IVR) system built with Node.js, Express, React, and Plivo API. This application demonstrates outbound call functionality with multi-level IVR menus, DTMF input handling, and real-time call flow visualization.

## Features

- **Outbound Calling**: Initiate calls to any phone number via Plivo API
- **Multi-Level IVR Menus**: Language selection (English/Spanish) followed by action menus
- **DTMF Input Handling**: Process keypad inputs to navigate through menus
- **Audio Playback**: Play audio messages based on user selection
- **Call Forwarding**: Connect callers to an associate
- **Real-Time Dashboard**: Virtual phone interface showing call state and IVR flow
- **Call Logging**: Track all call sessions with state history

## Required Plivo Credentials

You need the following credentials from your [Plivo Console](https://console.plivo.com/):

| Credential | Description |
|------------|-------------|
| `PLIVO_AUTH_ID` | Your Plivo Auth ID (found on dashboard) |
| `PLIVO_AUTH_TOKEN` | Your Plivo Auth Token (found on dashboard) |
| `PLIVO_PHONE_NUMBER` | A Plivo phone number you own (format: +1XXXXXXXXXX) |

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd ivr-demo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create the following environment variables (secrets) in your environment:

```
PLIVO_AUTH_ID=your_plivo_auth_id
PLIVO_AUTH_TOKEN=your_plivo_auth_token
PLIVO_PHONE_NUMBER=+1XXXXXXXXXX
```

**Optional:**
```
ASSOCIATE_NUMBER=+1XXXXXXXXXX  # Number to forward calls to (default: +917720898880)
```

### 4. Database Setup

The application uses PostgreSQL. Ensure you have a `DATABASE_URL` environment variable set, then run:

```bash
npm run db:push
```

### 5. Start the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5000`

## Steps to Run and Test

### Testing the IVR Flow

1. **Open the Dashboard**: Navigate to the application URL in your browser

2. **Enter a Phone Number**: In the "Outbound Call Trigger" section, enter a valid phone number with country code (e.g., +1234567890)

3. **Initiate the Call**: Click "Initiate Outbound Call"

4. **Answer the Call**: When your phone rings, answer it

5. **Navigate the IVR**:
   - **Level 1 - Language Selection**:
     - Press `1` for English
     - Press `2` for Spanish
   
   - **Level 2 - Action Menu**:
     - Press `1` to hear an audio message
     - Press `2` to be connected to an associate

6. **Monitor the Dashboard**: Watch the virtual phone interface and system logs to see the call flow in real-time

### IVR Flow Diagram

```
Call Initiated
     ↓
[Welcome Message]
"Welcome to IVR Demo. Press 1 for English, Press 2 for Spanish."
     ↓
     ├── Press 1 → English Menu
     │              "Press 1 to play a message. Press 2 to speak to an associate."
     │              ├── Press 1 → Play Audio → Hangup
     │              └── Press 2 → Forward to Associate
     │
     └── Press 2 → Spanish Menu (Español)
                    "Presione 1 para escuchar un mensaje. Presione 2 para hablar con un asociado."
                    ├── Press 1 → Play Audio → Hangup
                    └── Press 2 → Forward to Associate
```

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # UI components (virtual phone, dialpad)
│       ├── lib/           # State management (ivr-store.ts)
│       └── pages/         # Page components
├── server/                 # Express backend
│   ├── routes.ts          # API routes & Plivo IVR endpoints
│   ├── storage.ts         # Database operations
│   └── index.ts           # Server entry point
├── shared/                 # Shared types and schemas
│   └── schema.ts          # Drizzle ORM schema
└── README.md
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/calls/initiate` | POST | Initiate an outbound call |
| `/api/calls/logs` | GET | Get all call logs |
| `/api/calls/logs/:callUuid` | GET | Get specific call log |
| `/api/ivr/welcome` | POST | Plivo webhook - Welcome message |
| `/api/ivr/language-selected` | POST | Plivo webhook - Language selection |
| `/api/ivr/menu-action-en` | POST | Plivo webhook - English menu actions |
| `/api/ivr/menu-action-es` | POST | Plivo webhook - Spanish menu actions |

## Technologies Used

- **Frontend**: React, TypeScript, Tailwind CSS, Zustand, Framer Motion
- **Backend**: Node.js, Express, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Voice API**: Plivo
- **Build Tool**: Vite

## Troubleshooting

### Call connects but no audio/IVR prompts
- Ensure the app is deployed with a public URL (not localhost)
- Verify Plivo credentials are correctly configured
- Check that webhook URLs are accessible from the internet

### Invalid phone number errors
- Use E.164 format: +[country code][number] (e.g., +14155551234)
- Ensure the number is valid and can receive calls

### Audio not playing
- Verify audio file URLs are accessible
- Check Plivo console for any XML parsing errors

## License

MIT
