/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import {auth, db} from '../Utils/Firebase';
import {doc, getDoc, updateDoc} from 'firebase/firestore';
import {useDispatch, useSelector} from 'react-redux';
import bookings from '../assets/bookings.png';
import creditCard from '../assets/creditCard.png';
import info from '../assets/info.png';
import arrowRight from '../assets/arrowRight.png';
import arrowRightPink from '../assets/arrowRightPink.png';
import privacyPolicy from '../assets/privacyPolicy.png';
import availableImg from '../assets/available.png';
import dollar from '../assets/dollar.png';
import {useNavigation} from '@react-navigation/native';
import {signOut} from 'firebase/auth';
import {setPartnerEmail, setPartnerInfo} from '../Redux/reducer';

const AccountScreen = () => {
  const [partner, setPartner] = useState(null);
  const [reviews, setReviews] = useState([]);
  const partnerId = useSelector(state => state.partnerSlice.partnerId);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const dispatch = useDispatch();

  const toggleModal = () => {
    if (available) {
      setModalMessage(
        'Are you sure you want to change your availability to Not Available? By doing this you will not get bookings from now.',
      );
    } else {
      setModalMessage(
        'By changing your availability to Available, you will start receiving bookings from now.',
      );
    }
    setIsModalVisible(!isModalVisible);
  };

  const handleAvailabilityChange = async isAvailable => {
    setLoading(true);
    try {
      const partnerRef = doc(db, 'Partners', partnerId);
      await updateDoc(partnerRef, {
        isAvailable: isAvailable,
      });
      setAvailable(isAvailable);
      toggleModal();
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const navigation = useNavigation();

  useEffect(() => {
    const fetchPartner = async () => {
      try {
        const docRef = doc(db, 'Partners', partnerId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const partnerData = docSnap.data();
          setPartner(partnerData);
          const sortedReviews = (partnerData.reviews || []).sort((a, b) => {
            return b.timeStamp.toMillis() - a.timeStamp.toMillis();
          });
          // setReviews(partnerData.reviews || []);
          setReviews(sortedReviews);
          setAvailable(partnerData.isAvailable);
          // console.log(partnerData.email);
          // dispatch(setPartnerEmail(partnerData.email));
          dispatch(
            setPartnerInfo({email: partnerData.email, name: partnerData.name}),
          );
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching partner:', error);
      }
    };
    fetchPartner();
  }, [partnerId]);

  if (!partner) {
    return null;
  }

  const onEdit = () => {
    navigation.navigate('edit', {partner});
  };

  const handleLogout = () => {
    signOut(auth);
    navigation.navigate('login');
  };

  return (
    <ScrollView contentContainerStyle={{backgroundColor: '#fff', flex: 1}}>
      <View
        style={{
          backgroundColor: '#F496AC',
          height: 65,
          flexDirection: 'row',
          alignItems: 'start',
          paddingTop: 15,
          width: '100%',
          paddingLeft: 10,
        }}>
        <View style={{flex: 1, marginLeft: 10}}>
          <Text
            style={{
              color: '#FFFFFF',
              fontSize: 16,
              marginTop: 12,
              fontFamily: 'Sora-Medium',
            }}>
            ACCOUNTS
          </Text>
        </View>
      </View>
      <View style={styles.container}>
        <View style={styles.myAccountInfo}>
          <Image source={{uri: partner.photoUrl}} style={styles.profilePhoto} />
          <View style={styles.detailsContainer}>
            <View style={styles.infoSpace}>
              <Text style={styles.name}>{partner.name}</Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => onEdit(partner)}>
                <Text style={styles.editButtonText}>Edit</Text>
                <Image source={arrowRightPink} style={styles.arrowRightPink} />
              </TouchableOpacity>
            </View>
            <View style={styles.infoBox}>
              <Text style={styles.info}>{partner.phoneNumber}</Text>
              <Text style={styles.info}>{partner.email}</Text>
            </View>
          </View>
        </View>
        <View style={styles.nav}>
          <TouchableOpacity
            style={styles.spaceBtn}
            onPress={() => navigation.navigate('rating', {reviews})}>
            <View style={styles.top}>
              <View>
                <Image source={creditCard} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>My Reviews</Text>
                <Text style={styles.subtitle}>Reviews from user</Text>
              </View>
            </View>
            <View>
              <Image source={arrowRight} style={styles.infoImage} />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.spaceBtn}
            onPress={() => navigation.navigate('myBooking')}>
            <View style={styles.top}>
              <View>
                <Image source={bookings} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>My Bookings</Text>
                <Text style={styles.subtitle}>Check your booking</Text>
              </View>
            </View>
            <Image source={arrowRight} style={styles.infoImage} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.spaceBtn} onPress={toggleModal}>
            <View style={styles.top}>
              <View>
                <Image source={availableImg} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>Availability</Text>
                <Text style={styles.subtitle}>
                  Currently you are {available ? 'Available' : 'Not Available'}
                </Text>
              </View>
            </View>
            <Image source={arrowRight} style={styles.infoImage} />
          </TouchableOpacity>

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={toggleModal}>
            <View style={styles.modalContainer}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Change Availability</Text>
                <Text style={styles.modalMessage}>{modalMessage}</Text>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleAvailabilityChange(!available)}>
                  <Text style={styles.modalButtonText}>OK</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={toggleModal}>
                  <Text style={styles.closeButtonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity
            style={styles.spaceBtn}
            onPress={() => navigation.navigate('payment')}>
            <View style={styles.top}>
              <View>
                <Image source={dollar} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>My Earnings</Text>
                <Text style={styles.subtitle}>Check your earnings</Text>
              </View>
            </View>
            <Image source={arrowRight} style={styles.infoImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.spaceBtn}
            onPress={() => navigation.navigate('helpdesk')}>
            <View style={styles.top}>
              <View>
                <Image source={info} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>HelpDesk</Text>
                <Text style={styles.subtitle}>Have any question?</Text>
              </View>
            </View>
            <Image source={arrowRight} style={styles.infoImage} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.spaceBtn}
            onPress={() => navigation.navigate('myBooking')}>
            <View style={styles.top}>
              <View>
                <Image source={privacyPolicy} style={styles.icons} />
              </View>
              <View>
                <Text style={styles.title}>Privacy Policy</Text>
                <Text style={styles.subtitle}>
                  Privacy Policy, Terms of Services, Licenses
                </Text>
              </View>
            </View>
            <Image source={arrowRight} style={styles.infoImage} />
          </TouchableOpacity>
        </View>
        <View style={styles.Nav}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log out</Text>
          </TouchableOpacity>
        </View>

        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#F496AC" />
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    marginTop: 20,
  },
  myAccountInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#fff',
  },
  profilePhoto: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10,
  },
  detailsContainer: {
    flex: 1,
  },
  name: {
    fontSize: 19,
    fontFamily: 'Sora-Bold',
    color: '#000',
  },
  info: {
    fontSize: 13,
    color: '#8F90A6',
    fontFamily: 'Sora-Regular',
  },
  editButton: {
    flexDirection: 'row',
    paddingVertical: 5,
    alignItems: 'center',
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  editButtonText: {
    color: '#F496AC',
    fontSize: 14,
    fontFamily: 'Sora-Regular',
  },
  infoBox: {
    flexDirection: 'row',
    gap: 20,
  },
  infoSpace: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  Nav: {
    paddingHorizontal: 20,
  },
  arrowRightPink: {
    height: 14,
    width: 14,
  },
  nav: {
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 'auto',
  },
  spaceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 15,
  },
  top: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 15,
    color: '#1C1C28',
    fontFamily: 'Sora-SemiBold',
  },
  subtitle: {
    fontSize: 11,
    color: '#8F90A6',
    fontFamily: 'Sora-Light',
  },
  infoImage: {
    height: 20,
    width: 20,
    tintColor: '#8F90A6',
  },
  logoutButton: {
    marginTop: 'auto',
    backgroundColor: '#F496AC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-SemiBold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: '#000',
    fontFamily: 'Sora-SemiBold',
  },
  modalMessage: {
    fontSize: 13,
    marginBottom: 20,
    color: '#000',
    textAlign: 'justify',
    fontFamily: 'Sora-Regular',
  },
  modalButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#F496AC',
    borderRadius: 5,
    marginBottom: 10,
    alignItems: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  closeButton: {
    width: '100%',
    padding: 10,
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  icons: {
    height: 25,
    width: 25,
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 1,
    elevation: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AccountScreen;
