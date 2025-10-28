import React, { useState } from 'react';
import './HolidayEditor.css';

const HolidayEditor = ({ holidays, holidayData, onAddHoliday, onRemoveHoliday, onClose }) => {
  const [newHoliday, setNewHoliday] = useState('');
  const [holidayName, setHolidayName] = useState('');
  const [filterYear, setFilterYear] = useState('all');
  const [filterMonth, setFilterMonth] = useState('all');

  console.log('HolidayEditor received holidays prop:', holidays);
  console.log('HolidayEditor received holidayData prop:', holidayData);

  const handleAddHoliday = () => {
    if (newHoliday && !holidays.includes(newHoliday)) {
      onAddHoliday(newHoliday, holidayName);
      setNewHoliday('');
      setHolidayName('');
    }
  };

  const handleRemoveHoliday = (holidayToRemove) => {
    onRemoveHoliday(holidayToRemove);
  };

  const formatHolidayDate = (dateStr) => {
    // Parse date as local date to avoid timezone issues
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const getHolidayName = (dateStr) => {
    // Get name from holidayData
    const holiday = holidayData?.find(h => h.date === dateStr);
    return holiday?.name || '공휴일';
  };

  // Group holidays by year and month
  const groupHolidaysByYearMonth = (holidayList) => {
    const grouped = {};

    holidayList.forEach(holiday => {
      // Parse date as local date to avoid timezone issues
      const [year, month, day] = holiday.split('-').map(Number);
      const key = `${year}-${String(month).padStart(2, '0')}`;

      if (!grouped[key]) {
        grouped[key] = {
          year,
          month,
          holidays: []
        };
      }

      grouped[key].holidays.push(holiday);
    });

    // Sort groups by year-month, then sort holidays within each group
    return Object.keys(grouped)
      .sort()
      .map(key => ({
        ...grouped[key],
        holidays: grouped[key].holidays.sort()
      }));
  };

  const getMonthName = (month) => {
    const monthNames = [
      '1월', '2월', '3월', '4월', '5월', '6월',
      '7월', '8월', '9월', '10월', '11월', '12월'
    ];
    return monthNames[month - 1];
  };

  // Get available years from holidays
  const getAvailableYears = () => {
    const years = new Set();
    holidays.forEach(holiday => {
      const date = new Date(holiday);
      years.add(date.getFullYear());
    });
    return Array.from(years).sort();
  };

  // Apply filters to holidays
  const getFilteredHolidays = () => {
    if (filterYear === 'all' && filterMonth === 'all') {
      return holidays;
    }

    return holidays.filter(holiday => {
      const date = new Date(holiday);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      const yearMatch = filterYear === 'all' || year === parseInt(filterYear);
      const monthMatch = filterMonth === 'all' || month === parseInt(filterMonth);

      return yearMatch && monthMatch;
    });
  };

  const handleResetFilter = () => {
    setFilterYear('all');
    setFilterMonth('all');
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
          {/* Left Side */}
          <div className="left-side-content">
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

            {/* Filter Section */}
            <div className="filter-section">
              <h3>필터</h3>
              <div className="filter-controls">
                <div className="filter-group">
                  <label>년도</label>
                  <select
                    className="filter-select"
                    value={filterYear}
                    onChange={(e) => setFilterYear(e.target.value)}
                  >
                    <option value="all">전체</option>
                    {getAvailableYears().map(year => (
                      <option key={year} value={year}>{year}년</option>
                    ))}
                  </select>
                </div>
                <div className="filter-group">
                  <label>월</label>
                  <select
                    className="filter-select"
                    value={filterMonth}
                    onChange={(e) => setFilterMonth(e.target.value)}
                  >
                    <option value="all">전체</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                      <option key={month} value={month}>{month}월</option>
                    ))}
                  </select>
                </div>
                <button className="filter-reset" onClick={handleResetFilter}>
                  필터 초기화
                </button>
              </div>
            </div>
          </div>

          {/* Right Side - Holidays List */}
          <div className="holidays-list-section">
            <h3>등록된 공휴일 ({getFilteredHolidays().length}개)</h3>
            <div className="holidays-list">
              {getFilteredHolidays().length === 0 ? (
                <div className="no-holidays">
                  {holidays.length === 0 ? '등록된 공휴일이 없습니다.' : '조건에 맞는 공휴일이 없습니다.'}
                </div>
              ) : (
                groupHolidaysByYearMonth(getFilteredHolidays()).map((group, groupIndex) => (
                  <div key={groupIndex} className="holiday-group">
                    <div className="holiday-group-header">
                      <span className="group-year">{group.year}년</span>
                      <span className="group-month">{getMonthName(group.month)}</span>
                      <span className="group-count">({group.holidays.length}개)</span>
                    </div>
                    <div className="holiday-group-items">
                      {group.holidays.map((holiday, index) => (
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
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HolidayEditor;

