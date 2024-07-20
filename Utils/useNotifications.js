/* eslint-disable prettier/prettier */

import {useEffect} from 'react';
import messaging from '@react-native-firebase/messaging';
import {PermissionsAndroid, Platform, Linking} from 'react-native';
import {useSelector} from 'react-redux';
import {db} from './Firebase';
import {collection, doc, serverTimestamp, setDoc} from 'firebase/firestore';
import PushNotification from 'react-native-push-notification';

const NAVIGATION_IDS = ['home', 'settings'];

function buildDeepLinkFromNotificationData(data) {
  try {
    const navigationId = data?.navigationId;
    if (!NAVIGATION_IDS.includes(navigationId)) {
      console.warn('Unverified navigationId', navigationId);
      return null;
    }
    if (navigationId === 'home') {
      return 'aistearunicapartner://home';
    }
    if (navigationId === 'settings') {
      return 'aistearunicapartner://settings';
    }
    return null;
  } catch (e) {
    console.error('Error building deep link:', e);
    return null;
  }
}

async function saveNotificationToDatabase(userId, remoteMessage) {
  console.log(userId);
  console.log(remoteMessage.notification);
  if (!userId) {
    console.error('Error: userId is null or undefined');
    return;
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const docID = `NID${timestamp}`;
  if (!remoteMessage.notification) {
    console.log('no notification data');
    return;
  }
  try {
    const title = remoteMessage.notification?.title || 'Aistear Unica Partner';
    const body = remoteMessage.notification?.body || '...';
    const imageUrl = remoteMessage.notification?.android?.imageUrl || '';

    const notification = {
      title: title,
      body: body,
      imageUrl: imageUrl,
      receivedAt: serverTimestamp(),
    };

    const userRef = doc(db, 'Partners', userId);
    const notificationsRef = collection(userRef, 'notifications');
    await setDoc(doc(notificationsRef, docID), notification);
    console.log('Notification saved to database with ID:', docID);
  } catch (e) {
    console.error('Error saving notification to database:', e);
  }
}

export const useNotifications = () => {
  const userId = useSelector(state => state.partnerSlice.partnerId);

  useEffect(() => {
    const requestUserPermission = async () => {
      try {
        if (Platform.OS === 'android') {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        }
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Authorization status:', authStatus);
          const token = await messaging().getToken();
          console.log('FCM token useNotification:', token);
        } else {
          console.log('Notification permissions not granted');
        }
      } catch (e) {
        console.error('Error requesting user permission:', e);
      }
    };

    requestUserPermission();

    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      try {
        await saveNotificationToDatabase(userId, remoteMessage);
        console.log('SHOW NOTIFICATION UNSUBSCRIBE....');
        showLocalNotification(remoteMessage);
      } catch (e) {
        console.error('Error handling onMessage:', e);
      }
    });

    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp(remoteMessage => {
        console.log('Notification opened from background:', remoteMessage);
        try {
          const url = buildDeepLinkFromNotificationData(remoteMessage.data);
          if (typeof url === 'string') {
            Linking.openURL(url);
          }
        } catch (e) {
          console.error('Error handling onNotificationOpenedApp:', e);
        }
      });

    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Background message received:', remoteMessage);
      try {
        console.log('Message handled in the background!', remoteMessage);
        await saveNotificationToDatabase(userId, remoteMessage);
        console.log('SHOW NOTIFICATION SET BACKGROUND....');
        showLocalNotification(remoteMessage);
      } catch (e) {
        console.error('Error handling background message:', e);
      }
    });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, [userId]);
};

function showLocalNotification(remoteMessage) {
  console.log('SHOWING NOTIFICATION....');

  PushNotification.localNotification({
    channelId: 'default-channel-id',
    title: remoteMessage.notification?.title,
    message: remoteMessage.notification?.body,
    bigPictureUrl: remoteMessage.notification?.android?.imageUrl,
    largeIconUrl: remoteMessage.notification?.android?.imageUrl,
    smallIcon: 'ic_notification',
    bigText: remoteMessage.notification?.body,
    priority: 'high',
    vibrate: true,
  });
}
