/* eslint-disable prettier/prettier */
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {collection, doc, setDoc} from 'firebase/firestore';
import {db} from '../Utils/Firebase';
import CustomHeader from '../Components/CustomHeader';

export default function QueryScreen({route}) {
  const {selectedQuery} = route.params;
  const navigation = useNavigation();

  const [reopening, setReopening] = useState(false);
  const [reopenedMessage, setReopenedMessage] = useState('');

  const [data, setData] = useState([]);

  const handleReopen = async () => {
    if (reopenedMessage.trim() === '') {
      return;
    }
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
        console.log('Document updated');
        setReopening(false);
        navigation.goBack();
      } catch (e) {
        setReopening(false);
        console.log('error during adding reopen request', e);
      }
    } else {
      console.log('Selected query is not valid or does not have an id');
    }
  };

  return (
    <View>
      <CustomHeader title="Query" />
      <ScrollView style={styles.modalView}>
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
                backgroundColor: '#F496AC',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {reopening ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={{color: 'white', fontFamily: 'Sora-Medium'}}>
                  REOPEN ISSUE
                </Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingHorizontal: 20,
  },
  chooseCategoryContainer: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
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
  },
  myQueryContainer: {
    flex: 11,
    justifyContent: 'flex-start',
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
    fontFamily: 'Sora-Regular',
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
    fontFamily: 'Sora-Regular',
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
    fontFamily: 'Montserrat-Bold',
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
    paddingHorizontal: 20,
    paddingVertical: 50,
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
});
