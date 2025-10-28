import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { generateDefaultWeeklySchedule, generateDefaultHolidays } from './data/scheduleData';
import MonthlyCalendar from './components/Calendar/MonthlyCalendar';
import WeeklyCalendar from './components/Calendar/WeeklyCalendar';
import ScheduleEditor from './components/ScheduleManager/ScheduleEditor';
import DateRangeEditor from './components/ScheduleManager/DateRangeEditor';
import Statistics from './components/Statistics/Statistics';
import HolidayEditor from './components/HolidayEditor/HolidayEditor';
import './App.css';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('monthly'); // monthly, weekly, statistics
  const [classTypes, setClassTypes] = useState([]);
  const [semesterRange, setSemesterRange] = useState(null);
  const [weeklySchedule, setWeeklySchedule] = useState(generateDefaultWeeklySchedule());
  const [classEntries, setClassEntries] = useState([]);
  const [holidays, setHolidays] = useState(generateDefaultHolidays());
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showDateRangeEditor, setShowDateRangeEditor] = useState(false);
  const [showHolidayEditor, setShowHolidayEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  // Load class entries when semester range changes
  useEffect(() => {
    if (semesterRange) {
      loadClassEntries();
    }
  }, [semesterRange]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load class types
      const types = await api.getClassTypes();
      setClassTypes(types);
      
      // Load current semester range
      const semester = await api.getCurrentSemesterRange();
      setSemesterRange(semester);
      
      setError(null);
    } catch (err) {
      console.error('Failed to load initial data:', err);
      setError('데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadClassEntries = async () => {
    if (!semesterRange) return;
    
    try {
      const entries = await api.getClassEntries(
        semesterRange.start_date,
        semesterRange.end_date
      );
      setClassEntries(entries);
    } catch (err) {
      console.error('Failed to load class entries:', err);
      setError('수업 데이터를 불러오는데 실패했습니다.');
    }
  };

  const handleScheduleUpdate = async (newWeeklySchedule, startDate, endDate) => {
    try {
      setWeeklySchedule(newWeeklySchedule);
      
      // Create class entries for the specified date range only
      if (startDate && endDate && semesterRange) {
        // Use the provided date range to create entries
        await api.createWeeklyScheduleEntries(
          newWeeklySchedule,
          semesterRange.id,
          startDate,
          endDate
        );
        
        // Reload class entries to show updates in calendar
        await loadClassEntries();
      } else if (semesterRange) {
        // Fall back to semester range if dates not provided
        await api.createWeeklyScheduleEntries(
          newWeeklySchedule,
          semesterRange.id,
          semesterRange.start_date,
          semesterRange.end_date
        );
        
        // Reload class entries
        await loadClassEntries();
      }
    } catch (err) {
      console.error('Failed to update schedule:', err);
      setError('일정 업데이트에 실패했습니다.');
    }
  };

  const handleDateUpdate = async (startDate, endDate) => {
    try {
      const updatedSemester = await api.updateSemesterRange(startDate, endDate);
      setSemesterRange(updatedSemester);
      
      // Reload class entries for new date range
      await loadClassEntries();
    } catch (err) {
      console.error('Failed to update dates:', err);
      setError('날짜 업데이트에 실패했습니다.');
    }
  };

  const handleClassStatusUpdate = async (date, classId, period, status) => {
    try {
      // Find the entry for this date, class, and period
      const dateStr = date.toISOString().split('T')[0];
      const entry = classEntries.find(
        e => e.date === dateStr && e.class_type_id === classId && e.period === period
      );
      
      if (entry) {
        await api.updateClassEntryStatus(entry.id, status);
        
        // Update local state
        setClassEntries(prev => 
          prev.map(e => 
            e.id === entry.id ? { ...e, status } : e
          )
        );
      }
    } catch (err) {
      console.error('Failed to update class status:', err);
      setError('수업 상태 업데이트에 실패했습니다.');
    }
  };

  const handleCommentsUpdate = async (date, classId, period, notes) => {
    try {
      // Validate period is within allowed range
      if (period < 1 || period > 7) {
        console.error(`Invalid period value: ${period}. Must be between 1 and 7.`);
        return;
      }
      
      // Find the entry for this date, class, and period
      const dateStr = date.toISOString().split('T')[0];
      const entry = classEntries.find(
        e => e.date === dateStr && e.class_type_id === classId && e.period === period
      );
      
      if (entry) {
        await api.updateClassEntryNotes(entry.id, notes);
        
        // Update local state
        setClassEntries(prev => 
          prev.map(e => 
            e.id === entry.id ? { ...e, notes } : e
          )
        );
      } else {
        // If no entry exists, create one
        if (semesterRange) {
          console.log('Creating new entry for comment:', { classId, semesterRangeId: semesterRange.id, dateStr, period, notes });
          const newEntry = await api.upsertClassEntry(classId, semesterRange.id, dateStr, period, false, notes);
          setClassEntries(prev => [...prev, newEntry]);
        }
      }
    } catch (err) {
      console.error('Failed to update comments:', err);
      setError('댓글 업데이트에 실패했습니다.');
    }
  };

  const handleHolidaysUpdate = async (newHolidays) => {
    try {
      setHolidays(newHolidays);
    } catch (err) {
      console.error('Failed to update holidays:', err);
      setError('공휴일 업데이트에 실패했습니다.');
    }
  };

  const handleDateClick = (date) => {
    setCurrentDate(date);
    setViewMode('weekly');
  };

  const navigateDate = (direction) => {
    const newDate = new Date(currentDate);
    
    switch (viewMode) {
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + direction);
        break;
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction * 7));
        break;
      default:
        break;
    }
    
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatCurrentDate = () => {
    switch (viewMode) {
      case 'monthly':
        return currentDate.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' });
      case 'weekly':
        const startOfWeek = new Date(currentDate);
        const dayOfWeek = currentDate.getDay();
        const daysToSunday = -dayOfWeek; // Sunday = 0, Monday = 1, etc.
        startOfWeek.setDate(currentDate.getDate() + daysToSunday);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        return `${startOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}`;
      case 'statistics':
        return '학기 통계';
      default:
        return '';
    }
  };

  // Convert class entries to the format expected by components
  const getClassStatusForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entriesForDate = classEntries.filter(entry => entry.date === dateStr);
    
    const status = {};
    entriesForDate.forEach(entry => {
      const key = `${entry.class_type_id}-${entry.period}`;
      status[key] = entry.status;
    });
    
    return status;
  };

  const getCommentsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entriesForDate = classEntries.filter(entry => entry.date === dateStr);
    
    const comments = {};
    entriesForDate.forEach(entry => {
      const key = `${entry.class_type_id}-${entry.period}`;
      comments[key] = entry.notes;
    });
    
    return comments;
  };
  
  // Get classes for a specific date from database entries
  const getClassesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    const entriesForDate = classEntries.filter(entry => entry.date === dateStr);
    
    const classIds = new Set();
    entriesForDate.forEach(entry => {
      if (entry.class_type_id !== null) {
        classIds.add(entry.class_type_id);
      }
    });
    
    return Array.from(classIds);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>일정을 불러오는 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-error">
        <h2>오류가 발생했습니다</h2>
        <p>{error}</p>
        <button onClick={loadInitialData} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>
            <img 
              src="/icon.png" 
              alt="Hello Kitty" 
              className="hello-kitty-icon"
            />
            수업 일정
          </h1>
          <div className="header-actions">
            <button 
              className="action-button"
              onClick={() => setShowScheduleEditor(true)}
            >
              주간 일정 편집
            </button>
            <button 
              className="action-button"
              onClick={() => setShowDateRangeEditor(true)}
            >
              학기 날짜 설정
            </button>
            <button 
              className="action-button"
              onClick={() => setShowHolidayEditor(true)}
            >
              공휴일 편집
            </button>
          </div>
        </div>
      </header>

      <nav className="view-navigation">
        <div className="nav-content">
          <div className="view-buttons">
            <button 
              className={`view-button ${viewMode === 'monthly' ? 'active' : ''}`}
              onClick={() => setViewMode('monthly')}
            >
              월간
            </button>
            <button 
              className={`view-button ${viewMode === 'weekly' ? 'active' : ''}`}
              onClick={() => setViewMode('weekly')}
            >
              주간
            </button>
            <button 
              className={`view-button ${viewMode === 'statistics' ? 'active' : ''}`}
              onClick={() => setViewMode('statistics')}
            >
              통계
            </button>
          </div>
          
          <div className="date-navigation">
            <button 
              className="nav-button"
              onClick={() => navigateDate(-1)}
            >
              ←
            </button>
            <div className="current-date-display">
              {formatCurrentDate()}
            </div>
            <button 
              className="nav-button"
              onClick={() => navigateDate(1)}
            >
              →
            </button>
            <button 
              className="today-button"
              onClick={goToToday}
            >
              오늘
            </button>
          </div>
        </div>
      </nav>

      <main className="app-main">
        {viewMode === 'monthly' && semesterRange && (
          <MonthlyCalendar
            currentDate={currentDate}
            weeklySchedule={weeklySchedule}
            classes={classTypes}
            classEntries={classEntries}
            startDate={semesterRange.start_date}
            endDate={semesterRange.end_date}
            classStatus={getClassStatusForDate}
            holidays={holidays}
            onDateClick={handleDateClick}
            onClassStatusUpdate={handleClassStatusUpdate}
          />
        )}
        
        {viewMode === 'weekly' && semesterRange && (
          <WeeklyCalendar
            currentDate={currentDate}
            weeklySchedule={weeklySchedule}
            classes={classTypes}
            classEntries={classEntries}
            startDate={semesterRange.start_date}
            endDate={semesterRange.end_date}
            classStatus={getClassStatusForDate}
            comments={getCommentsForDate}
            holidays={holidays}
            onClassStatusUpdate={handleClassStatusUpdate}
            onCommentsUpdate={handleCommentsUpdate}
          />
        )}
        
        {viewMode === 'statistics' && semesterRange && (
          <Statistics
            weeklySchedule={weeklySchedule}
            startDate={semesterRange.start_date}
            endDate={semesterRange.end_date}
            classStatus={getClassStatusForDate}
            holidays={holidays}
            classes={classTypes}
          />
        )}
        
      </main>

      {showScheduleEditor && (
        <ScheduleEditor
          weeklySchedule={weeklySchedule}
          classes={classTypes}
          semesterRange={semesterRange}
          onScheduleUpdate={handleScheduleUpdate}
          onClose={() => setShowScheduleEditor(false)}
        />
      )}

      {showDateRangeEditor && semesterRange && (
        <DateRangeEditor
          startDate={semesterRange.start_date}
          endDate={semesterRange.end_date}
          onDateUpdate={handleDateUpdate}
          onClose={() => setShowDateRangeEditor(false)}
        />
      )}

      {showHolidayEditor && (
        <HolidayEditor
          holidays={holidays}
          onHolidaysUpdate={handleHolidaysUpdate}
          onClose={() => setShowHolidayEditor(false)}
        />
      )}
    </div>
  );
}

export default App;