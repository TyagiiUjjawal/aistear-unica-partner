/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioButton from '../Utils/RadioButton';
import {useNavigation} from '@react-navigation/native';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation} from '../Redux/reducer';
import axios from 'axios';

const RegisterScreen2 = () => {
  const nav = useNavigation();
  const data = useSelector(state => state.partnerSlice.info);
  const dispatch = useDispatch();
  const [emergencyContact, setEmergencyContact] = useState('');
  const [referralName, setReferralName] = useState('');
  const [distanceTravel, setDistanceTravel] = useState('');
  const [pincode, setPincode] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  const handleContinue = async () => {
    if (!emergencyContact) {
      notifyMessage('Please provide an emergency contact');
      return;
    } else {
      if (data.phoneNumber !== emergencyContact) {
        setEmergencyContact(emergencyContact);
      } else {
        notifyMessage('Emergency Number and Phone Number is same');
        return;
      }
    }
    if (!distanceTravel) {
      notifyMessage('Please provide the distance you will travel');
      return;
    }
    if (!pincode) {
      notifyMessage('Please provide a pincode');
      return;
    }

    if (!fullAddress) {
      notifyMessage('Please provide a full address');
      return;
    } else {
      // const arr = fullAddress.split(' ');
      // if (arr.length < 5) {
      //   notifyMessage('Provide at least 5 letter in Address field');
      //   return;
      // }
      const letterCount = fullAddress.replace(/[^a-zA-Z]/g, '').length;
      if (letterCount < 5) {
        notifyMessage('Provide at least 5 letters in Address field');
        return false;
      }
    }

    if (!emergencyContact || !distanceTravel || !pincode || !fullAddress) {
      return;
    }

    if (!emergencyContact) {
      notifyMessage('emergencyContact is required');
      return;
    } else if (emergencyContact.length !== 10) {
      notifyMessage('emergencyContact must be 10 digits');
      return;
    }

    if (!fullAddress) {
      notifyMessage('Address is required');
      return;
    }

    if (distanceTravel >= 25) {
      notifyMessage('Distance Travel must be less than 25 Kms');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `https://india-pincode-with-latitude-and-longitude.p.rapidapi.com/api/v1/pincode/${pincode}`,
        {
          method: 'GET',

          headers: {
            'X-RapidAPI-Key':
              'f124f1d4b3msh88b845451b505a0p18243bjsnce20548aafe4',
            'X-RapidAPI-Host':
              'india-pincode-with-latitude-and-longitude.p.rapidapi.com',
          },
        },
      );
      const json = await res.json();
      const district = json[0].district;
      const state = json[0].state;
      dispatch(
        addInformation({
          emergencyContact,
          referralName,
          distanceCanTravel: distanceTravel,
          pincode,

          fullAddress,
          district,
          state,
        }),
      );

      nav.navigate('register3');
    } catch (e) {
      notifyMessage('Your PinCode is Wrong, please try again...', e);
      console.log('error during fetch postal info:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.label}>Emergency Contact</Text>
            <TextInput
              style={styles.input}
              placeholder="Emergency Contact"
              placeholderTextColor="#ABABAB"
              autoCapitalize="none"
              keyboardType="number-pad"
              onChangeText={setEmergencyContact}
            />
            <Text style={styles.label}>Referral name</Text>
            <TextInput
              style={styles.input}
              placeholder="Referral name"
              placeholderTextColor="#ABABAB"
              onChangeText={setReferralName}
            />
            <Text style={styles.label}>Distance can travel (in km)</Text>
            <TextInput
              style={styles.input}
              placeholder="Distance"
              placeholderTextColor="#ABABAB"
              keyboardType="numeric"
              onChangeText={setDistanceTravel}
            />
            <Text style={styles.label}>Service Address</Text>
            <TextInput
              style={styles.input}
              placeholder="Address"
              placeholderTextColor="#ABABAB"
              onChangeText={setFullAddress}
            />
            <Text style={styles.label}>Pincode</Text>
            <TextInput
              style={styles.input}
              placeholder="Pincode"
              placeholderTextColor="#ABABAB"
              keyboardType="numeric"
              onChangeText={setPincode}
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  formContainer: {
    flex: 1,
    marginTop: 60,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  label: {
    marginBottom: 1,
    fontFamily: 'Sora-Medium',
    color: 'black',
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 20,
    color: 'black',
    fontFamily: 'Sora-Regular',
  },
  continueBtn: {
    backgroundColor: '#F496AC',
    height: 53,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    top: 12,
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
  heading: {
    fontFamily: 'Sora',
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 30.24,
    color: 'black',
    marginBottom: 12,
  },
});

export default RegisterScreen2;
