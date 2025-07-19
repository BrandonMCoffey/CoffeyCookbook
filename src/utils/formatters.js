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