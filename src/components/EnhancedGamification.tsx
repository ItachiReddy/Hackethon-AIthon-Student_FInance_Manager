import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Flame, Star, Gift, Zap, Award, Crown, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";

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

interface EnhancedGamificationProps {
  expenses: Expense[];
  budget: Budget;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: any;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  points: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  target: number;
  current: number;
  reward: number;
  expiry: string;
  type: 'daily' | 'weekly' | 'monthly';
}

export const EnhancedGamification = ({ expenses, budget }: EnhancedGamificationProps) => {
  const [streakCount, setStreakCount] = useState(0);
  const [level, setLevel] = useState(1);
  const [totalPoints, setTotalPoints] = useState(0);
  const [unlockedRewards, setUnlockedRewards] = useState<string[]>([]);

  const achievements = useMemo(() => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);
    const categories = [...new Set(expenses.map(exp => exp.category))];
    const expenseCount = expenses.length;

    const baseAchievements: Achievement[] = [
      {
        id: 'first-expense',
        title: 'First Step',
        description: 'Log your first expense',
        icon: Star,
        progress: Math.min(expenseCount, 1),
        maxProgress: 1,
        unlocked: expenseCount >= 1,
        points: 50,
        tier: 'bronze'
      },
      {
        id: 'expense-tracker',
        title: 'Expense Tracker',
        description: 'Track 10 expenses',
        icon: Target,
        progress: Math.min(expenseCount, 10),
        maxProgress: 10,
        unlocked: expenseCount >= 10,
        points: 100,
        tier: 'bronze'
      },
      {
        id: 'budget-master',
        title: 'Budget Master',
        description: 'Stay within budget for a month',
        icon: Trophy,
        progress: totalBudget > 0 ? Math.min(100, ((totalBudget - totalSpent) / totalBudget) * 100) : 0,
        maxProgress: 100,
        unlocked: totalBudget > 0 && totalSpent <= totalBudget,
        points: 200,
        tier: 'gold'
      },
      {
        id: 'category-explorer',
        title: 'Category Explorer',
        description: 'Use 5 different categories',
        icon: Sparkles,
        progress: Math.min(categories.length, 5),
        maxProgress: 5,
        unlocked: categories.length >= 5,
        points: 150,
        tier: 'silver'
      },
      {
        id: 'savings-champion',
        title: 'Savings Champion',
        description: 'Save 20% of your budget',
        icon: Crown,
        progress: totalBudget > 0 ? Math.min(100, ((totalBudget - totalSpent) / totalBudget) * 100) : 0,
        maxProgress: 20,
        unlocked: totalBudget > 0 && ((totalBudget - totalSpent) / totalBudget) >= 0.2,
        points: 300,
        tier: 'platinum'
      },
      {
        id: 'voice-user',
        title: 'Voice Commander',
        description: 'Use voice input 5 times',
        icon: Zap,
        progress: 0, // This would need to be tracked separately
        maxProgress: 5,
        unlocked: false,
        points: 100,
        tier: 'silver'
      },
      {
        id: 'consistent-tracker',
        title: 'Consistency King',
        description: 'Track expenses for 7 consecutive days',
        icon: Flame,
        progress: streakCount,
        maxProgress: 7,
        unlocked: streakCount >= 7,
        points: 250,
        tier: 'gold'
      }
    ];

    return baseAchievements;
  }, [expenses, budget, streakCount]);

  const challenges = useMemo(() => {
    const today = new Date();
    const dailyChallenges: Challenge[] = [
      {
        id: 'daily-budget',
        title: 'Daily Budget Hero',
        description: 'Spend less than $50 today',
        target: 50,
        current: expenses.filter(exp => 
          new Date(exp.date).toDateString() === today.toDateString()
        ).reduce((sum, exp) => sum + exp.amount, 0),
        reward: 25,
        expiry: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString(),
        type: 'daily'
      },
      {
        id: 'weekly-saver',
        title: 'Weekly Saver',
        description: 'Save $100 this week',
        target: 100,
        current: 0, // Calculate savings
        reward: 100,
        expiry: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        type: 'weekly'
      }
    ];

    return dailyChallenges;
  }, [expenses]);

  const rewards = useMemo(() => [
    { id: 'budget-boost', title: '10% Budget Boost', description: 'Increase any category budget by 10%', cost: 500, unlocked: totalPoints >= 500 },
    { id: 'category-unlock', title: 'Custom Category', description: 'Create a custom expense category', cost: 200, unlocked: totalPoints >= 200 },
    { id: 'premium-insights', title: 'Premium Insights', description: 'Advanced spending analytics', cost: 1000, unlocked: totalPoints >= 1000 },
    { id: 'export-premium', title: 'Premium Export', description: 'Export data in multiple formats', cost: 300, unlocked: totalPoints >= 300 }
  ], [totalPoints]);

  // Calculate level and points
  useEffect(() => {
    const earnedPoints = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.points, 0);
    setTotalPoints(earnedPoints);
    setLevel(Math.floor(earnedPoints / 200) + 1);
  }, [achievements]);

  const getTierColor = (tier: string) => {
    const colors = {
      bronze: 'bg-orange-500',
      silver: 'bg-gray-400',
      gold: 'bg-yellow-500',
      platinum: 'bg-purple-500'
    };
    return colors[tier as keyof typeof colors] || colors.bronze;
  };

  const getProgressColor = (progress: number, max: number) => {
    const percentage = (progress / max) * 100;
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 75) return 'bg-blue-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Player Stats */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
            <Crown className="h-6 w-6" />
            Level {level} Financial Warrior
          </CardTitle>
          <CardDescription>
            {totalPoints} XP • Next level: {((level * 200) - totalPoints)} XP
          </CardDescription>
          <Progress value={((totalPoints % 200) / 200) * 100} className="mt-2" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-orange-500">{streakCount}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-500">{achievements.filter(a => a.unlocked).length}</div>
              <div className="text-xs text-muted-foreground">Achievements</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{totalPoints}</div>
              <div className="text-xs text-muted-foreground">Total XP</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Challenges */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target className="h-5 w-5" />
            Active Challenges
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="p-3 bg-background/50 rounded-lg">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-semibold text-sm">{challenge.title}</h4>
                  <p className="text-xs text-muted-foreground">{challenge.description}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  +{challenge.reward} XP
                </Badge>
              </div>
              <Progress 
                value={(challenge.current / challenge.target) * 100} 
                className="h-2 mb-1"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{challenge.current} / {challenge.target}</span>
                <span>{challenge.type}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
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
                  <div className="flex items-center gap-2">
                    <div className={`p-1 rounded-full ${getTierColor(achievement.tier)}`}>
                      <Icon className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">{achievement.title}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getTierColor(achievement.tier)}>
                      {achievement.tier}
                    </Badge>
                    <div className="text-xs text-muted-foreground mt-1">
                      +{achievement.points} XP
                    </div>
                  </div>
                </div>
                {!achievement.unlocked && (
                  <>
                    <Progress 
                      value={(achievement.progress / achievement.maxProgress) * 100} 
                      className="h-2 mb-1"
                    />
                    <div className="text-xs text-muted-foreground">
                      {achievement.progress} / {achievement.maxProgress}
                    </div>
                  </>
                )}
                {achievement.unlocked && (
                  <Badge variant="default" className="bg-green-500 text-xs">
                    ✓ Unlocked
                  </Badge>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Rewards Store */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Gift className="h-5 w-5" />
            Rewards Store
          </CardTitle>
          <CardDescription>
            Spend your XP on helpful rewards
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {rewards.map((reward) => (
            <div 
              key={reward.id} 
              className={`p-3 rounded-lg border ${
                reward.unlocked 
                  ? 'bg-background/50 border-border/50' 
                  : 'bg-muted/30 border-muted opacity-60'
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-semibold text-sm">{reward.title}</h4>
                  <p className="text-xs text-muted-foreground">{reward.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold">{reward.cost} XP</div>
                  <Button 
                    size="sm" 
                    variant={reward.unlocked ? "default" : "outline"}
                    disabled={!reward.unlocked || unlockedRewards.includes(reward.id)}
                    className="mt-1 text-xs"
                    onClick={() => {
                      if (reward.unlocked && !unlockedRewards.includes(reward.id)) {
                        setUnlockedRewards(prev => [...prev, reward.id]);
                        setTotalPoints(prev => prev - reward.cost);
                      }
                    }}
                  >
                    {unlockedRewards.includes(reward.id) ? 'Claimed' : reward.unlocked ? 'Claim' : 'Locked'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};