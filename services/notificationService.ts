
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log("This browser does not support desktop notification");
    return false;
  }
  
  if (Notification.permission === 'granted') {
    return true;
  }
  
  const permission = await Notification.requestPermission();
  return permission === 'granted';
};

export const sendBrowserNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: 'https://cdn-icons-png.flaticon.com/512/4230/4230752.png' });
  }
};

export const simulateSendEmail = (email: string, type: 'daily' | 'weekly', content: string): Promise<string> => {
  return new Promise((resolve) => {
    console.log(`[Simulating Email Service] Sending ${type} email to ${email} with content: ${content}`);
    setTimeout(() => {
      resolve(`Sent ${type} digest to ${email}`);
    }, 1500);
  });
};
