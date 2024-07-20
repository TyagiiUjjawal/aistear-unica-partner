/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  PermissionsAndroid,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation, setPartnerId} from '../Redux/reducer';
import {getAuth, createUserWithEmailAndPassword, signOut} from 'firebase/auth';
import Geolocation from 'react-native-geolocation-service';
import CustomModal from '../Components/CustomModal';
import RNExitApp from 'react-native-exit-app';

const RegisterScreen1 = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    uid: '',
  });
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [address, setAddress] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'App needs access to your location.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          fetchLocation();
        } else {
          console.log('Location permission denied');
        }
      } else {
        fetchLocation();
      }
    } catch (err) {
      console.warn(err);
    }
  };
  useEffect(() => {
    fetchLocation();
  }, []);

  const fetchLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({latitude, longitude});
        fetchAddress(latitude, longitude);
      },
      error => {
        console.log(error.message);
      },
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  };

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
    RNExitApp.exitApp();
  };
  const fetchAddress = async (latitude, longitude) => {
    if (latitude === '' || !longitude) {
      showModal('You are offline. Please check your network connection.');
    }
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCYDYbrhpUNYw-GmBeHGOxMQQ6E4lA6Zyk`,
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setAddress(data.results[0].formatted_address);
        dispatch(
          addInformation({
            address: data.results[0].formatted_address,
            latitude,
            longitude,
          }),
        );
      } else {
        console.log('Error fetching address:', data.status);
      }
    } catch (error) {
      console.log('Error fetching address:', error);
    }
  };

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  const validateForm = () => {
    if (!formData.name) {
      notifyMessage('Name is required');
      return false;
    }

    if (!formData.email) {
      notifyMessage('Email is required');
      return false;
    } else {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email)) {
        notifyMessage('Invalid email format');
        return false;
      }
    }

    if (!formData.password) {
      notifyMessage('Password is required');
      return false;
    } else {
      if (formData.password.length < 6) {
        notifyMessage('Password is at least 6 characters long');
        return false;
      }
    }

    if (!confirmPassword) {
      notifyMessage('Confirm Password is required');
      return false;
    } else if (confirmPassword !== formData.password) {
      notifyMessage('Confirm Password should be the same as the Password');
      return false;
    }

    if (!formData.phoneNumber) {
      notifyMessage('Phone Number is required');
      return false;
    } else if (formData.phoneNumber.length !== 10) {
      notifyMessage('Phone number must be 10 digits');
      return false;
    }

    return true;
  };

  const handleContinue = async () => {
    setLoading(true);
    if (validateForm()) {
      const auth = getAuth();
      try {
        const {user} = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password,
        );
        const formDataWithUID = {
          ...formData,
          uid: user.uid,
        };
        dispatch(addInformation(formDataWithUID));
        await signOut(auth);
        nav.navigate('register2');
      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          notifyMessage('That email address is already in use!');
        } else if (error.code === 'auth/invalid-email') {
          notifyMessage('That email address is invalid!');
        } else {
          console.error(error);
          notifyMessage('An error occurred. Please try again later.');
        }
      }
    }
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.image}
            />
          </View>
          <View style={styles.formContainer}>
            <Text style={styles.heading}>Be Our Partner</Text>
            <Text style={styles.label}>Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Name"
              placeholderTextColor="#ABABAB"
              onChangeText={text => handleChange('name', text)}
            />
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#ABABAB"
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={text => handleChange('email', text)}
            />
            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#ABABAB"
              secureTextEntry
              onChangeText={text => handleChange('password', text)}
            />
            <Text style={styles.label}>Confirm Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#ABABAB"
              secureTextEntry
              onChangeText={v => setConfirmPassword(v)}
            />
            <Text style={styles.label}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#ABABAB"
              keyboardType="number-pad"
              onChangeText={text => handleChange('phoneNumber', text)}
            />
            <TouchableOpacity
              onPress={handleContinue}
              style={styles.continueBtn}>
              {loading ? (
                <ActivityIndicator size={'small'} color={'#fff'} />
              ) : (
                <Text style={styles.continueBtnTxt}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <CustomModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={hideModal}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontFamily: 'Sora-SemiBold',
    fontSize: 24,
    lineHeight: 30.24,
    color: 'black',
    marginBottom: 5,
  },
  image: {
    height: 88.96,
    width: 89.4,
  },
  formContainer: {
    flex: 5,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 1,
    fontFamily: 'Sora-Medium',
    color: 'black',
  },
  input: {
    color: 'black',
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 20,
    fontFamily: 'Sora-Regular',
  },
  continueBtn: {
    backgroundColor: '#F496AC',
    height: 53,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
});

export default RegisterScreen1;
