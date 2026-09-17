"use client";

import { useState, useMemo } from "react";
import {
  Utensils,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Sparkles,
  Sliders,
  Plus,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Info,
  DollarSign,
  PieChart as PieChartIcon,
  RefreshCw,
  Award,
  ArrowUpRight,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MOCK_RESTAURANT_RECIPES,
  MOCK_SUBSTITUTIONS,
} from "@/app/services/minagriMockData";
import type { RecipeItem, IngredientSubstitution } from "@/types/minagri-intelligence";

const fmt = (n: number) => `RWF ${Math.round(n).toLocaleString("en-RW")}`;

export default function RestaurantRecipeCostingPage() {
  const [activeTab, setActiveTab] = useState<"recipes" | "substitutions" | "simulator" | "matrix">("recipes");
  const [recipes, setRecipes] = useState<RecipeItem[]>(MOCK_RESTAURANT_RECIPES);
  const [substitutions, setSubstitutions] = useState<IngredientSubstitution[]>(MOCK_SUBSTITUTIONS);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeItem | null>(MOCK_RESTAURANT_RECIPES[0]);

  // "What-If" Sensitivity Sliders state (percentages -20% to +50%)
  const [veggieAdjustment, setVeggieAdjustment] = useState<number>(0);
  const [meatAdjustment, setMeatAdjustment] = useState<number>(0);
  const [grainAdjustment, setGrainAdjustment] = useState<number>(0);
  const [oilAdjustment, setOilAdjustment] = useState<number>(0);

  // New Recipe Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDishName, setNewDishName] = useState("");
  const [newDishPrice, setNewDishPrice] = useState(6000);
  const [newDishTargetCost, setNewDishTargetCost] = useState(30);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const totalDishes = recipes.length;
    const avgFoodCost = Math.round(
      recipes.reduce((sum, r) => sum + r.foodCostPct, 0) / (totalDishes || 1)
    );
    const alertDishes = recipes.filter((r) => r.foodCostPct > r.targetFoodCostPct).length;
    const totalPotentialSavings = substitutions.reduce((sum, s) => {
      const dish = recipes.find((r) => r.id === s.dishId);
      if (!dish) return sum;
      const originalCost = s.originalPrice * 0.2;
      const proposedCost = s.proposedPrice * 0.2;
      return sum + (originalCost - proposedCost) * 120;
    }, 0);

    return { totalDishes, avgFoodCost, alertDishes, totalPotentialSavings };
  }, [recipes, substitutions]);

  const handleApproveSubstitution = (subId: string) => {
    setSubstitutions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, chefApprovalStatus: "APPROVED" } : s))
    );
  };

  const handleRejectSubstitution = (subId: string) => {
    setSubstitutions((prev) =>
      prev.map((s) => (s.id === subId ? { ...s, chefApprovalStatus: "REJECTED" } : s))
    );
  };

  const handleCreateRecipe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDishName) return;

    const newRecipe: RecipeItem = {
      id: `r-${Date.now()}`,
      dishName: newDishName,
      category: "Main Course",
      sellingPrice: newDishPrice,
      targetFoodCostPct: newDishTargetCost,
      foodCostPct: 28.5,
      totalIngredientCost: Math.round(newDishPrice * 0.285),
      grossMarginRwf: Math.round(newDishPrice * (1 - 0.285)),
      grossMarginPct: 71.5,
      volatilityLevel: "Stable",
      opportunityScore: 88,
      substitutionsAvailable: 1,
      statusAlert: "OPTIMAL",
      ingredients: [
        {
          id: `i-${Date.now()}-1`,
          ingredientName: "Farm-Fresh Produce",
          quantity: 0.3,
          unit: "kg",
          currentUnitPrice: 1200,
          historicalUnitPrice: 1200,
          itemCost: 360,
        },
        {
          id: `i-${Date.now()}-2`,
          ingredientName: "Protein Base",
          quantity: 0.25,
          unit: "kg",
          currentUnitPrice: 3800,
          historicalUnitPrice: 3800,
          itemCost: 950,
        },
      ],
    };

    setRecipes([newRecipe, ...recipes]);
    setSelectedRecipe(newRecipe);
    setShowAddModal(false);
    setNewDishName("");
  };

  const calculateSimulatedRecipe = (r: RecipeItem) => {
    let totalAdjustedCost = 0;
    r.ingredients.forEach((ing) => {
      let adjPct = 0;
      const nameLower = ing.ingredientName.toLowerCase();
      if (nameLower.includes("tomato") || nameLower.includes("onion") || nameLower.includes("salad") || nameLower.includes("potato")) {
        adjPct = veggieAdjustment;
      } else if (nameLower.includes("beef") || nameLower.includes("chicken")) {
        adjPct = meatAdjustment;
      } else if (nameLower.includes("rice") || nameLower.includes("pasta") || nameLower.includes("bean")) {
        adjPct = grainAdjustment;
      } else if (nameLower.includes("oil") || nameLower.includes("butter")) {
        adjPct = oilAdjustment;
      }
      const adjPrice = ing.currentUnitPrice * (1 + adjPct / 100);
      totalAdjustedCost += ing.quantity * adjPrice;
    });

    const foodCostPct = Math.round((totalAdjustedCost / r.sellingPrice) * 1000) / 10;
    const grossMarginRwf = r.sellingPrice - totalAdjustedCost;
    const grossMarginPct = Math.round((grossMarginRwf / r.sellingPrice) * 1000) / 10;

    return { totalAdjustedCost, foodCostPct, grossMarginRwf, grossMarginPct };
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 space-y-6">
      {/* Hero Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-green-900 text-white p-6 rounded-2xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-green-700/20 rounded-full blur-3xl pointer-events-none" />
        <div className="space-y-1 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-800/80 border border-green-700 text-green-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            MINAGRI Reference-Linked Recipe Engine
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
            Recipe Costing & Profitability Intelligence
          </h1>
          <p className="text-green-100/80 text-sm max-w-2xl">
            Automatically calculate ingredient cost per dish, monitor live MINAGRI price inflation alerts, optimize margins with chef substitutions, and simulate "What-If" market scenarios.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <Button
            onClick={() => setShowAddModal(true)}
            className="bg-green-600 hover:bg-green-500 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-sm text-xs gap-2"
          >
            <Plus className="w-4 h-4" />
            New Recipe Dish
          </Button>
        </div>
      </div>

      {/* Top Summary Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Tracked Recipes</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{summaryMetrics.totalDishes}</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Linked to daily MINAGRI market data</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center border border-green-100">
              <Utensils className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Food Cost</p>
              <p className="text-2xl font-extrabold text-gray-900 mt-1">{summaryMetrics.avgFoodCost}%</p>
              <p className="text-xs text-gray-500 mt-0.5">Target benchmark: 30%</p>
            </div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100">
              <PieChartIcon className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Margin Alerts</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{summaryMetrics.alertDishes} Dishes</p>
              <p className="text-xs text-amber-600 mt-0.5 font-medium">Exceeding target food cost %</p>
            </div>
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>

        <Card className="py-4 shadow-xs border-gray-200">
          <CardContent className="px-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Potential Savings</p>
              <p className="text-2xl font-extrabold text-green-700 mt-1">{fmt(summaryMetrics.totalPotentialSavings)}</p>
              <p className="text-xs text-green-600 mt-0.5 font-medium">Est. monthly savings via substitutions</p>
            </div>
            <div className="w-12 h-12 bg-green-50 text-green-700 rounded-xl flex items-center justify-center border border-green-100">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Navigation */}
      <div className="flex border-b border-gray-200 overflow-x-auto gap-2 bg-white px-4 pt-3 rounded-t-xl shadow-xs">
        <button
          onClick={() => setActiveTab("recipes")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "recipes"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Utensils className="w-4 h-4" />
          Recipe Costing & Margins
        </button>

        <button
          onClick={() => setActiveTab("substitutions")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "substitutions"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Substitution Assistant ({substitutions.filter((s) => s.chefApprovalStatus === "PENDING").length})
        </button>

        <button
          onClick={() => setActiveTab("simulator")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "simulator"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Sliders className="w-4 h-4" />
          "What-If" Sensitivity Simulator
        </button>

        <button
          onClick={() => setActiveTab("matrix")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition ${
            activeTab === "matrix"
              ? "border-green-700 text-green-800"
              : "border-transparent text-gray-500 hover:text-gray-900"
          }`}
        >
          <Award className="w-4 h-4" />
          Menu Opportunity Score Matrix
        </button>
      </div>

      {/* Tab 1: Recipe Costing & Margins */}
      {activeTab === "recipes" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Dishes List */}
          <div className="lg:col-span-5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 px-1">
              <span>SELECT DISH TO AUDIT INGREDIENTS</span>
              <span>{recipes.length} DISHES</span>
            </div>

            {recipes.map((recipe) => {
              const isSelected = selectedRecipe?.id === recipe.id;
              const isOverCost = recipe.foodCostPct > recipe.targetFoodCostPct;

              return (
                <Card
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`py-4 cursor-pointer transition shadow-xs hover:border-green-600 ${
                    isSelected ? "border-green-700 ring-2 ring-green-600/20 bg-green-50/20" : "border-gray-200"
                  }`}
                >
                  <CardContent className="px-4 py-0 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <Badge variant="outline" className="bg-green-50 text-green-800 border-green-200 font-bold text-[10px]">
                          {recipe.category}
                        </Badge>
                        <h3 className="text-sm font-bold text-gray-900 mt-1">{recipe.dishName}</h3>
                      </div>

                      {isOverCost ? (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold gap-1 text-[10px]">
                          <AlertTriangle className="w-3 h-3" />
                          {recipe.foodCostPct}% Cost
                        </Badge>
                      ) : (
                        <Badge className="bg-green-50 text-green-700 border-green-200 font-bold gap-1 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" />
                          {recipe.foodCostPct}% Cost
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 font-medium">Menu Price</p>
                        <p className="font-bold text-gray-900">{fmt(recipe.sellingPrice)}</p>
                      </div>
                      <div className="bg-gray-50 p-2 rounded-lg">
                        <p className="text-[10px] text-gray-500 font-medium">Cost / Dish</p>
                        <p className="font-bold text-gray-900">{fmt(recipe.totalIngredientCost)}</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg">
                        <p className="text-[10px] text-green-700 font-medium">Gross Margin</p>
                        <p className="font-bold text-green-800">{fmt(recipe.grossMarginRwf)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Right Column: Ingredient Details */}
          <div className="lg:col-span-7">
            {selectedRecipe ? (
              <Card className="py-6 border-gray-200 shadow-sm">
                <CardContent className="px-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-green-700">
                        Recipe Composition & Costing Audit
                      </span>
                      <h2 className="text-lg font-bold text-gray-900">{selectedRecipe.dishName}</h2>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Menu Selling Price</p>
                      <p className="font-extrabold text-green-800 text-base">{fmt(selectedRecipe.sellingPrice)}</p>
                    </div>
                  </div>

                  {/* Target vs Actual Progress */}
                  <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-gray-600">Food Cost Percentage Analysis</span>
                      <span>
                        Actual: <strong className={selectedRecipe.foodCostPct > selectedRecipe.targetFoodCostPct ? "text-amber-600" : "text-green-700"}>{selectedRecipe.foodCostPct}%</strong> / Target: {selectedRecipe.targetFoodCostPct}%
                      </span>
                    </div>

                    <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full rounded-full transition-all ${
                          selectedRecipe.foodCostPct > selectedRecipe.targetFoodCostPct ? "bg-amber-500" : "bg-green-600"
                        }`}
                        style={{ width: `${Math.min(selectedRecipe.foodCostPct, 100)}%` }}
                      />
                    </div>
                    {selectedRecipe.foodCostPct > selectedRecipe.targetFoodCostPct && (
                      <p className="text-[11px] text-amber-700 flex items-center gap-1.5 mt-1 font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        Ingredient price inflation has pushed this recipe {Math.round((selectedRecipe.foodCostPct - selectedRecipe.targetFoodCostPct) * 10) / 10}% over your target threshold.
                      </p>
                    )}
                  </div>

                  {/* Ingredient Table */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 mb-3 flex items-center justify-between">
                      <span>Recipe Ingredients (Linked to Live MINAGRI Prices)</span>
                      <span className="text-gray-500 font-normal">{selectedRecipe.ingredients.length} Ingredients</span>
                    </h4>

                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                          <tr>
                            <th className="py-2.5 px-3">Ingredient</th>
                            <th className="py-2.5 px-3 text-right">Quantity</th>
                            <th className="py-2.5 px-3 text-right">Unit Price</th>
                            <th className="py-2.5 px-3 text-right">Cost / Portion</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 text-gray-900 font-medium">
                          {selectedRecipe.ingredients.map((ing) => {
                            const isIncreased = ing.currentUnitPrice > ing.historicalUnitPrice;

                            return (
                              <tr key={ing.id} className="hover:bg-gray-50/50">
                                <td className="py-2.5 px-3 font-bold text-gray-900">{ing.ingredientName}</td>
                                <td className="py-2.5 px-3 text-right font-mono text-gray-600">{ing.quantity} {ing.unit}</td>
                                <td className="py-2.5 px-3 text-right font-mono">
                                  {fmt(ing.currentUnitPrice)}/{ing.unit}
                                  {isIncreased && (
                                    <span className="ml-1 text-[10px] text-amber-600 font-semibold bg-amber-50 px-1 rounded">
                                      +Inflation
                                    </span>
                                  )}
                                </td>
                                <td className="py-2.5 px-3 text-right font-bold font-mono text-gray-900">{fmt(ing.itemCost)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot className="bg-gray-50 font-bold border-t border-gray-200">
                          <tr>
                            <td colSpan={3} className="py-2.5 px-3 text-gray-700">Total Recipe Ingredient Cost</td>
                            <td className="py-2.5 px-3 text-right font-mono text-green-800 text-xs">{fmt(selectedRecipe.totalIngredientCost)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Recipe Margin Card */}
                  <div className="grid grid-cols-2 gap-4 bg-green-50/60 p-4 rounded-xl border border-green-100">
                    <div>
                      <p className="text-xs text-green-800 font-medium">Gross Margin per Dish</p>
                      <p className="text-lg font-extrabold text-green-900">{fmt(selectedRecipe.grossMarginRwf)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-green-800 font-medium">Gross Margin Percentage</p>
                      <p className="text-lg font-extrabold text-green-900">{selectedRecipe.grossMarginPct}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="p-12 text-center text-gray-500">
                Select a dish from the left to inspect detailed ingredient costs and margin analysis.
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Substitution Assistant */}
      {activeTab === "substitutions" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">AI Seasonal Substitution Assistant</h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Recommends cost-effective seasonal ingredients based on MINAGRI regional harvest supply peaks.
                </p>
              </div>
              <Badge className="bg-green-50 text-green-700 border-green-200 font-bold gap-1 text-xs py-1 px-3">
                <Sparkles className="w-3.5 h-3.5" />
                {substitutions.length} AI Recommendations Active
              </Badge>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {substitutions.map((sub) => (
              <Card key={sub.id} className="py-5 shadow-xs border-gray-200">
                <CardContent className="px-5 space-y-4">
                  <div className="flex items-start justify-between gap-2 border-b border-gray-100 pb-3">
                    <div>
                      <Badge className="bg-green-50 text-green-800 border-green-200 font-bold text-[10px]">
                        {sub.dishName}
                      </Badge>
                      <h4 className="text-sm font-bold text-gray-900 mt-1">{sub.originalIngredient}</h4>
                    </div>
                    <Badge className="bg-green-100 text-green-800 font-extrabold text-xs">
                      Save {sub.savingsPct}%
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs bg-gray-50 p-3.5 rounded-lg border border-gray-100">
                    <div className="flex justify-between text-gray-600">
                      <span>Proposed Seasonal Replacement:</span>
                      <span className="font-bold text-gray-900">{sub.proposedIngredient}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Recipe Quality Match Score:</span>
                      <span className="font-bold text-green-700">{sub.qualityMatchPct}% Match</span>
                    </div>
                    <p className="text-gray-500 text-[11px] pt-1 border-t border-gray-200/60">
                      <strong>Harvest Insight:</strong> {sub.seasonalityNote}
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <span className="text-xs font-semibold text-gray-500">Chef Approval Status:</span>
                    {sub.chefApprovalStatus === "APPROVED" ? (
                      <Badge className="bg-green-50 text-green-700 border-green-200 font-bold gap-1 text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </Badge>
                    ) : sub.chefApprovalStatus === "REJECTED" ? (
                      <Badge className="bg-rose-50 text-rose-700 border-rose-200 font-bold gap-1 text-xs">
                        <XCircle className="w-3.5 h-3.5" /> Rejected
                      </Badge>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleRejectSubstitution(sub.id)}
                          variant="outline"
                          size="sm"
                          className="text-xs font-bold"
                        >
                          Reject
                        </Button>
                        <Button
                          onClick={() => handleApproveSubstitution(sub.id)}
                          variant="green"
                          size="sm"
                          className="text-xs font-bold"
                        >
                          Approve Substitution
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: "What-If" Sensitivity Simulator */}
      {activeTab === "simulator" && (
        <div className="space-y-6">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5 space-y-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-green-700" />
                  "What-If" Price Inflation Sensitivity Simulator
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Adjust potential market commodity price changes (-20% to +50%) to simulate margin impacts across your restaurant menu.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Vegetables & Produce</span>
                    <span className={veggieAdjustment >= 0 ? "text-amber-600" : "text-green-700"}>
                      {veggieAdjustment > 0 ? `+${veggieAdjustment}%` : `${veggieAdjustment}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    value={veggieAdjustment}
                    onChange={(e) => setVeggieAdjustment(Number(e.target.value))}
                    className="w-full accent-green-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">Affects Tomatoes, Onions, Potatoes</p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Meat & Poultry</span>
                    <span className={meatAdjustment >= 0 ? "text-amber-600" : "text-green-700"}>
                      {meatAdjustment > 0 ? `+${meatAdjustment}%` : `${meatAdjustment}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    value={meatAdjustment}
                    onChange={(e) => setMeatAdjustment(Number(e.target.value))}
                    className="w-full accent-green-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">Affects Fresh Beef, Chicken</p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Grains & Legumes</span>
                    <span className={grainAdjustment >= 0 ? "text-amber-600" : "text-green-700"}>
                      {grainAdjustment > 0 ? `+${grainAdjustment}%` : `${grainAdjustment}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    value={grainAdjustment}
                    onChange={(e) => setGrainAdjustment(Number(e.target.value))}
                    className="w-full accent-green-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">Affects Rice, Pasta, Beans</p>
                </div>

                <div className="space-y-2 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div className="flex justify-between text-xs font-bold text-gray-700">
                    <span>Oils & Condiments</span>
                    <span className={oilAdjustment >= 0 ? "text-amber-600" : "text-green-700"}>
                      {oilAdjustment > 0 ? `+${oilAdjustment}%` : `${oilAdjustment}%`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-20"
                    max="50"
                    value={oilAdjustment}
                    onChange={(e) => setOilAdjustment(Number(e.target.value))}
                    className="w-full accent-green-700 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500">Affects Cooking Oils, Spices</p>
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  onClick={() => {
                    setVeggieAdjustment(0);
                    setMeatAdjustment(0);
                    setGrainAdjustment(0);
                    setOilAdjustment(0);
                  }}
                  variant="ghost"
                  size="sm"
                  className="text-xs font-bold text-gray-600 gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Reset Sensitivity Sliders
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Table */}
          <Card className="py-4 shadow-xs border-gray-200 overflow-hidden">
            <CardHeader className="py-2 px-5 border-b border-gray-100">
              <CardTitle className="text-sm font-bold">Simulated Menu Impact Summary</CardTitle>
            </CardHeader>
            <CardContent className="px-0 py-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-50 text-gray-500 uppercase font-semibold">
                    <tr>
                      <th className="py-3 px-5">Dish Name</th>
                      <th className="py-3 px-5 text-right">Selling Price</th>
                      <th className="py-3 px-5 text-right">Base Cost</th>
                      <th className="py-3 px-5 text-right">Simulated Cost</th>
                      <th className="py-3 px-5 text-right">Simulated Food Cost %</th>
                      <th className="py-3 px-5 text-right">Simulated Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {recipes.map((r) => {
                      const sim = calculateSimulatedRecipe(r);
                      const isExceeded = sim.foodCostPct > r.targetFoodCostPct;

                      return (
                        <tr key={r.id} className="hover:bg-gray-50/50">
                          <td className="py-3 px-5 font-bold text-gray-900">{r.dishName}</td>
                          <td className="py-3 px-5 text-right font-mono text-gray-600">{fmt(r.sellingPrice)}</td>
                          <td className="py-3 px-5 text-right font-mono text-gray-600">{fmt(r.totalIngredientCost)}</td>
                          <td className="py-3 px-5 text-right font-mono font-bold text-gray-900">{fmt(sim.totalAdjustedCost)}</td>
                          <td className="py-3 px-5 text-right font-mono">
                            <Badge className={isExceeded ? "bg-amber-50 text-amber-700 border-amber-200 font-bold" : "bg-green-50 text-green-700 border-green-200 font-bold"}>
                              {sim.foodCostPct}%
                            </Badge>
                          </td>
                          <td className="py-3 px-5 text-right font-mono font-extrabold text-green-800">
                            {fmt(sim.grossMarginRwf)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 4: Opportunity Matrix */}
      {activeTab === "matrix" && (
        <div className="space-y-4">
          <Card className="py-5 shadow-xs border-gray-200">
            <CardContent className="px-5">
              <h3 className="text-base font-bold text-gray-900">Menu Opportunity Score Matrix</h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Ranks dishes by combining gross margin %, MINAGRI ingredient price stability, and current harvest availability.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recipes
              .slice()
              .sort((a, b) => b.opportunityScore - a.opportunityScore)
              .map((r, idx) => (
                <Card key={r.id} className="py-5 shadow-xs border-gray-200">
                  <CardContent className="px-5 flex items-start justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-green-100 text-green-800 text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-gray-900">{r.dishName}</h4>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-[10px] text-gray-500 font-medium">Gross Margin %</p>
                          <p className="font-bold text-green-800">{r.grossMarginPct}%</p>
                        </div>
                        <div className="bg-gray-50 p-2 rounded">
                          <p className="text-[10px] text-gray-500 font-medium">Price Volatility</p>
                          <p className="font-bold text-gray-900">{r.volatilityLevel}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-semibold text-gray-500 uppercase">Opportunity Score</p>
                      <p className="text-3xl font-extrabold text-green-700 mt-1">{r.opportunityScore}</p>
                      <Badge className="bg-green-50 text-green-700 border-green-200 font-bold text-[10px]">
                        High Profitability
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* New Recipe Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl border border-gray-200">
            <h3 className="text-base font-bold text-gray-900">Add New Recipe Dish</h3>

            <form onSubmit={handleCreateRecipe} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Dish Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Special Grilled Tilapia"
                  value={newDishName}
                  onChange={(e) => setNewDishName(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (RWF)</label>
                  <input
                    type="number"
                    required
                    value={newDishPrice}
                    onChange={(e) => setNewDishPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Target Food Cost %</label>
                  <input
                    type="number"
                    required
                    value={newDishTargetCost}
                    onChange={(e) => setNewDishTargetCost(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-600 outline-none font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <Button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  variant="outline"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="green"
                  size="sm"
                  className="font-bold text-xs"
                >
                  Save Recipe
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
