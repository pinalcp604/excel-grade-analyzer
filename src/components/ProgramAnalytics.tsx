import { useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, BookOpen, Award } from 'lucide-react';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  ethnicity?: string;
  gender?: string;
  studentId?: string;
  [key: string]: any;
}

interface ProgramAnalyticsProps {
  data: StudentRecord[];
  programName: string;
}

const GRADE_COLORS = {
  'A+': '#10b981', 'A': '#059669', 'A-': '#047857',
  'B+': '#3b82f6', 'B': '#2563eb', 'B-': '#1d4ed8',
  'C+': '#f59e0b', 'C': '#d97706', 'C-': '#b45309',
  'D+': '#ef4444', 'D': '#dc2626', 'F': '#b91c1c'
};

const ETHNICITY_COLORS = [
  '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#ec4899', '#84cc16'
];

export const ProgramAnalytics = ({ data, programName }: ProgramAnalyticsProps) => {
  const analytics = useMemo(() => {
    const programData = data.filter(record => record.courseDesc === programName);
    
    if (programData.length === 0) return null;

    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    programData.forEach(record => {
      const grade = record.cuorResultCode;
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    const gradeChartData = Object.entries(gradeDistribution)
      .map(([grade, count]) => ({
        grade,
        count,
        percentage: ((count / programData.length) * 100).toFixed(1),
        color: GRADE_COLORS[grade as keyof typeof GRADE_COLORS] || '#6b7280'
      }))
      .sort((a, b) => {
        const gradeOrder = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'F'];
        return gradeOrder.indexOf(a.grade) - gradeOrder.indexOf(b.grade);
      });

    // Subject-wise performance
    const subjectPerformance: Record<string, { grades: Record<string, number>, total: number }> = {};
    programData.forEach(record => {
      const subject = record.unitOfferDescription || record.unitCode;
      const grade = record.cuorResultCode;
      
      if (!subjectPerformance[subject]) {
        subjectPerformance[subject] = { grades: {}, total: 0 };
      }
      
      subjectPerformance[subject].grades[grade] = (subjectPerformance[subject].grades[grade] || 0) + 1;
      subjectPerformance[subject].total += 1;
    });

    const subjectChartData = Object.entries(subjectPerformance)
      .map(([subject, data]) => {
        const passGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'];
        const passCount = Object.entries(data.grades)
          .filter(([grade]) => passGrades.includes(grade))
          .reduce((sum, [, count]) => sum + count, 0);
        
        return {
          subject: subject.length > 25 ? subject.substring(0, 25) + '...' : subject,
          fullSubject: subject,
          passRate: ((passCount / data.total) * 100).toFixed(1),
          totalStudents: data.total,
          ...data.grades
        };
      })
      .sort((a, b) => b.totalStudents - a.totalStudents)
      .slice(0, 10); // Top 10 subjects by enrollment

    // Ethnicity analysis (if data available)
    const ethnicityDistribution: Record<string, number> = {};
    let hasEthnicityData = false;
    
    programData.forEach(record => {
      // Check multiple possible ethnicity column names
      const ethnicity = record.ethnicity || record.Ethnicity || record.ETHNICITY || 
                       record['ethnic group'] || record['Ethnic Group'] || record['ETHNIC GROUP'] ||
                       record.race || record.Race || record.RACE;
      
      if (ethnicity && ethnicity.toString().trim()) {
        hasEthnicityData = true;
        const ethnicityKey = ethnicity.toString().trim();
        ethnicityDistribution[ethnicityKey] = (ethnicityDistribution[ethnicityKey] || 0) + 1;
      }
    });

    const ethnicityChartData = hasEthnicityData 
      ? Object.entries(ethnicityDistribution).map(([ethnicity, count], index) => ({
          ethnicity,
          count,
          percentage: ((count / programData.length) * 100).toFixed(1),
          color: ETHNICITY_COLORS[index % ETHNICITY_COLORS.length]
        }))
      : null;

    // Performance metrics
    const passGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-'];
    const excellentGrades = ['A+', 'A', 'A-'];
    const failGrades = ['F'];
    
    const passCount = programData.filter(record => passGrades.includes(record.cuorResultCode)).length;
    const excellentCount = programData.filter(record => excellentGrades.includes(record.cuorResultCode)).length;
    const failCount = programData.filter(record => failGrades.includes(record.cuorResultCode)).length;
    
    const passRate = ((passCount / programData.length) * 100).toFixed(1);
    const excellenceRate = ((excellentCount / programData.length) * 100).toFixed(1);
    const failureRate = ((failCount / programData.length) * 100).toFixed(1);

    // Unique students count
    const uniqueStudents = new Set(
      programData.map(record => record.studentId || record['student id'] || record['Student ID'] || `${record.unitCode}-${record.cuorResultCode}`)
    ).size;

    return {
      programData,
      gradeChartData,
      subjectChartData,
      ethnicityChartData,
      hasEthnicityData,
      totalRecords: programData.length,
      uniqueStudents,
      passRate,
      excellenceRate,
      failureRate
    };
  }, [data, programName]);

  if (!analytics) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No data available for this programme</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Programme Header */}
      <Card className="p-6 bg-gradient-primary text-primary-foreground">
        <h2 className="text-2xl font-bold mb-2">{programName}</h2>
        <p className="opacity-90">Detailed Performance Analysis</p>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-info" />
            <div>
              <div className="text-2xl font-bold">{analytics.totalRecords}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 border-2 border-success">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-success" />
            <div>
              <div className="text-2xl font-bold text-success">{analytics.passRate}%</div>
              <div className="text-sm text-muted-foreground">Pass Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-4 border-2 border-warning">
          <div className="flex items-center gap-3">
            <Award className="h-8 w-8 text-warning" />
            <div>
              <div className="text-2xl font-bold text-warning">{analytics.excellenceRate}%</div>
              <div className="text-sm text-muted-foreground">Excellence Rate</div>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-muted-foreground" />
            <div>
              <div className="text-2xl font-bold">{analytics.subjectChartData.length}</div>
              <div className="text-sm text-muted-foreground">Subjects</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Grade Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.gradeChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="grade" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, 'Students']} />
              <Bar dataKey="count" fill="hsl(var(--primary))" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-3 md:grid-cols-4 gap-2">
            {analytics.gradeChartData.map(({ grade, count, percentage, color }) => (
              <div key={grade} className="text-center p-2 bg-muted/30 rounded">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                  <span className="font-medium text-sm">{grade}</span>
                </div>
                <div className="text-xs text-muted-foreground">{count} ({percentage}%)</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Ethnicity Distribution */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {analytics.hasEthnicityData ? 'Ethnicity Distribution' : 'Grade Performance Overview'}
          </h3>
          {analytics.hasEthnicityData && analytics.ethnicityChartData ? (
            <>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics.ethnicityChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    dataKey="count"
                    label={({ ethnicity, percentage }) => `${ethnicity}: ${percentage}%`}
                  >
                    {analytics.ethnicityChartData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {analytics.ethnicityChartData.map(({ ethnicity, count, percentage, color }) => (
                  <div key={ethnicity} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded" style={{ backgroundColor: color }} />
                      <span className="text-sm">{ethnicity}</span>
                    </div>
                    <Badge variant="outline">{count} ({percentage}%)</Badge>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="text-center text-muted-foreground mb-4">
                <p className="text-sm">Ethnicity data not available in uploaded file</p>
                <p className="text-xs mt-1">Include 'ethnicity' column for demographic analysis</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Pass Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={parseFloat(analytics.passRate)} className="w-20" />
                    <span className="text-sm font-medium">{analytics.passRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Excellence Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={parseFloat(analytics.excellenceRate)} className="w-20" />
                    <span className="text-sm font-medium">{analytics.excellenceRate}%</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Failure Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress value={parseFloat(analytics.failureRate)} className="w-20" />
                    <span className="text-sm font-medium">{analytics.failureRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Subject Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Subject-wise Performance (Top 10 by Enrollment)</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={analytics.subjectChartData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis 
              type="category" 
              dataKey="subject" 
              width={150}
              fontSize={12}
            />
            <Tooltip 
              formatter={(value, name) => [value, `${name} Grade`]}
              labelFormatter={(label) => {
                const fullSubject = analytics.subjectChartData.find(
                  item => item.subject === label
                )?.fullSubject;
                return fullSubject || label;
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
    </div>
  );
};