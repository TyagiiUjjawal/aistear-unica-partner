/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Button,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import RadioButton from '../Utils/RadioButton';
import * as ImagePicker from 'react-native-image-picker';
import DocumentPicker from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import {useNavigation} from '@react-navigation/native';
import {notifyMessage} from '../Utils/notifyMessage';
import {useDispatch, useSelector} from 'react-redux';
import {addInformation} from '../Redux/reducer';

const RegisterScreen3 = () => {
  const nav = useNavigation();
  const dispatch = useDispatch();
  const data = useSelector(s => s.partnerSlice.info);
  const [expert, setExpert] = useState([]);
  const [loading, setLoading] = useState(false);
  const handleContinue = () => {
    if (expert.length === 0) {
      notifyMessage('Select at least one');
      return;
    }
    setLoading(true);
    dispatch(addInformation({expertIn: expert}));
    nav.navigate('register4');
    setLoading(false);
  };
  const [selectedCheckBoxes, setSelectedCheckBoxes] = useState([]);
  const handleCheckBoxSelect = option => {
    const newSelectedCheckBoxes = [...selectedCheckBoxes];
    if (newSelectedCheckBoxes.includes(option)) {
      newSelectedCheckBoxes.splice(newSelectedCheckBoxes.indexOf(option), 1);
    } else {
      newSelectedCheckBoxes.push(option);
    }
    setSelectedCheckBoxes(newSelectedCheckBoxes);
    setExpert(newSelectedCheckBoxes);
  };
  const CheckBoxGroup = ({options, selectedOptions, onSelect}) => {
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
                borderRadius: 6,
                borderWidth: 2,
                borderColor: selectedOptions.includes(option)
                  ? 'black'
                  : '#888',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              {selectedOptions.includes(option) && (
                <View
                  style={{
                    height: 12,
                    width: 12,
                    borderRadius: 3,
                    backgroundColor: 'black',
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
        <Text style={styles.heading}>I am expert in</Text>
        <CheckBoxGroup
          options={[
            'Beauty Work',
            'Makeups',
            'Hair styles & Trimming',
            'Hair Work (Chemical Work)',
          ]}
          selectedOptions={selectedCheckBoxes}
          onSelect={handleCheckBoxSelect}
        />
      </View>

      <View style={{flex: 1, justifyContent: 'flex-top'}}>
        <TouchableOpacity
          onPress={() => {
            handleContinue();
          }}
          style={styles.continueBtn}>
          {loading ? (
            <ActivityIndicator size={'small'} color={'#fff'} />
          ) : (
            <Text style={styles.continueBtnTxt}>Continue</Text>
          )}
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
    fontFamily: 'Sora-SemiBold',
    fontSize: 20,

    lineHeight: 30.24,
    color: 'black',
    marginBottom: 12,
  },
});

export default RegisterScreen3;
