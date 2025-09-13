import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText, FileSpreadsheet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface Budget {
  [category: string]: number;
}

interface ExportManagerProps {
  expenses: Expense[];
  budget: Budget;
}

export const ExportManager = ({ expenses, budget }: ExportManagerProps) => {
  const [exportFormat, setExportFormat] = useState<"csv" | "pdf">("csv");
  const [dateRange, setDateRange] = useState<"all" | "month" | "quarter">("month");
  const { toast } = useToast();

  const getFilteredExpenses = () => {
    if (dateRange === "all") return expenses;
    
    const now = new Date();
    const startDate = new Date();
    
    if (dateRange === "month") {
      startDate.setMonth(now.getMonth());
      startDate.setDate(1);
    } else if (dateRange === "quarter") {
      const quarter = Math.floor(now.getMonth() / 3);
      startDate.setMonth(quarter * 3);
      startDate.setDate(1);
    }
    
    return expenses.filter(expense => new Date(expense.date) >= startDate);
  };

  const exportAsCSV = () => {
    const filteredExpenses = getFilteredExpenses();
    
    const headers = ["Date", "Description", "Category", "Amount"];
    const csvContent = [
      headers.join(","),
      ...filteredExpenses.map(expense => 
        [expense.date, `"${expense.description}"`, expense.category, expense.amount.toFixed(2)].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses-${dateRange}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Exported! 📊",
      description: `${filteredExpenses.length} expenses exported successfully.`,
    });
  };

  const exportAsPDF = () => {
    const filteredExpenses = getFilteredExpenses();
    const doc = new jsPDF();

    // Header
    doc.setFontSize(20);
    doc.setTextColor(64, 64, 64);
    doc.text('Student Finance Report', 20, 25);
    
    doc.setFontSize(12);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 35);
    doc.text(`Period: ${dateRange.charAt(0).toUpperCase() + dateRange.slice(1)}`, 20, 42);

    // Summary Stats
    const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const avgExpense = totalAmount / filteredExpenses.length || 0;
    
    doc.setFontSize(14);
    doc.setTextColor(64, 64, 64);
    doc.text('Summary', 20, 55);
    
    doc.setFontSize(10);
    doc.text(`Total Expenses: $${totalAmount.toFixed(2)}`, 20, 65);
    doc.text(`Number of Transactions: ${filteredExpenses.length}`, 20, 72);
    doc.text(`Average Expense: $${avgExpense.toFixed(2)}`, 20, 79);

    // Expenses Table
    const tableData = filteredExpenses.map(expense => [
      expense.date,
      expense.description,
      expense.category.replace('_', ' ').toUpperCase(),
      `$${expense.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      head: [['Date', 'Description', 'Category', 'Amount']],
      body: tableData,
      startY: 90,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [74, 144, 226] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    doc.save(`finance-report-${dateRange}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "PDF Exported! 📄",
      description: `Detailed report with ${filteredExpenses.length} expenses generated.`,
    });
  };

  const handleExport = () => {
    if (exportFormat === "csv") {
      exportAsCSV();
    } else {
      exportAsPDF();
    }
  };

  return (
    <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <Download className="h-6 w-6" />
          Export Data
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Download your financial data for sharing and record-keeping
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Export Format</label>
            <Select value={exportFormat} onValueChange={(value: "csv" | "pdf") => setExportFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    CSV (Excel Compatible)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    PDF Report
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Select value={dateRange} onValueChange={(value: "all" | "month" | "quarter") => setDateRange(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">This Month</SelectItem>
                <SelectItem value="quarter">This Quarter</SelectItem>
                <SelectItem value="all">All Time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="bg-background/50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Export Preview</h4>
          <p className="text-sm text-muted-foreground">
            {getFilteredExpenses().length} expenses will be exported
            {exportFormat === "csv" && " as a spreadsheet file"}
            {exportFormat === "pdf" && " as a detailed PDF report with summary statistics"}
          </p>
        </div>

        <Button onClick={handleExport} variant="gradient" className="w-full" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Export as {exportFormat.toUpperCase()}
        </Button>
      </CardContent>
    </Card>
  );
};