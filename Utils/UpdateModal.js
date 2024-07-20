/* eslint-disable prettier/prettier */
import React from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';
import Modal from 'react-native-modal';

const UpdateModal = ({isVisible, onConfirm, onClose}) => {
  return (
    <Modal isVisible={isVisible}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>Update Available</Text>
        <Text style={styles.modalMessage}>
          A new version of the app is available.
        </Text>
        <View style={styles.buttonContainer}>
          {/* <TouchableOpacity onPress={onClose} style={styles.button}>
                  <Text style={styles.buttonText}>Cancel</Text>
               </TouchableOpacity> */}
          <TouchableOpacity onPress={onConfirm} style={styles.button}>
            <Text style={styles.buttonText}>Update</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContent: {
    backgroundColor: 'white',
    padding: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    fontSize: 20,
    marginBottom: 10,
    color: '#000',
    fontFamily: 'Sora-SemiBold',
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'left',
    color: '#484848',
    fontFamily: 'Sora-Regular',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 20,
  },
  button: {
    paddingVertical: 10,
    flex: 1,
    backgroundColor: '#F496AC',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontFamily: 'Sora-Medium',
  },
});

export default UpdateModal;
