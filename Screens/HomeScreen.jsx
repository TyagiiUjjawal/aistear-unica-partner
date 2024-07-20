/* eslint-disable prettier/prettier */
// Screens/HomeScreen.js
import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  View,
  Text,
  Button,
  Image,
  Touchable,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  BackHandler,
} from 'react-native';
import {getAuth, signOut} from 'firebase/auth';
import {useNavigation} from '@react-navigation/native';
import {app, db} from '../Utils/Firebase';
import offerImage from '../assets/offerImage1.png';
import CardImage from '../assets/CardImage.png';
import BookList from './BookList';
import {useSelector} from 'react-redux';
import {collection, doc, getDoc, getDocs} from 'firebase/firestore';
import Carousel from '../Components/Carousel';
import MyBookingList from './MyBookingList';

const HomeScreen = () => {
  const auth = getAuth(app);
  const navigation = useNavigation();
  const [address, setAddress] = useState('');
  const [fetchingaddress, setFetchingAddress] = useState(false);

  const partnerId = useSelector(state => state.partnerSlice.partnerId);

  const getLastFourWords = address => {
    const words = address.split(' ');
    return words.slice(-6, -2).join(' ');
  };

  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  useEffect(() => {
    const fetchAddress = async () => {
      setFetchingAddress(true);
      if (partnerId) {
        const docRef = doc(db, 'Partners', partnerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const bookingData = docSnap.data();
          const addr = getLastFourWords(bookingData.addressFromMap);
          setAddress(addr);
        } else {
          console.log('No such document!');
        }
      } else {
        console.log('No partner ID found');
      }
      setFetchingAddress(false);
    };

    fetchAddress();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollViewContent}>
        <View style={styles.wrapper}>
          <View style={styles.appBar}>
            <Image
              source={require('../assets/locationLogo.png')}
              style={styles.imageBar}
            />
            {fetchingaddress ? (
              <Text style={styles.searchInput}>fetching address...</Text>
            ) : (
              <Text style={styles.searchInput}>{address}</Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.notifyButton}
            onPress={() => navigation.navigate('notification')}>
            <Image
              source={require('../assets/notifyLogo.png')}
              style={{width: 22, height: 22}}
            />
          </TouchableOpacity>
        </View>
        <View>
          <Carousel />
        </View>
        <View style={styles.centeredContainer}>
          <BookList />
        </View>
        <View style={styles.centeredContainer}>
          <MyBookingList />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  offerImage: {
    width: '100%',
    height: 150,
  },
  wrapper: {
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
    paddingHorizontal: 20,
    marginBottom: 10,
    flexDirection: 'row',
    gap: 10,
    marginHorizontal: 10,
  },
  notifyButton: {
    marginTop: 15,
  },
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: {width: 2, height: 2},
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
    padding: 10,
    marginTop: 20,
    marginBottom: 0,
  },
  searchInput: {
    alignItems: 'center',
    flex: 1,
    marginLeft: 5,
    fontSize: 12,
    color: '#000',
    fontFamily: 'Sora-Regular',
  },
  locationFvtNotifyContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  locationBox: {
    flex: 1,
    height: '50%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {width: 5, height: 2},
    shadowOpacity: 0.9,
    shadowRadius: 0,
    elevation: 1,
    borderStyle: 'solid',
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  locationText: {
    color: 'black',
    marginLeft: 5,
    fontFamily: 'Sora',
    fontSize: 10,
    fontWeight: '400',
    lineHeight: 12.6,
    textAlign: 'center',
  },

  booking: {
    fontSize: 18,
    marginTop: 20,
    color: '#000',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {},
  text: {
    fontSize: 13,
    color: '#333',
    backgroundColor: '#f5f5f5',
    fontWeight: '500',
    marginBottom: 2,
    textAlign: 'left',
    alignSelf: 'flex-start',
    paddingHorizontal: 20,
  },
  detail: {
    marginTop: 3,
    fontSize: 8,
    color: 'white',
    fontFamily: 'Sora-Regular',
  },
  flex: {
    flex: 1,
    flexDirection: 'row',
    color: 'white',
    justifyContent: 'space-between',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingLeft: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    marginBottom: 8,
  },
  Searchinput: {
    flex: 1,
    marginLeft: 10,
    height: 40,
    fontSize: 16,
    color: '#333',
  },
  centeredContainer: {
    alignItems: 'center',
    // marginBottom: 5,
    // backgroundColor: '#546',
    paddingHorizontal: 20,
    flex: 1,
  },
  card: {
    flexDirection: 'row',
    height: 160,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textContainer: {
    flex: 1,
    marginRight: 10,
    padding: 25,
    justifyContent: 'center',
  },
  title: {
    fontSize: 12,
    fontFamily: 'Sora-Bold',
    letterSpacing: 1,
    color: 'white',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 9,
    color: 'white',
    marginBottom: 6,
    fontFamily: 'Sora-Regular',
    lineHeight: 9 * 1.5,
  },
  subtitleBold: {
    fontFamily: 'Sora-Bold',
    fontSize: 9,
    color: 'white',
  },
  imageContainer: {
    width: 120,
    height: 155,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  button: {
    backgroundColor: '#2A2A2A',
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'Sora-Regular',
  },
  imageBar: {width: 20, height: 20},
});

export default HomeScreen;
