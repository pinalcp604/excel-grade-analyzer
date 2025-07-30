import * as XLSX from 'xlsx';

export const downloadAnalysisReport = (data: any[], programName: string, analytics: any) => {
  const workbook = XLSX.utils.book_new();
  
  // Calculate total EFTS for the programme
  const programData = data.filter(record => record.courseDesc === programName);
  const totalEFTS = programData.reduce((sum, record) => {
    const efts = parseFloat(record['cuor efts factor'] || record['CUOR EFTS Factor'] || record['cuorEftsFactor'] || 0);
    return sum + efts;
  }, 0);
  
  // Main report summary
  const reportData = [
    ['Result Analysis Report'],
    [''],
    ['Programme Name', 'Pass Rate', 'Failure Rate', 'Total EFTS', 'Total Pass Students', 'Total Fail', 'Total Withdraw', 'Blank'],
    [
      programName,
      `${analytics.passRate}%`,
      `${analytics.failureRate}%`,
      totalEFTS.toFixed(2),
      analytics.passCount,
      analytics.failCount,
      analytics.withdrawCount,
      analytics.blankCount
    ]
  ];
  
  const reportWS = XLSX.utils.aoa_to_sheet(reportData);
  XLSX.utils.book_append_sheet(workbook, reportWS, 'Programme Summary');
  
  // Grade distribution sheet
  const gradeData = [
    ['Grade Distribution'],
    [''],
    ['Grade', 'Count', 'Percentage'],
    ...analytics.gradeChartData.map((item: any) => [item.grade, item.count, `${item.percentage}%`])
  ];
  
  const gradeWS = XLSX.utils.aoa_to_sheet(gradeData);
  XLSX.utils.book_append_sheet(workbook, gradeWS, 'Grade Distribution');
  
  // Raw data sheet for the programme
  const dataWS = XLSX.utils.json_to_sheet(programData);
  XLSX.utils.book_append_sheet(workbook, dataWS, 'Raw Data');
  
  // Download the file
  const fileName = `${programName.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_Report.xlsx`;
  XLSX.writeFile(workbook, fileName);
};