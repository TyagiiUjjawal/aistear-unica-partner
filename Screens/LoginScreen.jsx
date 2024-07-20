/* eslint-disable prettier/prettier */
import React, {useState, useEffect} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  BackHandler,
  ActivityIndicator,
  Alert,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation} from '../Redux/reducer';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {auth, db} from '../Utils/Firebase';
import {collection, query, where, getDocs, updateDoc} from 'firebase/firestore';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {useWindowDimensions} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import messaging from '@react-native-firebase/messaging';

const LoginScreen = () => {
  const windowWidth = useWindowDimensions().width;
  const dashCount = Math.floor(windowWidth / 6 / 6);
  const dashes = '-'.repeat(dashCount);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  GoogleSignin.configure({
    webClientId:
      '780782493776-tn93jkar4q5psvt9vs7rab9okhrat79j.apps.googleusercontent.com',
    androidClientId:
      '780782493776-tn93jkar4q5psvt9vs7rab9okhrat79j.apps.googleusercontent.com',
    scopes: ['profile', 'email'],
  });

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const nav = useNavigation();

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  const handleChange = (field, value) => {
    setFormData({...formData, [field]: value});
  };

  const handleContinue = async () => {
    try {
      setLoading(true);
      if (!formData.email || !formData.password) {
        notifyMessage('Enter Required Fields');
        setLoading(false);
        return;
      }
      const isValidEmail = email => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
      };

      if (!isValidEmail(formData.email)) {
        notifyMessage('Invalid email format');
        setLoading(false);
        return;
      }

      if (formData.password.length < 6) {
        notifyMessage('Password must be at least 6 characters long');
        setLoading(false);
        return;
      }

      const {user} = await signInWithEmailAndPassword(
        auth,
        formData.email,
        formData.password,
      );
      const q = query(collection(db, 'Partners'), where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      if (querySnapshot.empty) {
        notifyMessage(
          'No Partner associated with this email. Kindly Register to access the Partner Panel',
        );
        await signOut(auth);
        setLoading(false);
        return;
      }
      const userRef = querySnapshot.docs[0].ref;

      const fcmToken = await messaging().getToken();
      console.log('FCM Token saved from login', fcmToken);
      await updateDoc(userRef, {fcmToken});

      let isVerified = false;
      let isDisabled = false;
      querySnapshot.forEach(doc => {
        isVerified = doc.data().isVerified;
        isDisabled = doc.data().isDisabled;
      });

      if (isVerified) {
        if (!isDisabled) {
          nav.navigate('home');
        } else {
          nav.navigate('disable');
          notifyMessage('Your Account is blocked!');
        }
      } else {
        notifyMessage(
          'Partner Account is not verified. Kindly wait or contact our Support Team',
        );
        await signOut(auth);
      }
    } catch (e) {
      if (e.code === 'auth/invalid-credential') {
        notifyMessage('Wrong Email/Password, kindly try again');
      } else if (e.code === 'auth/user-not-found') {
        notifyMessage(
          'No Partner associated with this email. Kindly Register to access the Partner Panel',
        );
      } else {
        notifyMessage('An error occurred. Please try again.', e.code);
      }
      console.log('error:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <View style={styles.container}>
        {!keyboardVisible && (
          <View style={styles.topContainer}>
            <Text style={styles.beaTxt}>Be a</Text>
            <Text style={styles.aistearPartnerTxt}>Aistear Unica Partner</Text>
            <Text style={styles.bringTxt}>Bring a smile on someone’s face</Text>
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => nav.navigate('register1')}>
              <Text style={styles.registerBtnTxt}>Register now</Text>
            </TouchableOpacity>
          </View>
        )}
        {!keyboardVisible && (
          <View style={styles.middleContainer}>
            <Text style={styles.middleTxt1}>Start Earning.</Text>
            <Text style={styles.middleTxt2}>
              Registering yourself as Aistear partner.
            </Text>
          </View>
        )}

        <View style={styles.signInHeadContainer}>
          <Text
            style={styles.headText}>{`${dashes} Login/SignUp ${dashes}`}</Text>
        </View>

        <View style={styles.formContainer}>
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
          <TouchableOpacity onPress={handleContinue} style={styles.continueBtn}>
            {loading ? (
              <ActivityIndicator size={'small'} color={'#fff'} />
            ) : (
              <Text style={styles.continueBtnTxt}>Continue</Text>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => nav.navigate('forgetpassword')}>
            <Text style={styles.forgetpassword}>Forget Password?</Text>
          </TouchableOpacity>
        </View>
        {!keyboardVisible && (
          <View style={styles.policyContainer}>
            <Text style={styles.policyTxt1}>
              By continuing you agree to our{' '}
            </Text>
            <Text style={styles.policyTxt2}>
              Terms of Service, Privacy Policy, Content Policy
            </Text>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  topContainer: {
    flex: 1.5,
    paddingTop: 20,
    paddingHorizontal: 20,
  },
  beaTxt: {
    fontFamily: 'Sora-Bold',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 40.32,
    textAlign: 'left',
    color: 'black',
  },
  aistearPartnerTxt: {
    marginTop: 3,
    fontFamily: 'Sora-Bold',
    fontSize: 28,
    fontWeight: '600',
    lineHeight: 40.32,
    textAlign: 'left',
    color: 'black',
  },
  bringTxt: {
    marginTop: 3,
    fontFamily: 'Sora-Bold',
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18.9,
    textAlign: 'left',
    color: 'black',
  },
  registerBtn: {
    marginTop: 3,
    height: 42,
    width: 253,
    backgroundColor: '#F496AC',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerBtnTxt: {
    fontSize: 13,
    fontFamily: 'Sora-Regular',
    lineHeight: 16.38,
    textAlign: 'left',
    color: 'white',
  },
  middleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  middleTxt1: {
    fontFamily: 'Sora-Medium',
    fontSize: 20,
    lineHeight: 25.2,
    textAlign: 'left',
    color: 'black',
  },
  middleTxt2: {
    fontFamily: 'Sora-Medium',
    marginTop: 3,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 18.9,
    textAlign: 'left',
    color: 'black',
  },
  signInHeadContainer: {
    flex: 0.5,
    justifyContent: 'flex-end',
    marginBottom: 50,
    alignItems: 'center',
  },
  headText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20.16,
    textAlign: 'center',
    color: '#A2A2A2',
  },
  formContainer: {
    flex: 2.8,
    paddingHorizontal: 10,
    paddingVertical: 20,
    flexDirection: 'column',
    borderWidth: 2,
    borderColor: '#C0C0C0',
    marginHorizontal: 10,
  },
  forgetpassword: {
    color: '#000',
    fontSize: 12,
    marginTop: 5,
    marginLeft: 'auto',
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
    marginBottom: 15,
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
  googleBtn: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  policyContainer: {
    flex: 0.7,
    paddingHorizontal: 20,
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 10,
  },
  policyTxt1: {
    fontFamily: 'Sora-Medium',
    fontSize: 12.13,
    fontWeight: '600',
    lineHeight: 15.28,
    textAlign: 'center',
    color: '#858585',
  },
  policyTxt2: {
    fontFamily: 'Sora-Medium',
    fontSize: 12.13,
    fontWeight: '600',
    lineHeight: 15.28,
    textAlign: 'center',
    color: '#858585',
  },
});

export default LoginScreen;
