import './SettingsModal.css';

const SettingsModal = ({ onClose, onDeleteAllClasses, onDeleteAllHolidays }) => {
  const handleDeleteAllClasses = () => {
    if (window.confirm('모든 수업 기록을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      onDeleteAllClasses();
    }
  };

  const handleDeleteAllHolidays = () => {
    if (window.confirm('모든 공휴일을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      onDeleteAllHolidays();
    }
  };

  return (
    <div className="settings-modal-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>⚙️ 설정</h2>
          <button className="settings-close-button" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h3>⚠️ 위험한 작업</h3>
            <p className="warning-text">아래 작업은 되돌릴 수 없습니다. 신중하게 선택하세요.</p>

            <button
              className="delete-button delete-classes"
              onClick={handleDeleteAllClasses}
            >
              <span className="button-icon">🗑️</span>
              수업 전체 삭제
            </button>

            <button
              className="delete-button delete-holidays"
              onClick={handleDeleteAllHolidays}
            >
              <span className="button-icon">🗑️</span>
              공휴일 전체 삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
