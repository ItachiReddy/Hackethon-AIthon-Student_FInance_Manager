import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import { useMemo } from "react";

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

interface FinancialHealthScoreProps {
  expenses: Expense[];
  budget: Budget;
}

interface HealthMetric {
  name: string;
  score: number;
  status: 'excellent' | 'good' | 'warning' | 'poor';
  description: string;
  icon: any;
}

export const FinancialHealthScore = ({ expenses, budget }: FinancialHealthScoreProps) => {
  const healthMetrics = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);
    
    // Budget Adherence Score (40% weight)
    const budgetScore = totalBudget > 0 ? Math.max(0, 100 - ((totalSpent / totalBudget) * 100 - 100)) : 50;
    
    // Spending Consistency Score (25% weight)
    const dailySpending = monthlyExpenses.reduce((acc, expense) => {
      const day = expense.date;
      acc[day] = (acc[day] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const spendingValues = Object.values(dailySpending);
    const avgDailySpending = spendingValues.length ? spendingValues.reduce((sum, val) => sum + val, 0) / spendingValues.length : 0;
    const variance = spendingValues.length ? spendingValues.reduce((sum, val) => sum + Math.pow(val - avgDailySpending, 2), 0) / spendingValues.length : 0;
    const consistencyScore = Math.max(0, 100 - (Math.sqrt(variance) / avgDailySpending) * 50);
    
    // Category Diversification Score (20% weight)
    const categorySpending = monthlyExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryCount = Object.keys(categorySpending).length;
    const diversificationScore = Math.min(100, categoryCount * 16.67); // Max score at 6 categories
    
    // Emergency Fund Indicator (15% weight)
    const avgMonthlySpending = totalSpent || 100;
    const emergencyScore = totalBudget >= avgMonthlySpending * 0.5 ? 100 : (totalBudget / (avgMonthlySpending * 0.5)) * 100;

    const metrics: HealthMetric[] = [
      {
        name: "Budget Adherence",
        score: budgetScore,
        status: budgetScore >= 80 ? 'excellent' : budgetScore >= 60 ? 'good' : budgetScore >= 40 ? 'warning' : 'poor',
        description: budgetScore >= 80 ? "Excellent budget control!" : budgetScore >= 60 ? "Good spending discipline" : budgetScore >= 40 ? "Watch your spending" : "Over budget - need action",
        icon: budgetScore >= 60 ? CheckCircle : AlertTriangle
      },
      {
        name: "Spending Consistency",
        score: consistencyScore,
        status: consistencyScore >= 80 ? 'excellent' : consistencyScore >= 60 ? 'good' : consistencyScore >= 40 ? 'warning' : 'poor',
        description: consistencyScore >= 80 ? "Very predictable spending" : consistencyScore >= 60 ? "Fairly consistent" : consistencyScore >= 40 ? "Some spending spikes" : "Erratic spending pattern",
        icon: consistencyScore >= 60 ? TrendingUp : TrendingDown
      },
      {
        name: "Category Balance",
        score: diversificationScore,
        status: diversificationScore >= 80 ? 'excellent' : diversificationScore >= 60 ? 'good' : diversificationScore >= 40 ? 'warning' : 'poor',
        description: diversificationScore >= 80 ? "Well-balanced spending" : diversificationScore >= 60 ? "Good category mix" : diversificationScore >= 40 ? "Limited spending variety" : "Too focused on few categories",
        icon: CheckCircle
      },
      {
        name: "Emergency Readiness",
        score: emergencyScore,
        status: emergencyScore >= 80 ? 'excellent' : emergencyScore >= 60 ? 'good' : emergencyScore >= 40 ? 'warning' : 'poor',
        description: emergencyScore >= 80 ? "Great emergency buffer" : emergencyScore >= 60 ? "Decent safety net" : emergencyScore >= 40 ? "Build emergency fund" : "Critical: No emergency fund",
        icon: emergencyScore >= 60 ? CheckCircle : AlertTriangle
      }
    ];

    return metrics;
  }, [expenses, budget]);

  const overallScore = Math.round(
    healthMetrics.reduce((sum, metric, index) => {
      const weights = [0.4, 0.25, 0.2, 0.15]; // Budget, Consistency, Diversity, Emergency
      return sum + metric.score * weights[index];
    }, 0)
  );

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBadge = (status: string) => {
    const badges = {
      excellent: { variant: "default" as const, color: "bg-green-500", text: "Excellent" },
      good: { variant: "secondary" as const, color: "bg-blue-500", text: "Good" },
      warning: { variant: "outline" as const, color: "bg-yellow-500", text: "Warning" },
      poor: { variant: "destructive" as const, color: "bg-red-500", text: "Poor" }
    };
    return badges[status as keyof typeof badges] || badges.poor;
  };

  return (
    <Card className="bg-gradient-card shadow-medium border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <TrendingUp className="h-6 w-6" />
          Financial Health Score
        </CardTitle>
        <CardDescription>
          AI-powered analysis of your financial wellness
        </CardDescription>
        <div className="flex items-center justify-center gap-4 mt-4">
          <div className="text-center">
            <div className={`text-4xl font-bold ${getScoreColor(overallScore)}`}>
              {overallScore}
            </div>
            <div className="text-sm text-muted-foreground">Overall Score</div>
          </div>
          <Badge className={getScoreBadge(overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'warning' : 'poor').color}>
            {getScoreBadge(overallScore >= 80 ? 'excellent' : overallScore >= 60 ? 'good' : overallScore >= 40 ? 'warning' : 'poor').text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {healthMetrics.map((metric, index) => {
          const Icon = metric.icon;
          const badge = getScoreBadge(metric.status);
          
          return (
            <div key={metric.name} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="font-medium">{metric.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`font-bold ${getScoreColor(metric.score)}`}>
                    {Math.round(metric.score)}
                  </span>
                  <Badge variant={badge.variant} className="text-xs">
                    {badge.text}
                  </Badge>
                </div>
              </div>
              <Progress value={metric.score} className="h-2" />
              <p className="text-xs text-muted-foreground">{metric.description}</p>
            </div>
          );
        })}
        
        {/* Improvement Suggestions */}
        <div className="mt-6 p-4 bg-background/50 rounded-lg">
          <h4 className="font-bold mb-2 text-sm">💡 Improvement Tips</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            {overallScore < 60 && (
              <li>• Create a monthly budget and track your spending categories</li>
            )}
            {healthMetrics[0].score < 70 && (
              <li>• Set spending limits for each category to improve budget control</li>
            )}
            {healthMetrics[1].score < 70 && (
              <li>• Try to maintain consistent daily spending habits</li>
            )}
            {healthMetrics[3].score < 70 && (
              <li>• Build an emergency fund equal to 2-3 months of expenses</li>
            )}
            <li>• Use voice input for quick expense tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};