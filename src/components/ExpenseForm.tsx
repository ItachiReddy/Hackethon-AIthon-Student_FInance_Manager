import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, DollarSign, Calendar, Tag } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { VoiceInput } from "@/components/VoiceInput";

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
}

interface CustomCategory {
  id: string;
  value: string;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
}

interface ExpenseFormProps {
  onAddExpense: (expense: Expense) => void;
  categories?: CustomCategory[];
}

const defaultCategories: CustomCategory[] = [
  { id: "food", value: "food", label: "🍕 Food & Dining", emoji: "🍕", color: "bg-orange-500", keywords: ["food", "restaurant", "lunch", "dinner", "breakfast", "coffee", "pizza"] },
  { id: "transport", value: "transport", label: "🚗 Transport", emoji: "🚗", color: "bg-blue-500", keywords: ["uber", "taxi", "bus", "train", "gas", "fuel", "metro"] },
  { id: "entertainment", value: "entertainment", label: "🎮 Entertainment", emoji: "🎮", color: "bg-purple-500", keywords: ["movie", "game", "netflix", "spotify", "concert", "party"] },
  { id: "bills", value: "bills", label: "📋 Bills & Utilities", emoji: "📋", color: "bg-red-500", keywords: ["rent", "electricity", "water", "internet", "phone", "bill"] },
  { id: "education", value: "education", label: "📚 Education", emoji: "📚", color: "bg-green-500", keywords: ["book", "course", "tuition", "school", "university", "study"] },
  { id: "others", value: "others", label: "🔍 Others", emoji: "🔍", color: "bg-gray-500", keywords: [] }
];

const smartCategorize = (description: string, categories: CustomCategory[]): string => {
  const desc = description.toLowerCase();
  for (const category of categories) {
    if (category.keywords.some(keyword => desc.includes(keyword))) {
      return category.value;
    }
  }
  return "others";
};

export const ExpenseForm = ({ onAddExpense, categories = defaultCategories }: ExpenseFormProps) => {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isListening, setIsListening] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!description.trim() || !amount || isNaN(Number(amount))) {
      toast({
        title: "Invalid Input",
        description: "Please fill in all fields with valid data.",
        variant: "destructive",
      });
      return;
    }

    const suggestedCategory = category || smartCategorize(description, categories);
    
    const expense: Expense = {
      id: Date.now().toString(),
      date,
      description: description.trim(),
      category: suggestedCategory,
      amount: Number(amount)
    };

    onAddExpense(expense);
    
    // Reset form
    setDescription("");
    setAmount("");
    setCategory("");
    setDate(new Date().toISOString().split("T")[0]);

    toast({
      title: "Expense Added! 🎉",
      description: `$${expense.amount} for ${expense.description} added successfully.`,
    });
  };

  const handleVoiceResult = (transcript: string) => {
    // Simple parsing for voice input like "coffee 5 dollars" or "lunch 15"
    const text = transcript.toLowerCase();
    const amountMatch = text.match(/(\d+(?:\.\d{2})?)\s*(?:dollars?|bucks?|\$)?/);
    
    if (amountMatch) {
      const voiceAmount = amountMatch[1];
      const descriptionPart = text.replace(amountMatch[0], '').trim();
      
      setDescription(descriptionPart || transcript);
      setAmount(voiceAmount);
      
      // Auto-categorize based on voice input
      const suggestedCat = smartCategorize(descriptionPart || transcript, categories);
      setCategory(suggestedCat);
    } else {
      setDescription(transcript);
    }
  };

  return (
    <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <PlusCircle className="h-6 w-6" />
          Add New Expense
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Track your spending with smart categorization
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Description
              </Label>
              <Input
                id="description"
                placeholder="e.g., Coffee at Starbucks"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-border/50 focus:border-primary transition-colors"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="border-border/50 focus:border-primary transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Date
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="border-border/50 focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category (Auto-detected)</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="border-border/50 focus:border-primary transition-colors">
                  <SelectValue placeholder={
                    description ? `Auto: ${categories.find(c => c.value === smartCategorize(description, categories))?.label}` : "Select category"
                  } />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Voice Input Section */}
          <div className="border-t pt-4">
            <div className="text-center space-y-3">
              <p className="text-sm text-muted-foreground">
                Or use voice input to quickly add expenses
              </p>
              <VoiceInput 
                onVoiceResult={handleVoiceResult}
                isListening={isListening}
                setIsListening={setIsListening}
              />
            </div>
          </div>

          <Button type="submit" variant="gradient" className="w-full">
            <PlusCircle className="h-4 w-4" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};