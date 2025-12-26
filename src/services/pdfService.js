import jsPDF from 'jspdf';
import { format } from 'date-fns';

// PDF Layout Constants
const MARGIN = 20;
const STAT_BOX_HEIGHT = 20;
const STAT_ROW_HEIGHT = 25;
const STREAK_ROW_HEIGHT = 25;
const ACTIVITY_ROW_HEIGHT = 8;

/**
 * Generate a professional PDF report of user's streak data
 */
export async function generateStreakReport(userProfile, streaks, completionData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = MARGIN;

  // Helper functions
  const addText = (text, x, y, options = {}) => {
    const { fontSize = 12, fontStyle = 'normal', color = [0, 0, 0] } = options;
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(...color);
    doc.text(text, x, y);
  };

  const addLine = (y) => {
    doc.setDrawColor(200, 200, 200);
    doc.line(MARGIN, y, pageWidth - MARGIN, y);
  };

  // ========== COVER PAGE ==========
  // Background gradient simulation
  doc.setFillColor(255, 102, 0);
  doc.rect(0, 0, pageWidth, 80, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(32);
  doc.setFont('helvetica', 'bold');
  doc.text('🔥 Streak Report', pageWidth / 2, 40, { align: 'center' });
  
  // Subtitle
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Your Personal Progress Report', pageWidth / 2, 55, { align: 'center' });

  // User info
  yPosition = 100;
  doc.setTextColor(0, 0, 0);
  addText(`Generated for: ${userProfile?.displayName || userProfile?.email || 'User'}`, MARGIN, yPosition, { fontSize: 14, fontStyle: 'bold' });
  yPosition += 10;
  addText(`Date: ${format(new Date(), 'MMMM d, yyyy')}`, MARGIN, yPosition, { fontSize: 12 });

  // ========== SUMMARY STATS ==========
  yPosition = 130;
  addText('📊 Summary Statistics', MARGIN, yPosition, { fontSize: 18, fontStyle: 'bold', color: [255, 102, 0] });
  yPosition += 5;
  addLine(yPosition);
  yPosition += 15;

  // Calculate stats
  let maxCurrentStreak = 0;
  let maxLongestStreak = 0;
  let totalCompletions = 0;

  streaks.forEach(streak => {
    if (streak.currentStreak > maxCurrentStreak) maxCurrentStreak = streak.currentStreak;
    if (streak.longestStreak > maxLongestStreak) maxLongestStreak = streak.longestStreak;
    totalCompletions += (streak.completedDates || []).length;
  });

  // Stats grid
  const statsData = [
    { label: 'Total Streaks', value: streaks.length.toString(), emoji: '🎯' },
    { label: 'Current Best Streak', value: `${maxCurrentStreak} days`, emoji: '🔥' },
    { label: 'All-Time Best Streak', value: `${maxLongestStreak} days`, emoji: '🏆' },
    { label: 'Total Completions', value: totalCompletions.toString(), emoji: '✅' }
  ];

  const colWidth = (pageWidth - 2 * MARGIN) / 2;
  statsData.forEach((stat, index) => {
    const x = MARGIN + (index % 2) * colWidth;
    const y = yPosition + Math.floor(index / 2) * STAT_ROW_HEIGHT;
    
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(x, y - 5, colWidth - 10, STAT_BOX_HEIGHT, 3, 3, 'F');
    
    addText(`${stat.emoji} ${stat.label}:`, x + 5, y + 5, { fontSize: 11 });
    addText(stat.value, x + 5, y + 12, { fontSize: 14, fontStyle: 'bold', color: [255, 102, 0] });
  });

  yPosition += 60;

  // ========== STREAK DETAILS ==========
  addText('📋 Streak Details', MARGIN, yPosition, { fontSize: 18, fontStyle: 'bold', color: [255, 102, 0] });
  yPosition += 5;
  addLine(yPosition);
  yPosition += 10;

  if (streaks.length === 0) {
    addText('No streaks created yet.', MARGIN, yPosition, { fontSize: 12, color: [128, 128, 128] });
  } else {
    streaks.forEach((streak, index) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 40) {
        doc.addPage();
        yPosition = MARGIN;
      }

      // Streak card
      doc.setFillColor(250, 250, 250);
      doc.roundedRect(MARGIN, yPosition - 2, pageWidth - 2 * MARGIN, STREAK_ROW_HEIGHT, 3, 3, 'F');
      
      addText(`${index + 1}. ${streak.title}`, MARGIN + 5, yPosition + 8, { fontSize: 12, fontStyle: 'bold' });
      addText(`Current: ${streak.currentStreak} days`, MARGIN + 5, yPosition + 17, { fontSize: 10 });
      addText(`Best: ${streak.longestStreak || 0} days`, MARGIN + 80, yPosition + 17, { fontSize: 10 });
      addText(`Total: ${(streak.completedDates || []).length} completions`, MARGIN + 140, yPosition + 17, { fontSize: 10 });
      
      yPosition += 30;
    });
  }

  // ========== RECENT ACTIVITY ==========
  if (yPosition > pageHeight - 80) {
    doc.addPage();
    yPosition = MARGIN;
  }

  yPosition += 10;
  addText('📅 Recent Activity (Last 10 Days)', MARGIN, yPosition, { fontSize: 18, fontStyle: 'bold', color: [255, 102, 0] });
  yPosition += 5;
  addLine(yPosition);
  yPosition += 10;

  const sortedDates = Object.entries(completionData)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 10);

  if (sortedDates.length === 0) {
    addText('No activity recorded yet.', MARGIN, yPosition, { fontSize: 12, color: [128, 128, 128] });
  } else {
    sortedDates.forEach(([date, count]) => {
      if (yPosition > pageHeight - 20) {
        doc.addPage();
        yPosition = MARGIN;
      }
      
      addText(`• ${date}:`, MARGIN + 5, yPosition, { fontSize: 11 });
      addText(`${count} completion${count !== 1 ? 's' : ''}`, MARGIN + 50, yPosition, { fontSize: 11, color: [0, 128, 0] });
      yPosition += ACTIVITY_ROW_HEIGHT;
    });
  }

  // ========== FOOTER ==========
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} | Generated by Streak App`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  const fileName = `streak-report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
  doc.save(fileName);
  
  return fileName;
}
