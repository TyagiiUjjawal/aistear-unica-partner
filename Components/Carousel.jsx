/* eslint-disable prettier/prettier */
import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {doc, getDoc, getFirestore} from 'firebase/firestore';
import {app} from '../Utils/Firebase';
import {useNavigation} from '@react-navigation/native';

const {width} = Dimensions.get('window');

const Carousel = () => {
  const [carouselItems, setCarouselItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef(null);
  const navigation = useNavigation();

  const firestore = getFirestore(app);

  useEffect(() => {
    const fetchCarouselData = async () => {
      try {
        const docRef = doc(firestore, 'Graphics', 'partnerCarousel');
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCarouselItems(docSnap.data().partnerCarousel);
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching document:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCarouselData();
  }, [firestore]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setActiveIndex(prevIndex => {
        const nextIndex = prevIndex + 1;
        if (flatListRef.current && nextIndex < carouselItems.length) {
          flatListRef.current.scrollToIndex({
            index: nextIndex,
            animated: true,
          });
        } else if (flatListRef.current) {
          flatListRef.current.scrollToIndex({
            index: 0,
            animated: false,
          });
          setActiveIndex(0);
        }
        return nextIndex % carouselItems.length;
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [carouselItems]);

  const onViewableItemsChanged = useRef(({viewableItems}) => {
    if (viewableItems.length > 0) {
      const currentIndex = viewableItems[0].index;
      setActiveIndex(currentIndex);
    }
  }).current;

  const handleImagePress = screenName => {
    // navigation.navigate(screenName);
    console.log(screenName);
    const deepLink = `aistearunicapartner://${screenName}`;
    Linking.openURL(deepLink);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={carouselItems}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({item}) => (
          <TouchableOpacity
            onPress={() => handleImagePress(item.screenName)}
            style={styles.imageContainer}>
            <Image source={{uri: item.imageUrl}} style={styles.image} />
          </TouchableOpacity>
        )}
        onViewableItemsChanged={onViewableItemsChanged}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    marginTop: 15,
  },
  imageContainer: {
    marginHorizontal: 20,
    alignItems: 'center',
  },
  image: {
    width: 320,
    height: 150,
    borderRadius: 20,
    resizeMode: 'cover',
  },
});

export default Carousel;
