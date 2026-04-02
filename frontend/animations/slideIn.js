export const slideInRight = {
  hidden: { x: "100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "100%", transition: { duration: 0.2 } },
};

export const slideInLeft = {
  hidden: { x: "-100%" },
  visible: { x: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "-100%", transition: { duration: 0.2 } },
};
