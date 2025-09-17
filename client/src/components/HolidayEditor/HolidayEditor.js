import React, { useState } from 'react';
import './HolidayEditor.css';

const HolidayEditor = ({ holidays, onHolidaysUpdate, onClose }) => {
  const [newHoliday, setNewHoliday] = useState('');
  const [holidayName, setHolidayName] = useState('');
  
  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      const updatedHolidays = [...holidays, newHoliday].sort();
      onHolidaysUpdate(updatedHolidays);
      setNewHoliday('');
      setHolidayName('');
    }
  };
  
  const handleRemoveHoliday = (holidayToRemove) => {
    const updatedHolidays = holidays.filter(holiday => holiday !== holidayToRemove);
    onHolidaysUpdate(updatedHolidays);
  };
  
  const formatHolidayDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };
  
  const getHolidayName = (dateStr) => {
    const holidayNames = {
      '2025-01-01': '신정',
      '2025-01-28': '설날',
      '2025-01-29': '설날',
      '2025-01-30': '설날',
      '2025-03-01': '삼일절',
      '2025-05-05': '어린이날',
      '2025-05-12': '부처님오신날',
      '2026-05-24': '부처님오신날',
      '2025-06-06': '현충일',
      '2025-08-15': '광복절',
      '2025-09-16': '추석',
      '2025-09-17': '추석',
      '2025-09-18': '추석',
      '2026-10-05': '추석',
      '2026-10-06': '추석',
      '2026-10-07': '추석',
      '2025-10-03': '개천절',
      '2025-10-09': '한글날',
      '2025-12-25': '성탄절',
      '2026-01-01': '신정',
      '2026-01-28': '설날',
      '2026-01-29': '설날',
      '2026-01-30': '설날',
      '2026-03-01': '삼일절',
      '2026-05-05': '어린이날',
      '2026-06-06': '현충일',
      '2026-08-15': '광복절',
      '2026-10-03': '개천절',
      '2026-10-09': '한글날',
      '2026-12-25': '성탄절'
    };
    return holidayNames[dateStr] || '공휴일';
  };
  
  return (
    <div className="holiday-editor-overlay">
      <div className="holiday-editor">
        <div className="holiday-editor-header">
          <h2>공휴일 편집</h2>
          <button className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className="holiday-editor-content">
          {/* Add New Holiday */}
          <div className="add-holiday-section">
            <h3>공휴일 추가</h3>
            <div className="add-holiday-form">
              <input
                type="date"
                value={newHoliday}
                onChange={(e) => setNewHoliday(e.target.value)}
                className="date-input"
                placeholder="날짜 선택"
              />
              <input
                type="text"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="name-input"
                placeholder="공휴일 이름 (선택사항)"
              />
              <button 
                className="add-button"
                onClick={handleAddHoliday}
                disabled={!newHoliday}
              >
                추가
              </button>
            </div>
          </div>
          
          {/* Holidays List */}
          <div className="holidays-list-section">
            <h3>등록된 공휴일 ({holidays.length}개)</h3>
            <div className="holidays-list">
              {holidays.length === 0 ? (
                <div className="no-holidays">
                  등록된 공휴일이 없습니다.
                </div>
              ) : (
                holidays.map((holiday, index) => (
                  <div key={index} className="holiday-item">
                    <div className="holiday-info">
                      <div className="holiday-date">
                        {formatHolidayDate(holiday)}
                      </div>
                      <div className="holiday-name">
                        {getHolidayName(holiday)}
                      </div>
                    </div>
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveHoliday(holiday)}
                      title="삭제"
                    >
                      ×
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        <div className="holiday-editor-footer">
          <button className="close-footer-button" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};

export default HolidayEditor;

