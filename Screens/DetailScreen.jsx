/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Platform,
  Linking,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import CustomHeader from '../Components/CustomHeader';
import clockIcon from '../assets/clockIcon.png';
import CustomModal from '../Components/CustomModal';

const Tooltip = ({isVisible, text}) => {
  if (!isVisible) return null;

  return (
    <View style={[styles.tooltipContainer]}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
};

export default function DetailScreen() {
  const route = useRoute();
  const {booking} = route.params || {};
  const itemsArray = Object.values(booking.bookingDetail?.items || {});
  const [isCompleted, setIsCompleted] = useState(false);
  const [isAccepted, setIsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const navigation = useNavigation();

  useEffect(() => {
    if (!booking) {
      Alert.alert('Error', 'Booking data is missing.');
    }
  }, [booking]);

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handleFinish = async bookingId => {
    setIsLoading(true);
    try {
      const response = await fetch(
        'https://au-admin-panel.vercel.app/api/completeByPartner',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({BookingId: bookingId}),
        },
      );

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Failed to accept booking';
        if (
          response.status === 400 &&
          errorMessage === 'Could you please complete this booking by User?'
        ) {
          showModal(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      } else {
        const message = responseData.message || 'Booking accepted';
        setIsCompleted(true);
        showModal(message);
        setTimeout(() => {
          setModalVisible(false);
          navigation.navigate('myBooking');
        }, 2000);
        // navigation.navigate('myBooking');
      }
    } catch (error) {
      console.error('Error finishing job:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapPress = (
    latitude,
    longitude,
    phoneNumber,
    bookingId,
    status,
  ) => {
    if (!latitude && !longitude) {
      Alert.alert('Error', 'Address is missing.');
      return;
    }
    navigation.navigate('map', {
      latitude,
      longitude,
      phoneNumber,
      bookingId,
      status,
    });
  };

  const makePhoneCall = () => {
    const phoneNumber = booking.userProfile.phoneNumber;
    if (Linking.canOpenURL(`tel:${phoneNumber}`)) {
      if (Platform.OS === 'android') {
        Linking.openURL(`tel:${phoneNumber}`);
      } else {
        Linking.openURL(`telprompt:${phoneNumber}`);
      }
    } else {
      Alert.alert('Error', 'Phone call not supported on this device.');
    }
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
      setIsAccepted(true);
      navigation.navigate('myBooking');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!booking) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={styles.noBookingText}>No booking data available.</Text>
      </SafeAreaView>
    );
  }

  const handleTooltipPress = text => {
    setTooltipVisible(true);
    setTooltipText(text);

    setTimeout(() => {
      setTooltipVisible(false);
    }, 3000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="JOB DETAILS" />
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.centeredContainer}>
          <View>
            <View style={styles.flex}>
              <Text style={styles.userName}>
                {booking.bookingDetail?.user.name}
              </Text>
              <View style={styles.alignRight}>
                <Text style={styles.date}>{booking.bookingDate}</Text>
                <Text style={styles.bookingText}>
                  {formatTime(booking.bookingDetail?.startTime)}-
                  {formatTime(booking.bookingDetail?.endTime)}
                </Text>
              </View>
            </View>
            <View>
              <Text style={styles.address}>
                {booking.bookingDetail?.user.address}
              </Text>
            </View>
            <Text style={styles.buttonText}>
              {booking.bookingDetail?.totalDuration} mins
            </Text>
            <View style={styles.line} />

            <View style={styles.flex}>
              <Text style={styles.services}>Services</Text>
            </View>

            {itemsArray.map((item, index) => (
              <View key={index}>
                <View style={styles.itemContainer}>
                  <View>
                    <Image
                      source={{uri: item.imageUrl}}
                      style={styles.makeupItemImage}
                    />
                  </View>
                  <View style={styles.titleContainer}>
                    <Text style={styles.titleTimeContainer}>{item.name}</Text>
                    <Text style={styles.priceText}>
                      ₹{item.discountedPrice}
                    </Text>
                    <View style={styles.icon}>
                      <Image source={clockIcon} style={styles.image} />
                      <Text style={styles.time}>{item.duration}</Text>
                    </View>
                  </View>
                  <View style={styles.timeContainer}>
                    <View style={styles.buttonContainer}>
                      <TouchableOpacity
                        // onPress={() => removeItemFromCart(item)}
                        style={styles.countButton}>
                        <Text style={styles.quantityText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.countText}>{item.count}</Text>
                      <TouchableOpacity
                        // onPress={() => addItemToCart(item)}
                        style={styles.countButton}>
                        <Text style={styles.quantityText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))}

            {/* {booking.status === 'completeByPartnerCustomerBoth' ? null : ( */}
            <View style={[styles.flex, {}]}>
              <TouchableOpacity
                style={styles.btn}
                // disabled={booking.status === 'completeByPartnerCustomerBoth'}
                // onPress={() =>
                // handleMapPress(
                //   booking.userProfile?.latitude,
                //   booking.userProfile?.longitude,
                //   booking.userProfile?.phoneNumber,
                //   booking.id,
                //   booking.status,
                // )
                // }

                onPress={() => {
                  if (
                    booking.status === 'completeByPartnerCustomerBoth' ||
                    booking.status === 'completed'
                  ) {
                    handleTooltipPress('Booking is completed');
                  } else {
                    handleMapPress(
                      booking.userProfile?.latitude,
                      booking.userProfile?.longitude,
                      booking.userProfile?.phoneNumber,
                      booking.id,
                      booking.status,
                    );
                  }
                }}>
                <Text style={styles.whiteText}>MAP</Text>
              </TouchableOpacity>
              <Tooltip isVisible={tooltipVisible} text={tooltipText} />

              <TouchableOpacity
                // disabled={booking.status === 'completeByPartnerCustomerBoth'}
                style={styles.btn}
                // onPress={() => makePhoneCall()}
                onPress={() => {
                  if (
                    booking.status === 'completeByPartnerCustomerBoth' ||
                    booking.status === 'completed'
                  ) {
                    handleTooltipPress('Booking is completed');
                  } else {
                    makePhoneCall();
                  }
                }}>
                <Text style={styles.whiteText}>CALL</Text>
              </TouchableOpacity>
            </View>

            <View>
              {booking.status === 'Accepted' ||
              booking.status === 'completeByCustomer' ? (
                <TouchableOpacity
                  style={[styles.button]}
                  onPress={() => handleFinish(booking.id)}
                  disabled={isCompleted}>
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.completed}>
                      {isCompleted ? 'Completed' : 'Finish Job'}
                    </Text>
                  )}
                </TouchableOpacity>
              ) : booking.status === 'completeByPartnerCustomerBoth' ||
                booking.status === 'completed' ? null : (
                <TouchableOpacity
                  style={[styles.button]}
                  onPress={() => handleAcceptBooking(booking)}
                  disabled={isAccepted}>
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.completed}>
                      {isAccepted ? 'Accepted' : 'Accept'}
                    </Text>
                  )}
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
        <CustomModal
          isVisible={isModalVisible}
          message={modalMessage}
          onClose={hideModal}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  button: {
    marginTop: 20,
    backgroundColor: '#F496AC',
    color: '#fff',
    width: '100%',
    padding: 15,
    fontSize: 16,
    alignItems: 'center',
  },
  completed: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-SemiBold',
  },
  btn: {
    backgroundColor: '#F496AC',
    paddingVertical: 10,
    paddingHorizontal: 50,
    marginTop: 30,
  },
  services: {
    fontSize: 22,
    color: '#000',
    fontFamily: 'Sora-Regular',
  },
  bold: {
    color: '#000',
    lineHeight: 16 * 1.5,
    fontFamily: 'Sora-SemiBold',
  },
  priceText: {
    marginBottom: 5,
    fontSize: 15,
    color: '#8F90A6',
    fontFamily: 'Sora-Regular',
  },
  groupPriceContainer: {
    width: '40%',
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  icon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 5,
  },
  itemContainer: {
    flex: 1,
    // backgroundColor: '#F4F4F4',
    padding: 10,
    marginTop: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderColor: '#F4F4F4',
    gap: 15,
  },
  titleTimeContainer: {
    // maxWidth: '65%',
    fontSize: 15,
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  titleContainer: {
    flex: 1,
    maxWidth: '60%',
    // backgroundColor: 'grey',
  },
  timeContainer: {
    flex: 0.5,
    maxWidth: '60%',
    // backgroundColor: 'grey',
  },
  line: {
    borderBottomColor: '#BABABA',
    borderBottomWidth: 1,
    marginTop: 15,
    marginBottom: 25,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingTop: 30,
  },
  centeredContainer: {
    width: '100%',
  },
  noBookingText: {
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Sora-Regular',
  },
  bookingContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    width: '100%',
  },
  bookingText: {
    color: '#941756',
    fontSize: 13,
    marginBottom: 0,
    fontFamily: 'Sora-SemiBold',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  address: {
    fontSize: 16,
    marginTop: 15,
    color: '#000',
    lineHeight: 16 * 1.5,
    fontFamily: 'Sora-Regular',
  },
  userName: {
    maxWidth: '67%',
    fontSize: 30,
    fontWeight: '500',
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  flex: {
    color: '#941756',
    gap: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontWeight: '600',
    marginBottom: 10,
  },
  buttonText: {
    color: '#179424',
    fontSize: 24,
    marginTop: 18,
    fontFamily: 'Sora-Regular',
  },
  blackButton: {
    backgroundColor: '#000',
    paddingVertical: 10,
    paddingHorizontal: 15,
    disabled: true,
  },
  greyButton: {
    backgroundColor: '#ccc',
    paddingVertical: 10,
    paddingHorizontal: 15,
    disabled: true,
  },
  whiteText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Sora-Regular',
  },
  blackText: {
    color: '#000',
    fontSize: 16,
    textAlign: 'center',
  },
  specialRequest: {
    fontSize: 16,
    marginTop: 14,
  },
  date: {
    color: '#000',
    fontSize: 12,
    fontFamily: 'Sora-SemiBold',
  },
  time: {
    fontSize: 15,
    color: '#8F90A6',
    fontFamily: 'Sora-Regular',
  },
  image: {
    width: 13,
    height: 13,
    tintColor: '#8F90A6',
  },
  buttonContainer: {
    // width: 70,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0.5,
    borderColor: '#F496AC',
    borderRadius: 5,
    padding: 3,
    justifyContent: 'flex-end',
    alignSelf: 'flex-end',
  },
  countButton: {
    paddingHorizontal: 10,
  },
  quantityText: {
    fontSize: 18,
    fontFamily: 'Sora-Bold',
    color: '#F496AC',
  },
  countText: {
    color: '#000',
    fontFamily: 'Sora-Regular',
  },
  makeupItemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
  },
  tooltipContainer: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#666',
    borderRadius: 5,
    zIndex: 1,
    top: 1,
    left: 80,
    opacity: 0.7,
  },
  tooltipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Sora-Regular',
  },
});
