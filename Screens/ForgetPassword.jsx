/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
  Image,
  useWindowDimensions,
} from 'react-native';
import CustomHeader from '../Components/CustomHeader';
import {useState} from 'react';
import auth from '@react-native-firebase/auth';
import CustomModal from '../Components/CustomModal';
import {useNavigation} from '@react-navigation/native';

function ForgetPassword() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  const windowWidth = useWindowDimensions().width;
  const dashCount = Math.floor(windowWidth / 6 / 6);
  const dashes = '-'.repeat(dashCount);

  const nav = useNavigation();

  const showModal = message => {
    setModalMessage(message);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalVisible(false);
  };

  const handlePasswordReset = async () => {
    if (!email) {
      showModal('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await auth().sendPasswordResetEmail(email);
      showModal('Password reset email sent. Please check your inbox.');
      // nav.navigate('login');
    } catch (error) {
      switch (error.code) {
        case 'auth/invalid-email':
          showModal('The email address is not valid.');
          break;
        case 'auth/user-not-found':
          showModal('There is no user corresponding to this email.');
          break;
        default:
          showModal('An error occurred. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = text => {
    setEmail(text);
  };

  return (
    <View style={styles.container}>
      <CustomHeader title={'Forget Password'} />
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} />
      </View>
      <View style={styles.signInHeadContainer}>
        <Text
          style={styles.headText}>{`${dashes} Forget Password ${dashes}`}</Text>
      </View>
      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ABABAB"
          keyboardType="email-address"
          autoCapitalize="none"
          onChangeText={handleChange}
        />
        <TouchableOpacity
          onPress={handlePasswordReset}
          style={styles.continueBtn}>
          {loading ? (
            <ActivityIndicator size={'small'} color={'#fff'} />
          ) : (
            <Text style={styles.continueBtnTxt}>Send Email</Text>
          )}
        </TouchableOpacity>
      </View>
      <CustomModal
        isVisible={isModalVisible}
        message={modalMessage}
        onClose={hideModal}
      />
    </View>
  );
}

export default ForgetPassword;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginHorizontal: 10,
  },
  label: {
    marginBottom: 10,
    fontFamily: 'Sora-Medium',
    color: 'black',
  },
  input: {
    color: 'black',
    backgroundColor: 'transparent',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    fontFamily: 'Sora-Regular',
  },
  continueBtn: {
    backgroundColor: '#F496AC',
    height: 53,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  continueBtnTxt: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Sora-Regular',
  },
  logo: {
    width: 150,
    height: 150,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  signInHeadContainer: {
    justifyContent: 'flex-end',
    marginVertical: 15,
    alignItems: 'center',
  },
  headText: {
    fontFamily: 'Montserrat-Regular',
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 20.16,
    textAlign: 'center',
    color: '#A2A2A2',
  },
});
