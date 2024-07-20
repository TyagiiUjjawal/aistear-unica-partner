/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import {Image, StyleSheet, Text, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';

const DisabledScreen = () => {
  const nav = useNavigation();

  return (
    <View style={styles.container}>
      <Image source={require('../assets/disabled.png')} style={styles.image} />
      <Text style={styles.heading}>Your Profile is Blocked!</Text>
      <Text style={styles.subHeading}>blocked due to trust issues</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    marginBottom: 40,
  },
  heading: {
    fontSize: 22,
    fontFamily: 'Sora-SemiBold',
    lineHeight: 30.24,
    color: '#000',
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 15,
    fontFamily: 'Sora-Regular',
    color: '#777777',
  },
});

export default DisabledScreen;
