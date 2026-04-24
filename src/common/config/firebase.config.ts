import admin from './firebase-keys.config';
import { TokenMessage } from 'firebase-admin/messaging';

interface NotificationData {
  userId: string;
  name: string;
  roles: string;
  message: string;
  relatedEntityId: string;
   image: string | null
}

export async function sendPushNotification(
  token: string,
  title: string,
  body: string,
  data?: NotificationData
) {
  console.log('sendPushNotification called with:', { token, title, body, data });

  if (!token) {
    console.log('No FCM token provided, skipping push notification.');
    return { success: false, error: 'No FCM token provided' };
  }

  if (data) {
    for (const key in data) {
      if (typeof data[key] !== 'string') {
        throw new Error(`Value for key "${key}" must be a string.`);
      }
    }
  }

  const message: TokenMessage = {
    notification: { title, body },
    token,
    data: data as unknown as { [key: string]: string } | undefined, // Type assertion
  };

  try {
    const response = await admin.messaging().send(message);
    console.log('Notification sent successfully:', response);
    return { success: true, response };
  } catch (error: any) {
    console.error('Error sending notification:', {
      message: error.message,
      code: error.code,
      details: error.details,
    });
    if (error.code === 'messaging/registration-token-not-registered') {
      console.log(`Invalid FCM token: ${token}. Should be removed from database.`);
      return { success: false, error: 'Invalid token', token };
    }
    throw error;
  }
}