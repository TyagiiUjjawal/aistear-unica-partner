/* eslint-disable react-native/no-inline-styles */
/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import CustomHeader from '../Components/CustomHeader';
import {launchImageLibrary} from 'react-native-image-picker';
import {
  collection,
  doc,
  getDoc,
  setDoc,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';
import {app, db} from '../Utils/Firebase';
import {useDispatch, useSelector} from 'react-redux';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes,
  uploadBytesResumable,
} from 'firebase/storage';
import Geolocation from 'react-native-geolocation-service';
import camera from '../assets/camera.png';
import {addInformation} from '../Redux/reducer';
import {useNavigation} from '@react-navigation/native';

const RadioButton = ({selected, onPress, children}) => {
  return (
    <TouchableOpacity style={styles.radioContainer} onPress={onPress}>
      <View style={styles.outerCircle}>
        {selected ? <View style={styles.innerCircle} /> : null}
      </View>
      <Text style={styles.radioText}>{children}</Text>
    </TouchableOpacity>
  );
};

const Tooltip = ({isVisible, text}) => {
  if (!isVisible) return null;

  return (
    <View style={[styles.tooltipContainer]}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
};
const TooltipEmail = ({isVisible, text}) => {
  if (!isVisible) return null;

  return (
    <View style={[styles.tooltipContainer]}>
      <Text style={styles.tooltipText}>{text}</Text>
    </View>
  );
};

export default function EditScreen({route}) {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [tooltipVisibleEmail, setTooltipVisibleEmail] = useState(false);
  const [tooltipText, setTooltipText] = useState('');
  const [tooltipTextEmail, setTooltipTextEmail] = useState('');

  const {partner} = route.params;
  const partnerId = useSelector(state => state.partnerSlice.partnerId);
  const nav = useNavigation();
  const [name, setName] = useState(partner.name || '');
  const [email, setEmail] = useState(partner.email || '');
  const [address, setAddress] = useState(partner.fullAddress || '');
  const [mobile, setMobile] = useState(partner.phoneNumber || '');
  const [imageUri, setImageUri] = useState(partner.photoUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [editPhoto, setEditPhoto] = useState(null);
  const [isLocationEdit, setIsLocationEdit] = useState('no');
  const [addressFromMap, setAddressFromMap] = useState('');
  const dispatch = useDispatch();

  const handleSelectImage = () => {
    launchImageLibrary(
      {mediaType: 'photo', maxWidth: 300, maxHeight: 300},
      response => {
        if (response.didCancel) {
          console.log('User cancelled image picker');
        } else if (response.errorMessage) {
          console.log('ImagePicker Error: ', response.errorMessage);
        } else if (response.assets && response.assets.length > 0) {
          const selectedImage = response.assets[0];
          setImageUri(selectedImage.uri);
          setEditPhoto(selectedImage);
        }
      },
    );
  };

  const fetchLocation = () => {
    return new Promise((resolve, reject) => {
      Geolocation.getCurrentPosition(
        position => {
          const {latitude, longitude} = position.coords;
          resolve({latitude, longitude});
        },
        error => {
          reject(error);
        },
        {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
      );
    });
  };

  const updateFile = async image => {
    const storage = getStorage(app);
    const storageRef = ref(storage, `Partners/${partnerId}/image.jpg`);

    const response = await fetch(image.uri);
    const blob = await response.blob();

    try {
      await uploadBytes(storageRef, blob);
      console.log('File successfully updated!');
      const downloadURL = await getDownloadURL(storageRef);
      setImageUri(downloadURL);
      return downloadURL;
    } catch (error) {
      console.error('Error updating file');
      throw error;
    }
  };

  const handleSaveDetails = async () => {
    setIsLoading(true);
    try {
      const location = await fetchLocation();
      const {latitude, longitude} = location;

      let photoUrl = imageUri;
      if (editPhoto) {
        photoUrl = await updateFile(editPhoto);
      }

      const queryRef = doc(db, 'Partners', partnerId);

      const dataToUpdate = {
        name,
        // phoneNumber: mobile,
        photoUrl,
        fullAddress: address,
      };

      if (isLocationEdit === 'yes') {
        const response = await fetchAddress(latitude, longitude);
        // console.log('addressFromMap');
        // console.log(response);
        // console.log('location updated');
        dataToUpdate.latitude = latitude;
        dataToUpdate.longitude = longitude;
        dataToUpdate.addressFromMap = response;
      }

      await updateDoc(queryRef, dataToUpdate);
      nav.navigate('account');
      // console.log('Details saved');
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAddress = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyCYDYbrhpUNYw-GmBeHGOxMQQ6E4lA6Zyk`,
      );
      const data = await response.json();
      if (data.status === 'OK') {
        setAddressFromMap(data.results[0].formatted_address);
        dispatch(
          addInformation({
            info: {
              fullAddress: data.results[0].formatted_address,
              latitude,
              longitude,
            },
          }),
        );

        console.log('Address:', data.results[0].formatted_address);
        return data.results[0].formatted_address;
      } else {
        console.log('Error fetching address:', data.status);
      }
    } catch (error) {
      console.log('Error fetching address:', error);
    }
  };

  const handleTooltipPress = text => {
    setTooltipVisible(true);
    setTooltipText(text);

    setTimeout(() => {
      setTooltipVisible(false);
    }, 3000);
  };

  const handleTooltipPressEmail = text => {
    setTooltipVisibleEmail(true);
    setTooltipTextEmail(text);

    setTimeout(() => {
      setTooltipVisibleEmail(false);
    }, 3000);
  };

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1, backgroundColor: '#fff'}}>
      <View style={styles.container}>
        <CustomHeader title="Edit Profile" />
        <View style={styles.imageContainer}>
          <TouchableOpacity onPress={handleSelectImage}>
            <View style={styles.imageCircle}>
              <Image source={{uri: imageUri}} style={styles.image} />
            </View>
            <View style={styles.smallImageContainer}>
              <Image source={camera} style={styles.smallImage} />
            </View>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          onPress={() =>
            handleTooltipPress(
              'If u want to change mobile or email, then raise a ticket',
            )
          }
          style={styles.inputContainerDisabled}>
          <Text style={styles.label}>MOBILE</Text>
          <View>
            <Text style={styles.disabledInput}>{mobile}</Text>
          </View>
          <Tooltip isVisible={tooltipVisible} text={tooltipText} />
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>NAME</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <TouchableOpacity
          onPress={() =>
            handleTooltipPressEmail(
              'If u want to change mobile or email, then raise a ticket',
            )
          }
          style={styles.inputContainerDisabled}>
          <Text style={styles.label}>EMAIL ADDRESS</Text>
          <View>
            <Text style={styles.disabledInput}>{email}</Text>
          </View>
          <TooltipEmail
            isVisible={tooltipVisibleEmail}
            text={tooltipTextEmail}
          />
        </TouchableOpacity>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>ADDRESS</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your address"
            value={address}
            onChangeText={setAddress}
          />
        </View>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            Do you want to set current location as service location?
          </Text>
          <View style={styles.flexRow}>
            <RadioButton
              selected={isLocationEdit === 'yes'}
              onPress={() => setIsLocationEdit('yes')}>
              Yes
            </RadioButton>
            <RadioButton
              selected={isLocationEdit === 'no'}
              onPress={() => setIsLocationEdit('no')}>
              No
            </RadioButton>
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveDetails}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Save Details</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  imageContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  imageCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  imageText: {
    color: '#8f8f8f',
  },
  inputContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
    marginTop: 10,
    color: '#E9E9E9',
  },
  inputContainerDisabled: {
    marginHorizontal: 10,
    marginBottom: 10,
    marginTop: 5,
    color: '#E9E9E9',
    padding: 10,
    position: 'relative',
  },
  label: {
    fontSize: 16,
    color: '#CBCBCB',
    fontFamily: 'Sora-Bold',
  },
  input: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    paddingVertical: 0,
    color: '#000',
    fontSize: 14,
    fontFamily: 'Sora-Regular',
  },
  disabledInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#E9E9E9',
    paddingVertical: 3,
    color: '#000',
    fontSize: 14,
    paddingTop: 15,
    paddingLeft: 5,
    fontFamily: 'Sora-Regular',
  },
  saveButton: {
    backgroundColor: '#F496AC',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    marginTop: 'auto',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-SemiBold',
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  outerCircle: {
    height: 24,
    width: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  innerCircle: {
    height: 12,
    width: 12,
    borderRadius: 6,
    backgroundColor: '#000',
  },
  radioText: {
    fontSize: 15,
    color: '#000000',
    fontFamily: 'Sora-Regular',
  },
  flexRow: {
    gap: 20,
    marginTop: 10,
    flexDirection: 'row',
  },
  smallImage: {
    height: 22,
    width: 22,
    backgroundColor: '#F0F0F0',
    tintColor: '#000',
    zIndex: 20,
  },
  smallImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    width: 40,
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: '#F0F0F0',
    borderRadius: 50,
  },
  tooltipContainer: {
    position: 'absolute',
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: '#666',
    borderRadius: 5,
    zIndex: 1,
    top: 5,
    left: 10,
    opacity: 0.7,
  },
  tooltipText: {
    fontSize: 12,
    color: '#fff',
    fontFamily: 'Sora-Regular',
  },
});
