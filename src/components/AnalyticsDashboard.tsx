import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  [key: string]: any;
}

interface AnalyticsDashboardProps {
  data: StudentRecord[];
  selectedProgram?: string | null;
}

const GRADE_COLORS = {
  'A+': '#10b981', 'A': '#059669', 'A-': '#047857',
  'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#1d4ed8',
  'C+': '#f59e0b', 'C': '#d97706', 'C-': '#b45309',
  'D+': '#ef4444', 'D': '#dc2626', 'F': '#b91c1c'
};

export const AnalyticsDashboard = ({ data, selectedProgram }: AnalyticsDashboardProps) => {
  const analytics = useMemo(() => {
    if (data.length === 0) return null;

    // Filter data by selected program if specified
    const filteredData = selectedProgram 
      ? data.filter(record => record.courseDesc === selectedProgram)
      : data;

    if (filteredData.length === 0) return null;
    const programmeGrades: Record<string, Record<string, number>> = {};
    const overallGrades: Record<string, number> = {};
    
    filteredData.forEach(record => {
      const programme = record.courseDesc;
      const grade = record.cuorResultCode;
      
      if (!programmeGrades[programme]) {
        programmeGrades[programme] = {};
      }
      
      programmeGrades[programme][grade] = (programmeGrades[programme][grade] || 0) + 1;
      overallGrades[grade] = (overallGrades[grade] || 0) + 1;
    });

    // Convert to chart data
    const programmeChartData = Object.entries(programmeGrades).map(([programme, grades]) => ({
      programme: programme.length > 20 ? programme.substring(0, 20) + '...' : programme,
      fullProgramme: programme,
      ...grades,
      total: Object.values(grades).reduce((sum, count) => sum + count, 0)
    }));

    const gradeDistributionData = Object.entries(overallGrades).map(([grade, count]) => ({
      grade,
      count,
      color: GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6b7280'
    })).sort((a, b) => {
      const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
      return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
    });

    // Performance metrics
    const totalStudents = filteredData.length;
    const uniqueProgrammes = selectedProgram ? 1 : Object.keys(programmeGrades).length;
    const passGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'];
    const passCount = filteredData.filter(record => passGrades.includes(record.cuorResultCode)).length;
    const passRate = ((passCount / totalStudents) * 100).toFixed(1);
    
    // Calculate total EFTS
    const totalEfts = filteredData.reduce((sum, record) => {
      const efts = parseFloat(record['cuor efts factor'] || record['Cuor Efts Factor'] || record['CUOR EFTS FACTOR'] || 0);
      return sum + (isNaN(efts) ? 0 : efts);
    }, 0);

    return {
      programmeChartData,
      gradeDistributionData,
      totalStudents,
      uniqueProgrammes,
      passRate,
      selectedProgram,
      totalEfts: totalEfts.toFixed(2)
    };
  }, [data, selectedProgram]);

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No data available for analysis</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-primary text-primary-foreground">
          <div className="text-2xl font-bold">{analytics.totalStudents}</div>
          <div className="text-sm opacity-90">
            {analytics.selectedProgram ? 'Records in Programme' : 'Total Records'}
          </div>
        </Card>
        <Card className="p-6 bg-gradient-secondary">
          <div className="text-2xl font-bold text-foreground">{analytics.totalEfts}</div>
          <div className="text-sm text-muted-foreground">Total EFTS</div>
        </Card>
        <Card className="p-6 border-2 border-success">
          <div className="text-2xl font-bold text-success">{analytics.passRate}%</div>
          <div className="text-sm text-muted-foreground">Pass Rate</div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Programme-wise Performance - Hide if single program selected */}
        {!analytics.selectedProgram && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Programme-wise Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.programmeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="programme" 
                angle={-45}
                textAnchor="end"
                height={100}
                fontSize={12}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [value, `${name} Grade`]}
                labelFormatter={(label) => {
                  const fullProgramme = analytics.programmeChartData.find(
                    item => item.programme === label
                  )?.fullProgramme;
                  return fullProgramme || label;
                }}
              />
              {Object.keys(GRADE_COLORS).map(grade => (
                <Bar 
                  key={grade}
                  dataKey={grade} 
                  stackId="grades"
                  fill={GRADE_COLORS[grade as keyof typeof GRADE_COLORS]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </Card>
        )}

        {/* Overall Grade Distribution */}
        <Card className={`p-6 ${!analytics.selectedProgram ? '' : 'lg:col-span-2'}`}>
          <h3 className="text-lg font-semibold mb-4">
            {analytics.selectedProgram ? `Grade Distribution - ${analytics.selectedProgram}` : 'Overall Grade Distribution'}
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.gradeDistributionData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="count"
                label={({ grade, count }) => `${grade}: ${count}`}
              >
                {analytics.gradeDistributionData.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Grade Legend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Grade Distribution Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {analytics.gradeDistributionData.map(({ grade, count, color }) => (
            <div key={grade} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
              />
              <Badge variant="outline" className="flex-1 justify-between">
                {grade}
                <span className="ml-2 font-bold">{count}</span>
              </Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};