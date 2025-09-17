import React, { useState, useCallback, useEffect } from 'react';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_KOREAN, PERIODS_PER_DAY, isClassCompleted, toggleClassCompletion, getClassComment, setClassComment, isHoliday } from '../../data/scheduleData';
import './Calendar.css';

const WeeklyCalendar = ({ currentDate, weeklySchedule, classes, startDate, endDate, classStatus, comments, holidays, onClassStatusUpdate, onCommentsUpdate }) => {
  // Local state for managing comment inputs to prevent text deletion issues
  const [localComments, setLocalComments] = useState({});
  
  // Sync local comments with global comments when they change
  useEffect(() => {
    setLocalComments({});
  }, [comments]);
  
  // Get the start of the week (Sunday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0); // Normalize to midnight
  const dayOfWeek = currentDate.getDay();
  const daysToSunday = -dayOfWeek; // Sunday = 0, Monday = 1, etc.
  startOfWeek.setDate(currentDate.getDate() + daysToSunday);
  
  // Generate week days
  const weekDays = [];
  const semesterStart = new Date(startDate);
  semesterStart.setHours(0, 0, 0, 0);
  const semesterEnd = new Date(endDate);
  semesterEnd.setHours(0, 0, 0, 0);
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    date.setHours(0, 0, 0, 0); // Normalize to midnight
    const dayName = DAYS_OF_WEEK[date.getDay()];
    const daySchedule = weeklySchedule[dayName] || {};
    const isWithinSemester = date >= semesterStart && date <= semesterEnd;
    const isHolidayDay = isHoliday(date, holidays);
    
    weekDays.push({
      date,
      dayName,
      schedule: daySchedule,
      isWithinSemester,
      isHoliday: isHolidayDay
    });
  }
  
  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };

  const handleClassCheck = (date, classId) => {
    const newClassStatus = toggleClassCompletion(classStatus, date, classId);
    onClassStatusUpdate(newClassStatus);
  };

  const handleClassClick = (date, classId) => {
    const newClassStatus = toggleClassCompletion(classStatus, date, classId);
    onClassStatusUpdate(newClassStatus);
  };

  const handleCommentChange = useCallback((date, classId, comment) => {
    const key = `${date.toISOString().split('T')[0]}-${classId}`;
    
    // Update local state immediately for responsive UI
    setLocalComments(prev => ({
      ...prev,
      [key]: comment
    }));
    
    // Update global state immediately as well
    const newComments = setClassComment(comments, date, classId, comment);
    onCommentsUpdate(newComments);
  }, [comments, onCommentsUpdate]);
  
  const formatWeekRange = () => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday is 6 days after Monday
    
    return `${startOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
  };
  
  return (
    <div className="weekly-calendar">
      <div className="calendar-header">
        <h2>주간 일정 - {formatWeekRange()}</h2>
      </div>
      
      <div className="weekly-grid">
        {/* Day headers */}
        <div className="weekly-day-headers">
          <div className="time-header">시간</div>
          {weekDays.map((dayData, index) => (
            <div key={index} className={`weekly-day-header ${!dayData.isWithinSemester ? 'outside-semester' : ''} ${dayData.isHoliday ? 'holiday' : ''}`}>
              <div className="day-name">{DAYS_OF_WEEK_KOREAN[dayData.date.getDay()]}</div>
              <div className="day-date">{dayData.date.getDate()}</div>
              {dayData.isHoliday && (
                <div className="holiday-indicator">공휴일</div>
              )}
              {!dayData.isWithinSemester && !dayData.isHoliday && (
                <div className="semester-indicator">학기 외</div>
              )}
            </div>
          ))}
        </div>
        
        {/* Periods */}
        {Array.from({ length: PERIODS_PER_DAY }, (_, periodIndex) => {
          const period = periodIndex + 1;
          return (
            <div key={periodIndex} className="weekly-period-row">
              <div className="period-number">{period}교시</div>
              {weekDays.map((dayData, dayIndex) => {
                const classId = dayData.schedule[period];
                const hasClass = classId !== null && classId !== undefined && dayData.isWithinSemester && !dayData.isHoliday;
                const isCompleted = hasClass ? isClassCompleted(classStatus, dayData.date, classId) : false;
                
                // Use local state for comment if available, otherwise fall back to global state
                const commentKey = hasClass ? `${dayData.date.toISOString().split('T')[0]}-${classId}` : '';
                const comment = hasClass ? (localComments[commentKey] !== undefined ? localComments[commentKey] : getClassComment(comments, dayData.date, classId)) : '';
                
                return (
                  <div 
                    key={dayIndex} 
                    className={`period-cell ${hasClass ? 'has-class' : 'no-class'} ${!dayData.isWithinSemester ? 'outside-semester' : ''} ${dayData.isHoliday ? 'holiday' : ''}`}
                  >
                    {hasClass && (
                      <div className="weekly-class-container">
                        <div 
                          className={`weekly-class-bar ${isCompleted ? 'completed' : ''}`}
                          style={{ backgroundColor: getClassColor(classId) }}
                          onClick={() => handleClassClick(dayData.date, classId)}
                        >
                          <button
                            className="class-check-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClassCheck(dayData.date, classId);
                            }}
                            title={isCompleted ? '완료 취소' : '완료 표시'}
                          >
                            {isCompleted ? '✓' : '○'}
                          </button>
                          <span className="class-name">
                            {classId === 11 ? '동아리' : `${classId}반`}
                          </span>
                        </div>
                        <div className="weekly-class-comment">
                          <textarea
                            value={comment}
                            onChange={(e) => handleCommentChange(dayData.date, classId, e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            onFocus={(e) => e.stopPropagation()}
                            placeholder="NOTES..."
                            className="comment-textarea"
                          />
                        </div>
                      </div>
                    )}
                    {dayData.isHoliday && (
                      <div className="holiday-text">공휴일</div>
                    )}
                    {!dayData.isWithinSemester && !dayData.isHoliday && (
                      <div className="outside-semester-text">-</div>
                    )}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyCalendar;
