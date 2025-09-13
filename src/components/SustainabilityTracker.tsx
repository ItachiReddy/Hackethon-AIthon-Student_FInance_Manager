import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Leaf, Recycle, TreePine, Zap, Car, ShoppingBag } from "lucide-react";
import { useMemo } from "react";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface SustainabilityTrackerProps {
  expenses: Expense[];
}

interface EcoMetric {
  category: string;
  amount: number;
  impact: number; // CO2 saved in kg
  ecoScore: number; // 0-100
  icon: any;
  color: string;
  description: string;
}

interface EcoAchievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  threshold: number;
  current: number;
}

export const SustainabilityTracker = ({ expenses }: SustainabilityTrackerProps) => {
  const ecoMetrics = useMemo(() => {
    // Define eco-friendly keywords and their impact scores
    const ecoKeywords = {
      transport: {
        eco: ['bus', 'train', 'metro', 'subway', 'bike', 'bicycle', 'walking', 'public transport', 'transit'],
        nonEco: ['uber', 'taxi', 'gas', 'fuel', 'parking', 'car'],
        impactPerDollar: 0.5 // kg CO2 saved per dollar spent on eco transport
      },
      food: {
        eco: ['vegetarian', 'vegan', 'organic', 'local', 'farmers market', 'plant', 'salad'],
        nonEco: ['beef', 'meat', 'fast food', 'takeout'],
        impactPerDollar: 0.3
      },
      shopping: {
        eco: ['thrift', 'secondhand', 'used', 'vintage', 'refurbished', 'recycled', 'sustainable'],
        nonEco: ['fast fashion', 'new'],
        impactPerDollar: 0.8
      },
      energy: {
        eco: ['solar', 'renewable', 'led', 'energy efficient'],
        nonEco: ['gas', 'conventional'],
        impactPerDollar: 0.4
      }
    };

    const categorizeExpense = (expense: Expense) => {
      const desc = expense.description.toLowerCase();
      let category = 'other';
      let isEco = false;
      let impactRate = 0.1; // default low impact

      for (const [cat, keywords] of Object.entries(ecoKeywords)) {
        if (keywords.eco.some(keyword => desc.includes(keyword))) {
          category = cat;
          isEco = true;
          impactRate = keywords.impactPerDollar;
          break;
        } else if (keywords.nonEco.some(keyword => desc.includes(keyword))) {
          category = cat;
          isEco = false;
          impactRate = -keywords.impactPerDollar; // negative impact for non-eco
          break;
        }
      }

      // Also check expense categories
      if (expense.category === 'transport') category = 'transport';
      if (expense.category === 'food') category = 'food';

      return { category, isEco, impactRate };
    };

    // Calculate metrics by category
    const categories = ['transport', 'food', 'shopping', 'energy'];
    
    const ecoExpenses = expenses.map(expense => ({
      ...expense,
      ...categorizeExpense(expense)
    }));

    const metrics: EcoMetric[] = categories.map(cat => {
      const categoryExpenses = ecoExpenses.filter(exp => exp.category === cat);
      const ecoOnlyExpenses = categoryExpenses.filter(exp => exp.isEco);
      const totalAmount = ecoOnlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      
      const totalImpact = ecoOnlyExpenses.reduce((sum, exp) => sum + (exp.amount * exp.impactRate), 0);
      const totalCategorySpend = categoryExpenses.reduce((sum, exp) => sum + exp.amount, 0);
      const ecoScore = totalCategorySpend > 0 ? (totalAmount / totalCategorySpend) * 100 : 0;

      const icons = {
        transport: Car,
        food: Leaf,
        shopping: ShoppingBag,
        energy: Zap
      };

      const colors = {
        transport: 'bg-green-500',
        food: 'bg-emerald-500',
        shopping: 'bg-teal-500',
        energy: 'bg-yellow-500'
      };

      const descriptions = {
        transport: 'Public transport, biking, walking',
        food: 'Plant-based, organic, local food',
        shopping: 'Second-hand, sustainable products',
        energy: 'Renewable energy, efficient appliances'
      };

      return {
        category: cat,
        amount: totalAmount,
        impact: Math.max(0, totalImpact),
        ecoScore,
        icon: icons[cat as keyof typeof icons],
        color: colors[cat as keyof typeof colors],
        description: descriptions[cat as keyof typeof descriptions]
      };
    });

    return metrics.filter(m => m.amount > 0 || m.impact > 0);
  }, [expenses]);

  const achievements = useMemo(() => {
    const totalEcoSpending = ecoMetrics.reduce((sum, m) => sum + m.amount, 0);
    const totalImpact = ecoMetrics.reduce((sum, m) => sum + m.impact, 0);
    const avgEcoScore = ecoMetrics.length > 0 ? ecoMetrics.reduce((sum, m) => sum + m.ecoScore, 0) / ecoMetrics.length : 0;

    const ecoAchievements: EcoAchievement[] = [
      {
        id: 'first-eco',
        title: 'Eco Warrior',
        description: 'Make your first sustainable purchase',
        icon: Leaf,
        threshold: 1,
        current: totalEcoSpending > 0 ? 1 : 0,
        unlocked: totalEcoSpending > 0
      },
      {
        id: 'carbon-saver',
        title: 'Carbon Saver',
        description: 'Save 10kg CO2 through eco choices',
        icon: TreePine,
        threshold: 10,
        current: totalImpact,
        unlocked: totalImpact >= 10
      },
      {
        id: 'green-spender',
        title: 'Green Spender',
        description: 'Spend $100 on sustainable options',
        icon: Recycle,
        threshold: 100,
        current: totalEcoSpending,
        unlocked: totalEcoSpending >= 100
      },
      {
        id: 'eco-lifestyle',
        title: 'Eco Lifestyle',
        description: 'Achieve 50% eco-friendly spending',
        icon: Leaf,
        threshold: 50,
        current: avgEcoScore,
        unlocked: avgEcoScore >= 50
      }
    ];

    return ecoAchievements;
  }, [ecoMetrics]);

  const totalImpact = ecoMetrics.reduce((sum, m) => sum + m.impact, 0);
  const totalEcoSpending = ecoMetrics.reduce((sum, m) => sum + m.amount, 0);
  const overallEcoScore = ecoMetrics.length > 0 ? ecoMetrics.reduce((sum, m) => sum + m.ecoScore, 0) / ecoMetrics.length : 0;

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-2xl gradient-text flex items-center gap-2">
            <Leaf className="h-6 w-6" />
            Sustainability Tracker
          </CardTitle>
          <CardDescription>
            Track your eco-friendly spending and environmental impact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{totalImpact.toFixed(1)} kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Saved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">${totalEcoSpending.toFixed(2)}</div>
              <div className="text-sm text-muted-foreground">Eco Spending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-600">{overallEcoScore.toFixed(0)}%</div>
              <div className="text-sm text-muted-foreground">Eco Score</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Sustainability Score</span>
              <span>{overallEcoScore.toFixed(0)}%</span>
            </div>
            <Progress value={overallEcoScore} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Recycle className="h-5 w-5" />
            Eco Categories
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {ecoMetrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.category} className="p-4 bg-background/50 rounded-lg">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${metric.color}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold capitalize">{metric.category}</h4>
                      <p className="text-xs text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">${metric.amount.toFixed(2)}</div>
                    <div className="text-xs text-green-600">{metric.impact.toFixed(1)} kg CO₂ saved</div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Eco-Friendliness</span>
                    <span>{metric.ecoScore.toFixed(0)}%</span>
                  </div>
                  <Progress value={metric.ecoScore} className="h-2" />
                </div>
              </div>
            );
          })}
          
          {ecoMetrics.length === 0 && (
            <div className="text-center py-6">
              <Leaf className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">Start Your Eco Journey</h3>
              <p className="text-sm text-muted-foreground">
                Begin tracking sustainable expenses to see your environmental impact!
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TreePine className="h-5 w-5" />
            Eco Achievements
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {achievements.map((achievement) => {
            const Icon = achievement.icon;
            return (
              <div 
                key={achievement.id}
                className={`p-3 rounded-lg border transition-all ${
                  achievement.unlocked 
                    ? 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800' 
                    : 'bg-background/50 border-border/50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-green-500">
                      ✓ Unlocked
                    </Badge>
                  )}
                </div>
                
                {!achievement.unlocked && (
                  <>
                    <Progress 
                      value={(achievement.current / achievement.threshold) * 100} 
                      className="h-2 mb-1"
                    />
                    <div className="text-xs text-muted-foreground">
                      {achievement.current.toFixed(1)} / {achievement.threshold}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg">🌱 Sustainability Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🚌 Transport</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use public transport or bike instead of rideshares</li>
                <li>• Walk for short distances</li>
                <li>• Consider a transit pass for regular commuting</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">🥗 Food</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Choose plant-based meals more often</li>
                <li>• Shop at farmers markets for local produce</li>
                <li>• Cook at home to reduce packaging waste</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">👕 Shopping</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Buy from thrift stores and consignment shops</li>
                <li>• Choose quality items that last longer</li>
                <li>• Repair instead of replacing when possible</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">⚡ Energy</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Use LED bulbs and energy-efficient appliances</li>
                <li>• Unplug devices when not in use</li>
                <li>• Consider renewable energy options</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};