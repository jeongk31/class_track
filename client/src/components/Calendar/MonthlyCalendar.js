import React from 'react';
import { DAYS_OF_WEEK_KOREAN, generateCalendarEvents, isClassCompleted, toggleClassCompletion, isHoliday } from '../../data/scheduleData';
import './Calendar.css';

const MonthlyCalendar = ({ currentDate, weeklySchedule, classes, startDate, endDate, classStatus, holidays, onDateClick, onClassStatusUpdate }) => {
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
  
  // Generate calendar events for this month
  const events = generateCalendarEvents(weeklySchedule, year, month, startDate, endDate);
  
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
    
    // Check if date is within semester period
    const semesterStart = new Date(startDate);
    semesterStart.setHours(0, 0, 0, 0);
    const semesterEnd = new Date(endDate);
    semesterEnd.setHours(0, 0, 0, 0);
    const isWithinSemester = date >= semesterStart && date <= semesterEnd;
    const isHolidayDay = isHoliday(date, holidays);
    
    days.push({
      day,
      date,
      classes: dayEvents ? dayEvents.classes : [],
      isWithinSemester,
      isHoliday: isHolidayDay
    });
  }
  
  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };

  const handleClassCheck = (e, date, classId) => {
    e.stopPropagation();
    const newClassStatus = toggleClassCompletion(classStatus, date, classId);
    onClassStatusUpdate(newClassStatus);
  };

  const handleClassClick = (e, date, classId) => {
    e.stopPropagation();
    const newClassStatus = toggleClassCompletion(classStatus, date, classId);
    onClassStatusUpdate(newClassStatus);
  };
  
  const formatMonthYear = (date) => {
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long' 
    });
  };
  
  return (
    <div className="monthly-calendar">
      <div className="calendar-header">
        <h2>{formatMonthYear(currentDate)}</h2>
      </div>
      
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
              className={`calendar-day ${dayData ? 'has-content' : 'empty'} ${dayData && !dayData.isWithinSemester ? 'outside-semester' : ''} ${dayData && dayData.isHoliday ? 'holiday' : ''}`}
              onClick={() => dayData && dayData.isWithinSemester && !dayData.isHoliday && onDateClick(dayData.date)}
            >
              {dayData && (
                <>
                  <div className="day-number">{dayData.day}</div>
                  {dayData.isHoliday && (
                    <div className="holiday-indicator">
                      <span>공휴일</span>
                    </div>
                  )}
                  {dayData.isWithinSemester && !dayData.isHoliday && dayData.classes.length > 0 && (
                    <div className="day-classes">
                      {dayData.classes.map(classId => {
                        const classData = classes.find(c => c.id === classId);
                        const isCompleted = isClassCompleted(classStatus, dayData.date, classId);
                        return (
                          <div
                            key={classId}
                            className={`class-bar ${isCompleted ? 'completed' : ''}`}
                            style={{ backgroundColor: getClassColor(classId) }}
                            title={classData ? classData.name : `Class ${classId}`}
                            onClick={(e) => handleClassClick(e, dayData.date, classId)}
                          >
                            <button
                              className="class-check-button"
                              onClick={(e) => handleClassCheck(e, dayData.date, classId)}
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
                  {!dayData.isWithinSemester && !dayData.isHoliday && (
                    <div className="outside-semester-indicator">
                      <span>학기 외</span>
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
