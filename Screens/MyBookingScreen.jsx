/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {db} from '../Utils/Firebase';
import {collection, getDocs} from 'firebase/firestore';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import noBooking from '../assets/noBooking.png';
import refreshBtn from '../assets/refreshWhiteIcon.png';
import CustomModal from '../Components/CustomModal';

export default function MyBookingScreen({navigation}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const nav = useNavigation();

  const partnerId = useSelector(state => state.partnerSlice.partnerId);

  useEffect(() => {
    const fetchBookings = async () => {
      setRefreshLoading(true);
      const dbRef = collection(db, 'bookings');
      const snapshot = await getDocs(dbRef);
      const bookingList = [];
      snapshot.forEach(doc => {
        const bookingData = doc.data();
        const bookingDate = formatTimestamp(
          bookingData.bookingDetail.bookingDate.toDate(),
        );
        bookingList.push({id: doc.id, ...bookingData, bookingDate});
      });
      const filteredBookingList = bookingList.filter(
        booking =>
          (partnerId === booking.partner.id &&
            (booking.status === 'Accepted' ||
              booking.status === 'completeByPartnerCustomerBoth' ||
              booking.status === 'completed' ||
              booking.status === 'completeByCustomer' ||
              (booking.status === 'initiated' &&
                booking?.cancelledPartners?.includes(partnerId)) ||
              (booking.status === 'reassigned' &&
                booking?.cancelledPartners?.includes(partnerId)))) ||
          booking?.cancelledPartners?.includes(partnerId),
      );
      setRefreshLoading(false);
      const sortedBookingList = filteredBookingList.sort((a, b) => {
        return b.createdAt.toDate() - a.createdAt.toDate();
      });
      setBookings(sortedBookingList);
    };

    fetchBookings();
  }, [refresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={{backgroundColor: 'red'}}
          onPress={() => setRefresh(!refresh)}>
          {refreshLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Image source={refreshBtn} style={styles.refreshIcon} />
          )}
        </TouchableOpacity>
      ),
      headerLeft: null,
    });
  }, [navigation, refresh, refreshLoading]);

  const formatTimestamp = timestamp => {
    const formattedDate = format(timestamp, 'EEE, d-MMM').toUpperCase();
    return formattedDate;
  };

  const formatTime = timeString => {
    const [time, modifier] = timeString.split(' ');
    let [hours, minutes] = time.split(':');
    if (hours === '12') {
      hours = '00';
    }
    if (modifier === 'PM') {
      hours = parseInt(hours, 10) + 12;
    }
    const formattedHours = parseInt(hours) % 12 || 12;
    return `${formattedHours}:${minutes} ${modifier}`;
  };

  const handleCancelBooking = async booking => {
    setLoading(true);
    try {
      const response = await fetch(
        'https://au-admin-panel.vercel.app/api/cancelBookingByPartner',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({BookingId: booking.id}),
        },
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel booking');
      }

      const responseData = await response.text();
      const message = responseData
        ? JSON.parse(responseData).message
        : 'Booking cancelled';

      setBookings(bookings.filter(b => b.id !== booking.id));

      showModal(message);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = booking => {
    if (!booking?.cancelledPartners?.includes(partnerId)) {
      nav.navigate('detail', {booking});
    }
  };

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };
  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View
        style={{
          backgroundColor: '#F496AC',
          height: 65,
          flexDirection: 'row',
          alignItems: 'start',
          paddingTop: 15,
          width: '100%',
          paddingLeft: 10,
        }}>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              marginTop: 12,
              fontFamily: 'Sora-Medium',
            }}>
            MY BOOKINGS
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshIconContainer}
          onPress={() => setRefresh(!refresh)}>
          {refreshLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Image source={refreshBtn} style={styles.refreshIcon} />
          )}
        </TouchableOpacity>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <View style={styles.container}>
          {bookings.length === 0 ? (
            <View style={[styles.container, styles.noBookingContainer]}>
              <Image source={noBooking} style={styles.noBooking} />
            </View>
          ) : (
            bookings.map(booking => (
              <TouchableOpacity
                key={booking.id}
                style={[
                  styles.bookingContainer,
                  booking?.cancelledPartners?.includes(partnerId)
                    ? {
                        backgroundColor: '#BBBBBB',
                      }
                    : {},
                ]}
                onPress={() => handleNavigation(booking)}>
                <View style={styles.flex}>
                  <View style={styles.userContainer}>
                    <Text style={styles.userName}>
                      {booking.bookingDetail.user.name}
                    </Text>
                    <Text style={styles.bookingId}>{booking.id}</Text>
                  </View>

                  <View style={styles.alignRight}>
                    <Text style={styles.date}>{booking.bookingDate}</Text>
                    <Text style={styles.bookingText}>
                      {formatTime(booking.bookingDetail.startTime)}-
                      {formatTime(booking.bookingDetail.endTime)}
                    </Text>
                  </View>
                </View>
                <View>
                  <Text style={styles.address}>
                    {booking.bookingDetail.user.address}
                  </Text>
                </View>

                <View style={styles.flex}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => {
                      if (
                        booking.status === 'Accepted' ||
                        booking.status === 'completeByCustomer'
                      ) {
                        // console.log('accept...');
                        // console.log('booking ', booking);
                        nav.navigate('detail', {booking});
                      }
                    }}>
                    <Text
                      style={
                        booking?.cancelledPartners?.includes(partnerId)
                          ? styles.cancelButtonText
                          : styles.buttonText
                      }>
                      {booking.status === 'Accepted'
                        ? 'Pending'
                        : booking.status === 'completeByPartnerCustomerBoth' ||
                          booking.status === 'completed'
                        ? 'Finished'
                        : booking.status === 'completeByCustomer'
                        ? 'Pending'
                        : booking?.cancelledPartners?.includes(partnerId)
                        ? 'Cancelled'
                        : ''}
                    </Text>
                  </TouchableOpacity>
                  {booking.status === 'Accepted' ? (
                    <TouchableOpacity
                      style={styles.button}
                      onPress={() => {
                        handleCancelBooking(booking);
                      }}
                      disabled={loading}>
                      {loading ? (
                        <ActivityIndicator size="small" color="#941756" />
                      ) : (
                        <Text style={styles.cancelButtonText}>Cancel</Text>
                      )}
                    </TouchableOpacity>
                  ) : (
                    ''
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
      <CustomModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={hideModal}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    // backgroundColor: '#fff',
  },
  date: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Sora-Bold',
  },
  noBookingText: {
    fontSize: 20,
    justifyContent: 'center',
    textAlign: 'center',
    flex: 1,
    padding: 'auto',
    paddingVertical: 100,
  },
  button: {
    alignSelf: 'flex-start',
    paddingTop: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#179424',
    fontSize: 20,
    fontFamily: 'Sora-Regular',
  },
  cancelButtonText: {
    color: '#941756',
    fontSize: 20,
    fontFamily: 'Sora-Regular',
  },

  alignRight: {
    alignItems: 'flex-end',
  },
  address: {
    fontSize: 13,
    marginTop: 10,
    color: '#000',
    lineHeight: 13 * 1.5,
    fontFamily: 'Sora-Regular',
  },
  userName: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  userContainer: {
    maxWidth: '65%',
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,

    // backgroundColor: '#fff',
    // marginTop: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  bookingContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    backgroundColor: '#fff',
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  bookingText: {
    color: '#941756',
    fontSize: 12,
    marginBottom: 0,
    fontFamily: 'Sora-SemiBold',
  },
  bookingId: {
    color: '#941756',
    marginRight: 'auto',
    fontSize: 12,
    fontFamily: 'Sora-SemiBold',
  },
  refreshIcon: {
    height: 20,
    width: 20,
  },
  refreshIconContainer: {
    paddingRight: 20,
    marginTop: 5,
    height: 35,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  loadingContainer: {
    flex: 1,
    padding: 100,
  },
  noBooking: {
    height: 300,
    width: 300,
  },
  noBookingContainer: {
    flex: 1,
    // justifyContent: 'center',
    // alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 100,
    // backgroundColor: '#000',
  },
});
