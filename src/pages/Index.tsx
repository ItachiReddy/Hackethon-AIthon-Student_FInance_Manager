import { useState, useEffect } from "react";
import { ExpenseForm } from "@/components/ExpenseForm";
import { BudgetManager } from "@/components/BudgetManager";
import { ExpenseList } from "@/components/ExpenseList";
import { GameificationPanel } from "@/components/GameificationPanel";
import { DashboardStats } from "@/components/DashboardStats";
import { ExportManager } from "@/components/ExportManager";
import { CustomCategoryManager } from "@/components/CustomCategoryManager";
import { FinancialHealthScore } from "@/components/FinancialHealthScore";
import { EnhancedGamification } from "@/components/EnhancedGamification";
import { AICoach } from "@/components/AICoach";
import { ExpensePrediction } from "@/components/ExpensePrediction";
import { SustainabilityTracker } from "@/components/SustainabilityTracker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wallet, TrendingUp, Moon, Sun, Download, Settings } from "lucide-react";
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

interface CustomCategory {
  id: string;
  value: string;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
}

const Index = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [categories, setCategories] = useState<CustomCategory[]>([]);
  const { toast } = useToast();

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedExpenses = localStorage.getItem("student-finance-expenses");
    const savedBudget = localStorage.getItem("student-finance-budget");
    const savedTheme = localStorage.getItem("student-finance-theme");

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }
    if (savedBudget) {
      setBudget(JSON.parse(savedBudget));
    }
    if (savedTheme) {
      setIsDarkMode(savedTheme === "dark");
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem("student-finance-expenses", JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem("student-finance-budget", JSON.stringify(budget));
  }, [budget]);

  const addExpense = (expense: Expense) => {
    setExpenses(prev => [expense, ...prev]);
  };

  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };

  const updateBudget = (newBudget: Budget) => {
    setBudget(newBudget);
  };

  const updateCategories = (newCategories: CustomCategory[]) => {
    setCategories(newCategories);
  };

  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    document.documentElement.classList.toggle("dark", newTheme);
    localStorage.setItem("student-finance-theme", newTheme ? "dark" : "light");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-gradient-hero shadow-glow sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 lg:py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="p-2 lg:p-3 bg-white/20 rounded-full">
                <Wallet className="h-6 w-6 lg:h-8 lg:w-8 text-white" />
              </div>
              <div className="text-center sm:text-left">
                <h1 className="text-xl lg:text-3xl font-bold text-white">Student Finance Manager</h1>
                <p className="text-white/80 text-sm lg:text-base">Smart spending, smarter saving 💰</p>
              </div>
            </div>
            <div className="flex items-center gap-2 lg:gap-4 flex-wrap justify-center">
              <Badge className="bg-white/20 text-white text-sm lg:text-lg px-3 lg:px-4 py-1 lg:py-2 animate-bounce-gentle">
                <TrendingUp className="h-3 w-3 lg:h-4 lg:w-4 mr-1 lg:mr-2" />
                <span className="hidden sm:inline">${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)} Tracked</span>
                <span className="sm:hidden">${expenses.reduce((sum, expense) => sum + expense.amount, 0).toFixed(2)}</span>
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="text-white hover:bg-white/20"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 lg:py-8 space-y-6 lg:space-y-8">
        {/* Welcome Section */}
        <section className="text-center space-y-4 animate-fade-in">
          <h2 className="text-xl lg:text-2xl font-bold gradient-text">
            Take Control of Your Student Budget
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm lg:text-base">
            Track expenses, set smart budgets, and gamify your financial journey. 
            Perfect for students who want to build healthy money habits while having fun!
          </p>
        </section>

        {/* Dashboard Stats */}
        <section className="animate-fade-in">
          <DashboardStats expenses={expenses} budget={budget} />
        </section>

        {/* Navigation Menu */}
        <nav className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b animate-fade-in">
          <div className="container mx-auto px-4 py-3">
            <div className="flex justify-center">
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                <button
                  onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-xs lg:text-sm rounded-md transition-colors hover:bg-background hover:shadow-sm"
                >
                  📊 Overview
                </button>
                <button
                  onClick={() => document.getElementById('categories')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-xs lg:text-sm rounded-md transition-colors hover:bg-background hover:shadow-sm flex items-center gap-1"
                >
                  🎯 Categories
                </button>
                <button
                  onClick={() => document.getElementById('manage')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-xs lg:text-sm rounded-md transition-colors hover:bg-background hover:shadow-sm flex items-center gap-1"
                >
                  <Settings className="h-3 w-3 lg:h-4 lg:w-4" />
                  Manage
                </button>
                <button
                  onClick={() => document.getElementById('export')?.scrollIntoView({ behavior: 'smooth' })}
                  className="px-3 py-2 text-xs lg:text-sm rounded-md transition-colors hover:bg-background hover:shadow-sm flex items-center gap-1"
                >
                  <Download className="h-3 w-3 lg:h-4 lg:w-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Scrollable Sections */}
        <div className="space-y-16">
          {/* Overview Section */}
          <section id="overview" className="scroll-mt-32 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">📊 Overview</h2>
              <p className="text-muted-foreground">Track your expenses and view your spending patterns</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
              {/* Left Column - Forms */}
              <div className="lg:col-span-2 space-y-6 lg:space-y-8">
                {/* Expense Form */}
                <div className="animate-slide-in">
                  <ExpenseForm onAddExpense={addExpense} categories={categories} />
                </div>

                {/* Expense List */}
                <div className="animate-slide-in">
                  <ExpenseList 
                    expenses={expenses} 
                    onDeleteExpense={deleteExpense} 
                  />
                </div>
              </div>

              {/* Right Column - Advanced Features */}
              <div className="space-y-6 lg:space-y-8">
                <div className="animate-fade-in float">
                  <FinancialHealthScore expenses={expenses} budget={budget} />
                </div>
                <div className="animate-fade-in float">
                  <EnhancedGamification expenses={expenses} budget={budget} />
                </div>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section id="categories" className="scroll-mt-32 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2">🎯 Categories</h2>
              <p className="text-muted-foreground">Customize your expense categories and keywords</p>
            </div>
            <div className="animate-slide-in">
              <CustomCategoryManager onCategoriesUpdate={updateCategories} />
            </div>
          </section>

          {/* Manage Section */}
          <section id="manage" className="scroll-mt-32 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
                <Settings className="h-6 w-6 lg:h-8 lg:w-8" />
                Budget Management
              </h2>
              <p className="text-muted-foreground">AI-powered budget management and predictions</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="animate-slide-in">
                <BudgetManager 
                  expenses={expenses} 
                  budget={budget} 
                  onUpdateBudget={updateBudget} 
                />
              </div>
              <div className="space-y-6">
                <div className="animate-slide-in">
                  <ExpensePrediction 
                    expenses={expenses} 
                    budget={budget} 
                    onUpdateBudget={updateBudget}
                  />
                </div>
                <div className="animate-slide-in">
                  <AICoach expenses={expenses} budget={budget} />
                </div>
              </div>
            </div>
          </section>

          {/* Export Section */}
          <section id="export" className="scroll-mt-32 animate-fade-in">
            <div className="text-center mb-8">
              <h2 className="text-2xl lg:text-3xl font-bold gradient-text mb-2 flex items-center justify-center gap-2">
                <Download className="h-6 w-6 lg:h-8 lg:w-8" />
                Export & Sustainability
              </h2>
              <p className="text-muted-foreground">Export data and track your eco-friendly spending</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
              <div className="animate-slide-in">
                <ExportManager expenses={expenses} budget={budget} />
              </div>
              <div className="animate-slide-in">
                <SustainabilityTracker expenses={expenses} />
              </div>
            </div>
          </section>
        </div>

        {/* Tips Section */}
        <section className="bg-gradient-card p-6 rounded-lg shadow-medium animate-fade-in">
          <h3 className="text-xl font-bold mb-4 gradient-text">💡 Smart Money Tips for Students</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold mb-2">🍕 Food Budget</h4>
              <p className="text-sm text-muted-foreground">
                Cook meals at home and limit eating out to save 30-40% on food costs.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold mb-2">📚 Student Discounts</h4>
              <p className="text-sm text-muted-foreground">
                Always ask for student discounts - software, transport, and entertainment often offer deals.
              </p>
            </div>
            <div className="p-4 bg-background/50 rounded-lg">
              <h4 className="font-semibold mb-2">💰 Emergency Fund</h4>
              <p className="text-sm text-muted-foreground">
                Aim to save $500-1000 for unexpected expenses like textbooks or medical costs.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-muted/30 py-8 mt-16">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            Built with ❤️ for students. Start your financial journey today! 
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
