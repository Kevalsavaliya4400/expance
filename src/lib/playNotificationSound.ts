export const playNotificationSound = () => {
  const audio = new Audio('https://planetsoftweb.com/wp-content/uploads/2024/11/new-notification-7-210334.wav');
  audio.play().catch(error => {
    console.error('Error playing notification sound:', error);
  });
};