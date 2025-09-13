import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, DollarSign, Target, PieChart, Calendar } from "lucide-react";

interface Budget {
  [category: string]: number;
}

interface DashboardStatsProps {
  expenses: any[];
  budget: Budget;
}

export const DashboardStats = ({ expenses, budget }: DashboardStatsProps) => {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const lastMonth = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7);

  // Calculate current month spending
  const currentMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(currentMonth)
  );
  const currentMonthTotal = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate last month spending
  const lastMonthExpenses = expenses.filter(expense => 
    expense.date.startsWith(lastMonth)
  );
  const lastMonthTotal = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);

  // Calculate total budget
  const totalBudget = Object.values(budget).reduce((sum: number, amount: number) => sum + (amount || 0), 0);

  // Calculate spending change
  const spendingChange = lastMonthTotal > 0 ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 : 0;

  // Calculate category breakdown
  const categoryStats = currentMonthExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => (b as number) - (a as number))
    .slice(0, 3);

  const budgetUsagePercentage = totalBudget > 0 ? (currentMonthTotal / totalBudget) * 100 : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Spent This Month */}
      <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">This Month</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gradient-text">
            ${currentMonthTotal.toFixed(2)}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-1">
            {spendingChange >= 0 ? (
              <TrendingUp className="h-3 w-3 text-destructive mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-success mr-1" />
            )}
            <span className={spendingChange >= 0 ? "text-destructive" : "text-success"}>
              {Math.abs(spendingChange).toFixed(1)}%
            </span>
            <span className="ml-1">from last month</span>
          </div>
        </CardContent>
      </Card>

      {/* Budget Usage */}
      <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Usage</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gradient-text">
            {budgetUsagePercentage.toFixed(1)}%
          </div>
          <Progress value={Math.min(budgetUsagePercentage, 100)} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            ${currentMonthTotal.toFixed(2)} of ${totalBudget.toFixed(2)}
          </p>
        </CardContent>
      </Card>

      {/* Total Expenses */}
      <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold gradient-text">
            {expenses.length}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {currentMonthExpenses.length} this month
          </p>
        </CardContent>
      </Card>

      {/* Top Category */}
      <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Top Category</CardTitle>
          <PieChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {topCategories.length > 0 ? (
            <>
              <div className="text-2xl font-bold gradient-text">
                ${(topCategories[0][1] as number).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground mt-1 capitalize">
                {topCategories[0][0].replace('_', ' ')}
              </p>
            </>
          ) : (
            <div className="text-lg text-muted-foreground">
              No data yet
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};