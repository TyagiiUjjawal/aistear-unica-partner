/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Provider, useDispatch} from 'react-redux';
import {store, persistor} from './Redux/store';
import {onAuthStateChanged} from 'firebase/auth';
import RegisterScreen1 from './Screens/RegisterScreen1';
import RegisterScreen2 from './Screens/RegisterScreen2';
import RegisterScreen3 from './Screens/RegisterScreen3';
import RegisterScreen4 from './Screens/RegisterScreen4';
import ReviewScreen from './Screens/ReviewScreen';
import RegisterScreenUpload from './Screens/RegisterScreenUpload';
import HomeScreen from './Screens/HomeScreen';
import {auth, db} from './Utils/Firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import LoadingScreen from './Components/LoadingScreen';
import LoginScreen from './Screens/LoginScreen';
import SplashScreen from './Screens/SplashScreen';
import VersionCheck from 'react-native-version-check';
import Geolocation from 'react-native-geolocation-service';
import {addInformation, setPartnerId} from './Redux/reducer';
import DetailScreen from './Screens/DetailScreen';
import MapScreen from './Screens/MapScreen';
import CustomHeader from './Components/CustomHeader';
import MainTabNavigator from './Navigation/MainTabNavigator';
import MyRating from './Screens/MyRating';
import AccountScreen from './Screens/AccountScreen';
import RegisterScreenAccount from './Screens/RegisterScreenAccount';
import EditScreen from './Screens/EditScreen';
import HelpDeskScreen from './Screens/HelpDeskScreen';
import QueryScreen from './Screens/QueryScreen';
import QuerySubmission from './Screens/QuerySubmission';
import ForgetPassword from './Screens/ForgetPassword';
import {useNotifications} from './Utils/useNotifications';
import NetInfo from '@react-native-community/netinfo';
import CustomModal from './Components/CustomModal';
import UpdateModal from './Utils/UpdateModal';
import DisabledScreen from './Screens/DisabledScreen';
import PushNotification from 'react-native-push-notification';
import {PersistGate} from 'redux-persist/integration/react';
import NotificationScreen from './Screens/NotificationScreen';

const Stack = createNativeStackNavigator();

