import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Star, Target, TrendingUp, Award, Zap } from "lucide-react";

interface GameificationPanelProps {
  expenses: any[];
  budget: any;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

interface UserStats {
  totalPoints: number;
  level: number;
  currentStreak: number;
  totalSaved: number;
  achievements: Achievement[];
}

export const GameificationPanel = ({ expenses, budget }: GameificationPanelProps) => {
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    totalSaved: 0,
    achievements: []
  });

  // Calculate user stats based on expenses and budget
  useEffect(() => {
    const calculateStats = () => {
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthlyExpenses = expenses.filter(expense => 
        expense.date.startsWith(currentMonth)
      );

      // Calculate total saved money (budget - spent)
      let totalSaved = 0;
      let totalPoints = 0;
      
      Object.keys(budget).forEach(category => {
        const budgetAmount = budget[category] || 0;
        const spent = monthlyExpenses
          .filter(expense => expense.category === category)
          .reduce((sum, expense) => sum + expense.amount, 0);
        
        if (budgetAmount > 0 && spent < budgetAmount) {
          const saved = budgetAmount - spent;
          totalSaved += saved;
          // Award points for staying under budget (10 points per dollar saved)
          totalPoints += Math.floor(saved * 10);
        }
      });

      // Bonus points for tracking expenses regularly
      totalPoints += monthlyExpenses.length * 5;

      // Calculate level (every 1000 points = 1 level)
      const level = Math.floor(totalPoints / 1000) + 1;

      // Calculate achievements
      const achievements: Achievement[] = [
        {
          id: "first_expense",
          title: "Getting Started! 🎯",
          description: "Add your first expense",
          icon: Target,
          unlocked: expenses.length >= 1,
          progress: Math.min(expenses.length, 1),
          maxProgress: 1
        },
        {
          id: "budget_setter",
          title: "Budget Master 💰",
          description: "Set budgets for all categories",
          icon: Trophy,
          unlocked: Object.keys(budget).length >= 6,
          progress: Object.keys(budget).length,
          maxProgress: 6
        },
        {
          id: "expense_tracker",
          title: "Tracking Streak 📊",
          description: "Track 10 expenses",
          icon: TrendingUp,
          unlocked: expenses.length >= 10,
          progress: Math.min(expenses.length, 10),
          maxProgress: 10
        },
        {
          id: "money_saver",
          title: "Money Saver 💸",
          description: "Save $100 total",
          icon: Star,
          unlocked: totalSaved >= 100,
          progress: Math.min(totalSaved, 100),
          maxProgress: 100
        },
        {
          id: "budget_champion",
          title: "Budget Champion 🏆",
          description: "Stay under budget in all categories",
          icon: Award,
          unlocked: Object.keys(budget).every(category => {
            const budgetAmount = budget[category] || 0;
            const spent = monthlyExpenses
              .filter(expense => expense.category === category)
              .reduce((sum, expense) => sum + expense.amount, 0);
            return budgetAmount === 0 || spent <= budgetAmount;
          }),
          progress: Object.keys(budget).filter(category => {
            const budgetAmount = budget[category] || 0;
            const spent = monthlyExpenses
              .filter(expense => expense.category === category)
              .reduce((sum, expense) => sum + expense.amount, 0);
            return budgetAmount === 0 || spent <= budgetAmount;
          }).length,
          maxProgress: Math.max(Object.keys(budget).length, 1)
        },
        {
          id: "level_up",
          title: "Level Up Legend ⚡",
          description: "Reach level 5",
          icon: Zap,
          unlocked: level >= 5,
          progress: Math.min(level, 5),
          maxProgress: 5
        }
      ];

      setUserStats({
        totalPoints,
        level,
        currentStreak: 0, // TODO: Calculate actual streak
        totalSaved,
        achievements
      });
    };

    calculateStats();
  }, [expenses, budget]);

  const pointsToNextLevel = 1000 - (userStats.totalPoints % 1000);
  const levelProgress = (userStats.totalPoints % 1000) / 1000 * 100;

  return (
    <Card className="bg-gradient-hero shadow-glow hover:shadow-strong transition-all duration-300 border-0 text-white">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl flex items-center justify-center gap-2">
          <Trophy className="h-6 w-6" />
          Your Finance Journey
        </CardTitle>
        <CardDescription className="text-white/80">
          Track your progress and unlock achievements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and Points */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-4">
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              <Star className="h-4 w-4 mr-1" />
              Level {userStats.level}
            </Badge>
            <Badge className="bg-white/20 text-white text-lg px-4 py-2">
              <Zap className="h-4 w-4 mr-1" />
              {userStats.totalPoints} Points
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-white/80">
              {pointsToNextLevel} points to next level
            </p>
            <Progress value={levelProgress} className="h-2 bg-white/20" />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">${userStats.totalSaved.toFixed(2)}</p>
            <p className="text-sm text-white/80">Money Saved</p>
          </div>
          <div className="bg-white/10 p-4 rounded-lg text-center">
            <p className="text-2xl font-bold">
              {userStats.achievements.filter(a => a.unlocked).length}
            </p>
            <p className="text-sm text-white/80">Achievements</p>
          </div>
        </div>

        {/* Achievements */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Achievements</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {userStats.achievements.map((achievement) => (
              <div
                key={achievement.id}
                className={`p-3 rounded-lg border transition-all duration-200 ${
                  achievement.unlocked
                    ? "bg-white/20 border-white/30"
                    : "bg-white/5 border-white/10"
                }`}
              >
                <div className="flex items-center gap-3">
                  <achievement.icon 
                    className={`h-6 w-6 ${
                      achievement.unlocked ? "text-yellow-300" : "text-white/40"
                    }`} 
                  />
                  <div className="flex-1">
                    <h4 className={`font-medium ${
                      achievement.unlocked ? "text-white" : "text-white/60"
                    }`}>
                      {achievement.title}
                    </h4>
                    <p className={`text-sm ${
                      achievement.unlocked ? "text-white/80" : "text-white/40"
                    }`}>
                      {achievement.description}
                    </p>
                    {!achievement.unlocked && (
                      <div className="mt-2">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-1 bg-white/20"
                        />
                        <p className="text-xs text-white/60 mt-1">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                  {achievement.unlocked && (
                    <Badge className="bg-yellow-500 text-yellow-900">
                      <Award className="h-3 w-3 mr-1" />
                      Unlocked!
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};