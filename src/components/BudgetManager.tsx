import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Target, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Budget {
  [category: string]: number;
}

interface BudgetManagerProps {
  expenses: any[];
  budget: Budget;
  onUpdateBudget: (budget: Budget) => void;
}

const categories = [
  { value: "food", label: "🍕 Food & Dining", color: "bg-orange-500" },
  { value: "transport", label: "🚗 Transport", color: "bg-blue-500" },
  { value: "entertainment", label: "🎮 Entertainment", color: "bg-purple-500" },
  { value: "bills", label: "📋 Bills & Utilities", color: "bg-red-500" },
  { value: "education", label: "📚 Education", color: "bg-green-500" },
  { value: "others", label: "🔍 Others", color: "bg-gray-500" }
];

export const BudgetManager = ({ expenses, budget, onUpdateBudget }: BudgetManagerProps) => {
  const [budgetInputs, setBudgetInputs] = useState<Budget>(budget);
  const { toast } = useToast();

  // Calculate current month spending by category
  const currentMonthSpending = categories.reduce((acc, category) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const spent = expenses
      .filter(expense => 
        expense.category === category.value && 
        expense.date.startsWith(currentMonth)
      )
      .reduce((sum, expense) => sum + expense.amount, 0);
    acc[category.value] = spent;
    return acc;
  }, {} as Budget);

  const handleBudgetChange = (category: string, value: string) => {
    setBudgetInputs({
      ...budgetInputs,
      [category]: Number(value) || 0
    });
  };

  const saveBudgets = () => {
    onUpdateBudget(budgetInputs);
    toast({
      title: "Budgets Updated! 💰",
      description: "Your spending limits have been saved.",
    });
  };

  const getBudgetStatus = (category: string) => {
    const spent = currentMonthSpending[category] || 0;
    const budgetLimit = budget[category] || 0;
    
    if (budgetLimit === 0) return { percentage: 0, status: "no-budget", message: "No budget set" };
    
    const percentage = (spent / budgetLimit) * 100;
    
    if (percentage >= 100) return { percentage, status: "over", message: "Over budget!" };
    if (percentage >= 80) return { percentage, status: "warning", message: "Approaching limit" };
    return { percentage, status: "good", message: "On track" };
  };

  // Check for budget alerts
  useEffect(() => {
    categories.forEach(category => {
      const status = getBudgetStatus(category.value);
      if (status.status === "over") {
        toast({
          title: "Budget Alert! 🚨",
          description: `You've exceeded your ${category.label} budget this month.`,
          variant: "destructive",
        });
      }
    });
  }, [expenses, budget]);

  return (
    <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <Target className="h-6 w-6" />
          Budget Manager
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Set limits and track your spending progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Budget Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Monthly Budget Limits</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map((category) => (
              <div key={category.value} className="space-y-2">
                <Label htmlFor={`budget-${category.value}`}>
                  {category.label}
                </Label>
                <Input
                  id={`budget-${category.value}`}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={budgetInputs[category.value] || ""}
                  onChange={(e) => handleBudgetChange(category.value, e.target.value)}
                  className="border-border/50 focus:border-primary transition-colors"
                />
              </div>
            ))}
          </div>
          <Button onClick={saveBudgets} variant="success" className="w-full">
            <Target className="h-4 w-4" />
            Save Budget Limits
          </Button>
        </div>

        {/* Budget Progress */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            This Month's Progress
          </h3>
          <div className="space-y-4">
            {categories.map((category) => {
              const spent = currentMonthSpending[category.value] || 0;
              const budgetLimit = budget[category.value] || 0;
              const status = getBudgetStatus(category.value);
              
              return (
                <div key={category.value} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{category.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        ${spent.toFixed(2)} / ${budgetLimit.toFixed(2)}
                      </span>
                      <Badge variant={
                        status.status === "over" ? "destructive" : "secondary"
                      } className={
                        status.status === "warning" ? "bg-warning text-warning-foreground" : ""
                      }>
                        {status.status === "over" && <AlertTriangle className="h-3 w-3 mr-1" />}
                        {status.status === "good" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {status.message}
                      </Badge>
                    </div>
                  </div>
                  <Progress 
                    value={Math.min(status.percentage, 100)} 
                    className="h-2"
                  />
                  {status.percentage > 100 && (
                    <p className="text-sm text-destructive">
                      Over budget by ${(spent - budgetLimit).toFixed(2)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};