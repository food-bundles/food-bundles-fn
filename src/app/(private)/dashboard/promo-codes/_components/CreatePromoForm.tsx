"use client";

import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { usePromo } from "@/app/contexts/PromoContext";
import { ICreatePromoData } from "@/app/services/promoService";
import { productService } from "@/app/services/productService";
import { X } from "lucide-react";

interface CreatePromoFormProps {
    onSuccess: () => void;
}

const CreatePromoForm = forwardRef<{ openModal: () => void }, CreatePromoFormProps>(({ onSuccess }, ref) => {
    const { createPromo } = usePromo();
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(false);

    const [formData, setFormData] = useState<ICreatePromoData>({
        code: "",
        name: "",
        description: "",
        type: "PUBLIC",
        discountType: "PERCENTAGE",
        discountValue: 0,
        isReusable: true,
        maxUsageCount: 1000,
        maxUsagePerUser: 3,
        minOrderAmount: 0,
        minItemQuantity: 1,
        applyToAllProducts: true,
        applicableProductIds: [],
        applicableCategoryIds: [],
        excludedRestaurants: [],
        startDate: new Date().toISOString().split('T')[0],
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });

    const [excludedRestaurant, setExcludedRestaurant] = useState({ restaurantId: "", reason: "" });
    const [productSearch, setProductSearch] = useState("");
    const [restaurantSearch, setRestaurantSearch] = useState("");
    const [hasExcludedRestaurants, setHasExcludedRestaurants] = useState(false);

    useEffect(() => {
        if (open) {
            fetchData();
        }
    }, [open]);

    const fetchData = async () => {
        setLoadingData(true);
        try {
            const [productsRes, categoriesRes, restaurantsRes] = await Promise.all([
                productService.getAllProducts({ limit: 1000 }),
                productService.getAllCategories(),
                productService.getRestaurants()
            ]);
            setProducts(productsRes.data);
            setCategories(categoriesRes.data);
            setRestaurants(restaurantsRes.data.restaurants);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoadingData(false);
        }
    };

    const handleProductToggle = (productId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            applicableProductIds: checked
                ? [...prev.applicableProductIds!, productId]
                : prev.applicableProductIds!.filter(id => id !== productId)
        }));
    };

    const handleCategoryToggle = (categoryId: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            applicableCategoryIds: checked
                ? [...prev.applicableCategoryIds!, categoryId]
                : prev.applicableCategoryIds!.filter(id => id !== categoryId)
        }));
    };

    const handleRestaurantToggle = (restaurantId: string, checked: boolean) => {
        if (checked) {
            setFormData(prev => ({
                ...prev,
                excludedRestaurants: [...prev.excludedRestaurants!, { restaurantId, reason: "Excluded from promo" }]
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                excludedRestaurants: prev.excludedRestaurants!.filter(excluded => excluded.restaurantId !== restaurantId)
            }));
        }
    };

    const addExcludedRestaurant = () => {
        if (excludedRestaurant.restaurantId && excludedRestaurant.reason) {
            setFormData(prev => ({
                ...prev,
                excludedRestaurants: [...prev.excludedRestaurants!, excludedRestaurant]
            }));
            setExcludedRestaurant({ restaurantId: "", reason: "" });
        }
    };

    const removeExcludedRestaurant = (index: number) => {
        setFormData(prev => ({
            ...prev,
            excludedRestaurants: prev.excludedRestaurants!.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const submitData = {
                ...formData,
                discountValue: Number(formData.discountValue),
                maxUsageCount: Number(formData.maxUsageCount),
                maxUsagePerUser: Number(formData.maxUsagePerUser),
                minOrderAmount: Number(formData.minOrderAmount),
                minItemQuantity: Number(formData.minItemQuantity),
                startDate: new Date(formData.startDate).toISOString(),
                expiryDate: new Date(formData.expiryDate).toISOString(),
            };

            // Only include applicableProductIds and applicableCategoryIds if not applying to all products
            if (formData.applyToAllProducts) {
                submitData.applicableProductIds = [];
                submitData.applicableCategoryIds = [];
            } else {
                submitData.applicableProductIds = formData.applicableProductIds;
                submitData.applicableCategoryIds = formData.applicableCategoryIds;
            }

            await createPromo(submitData);
            setOpen(false);
            onSuccess();
            // Reset form
            setFormData({
                code: "",
                name: "",
                description: "",
                type: "PUBLIC",
                discountType: "PERCENTAGE",
                discountValue: 0,
                isReusable: true,
                maxUsageCount: 1000,
                maxUsagePerUser: 3,
                minOrderAmount: 0,
                minItemQuantity: 1,
                applyToAllProducts: true,
                applicableProductIds: [],
                applicableCategoryIds: [],
                excludedRestaurants: [],
                startDate: new Date().toISOString().split('T')[0],
                expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            });
            setHasExcludedRestaurants(false);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useImperativeHandle(ref, () => ({
        openModal: () => setOpen(true)
    }));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create New Promo Code</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="code">Promo Code (e.g. SAVE20) *</Label>
                            <Input
                                id="code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                placeholder="SAVE20"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Campaign Name *</Label>
                            <Input
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="20% Off Summer Sale"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Get 20% off on all orders above 10,000 RWF"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Discount Type *</Label>
                            <Select
                                value={formData.discountType}
                                onValueChange={(val: any) => setFormData({ ...formData, discountType: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                                    <SelectItem value="FIXED">Fixed Amount (RWF)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="discountValue">Discount Value *</Label>
                            <Input
                                id="discountValue"
                                type="number"
                                required
                                value={formData.discountValue}
                                onChange={(e) => setFormData({ ...formData, discountValue: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Visibility Type *</Label>
                            <Select
                                value={formData.type}
                                onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PUBLIC" className="text-green-600">🟢 Public (Visible in shop)</SelectItem>
                                    <SelectItem value="SUBSCRIBERS" className="text-blue-600">🔵 Subscribers Only</SelectItem>
                                    <SelectItem value="EXCEPTIONAL" className="text-purple-600">🟣 Exceptional</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center space-x-2 pt-8">
                            <Switch
                                id="isReusable"
                                checked={formData.isReusable}
                                onCheckedChange={(val) => setFormData({ ...formData, isReusable: val })}
                            />
                            <Label htmlFor="isReusable">Reusable by same user?</Label>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="maxUsageCount">Max Total Usage</Label>
                            <Input
                                id="maxUsageCount"
                                type="number"
                                value={formData.maxUsageCount}
                                onChange={(e) => setFormData({ ...formData, maxUsageCount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="maxUsagePerUser">Max Usage Per User</Label>
                            <Input
                                id="maxUsagePerUser"
                                type="number"
                                value={formData.maxUsagePerUser}
                                onChange={(e) => setFormData({ ...formData, maxUsagePerUser: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="minOrderAmount">Min Order Amount (RWF)</Label>
                            <Input
                                id="minOrderAmount"
                                type="number"
                                value={formData.minOrderAmount}
                                onChange={(e) => setFormData({ ...formData, minOrderAmount: Number(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="minItemQuantity">Min Item Quantity</Label>
                            <Input
                                id="minItemQuantity"
                                type="number"
                                value={formData.minItemQuantity}
                                onChange={(e) => setFormData({ ...formData, minItemQuantity: Number(e.target.value) })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                required
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="expiryDate">Expiry Date</Label>
                            <Input
                                id="expiryDate"
                                type="date"
                                required
                                value={formData.expiryDate}
                                onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="applyToAllProducts"
                            checked={formData.applyToAllProducts}
                            onCheckedChange={(val) => setFormData({ 
                                ...formData, 
                                applyToAllProducts: val,
                                applicableProductIds: val ? [] : formData.applicableProductIds,
                                applicableCategoryIds: val ? [] : formData.applicableCategoryIds
                            })}
                        />
                        <Label htmlFor="applyToAllProducts">Apply to all products?</Label>
                    </div>

                    {!formData.applyToAllProducts && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Applicable Products</Label>
                                <Input
                                    placeholder="Search products..."
                                    value={productSearch}
                                    onChange={(e) => setProductSearch(e.target.value)}
                                    className="mb-2"
                                />
                                {loadingData ? (
                                    <div className="text-sm text-gray-500">Loading products...</div>
                                ) : (
                                    <div className={`border rounded p-2 space-y-2 ${
                                        products.filter(product => 
                                            product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                        ).length > 0 ? 'max-h-40 overflow-y-auto' : ''
                                    }`}>
                                        {products
                                            .filter(product => 
                                                product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                            )
                                            .map((product) => (
                                            <div key={product.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => handleProductToggle(product.id, !formData.applicableProductIds?.includes(product.id))}>
                                                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                    formData.applicableProductIds?.includes(product.id) 
                                                        ? 'bg-green-600 border-green-600' 
                                                        : 'border-gray-300'
                                                }`}>
                                                    {formData.applicableProductIds?.includes(product.id) && (
                                                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <span className="text-sm">
                                                    {product.productName} - {product.unitPrice.toLocaleString()} RWF
                                                </span>
                                            </div>
                                        ))}
                                        {products.filter(product => 
                                            product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                        ).length === 0 && (
                                            <div className="text-sm text-gray-500 py-2">No products found</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Applicable Categories</Label>
                                {loadingData ? (
                                    <div className="text-sm text-gray-500">Loading categories...</div>
                                ) : (
                                    <div className="space-y-2">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`category-${category.id}`}
                                                    checked={formData.applicableCategoryIds?.includes(category.id)}
                                                    onCheckedChange={(checked) => handleCategoryToggle(category.id, checked as boolean)}
                                                />
                                                <Label htmlFor={`category-${category.id}`} className="text-sm">
                                                    {category.name}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="hasExcludedRestaurants"
                            checked={hasExcludedRestaurants}
                            onCheckedChange={(val) => {
                                setHasExcludedRestaurants(val);
                                if (!val) {
                                    setFormData(prev => ({ ...prev, excludedRestaurants: [] }));
                                }
                            }}
                        />
                        <Label htmlFor="hasExcludedRestaurants">Exclude specific restaurants?</Label>
                    </div>

                    {hasExcludedRestaurants && (
                        <div className="space-y-2">
                            <Label>Excluded Restaurants</Label>
                            <Input
                                placeholder="Search restaurants..."
                                value={restaurantSearch}
                                onChange={(e) => setRestaurantSearch(e.target.value)}
                                className="mb-2"
                            />
                            {loadingData ? (
                                <div className="text-sm text-gray-500">Loading restaurants...</div>
                            ) : (
                                <div className={`border rounded p-2 space-y-2 ${
                                    restaurants.filter(restaurant => 
                                        restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase())
                                    ).length > 0 ? 'max-h-40 overflow-y-auto' : ''
                                }`}>
                                    {restaurants
                                        .filter(restaurant => 
                                            restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase())
                                        )
                                        .map((restaurant) => (
                                        <div key={restaurant.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded" onClick={() => handleRestaurantToggle(restaurant.id, !formData.excludedRestaurants?.some(excluded => excluded.restaurantId === restaurant.id))}>
                                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                                formData.excludedRestaurants?.some(excluded => excluded.restaurantId === restaurant.id)
                                                    ? 'bg-red-600 border-red-600' 
                                                    : 'border-gray-300'
                                            }`}>
                                                {formData.excludedRestaurants?.some(excluded => excluded.restaurantId === restaurant.id) && (
                                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                )}
                                            </div>
                                            <span className="text-sm">
                                                {restaurant.name}
                                            </span>
                                        </div>
                                    ))}
                                    {restaurants.filter(restaurant => 
                                        restaurant.name.toLowerCase().includes(restaurantSearch.toLowerCase())
                                    ).length === 0 && (
                                        <div className="text-sm text-gray-500 py-2">No restaurants found</div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    <Button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-700">
                        {loading ? "Creating..." : "Create Promo Code"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
});

CreatePromoForm.displayName = "CreatePromoForm";

export default CreatePromoForm;
