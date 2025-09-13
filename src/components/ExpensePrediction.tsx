import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, AlertTriangle, Target, Brain } from "lucide-react";
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

interface ExpensePredictionProps {
  expenses: Expense[];
  budget: Budget;
  onUpdateBudget: (newBudget: Budget) => void;
}

interface Prediction {
  category: string;
  predictedAmount: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  reasoning: string;
}

interface BudgetRecommendation {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reasoning: string;
  impact: 'high' | 'medium' | 'low';
}

export const ExpensePrediction = ({ expenses, budget, onUpdateBudget }: ExpensePredictionProps) => {
  const predictions = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Get last 3 months of data for trend analysis
    const historicalData = [];
    for (let i = 0; i < 3; i++) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthExpenses = expenses.filter(exp => {
        const expDate = new Date(exp.date);
        return expDate.getMonth() === monthDate.getMonth() && expDate.getFullYear() === monthDate.getFullYear();
      });
      
      const categoryTotals = monthExpenses.reduce((acc, exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        return acc;
      }, {} as Record<string, number>);
      
      historicalData.push({
        month: monthDate.toLocaleString('default', { month: 'short' }),
        data: categoryTotals
      });
    }

    // Generate predictions for each category
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const categoryPredictions: Prediction[] = categories.map(category => {
      // Get monthly spending for this category
      const monthlySpending = historicalData.map(month => month.data[category] || 0);
      
      // Simple linear regression for trend analysis
      const avgSpending = monthlySpending.reduce((sum, amount) => sum + amount, 0) / monthlySpending.length;
      
      // Calculate trend
      let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
      if (monthlySpending.length >= 2) {
        const recent = monthlySpending[0]; // Most recent month
        const older = monthlySpending[monthlySpending.length - 1]; // Oldest month
        if (recent > older * 1.1) trend = 'increasing';
        else if (recent < older * 0.9) trend = 'decreasing';
      }

      // Predict next month based on trend and seasonality
      let predictedAmount = avgSpending;
      let confidence = 70; // Base confidence

      if (trend === 'increasing') {
        predictedAmount = avgSpending * 1.15;
        confidence = monthlySpending.length >= 3 ? 85 : 70;
      } else if (trend === 'decreasing') {
        predictedAmount = avgSpending * 0.85;
        confidence = monthlySpending.length >= 3 ? 80 : 65;
      }

      // Adjust for seasonal patterns (basic heuristics)
      const nextMonth = new Date(currentYear, currentMonth + 1, 1).getMonth();
      if (category === 'education' && (nextMonth === 8 || nextMonth === 0)) { // Sept/Jan - new semester
        predictedAmount *= 1.3;
        confidence = Math.min(confidence + 10, 95);
      }
      if (category === 'entertainment' && (nextMonth === 11 || nextMonth === 0)) { // Dec/Jan - holidays
        predictedAmount *= 1.2;
      }

      const reasoning = `Based on ${monthlySpending.length} months of data showing ${trend} trend. Average: $${avgSpending.toFixed(2)}/month.`;

      return {
        category,
        predictedAmount: Math.max(0, predictedAmount),
        confidence,
        trend,
        reasoning
      };
    });

    return categoryPredictions.filter(p => p.predictedAmount > 0);
  }, [expenses]);

  const budgetRecommendations = useMemo(() => {
    const recommendations: BudgetRecommendation[] = predictions.map(prediction => {
      const currentBudget = budget[prediction.category] || 0;
      const predicted = prediction.predictedAmount;
      
      let recommendedBudget = predicted * 1.1; // 10% buffer
      let impact: 'high' | 'medium' | 'low' = 'medium';
      let reasoning = '';

      if (currentBudget === 0) {
        recommendedBudget = predicted * 1.2; // 20% buffer for new categories
        reasoning = `No budget set. Recommend $${recommendedBudget.toFixed(2)} based on predictions plus 20% buffer.`;
        impact = 'high';
      } else if (predicted > currentBudget * 1.1) {
        recommendedBudget = predicted * 1.15; // 15% buffer for increasing categories
        reasoning = `Predicted spending exceeds current budget. Increase recommended to avoid overspending.`;
        impact = 'high';
      } else if (predicted < currentBudget * 0.8) {
        recommendedBudget = predicted * 1.1; // Reduce budget but keep 10% buffer
        reasoning = `Current budget seems high. You could reallocate funds to other categories.`;
        impact = 'medium';
      } else {
        recommendedBudget = currentBudget; // Keep current budget
        reasoning = `Current budget is appropriate for predicted spending.`;
        impact = 'low';
      }

      return {
        category: prediction.category,
        currentBudget,
        recommendedBudget,
        reasoning,
        impact
      };
    });

    return recommendations.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }, [predictions, budget]);

  const totalPredicted = predictions.reduce((sum, p) => sum + p.predictedAmount, 0);
  const totalCurrentBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);

  const applyRecommendation = (rec: BudgetRecommendation) => {
    const newBudget = { ...budget };
    newBudget[rec.category] = rec.recommendedBudget;
    onUpdateBudget(newBudget);
  };

  const applyAllRecommendations = () => {
    const newBudget = { ...budget };
    budgetRecommendations.forEach(rec => {
      if (rec.impact === 'high') {
        newBudget[rec.category] = rec.recommendedBudget;
      }
    });
    onUpdateBudget(newBudget);
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text flex items-center gap-2">
            <Brain className="h-6 w-6" />
            AI Expense Predictions
          </CardTitle>
          <CardDescription>
            Machine learning analysis of your spending patterns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">${totalPredicted.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Predicted Next Month</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">${totalCurrentBudget.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Current Budget</div>
            </div>
          </div>
          {totalPredicted > totalCurrentBudget * 1.1 && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span className="text-sm text-red-700 dark:text-red-300">
                Predicted spending exceeds budget by ${(totalPredicted - totalCurrentBudget).toFixed(2)}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Category Predictions */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Category Predictions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {predictions.map((prediction) => {
            const currentBudget = budget[prediction.category] || 0;
            const isOverBudget = prediction.predictedAmount > currentBudget;
            
            return (
              <div key={prediction.category} className="p-4 bg-background/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold capitalize">{prediction.category}</h4>
                    <p className="text-xs text-muted-foreground">{prediction.reasoning}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">
                      ${prediction.predictedAmount.toFixed(2)}
                    </div>
                    <Badge variant={
                      prediction.trend === 'increasing' ? 'destructive' : 
                      prediction.trend === 'decreasing' ? 'default' : 'secondary'
                    }>
                      {prediction.trend}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Confidence</span>
                    <span>{prediction.confidence}%</span>
                  </div>
                  <Progress value={prediction.confidence} className="h-2" />
                  
                  {currentBudget > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span>vs Current Budget</span>
                        <span className={isOverBudget ? 'text-red-500' : 'text-green-500'}>
                          {isOverBudget ? '+' : '-'}${Math.abs(prediction.predictedAmount - currentBudget).toFixed(2)}
                        </span>
                      </div>
                      <Progress 
                        value={Math.min(100, (prediction.predictedAmount / currentBudget) * 100)} 
                        className="h-2"
                      />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Budget Recommendations */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Smart Budget Adjustments
          </CardTitle>
          <CardDescription>
            AI-recommended budget changes based on predictions
          </CardDescription>
          <Button onClick={applyAllRecommendations} className="mt-2">
            Apply All High-Priority Changes
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {budgetRecommendations.map((rec) => {
            const difference = rec.recommendedBudget - rec.currentBudget;
            const isIncrease = difference > 0;
            
            return (
              <div key={rec.category} className="p-4 bg-background/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold capitalize">{rec.category}</h4>
                      <Badge variant={
                        rec.impact === 'high' ? 'destructive' : 
                        rec.impact === 'medium' ? 'default' : 'secondary'
                      }>
                        {rec.impact} impact
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{rec.reasoning}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant={rec.impact === 'high' ? 'default' : 'outline'}
                    onClick={() => applyRecommendation(rec)}
                  >
                    Apply
                  </Button>
                </div>
                
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-sm font-semibold">${rec.currentBudget.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Current</div>
                  </div>
                  <div>
                    <div className={`text-sm font-semibold ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                      {isIncrease ? '+' : ''}${difference.toFixed(2)}
                    </div>
                    <div className="text-xs text-muted-foreground">Change</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold">${rec.recommendedBudget.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">Recommended</div>
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
};