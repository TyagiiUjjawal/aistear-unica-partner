/* eslint-disable prettier/prettier */
import React, {useEffect, useRef, useState} from 'react';
import {db} from '../Utils/Firebase';
import {collection, getDocs} from 'firebase/firestore';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import refreshBtn from '../assets/refresh.png';
import noBooking from '../assets/noBookings.png';

const {width, height} = Dimensions.get('window');

export default function BookingList() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const navigation = useNavigation();
  const flatListRef = useRef(null);

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
          partnerId === booking.partner.id &&
          (booking.status === 'assigned' ||
            (booking.status === 'reassigned' &&
              !booking?.cancelledPartners?.includes(partnerId))),
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

  const handleAcceptBooking = async booking => {
    try {
      setLoading(true);
      const response = await fetch(
        'https://au-admin-panel.vercel.app/api/acceptBooking',
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
        throw new Error(errorData.message || 'Failed to accept booking');
      }

      const responseData = await response.text();
      const message = responseData
        ? JSON.parse(responseData).message
        : 'Booking accepted';

      setBookings(
        bookings.map(b =>
          b.id === booking.id
            ? {...b, bookingDetail: {...b.bookingDetail, status: 'Accepted'}}
            : b,
        ),
      );

      setBookings(bookings.filter(b => b.id !== booking.id));

      const updatedBooking = {
        ...booking,
        status: 'Accepted',
      };

      navigation.navigate('detail', {booking: updatedBooking});
      // navigation.navigate('detail', {booking});
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async booking => {
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

      Alert.alert('Success', message);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const truncateText = (text, length) => {
    return text.length > length ? text.substring(0, length) + '...' : text;
  };

  const renderBookingItem = ({item: booking}) => (
    <TouchableOpacity
      style={styles.bookingContainer}
      onPress={() => navigation.navigate('detail', {booking})}>
      <View style={styles.flex}>
        <View>
          <Text style={styles.userName}>
            {truncateText(booking.bookingDetail.user.name, 12)}
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
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!loading) {
            if (booking.bookingDetail.status === 'Accepted') {
              handleCancelBooking(booking);
            } else {
              handleAcceptBooking(booking);
            }
          }
        }}
        disabled={loading}>
        <Text style={styles.buttonText}>
          {booking.bookingDetail.status === 'Accepted' ? 'Cancel' : 'Accept'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      setActiveIndex(viewableItems[0].index);
    }
  }).current;

  const renderDots = () => {
    return (
      <View style={styles.dotsContainer}>
        {bookings.map((_, index) => {
          if (
            index === activeIndex ||
            index === activeIndex - 1 ||
            index === activeIndex + 1
          ) {
            return (
              <TouchableOpacity
                key={index}
                style={[
                  styles.dot,
                  {backgroundColor: index === activeIndex ? '#179424' : '#ccc'},
                  {width: index === activeIndex ? 8 : 5},
                  {height: index === activeIndex ? 8 : 5},
                ]}
                onPress={() => {
                  flatListRef.current.scrollToIndex({
                    animated: true,
                    index,
                  });
                }}
              />
            );
          } else if (index === activeIndex - 2) {
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

  return (
    <View style={styles.container}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
        <Text
          style={{
            fontSize: 16,
            marginTop: 20,
            color: '#000',
            fontFamily: 'Sora-Regular',
          }}>
          Booking Requests
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

      {loading && (
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            top: '0',
            left: '50%',
            zIndex: 50,
            marginTop: 20,
            flex: 1,
          }}>
          <ActivityIndicator size="large" color="#179424" />
        </View>
      )}

      {bookings.length === 0 || loading ? (
        <View style={styles.noBookContainer}>
          {/* {loading === false && ( */}
          <View style={styles.noBookingContainer}>
            <Image source={noBooking} style={styles.noBooking} />
            <Text style={styles.noBookingText}>NO Bookings</Text>
          </View>
          {/* // )} */}
        </View>
      ) : (
        <FlatList
          data={bookings}
          ref={flatListRef}
          renderItem={renderBookingItem}
          keyExtractor={item => item.id}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.flatListContentContainer}
          onViewableItemsChanged={onViewableItemsChanged}
        />
      )}
      {/* {bookings.length > 0 && renderDots()} */}
      {!loading && bookings.length > 0 && renderDots()}
    </View>
  );
}

const styles = StyleSheet.create({
  date: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Sora-SemiBold',
  },
  noBookContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: width - 40,
  },
  noBookingContainer: {
    flex: 1,
    fontSize: 20,
    textAlign: 'center',
    fontFamily: 'Soro-Regular',
    color: '#A6A6A6',
    alignItems: 'center',
    justifyContent: 'center',
    height: 155,
    width: 155,
  },
  button: {
    alignItems: 'flex-start',
    backgroundColor: '#FFFFFF',
    paddingTop: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: '#179424',
    fontSize: 24,
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
  flex: {
    color: '#941756',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontWeight: '600',
  },
  container: {
    flex: 1,
    marginTop: 10,
    backgroundColor: '#fff',
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
    marginBottom: 5,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: width - 40,
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
    marginTop: 20,
    height: 35,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  noBooking: {
    height: 50,
    width: 50,
  },
  noBookingText: {
    color: '#A6A6A6',
    fontSize: 18,
    fontFamily: 'Sora-Medium',
    textAlign: 'center',
  },
  flatListContentContainer: {
    // paddingHorizontal: 10,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    alignSelf: 'center',
  },
});
