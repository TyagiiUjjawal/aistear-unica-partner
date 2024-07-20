/* eslint-disable prettier/prettier */
import React, {useEffect, useState, useRef} from 'react';
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
  Dimensions,
  Animated,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import refreshBtn from '../assets/refresh.png';
import noBooking from '../assets/noBooking.png';
import CustomModal from '../Components/CustomModal';

const {width} = Dimensions.get('window');
const containerWidth = width - 40;

export default function MyBookingList({navigation}) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const nav = useNavigation();
  const partnerId = useSelector(state => state.partnerSlice.partnerId);

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

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
          partnerId === booking.partner.id &&
          (booking.status === 'Accepted' ||
            booking.status === 'completeByPartnerCustomerBoth' ||
            booking.status === 'completeByCustomer' ||
            booking.status === 'cancelled' ||
            booking.status === 'completed'),
      );
      setRefreshLoading(false);
      const sortedBookingList = filteredBookingList.sort((a, b) => {
        return b.createdAt.toDate() - a.createdAt.toDate();
      });
      setBookings(sortedBookingList);
    };

    fetchBookings();
  }, [refresh]);

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

  const handleScroll = event => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / containerWidth);
    setCurrentIndex(index);
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {bookings.map((_, index) => {
          if (
            index === currentIndex ||
            index === currentIndex - 1 ||
            index === currentIndex + 1
          ) {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor:
                      index === currentIndex ? '#179424' : '#ccc',
                  },
                  {width: index === currentIndex ? 8 : 5},
                  {height: index === currentIndex ? 8 : 5},
                ]}
                // onPress={() => {
                // flatListRef.current.scrollToIndex({
                //   animated: true,
                //   index,
                // });
                // }}
              />
            );
          } else if (index === currentIndex - 2) {
            return (
              <View key={index} style={styles.dot}>
                {/* Render a placeholder for the next dot */}
              </View>
            );
          }
        })}
      </View>
    );
  };

  const handleNavigation = booking => {
    if (!booking?.cancelledPartners?.includes(partnerId)) {
      nav.navigate('detail', {booking});
    }
  };

  return (
    <View style={styles.scrollContainer}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          width: '100%',
        }}>
        <Text
          style={{
            fontSize: 16,
            marginTop: 20,
            color: '#000',
            fontFamily: 'Sora-Regular',
          }}>
          My Bookings
        </Text>
        <TouchableOpacity
          style={styles.refreshIconContainer}
          onPress={() => setRefresh(!refresh)}>
          {refreshLoading ? (
            <ActivityIndicator size="small" color="#000" />
          ) : (
            <Image source={refreshBtn} style={styles.refreshIcon} />
          )}
        </TouchableOpacity>
      </View>
      {bookings.length === 0 ? (
        <View style={[styles.container, styles.noBookingContainer]}>
          <Image source={noBooking} style={styles.noBooking} />
        </View>
      ) : null}
      {loading ? (
        <ActivityIndicator size={'small'} color={'#000'} />
      ) : (
        <ScrollView
          horizontal
          pagingEnabled
          // onScroll={Animated.event(
          //   [{nativeEvent: {contentOffset: {x: scrollX}}}],
          //   {useNativeDriver: false},
          // )}
          onScroll={event => handleScroll(event)}
          showsHorizontalScrollIndicator={false}
          scrollEventThrottle={16}>
          {bookings.map((booking, index) => (
            <TouchableOpacity
              key={booking.id}
              style={[
                styles.bookingContainer,
                {width: containerWidth},
                booking.status === 'cancelled'
                  ? {backgroundColor: '#BBBBBB'}
                  : {},
              ]}
              onPress={() => handleNavigation(booking)}>
              <View style={styles.flex}>
                <View style={styles.userDetail}>
                  <Text style={styles.userName}>
                    {truncateText(booking.bookingDetail.user.name, 10)}
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
                  {truncateText(booking.bookingDetail.user.address, 40)}
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
                      booking.status === 'cancelled'
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
                      : booking.status === 'cancelled'
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
          ))}
        </ScrollView>
      )}

      <View style={styles.pagination}>
        {!loading && bookings.length > 0 && renderDots()}
      </View>
      <CustomModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={hideModal}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  date: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Sora-Bold',
  },
  noBookingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: containerWidth,
  },
  noBookingText: {
    fontSize: 20,
    justifyContent: 'center',
    textAlign: 'center',
    paddingVertical: 50,
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
  userDetail: {
    flex: 1,
  },
  address: {
    fontSize: 13,
    marginTop: 10,
    color: '#000',
    lineHeight: 13 * 1.5,
    fontFamily: 'Sora-Regular',
  },
  userName: {
    maxWidth: '99%',
    fontSize: 24,
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 20,
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: containerWidth,
    marginTop: 8,
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
    paddingRight: 10,
    marginTop: 12,
    height: 35,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#941756',
  },
  inactiveDot: {
    backgroundColor: '#BBBBBB',
  },
  noBooking: {
    // height: 220,
    // width: 220,
    height: 130,
    width: 130,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
    alignItems: 'center',
  },
});