const App = () => {
  useNotifications();
  const linking = {
    prefixes: ['aistearunicapartner://'],
    config: {
      screens: {
        home: {
          screens: {
            homeTab: 'home',
            myBooking: 'myBooking',
            payment: 'payment',
            account: 'account',
          },
        },
        login: 'login',
        register1: 'register1',
        register2: 'register2',
        register3: 'register3',
        register4: 'register4',
        registeraccount: 'registeraccount',
        registerUpload: 'registerUpload',
        review: 'review',
        rating: 'rating',
        accounts: 'accounts',
        edit: 'edit',
        query: 'query',
        submitquery: 'submitquery',
        forgetpassword: 'forgetpassword',
        detail: 'detail',
        map: 'map',
        helpdesk: {
          path: 'helpdesk',
        },
      },
    },
  };

  const dispatch = useDispatch();
  const [location, setLocation] = useState({});
  const [address, setAddress] = useState('');
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const [verificationFetched, setVerificationFetched] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isConnected, setIsConnected] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [isUpdateModalVisible, setUpdateModalVisible] = useState(false);
  const [storeUrl, setStoreUrl] = useState('');

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
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      if (!state.isConnected) {
        showModal('You are offline. Please check your network connection.');
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

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

  useEffect(() => {
    function createNotificationChannel() {
      PushNotification.createChannel(
        {
          channelId: 'default-channel-id',
          channelName: 'Default Channel',
          channelDescription: 'A default channel',
          soundName: 'default',
          importance: PushNotification.Importance.HIGH,
          vibrate: true,
        },
        created => console.log(`createChannel returned '${created}'`),
      );
    }

    createNotificationChannel();
  }, []);

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCYDYbrhpUNYw-GmBeHGOxMQQ6E4lA6Zyk`,
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setAddress(data.results[0].formatted_address);
        dispatch(
          addInformation({
            info: {
              fullAddress: data.results[0].formatted_address,
              latitude,
              longitude,
            },
          }),
        );
      } else {
        console.log('Error fetching address:', data.status);
      }
    } catch (error) {
      console.log('Error fetching address:', error);
    }
  };

  useEffect(() => {
    fetchLocation();
  }, []);

  useEffect(() => {
    async function checkUpdate() {
      try {
        const currentVersion = await VersionCheck.getCurrentVersion();

        const partnerDocRef = doc(db, 'Settings', 'Partner');
        const partnerDocSnapshot = await getDoc(partnerDocRef);

        const latestVersion = partnerDocSnapshot.data().latestVersion;

        if (!latestVersion) {
          console.error('Latest version not found in Firestore');
          return;
        }

        const updateCheckResult = await VersionCheck.needUpdate({
          currentVersion: currentVersion,
          latestVersion: latestVersion,
          forceUpdate: false,
        });

        if (updateCheckResult.isNeeded) {
          console.log('Update needed. Store URL:', updateCheckResult.storeUrl);
          // Linking.openURL(updateCheckResult.storeUrl);
          setStoreUrl(updateCheckResult.storeUrl);
          setUpdateModalVisible(true);
        }
      } catch (error) {
        console.error('Error checking for update: ', error);
      }
    }
    checkUpdate();

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (user) {
        setUser(user);
        try {
          let partnerId;
          const q = query(
            collection(db, 'Partners'),
            where('uid', '==', user.uid),
          );
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            querySnapshot.forEach(doc => {
              setIsVerified(doc.data().isVerified);
              setIsDisabled(doc.data().isDisabled);
              partnerId = doc.id;
              dispatch(setPartnerId(partnerId));
            });
          }
          setVerificationFetched(true);
        } catch (error) {
          console.error('Error fetching partner data: ', error);
        }
      } else {
        setUser(null);
        setVerificationFetched(true);
      }
      if (initializing) setInitializing(false);
    });

    return () => unsubscribe();
  }, [initializing]);

  useEffect(() => {
    if (!initializing && verificationFetched) {
      const splashTimeout = setTimeout(() => setShowSplash(false), 2000);
      return () => clearTimeout(splashTimeout);
    }
  }, [initializing, verificationFetched]);

  if (showSplash) return <SplashScreen />;

  const getInitialRouteName = () => {
    if (user) {
      return isVerified && !isDisabled ? 'home' : 'login';
    } else {
      return 'login';
    }
  };

  const handleUpdate = () => {
    setUpdateModalVisible(false);
    Linking.openURL(storeUrl);
  };

  return (
    <NavigationContainer linking={linking}>
      <Stack.Navigator
        initialRouteName={getInitialRouteName()}
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="register1" component={RegisterScreen1} />
        <Stack.Screen name="register2" component={RegisterScreen2} />
        <Stack.Screen name="registerUpload" component={RegisterScreenUpload} />
        <Stack.Screen name="register3" component={RegisterScreen3} />
        <Stack.Screen name="register4" component={RegisterScreen4} />
        <Stack.Screen
          name="registeraccount"
          component={RegisterScreenAccount}
        />
        <Stack.Screen name="review" component={ReviewScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="home" component={MainTabNavigator} />
        <Stack.Screen name="rating" component={MyRating} />
        <Stack.Screen name="accounts" component={AccountScreen} />
        <Stack.Screen name="edit" component={EditScreen} />
        <Stack.Screen name="helpdesk" component={HelpDeskScreen} />
        <Stack.Screen name="query" component={QueryScreen} />
        <Stack.Screen name="submitquery" component={QuerySubmission} />
        <Stack.Screen name="forgetpassword" component={ForgetPassword} />
        <Stack.Screen name="disable" component={DisabledScreen} />
        <Stack.Screen name="notification" component={NotificationScreen} />
        <Stack.Screen
          name="detail"
          component={DetailScreen}
          options={{
            header: () => <CustomHeader title="JOB DETAILS" />,
          }}
        />
        <Stack.Screen name="map" component={MapScreen} />
      </Stack.Navigator>
      <CustomModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={hideModal}
      />
      <UpdateModal
        isVisible={isUpdateModalVisible}
        onConfirm={handleUpdate}
        onClose={() => setUpdateModalVisible(false)}
      />
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
});

const Main = () => {
  useEffect(() => {
    const handleDeepLink = event => {
      const url = event.url;
      console.log('Deep link URL:', url);
    };

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  );
};

export default Main;
