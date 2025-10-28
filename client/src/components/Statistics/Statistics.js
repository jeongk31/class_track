import React, { useState } from 'react';
import { calculateStatistics } from '../../data/scheduleData';
import './Statistics.css';

const Statistics = ({ weeklySchedule, startDate, endDate, classStatus, classEntries, holidays, classes, onDateUpdate }) => {
  const [filterStartDate, setFilterStartDate] = useState(startDate);
  const [filterEndDate, setFilterEndDate] = useState(endDate);
  const [viewStartDate, setViewStartDate] = useState(startDate);
  const [viewEndDate, setViewEndDate] = useState(endDate);

  // Calculate stats from classEntries instead of weeklySchedule
  const calculateStatsFromEntries = () => {
    if (!classEntries || classEntries.length === 0) {
      return {
        totalWeekdays: 0,
        completedWeekdays: 0,
        remainingWeekdays: 0,
        totalClasses: 0,
        completedClasses: 0,
        remainingClasses: 0,
        classStats: {}
      };
    }

    // Filter entries by date range
    const filteredEntries = classEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const start = new Date(viewStartDate);
      const end = new Date(viewEndDate);
      return entryDate >= start && entryDate <= end;
    });

    // Count unique days and calculate day statistics
    const uniqueDates = new Set();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const completedDates = new Set();
    const futureDates = new Set();

    let totalClasses = 0;
    let completedClasses = 0;
    const classStats = {};

    filteredEntries.forEach(entry => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      const dateStr = entry.date;

      // Track unique dates
      uniqueDates.add(dateStr);

      // Track completed days (days where all classes are completed)
      if (entryDate < today) {
        if (entry.status) {
          // Check if all classes for this day are completed
          const dayEntries = filteredEntries.filter(e => e.date === dateStr);
          const allCompleted = dayEntries.every(e => e.status);
          if (allCompleted) {
            completedDates.add(dateStr);
          }
        }
      } else {
        futureDates.add(dateStr);
      }

      const classId = entry.class_type_id;
      if (classId !== null) {
        totalClasses++;

        if (!classStats[classId]) {
          classStats[classId] = { total: 0, completed: 0 };
        }
        classStats[classId].total++;

        if (entry.status) {
          completedClasses++;
          classStats[classId].completed++;
        }
      }
    });

    const totalWeekdays = uniqueDates.size;
    const completedWeekdays = completedDates.size;
    const remainingWeekdays = totalWeekdays - completedWeekdays;

    return {
      totalWeekdays,
      completedWeekdays,
      remainingWeekdays,
      totalClasses,
      completedClasses,
      remainingClasses: totalClasses - completedClasses,
      classStats
    };
  };

  const stats = calculateStatsFromEntries();

  const getClassDisplayName = (classId) => {
    return classId === 11 ? '동아리' : `${classId}반`;
  };

  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };

  const handleApplyFilter = async () => {
    if (!filterStartDate || !filterEndDate) {
      alert('시작 날짜와 종료 날짜를 모두 입력해주세요.');
      return;
    }

    if (new Date(filterStartDate) > new Date(filterEndDate)) {
      alert('종료 날짜는 시작 날짜보다 늦거나 같아야 합니다.');
      return;
    }

    // Update the view dates to recalculate statistics
    setViewStartDate(filterStartDate);
    setViewEndDate(filterEndDate);

    // Save to Supabase
    if (onDateUpdate) {
      await onDateUpdate(filterStartDate, filterEndDate);
    }
  };

  return (
    <div className="statistics">
      <div className="statistics-header">
        <h2>학기 통계</h2>
        <div className="date-range-selector">
          <div className="date-input-group">
            <label htmlFor="stats-start-date">시작 날짜:</label>
            <input
              id="stats-start-date"
              type="date"
              value={filterStartDate}
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="date-input"
            />
          </div>
          <div className="date-input-group">
            <label htmlFor="stats-end-date">종료 날짜:</label>
            <input
              id="stats-end-date"
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="date-input"
            />
          </div>
          <button className="apply-button" onClick={handleApplyFilter}>
            적용
          </button>
        </div>
      </div>
      
      <div className="statistics-grid">
        {/* Overall Statistics */}
        <div className="stat-card">
          <h3>전체 통계</h3>
          <div className="stat-item">
            <span className="stat-label">총 수업일</span>
            <span className="stat-value">{stats.totalWeekdays}일</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">완료된 수업일</span>
            <span className="stat-value completed">{stats.completedWeekdays}일</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">남은 수업일</span>
            <span className="stat-value remaining">{stats.remainingWeekdays}일</span>
          </div>
        </div>
        
        <div className="stat-card">
          <h3>수업 통계</h3>
          <div className="stat-item">
            <span className="stat-label">총 수업</span>
            <span className="stat-value">{stats.totalClasses}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">완료된 수업</span>
            <span className="stat-value completed">{stats.completedClasses}개</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">남은 수업</span>
            <span className="stat-value remaining">{stats.remainingClasses}개</span>
          </div>
        </div>
      </div>
      
      {/* Class-specific Statistics */}
      <div className="class-statistics">
        <h3>반별 수업 현황</h3>
        <div className="class-stats-table">
          <div className="table-header">
            <div className="col-class">반</div>
            <div className="col-total">총 수업</div>
            <div className="col-completed">완료</div>
            <div className="col-remaining">남은 수업</div>
            <div className="col-progress">진행률</div>
          </div>
          {Object.entries(stats.classStats).map(([classId, classStat]) => {
            const classIdNum = parseInt(classId);
            const progress = classStat.total > 0 ? Math.round((classStat.completed / classStat.total) * 100) : 0;
            
            return (
              <div key={classId} className="table-row">
                <div className="col-class">
                  <div 
                    className="class-color-indicator"
                    style={{ backgroundColor: getClassColor(classIdNum) }}
                  />
                  {getClassDisplayName(classIdNum)}
                </div>
                <div className="col-total">{classStat.total}개</div>
                <div className="col-completed">{classStat.completed}개</div>
                <div className="col-remaining">{classStat.total - classStat.completed}개</div>
                <div className="col-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ 
                        width: `${progress}%`,
                        backgroundColor: getClassColor(classIdNum)
                      }}
                    />
                  </div>
                  <span className="progress-text">{progress}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Statistics;

