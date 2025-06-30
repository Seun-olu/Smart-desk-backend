# Smart Desk Booking Assistant Backend

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create a `.env` file in the root with your MongoDB URI:
   ```env
   MONGODB_URI=mongodb://localhost:27017/smartdesk
   ```
3. Start the server:
   ```bash
   npm start
   ```

## Project Structure
- `models/` - Mongoose schemas for User, Booking, Office
- `controllers/` - Business logic for smart suggestions
- `routes/` - Express route for /api/smart-suggest
- `app.js` - Main entry point

## API Usage
### POST `/api/smart-suggest`
**Request Body:**
```
{
  "userId": "user_id",
  "preferredTime": "2025-07-01T10:00:00",
  "durationHours": 2
}
```
**Response:**
```
{
  "recommendedOffice": {
    "officeId": "123",
    "officeName": "Private Office 3",
    "confidenceScore": 0.87
  }
}
```

## Notes
- The suggestion logic considers user booking history, cancellation frequency, and office availability.
- All code is modular and commented for clarity. # Smart-desk-backend