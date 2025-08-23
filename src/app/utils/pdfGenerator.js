// app/utils/pdfGenerator.js
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Color scheme for different departments
const DEPARTMENT_COLORS = {
  'Computer Science': { bg: '#E3F2FD', border: '#1976D2', text: '#0D47A1' },
  'Mathematics': { bg: '#E8F5E8', border: '#388E3C', text: '#1B5E20' },
  'Physics': { bg: '#FFF3E0', border: '#F57C00', text: '#E65100' },
  'Chemistry': { bg: '#F3E5F5', border: '#7B1FA2', text: '#4A148C' },
  'English': { bg: '#FFEBEE', border: '#D32F2F', text: '#B71C1C' },
  'default': { bg: '#F5F5F5', border: '#757575', text: '#424242' }
};

// Time slot formatting
const formatTime = (time) => {
  if (!time) return '';
  // Handle different time formats
  if (typeof time === 'string') {
    return time.length > 5 ? time.substring(0, 5) : time;
  }
  return time.toString();
};

// Get day abbreviation
const getDayAbbr = (day) => {
  const days = {
    'Monday': 'Mon',
    'Tuesday': 'Tue', 
    'Wednesday': 'Wed',
    'Thursday': 'Thu',
    'Friday': 'Fri',
    'Saturday': 'Sat',
    'Sunday': 'Sun'
  };
  return days[day] || day;
};

// Helper function to flatten the nested timetable structure
const flattenTimetableData = (timetableData) => {
  let scheduleData = [];
  
  if (timetableData?.timetable && Array.isArray(timetableData.timetable)) {
    // Flatten the nested structure: day → periods → activities
    timetableData.timetable.forEach(dayData => {
      const day = dayData.day;
      dayData.periods.forEach(period => {
        if (period.activities && period.activities.length > 0) {
          period.activities.forEach(activity => {
            scheduleData.push({
              day: day,
              startTime: period.time.split('-')[0],
              endTime: period.time.split('-')[1],
              subject: activity.subject,
              teacher: activity.teacher,
              studentGroup: activity.studentGroup,
              room: activity.room,
              type: activity.type,
              duration: activity.duration,
              studentCount: activity.studentCount,
              department: activity.department // Add department if available
            });
          });
        }
      });
    });
  } else if (timetableData?.schedule) {
    scheduleData = timetableData.schedule;
  } else if (Array.isArray(timetableData)) {
    scheduleData = timetableData;
  }
  
  return scheduleData;
};

// Common PDF header
const addPDFHeader = (doc, title, subtitle = '', universityData = {}) => {
  const pageWidth = doc.internal.pageSize.width;
  
  // University name
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(universityData?.basicInfo?.universityName || 'University', pageWidth / 2, 20, { align: 'center' });
  
  // Title
  doc.setFontSize(14);
  doc.text(title, pageWidth / 2, 30, { align: 'center' });
  
  // Subtitle
  if (subtitle) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(subtitle, pageWidth / 2, 37, { align: 'center' });
  }
  
  // Academic year and semester
  const academicInfo = `Academic Year: ${universityData?.basicInfo?.academicYear || 'N/A'} | Semester: ${universityData?.basicInfo?.semester || 'N/A'}`;
  doc.setFontSize(8);
  doc.text(academicInfo, pageWidth / 2, 45, { align: 'center' });
  
  // Line separator
  doc.setDrawColor(0, 0, 0);
  doc.line(20, 50, pageWidth - 20, 50);
  
  return 55; // Return Y position after header
};

// Common PDF footer
const addPDFFooter = (doc) => {
  const pageHeight = doc.internal.pageSize.height;
  const pageWidth = doc.internal.pageSize.width;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  // Use a consistent date format to avoid hydration issues
  const now = new Date();
  const dateString = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  
  doc.text(`Generated on: ${dateString}`, 20, pageHeight - 10);
  doc.text(`Page ${doc.internal.getNumberOfPages()}`, pageWidth - 30, pageHeight - 10);
};

