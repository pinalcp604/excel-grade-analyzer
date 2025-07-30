import * as XLSX from 'xlsx';

export const downloadAnalysisReport = (data: any[], programName: string, analytics: any) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Programme Analysis Report'],
    [''],
    ['Programme Name:', programName],
    ['Total Records:', analytics.totalRecords],
    ['Pass Rate:', `${analytics.passRate}%`],
    ['Excellence Rate:', `${analytics.excellenceRate}%`],
    ['Failure Rate:', `${analytics.failureRate}%`],
    [''],
    ['Grade Distribution:'],
    ['Grade', 'Count', 'Percentage'],
    ...analytics.gradeChartData.map((item: any) => [item.grade, item.count, `${item.percentage}%`])
  ];
  
  const summaryWS = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWS, 'Summary');
  
  // Raw data sheet for the programme
  const filteredData = data.filter(record => record.courseDesc === programName);
  const dataWS = XLSX.utils.json_to_sheet(filteredData);
  XLSX.utils.book_append_sheet(workbook, dataWS, 'Programme Data');
  
  // Subject performance sheet
  if (analytics.subjectChartData?.length > 0) {
    const subjectData = [
      ['Subject Performance Analysis'],
      [''],
      ['Subject', 'Total Students', 'Pass Rate', 'A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'],
      ...analytics.subjectChartData.map((item: any) => [
        item.fullSubject || item.subject,
        item.totalStudents,
        `${item.passRate}%`,
        item['A+'] || 0,
        item['A'] || 0,
        item['A-'] || 0,
        item['B+'] || 0,
        item['B'] || 0,
        item['B-'] || 0,
        item['C+'] || 0,
        item['C'] || 0,
        item['C-'] || 0,
        item['D+'] || 0,
        item['D'] || 0,
        item['F'] || 0
      ])
    ];
    
    const subjectWS = XLSX.utils.aoa_to_sheet(subjectData);
    XLSX.utils.book_append_sheet(workbook, subjectWS, 'Subject Performance');
  }
  
  // Download the file
  const fileName = `${programName.replace(/[^a-zA-Z0-9]/g, '_')}_Analysis_Report.xlsx`;
  XLSX.writeFile(workbook, fileName);
};