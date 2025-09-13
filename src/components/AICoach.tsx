import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Bot, Send, TrendingUp, AlertCircle, Lightbulb, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

interface AICoachProps {
  expenses: Expense[];
  budget: Budget;
}

interface ChatMessage {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: Date;
}

interface FinancialInsight {
  type: 'tip' | 'warning' | 'goal' | 'achievement';
  title: string;
  description: string;
  actionable: boolean;
}

export const AICoach = ({ expenses, budget }: AICoachProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      type: 'ai',
      content: "Hi! I'm your AI Financial Coach 🤖. I've analyzed your spending patterns and I'm here to help you build better financial habits. Ask me anything about budgeting, saving, or your expenses!",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Generate AI insights based on spending patterns
  const generateInsights = (): FinancialInsight[] => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyExpenses = expenses.filter(exp => {
      const expDate = new Date(exp.date);
      return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);
    
    const categorySpending = monthlyExpenses.reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {} as Record<string, number>);

    const insights: FinancialInsight[] = [];

    // Budget analysis
    if (totalBudget > 0) {
      const budgetUsage = (totalSpent / totalBudget) * 100;
      if (budgetUsage > 90) {
        insights.push({
          type: 'warning',
          title: 'Budget Alert',
          description: `You've used ${budgetUsage.toFixed(1)}% of your monthly budget. Consider reducing discretionary spending.`,
          actionable: true
        });
      } else if (budgetUsage < 70) {
        insights.push({
          type: 'achievement',
          title: 'Great Budget Control!',
          description: `You're only using ${budgetUsage.toFixed(1)}% of your budget. Consider saving the excess or increasing your emergency fund.`,
          actionable: true
        });
      }
    }

    // Category-specific insights
    const topCategory = Object.entries(categorySpending).sort(([,a], [,b]) => b - a)[0];
    if (topCategory && topCategory[1] > totalSpent * 0.4) {
      insights.push({
        type: 'tip',
        title: 'Spending Pattern Notice',
        description: `${((topCategory[1] / totalSpent) * 100).toFixed(1)}% of your spending is on ${topCategory[0]}. Consider if this aligns with your priorities.`,
        actionable: true
      });
    }

    // Saving goals
    if (totalBudget > totalSpent) {
      const savings = totalBudget - totalSpent;
      insights.push({
        type: 'goal',
        title: 'Savings Opportunity',
        description: `You could save $${savings.toFixed(2)} this month! Consider setting up automatic savings.`,
        actionable: true
      });
    }

    // Consistency insights
    const expenseDays = [...new Set(monthlyExpenses.map(exp => exp.date))].length;
    if (expenseDays < 10 && monthlyExpenses.length > 10) {
      insights.push({
        type: 'tip',
        title: 'Expense Tracking',
        description: 'You tend to make multiple purchases on the same days. Try spreading expenses more evenly for better budget control.',
        actionable: true
      });
    }

    return insights;
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    const insights = generateInsights();
    const totalSpent = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalBudget = Object.values(budget).reduce((sum, amount) => sum + amount, 0);
    
    // Pattern matching for common queries
    if (lowerMessage.includes('budget') || lowerMessage.includes('spending')) {
      return `Based on your data, you've spent $${totalSpent.toFixed(2)} with a total budget of $${totalBudget.toFixed(2)}. ${insights.find(i => i.type === 'warning' || i.type === 'achievement')?.description || 'Your spending is on track!'} Would you like specific tips for any category?`;
    }
    
    if (lowerMessage.includes('save') || lowerMessage.includes('saving')) {
      const savings = totalBudget - totalSpent;
      return savings > 0 
        ? `Great question! You could potentially save $${savings.toFixed(2)} this month. I recommend: 1) Set up automatic transfers to savings, 2) Use the 50/30/20 rule (needs/wants/savings), 3) Track daily expenses to avoid impulse purchases. Want me to help you create a savings plan?`
        : `You're currently over budget, so let's focus on reducing expenses first. Try: 1) Cook more meals at home, 2) Use student discounts, 3) Set daily spending limits. Once you're back on track, we can work on building savings!`;
    }
    
    if (lowerMessage.includes('food') || lowerMessage.includes('eating')) {
      const foodExpenses = expenses.filter(exp => exp.category === 'food');
      return `I see you've spent on food ${foodExpenses.length} times. Student-friendly tips: 1) Meal prep on Sundays, 2) Shop with a list, 3) Use campus meal plans efficiently, 4) Cook with friends to split costs. The average student spends $200-300/month on food - how does that compare to your spending?`;
    }
    
    if (lowerMessage.includes('help') || lowerMessage.includes('tip')) {
      const randomTips = [
        "Use the envelope method: allocate cash for each spending category!",
        "Try the 24-hour rule: wait a day before making non-essential purchases.",
        "Look for student discounts everywhere - software, transport, food, entertainment!",
        "Set up price alerts for items you need but don't need immediately.",
        "Use apps to find free campus events instead of paid entertainment."
      ];
      return `Here's a personalized tip: ${randomTips[Math.floor(Math.random() * randomTips.length)]} Based on your spending, I also notice ${insights[0]?.description || "you're doing well with tracking expenses!"}`;
    }
    
    if (lowerMessage.includes('goal') || lowerMessage.includes('plan')) {
      return `Let's set some SMART financial goals! Based on your spending pattern: 1) Short-term: Save $50 this month, 2) Medium-term: Build a $500 emergency fund, 3) Long-term: Graduate debt-free. Which goal interests you most? I can help you create a step-by-step plan!`;
    }

    // Default response with insights
    return `That's a great question! Based on your spending patterns, here's what I've noticed: ${insights[0]?.description || "You're building good financial habits by tracking your expenses."} 

Here are some personalized recommendations:
• Focus on your biggest spending category for maximum impact
• Use the voice input feature for quick expense tracking
• Set weekly mini-budgets to stay on track

What specific aspect of your finances would you like to improve?`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI processing time
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: generateAIResponse(input),
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1500);
  };

  const insights = generateInsights();

  return (
    <div className="space-y-6">
      {/* Quick Insights */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Smart Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your financial patterns
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {insights.map((insight, index) => {
            const icons = {
              tip: Lightbulb,
              warning: AlertCircle,
              goal: Target,
              achievement: TrendingUp
            };
            const Icon = icons[insight.type];
            const colors = {
              tip: 'bg-blue-500',
              warning: 'bg-red-500',
              goal: 'bg-green-500',
              achievement: 'bg-purple-500'
            };

            return (
              <div key={index} className="p-3 bg-background/50 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className={`p-1 rounded-full ${colors[insight.type]}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-muted-foreground">{insight.description}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {insight.type}
                  </Badge>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* AI Chat Interface */}
      <Card className="bg-gradient-card shadow-medium border-0">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Financial Coach
          </CardTitle>
          <CardDescription>
            Get personalized advice and ask questions about your finances
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          <div className="h-64 overflow-y-auto space-y-3 mb-4 p-3 bg-background/30 rounded-lg">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-lg text-sm ${
                    message.type === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted p-3 rounded-lg text-sm">
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary"></div>
                    AI Coach is thinking...
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me about budgeting, saving, or your expenses..."
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className="flex-1"
            />
            <Button onClick={handleSendMessage} disabled={isLoading || !input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Questions */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              "How can I save more?",
              "Is my spending healthy?",
              "Set a savings goal",
              "Food budget tips"
            ].map((question) => (
              <Button
                key={question}
                variant="outline"
                size="sm"
                onClick={() => setInput(question)}
                className="text-xs"
              >
                {question}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};