// 1. Complete Master Timetable
export const generateMasterTimetable = (timetableData, universityData) => {
  const doc = new jsPDF('l', 'mm', 'a3'); // Landscape A3 for more space
  
  let yPos = addPDFHeader(doc, 'MASTER TIMETABLE', 'Complete Schedule - All Departments', universityData);
  
  // Debug: Check the structure of timetableData
  console.log('Master Timetable - Raw timetableData:', timetableData);
  
  // Flatten the nested timetable structure
  const scheduleData = flattenTimetableData(timetableData);
  console.log('Master Timetable - Flattened scheduleData:', scheduleData);
  
  if (!scheduleData || scheduleData.length === 0) {
    doc.setFontSize(14);
    doc.text('No timetable data available to generate PDF', doc.internal.pageSize.width / 2, yPos + 50, { align: 'center' });
    addPDFFooter(doc);
    return doc;
  }
  
  // Extract unique time slots and days
  const timeSlots = [...new Set(scheduleData.map(item => `${formatTime(item.startTime)}-${formatTime(item.endTime)}`))].sort();
  const days = universityData?.basicInfo?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  
  // Create table headers
  const headers = ['Time Slot', ...days.map(day => getDayAbbr(day))];
  
  // Create table rows
  const tableData = timeSlots.map(timeSlot => {
    const row = [timeSlot];
    
    days.forEach(day => {
      const classes = scheduleData.filter(item => 
        `${formatTime(item.startTime)}-${formatTime(item.endTime)}` === timeSlot &&
        item.day === day
      );
      
      if (classes && classes.length > 0) {
        const classInfo = classes.map(cls => 
          `${cls.subject}\n${cls.teacher}\n${cls.room}\n(${cls.studentGroup})`
        ).join('\n---\n');
        row.push(classInfo);
      } else {
        row.push('');
      }
    });
    
    return row;
  });
  
  // Generate table
  autoTable(doc, {
    head: [headers],
    body: tableData,
    startY: yPos + 5,
    theme: 'grid',
    styles: {
      fontSize: 7,
      cellPadding: 3,
      lineColor: [0, 0, 0],
      lineWidth: 0.1
    },
    headStyles: {
      fillColor: [33, 150, 243],
      textColor: 255,
      fontStyle: 'bold'
    },
    columnStyles: {
      0: { cellWidth: 25, fontStyle: 'bold' }
    },
    didParseCell: function(data) {
      // Color code cells based on content
      if (data.section === 'body' && data.column.index > 0) {
        const cellText = data.cell.text.join(' ');
        for (const [dept, colors] of Object.entries(DEPARTMENT_COLORS)) {
          if (cellText.toLowerCase().includes(dept.toLowerCase().split(' ')[0])) {
            data.cell.styles.fillColor = colors.bg;
            break;
          }
        }
      }
    }
  });
  
  addPDFFooter(doc);
  return doc;
};

