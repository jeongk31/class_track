import React, { useState } from 'react';
import './DateRangeEditor.css';

const DateRangeEditor = ({ onDateRangeSelect, onClose, startDate, endDate }) => {
  const [localStartDate, setLocalStartDate] = useState(startDate || '');
  const [localEndDate, setLocalEndDate] = useState(endDate || '');
  const [error, setError] = useState('');

  const handleSave = () => {
    // Validate dates
    if (!localStartDate || !localEndDate) {
      setError('시작일과 종료일을 모두 선택해주세요.');
      return;
    }

    const start = new Date(localStartDate);
    const end = new Date(localEndDate);

    if (start > end) {
      setError('시작일이 종료일보다 늦을 수 없습니다.');
      return;
    }

    // Calculate number of days
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;

    if (daysDiff > 365) {
      setError('일정 변경은 최대 1년(365일)까지만 가능합니다.');
      return;
    }

    setError('');
    onDateRangeSelect(localStartDate, localEndDate);
    onClose();
  };

  const handleCancel = () => {
    setLocalStartDate(startDate || '');
    setLocalEndDate(endDate || '');
    setError('');
    onClose();
  };

  const formatDateRange = () => {
    if (!localStartDate || !localEndDate) return '';
    
    const start = new Date(localStartDate);
    const end = new Date(localEndDate);
    const timeDiff = end.getTime() - start.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
    
    return `${daysDiff}일간 (${start.toLocaleDateString('ko-KR')} ~ ${end.toLocaleDateString('ko-KR')})`;
  };

  return (
    <div className="date-range-editor-overlay">
      <div className="date-range-editor">
        <div className="editor-header">
          <h2>일정 변경 날짜 범위 선택</h2>
          <button className="close-button" onClick={handleCancel}>
            ×
          </button>
        </div>
        
        <div className="editor-content">
          <div className="date-inputs">
            <div className="date-input-group">
              <label htmlFor="start-date">시작일</label>
              <input
                id="start-date"
                type="date"
                value={localStartDate}
                onChange={(e) => setLocalStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="date-input-group">
              <label htmlFor="end-date">종료일</label>
              <input
                id="end-date"
                type="date"
                value={localEndDate}
                onChange={(e) => setLocalEndDate(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
          
          {localStartDate && localEndDate && (
            <div className="date-range-preview">
              <h3>선택된 기간</h3>
              <p>{formatDateRange()}</p>
            </div>
          )}
          
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          
          <div className="instructions">
            <h3>안내사항</h3>
            <ul>
              <li>선택한 날짜 범위에 대해 일정을 변경할 수 있습니다.</li>
              <li>기존 주간 일정 템플릿을 기반으로 새로운 일정을 만들 수 있습니다.</li>
              <li>변경된 일정은 해당 날짜 범위에만 적용됩니다.</li>
              <li>최대 1년(365일)까지 선택 가능합니다.</li>
            </ul>
          </div>
        </div>
        
        <div className="editor-actions">
          <button className="cancel-button" onClick={handleCancel}>
            취소
          </button>
          <button className="save-button" onClick={handleSave}>
            일정 편집하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default DateRangeEditor;