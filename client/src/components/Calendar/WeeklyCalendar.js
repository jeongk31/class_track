import { useCallback, useEffect, useRef, useState } from 'react';
import { DAYS_OF_WEEK, DAYS_OF_WEEK_KOREAN, PERIODS_PER_DAY, isClassCompleted, toggleClassCompletion, isHoliday } from '../../data/scheduleData';
import './Calendar.css';

const WeeklyCalendar = ({ currentDate, classes, classEntries, startDate, endDate, classStatus, holidays, onClassStatusUpdate, onCommentsUpdate }) => {
  const saveTimeoutRef = useRef({});
  const [hasPendingSaves, setHasPendingSaves] = useState(false);
  // Get the start of the week (Monday)
  const startOfWeek = new Date(currentDate);
  startOfWeek.setHours(0, 0, 0, 0); // Normalize to midnight
  const dayOfWeek = currentDate.getDay();
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday = 1
  startOfWeek.setDate(currentDate.getDate() + daysToMonday);

  // Generate week days (Monday to Friday only)
  const weekDays = [];

  for (let i = 0; i < 5; i++) {
    const date = new Date(startOfWeek);
    date.setDate(startOfWeek.getDate() + i);
    date.setHours(0, 0, 0, 0); // Normalize to midnight
    const dayName = DAYS_OF_WEEK[date.getDay()];
    const isHolidayDay = isHoliday(date, holidays);

    // Build schedule from database entries
    const daySchedule = {};
    if (classEntries) {
      const dateStr = date.toISOString().split('T')[0];
      const entriesForDate = classEntries.filter(entry => entry.date === dateStr);

      entriesForDate.forEach(entry => {
        if (entry.class_type_id !== null) {
          daySchedule[entry.period] = entry.class_type_id;
        }
      });
    }

    weekDays.push({
      date,
      dayName,
      schedule: daySchedule,
      isHoliday: isHolidayDay
    });
  }
  
  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };

  const handleClassCheck = (date, classId, period) => {
    const statusForDate = classStatus(date);
    const key = `${classId}-${period}`;
    const currentStatus = statusForDate[key] || false;
    onClassStatusUpdate(date, classId, period, !currentStatus);
  };

  const handleClassClick = (date, classId, period) => {
    const statusForDate = classStatus(date);
    const key = `${classId}-${period}`;
    const currentStatus = statusForDate[key] || false;
    onClassStatusUpdate(date, classId, period, !currentStatus);
  };

  // Handle comment changes with auto-save debounce
  const handleCommentChange = useCallback((date, classId, period, value) => {
    // Validate period is within allowed range
    if (period < 1 || period > PERIODS_PER_DAY) {
      console.warn(`Invalid period value: ${period}. Must be between 1 and ${PERIODS_PER_DAY}`);
      return;
    }

    const dateStr = date.toISOString().split('T')[0];
    const key = `${dateStr}-${classId}-${period}`;

    // Clear existing timeout for this specific comment
    if (saveTimeoutRef.current[key]) {
      clearTimeout(saveTimeoutRef.current[key]);
    }

    // Mark as having pending saves
    setHasPendingSaves(true);

    // Set new timeout to auto-save after 500ms of no typing
    saveTimeoutRef.current[key] = setTimeout(() => {
      onCommentsUpdate(date, classId, period, value);
      delete saveTimeoutRef.current[key];

      // Check if there are any remaining pending saves
      if (Object.keys(saveTimeoutRef.current).length === 0) {
        setHasPendingSaves(false);
      }
    }, 500);
  }, [onCommentsUpdate]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(saveTimeoutRef.current).forEach(timeout => clearTimeout(timeout));
    };
  }, []);

  // Add beforeunload warning if there are pending saves
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasPendingSaves) {
        e.preventDefault();
        e.returnValue = ''; // Modern browsers require this
        return ''; // For older browsers
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasPendingSaves]);

  return (
    <div className="weekly-calendar">
      
      <div className="weekly-grid">
        {/* Day headers */}
        <div className="weekly-day-headers">
          <div className="time-header">시간</div>
          {weekDays.map((dayData, index) => (
            <div key={index} className={`weekly-day-header ${dayData.isHoliday ? 'holiday' : ''}`}>
              <div className="day-name">{DAYS_OF_WEEK_KOREAN[dayData.date.getDay()]}</div>
              <div className="day-date">{dayData.date.getDate()}</div>
              {dayData.isHoliday && (
                <div className="holiday-indicator">공휴일</div>
              )}
            </div>
          ))}
        </div>
        
        {/* Periods */}
        {Array.from({ length: PERIODS_PER_DAY }, (_, periodIndex) => {
          const period = periodIndex + 1;
          return (
            <div key={period} className="weekly-period-row">
              <div className="period-number">{period}교시</div>
              {weekDays.map((dayData, dayIndex) => {
                const classId = dayData.schedule[period];
                const hasClass = classId !== null && classId !== undefined && !dayData.isHoliday;

                let isCompleted = false;
                if (hasClass) {
                  const statusForDate = classStatus(dayData.date);
                  const key = `${classId}-${period}`;
                  isCompleted = statusForDate[key] || false;
                }

                // Get comment directly from classEntries database
                let comment = '';
                if (hasClass && classEntries) {
                  const dateStr = dayData.date.toISOString().split('T')[0];
                  const entry = classEntries.find(
                    e => e.date === dateStr && e.class_type_id === classId && e.period === period
                  );
                  comment = entry?.notes || '';
                }

                return (
                  <div
                    key={dayIndex}
                    className={`period-cell ${hasClass ? 'has-class' : 'no-class'} ${dayData.isHoliday ? 'holiday' : ''}`}
                  >
                    {hasClass && (
                      <div className="weekly-class-container">
                        <div 
                          className={`weekly-class-bar ${isCompleted ? 'completed' : ''}`}
                          style={{ backgroundColor: getClassColor(classId) }}
                          onClick={(e) => {
                            // Don't trigger if clicking on textarea or its container
                            if (e.target.closest('.weekly-class-comment')) return;
                            handleClassClick(dayData.date, classId, period);
                          }}
                        >
                          <button
                            className="class-check-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleClassCheck(dayData.date, classId, period);
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
                            key={`${dayData.date.toISOString().split('T')[0]}-${classId}-${period}`}
                            defaultValue={comment}
                            onChange={(e) => {
                              e.stopPropagation();
                              handleCommentChange(dayData.date, classId, period, e.target.value);
                            }}
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
