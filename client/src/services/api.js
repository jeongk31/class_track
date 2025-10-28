// API service for communicating with Supabase
import { supabase } from './supabase';

export const api = {
  // Get all class types
  getClassTypes: async () => {
    const { data, error } = await supabase
      .from('class_types')
      .select('*')
      .order('id');
    
    if (error) throw error;
    return data;
  },

  // Get current semester range
  getCurrentSemesterRange: async () => {
    const { data, error } = await supabase
      .from('semester_ranges')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update semester range
  updateSemesterRange: async (startDate, endDate, name = 'Current Semester') => {
    const { data, error } = await supabase
      .from('semester_ranges')
      .upsert({
        start_date: startDate,
        end_date: endDate,
        name: name
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  // Get class entries for a specific date range
  getClassEntries: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('class_entries')
      .select(`
        *,
        class_types(name, color),
        semester_ranges(start_date, end_date)
      `)
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date')
      .order('period');
    
    if (error) throw error;
    return data;
  },

  // Get class entries for a specific date
  getClassEntriesForDate: async (date) => {
    const { data, error } = await supabase
      .from('class_entries')
      .select(`
        *,
        class_types(name, color)
      `)
      .eq('date', date)
      .order('period');
    
    if (error) throw error;
    return data;
  },

  // Create or update a class entry
  upsertClassEntry: async (classTypeId, semesterRangeId, date, period, status = false, notes = '') => {
    const { data, error } = await supabase
      .from('class_entries')
      .upsert({
        class_type_id: classTypeId,
        semester_range_id: semesterRangeId,
        date: date,
        period: period,
        status: status,
        notes: notes
      }, { 
        onConflict: 'class_type_id,date,period' 
      })
      .select(`
        *,
        class_types(name, color)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update class entry status
  updateClassEntryStatus: async (id, status) => {
    const { data, error } = await supabase
      .from('class_entries')
      .update({ status: status })
      .eq('id', id)
      .select(`
        *,
        class_types(name, color)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Update class entry notes
  updateClassEntryNotes: async (id, notes) => {
    const { data, error } = await supabase
      .from('class_entries')
      .update({ notes: notes })
      .eq('id', id)
      .select(`
        *,
        class_types(name, color)
      `)
      .single();
    
    if (error) throw error;
    return data;
  },

  // Delete a class entry
  deleteClassEntry: async (id) => {
    const { error } = await supabase
      .from('class_entries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // Delete all class entries in a date range
  deleteClassEntriesInRange: async (startDate, endDate) => {
    const { error } = await supabase
      .from('class_entries')
      .delete()
      .gte('date', startDate)
      .lte('date', endDate);

    if (error) throw error;
    return true;
  },

  // Bulk create class entries for a weekly schedule
  createWeeklyScheduleEntries: async (weeklySchedule, semesterRangeId, startDate, endDate) => {
    // First, delete all existing entries in the date range
    await api.deleteClassEntriesInRange(startDate, endDate);

    const entries = [];
    // Parse dates as local dates to avoid timezone issues
    const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
    const [endYear, endMonth, endDay] = endDate.split('-').map(Number);
    const current = new Date(startYear, startMonth - 1, startDay);
    const end = new Date(endYear, endMonth - 1, endDay);

    while (current <= end) {
      const dayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][current.getDay()];
      const daySchedule = weeklySchedule[dayName] || {};

      Object.entries(daySchedule).forEach(([period, classTypeId]) => {
        if (classTypeId !== null) {
          const year = current.getFullYear();
          const month = String(current.getMonth() + 1).padStart(2, '0');
          const day = String(current.getDate()).padStart(2, '0');
          const dateStr = `${year}-${month}-${day}`;

          entries.push({
            class_type_id: classTypeId,
            semester_range_id: semesterRangeId,
            date: dateStr,
            period: parseInt(period),
            status: false,
            notes: ''
          });
        }
      });

      current.setDate(current.getDate() + 1);
    }

    if (entries.length > 0) {
      const { data, error } = await supabase
        .from('class_entries')
        .insert(entries)
        .select(`
          *,
          class_types(name, color)
        `);

      if (error) throw error;
      return data;
    }

    return [];
  },

  // Get statistics for a date range
  getStatistics: async (startDate, endDate) => {
    const { data, error } = await supabase
      .from('class_entries')
      .select(`
        *,
        class_types(name, color)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    const totalClasses = data.length;
    const completedClasses = data.filter(entry => entry.status).length;
    const classStats = {};
    
    data.forEach(entry => {
      const classId = entry.class_type_id;
      if (!classStats[classId]) {
        classStats[classId] = {
          name: entry.class_types.name,
          color: entry.class_types.color,
          total: 0,
          completed: 0
        };
      }
      classStats[classId].total++;
      if (entry.status) {
        classStats[classId].completed++;
      }
    });
    
    return {
      totalClasses,
      completedClasses,
      remainingClasses: totalClasses - completedClasses,
      classStats
    };
  }
};
