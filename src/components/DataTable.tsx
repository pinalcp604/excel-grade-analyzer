import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  [key: string]: any;
}

interface DataTableProps {
  data: StudentRecord[];
}

const getGradeBadgeVariant = (grade: string) => {
  const gradeUpper = grade.toUpperCase();
  if (['A+', 'A', 'A-'].includes(gradeUpper)) return 'default';
  if (['B+', 'B', 'B-'].includes(gradeUpper)) return 'secondary';
  if (['C+', 'C', 'C-'].includes(gradeUpper)) return 'outline';
  if (['D+', 'D', 'F'].includes(gradeUpper)) return 'destructive';
  return 'outline';
};

export const DataTable = ({ data }: DataTableProps) => {
  if (data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground">No data to display</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Student Records</h3>
      <ScrollArea className="h-96 w-full">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left p-3 font-medium">Programme</th>
                <th className="text-left p-3 font-medium">Unit Code</th>
                <th className="text-left p-3 font-medium">Subject Name</th>
                <th className="text-left p-3 font-medium">Grade</th>
              </tr>
            </thead>
            <tbody>
              {data.map((record, index) => (
                <tr key={index} className="border-b hover:bg-muted/50">
                  <td className="p-3">
                    <span className="font-medium text-sm">{record.courseDesc}</span>
                  </td>
                  <td className="p-3">
                    <code className="bg-muted px-2 py-1 rounded text-sm">
                      {record.unitCode}
                    </code>
                  </td>
                  <td className="p-3 max-w-xs">
                    <span className="text-sm">{record.unitOfferDescription}</span>
                  </td>
                  <td className="p-3">
                    <Badge variant={getGradeBadgeVariant(record.cuorResultCode)}>
                      {record.cuorResultCode}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ScrollArea>
    </Card>
  );
};