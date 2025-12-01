export const formatCLP = (price: number | string) => {
  const val = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(val)) return '$0';
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(val);
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};