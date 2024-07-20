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
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {format} from 'date-fns';
import {useSelector} from 'react-redux';
import noBooking from '../assets/noBooking.png';
import refreshBtn from '../assets/refreshWhiteIcon.png';

export default function MyBookingScreen({navigation}) {
  const [bookings, setBookings] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [refreshLoading, setRefreshLoading] = useState(false);

  const partnerId = useSelector(state => state.partnerSlice.partnerId);
  const nav = useNavigation();

  useEffect(() => {
    const fetchData = async () => {
      setRefreshLoading(true);

      const [bookingsSnapshot, remittancesSnapshot] = await Promise.all([
        getDocs(collection(db, 'bookings')),
        getDocs(collection(db, 'partnerRemittances')),
      ]);

      const bookingsList = bookingsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const remittancesList = remittancesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      const filteredRemittances = remittancesList.filter(
        remittance => remittance.partnerId === partnerId,
      );

      const filteredBookings = bookingsList.filter(
        booking =>
          booking.partner.id === partnerId && booking.status === 'completed',
      );

      const combinedData = filteredRemittances
        .map(remittance => {
          const matchedBooking = filteredBookings.find(
            booking => booking.id === remittance.bookingId,
          );
          console.log(matchedBooking);
          if (matchedBooking) {
            return {
              ...matchedBooking,
              amount: remittance.amount,
              transactionId: remittance.transactionId,
              remittanceStatus: remittance.status,
            };
          }
          return null;
        })
        .filter(item => item !== null)
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);

      setBookings(combinedData);
      setRefreshLoading(false);
    };

    fetchData();
  }, [refresh]);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.refreshButton}
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

  const formatTimestamp = timestamp =>
    format(timestamp, 'EEE, d-MMM').toUpperCase();

  const handleNavigation = Eachbooking => {
    const booking = Eachbooking;
    nav.navigate('detail', {booking});
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.header}>
        <Text style={styles.headerText}>MY PAYMENTS</Text>
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
      {refreshLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#000" />
        </View>
      ) : (
        <View style={styles.container}>
          {bookings.length === 0 ? (
            <View style={styles.noBookingContainer}>
              <Image source={noBooking} style={styles.noBooking} />
            </View>
          ) : (
            bookings.map(payment => (
              <TouchableOpacity
                key={payment.id}
                style={styles.bookingContainer}
                onPress={() => handleNavigation(payment)}>
                <View style={styles.flex}>
                  <View style={styles.userContainer}>
                    <Text style={styles.userName}>
                      {payment.bookingDetail?.user?.name}
                    </Text>
                    <Text style={styles.bookingId}>{payment.id}</Text>
                  </View>
                  <View style={styles.alignRight}>
                    <Text style={styles.date}>
                      {formatTimestamp(payment.createdAt.seconds * 1000)}
                    </Text>
                    <Text style={styles.bookingText}>
                      {payment.amount ? `₹ ${payment.amount}` : ''}
                    </Text>
                    {payment.transactionId ? (
                      <Text style={styles.bookingId}>
                        {payment.transactionId}
                      </Text>
                    ) : null}
                  </View>
                </View>
                <Text style={styles.address}>
                  {payment.bookingDetail?.user?.address}
                </Text>
                <View style={styles.button}>
                  <Text style={styles.buttonText}>Finished</Text>
                  <Text
                    style={
                      payment.remittanceStatus === 'completed'
                        ? styles.status
                        : styles.pending
                    }>
                    {payment.remittanceStatus === 'completed'
                      ? 'DONE'
                      : 'PENDING'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {},
  header: {
    backgroundColor: '#F496AC',
    height: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingLeft: 20,
  },
  headerText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  refreshIconContainer: {
    paddingRight: 10,
    height: 35,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  refreshButton: {
    backgroundColor: 'red',
  },
  refreshIcon: {
    height: 20,
    width: 20,
  },
  loadingContainer: {
    flex: 1,
    padding: 100,
  },
  noBookingContainer: {
    flex: 1,
    paddingHorizontal: 40,
    paddingVertical: 100,
  },
  noBooking: {
    height: 300,
    width: 300,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
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
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  userContainer: {
    maxWidth: '65%',
  },
  userName: {
    fontSize: 24,
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  bookingId: {
    color: '#941756',
    marginRight: 'auto',
    fontSize: 12,
    fontFamily: 'Sora-SemiBold',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  date: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Sora-Bold',
  },
  bookingText: {
    color: '#941756',
    fontSize: 12,
    marginBottom: 0,
    fontFamily: 'Sora-SemiBold',
  },
  status: {
    fontSize: 20,
    fontFamily: 'Sora-Regular',
    color: '#179424',
  },
  pending: {
    fontSize: 20,
    fontFamily: 'Sora-Regular',
    color: '#941756',
  },
  address: {
    fontSize: 14,
    color: '#000',
    fontFamily: 'Sora-Regular',
    marginTop: 5,
  },
  buttonText: {
    color: '#179424',
    fontSize: 20,
    fontFamily: 'Sora-Regular',
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
