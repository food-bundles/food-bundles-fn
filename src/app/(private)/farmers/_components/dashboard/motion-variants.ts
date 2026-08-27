export const gridContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

export const gridItemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 380, damping: 32 },
  },
};
