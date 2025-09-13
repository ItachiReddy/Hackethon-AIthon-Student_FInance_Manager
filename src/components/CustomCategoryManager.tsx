import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Tag, Trash2, Edit, Palette } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CustomCategory {
  id: string;
  value: string;
  label: string;
  emoji: string;
  color: string;
  keywords: string[];
}

interface CustomCategoryManagerProps {
  onCategoriesUpdate: (categories: CustomCategory[]) => void;
}

const defaultCategories: CustomCategory[] = [
  { id: "food", value: "food", label: "Food & Dining", emoji: "🍕", color: "bg-orange-500", keywords: ["food", "restaurant", "lunch", "dinner", "breakfast", "coffee", "pizza"] },
  { id: "transport", value: "transport", label: "Transport", emoji: "🚗", color: "bg-blue-500", keywords: ["uber", "taxi", "bus", "train", "gas", "fuel", "metro"] },
  { id: "entertainment", value: "entertainment", label: "Entertainment", emoji: "🎮", color: "bg-purple-500", keywords: ["movie", "game", "netflix", "spotify", "concert", "party"] },
  { id: "bills", value: "bills", label: "Bills & Utilities", emoji: "📋", color: "bg-red-500", keywords: ["rent", "electricity", "water", "internet", "phone", "bill"] },
  { id: "education", value: "education", label: "Education", emoji: "📚", color: "bg-green-500", keywords: ["book", "course", "tuition", "school", "university", "study"] },
  { id: "others", value: "others", label: "Others", emoji: "🔍", color: "bg-gray-500", keywords: [] }
];

const colorOptions = [
  "bg-red-500", "bg-blue-500", "bg-green-500", "bg-yellow-500", 
  "bg-purple-500", "bg-pink-500", "bg-indigo-500", "bg-orange-500",
  "bg-teal-500", "bg-cyan-500", "bg-lime-500", "bg-emerald-500"
];

export const CustomCategoryManager = ({ onCategoriesUpdate }: CustomCategoryManagerProps) => {
  const [categories, setCategories] = useState<CustomCategory[]>(defaultCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CustomCategory | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    emoji: "",
    color: "bg-blue-500",
    keywords: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    const savedCategories = localStorage.getItem("student-finance-categories");
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      setCategories(parsed);
      onCategoriesUpdate(parsed);
    } else {
      onCategoriesUpdate(defaultCategories);
    }
  }, [onCategoriesUpdate]);

  useEffect(() => {
    localStorage.setItem("student-finance-categories", JSON.stringify(categories));
    onCategoriesUpdate(categories);
  }, [categories, onCategoriesUpdate]);

  const resetForm = () => {
    setFormData({
      label: "",
      emoji: "",
      color: "bg-blue-500",
      keywords: ""
    });
    setEditingCategory(null);
  };

  const openEditDialog = (category?: CustomCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        label: category.label,
        emoji: category.emoji,
        color: category.color,
        keywords: category.keywords.join(", ")
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const saveCategory = () => {
    if (!formData.label.trim() || !formData.emoji.trim()) {
      toast({
        title: "Invalid Input",
        description: "Please fill in the category name and emoji.",
        variant: "destructive",
      });
      return;
    }

    const value = formData.label.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const keywords = formData.keywords.split(',').map(k => k.trim().toLowerCase()).filter(k => k);

    if (editingCategory) {
      // Update existing category
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id 
          ? { ...cat, label: formData.label, emoji: formData.emoji, color: formData.color, keywords }
          : cat
      ));
      toast({
        title: "Category Updated! ✏️",
        description: `${formData.emoji} ${formData.label} has been updated.`,
      });
    } else {
      // Add new category
      const newCategory: CustomCategory = {
        id: `custom-${Date.now()}`,
        value,
        label: formData.label,
        emoji: formData.emoji,
        color: formData.color,
        keywords
      };
      setCategories(prev => [...prev, newCategory]);
      toast({
        title: "Category Created! 🎉",
        description: `${formData.emoji} ${formData.label} has been added.`,
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const deleteCategory = (categoryId: string) => {
    // Prevent deletion of core categories
    if (defaultCategories.some(cat => cat.id === categoryId)) {
      toast({
        title: "Cannot Delete",
        description: "Default categories cannot be deleted.",
        variant: "destructive",
      });
      return;
    }

    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    toast({
      title: "Category Deleted",
      description: "Custom category has been removed.",
    });
  };

  const isDefaultCategory = (categoryId: string) => {
    return defaultCategories.some(cat => cat.id === categoryId);
  };

  return (
    <Card className="bg-gradient-card shadow-medium hover:shadow-strong transition-all duration-300 border-0">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl gradient-text flex items-center justify-center gap-2">
          <Tag className="h-6 w-6" />
          Custom Categories
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Organize your expenses with personalized categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Your Categories ({categories.length})</h3>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={() => openEditDialog()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingCategory ? "Edit Category" : "Create New Category"}
                </DialogTitle>
                <DialogDescription>
                  {editingCategory ? "Update your custom category" : "Add a new expense category with personalized settings"}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category-label">Category Name</Label>
                  <Input
                    id="category-label"
                    placeholder="e.g., Health & Fitness"
                    value={formData.label}
                    onChange={(e) => setFormData({...formData, label: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category-emoji">Emoji</Label>
                  <Input
                    id="category-emoji"
                    placeholder="🏃‍♂️"
                    value={formData.emoji}
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Color</Label>
                  <div className="grid grid-cols-6 gap-2">
                    {colorOptions.map((color) => (
                      <Button
                        key={color}
                        variant="outline"
                        size="sm"
                        className={`h-8 w-8 p-0 ${color} ${formData.color === color ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setFormData({...formData, color})}
                      >
                        {formData.color === color && <Palette className="h-3 w-3 text-white" />}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category-keywords">Keywords (comma-separated)</Label>
                  <Input
                    id="category-keywords"
                    placeholder="gym, workout, protein, supplement"
                    value={formData.keywords}
                    onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                  />
                  <p className="text-xs text-muted-foreground">
                    These keywords help auto-categorize your expenses
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button onClick={saveCategory} className="flex-1">
                    {editingCategory ? "Update Category" : "Create Category"}
                  </Button>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {categories.map((category) => (
            <div
              key={category.id}
              className="flex items-center justify-between p-3 bg-background/50 rounded-lg border transition-all hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full ${category.color} flex items-center justify-center text-white text-sm`}>
                  {category.emoji}
                </div>
                <div>
                  <p className="font-medium text-sm">{category.label}</p>
                  {category.keywords.length > 0 && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {category.keywords.length} keywords
                    </Badge>
                  )}
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openEditDialog(category)}
                  className="h-8 w-8 p-0"
                >
                  <Edit className="h-3 w-3" />
                </Button>
                {!isDefaultCategory(category.id) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteCategory(category.id)}
                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};