"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronDown, ChevronUp } from "lucide-react";
import { IPromoCode } from "@/app/services/promoService";
import { productService } from "@/app/services/productService";

interface PromoDetailsModalProps {
    promo: IPromoCode;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export default function PromoDetailsModal({ promo, open, onOpenChange }: PromoDetailsModalProps) {
    const [products, setProducts] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [showProductDetails, setShowProductDetails] = useState(false);
    const [showCategoryDetails, setShowCategoryDetails] = useState(false);
    const [loadingData, setLoadingData] = useState(false);
    const [productSearch, setProductSearch] = useState("");
    const [excludedSearch, setExcludedSearch] = useState("");
    const [includedSearch, setIncludedSearch] = useState("");
    const [showExcludedDetails, setShowExcludedDetails] = useState(false);
    const [showIncludedDetails, setShowIncludedDetails] = useState(false);

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

    const getSelectedProducts = () => {
        if (!promo.applicableProductIds || !products.length) return [];
        return products.filter(p => promo.applicableProductIds!.includes(p.id));
    };

    const getSelectedCategories = () => {
        if (!promo.applicableCategoryIds || !categories.length) return [];
        return categories.filter(c => promo.applicableCategoryIds!.includes(c.id));
    };



    const formatDate = (date: string | Date) =>
        new Date(date).toLocaleString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>View Promo Code: {promo.code}</DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Name</Label>
                            <p className="font-medium">{promo.name}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Status</Label>
                            <div>
                                <Badge variant={promo.isActive ? "default" : "destructive"} className={promo.isActive ? "bg-green-100 text-green-800" : ""}>
                                    {promo.isActive ? "Active" : "Inactive"}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500">Description</Label>
                        <p className="text-sm">{promo.description || "No description provided."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Discount</Label>
                            <p className="font-bold text-lg text-green-700">
                                {promo.discountValue}{promo.discountType === "PERCENTAGE" ? "%" : " RWF"}
                            </p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Type</Label>
                            <p>{promo.type}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg">
                        <div>
                            <Label className="text-xs text-gray-500">Usage Limit</Label>
                            <p className="text-sm font-medium">{promo.maxUsageCount}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Current Usage</Label>
                            <p className="text-sm font-medium">{promo.currentUsageCount}</p>
                        </div>
                        <div>
                            <Label className="text-xs text-gray-500">Per User Limit</Label>
                            <p className="text-sm font-medium">{promo.maxUsagePerUser}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Min Order Amount</Label>
                            <p className="text-sm">{promo.minOrderAmount.toLocaleString()} RWF</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Min Item Quantity</Label>
                            <p className="text-sm">{promo.minItemQuantity}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-500">Start Date</Label>
                            <p className="text-sm">{formatDate(promo.startDate)}</p>
                        </div>
                        <div>
                            <Label className="text-gray-500">Expiry Date</Label>
                            <p className="text-sm">{formatDate(promo.expiryDate)}</p>
                        </div>
                    </div>

                    <div>
                        <Label className="text-gray-500">Created By</Label>
                        <p className="text-sm">{promo.admin?.username} ({promo.admin?.email})</p>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-gray-500">Product Scope</Label>
                        <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm font-medium mb-2">
                                {promo.applyToAllProducts ? "Applies to all products" : "Applies to specific products/categories"}
                            </p>
                            {!promo.applyToAllProducts && (
                                <div className="space-y-3">
                                    {promo.applicableProductIds && promo.applicableProductIds.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600 font-medium">Applicable Products ({promo.applicableProductIds.length}):</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowProductDetails(!showProductDetails)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    {showProductDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                    {showProductDetails ? 'Hide' : 'Show'} Details
                                                </Button>
                                            </div>
                                            {showProductDetails && (
                                                <div className="mt-2 space-y-2">
                                                    <Input
                                                        placeholder="Search products..."
                                                        value={productSearch}
                                                        onChange={(e) => setProductSearch(e.target.value)}
                                                        className="text-xs h-8"
                                                    />
                                                    <div className={`space-y-1 ${products.filter(product =>
                                                        promo.applicableProductIds!.includes(product.id) &&
                                                        product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                                    ).length > 0 ? 'max-h-32 overflow-y-auto' : ''
                                                        }`}>
                                                        {loadingData ? (
                                                            <p className="text-xs text-gray-500">Loading...</p>
                                                        ) : (
                                                            products
                                                                .filter(product =>
                                                                    promo.applicableProductIds!.includes(product.id) &&
                                                                    product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                                                )
                                                                .map(product => (
                                                                    <div key={product.id} className="flex items-center space-x-2 text-xs bg-white p-2 rounded border">
                                                                        <Checkbox
                                                                            checked={true}
                                                                            disabled={true}
                                                                            className="h-3 w-3"
                                                                        />
                                                                        <div>
                                                                            <span className="font-medium">{product.productName}</span>
                                                                            <span className="text-gray-500 ml-2">{product.unitPrice.toLocaleString()} RWF</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                        )}
                                                        {products.filter(product =>
                                                            promo.applicableProductIds!.includes(product.id) &&
                                                            product.productName.toLowerCase().includes(productSearch.toLowerCase())
                                                        ).length === 0 && productSearch && (
                                                                <div className="text-xs text-gray-500 py-2">No products found</div>
                                                            )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    {promo.applicableCategoryIds && promo.applicableCategoryIds.length > 0 && (
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-xs text-gray-600 font-medium">Applicable Categories ({promo.applicableCategoryIds.length}):</p>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setShowCategoryDetails(!showCategoryDetails)}
                                                    className="h-6 px-2 text-xs"
                                                >
                                                    {showCategoryDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                                    {showCategoryDetails ? 'Hide' : 'Show'} Details
                                                </Button>
                                            </div>
                                            {showCategoryDetails && (
                                                <div className="mt-2 space-y-1">
                                                    {loadingData ? (
                                                        <p className="text-xs text-gray-500">Loading...</p>
                                                    ) : (
                                                        getSelectedCategories().map(category => (
                                                            <div key={category.id} className="text-xs bg-white p-2 rounded border">
                                                                <span className="font-medium">{category.name}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {promo.excludedRestaurants && promo.excludedRestaurants.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-500">Excluded Restaurants ({promo.excludedRestaurants.length})</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowExcludedDetails(!showExcludedDetails)}
                                    className="h-6 px-2 text-xs"
                                >
                                    {showExcludedDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    {showExcludedDetails ? 'Hide' : 'Show'} Details
                                </Button>
                            </div>
                            {showExcludedDetails && (
                                <div className="bg-red-50 p-3 rounded space-y-2">
                                    <Input
                                        placeholder="Search restaurants..."
                                        value={excludedSearch}
                                        onChange={(e) => setExcludedSearch(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                    <div className={`space-y-1 ${restaurants.filter(restaurant =>
                                        promo.excludedRestaurants!.some(excluded => excluded.restaurantId === restaurant.id) &&
                                        restaurant.name.toLowerCase().includes(excludedSearch.toLowerCase())
                                    ).length > 0 ? 'max-h-32 overflow-y-auto' : ''
                                        }`}>
                                        {loadingData ? (
                                            <p className="text-xs text-gray-500">Loading...</p>
                                        ) : (
                                            restaurants
                                                .filter(restaurant =>
                                                    promo.excludedRestaurants!.some(excluded => excluded.restaurantId === restaurant.id) &&
                                                    restaurant.name.toLowerCase().includes(excludedSearch.toLowerCase())
                                                )
                                                .map(restaurant => {
                                                    const exclusion = promo.excludedRestaurants!.find(excluded => excluded.restaurantId === restaurant.id);
                                                    return (
                                                        <div key={restaurant.id} className="flex items-center space-x-2 text-xs bg-white p-2 rounded border">
                                                            <Checkbox
                                                                checked={true}
                                                                disabled={true}
                                                                className="h-3 w-3"
                                                            />
                                                            <div>
                                                                <span className="font-medium">{restaurant.name}</span>
                                                                <span className="text-gray-500 ml-2">- {exclusion?.reason}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                        {restaurants.filter(restaurant =>
                                            promo.excludedRestaurants!.some(excluded => excluded.restaurantId === restaurant.id) &&
                                            restaurant.name.toLowerCase().includes(excludedSearch.toLowerCase())
                                        ).length === 0 && excludedSearch && (
                                                <div className="text-xs text-gray-500 py-2">No restaurants found</div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {promo.includedRestaurants && promo.includedRestaurants.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <Label className="text-gray-500">Included Restaurants ({promo.includedRestaurants.length})</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowIncludedDetails(!showIncludedDetails)}
                                    className="h-6 px-2 text-xs"
                                >
                                    {showIncludedDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                                    {showIncludedDetails ? 'Hide' : 'Show'} Details
                                </Button>
                            </div>
                            {showIncludedDetails && (
                                <div className="bg-green-50 p-3 rounded space-y-2">
                                    <Input
                                        placeholder="Search restaurants..."
                                        value={includedSearch}
                                        onChange={(e) => setIncludedSearch(e.target.value)}
                                        className="text-xs h-8"
                                    />
                                    <div className={`space-y-1 ${restaurants.filter(restaurant =>
                                        promo.includedRestaurants!.some(included => included.restaurantId === restaurant.id) &&
                                        restaurant.name.toLowerCase().includes(includedSearch.toLowerCase())
                                    ).length > 0 ? 'max-h-32 overflow-y-auto' : ''
                                        }`}>
                                        {loadingData ? (
                                            <p className="text-xs text-gray-500">Loading...</p>
                                        ) : (
                                            restaurants
                                                .filter(restaurant =>
                                                    promo.includedRestaurants!.some(included => included.restaurantId === restaurant.id) &&
                                                    restaurant.name.toLowerCase().includes(includedSearch.toLowerCase())
                                                )
                                                .map(restaurant => {
                                                    const inclusion = promo.includedRestaurants!.find(included => included.restaurantId === restaurant.id);
                                                    return (
                                                        <div key={restaurant.id} className="flex items-center space-x-2 text-xs bg-white p-2 rounded border">
                                                            <Checkbox
                                                                checked={true}
                                                                disabled={true}
                                                                className="h-3 w-3"
                                                            />
                                                            <div>
                                                                <span className="font-medium">{restaurant.name}</span>
                                                                <span className="text-gray-500 ml-2">- {inclusion?.reason}</span>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                        )}
                                        {restaurants.filter(restaurant =>
                                            promo.includedRestaurants!.some(included => included.restaurantId === restaurant.id) &&
                                            restaurant.name.toLowerCase().includes(includedSearch.toLowerCase())
                                        ).length === 0 && includedSearch && (
                                                <div className="text-xs text-gray-500 py-2">No restaurants found</div>
                                            )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
