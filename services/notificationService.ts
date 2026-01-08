
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.warn("This browser does not support notifications.");
    return false;
  }

  if (Notification.permission === 'granted') return true;

  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: 'https://cdn-icons-png.flaticon.com/512/1157/1157000.png'
    });
    
    // Play a gentle sound
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log("Audio play blocked by browser", e));
  }
};
