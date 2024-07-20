/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation} from '../Redux/reducer';
import {onAuthStateChanged, signInWithEmailAndPassword} from 'firebase/auth';
import {auth, db} from '../Utils/Firebase';
import {collection, query, where, getDocs} from 'firebase/firestore';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/logo.png')}
        style={{height: 202, width: 201}}
      />
      <Text
        style={{
          fontSize: 20, // updated from 32 to 20
          fontFamily: 'Sora-SemiBold',
          lineHeight: 25.2, // updated from 40.32 to 25.2
          textAlign: 'left',
          color: '#F496AC',
          justifyContent: 'center',
          position: 'absolute',
          bottom: 40,
        }}>
        For Partner
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default SplashScreen;
