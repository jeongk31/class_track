import React from 'react';
import { DAYS_OF_WEEK_KOREAN, generateCalendarEvents, isClassCompleted, toggleClassCompletion, isHoliday } from '../../data/scheduleData';
import './Calendar.css';

const MonthlyCalendar = ({ currentDate, weeklySchedule, classes, classEntries, startDate, endDate, classStatus, holidays, onDateClick, onClassStatusUpdate }) => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = firstDay.getDay();
  
  // Adjust for Sunday start (Sunday = 0, Monday = 1, etc.)
  // If Sunday (0), we need 0 empty cells
  // If Monday (1), we need 1 empty cell
  // If Tuesday (2), we need 2 empty cells, etc.
  const daysToSunday = startingDayOfWeek;
  
  // Generate calendar events from database entries
  const events = [];
  if (classEntries && classEntries.length > 0) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);

      const dateStr = date.toISOString().split('T')[0];
      const entriesForDate = classEntries.filter(entry => entry.date === dateStr);

      if (entriesForDate.length > 0) {
        // Store full entries with period information
        const classEntryList = [];
        entriesForDate.forEach(entry => {
          if (entry.class_type_id !== null) {
            classEntryList.push({
              classId: entry.class_type_id,
              period: entry.period
            });
          }
        });

        if (classEntryList.length > 0) {
          events.push({
            date: new Date(date),
            classEntries: classEntryList
          });
        }
      }
    }
  }
  
  // Create array of days to display
  const days = [];
  
  // Add empty cells for days before the first day of the month (to align with Sunday)
  for (let i = 0; i < daysToSunday; i++) {
    days.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    date.setHours(0, 0, 0, 0); // Normalize to midnight
    const dayEvents = events.find(event =>
      event.date.getDate() === day
    );

    const isHolidayDay = isHoliday(date, holidays);

    days.push({
      day,
      date,
      classEntries: dayEvents ? dayEvents.classEntries : [],
      isHoliday: isHolidayDay
    });
  }
  
  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };

  const handleClassCheck = (e, date, classId, period) => {
    e.stopPropagation();
    const statusForDate = classStatus(date);
    const key = `${classId}-${period}`;
    const currentStatus = statusForDate[key] || false;
    onClassStatusUpdate(date, classId, period, !currentStatus);
  };

  const handleClassClick = (e, date, classId, period) => {
    e.stopPropagation();
    const statusForDate = classStatus(date);
    const key = `${classId}-${period}`;
    const currentStatus = statusForDate[key] || false;
    onClassStatusUpdate(date, classId, period, !currentStatus);
  };
  
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };
  
  return (
    <div className="monthly-calendar">
      {/* <div className="calendar-header"> */}
        {/* <h2>{formatMonthYear(currentDate)}</h2> */}
      {/* </div> */}
      
      <div className="calendar-grid">
        {/* Day headers */}
        <div className="day-headers">
          {DAYS_OF_WEEK_KOREAN.map(day => (
            <div key={day} className="day-header">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="calendar-days">
          {days.map((dayData, index) => (
            <div
              key={index}
              className={`calendar-day ${dayData ? 'has-content' : 'empty'} ${dayData && dayData.isHoliday ? 'holiday' : ''}`}
              onClick={() => dayData && !dayData.isHoliday && onDateClick(dayData.date)}
            >
              {dayData && (
                <>
                  <div className="day-number">{dayData.day}</div>
                  {dayData.isHoliday && (
                    <div className="holiday-indicator">
                      <span>공휴일</span>
                    </div>
                  )}
                  {!dayData.isHoliday && dayData.classEntries && dayData.classEntries.length > 0 && (
                    <div className="day-classes">
                      {dayData.classEntries.map((entry, idx) => {
                        const classId = entry.classId;
                        const period = entry.period;
                        const classData = classes.find(c => c.id === classId);
                        const statusForDate = classStatus(dayData.date);
                        const key = `${classId}-${period}`;
                        const isCompleted = statusForDate[key] || false;
                        return (
                          <div
                            key={`${classId}-${period}-${idx}`}
                            className={`class-bar ${isCompleted ? 'completed' : ''}`}
                            style={{ backgroundColor: getClassColor(classId) }}
                            title={classData ? classData.name : `${classId}반`}
                            onClick={(e) => handleClassClick(e, dayData.date, classId, period)}
                          >
                            <button
                              className="class-check-button"
                              onClick={(e) => handleClassCheck(e, dayData.date, classId, period)}
                              title={isCompleted ? '완료 취소' : '완료 표시'}
                            >
                              {isCompleted ? '✓' : '○'}
                            </button>
                            <span className="class-name">
                              {classId === 11 ? '동아리' : `${classId}반`}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthlyCalendar;
