// API service for communicating with the backend

const API_BASE_URL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:5001';

export const api = {
  // Get schedule data
  getSchedule: async () => {
    const response = await fetch(`${API_BASE_URL}/api/schedule`);
    if (!response.ok) {
      throw new Error('Failed to fetch schedule data');
    }
    return response.json();
  },

  // Update entire schedule
  updateSchedule: async (scheduleData) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(scheduleData),
    });
    if (!response.ok) {
      throw new Error('Failed to update schedule');
    }
    return response.json();
  },

  // Update weekly schedule
  updateWeeklySchedule: async (weeklySchedule) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/weekly`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(weeklySchedule),
    });
    if (!response.ok) {
      throw new Error('Failed to update weekly schedule');
    }
    return response.json();
  },

  // Update start and end dates
  updateDates: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/dates`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error('Failed to update dates');
    }
    return response.json();
  },

  // Update class status
  updateClassStatus: async (classStatus) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/class-status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(classStatus),
    });
    if (!response.ok) {
      throw new Error('Failed to update class status');
    }
    return response.json();
  },

  // Update comments
  updateComments: async (comments) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/comments`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(comments),
    });
    if (!response.ok) {
      throw new Error('Failed to update comments');
    }
    return response.json();
  },

  // Update holidays
  updateHolidays: async (holidays) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/holidays`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(holidays),
    });
    if (!response.ok) {
      throw new Error('Failed to update holidays');
    }
    return response.json();
  },

  // Update daily schedules for a date range
  updateDailySchedule: async (startDate, endDate, schedule) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/daily`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate, schedule }),
    });
    if (!response.ok) {
      throw new Error('Failed to update daily schedule');
    }
    return response.json();
  },

  // Get daily schedule for a specific date
  getDailySchedule: async (date) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/daily/${date}`);
    if (!response.ok) {
      throw new Error('Failed to fetch daily schedule');
    }
    return response.json();
  },

  // Clear daily schedules for a date range
  clearDailySchedule: async (startDate, endDate) => {
    const response = await fetch(`${API_BASE_URL}/api/schedule/daily`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startDate, endDate }),
    });
    if (!response.ok) {
      throw new Error('Failed to clear daily schedule');
    }
    return response.json();
  }
};
