/* eslint-disable prettier/prettier */
/* eslint-disable prettier/prettier */
import React, {useState} from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

const RegisterScreenAccount = () => {
  const nav = useNavigation();
  const data = useSelector(state => state.partnerSlice.info);
  const dispatch = useDispatch();
  const [accountHolderName, setAccountHolderName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (!accountHolderName) {
      console.log('Please provide the Account Holder Name');
      notifyMessage('Please provide the Account Holder Name');
      return;
    }

    if (!accountNumber) {
      console.log('Please provide Account Number');
      notifyMessage('Please provide Account Number');
      return;
    }

    if (!confirmAccountNumber) {
      console.log('Please Confirm Account Number');
      notifyMessage('Please Confirm Account Number');
      return;
    }

    if (!ifscCode) {
      console.log('Please provide IFSC Code');
      notifyMessage('Please provide IFSC Code');
      return;
    }

    if (
      !accountHolderName ||
      !ifscCode ||
      !accountNumber ||
      !confirmAccountNumber
    ) {
      return;
    }

    if (accountNumber.length < 8 || accountNumber.length > 17) {
      console.log('Account Number should be between 8 and 17 characters long');
      notifyMessage(
        'Account Number should be between 8 and 17 characters long',
      );
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      notifyMessage('Account Number and Confirm Account Number should be same');
      return;
    }
    setLoading(true);
    try {
      if (!ifscCode) {
        notifyMessage('IFSC Code is required');
        return;
      }
      const res = await fetch(
        `https://api.transferwise.com/v1/validators/ifsc-code?ifscCode=${ifscCode}`,
        {
          method: 'GET',
        },
      );

      console.log(ifscCode);

      if (!res.ok) {
        const errorData = await res.json();
        const errorMessage =
          errorData.errors && errorData.errors.length > 0
            ? errorData.errors[0].message
            : 'Validation failed for unknown reasons';
        throw new Error(errorMessage);
      }

      const json = await res.json();
      console.log(json);

      console.log(accountHolderName, accountNumber, ifscCode);

      dispatch(
        addInformation({
          accountHolderName,
          ifscCode,
          accountNumber,
        }),
      );
      nav.navigate('registerUpload');
    } catch (e) {
      notifyMessage('your IFSC Code is invalid, please try again...');
      console.log('Error during fetch IFSC code validation:', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{flex: 1}}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <View style={styles.container}>
          <View style={styles.formContainer}>
            <Text style={styles.heading}>Bank Account Details</Text>
            <Text style={styles.label}>Account Holder Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Holder Name"
              placeholderTextColor="#ABABAB"
              autoCapitalize="none"
              onChangeText={setAccountHolderName}
            />
            <Text style={styles.label}>Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              placeholderTextColor="#ABABAB"
              secureTextEntry
              onChangeText={setAccountNumber}
            />
            <Text style={styles.label}>Confirm Account Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Account Number"
              placeholderTextColor="#ABABAB"
              secureTextEntry
              onChangeText={setConfirmAccountNumber}
            />
            <Text style={styles.label}>IFSC Code</Text>
            <TextInput
              style={styles.input}
              placeholder="IFSC Code"
              placeholderTextColor="#ABABAB"
              onChangeText={setIfscCode}
              autoCapitalize="characters"
            />

            <TouchableOpacity
              onPress={handleContinue}
              style={styles.continueBtn}>
              {loading ? (
                <ActivityIndicator size={'small'} color={'#fff'} />
              ) : (
                <Text style={styles.continueBtnTxt}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 50,
  },
  formContainer: {
    flex: 1,
    marginTop: 60,
    flexDirection: 'column',
    paddingHorizontal: 20,
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
    color: 'black',
    fontFamily: 'Sora-Regular',
  },
  continueBtn: {
    backgroundColor: '#F496AC',
    height: 53,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
    top: 12,
    marginTop: 'auto',
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
  // heading: {
  //   fontFamily: 'Sora',
  //   fontSize: 20,
  //   fontWeight: '800',
  //   lineHeight: 30.24,
  //   color: 'black',
  //   marginBottom: 12,
  // },
  heading: {
    fontSize: 20,
    fontFamily: 'Sora-SemiBold',
    lineHeight: 30.24,
    color: 'black',
    marginBottom: 12,
  },
});

export default RegisterScreenAccount;
