
export const validateEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateDates = (startDate: string, expectedCloseDate: string) => {
  const start = new Date(startDate);
  const end = new Date(expectedCloseDate);
  const today = new Date();

  if (start > end) {
    return "Start date cannot be after expected close date";
  }
  if (start < today && start.toDateString() !== today.toDateString()) {
    return "Start date cannot be in the past";
  }
  return null;
};

export const formatAmount = (value: string) => {
  const number = value.replace(/[^\d.]/g, '');
  const parts = number.split('.');
  const wholePart = parts[0];
  const decimalPart = parts[1] ? '.' + parts[1].slice(0, 2) : '';
  
  const formatted = Number(wholePart).toLocaleString('en-US') + decimalPart;
  return formatted;
};
