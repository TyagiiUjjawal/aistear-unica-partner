/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {useSelector} from 'react-redux';
import {
  collection,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore';
import {db} from '../Utils/Firebase';
import emptyNotification from '../assets/emptyNotification.png';
import {formatDistance} from 'date-fns';
import CustomHeader from '../Components/CustomHeader';

export default function NotificationScreen() {
  const [notifications, setNotifications] = useState([]);
  const userId = useSelector(state => state.partnerSlice.partnerId);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const notificationsRef = collection(
          db,
          'Partners',
          userId,
          'notifications',
        );
        const notificationsQuery = query(
          notificationsRef,
          orderBy('receivedAt', 'desc'),
        );
        const querySnapshot = await getDocs(notificationsQuery);
        const notificationsList = querySnapshot.docs.map(doc => {
          const data = doc.data();
          let formattedTime = formatDistance(
            data.receivedAt.toDate(),
            new Date(),
            {addSuffix: true},
          );

          if (formattedTime.startsWith('about ')) {
            formattedTime = formattedTime.replace('about ', '');
          }

          return {
            id: doc.id,
            ...data,
            receivedAtFormatted: formattedTime,
          };
        });
        setNotifications(notificationsList);
      } catch (e) {
        console.error('Error fetching notifications: ', e);
      }
    };

    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleClearAllNotifications = async () => {
    try {
      const notificationsRef = collection(
        db,
        'Partners',
        userId,
        'notifications',
      );
      const querySnapshot = await getDocs(notificationsRef);

      if (querySnapshot.empty) {
        return;
      }

      // Create a batch to delete all notifications
      const batch = writeBatch(db);
      querySnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });

      // Commit the batch
      await batch.commit();

      // Update state to reflect deletion
      setNotifications([]);

      // Optionally show a success message or perform other actions
    } catch (e) {
      console.error('Error clearing notifications: ', e);
      // Optionally show an error message
      Alert.alert('Error', 'Failed to clear notifications. Please try again.');
    }
  };

  const renderItem = ({item}) => (
    <View style={styles.notificationContainer}>
      {item.imageUrl ? (
        <Image
          source={{uri: item.imageUrl}}
          style={{
            height: 50,
            width: 50,
            borderRadius: 100,
            marginRight: 10,
          }}
        />
      ) : (
        <Image
          source={require('../assets/logo.png')}
          style={{
            height: 50,
            width: 50,
            borderRadius: 100,
            marginRight: 10,
          }}
        />
      )}

      <View>
        <View style={styles.flexBtn}>
          <Text style={styles.notificationTitle}>{item.title}</Text>
          <Text style={styles.notificationTimestamp}>
            {item.receivedAtFormatted}
          </Text>
        </View>
        <Text style={styles.notificationBody}>{item.body}</Text>
      </View>
    </View>
  );
  return (
    <View style={styles.flex}>
      <View style={styles.header}>
        <CustomHeader title="Notifications" />
      </View>
      <View style={styles.container}>
        {notifications.length === 0 ? (
          <View style={styles.emptyNotificationBody}>
            <Image
              source={emptyNotification}
              style={styles.emptyNotificationImage}
            />
          </View>
        ) : (
          <>
            <FlatList
              data={notifications}
              renderItem={({item, index}) => renderItem({item})}
              keyExtractor={item => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />
            <View style={styles.clearAllButtonContainer}>
              <TouchableOpacity
                onPress={handleClearAllNotifications}
                style={styles.clearAllButton}>
                <Text style={styles.clearAllButtonText}>
                  Clear All Notifications
                </Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: '#fff',
  },
  container: {
    flex: 5,
    padding: 16,
    backgroundColor: '#fff',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    marginHorizontal: 'auto',
  },
  notificationContainer: {
    backgroundColor: '#fff',
    marginBottom: 25,
    flexDirection: 'row',
  },
  notificationTitle: {
    fontSize: 18,
    marginBottom: 2,
    fontFamily: 'Sora-SemiBold',
    color: '#000',
  },
  notificationBody: {
    fontSize: 14,
    color: '#464646',
    fontFamily: 'Sora-Regular',
    lineHeight: 14 * 1.5,
    width: 260,
  },
  notificationTimestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 8,
    fontFamily: 'Sora-Regular',
  },
  emptyNotificationBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyNotificationImage: {
    height: 200,
    width: 200,
  },
  clearAllButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  clearAllButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  flexBtn: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  clearAllButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
  },
});
