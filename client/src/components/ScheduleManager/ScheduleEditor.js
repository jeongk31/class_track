import React, { useState } from 'react';
import { DAYS_OF_WEEK_KOREAN, PERIODS_PER_DAY } from '../../data/scheduleData';
import './ScheduleEditor.css';

const ScheduleEditor = ({ weeklySchedule, classes, onScheduleUpdate, onClose, dateRange, onSave }) => {
  const [localSchedule, setLocalSchedule] = useState(weeklySchedule);
  const [draggedClass, setDraggedClass] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const dayNames = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
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
  
  const handleSave = async () => {
    if (!dateRange) {
      // Legacy behavior for weekly schedule updates
      onScheduleUpdate(localSchedule);
      onClose();
      return;
    }

    setIsSaving(true);
    try {
      await onSave(dateRange.startDate, dateRange.endDate, localSchedule);
      onClose();
    } catch (error) {
      console.error('Failed to save schedule:', error);
      alert('일정 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setLocalSchedule(weeklySchedule);
    onClose();
  };
  
  const getClassInfo = (classId) => {
    return classes.find(c => c.id === classId);
  };
  
  const clearDay = (day) => {
    const clearedDay = {};
    for (let i = 1; i <= PERIODS_PER_DAY; i++) {
      clearedDay[i] = null;
    }
    
    setLocalSchedule(prev => ({
      ...prev,
      [day]: clearedDay
    }));
  };
  
  return (
    <div className="schedule-editor-overlay">
      <div className="schedule-editor">
        <div className="editor-header">
          <h2>
            {dateRange ? 
              `일정 편집 (${new Date(dateRange.startDate).toLocaleDateString('ko-KR')} ~ ${new Date(dateRange.endDate).toLocaleDateString('ko-KR')})` : 
              '주간 일정 편집'
            }
          </h2>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="editor-content">
          <div className="class-palette">
            <h3>수업 목록</h3>
            <p className="instruction">수업을 드래그하여 원하는 교시에 배치하세요</p>
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
            <h3>주간 일정표</h3>
            <div className="grid-container">
              {/* Header row */}
              <div className="grid-header">
                <div className="period-header">교시</div>
                {dayNames.map((day, index) => (
                  <div key={day} className="day-header">
                    <div className="day-name">{DAYS_OF_WEEK_KOREAN[index + 1]}</div>
                    <button 
                      className="clear-day-button"
                      onClick={() => clearDay(day)}
                      title="해당 요일 초기화"
                    >
                      ×
                    </button>
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
        
        <div className="editor-actions">
          <button className="cancel-button" onClick={handleCancel} disabled={isSaving}>
            취소
          </button>
          <button className="save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleEditor;
