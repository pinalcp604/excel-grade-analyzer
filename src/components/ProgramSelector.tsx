import { useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, Users } from 'lucide-react';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  [key: string]: any;
}

interface ProgramSelectorProps {
  data: StudentRecord[];
  selectedProgram: string | null;
  onProgramSelect: (program: string | null) => void;
}

export const ProgramSelector = ({ data, selectedProgram, onProgramSelect }: ProgramSelectorProps) => {
  const programs = useMemo(() => {
    const programCounts: Record<string, number> = {};
    
    data.forEach(record => {
      const program = record.courseDesc;
      programCounts[program] = (programCounts[program] || 0) + 1;
    });

    return Object.entries(programCounts)
      .map(([program, count]) => ({ program, count }))
      .sort((a, b) => b.count - a.count);
  }, [data]);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold">Select Programme for Detailed Analysis</h3>
      </div>
      
      <div className="space-y-4">
        <Select
          value={selectedProgram || "all"}
          onValueChange={(value) => onProgramSelect(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Choose a programme to analyze" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Programmes (Overview)</SelectItem>
            {programs.map(({ program, count }) => (
              <SelectItem key={program} value={program}>
                <div className="flex items-center justify-between w-full">
                  <span className="truncate max-w-64">{program}</span>
                  <Badge variant="secondary" className="ml-2">
                    {count}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedProgram && (
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Selected Programme:</span>
            </div>
            <p className="text-sm font-medium">{selectedProgram}</p>
            <Badge variant="outline" className="mt-2">
              {programs.find(p => p.program === selectedProgram)?.count || 0} students
            </Badge>
          </div>
        )}
      </div>
    </Card>
  );
};