import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { generateClasses, generateDefaultWeeklySchedule, generateDefaultSemesterDates, generateDefaultClassStatus, generateDefaultComments, generateDefaultHolidays } from './data/scheduleData';
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
  const [scheduleData, setScheduleData] = useState({
    classes: generateClasses(),
    weeklySchedule: generateDefaultWeeklySchedule(),
    ...generateDefaultSemesterDates(),
    classStatus: generateDefaultClassStatus(),
    comments: generateDefaultComments(),
    holidays: generateDefaultHolidays()
  });
  const [showScheduleEditor, setShowScheduleEditor] = useState(false);
  const [showDateRangeEditor, setShowDateRangeEditor] = useState(false);
  const [showHolidayEditor, setShowHolidayEditor] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load schedule data on component mount
  useEffect(() => {
    loadScheduleData();
  }, []);

  const loadScheduleData = async () => {
    try {
      setLoading(true);
      const data = await api.getSchedule();
      setScheduleData(data);
      setError(null);
    } catch (err) {
      console.error('Failed to load schedule data:', err);
      setError('일정 데이터를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleUpdate = async (newWeeklySchedule) => {
    try {
      const updatedData = await api.updateWeeklySchedule(newWeeklySchedule);
      setScheduleData(updatedData);
    } catch (err) {
      console.error('Failed to update schedule:', err);
      setError('일정 업데이트에 실패했습니다.');
    }
  };

  const handleDateUpdate = async (startDate, endDate) => {
    try {
      const updatedData = await api.updateDates(startDate, endDate);
      setScheduleData(updatedData);
    } catch (err) {
      console.error('Failed to update dates:', err);
      setError('날짜 업데이트에 실패했습니다.');
    }
  };

  const handleClassStatusUpdate = async (classStatus) => {
    try {
      const updatedData = await api.updateClassStatus(classStatus);
      setScheduleData(updatedData);
    } catch (err) {
      console.error('Failed to update class status:', err);
      setError('수업 상태 업데이트에 실패했습니다.');
    }
  };

  const handleCommentsUpdate = async (comments) => {
    try {
      const updatedData = await api.updateComments(comments);
      setScheduleData(updatedData);
    } catch (err) {
      console.error('Failed to update comments:', err);
      setError('댓글 업데이트에 실패했습니다.');
    }
  };

  const handleHolidaysUpdate = async (holidays) => {
    try {
      const updatedData = await api.updateHolidays(holidays);
      setScheduleData(updatedData);
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
        <button onClick={loadScheduleData} className="retry-button">
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>수업 일정</h1>
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
        {viewMode === 'monthly' && (
          <MonthlyCalendar
            currentDate={currentDate}
            weeklySchedule={scheduleData.weeklySchedule}
            classes={scheduleData.classes}
            startDate={scheduleData.startDate}
            endDate={scheduleData.endDate}
            classStatus={scheduleData.classStatus}
            holidays={scheduleData.holidays}
            onDateClick={handleDateClick}
            onClassStatusUpdate={handleClassStatusUpdate}
          />
        )}
        
        {viewMode === 'weekly' && (
          <WeeklyCalendar
            currentDate={currentDate}
            weeklySchedule={scheduleData.weeklySchedule}
            classes={scheduleData.classes}
            startDate={scheduleData.startDate}
            endDate={scheduleData.endDate}
            classStatus={scheduleData.classStatus}
            comments={scheduleData.comments}
            holidays={scheduleData.holidays}
            onClassStatusUpdate={handleClassStatusUpdate}
            onCommentsUpdate={handleCommentsUpdate}
          />
        )}
        
        {viewMode === 'statistics' && (
          <Statistics
            weeklySchedule={scheduleData.weeklySchedule}
            startDate={scheduleData.startDate}
            endDate={scheduleData.endDate}
            classStatus={scheduleData.classStatus}
            holidays={scheduleData.holidays}
            classes={scheduleData.classes}
          />
        )}
        
      </main>

      {showScheduleEditor && (
        <ScheduleEditor
          weeklySchedule={scheduleData.weeklySchedule}
          classes={scheduleData.classes}
          onScheduleUpdate={handleScheduleUpdate}
          onClose={() => setShowScheduleEditor(false)}
        />
      )}

      {showDateRangeEditor && (
        <DateRangeEditor
          startDate={scheduleData.startDate}
          endDate={scheduleData.endDate}
          onDateUpdate={handleDateUpdate}
          onClose={() => setShowDateRangeEditor(false)}
        />
      )}

      {showHolidayEditor && (
        <HolidayEditor
          holidays={scheduleData.holidays}
          onHolidaysUpdate={handleHolidaysUpdate}
          onClose={() => setShowHolidayEditor(false)}
        />
      )}
    </div>
  );
}

export default App;