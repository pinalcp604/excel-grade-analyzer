import { useState, useCallback } from 'react';
import * as XLSX from 'xlsx';
import { FileUpload } from '@/components/FileUpload';
import { DataTable } from '@/components/DataTable';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BarChart3, FileSpreadsheet, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface StudentRecord {
  courseDesc: string;
  unitCode: string;
  unitOfferDescription: string;
  cuorResultCode: string;
  [key: string]: any;
}

const Index = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [studentData, setStudentData] = useState<StudentRecord[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const processExcelFile = useCallback(async (file: File) => {
    setIsProcessing(true);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      // Map the data to our expected format
      const processedData: StudentRecord[] = jsonData.map((row: any) => ({
        courseDesc: row['course desc'] || row['Course Desc'] || row['COURSE DESC'] || '',
        unitCode: row['unit code'] || row['Unit Code'] || row['UNIT CODE'] || '',
        unitOfferDescription: row['unit offer description'] || row['Unit Offer Description'] || row['UNIT OFFER DESCRIPTION'] || '',
        cuorResultCode: row['cuor result code'] || row['Cuor Result Code'] || row['CUOR RESULT CODE'] || '',
        ...row
      }));

      // Filter out rows with missing essential data
      const validData = processedData.filter(row => 
        row.courseDesc && row.unitCode && row.cuorResultCode
      );

      setStudentData(validData);
      
      toast({
        title: "File processed successfully!",
        description: `Loaded ${validData.length} valid student records.`,
      });
    } catch (error) {
      console.error('Error processing file:', error);
      toast({
        title: "Error processing file",
        description: "Please check that your Excel file has the correct column names.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    processExcelFile(file);
  }, [processExcelFile]);

  const handleClearFile = useCallback(() => {
    setSelectedFile(null);
    setStudentData([]);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <BarChart3 className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Student Result Analysis</h1>
              <p className="text-muted-foreground">Upload Excel files and analyze grade performance by programme</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* File Upload Section */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Upload className="h-5 w-5" />
              <h2 className="text-xl font-semibold">Upload Excel File</h2>
            </div>
            <FileUpload
              onFileSelect={handleFileSelect}
              selectedFile={selectedFile}
              onClearFile={handleClearFile}
            />
          </section>

          {/* Data Display Section */}
          {studentData.length > 0 && (
            <section>
              <Tabs defaultValue="analytics" className="w-full">
                <TabsList className="grid w-full grid-cols-2 max-w-md">
                  <TabsTrigger value="analytics" className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="data" className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    Raw Data
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="analytics" className="mt-6">
                  <AnalyticsDashboard data={studentData} />
                </TabsContent>
                
                <TabsContent value="data" className="mt-6">
                  <DataTable data={studentData} />
                </TabsContent>
              </Tabs>
            </section>
          )}

          {/* Instructions */}
          {studentData.length === 0 && !isProcessing && (
            <section className="bg-muted/30 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">Getting Started</h3>
              <p className="text-muted-foreground mb-4">
                Upload an Excel file with the following columns to begin analysis:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
                <div className="bg-card p-4 rounded-lg">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">course desc</code>
                  <p className="text-sm text-muted-foreground mt-2">Programme names</p>
                </div>
                <div className="bg-card p-4 rounded-lg">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">unit code</code>
                  <p className="text-sm text-muted-foreground mt-2">Subject codes</p>
                </div>
                <div className="bg-card p-4 rounded-lg">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">unit offer description</code>
                  <p className="text-sm text-muted-foreground mt-2">Subject names</p>
                </div>
                <div className="bg-card p-4 rounded-lg">
                  <code className="text-sm font-mono bg-muted px-2 py-1 rounded">cuor result code</code>
                  <p className="text-sm text-muted-foreground mt-2">Student grades</p>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
