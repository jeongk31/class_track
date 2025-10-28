import { useState, useEffect } from 'react';
import { DAYS_OF_WEEK_KOREAN, PERIODS_PER_DAY } from '../../data/scheduleData';
import './ScheduleEditor.css';

const ScheduleEditor = ({ weeklySchedule, classes, semesterRange, onScheduleUpdate, onClose }) => {
  // Helper function to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to get date 2 weeks from today
  const getTwoWeeksFromToday = () => {
    const today = new Date();
    today.setDate(today.getDate() + 14);
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Helper function to create an empty schedule
  const getEmptySchedule = () => {
    const emptySchedule = {};
    const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    dayNames.forEach(day => {
      emptySchedule[day] = {};
      for (let i = 1; i <= PERIODS_PER_DAY; i++) {
        emptySchedule[day][i] = null;
      }
    });
    return emptySchedule;
  };

  const [localSchedule, setLocalSchedule] = useState(getEmptySchedule);
  const [draggedClass, setDraggedClass] = useState(null);
  const [startDate, setStartDate] = useState(getTodayDate());
  const [endDate, setEndDate] = useState(getTwoWeeksFromToday());

  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  
  const handleDragStart = (e, classId) => {
    setDraggedClass(classId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, day, period) => {
    e.preventDefault();
    
    if (draggedClass) {
      setLocalSchedule(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          [period]: draggedClass
        }
      }));
    }
    
    setDraggedClass(null);
  };
  
  const removeClass = (day, period) => {
    setLocalSchedule(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        [period]: null
      }
    }));
  };
  
  const handleSave = () => {
    if (!startDate || !endDate) {
      alert('시작 날짜와 종료 날짜를 모두 입력해주세요.');
      return;
    }
    
    if (new Date(startDate) >= new Date(endDate)) {
      alert('종료 날짜는 시작 날짜보다 늦어야 합니다.');
      return;
    }
    
    onScheduleUpdate(localSchedule, startDate, endDate);
    onClose();
  };
  
  const handleCancel = () => {
    onClose();
  };
  
  const getClassInfo = (classId) => {
    return classes.find(c => c.id === classId);
  };

  const clearAllSchedule = () => {
    const emptySchedule = {};
    dayNames.forEach(day => {
      emptySchedule[day] = {};
      for (let i = 1; i <= PERIODS_PER_DAY; i++) {
        emptySchedule[day][i] = null;
      }
    });
    setLocalSchedule(emptySchedule);
  };
  
  return (
    <div className="schedule-editor-overlay">
      <div className="schedule-editor">
        <div className="editor-header">
          <h2>주간 일정표 수정</h2>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="editor-content">
          {/* Date Range Section */}
          <div className="date-range-section">
            <div className="date-inputs">
              <div className="date-input-group">
                <label htmlFor="start-date">시작 날짜:</label>
                <input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <div className="date-input-group">
                <label htmlFor="end-date">종료 날짜:</label>
                <input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="date-input"
                />
              </div>
              <button
                className="clear-all-button"
                onClick={clearAllSchedule}
                title="전체 일정 초기화"
              >
                전체 초기화
              </button>
              <div className="date-range-actions">
                <button className="cancel-button" onClick={handleCancel}>
                  취소
                </button>
                <button className="save-button" onClick={handleSave}>
                  저장
                </button>
              </div>
            </div>
          </div>
          
          <div className="schedule-controls">
            <div className="class-palette">
              <h3>수업 목록</h3>
              {/* <p className="instruction">수업을 드래그하여 원하는 교시에 배치하세요</p> */}
              <div className="classes-grid">
                {classes.map(classData => (
                  <div
                    key={classData.id}
                    className="class-item"
                    draggable
                    onDragStart={(e) => handleDragStart(e, classData.id)}
                    style={{ 
                      borderColor: classData.color,
                      backgroundColor: classData.color + '20'
                    }}
                  >
                    <div 
                      className="class-color-indicator"
                      style={{ backgroundColor: classData.color }}
                    />
                    <div className="class-name">{classData.name}</div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="schedule-grid">
              {/* <div className="schedule-header">
                <h3>주간 일정표</h3>
              </div> */}
              <div className="grid-container">
                {/* Header row */}
                <div className="grid-header">
                  <div className="period-header">교시</div>
                  {dayNames.map((day, index) => (
                    <div key={day} className="day-header">
                      <div className="day-name">{DAYS_OF_WEEK_KOREAN[index + 1]}</div>
                    </div>
                  ))}
                </div>
                
                {/* Period rows */}
                {Array.from({ length: PERIODS_PER_DAY }, (_, periodIndex) => {
                  const period = periodIndex + 1;
                  return (
                    <div key={period} className="period-row">
                      <div className="period-number">{period}교시</div>
                      {dayNames.map(day => {
                        const classId = localSchedule[day]?.[period];
                        const classInfo = classId ? getClassInfo(classId) : null;
                        
                        return (
                          <div
                            key={`${day}-${period}`}
                            className={`period-cell ${classId ? 'has-class' : 'empty'}`}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, day, period)}
                          >
                            {classId ? (
                              <div className="scheduled-class">
                                <div 
                                  className="class-indicator"
                                  style={{ backgroundColor: classInfo.color }}
                                />
                                <span className="class-label">{classInfo.name}</span>
                                <button 
                                  className="remove-class"
                                  onClick={() => removeClass(day, period)}
                                  title="수업 제거"
                                >
                                  ×
                                </button>
                              </div>
                            ) : (
                              <div className="drop-zone">
                                <span className="drop-hint">수업 드롭</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor;
