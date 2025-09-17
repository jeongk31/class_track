import React, { useState } from 'react';
import './DateRangeEditor.css';

const DateRangeEditor = ({ startDate, endDate, onDateUpdate, onClose }) => {
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);
  
  const handleSave = () => {
    if (new Date(localStartDate) > new Date(localEndDate)) {
      alert('시작 날짜는 종료 날짜보다 이전이어야 합니다.');
      return;
    }
    
    onDateUpdate(localStartDate, localEndDate);
    onClose();
  };
  
  const handleCancel = () => {
    setLocalStartDate(startDate);
    setLocalEndDate(endDate);
    onClose();
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };
  
  return (
    <div className="date-range-editor-overlay">
      <div className="date-range-editor">
        <div className="editor-header">
          <h2>학기 날짜 설정</h2>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="editor-content">
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="start-date">시작 날짜</label>
              <input
                id="start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="date-input"
              />
              <div className="date-display">
                {formatDate(localStartDate)}
              </div>
            </div>
            
            <div className="date-input-group">
              <label htmlFor="end-date">종료 날짜</label>
              <input
                id="end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="date-input"
              />
              <div className="date-display">
                {formatDate(localEndDate)}
              </div>
            </div>
          </div>
          
          <div className="date-info">
            <h4>현재 설정</h4>
            <div className="current-dates">
              <div className="current-date-item">
                <strong>시작:</strong> {formatDate(startDate)}
              </div>
              <div className="current-date-item">
                <strong>종료:</strong> {formatDate(endDate)}
              </div>
              <div className="current-date-item">
                <strong>기간:</strong> {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24))}일
              </div>
            </div>
          </div>
          
          <div className="preview-info">
            <h4>새로운 설정</h4>
            <div className="preview-dates">
              <div className="preview-date-item">
                <strong>시작:</strong> {formatDate(localStartDate)}
              </div>
              <div className="preview-date-item">
                <strong>종료:</strong> {formatDate(localEndDate)}
              </div>
              <div className="preview-date-item">
                <strong>기간:</strong> {Math.ceil((new Date(localEndDate) - new Date(localStartDate)) / (1000 * 60 * 60 * 24))}일
              </div>
            </div>
          </div>
        </div>
        
        <div className="editor-actions">
          <button className="cancel-button" onClick={handleCancel}>
            취소
          </button>
          <button className="save-button" onClick={handleSave}>
            저장
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeEditor;