// 2. Department-wise Timetables  
export const generateDepartmentTimetables = (timetableData, universityData, selectedDepartment = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  let pageCount = 0;
  
  const scheduleData = flattenTimetableData(timetableData);
  
  // Extract departments from university data instead of timetable data
  const departments = selectedDepartment ? 
    [selectedDepartment] : 
    universityData?.departments?.map(d => d.name) || [];
  
  departments.forEach((department, deptIndex) => {
    if (deptIndex > 0) doc.addPage();
    pageCount++;
    
    let yPos = addPDFHeader(doc, `${department.toUpperCase()} DEPARTMENT`, 'Department Timetable', universityData);
    
    // Filter classes for this department (by student group prefix)
    const deptClasses = scheduleData.filter(item => 
      item.studentGroup && item.studentGroup.toLowerCase().includes(department.toLowerCase().substring(0, 2))
    ) || [];
    
    if (deptClasses.length === 0) {
      doc.setFontSize(12);
      doc.text('No classes scheduled for this department.', 20, yPos + 20);
      addPDFFooter(doc);
      return;
    }
    
    // Group by student groups/programs
    const groupedClasses = {};
    deptClasses.forEach(cls => {
      const group = cls.studentGroup || 'General';
      if (!groupedClasses[group]) groupedClasses[group] = [];
      groupedClasses[group].push(cls);
    });
    
    Object.entries(groupedClasses).forEach(([group, classes], groupIndex) => {
      if (groupIndex > 0) yPos += 10;
      
      // Group header
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${group}`, 20, yPos + 15);
      yPos += 20;
      
      // Create timetable for this group
      const timeSlots = [...new Set(classes.map(item => `${formatTime(item.startTime)}-${formatTime(item.endTime)}`))].sort();
      const days = universityData?.basicInfo?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
      
      const headers = ['Time', ...days.map(day => getDayAbbr(day))];
      
      const tableData = timeSlots.map(timeSlot => {
        const row = [timeSlot];
        
        days.forEach(day => {
          const dayClasses = classes.filter(item => 
            `${formatTime(item.startTime)}-${formatTime(item.endTime)}` === timeSlot &&
            item.day === day
          );
          
          if (dayClasses.length > 0) {
            const classInfo = dayClasses.map(cls => 
              `${cls.subject || 'Subject'}\n${cls.teacher || 'Teacher'}\n${cls.room || 'Room'}`
            ).join('\n');
            row.push(classInfo);
          } else {
            row.push('');
          }
        });
        
        return row;
      });
      
      autoTable(doc, {
        head: [headers],
        body: tableData,
        startY: yPos,
        theme: 'striped',
        styles: {
          fontSize: 8,
          cellPadding: 2
        },
        headStyles: {
          fillColor: DEPARTMENT_COLORS[department]?.border || DEPARTMENT_COLORS.default.border,
          textColor: 255
        }
      });
      
      yPos = doc.lastAutoTable.finalY + 5;
    });
    
    addPDFFooter(doc);
  });
  
  return doc;
};

// 3. Individual Faculty Schedules
export const generateFacultySchedules = (timetableData, universityData, selectedTeacher = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const scheduleData = flattenTimetableData(timetableData);
  const teachers = selectedTeacher ? 
    [selectedTeacher] : 
    [...new Set(scheduleData.map(item => item.teacher).filter(Boolean))];
  
  teachers.forEach((teacher, teacherIndex) => {
    if (teacherIndex > 0) doc.addPage();
    
    let yPos = addPDFHeader(doc, `FACULTY SCHEDULE`, `${teacher}`, universityData);
    
    // Filter classes for this teacher
    const teacherClasses = scheduleData.filter(item => item.teacher === teacher) || [];
    
    if (teacherClasses.length === 0) {
      doc.setFontSize(12);
      doc.text('No classes assigned to this teacher.', 20, yPos + 20);
      addPDFFooter(doc);
      return;
    }
    
    // Calculate total hours
    const totalHours = teacherClasses.length;
    doc.setFontSize(10);
    doc.text(`Total Weekly Hours: ${totalHours}`, 20, yPos + 10);
    yPos += 20;
    
    // Create schedule table
    const days = universityData?.basicInfo?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [...new Set(teacherClasses.map(item => `${formatTime(item.startTime)}-${formatTime(item.endTime)}`))].sort();
    
    const headers = ['Time', ...days.map(day => getDayAbbr(day))];
    
    const tableData = timeSlots.map(timeSlot => {
      const row = [timeSlot];
      
      days.forEach(day => {
        const dayClasses = teacherClasses.filter(item => 
          `${formatTime(item.startTime)}-${formatTime(item.endTime)}` === timeSlot &&
          item.day === day
        );
        
        if (dayClasses.length > 0) {
          const classInfo = dayClasses.map(cls => 
            `${cls.subject || 'Subject'}\n${cls.studentGroup || 'Group'}\n${cls.room || 'Room'}`
          ).join('\n');
          row.push(classInfo);
        } else {
          row.push('');
        }
      });
      
      return row;
    });
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPos,
      theme: 'striped',
      styles: {
        fontSize: 8,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [76, 175, 80],
        textColor: 255
      }
    });
    
    addPDFFooter(doc);
  });
  
  return doc;
};

// 4. Student Class Timetables
export const generateStudentTimetables = (timetableData, universityData, selectedGroup = null) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  const scheduleData = flattenTimetableData(timetableData);
  const studentGroups = selectedGroup ? 
    [selectedGroup] : 
    [...new Set(scheduleData.map(item => item.studentGroup).filter(Boolean))];
  
  studentGroups.forEach((group, groupIndex) => {
    if (groupIndex > 0) doc.addPage();
    
    let yPos = addPDFHeader(doc, `CLASS TIMETABLE`, `${group}`, universityData);
    
    // Filter classes for this group
    const groupClasses = scheduleData.filter(item => item.studentGroup === group) || [];
    
    if (groupClasses.length === 0) {
      doc.setFontSize(12);
      doc.text('No classes scheduled for this group.', 20, yPos + 20);
      addPDFFooter(doc);
      return;
    }
    
    // Create schedule table
    const days = universityData?.basicInfo?.workingDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const timeSlots = [...new Set(groupClasses.map(item => `${formatTime(item.startTime)}-${formatTime(item.endTime)}`))].sort();
    
    const headers = ['Time', ...days];
    
    const tableData = timeSlots.map(timeSlot => {
      const row = [timeSlot];
      
      days.forEach(day => {
        const dayClasses = groupClasses.filter(item => 
          `${formatTime(item.startTime)}-${formatTime(item.endTime)}` === timeSlot &&
          item.day === day
        );
        
        if (dayClasses.length > 0) {
          const classInfo = dayClasses.map(cls => 
            `${cls.subject || 'Subject'}\n${cls.teacher || 'Teacher'}\nRoom: ${cls.room || 'TBA'}`
          ).join('\n');
          row.push(classInfo);
        } else {
          row.push('');
        }
      });
      
      return row;
    });
    
    autoTable(doc, {
      head: [headers],
      body: tableData,
      startY: yPos,
      theme: 'striped',
      styles: {
        fontSize: 9,
        cellPadding: 4
      },
      headStyles: {
        fillColor: [63, 81, 181],
        textColor: 255
      }
    });
    
    // Add break times if available
    yPos = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.text('* Break times as per university schedule', 20, yPos);
    
    addPDFFooter(doc);
  });
  
  return doc;
};

// 5. Room Utilization Schedule
export const generateRoomUtilization = (timetableData, universityData) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  
  let yPos = addPDFHeader(doc, 'ROOM UTILIZATION SCHEDULE', 'Room Usage Analysis', universityData);
  
  const scheduleData = flattenTimetableData(timetableData);
  
  // Calculate room utilization
  const rooms = [...new Set(scheduleData.map(item => item.room).filter(Boolean))];
  const totalTimeSlots = (universityData?.basicInfo?.workingDays?.length || 5) * (universityData?.basicInfo?.dailyPeriods || 8);
  
  // Room utilization summary
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Room Utilization Summary', 20, yPos + 10);
  yPos += 20;
  
  const utilizationData = rooms.map(room => {
    const roomClasses = scheduleData.filter(item => item.room === room) || [];
    const utilization = ((roomClasses.length / totalTimeSlots) * 100).toFixed(1);
    
    return [
      room,
      roomClasses.length.toString(),
      totalTimeSlots.toString(),
      `${utilization}%`
    ];
  });
  
  autoTable(doc, {
    head: [['Room', 'Used Slots', 'Total Slots', 'Utilization %']],
    body: utilizationData,
    startY: yPos,
    theme: 'striped',
    styles: { fontSize: 10 },
    headStyles: { fillColor: [255, 152, 0] }
  });
  
  yPos = doc.lastAutoTable.finalY + 20;
  
  // Detailed room schedules
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Detailed Room Schedules', 20, yPos);
  yPos += 10;
  
  rooms.forEach((room, roomIndex) => {
    if (roomIndex > 0 && yPos > 220) {
      doc.addPage();
      yPos = 20;
    }
    
    const roomClasses = scheduleData.filter(item => item.room === room) || [];
    
    if (roomClasses.length > 0) {
      // Room header
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`${room}`, 20, yPos + 10);
      yPos += 15;
      
      const roomTableData = roomClasses.map(cls => [
        cls.day || '',
        `${formatTime(cls.startTime)}-${formatTime(cls.endTime)}`,
        cls.subject || '',
        cls.teacher || '',
        cls.studentGroup || ''
      ]);
      
      autoTable(doc, {
        head: [['Day', 'Time', 'Subject', 'Teacher', 'Group']],
        body: roomTableData,
        startY: yPos,
        theme: 'grid',
        styles: { fontSize: 8 },
        headStyles: { fillColor: [158, 158, 158] }
      });
      
      yPos = doc.lastAutoTable.finalY + 5;
    }
  });
  
  addPDFFooter(doc);
  return doc;
};

// Main export function that handles all PDF types
export const generateTimetablePDF = (type, timetableData, universityData, options = {}) => {
  // Debug: Log the actual data structure
  console.log('PDF Generator - timetableData:', timetableData);
  console.log('PDF Generator - universityData:', universityData);
  
  let doc;
  
  switch (type) {
    case 'master':
      doc = generateMasterTimetable(timetableData, universityData);
      break;
    case 'department':
      doc = generateDepartmentTimetables(timetableData, universityData, options.selectedDepartment);
      break;
    case 'faculty':
      doc = generateFacultySchedules(timetableData, universityData, options.selectedTeacher);
      break;
    case 'student':
      doc = generateStudentTimetables(timetableData, universityData, options.selectedGroup);
      break;
    case 'room':
      doc = generateRoomUtilization(timetableData, universityData);
      break;
    default:
      throw new Error('Invalid PDF type specified');
  }
  
  // Download the PDF with consistent filename
  const now = new Date();
  const dateString = now.getFullYear() + '-' + 
    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
    String(now.getDate()).padStart(2, '0');
  const fileName = `${type}-timetable-${dateString}.pdf`;
  doc.save(fileName);
  
  return doc;
};