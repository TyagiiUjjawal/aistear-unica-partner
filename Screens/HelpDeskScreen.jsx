/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable prettier/prettier */
import {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Button,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Keyboard,
  Image,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import {
  addDoc,
  getDocs,
  collection,
  setDoc,
  doc,
  query,
  where,
  getFirestore,
} from 'firebase/firestore';
import {app, db} from '../Utils/Firebase';
import {Timestamp} from '@firebase/firestore';
import {notifyMessage} from '../Utils/notifyMessage';
import {set} from 'firebase/database';
import {useSelector} from 'react-redux';
import arrowRight from '../assets/arrowRight.png';
import {useNavigation} from '@react-navigation/native';
import refreshBtn from '../assets/refresh.png';
import CustomHeader from '../Components/CustomHeader';
import NoTickets from '../assets/NoTickets.png';
// import ticketSubmitted from '../assets/ticketSubmitted.png';

const MyQueries = ({refresh}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [reopenedMessage, setReopenedMessage] = useState('');
  const [loading, setLoading] = useState('');
  const [data, setData] = useState([]);
  const partnerInfo = useSelector(state => state.partnerSlice.partnerInfo);
  const navigation = useNavigation();

  useEffect(() => {
    setLoading(true);
    const fetchData = async () => {
      const userQueriesRef = collection(db, 'partnerQueries');
      const q = query(userQueriesRef, where('email', '==', partnerInfo.email));
      const querySnapshot = await getDocs(q);
      const fetchedData = [];
      querySnapshot.forEach(doc => {
        fetchedData.push({id: doc.id, ...doc.data()});
      });
      setData(fetchedData);
    };
    fetchData();
    setLoading(false);
  }, [refresh]);

  const handleQueryPress = query => {
    setSelectedQuery(query);
    navigation.navigate('query', {selectedQuery: query});
  };
  const [reopening, setReopening] = useState(false);

  const handleReopen = async () => {
    if (selectedQuery && selectedQuery.id) {
      try {
        setReopening(true);
        await setDoc(doc(collection(db, 'partnerQueries'), selectedQuery.id), {
          ...selectedQuery,
          status: 'Re-Opened',
          reopenedMessage,
        });
        setData(
          data.map(query =>
            query.id === selectedQuery.id
              ? {...query, status: 'Re-Opened', reopenedMessage}
              : query,
          ),
        );
        // console.log('Document updated');

        // setData(updatedData);
        setModalVisible(false);
        setReopening(false);
      } catch (e) {
        setReopening(false);
        console.log('error during adding reopen request', e);
      }
    } else {
      console.log('Selected query is not valid or does not have an id');
    }
  };

  const formatTimestamp = timestamp => {
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const truncateMessage = (message, wordLimit) => {
    const words = message.split(' ');
    if (words.length <= wordLimit) {
      return message;
    }
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  return data.length === 0 ? (
    <View style={styles.myEmpytQueryContainer}>
      <Image source={NoTickets} style={styles.NoTicketsImage} />
      <Text style={styles.NoTicketsText}>Have any Questions ?</Text>
    </View>
  ) : (
    <View style={styles.myQueryContainer}>
      <ScrollView>
        {data.map((query, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => handleQueryPress(query)}
            style={styles.briefQueryContainer}>
            <View style={styles.flexCol}>
              <Text style={styles.leftTextInsideMyQuery}>
                {truncateMessage(query.openMessage, 3)}
              </Text>
              <Text style={styles.dateText}>
                {formatTimestamp(query.createdAt)}
              </Text>
            </View>
            <View style={styles.flexRow}>
              <Text style={styles.rightTextInsideMyQuery}>
                {query.status === 'Opened' ? (
                  <Text>{query.status}</Text>
                ) : query.status === 'Re-Opened' ? (
                  <Text>{query.status}</Text>
                ) : query.status === 'Resolved' ? (
                  <Text>{query.status}</Text>
                ) : query.status === 'Closed' ? (
                  <Text>{query.status}</Text>
                ) : (
                  <Text>{query.status}</Text>
                )}
              </Text>
              <Image source={arrowRight} style={styles.arrowRight} />
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
      {selectedQuery && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}>
          <ScrollView style={styles.modalView}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Image
                source={require('../assets/closeIcon.png')}
                style={{width: 25, height: 25}}
              />
            </TouchableOpacity>
            <Text style={styles.label}>Open Query</Text>
            <TextInput
              style={styles.inputDisabled}
              value={selectedQuery.openMessage}
              rows={4}
              multiline
              editable={false}
            />

            {selectedQuery.status === 'Resolved' && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={[styles.label]}>Resolved Response</Text>
                </View>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.resolvedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />

                <Text style={styles.label}>Reopen Request</Text>
                <TextInput
                  value={reopenedMessage}
                  onChangeText={setReopenedMessage}
                  placeholder="Enter your Reopen request message here.."
                  placeholderTextColor="#455a64"
                  style={styles.input}
                  rows={4}
                  multiline
                />

                <TouchableOpacity
                  onPress={handleReopen}
                  style={{
                    borderRadius: 5.59,
                    padding: 10,
                    marginTop: 10,
                    backgroundColor: '#80ccc4',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  {reopening ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={{color: 'white'}}>REOPEN ISSUE</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}

            {selectedQuery.status === 'Re-Opened' && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={styles.label}>Resolved Response</Text>
                </View>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.resolvedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />

                <Text style={styles.label}>Reopen Query</Text>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.reopenedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />
              </View>
            )}

            {selectedQuery.status === 'Closed' && (
              <View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={styles.label}>Resolved Response</Text>
                </View>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.resolvedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />

                <Text style={styles.label}>Reopen Query</Text>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.reopenedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'flex-end',
                  }}>
                  <Text style={[styles.label]}>Closed Response</Text>
                </View>
                <TextInput
                  style={styles.inputDisabled}
                  value={selectedQuery.closedMessage}
                  rows={4}
                  multiline
                  editable={false}
                />
              </View>
            )}
          </ScrollView>
        </Modal>
      )}
    </View>
  );
};

const RaiseQuery = () => {
  const nav = useNavigation();
  const firestore = getFirestore(app);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('account_related');
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([
    {label: 'Account Related', value: 'account_related'},
    {label: 'Test Related', value: 'test_related'},
    {label: 'Subscription Related', value: 'subscription_related'},
    {
      label: 'General Complaint/Feedback',
      value: 'general_complaint_feedback',
    },
    {label: 'Others', value: 'others'},
  ]);
  const [adding, setAdding] = useState(false);
  const partnerInfo = useSelector(state => state.partnerSlice.partnerInfo);

  const handleSubmitQuery = async () => {
    console.log(query);
    if (query.trim() === '') {
      return;
    }
    console.log('submitting....');
    setAdding(true);
    const docId = 'PQ' + Math.floor(Date.now() / 1000);
    try {
      await setDoc(doc(collection(firestore, 'partnerQueries'), docId), {
        customerName: partnerInfo.name,
        email: partnerInfo.email,
        openMessage: query,
        category: value,
        status: 'Opened',
        createdAt: Timestamp.fromDate(new Date()),
      });
      setAdding(false);
      notifyMessage('Query submitted successfully');
      // onSubmitSuccess();
      nav.navigate('submitquery');
    } catch (e) {
      notifyMessage('Error during adding open request');
      setAdding(false);
      console.log('error during adding open request', e);
    } finally {
      setQuery('');
    }
  };

  return (
    <View style={styles.raiseQueryContainer}>
      <Text style={styles.label}>Category</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        placeholder="Select a category"
        style={styles.input}
        dropDownContainerStyle={styles.dropdownContainer}
      />
      <Text style={styles.label}>Query</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#ABABAB"
        onChangeText={text => setQuery(text)}
        autoCapitalize="none"
        rows={6}
        multiline
        value={query}
      />

      <View
        style={{
          flex: 1,
        }}
      />

      <TouchableOpacity
        onPress={handleSubmitQuery}
        style={{
          backgroundColor: '#F496AC',
          padding: 10,
          borderRadius: 5.59,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 10,
        }}
        disabled={adding || query.trim() === ''}>
        <Text
          style={{
            color: 'white',
            fontFamily: 'Sora-Medium',
            lineHeight: 17.64,
            fontSize: 14,
          }}
          disabled={adding}>
          {adding ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Ticket</Text>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const HelpDeskScreen = () => {
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [mode, setMode] = useState('raiseQuery');
  // const [submitMode, setSubmitMode] = useState('raiseQuery');

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        setKeyboardVisible(true);
      },
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
      },
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  // const handleSubmitSuccess = () => {
  //   setSubmitMode('submitQuery'); // Switch to submitQuery mode on successful submission
  // };

  const toggleFunction = mode => {
    setMode(mode);
  };

  const handlePress = () => {
    setRefresh(prevRefresh => !prevRefresh);
  };

  // const handleBackToRaiseQuery = () => {
  //   setMode('raiseQuery');
  //   setSubmitMode('raiseQuery');
  // };

  return (
    <View style={styles.container}>
      <CustomHeader title="HELP DESK" />
      <View style={styles.chooseCategoryContainer}>
        <TouchableOpacity
          onPress={() => toggleFunction('raiseQuery')}
          style={styles.raiseQuery}>
          <Text
            style={[
              styles.raiseQueryText,
              {color: mode === 'raiseQuery' ? 'black' : '#A8A8A8'},
            ]}>
            Raise a Ticket
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => toggleFunction('myQuery')}
          style={styles.myQuery}>
          <Text
            style={[
              styles.myQueryText,
              {color: mode === 'myQuery' ? 'black' : '#A8A8A8'},
            ]}>
            My Ticket
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => handlePress()}>
          <Image source={refreshBtn} style={styles.refreshBtn} />
        </TouchableOpacity>
      </View>

      {
        // submitMode === 'submitQuery' ? (
        //   <SubmissionConfirmation onBackToRaiseQuery={handleBackToRaiseQuery} />
        // ) :

        mode === 'raiseQuery' ? (
          <RaiseQuery
          // submitMode={submitMode}
          // onSubmitSuccess={handleSubmitSuccess}
          />
        ) : (
          <MyQueries refresh={refresh} />
        )
      }

      <View style={{flex: 1}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  chooseCategoryContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  raiseQuery: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  raiseQueryText: {
    color: '#000000',
    fontFamily: 'Sora-SemiBold',
    fontSize: 13,
    lineHeight: 15.12,
    letterSpacing: 0.03,
    textAlign: 'left',
  },
  myQuery: {
    flex: 1.5,
    backgroundColor: '#FFFFFF',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  myQueryText: {
    color: '#000000',
    fontFamily: 'Sora-SemiBold',
    fontSize: 13,
    lineHeight: 15.12,
    letterSpacing: 0.03,
    textAlign: 'left',
  },
  raiseQueryContainer: {
    flex: 10,
    paddingHorizontal: 12,
    borderRadius: 5.59,
    backgroundColor: 'rgba(89, 89, 89, 0.1)',
    justifyContent: 'flex-start',
    paddingVertical: 20,
    marginHorizontal: 20,
  },
  myQueryContainer: {
    flex: 11,
    justifyContent: 'flex-start',
    marginHorizontal: 20,
  },
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
  NoTicketsImage: {
    height: 100,
    width: 100,
  },
  NoTicketsText: {
    fontSize: 20,
    fontFamily: 'Sora-Regular',
    color: '#000',
    marginTop: 15,
  },
  confirmContainContainer: {
    flex: 6,
    justifyContent: 'center',
    position: 'relative',
    bottom: 12,
  },
  confirmButtonContainer: {
    padding: 15,
    margin: 12,
    textAlign: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    borderRadius: 5,
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
  input: {
    backgroundColor: 'white',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 20,
    borderRadius: 5,
    color: 'black',
    marginTop: 6,
  },
  inputDisabled: {
    backgroundColor: 'rgba(89, 89, 89, 0.1)',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#B3B3B3',
    marginBottom: 20,
    borderRadius: 5,
    color: '#455a64',
    marginTop: 6,
  },
  label: {
    fontFamily: 'Sora-Medium',
    fontSize: 12.17,
    fontWeight: '600',
    lineHeight: 15.34,
    letterSpacing: 0.03,
    textAlign: 'left',
    color: 'black',
  },
  dropdownContainer: {
    backgroundColor: '#fafafa',
    borderColor: '#ddd',
  },
  briefQueryContainer: {
    height: 92,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    paddingHorizontal: 15,
    borderRadius: 5.59,
    borderWidth: 1,
    borderColor: '#EAEEF4',
  },
  leftTextInsideMyQuery: {
    color: '#000',
    fontFamily: 'Sora-Regular',
    fontSize: 14,
    letterSpacing: 0.03,
    textAlign: 'left',
  },
  rightTextInsideMyQuery: {
    color: '#F496AC',
    fontFamily: 'Montserrat-Medium',
    fontSize: 12,
    backgroundColor: 'rgba(244, 150, 172, 0.15)',
    padding: 10,
    fontWeight: '700',
    lineHeight: 10.78,
    letterSpacing: 0.03,
    textAlign: 'left',
    borderRadius: 20,
  },
  modalView: {
    height: 300,
    margin: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,

    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalText: {
    color: '#000',
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    alignItems: 'flex-end',
    zIndex: 999,
  },
  dateText: {
    fontSize: 12,
    color: '#7E92A2',
    fontFamily: 'Sora-Regular',
  },
  flexCol: {
    flexDirection: 'column',
    gap: 10,
  },
  arrowRight: {
    height: 20,
    width: 20,
  },
  flexRow: {
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshBtn: {
    height: 20,
    width: 20,
    marginLeft: 'auto',
  },
  confirmationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
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

export default HelpDeskScreen;
