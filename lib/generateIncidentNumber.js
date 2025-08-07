export function generateIncidentNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const time = Date.now().toString().slice(-4);
  return `EMG-${year}${month}${day}-${time}`;
}
