// Data models and utilities for the class schedule application

export const CLASS_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471'
];

export const CLASS_NAMES = [
  'Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5',
  'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', '동아리'
];

export const DAYS_OF_WEEK = [
  'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'
];

export const DAYS_OF_WEEK_KOREAN = [
  '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'
];

export const PERIODS_PER_DAY = 7; // 7 교시 per day

// Generate classes data
export const generateClasses = () => {
  return CLASS_NAMES.map((name, index) => ({
    id: index + 1,
    name: name,
    color: CLASS_COLORS[index]
  }));
};

// Generate default weekly schedule with period-specific assignments
export const generateDefaultWeeklySchedule = () => {
  return {
    monday: { 1: null, 2: null, 3: 4, 4: null, 5: 6, 6: null, 7: 10 },
    tuesday: { 1: 1, 2: null, 3: 3, 4: null, 5: null, 6: 7, 7: null },
    wednesday: { 1: null, 2: 2, 3: null, 4: null, 5: 5, 6: null, 7: 8 },
    thursday: { 1: 1, 2: null, 3: null, 4: 4, 5: null, 6: null, 7: 9 },
    friday: { 1: null, 2: null, 3: 3, 4: null, 5: null, 6: 6, 7: 11 },
    saturday: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null },
    sunday: { 1: null, 2: null, 3: null, 4: null, 5: null, 6: null, 7: null }
  };
};

// Generate default class status (checked/completed status)
export const generateDefaultClassStatus = () => {
  return {};
};

// Generate default comments
export const generateDefaultComments = () => {
  return {};
};

// Generate default Korean holidays for 2025-2026
export const generateDefaultHolidays = () => {
  return [
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
  ];
};

// Generate default semester dates
export const generateDefaultSemesterDates = () => {
  return {
    startDate: '2025-08-01',
    endDate: '2026-05-31'
  };
};

// Get classes for a specific day (returns array of class IDs)
export const getClassesForDay = (weeklySchedule, dayOfWeek) => {
  const daySchedule = weeklySchedule[dayOfWeek] || {};
  return Object.values(daySchedule).filter(classId => classId !== null);
};

// Get classes for a specific date (checks daily schedule first, then falls back to weekly)
export const getClassesForDate = (weeklySchedule, date, dailySchedules = {}) => {
  const dateStr = formatDate(date);
  
  // Check if there's a daily schedule override for this date
  if (dailySchedules[dateStr]) {
    return Object.values(dailySchedules[dateStr]).filter(classId => classId !== null);
  }
  
  // Fall back to weekly schedule
  const dayOfWeek = DAYS_OF_WEEK[date.getDay()];
  return getClassesForDay(weeklySchedule, dayOfWeek);
};

// Get class for specific day and period (checks daily schedule first, then falls back to weekly)
export const getClassForPeriod = (weeklySchedule, dayOfWeek, period, date = null, dailySchedules = {}) => {
  // If date is provided, check daily schedule first
  if (date) {
    const dateStr = formatDate(date);
    if (dailySchedules[dateStr]) {
      return dailySchedules[dateStr][period] || null;
    }
  }
  
  // Fall back to weekly schedule
  const daySchedule = weeklySchedule[dayOfWeek] || {};
  return daySchedule[period] || null;
};

// Generate calendar events for a month
export const generateCalendarEvents = (weeklySchedule, year, month, startDate, endDate, dailySchedules = {}) => {
  const events = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const semesterStart = new Date(startDate);
  const semesterEnd = new Date(endDate);
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    
    // Check if date is within semester period
    if (date >= semesterStart && date <= semesterEnd) {
      const classes = getClassesForDate(weeklySchedule, date, dailySchedules);
      
      if (classes.length > 0) {
        events.push({
          date: new Date(date),
          classes: classes
        });
      }
    }
  }
  
  return events;
};

// Format date for API calls
export const formatDate = (date) => {
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse date from string
export const parseDate = (dateString) => {
  return new Date(dateString);
};

// Generate unique key for class status and comments
export const generateClassKey = (date, classId, period = null) => {
  const dateStr = formatDate(date);
  return period !== null ? `${dateStr}-${classId}-${period}` : `${dateStr}-${classId}`;
};

// Check if a class is completed for a specific date
export const isClassCompleted = (classStatus, date, classId, period = null) => {
  const key = generateClassKey(date, classId, period);
  const result = classStatus[key] || false;
  return result;
};

// Toggle class completion status
export const toggleClassCompletion = (classStatus, date, classId, period = null) => {
  const key = generateClassKey(date, classId, period);
  return {
    ...classStatus,
    [key]: !classStatus[key]
  };
};

// Get comment for a specific class on a specific date
export const getClassComment = (comments, date, classId, period = null) => {
  const key = generateClassKey(date, classId, period);
  return comments[key] || '';
};

// Set comment for a specific class on a specific date
export const setClassComment = (comments, date, classId, comment, period = null) => {
  const key = generateClassKey(date, classId, period);
  return {
    ...comments,
    [key]: comment
  };
};

// Check if a date is a holiday
export const isHoliday = (date, holidays) => {
  // Use local date formatting to avoid timezone issues
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const dateStr = `${year}-${month}-${day}`;
  return holidays.includes(dateStr);
};

// Check if a date is a weekday (Monday-Friday)
export const isWeekday = (date) => {
  const day = date.getDay();
  return day >= 1 && day <= 5; // Monday = 1, Friday = 5
};

// Get all weekdays in a date range
export const getWeekdaysInRange = (startDate, endDate, holidays = []) => {
  const weekdays = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);
  
  while (current <= end) {
    if (isWeekday(current) && !isHoliday(current, holidays)) {
      weekdays.push(new Date(current));
    }
    current.setDate(current.getDate() + 1);
  }
  
  return weekdays;
};

// Calculate statistics
export const calculateStatistics = (weeklySchedule, startDate, endDate, classStatus, holidays = []) => {
  const weekdays = getWeekdaysInRange(new Date(startDate), new Date(endDate), holidays);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const completedWeekdays = weekdays.filter(day => day < today);
  const remainingWeekdays = weekdays.filter(day => day >= today);
  
  // Calculate total classes for each weekday
  let totalClasses = 0;
  let completedClasses = 0;
  const classStats = {};
  
  weekdays.forEach(day => {
    const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][day.getDay()];
    const daySchedule = weeklySchedule[dayName] || {};
    
    Object.values(daySchedule).forEach(classId => {
      if (classId !== null) {
        totalClasses++;
        
        if (!classStats[classId]) {
          classStats[classId] = { total: 0, completed: 0 };
        }
        classStats[classId].total++;
        
        const isCompleted = isClassCompleted(classStatus, day, classId);
        if (isCompleted) {
          completedClasses++;
          classStats[classId].completed++;
        }
      }
    });
  });
  
  return {
    totalWeekdays: weekdays.length,
    completedWeekdays: completedWeekdays.length,
    remainingWeekdays: remainingWeekdays.length,
    totalClasses,
    completedClasses,
    remainingClasses: totalClasses - completedClasses,
    classStats
  };
};
