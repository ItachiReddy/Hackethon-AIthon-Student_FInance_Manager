import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Search, Filter, Calendar, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface ExpenseListProps {
  expenses: Expense[];
  onDeleteExpense: (id: string) => void;
}

const categories = [
  { value: "all", label: "All Categories" },
  { value: "food", label: "🍕 Food & Dining" },
  { value: "transport", label: "🚗 Transport" },
  { value: "entertainment", label: "🎮 Entertainment" },
  { value: "bills", label: "📋 Bills & Utilities" },
  { value: "education", label: "📚 Education" },
  { value: "others", label: "🔍 Others" }
];

const categoryColors = {
  food: "bg-orange-100 text-orange-800 border-orange-200",
  transport: "bg-blue-100 text-blue-800 border-blue-200",
  entertainment: "bg-purple-100 text-purple-800 border-purple-200",
  bills: "bg-red-100 text-red-800 border-red-200",
  education: "bg-green-100 text-green-800 border-green-200",
  others: "bg-gray-100 text-gray-800 border-gray-200"
};

export const ExpenseList = ({ expenses, onDeleteExpense }: ExpenseListProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const { toast } = useToast();

  const filteredExpenses = expenses
    .filter(expense => {
      const matchesSearch = expense.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case "amount":
          return b.amount - a.amount;
        case "category":
          return a.category.localeCompare(b.category);
        default:
          return 0;
      }
    });

  const handleDelete = (expense: Expense) => {
    onDeleteExpense(expense.id);
    toast({
      title: "Expense Deleted",
      description: `Removed ${expense.description} ($${expense.amount})`,
    });
  };

  const totalAmount = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
      <CardHeader>
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <Search className="h-6 w-6" />
          Expense History
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground">
          Track and manage all your expenses
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="border-border/50 focus:border-primary transition-colors"
            />
          </div>
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="md:w-48 border-border/50 focus:border-primary transition-colors">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="md:w-48 border-border/50 focus:border-primary transition-colors">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="amount">Sort by Amount</SelectItem>
              <SelectItem value="category">Sort by Category</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Summary */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold">
              {filteredExpenses.length} expenses found
            </span>
            <span className="text-lg font-bold gradient-text">
              Total: ${totalAmount.toFixed(2)}
            </span>
          </div>
        </div>

        {/* Expense List */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No expenses found matching your criteria.</p>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-center justify-between p-4 bg-background/80 rounded-lg shadow-soft hover:shadow-medium transition-all duration-200 border border-border/30"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={categoryColors[expense.category as keyof typeof categoryColors]}>
                      {categories.find(c => c.value === expense.category)?.label}
                    </Badge>
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="font-medium">{expense.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold flex items-center gap-1">
                    <DollarSign className="h-4 w-4" />
                    {expense.amount.toFixed(2)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(expense)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};