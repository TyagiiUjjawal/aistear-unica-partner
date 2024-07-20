/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  Alert,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import MapView, {UrlTile, Marker} from 'react-native-maps';
import CustomHeader from '../Components/CustomHeader';
import {useNavigation} from '@react-navigation/native';
import CustomModal from '../Components/CustomModal';

const MapScreen = ({route}) => {
  const {latitude, longitude, phoneNumber, bookingId, status} = route.params;
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation();
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const makePhoneCall = () => {
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

  const handleMapPress = () => {
    if (!latitude || !longitude) {
      Alert.alert('Error', 'Coordinates are missing.');
      return;
    }
    const url = `http://maps.google.com/?q=${latitude},${longitude}`;
    Linking.canOpenURL(url)
      .then(supported => {
        if (!supported) {
          Alert.alert('Error', 'Unable to open Google Maps');
        } else {
          return Linking.openURL(url);
        }
      })
      .catch(err => console.error('An error occurred', err));
  };

  const handleFinish = async () => {
    setIsLoading(true);
    try {
      console.log(' ');
      console.log('finish job...');
      console.log(bookingId);
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

      console.log(response.status);

      const responseData = await response.json();

      if (!response.ok) {
        const errorMessage = responseData.message || 'Failed to accept booking';
        if (
          response.status === 400 &&
          errorMessage === 'Could you please complete this booking by User?'
        ) {
          // Alert.alert('Info', errorMessage);
          showModal(errorMessage);
        } else {
          throw new Error(errorMessage);
        }
      } else {
        const message = responseData.message || 'Booking accepted';
        setIsCompleted(true);
        Alert.alert('Finished Job', message);
        navigation.navigate('myBooking');
      }
    } catch (error) {
      console.error('Error finishing job:', error);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAcceptBooking = async booking => {
    try {
      setIsLoading(true);
      const response = await fetch(
        'https://au-admin-panel.vercel.app/api/acceptBooking',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({BookingId: bookingId}),
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

      navigation.navigate('myBooking');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <CustomHeader title="JOB DETAILS" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.mapContainer}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: latitude,
              longitude: longitude,
              latitudeDelta: 0.0922,
              longitudeDelta: 0.0421,
            }}>
            <UrlTile
              urlTemplate="http://c.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maximumZ={19}
            />
            <Marker coordinate={{latitude: latitude, longitude: longitude}} />
          </MapView>
        </View>
        <View style={styles.flex}>
          <TouchableOpacity style={styles.dirBtn} onPress={handleMapPress}>
            <Text style={styles.whiteText}>DIRECTION</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={makePhoneCall}>
            <Text style={styles.whiteText}>CALL</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.finishContainer}>
          {status === 'Accepted' ? (
            <TouchableOpacity
              style={styles.finishButton}
              onPress={handleFinish}
              disabled={isCompleted}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.finishText}>
                  {isCompleted ? 'Completed' : 'Finish Job'}
                </Text>
              )}
            </TouchableOpacity>
          ) : status === 'completeByPartnerCustomerBoth' ? null : (
            <TouchableOpacity
              style={[styles.finishButton]}
              onPress={() => handleAcceptBooking(bookingId)}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.finishText}>Accept</Text>
              )}
            </TouchableOpacity>
          )}
        </View>
        <CustomModal
          isVisible={isModalVisible}
          message={modalMessage}
          onClose={hideModal}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: 10,
  },
  mapContainer: {
    width: '100%',
    height: 450,
    marginBottom: 30,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  flex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  btn: {
    backgroundColor: '#F496AC',
    paddingVertical: 10,
    width: 140,
    fontFamily: 'Sora-Regular',
  },
  dirBtn: {
    backgroundColor: '#F496AC',
    paddingVertical: 10,
    width: 140,
    fontFamily: 'Sora-Regular',
  },
  whiteText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    fontFamily: 'Sora-Regular',
  },
  finishContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 100,
  },
  finishButton: {
    backgroundColor: '#F496AC',
    paddingVertical: 15,
    paddingHorizontal: 50,
    width: '100%',
    alignItems: 'center',
  },
  finishText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-SemiBold',
  },
});
export default MapScreen;
