/* eslint-disable prettier/prettier */
import {View, Text, StyleSheet, TouchableOpacity, Image} from 'react-native';
import React from 'react';
import ticketSubmitted from '../assets/ticketSubmitted.png';
import {useNavigation} from '@react-navigation/native';

export default function QuerySubmission() {
  const nav = useNavigation();
  return (
    <View style={styles.myEmpytQueryContainer}>
      <Text style={styles.confirmationText}>Ticket submitted!</Text>
      <Image source={ticketSubmitted} style={styles.QuerySubmissionContainer} />
      <View>
        <Text style={styles.confirmSubText}>
          Our awesome helper will be with you shortly:)
        </Text>
      </View>
      <TouchableOpacity
        style={styles.confirmButton}
        onPress={() => nav.navigate('helpdesk')}>
        <Text style={styles.confirmButtonText}>Got it, Thanks!</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  myEmpytQueryContainer: {
    flex: 11,
    justifyContent: 'center',
    marginHorizontal: 20,
    alignItems: 'center',
  },
  QuerySubmissionContainer: {
    height: 130,
    width: 130,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
  confirmSubText: {
    textAlign: 'center',
    color: '#061B2E',
    fontSize: 16.5,
    lineHeight: 16.5 * 2.2,
    paddingVertical: 10,
    fontFamily: 'Sora-Medium',
  },
  confirmationText: {
    fontSize: 25,
    textAlign: 'center',
    marginBottom: 10,
    color: '#061B2E',
    fontFamily: 'Sora-Bold',
  },
  confirmButton: {
    backgroundColor: '#2A2A2A',
    padding: 15,
    width: '100%',
    alignItems: 'center',
    marginTop: 15,
  },
});
