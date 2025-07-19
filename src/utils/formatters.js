export function formatTime(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) {
    return 'N/A';
  }
  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  }
  
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  const hoursText = `${hours} hour${hours > 1 ? 's' : ''}`;
  const minutesText = minutes > 0 ? ` ${minutes} min` : '';
  
  return `${hoursText}${minutesText}`;
}

export function formatQuantity(quantity) {
    if (quantity === 0) return '';
    if (typeof quantity === 'string') return quantity;

    const fractions = {
        0.125: '⅛', 0.25: '¼', 0.33: '⅓', 0.333: '⅓', 
        0.5: '½', 0.66: '⅔', 0.666: '⅔', 0.75: '¾',
    };

    const roundedQuantity = Math.round(quantity * 1000) / 1000;
    if (fractions[roundedQuantity]) {
        return fractions[roundedQuantity];
    }
    
    return quantity;
}