/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Modal from 'react-native-modal';

const CustomModal = ({isVisible, message, onClose}) => {
  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      animationIn="slideInUp"
      animationOut="slideOutDown"
      backdropOpacity={0.7}>
      <View style={styles.modalContainer}>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    backgroundColor: 'white',
    padding: 20,
    // alignItems: 'center',
  },
  message: {
    fontSize: 18,
    marginBottom: 20,
    fontFamily: 'Sora-Regular',
    color: '#5E5E5E',
    lineHeight: 18 * 1.5,
  },
  closeButton: {
    backgroundColor: '#F496AC',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginLeft: 'auto',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
});

export default CustomModal;
