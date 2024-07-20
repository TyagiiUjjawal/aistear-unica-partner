/* eslint-disable prettier/prettier */
import messaging from '@react-native-firebase/messaging';
import PushNotification from 'react-native-push-notification';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('Message handled in the background!!!!!!', remoteMessage);
  showLocalNotification(remoteMessage);
});

function showLocalNotification(remoteMessage) {
  console.log('firebase-messaging');
  PushNotification.localNotification({
    channelId: 'default-channel-id',
    message: remoteMessage.notification?.body,
    bigText: remoteMessage.notification?.body,
    playSound: true,
    soundName: 'default',
    importance: 'high',
    priority: 'high',
  });
}
