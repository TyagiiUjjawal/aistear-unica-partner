/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet, Image} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import ArrowLeft from '../assets/ArrowLeft.png';

const CustomHeader = ({title}) => {
  const navigation = useNavigation();
  const handleBackPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
        <Image source={ArrowLeft} style={styles.image} />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>{title}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#F496AC',
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 10,
    paddingTop: 10,
  },
  backButton: {
    paddingVertical: 10,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  image: {
    width: 40,
    height: 30,
  },
});

export default CustomHeader;
