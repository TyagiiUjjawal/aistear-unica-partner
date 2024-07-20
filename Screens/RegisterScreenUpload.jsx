/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker, {pick} from 'react-native-document-picker';
import RNFetchBlob from 'rn-fetch-blob';
import {useNavigation} from '@react-navigation/native';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable,
} from 'firebase/storage';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation, setPartnerId} from '../Redux/reducer';
import {getFirestore, collection, doc, setDoc} from 'firebase/firestore';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import {app, auth, db} from '../Utils/Firebase';
import {signOut} from 'firebase/auth';
import {set} from 'firebase/database';
import {Timestamp} from '@firebase/firestore';
import messaging from '@react-native-firebase/messaging';

const RegisterScreenUpload = () => {
  const storage = getStorage(app);
  const dispatch = useDispatch();
  const userInfo = useSelector(state => state.partnerSlice.info);

  const timestamp = Math.floor(Date.now() / 1000);
  const partnerId = `PID${timestamp}`;

  const nav = useNavigation();

  const data = useSelector(state => state.partnerSlice.info);

  const [imageUri, setImageUri] = useState('');
  const [aadharUri, setAadharUri] = useState('');
  const [panUri, setPanUri] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [aadharUrl, setAadharUrl] = useState('');
  const [panUrl, setPanUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [panCardNumber, setPanCardNumber] = useState('');
  const [aadharCardNumber, setAadharCardNumber] = useState('');
  const [panFileName, setPanFileName] = useState('');
  const [aadharFileName, setAadharFileName] = useState('');

  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [imageFileExtension, setImageFileExtension] = useState('');
  const [aadharFileExtension, setAadharFileExtension] = useState('');
  const [panFileExtension, setPanFileExtension] = useState('');

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

  const saveDataToFirestore = async info => {
    const additionalFields = {
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
      isVerified: false,
      isDisabled: false,
      uid: userInfo.uid,
    };
    const newinfo = {
      name: info.name,
      email: info.email,
      accountHolderName: info.accountHolderName,
      ifscCode: info.ifscCode,
      accountNumber: info.accountNumber,
      phoneNumber: info.phoneNumber,
      emergencyContact: info.emergencyContact,
      referralName: info.referralName,
      distanceCanTravel: info.distanceCanTravel,
      pincode: info.pincode,

      photoUrl: info.photoUrl,
      aadharCardUrl: info.aadharCardUrl,
      panCardUrl: info.panCardUrl,
      expertIn: info.expertIn,
      experience: info.experience,
      aadharNumber: aadharCardNumber,
      isAvailable: true,
      fullAddress: info.fullAddress,
      panCardNumber: panCardNumber,
      district: info.district,
      state: info.state,
      latitude: info.latitude,
      longitude: info.longitude,
      addressFromMap: info.address,
      fcmToken: info.fcmToken,
    };
    const filteredNewInfo = Object.fromEntries(
      Object.entries(newinfo).filter(([key, value]) => value !== undefined),
    );
    const dataToSave = {...filteredNewInfo, ...additionalFields};

    try {
      await setDoc(doc(db, 'Partners', partnerId), dataToSave);
      dispatch(setPartnerId(partnerId));
    } catch (error) {
      notifyMessage('Problem saving data');
      console.error('Error saving data: ', error);
    }
  };

  const uriToBlob = uri => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.onload = function () {
        resolve(xhr.response);
      };
      xhr.onerror = function () {
        reject(new Error('uriToBlob failed'));
      };
      xhr.responseType = 'blob';
      xhr.open('GET', uri, true);
      xhr.send(null);
    });
  };

  const uploadFileToFirebase = async (uri, fileName, type) => {
    try {
      const storageRef = ref(storage, `Partners/${partnerId}/${fileName}`);
      const blob = await uriToBlob(uri);
      const snapshot = await uploadBytesResumable(storageRef, blob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (type === 'photo') {
        setImageUrl(downloadURL);
        console.log('image url', imageUrl);
      } else if (type === 'aadharCard') {
        setAadharUrl(downloadURL);
        console.log('aadhar url', aadharUrl);
      } else if (type === 'panCard') {
        console.log('pancard url', panUrl);
        setPanUrl(downloadURL);
      }

      return downloadURL;
    } catch (error) {
      console.error('Error uploading file to Firebase:', error);
      throw error;
    }
  };

  const uploadFileOnPressHandler = async type => {
    try {
      const pickedFile = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      });
      console.log('pickedFile', pickedFile);

      const fileExtension = pickedFile.name.split('.').pop();

      if (type === 'aadhar') {
        setAadharUri(pickedFile.uri);
        setAadharFileName(pickedFile.name);
        setAadharFileExtension(fileExtension); // Store the file extension
      } else {
        setPanFileName(pickedFile.name);
        setPanUri(pickedFile.uri);
        setPanFileExtension(fileExtension); // Store the file extension
      }
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        console.log(err);
      } else {
        console.error(err);
        throw err;
      }
    }
  };

  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      maxWidth: 300,
      maxHeight: 300,
      quality: 0.8,
      saveToPhotos: true,
    };

    ImagePicker.launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log('User cancelled selecting photo');
      } else if (response.errorCode) {
        console.error('ImagePicker Error: ', response.errorCode);
        Alert.alert('Error', 'Failed to select photo. Please try again.');
      } else {
        const selectedImage = response.assets[0];
        const fileExtension = selectedImage.fileName.split('.').pop(); // Extract file extension
        setImageUri(selectedImage.uri);
        setImageFileExtension(fileExtension); // Store the file extension
      }
    });
  };

  const handleContinue = async () => {
    try {
      setLoading(true);

      if (!imageUri) {
        setLoading(false);
        notifyMessage('please upload profile image');
        return;
      }

      if (!panCardNumber) {
        setLoading(false);
        notifyMessage('Pan Card Number is required');
        return;
      } else if (panCardNumber.length != 10) {
        setLoading(false);
        notifyMessage('please provide a valid Pan Card');
        return;
      }

      if (!panUri) {
        setLoading(false);
        notifyMessage('please upload pan card');
        return;
      }

      if (!aadharUri) {
        setLoading(false);
        notifyMessage('please upload aadhar card');
        return;
      }

      if (!aadharCardNumber) {
        setLoading(false);
        notifyMessage('Aadhar Card Number is required');
        return;
      } else if (aadharCardNumber.length !== 12) {
        setLoading(false);
        notifyMessage('Aadhar must be 12 digits');
        return;
      }

      notifyMessage('Do not close the App');

      let uploadedImageUrl = '';
      let uploadedAadharUrl = '';
      let uploadedPanUrl = '';

      const uploads = [];

      if (imageUri) {
        uploads.push(
          uploadFileToFirebase(
            imageUri,
            `image.${imageFileExtension}`,
            'photo',
          ).then(url => (uploadedImageUrl = url)),
        );
      }
      if (aadharUri) {
        uploads.push(
          uploadFileToFirebase(
            aadharUri,
            `aadhar.${aadharFileExtension}`,
            'aadharCard',
          ).then(url => (uploadedAadharUrl = url)),
        );
      }
      if (panUri) {
        uploads.push(
          uploadFileToFirebase(
            panUri,
            `pan.${panFileExtension}`,
            'panCard',
          ).then(url => (uploadedPanUrl = url)),
        );
      }

      // Wait for all uploads to complete
      await Promise.all(uploads);
      const fcmToken = await messaging().getToken();

      const updatedData = {
        photoUrl: uploadedImageUrl,
        aadharCardUrl: uploadedAadharUrl,
        panCardUrl: uploadedPanUrl,
        aadharCardNumber,
        panCardNumber,
        fcmToken,
      };

      dispatch(addInformation(updatedData));
      console.log(updatedData);
      await saveDataToFirestore({...data, ...updatedData});
      await signOut(auth);
      nav.navigate('review');
    } catch (e) {
      console.error(e);
      if (e.code === 'auth/invalid-credential') {
        notifyMessage('Wrong Email/Password, kindly try again');
      } else if (e.code === 'auth/user-not-found') {
        notifyMessage(
          'No Seller associated with this email. Kindly Register to access the Seller Panel',
        );
      } else {
        notifyMessage('An error occurred. Please try again.', e.code);
      }
    } finally {
      setLoading(false);
    }
  };

  const capitalize = str => {
    if (typeof str !== 'string') return '';
    let newstr;
    for (let index = 0; index < str.length; index++) {
      newstr += str[index].toUpperCase();
    }
    console.log(newstr);
    return newstr;
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView style={{flex: 1}} contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.headingContainer}>
            <Text style={styles.heading}>Upload Documents</Text>
          </View>
          <View style={styles.formContainer}>
            <View style={{flex: 1}}>
              <Text style={styles.label}>Passport Size photograph</Text>
              {imageUri != '' ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Image
                    source={{uri: imageUri}}
                    style={{height: 146, width: 136}}
                  />
                </View>
              ) : (
                <TouchableOpacity
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: 4,
                    marginBottom: 4,
                  }}
                  onPress={selectImage}>
                  <View
                    style={{
                      height: 146,
                      width: 136,
                      backgroundColor: '#EDEDED',
                      flex: 1,
                      justifyContent: 'center',
                      alignItems: 'center',
                      flexDirection: 'row',
                    }}>
                    <Image
                      source={require('../assets/imageUpload.png')}
                      style={{height: 20, width: 20, margin: 2, opacity: 0.3}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Sora-Regular',
                        fontSize: 14,
                        lineHeight: 17.64,
                        color: '#ABABAB',
                      }}>
                      Upload
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>
            <View style={{flex: 1}}>
              <Text style={styles.label}>PAN Card Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Pan Card Number"
                placeholderTextColor="#ABABAB"
                autoCapitalize="characters"
                onChangeText={v => {
                  setPanCardNumber(v.toUpperCase());
                }}
              />

              {panUri == '' ? (
                <TouchableOpacity
                  onPress={async () => uploadFileOnPressHandler('pan')}
                  style={{
                    height: 86,
                    width: '100%',
                    justifyContent: 'flex-start',
                    paddingLeft: 20,
                    alignItems: 'center',
                    flexDirection: 'row',
                    backgroundColor: '#EDEDED',
                  }}>
                  <Image
                    source={require('../assets/imageUpload.png')}
                    style={{height: 20, width: 20, margin: 2, opacity: 0.3}}
                  />
                  <Text
                    style={{
                      fontFamily: 'Sora-Regular',
                      fontSize: 14,
                      lineHeight: 17.64,
                      color: '#ABABAB',
                    }}>
                    Pdf upload
                  </Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity>
                  <View
                    style={{
                      height: 86,
                      width: '100%',
                      justifyContent: 'flex-start',
                      paddingLeft: 20,
                      alignItems: 'center',
                      flexDirection: 'row',
                      backgroundColor: '#EDEDED',
                    }}>
                    <Image
                      source={require('../assets/pdfIcon.png')}
                      style={{height: 40, width: 40, margin: 2, opacity: 1}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Sora-Regular',
                        fontSize: 14,
                        lineHeight: 17.64,
                        color: '#ABABAB',
                      }}>
                      {panFileName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            <View style={{flex: 1}}>
              <Text style={styles.label}>Aadhar Card Details</Text>
              <TextInput
                style={styles.input}
                placeholder="Aadhar Card Number"
                placeholderTextColor="#ABABAB"
                onChangeText={v => setAadharCardNumber(v)}
              />

              {aadharUri == '' ? (
                <TouchableOpacity
                  onPress={async () => uploadFileOnPressHandler('aadhar')}>
                  <View
                    style={{
                      height: 86,
                      width: '100%',
                      justifyContent: 'flex-start',
                      paddingLeft: 20,
                      alignItems: 'center',
                      flexDirection: 'row',
                      backgroundColor: '#EDEDED',
                    }}>
                    <Image
                      source={require('../assets/imageUpload.png')}
                      style={{height: 20, width: 20, margin: 2, opacity: 0.3}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Sora-Regular',
                        fontSize: 14,
                        lineHeight: 17.64,
                        color: '#ABABAB',
                      }}>
                      Pdf upload
                    </Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity>
                  <View
                    style={{
                      height: 86,
                      width: '100%',
                      justifyContent: 'flex-start',
                      paddingLeft: 20,
                      alignItems: 'center',
                      flexDirection: 'row',
                      backgroundColor: '#EDEDED',
                    }}>
                    <Image
                      source={require('../assets/pdfIcon.png')}
                      style={{height: 40, width: 40, margin: 2, opacity: 1}}
                    />
                    <Text
                      style={{
                        fontFamily: 'Sora-Regular',
                        fontSize: 14,
                        lineHeight: 17.64,
                        color: '#ABABAB',
                      }}>
                      {aadharFileName}
                    </Text>
                  </View>
                </TouchableOpacity>
              )}
            </View>

            {/* 
        <TouchableOpacity style={{ flexDirection: "row", marginBottom: 20, paddingVertical: 12 }} onPress={async () => uploadFileOnPressHandler("aadhar")}>
          <Text style={styles.label}>Upload Aadhar Card</Text>
          <Image source={require("../assets/imageUpload.png")} style={styles.imageUploadIcon} />
        </TouchableOpacity>
        <TouchableOpacity style={{ flexDirection: "row", marginBottom: 20, paddingVertical: 12 }} onPress={async () => uploadFileOnPressHandler("pan")}>
          <Text style={styles.label}>Upload Pan Card</Text>
          <Image source={require("../assets/imageUpload.png")} style={styles.imageUploadIcon} />
        </TouchableOpacity> */}
          </View>
          <TouchableOpacity onPress={handleContinue} style={styles.continueBtn}>
            {loading ? (
              <ActivityIndicator size={'small'} color={'#fff'} />
            ) : (
              <Text style={styles.continueBtnTxt}>Continue</Text>
            )}
          </TouchableOpacity>
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
    flex: 2.5,
    flexDirection: 'column',
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  label: {
    marginBottom: 4,
    marginTop: 4,
    fontFamily: 'Sora-Medium',
    fontSize: 14,
    lineHeight: 17.64,
    color: 'black',
  },
  imageUploadIcon: {
    height: 40,
    width: 40,
    marginLeft: 40,
    position: 'relative',
    top: -14,
  },
  continueBtn: {
    backgroundColor: '#F496AC',
    height: 53,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 20,
    marginBottom: 10,
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
  headingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: {
    fontFamily: 'Sora-Medium',
    fontSize: 20,

    lineHeight: 30.24,
    color: 'black',
  },
  input: {
    color: 'black',
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 4,
    fontFamily: 'Sora-Regular',
  },
});

export default RegisterScreenUpload;
