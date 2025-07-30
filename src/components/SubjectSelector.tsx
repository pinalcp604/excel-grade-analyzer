import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  [key: string]: any;
}

interface SubjectSelectorProps {
  data: StudentRecord[];
  programName: string;
  selectedSubject?: string | null;
  onSubjectSelect: (subject: string | null) => void;
}

export const SubjectSelector = ({ data, programName, selectedSubject, onSubjectSelect }: SubjectSelectorProps) => {
  const programData = data.filter(record => record.courseDesc === programName);
  
  // Get unique subjects for the selected program
  const subjects = Array.from(new Set(
    programData.map(record => record.unitOfferDescription || record.unitCode)
  )).filter(Boolean).sort();

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
      <div className="flex items-center gap-2">
        <span className="font-medium text-sm">Subject:</span>
        <Select value={selectedSubject || ""} onValueChange={(value) => onSubjectSelect(value || null)}>
          <SelectTrigger className="w-[300px]">
            <SelectValue placeholder="Select a subject for detailed analysis" />
          </SelectTrigger>
          <SelectContent>
            {subjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {selectedSubject && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => onSubjectSelect(null)}
          className="flex items-center gap-1"
        >
          <X className="h-4 w-4" />
          Clear Subject
        </Button>
      )}
      
      <div className="text-sm text-muted-foreground">
        {subjects.length} subjects available
      </div>
    </div>
  );
};