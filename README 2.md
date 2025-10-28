# Class Track - 수업 일정 관리 시스템

A comprehensive class schedule management application for teachers, built with Node.js and React.

## Features

### 📅 Calendar Views
- **Monthly View**: Shows all days of the month with class indicators
- **Weekly View**: Detailed weekly schedule with period-based layout
- **Daily View**: Focused daily schedule with class details

### 🎨 Class Management
- 11 different classes (Class 1-10 + 동아리)
- Unique color coding for each class
- Visual indicators similar to Google Calendar

### ⚙️ Schedule Management
- Edit weekly schedule for each day
- Set academic term start and end dates
- Real-time updates and persistence

### 📱 Responsive Design
- Mobile-friendly interface
- Custom CSS styling (no Tailwind)
- Modern, clean UI design

## Technology Stack

- **Backend**: Node.js, Express.js
- **Frontend**: React.js
- **Styling**: Custom CSS
- **Data Storage**: In-memory (can be extended to database)

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

This will start both the backend server (port 5001) and React development server (port 3000).

## Project Structure

```
class_track/
├── server.js                 # Express server
├── package.json              # Backend dependencies
├── client/                   # React application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Calendar/     # Calendar components
│   │   │   └── ScheduleManager/ # Schedule editing components
│   │   ├── data/            # Data models and utilities
│   │   ├── services/        # API services
│   │   └── App.js           # Main application component
│   └── package.json         # Frontend dependencies
└── README.md
```

## API Endpoints

- `GET /api/schedule` - Get current schedule data
- `PUT /api/schedule` - Update entire schedule
- `PUT /api/schedule/weekly` - Update weekly schedule
- `PUT /api/schedule/dates` - Update start/end dates

## Usage

1. **View Schedule**: Use the navigation buttons to switch between monthly, weekly, and daily views
2. **Edit Schedule**: Click "주간 일정 편집" to modify which classes are taught on each day
3. **Set Dates**: Click "학기 날짜 설정" to configure the academic term dates
4. **Navigate**: Use arrow buttons or "오늘" button to navigate through dates

## Class Configuration

The system supports 11 classes with predefined colors:
- Class 1-10: Regular classes
- 동아리: Special activity class

Each class has a unique color that appears consistently across all views.

## Future Enhancements

- Database integration for persistent storage
- User authentication
- Multiple teacher support
- Class attendance tracking
- Export functionality
- Advanced scheduling features

## Development

To run in development mode:
```bash
npm run dev
```

To build for production:
```bash
npm run build
```

To start production server:
```bash
npm start
```
