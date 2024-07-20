/* eslint-disable prettier/prettier */
import {StyleSheet, TouchableOpacity, BackHandler} from 'react-native';
import React, {useEffect} from 'react';
import {View, Image, Text} from 'react-native';
import RNExitApp from 'react-native-exit-app';
import {useNavigation} from '@react-navigation/native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  contentContainer: {
    flex: 0.6,
    paddingHorizontal: 12,
  },
  imageContainer: {
    flex: 2,
    width: '100%',
    justifyContent: 'flex-end',
    position: 'relative',
    top: -30,
  },
  image: {
    height: 93,
    width: 189,
  },
  titleText: {
    color: 'black',
    fontFamily: 'Sora-SemiBold',
    fontSize: 17,
    lineHeight: 25.2,
    letterSpacing: -0.04,
    textAlign: 'left',
  },
  descriptionText: {
    color: '#969696',
    fontFamily: 'Sora-Regular',
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 21.42,
    letterSpacing: -0.04,
    textAlign: 'left',
  },
  horizontalContainer: {
    flex: 0.6,
    flexDirection: 'row',
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    paddingHorizontal: 12,
    alignItems: 'center',
    height: 78,
    width: 300,
  },
  verticalContainer: {
    flex: 2,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  helpTxt: {
    marginBottom: 8,
    color: '#787878',
    fontFamily: 'Basis Grotesque Pro',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 13,
    letterSpacing: 0.14,
    textAlign: 'left',
  },
  phoneNumberTxt: {
    color: '#284291',
    fontFamily: 'Basis Grotesque Pro',
    fontSize: 15,
    fontWeight: '700',
    lineHeight: 15,
    letterSpacing: -0.01,
    textAlign: 'left',
  },
  callBtn: {
    borderWidth: 1,
    borderColor: '#787878',
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'Sora-Medium',
    padding: 5,
    color: '#787878',
  },
});

// ReviewScreen.js
const ReviewScreen = () => {
  const nav = useNavigation();
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => true,
    );
    return () => backHandler.remove();
  }, []);

  const handleCloseApp = () => {
    RNExitApp.exitApp();
  };
  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        <Image
          source={require('../assets/reviewIcon.png')}
          style={styles.image}
        />
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.titleText}>We’re reviewing your document</Text>
        <Text style={styles.descriptionText}>
          Our representative in touch with you soon.
        </Text>
      </View>

      <View style={styles.horizontalContainer}>
        <View style={styles.verticalContainer}>
          <Text style={styles.helpTxt}>HELPLINE 1</Text>
          <Text style={styles.phoneNumberTxt}>9024 660 663</Text>
        </View>
        <TouchableOpacity onPress={handleCloseApp}>
          <Text style={styles.callBtn}>CLOSE APP</Text>
        </TouchableOpacity>
      </View>
      <View style={{flex: 2.5}}>
        <TouchableOpacity
          style={{position: 'relative', top: 32}}
          onPress={() => fun()}>
          <Text
            style={{
              color: 'black',
              fontFamily: 'Basis Grotesque Pro',
              fontSize: 15,
              fontWeight: '500',
              lineHeight: 15,
              letterSpacing: -0.04,
              textAlign: 'left',
              display: 'none',
            }}>
            Edit Document
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ReviewScreen;
