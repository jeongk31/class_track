const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Sample data for classes and schedule
let scheduleData = {
  classes: [
    { id: 1, name: 'Class 1', color: '#FF6B6B' },
    { id: 2, name: 'Class 2', color: '#4ECDC4' },
    { id: 3, name: 'Class 3', color: '#45B7D1' },
    { id: 4, name: 'Class 4', color: '#96CEB4' },
    { id: 5, name: 'Class 5', color: '#FFEAA7' },
    { id: 6, name: 'Class 6', color: '#DDA0DD' },
    { id: 7, name: 'Class 7', color: '#98D8C8' },
    { id: 8, name: 'Class 8', color: '#F7DC6F' },
    { id: 9, name: 'Class 9', color: '#BB8FCE' },
    { id: 10, name: 'Class 10', color: '#85C1E9' },
    { id: 11, name: '동아리', color: '#F8C471' }
  ],
  // Default weekly template for generating daily schedules
  weeklySchedule: {
    monday: { 1: null, 2: null, 3: 4, 4: null, 5: 6, 6: null, 7: 10 },
    tuesday: { 1: 1, 2: null, 3: 3, 4: null, 5: null, 6: 7, 7: null },
    wednesday: { 1: null, 2: 2, 3: null, 4: null, 5: 5, 6: null, 7: 8 },
    thursday: { 1: 1, 2: null, 3: null, 4: 4, 5: null, 6: null, 7: 9 },
    friday: { 1: null, 2: null, 3: 3, 4: null, 5: null, 6: 6, 7: 11 },
    saturday: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null },
    sunday: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null }
  },
  // Daily schedules - overrides weekly template for specific dates
  dailySchedules: {},
  startDate: '2025-08-01',
  endDate: '2026-05-31',
  classStatus: {},
  comments: {},
  holidays: [
    // 2025 holidays (accurate dates)
    '2025-01-01', // 신정 (New Year's Day)
    '2025-01-27', // 설날 연휴 (Seollal Holiday - Temporary)
    '2025-01-28', // 설날 연휴 (Seollal Holiday)
    '2025-01-29', // 설날 (Seollal)
    '2025-01-30', // 설날 연휴 (Seollal Holiday)
    '2025-03-01', // 삼일절 (Independence Movement Day)
    '2025-03-03', // 삼일절 대체 공휴일 (Substitute Holiday)
    '2025-05-05', // 어린이날 (Children's Day) + 부처님 오신 날 (Buddha's Birthday)
    '2025-05-06', // 어린이날 대체 공휴일 (Substitute Holiday)
    '2025-06-06', // 현충일 (Memorial Day)
    '2025-08-15', // 광복절 (Liberation Day)
    '2025-10-03', // 개천절 (National Foundation Day)
    '2025-10-05', // 추석 연휴 (Chuseok Holiday)
    '2025-10-06', // 추석 (Chuseok)
    '2025-10-07', // 추석 연휴 (Chuseok Holiday)
    '2025-10-08', // 추석 대체 공휴일 (Substitute Holiday)
    '2025-10-09', // 한글날 (Hangeul Day)
    '2025-12-25', // 성탄절 (Christmas Day)
    
    // 2026 holidays (calculated based on lunar calendar)
    '2026-01-01', // 신정 (New Year's Day)
    '2026-02-16', // 설날 연휴 (Seollal Holiday)
    '2026-02-17', // 설날 (Seollal)
    '2026-02-18', // 설날 연휴 (Seollal Holiday)
    '2026-03-01', // 삼일절 (Independence Movement Day)
    '2026-05-05', // 어린이날 (Children's Day)
    '2026-05-24', // 부처님 오신 날 (Buddha's Birthday)
    '2026-06-06', // 현충일 (Memorial Day)
    '2026-08-15', // 광복절 (Liberation Day)
    '2026-09-25', // 추석 연휴 (Chuseok Holiday)
    '2026-09-26', // 추석 (Chuseok)
    '2026-09-27', // 추석 연휴 (Chuseok Holiday)
    '2026-10-03', // 개천절 (National Foundation Day)
    '2026-10-09', // 한글날 (Hangeul Day)
    '2026-12-25'  // 성탄절 (Christmas Day)
  ]
};

// API Routes
app.get('/api/schedule', (req, res) => {
  res.json(scheduleData);
});

app.put('/api/schedule', (req, res) => {
  scheduleData = { ...scheduleData, ...req.body };
  res.json(scheduleData);
});

app.put('/api/schedule/weekly', (req, res) => {
  scheduleData.weeklySchedule = req.body;
  res.json(scheduleData);
});

app.put('/api/schedule/dates', (req, res) => {
  scheduleData.startDate = req.body.startDate;
  scheduleData.endDate = req.body.endDate;
  res.json(scheduleData);
});

app.put('/api/schedule/class-status', (req, res) => {
  scheduleData.classStatus = req.body;
  res.json(scheduleData);
});

app.put('/api/schedule/comments', (req, res) => {
  scheduleData.comments = req.body;
  res.json(scheduleData);
});

// Update holidays
app.put('/api/schedule/holidays', (req, res) => {
  scheduleData.holidays = req.body;
  res.json(scheduleData);
});

// Update daily schedules for a specific date range
app.put('/api/schedule/daily', (req, res) => {
  const { startDate, endDate, schedule } = req.body;
  
  // Validate input
  if (!startDate || !endDate || !schedule) {
    return res.status(400).json({ error: 'Missing required fields: startDate, endDate, schedule' });
  }
  
  // Update daily schedules for the date range
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    scheduleData.dailySchedules[dateStr] = schedule;
  }
  
  res.json(scheduleData);
});

// Get daily schedule for a specific date
app.get('/api/schedule/daily/:date', (req, res) => {
  const { date } = req.params;
  const dailySchedule = scheduleData.dailySchedules[date] || null;
  res.json({ date, schedule: dailySchedule });
});

// Clear daily schedules for a date range
app.delete('/api/schedule/daily', (req, res) => {
  const { startDate, endDate } = req.body;
  
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Missing required fields: startDate, endDate' });
  }
  
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0];
    delete scheduleData.dailySchedules[dateStr];
  }
  
  res.json(scheduleData);
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
