import React from 'react';
import { calculateStatistics } from '../../data/scheduleData';
import './Statistics.css';

const Statistics = ({ weeklySchedule, startDate, endDate, classStatus, holidays, classes }) => {
  const stats = calculateStatistics(weeklySchedule, startDate, endDate, classStatus, holidays);
  
  const getClassDisplayName = (classId) => {
    return classId === 11 ? '동아리' : `${classId}반`;
  };
  
  const getClassColor = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.color : '#cccccc';
  };
  
  return (
    <div className="statistics">
      <div className="statistics-header">
        <h2>학기 통계</h2>
        <div className="semester-info">
          {new Date(startDate).toLocaleDateString('ko-KR')} ~ {new Date(endDate).toLocaleDateString('ko-KR')}
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

