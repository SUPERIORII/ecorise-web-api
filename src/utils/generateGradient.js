const gradient = [
  "gradient1",
  "gradient2",
  "gradient3",
  "gradient4",
  "gradient5",
];

export const generateGradientColor = () => {
  const selectedGadient = gradient[Math.floor(Math.random() * gradient.length)];

  return selectedGadient;
};

