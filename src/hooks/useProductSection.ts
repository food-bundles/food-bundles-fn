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
  }, []);

  const handleDesktopToggle = () => {
    setIsDesktopCategoriesOpen(!isDesktopCategoriesOpen);
    setIsCardExpanded(!isCardExpanded);
  };

  return {
    selectedCategory,
    setSelectedCategory,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isDesktopCategoriesOpen,
    isCardExpanded,
    handleDesktopToggle,
  };
}