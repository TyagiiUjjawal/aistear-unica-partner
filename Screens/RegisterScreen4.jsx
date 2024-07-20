/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable quotes */
/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioButton from '../Utils/RadioButton';
import {useNavigation} from '@react-navigation/native';
import {useDispatch, useSelector} from 'react-redux';
import {notifyMessage} from '../Utils/notifyMessage';
import {addInformation} from '../Redux/reducer';

const RegisterScreen4 = () => {
  const [selectedOption, setSelectedOption] = useState('');

  const data = useSelector(s => s.partnerSlice.info);
  const dispatch = useDispatch();
  const handleContinue = () => {
    if (selectedOption === '') {
      notifyMessage('please select option');
      return;
    }
    console.log(selectedOption);
    dispatch(addInformation({experience: selectedOption}));
    // nav.navigate('registerUpload');
    nav.navigate('registeraccount');
  };
  const nav = useNavigation();
  const handleSelect = option => {
    setSelectedOption(option === selectedOption ? '' : option);
  };
  const CheckBoxGroup = ({options, selectedOption, onSelect}) => {
    return (
      <View>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 10,
              borderWidth: 1,
              borderColor: '#BBBBBB',
              height: 54,
              paddingHorizontal: 12,
            }}
            onPress={() => onSelect(option)}>
            <Text
              style={{
                marginRight: 5,
                color: 'black',
                fontFamily: 'Sora-SemiBold',
                fontSize: 13,
                fontWeight: '600',
                lineHeight: 16.38,
                textAlign: 'left',
              }}>
              {option}
            </Text>
            <View
              style={{
                height: 24,
                width: 24,
                borderRadius: 12,
                borderWidth: 2,
                borderColor: option === selectedOption ? '#007AFF' : '#888',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {option === selectedOption && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 6,
                    backgroundColor: '#007AFF',
                  }}
                />
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.heading}>Experience</Text>
        <CheckBoxGroup
          options={[
            'Fresher',
            'Less than 1 Year',
            '1-5 Years',
            '5 Years and Above',
          ]}
          selectedOption={selectedOption}
          onSelect={handleSelect}
        />
      </View>

      <View style={{flex: 1, justifyContent: 'flex-top'}}>
        <TouchableOpacity
          onPress={() => {
            handleContinue();
          }}
          style={styles.continueBtn}>
          <Text style={styles.continueBtnTxt}>Continue</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },

  formContainer: {
    flex: 5,
    marginTop: 60,
    flexDirection: 'column',
  },
  label: {
    marginBottom: 1,
    fontFamily: 'Sora-Medium',
    color: 'black',
  },
  input: {
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 20,
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
    marginBottom: 20,
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
  heading: {
    fontSize: 20,
    fontFamily: 'Sora-SemiBold',
    lineHeight: 30.24,
    color: 'black',
    marginBottom: 12,
  },
});

export default RegisterScreen4;
