"use client";

import { useState, useEffect } from "react";

export function useProductSection() {
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopCategoriesOpen, setIsDesktopCategoriesOpen] = useState(true);
  const [isCardExpanded, setIsCardExpanded] = useState(false);

  // Listen for category selection events from header
  useEffect(() => {
    const handleCategorySelection = (event: CustomEvent) => {
      const categoryName = event.detail;
      setSelectedCategory(categoryName);
      setIsMobileMenuOpen(false);
    };

    window.addEventListener(
      "categorySelected",
      handleCategorySelection as EventListener
    );

    return () => {
      window.removeEventListener(
        "categorySelected",
        handleCategorySelection as EventListener
      );
    };
  }, []);

  // Check URL on component mount for initial category
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryFromUrl = urlParams.get("category");
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
    
    // Listen for URL changes (back/forward navigation)
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const category = params.get("category") || "All Categories";
      setSelectedCategory(category);
    };
    
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleDesktopToggle = () => {
    setIsDesktopCategoriesOpen(!isDesktopCategoriesOpen);
    setIsCardExpanded(!isCardExpanded);
  };

  // Enhanced setSelectedCategory that updates URL
  const setSelectedCategoryWithUrl = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL without page reload
    const url = new URL(window.location.href);
    if (category === "All Categories") {
      url.searchParams.delete('category');
    } else {
      url.searchParams.set('category', category);
    }
    
    window.history.pushState({}, '', url.toString());
  };

  return {
    selectedCategory,
    setSelectedCategory: setSelectedCategoryWithUrl,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDesktopCategoriesOpen,
    isCardExpanded,
    handleDesktopToggle,
  };
}