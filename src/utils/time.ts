export const formatTime = (duration: number) => {
  const hours = Math.floor(duration / (60 * 60));
  const minutes = Math.floor((duration - hours * 60 * 60) / 60);
  const seconds = Math.floor(duration - minutes * 60);
  // Show exact number of seconds for less or equal 5 minutes of duration
  const showSeconds = seconds <= 5;

  return `${hours}:${minutes}:${showSeconds ? seconds : 0}`;
};