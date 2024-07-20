/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import React from 'react';
import CustomHeader from '../Components/CustomHeader';
import {useSelector} from 'react-redux';
import Star from '../assets/Star.png';
import starGray from '../assets/starGray.png';
import noReview from '../assets/noReview.png';
import {formatDistanceToNow} from 'date-fns';

export default function MyRating({route}) {
  const {reviews} = route.params;

  const partnerId = useSelector(state => state.partnerSlice.partnerId);

  const totalReviews = reviews.length;

  const reviewCounts = reviews.reduce((acc, review) => {
    acc[review.rating] = (acc[review.rating] || 0) + 1;
    return acc;
  }, {});

  const averageRating = (
    reviews.reduce((acc, review) => acc + Number(review.rating), 0) /
    totalReviews
  ).toFixed(1);

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContent}>
      <CustomHeader title="MY RATINGS" />
      {reviews.length > 0 ? (
        <View style={styles.container}>
          {Object.keys(reviewCounts).length > 0 ? (
            <View>
              <Text style={styles.id}>ID: {partnerId}</Text>
              <View style={styles.reviewBox}>
                <View style={styles.barContainerLine}>
                  {[5, 4, 3, 2, 1].map(key => (
                    <View key={key} style={styles.reviewRow}>
                      <Text style={styles.reviewLabel}>{key}</Text>
                      <Image source={Star} key={key} style={styles.star} />
                      <View style={styles.barContainer}>
                        {reviewCounts[key] > 0 ? (
                          <View
                            style={[
                              styles.bar,
                              {
                                width: `${
                                  (reviewCounts[key] / totalReviews) * 100
                                }%`,
                              },
                            ]}
                          />
                        ) : (
                          <View
                            style={[
                              styles.bar,
                              styles.grayBar,
                              {width: '100%'},
                            ]}
                          />
                        )}
                      </View>
                      <Text style={styles.reviewCount}>
                        {reviewCounts[key] || 0}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={styles.alignRight}>
                  <Text style={styles.totalRating}>{averageRating}</Text>
                  <View style={styles.reviewStarsContainer}>
                    <View style={styles.reviewBoxStar}>
                      {Array.from({length: Math.round(averageRating)}).map(
                        (_, index) => (
                          <Image
                            source={Star}
                            key={index}
                            style={styles.star}
                          />
                        ),
                      )}
                      {Array.from({length: 5 - Math.round(averageRating)}).map(
                        (_, index) => (
                          <Image
                            source={starGray}
                            key={`gray_${index}`}
                            style={styles.star}
                          />
                        ),
                      )}
                    </View>
                    <View style={styles.alignRight}>
                      <Text style={styles.textColor}>
                        {totalReviews} Reviews
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.noReviewContainer}>
              <Image source={noReview} style={styles.noReview} />
              <Text style={styles.noReviewText}>No Reviews yet</Text>
            </View>
          )}

          {reviews.map(review => (
            <View key={review.timeStamp.seconds} style={styles.reviewContainer}>
              <View style={styles.postBox}>
                <Image
                  source={
                    review.ImageUrl
                      ? {uri: review.ImageUrl}
                      : require('../assets/profile.png')
                  }
                  style={styles.image}
                />
                <View>
                  <Text style={styles.reviewName}>{review.name}</Text>
                  <View style={styles.starsContainer}>
                    {Array.from({length: Number(review.rating)}).map(
                      (_, index) => (
                        <Image source={Star} key={index} style={styles.star} />
                      ),
                    )}
                    {Array.from({length: 5 - Number(review.rating)}).map(
                      (_, index) => (
                        <Image
                          source={starGray}
                          key={`gray_${index}`}
                          style={styles.star}
                        />
                      ),
                    )}
                    <Text style={styles.reviewTime}>
                      {formatDistanceToNow(review.timeStamp.toDate(), {
                        addSuffix: true,
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.reviewDescription}>{review.description}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.noReviewContainer}>
          <Image source={noReview} style={styles.noReview} />
          <Text style={styles.noReviewText}>No Reviews yet</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollViewContent: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  barContainerLine: {
    flex: 1,
    marginRight: 20,
  },
  id: {
    fontSize: 16,
    marginBottom: 30,
    color: '#000',
    fontFamily: 'Sora-Medium',
  },
  reviewContainer: {
    borderBottomWidth: 1,
    borderColor: '#D9D9D9',
    borderRadius: 5,
    paddingVertical: 18,
    marginBottom: 10,
  },
  reviewName: {
    fontSize: 18,
    fontFamily: 'Sora-SemiBold',
    color: '#333333',
    marginBottom: 2,
  },
  reviewDescription: {
    fontSize: 13,
    marginBottom: 5,
    marginTop: 8,
    color: '#333333',
    lineHeight: 13 * 1.3,
    fontFamily: 'Sora-Regular',
  },
  reviewTime: {
    fontSize: 12,
    color: '#333333',
    fontFamily: 'Sora-SemiBold',
  },
  image: {
    height: 35,
    width: 35,
  },
  postBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    gap: 10,
  },
  starsContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 8,
  },
  reviewStarsContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    gap: 8,
  },
  reviewBoxStar: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  star: {
    width: 10,
    height: 10,
  },
  noReviewContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noReview: {
    height: 150,
    width: 150,
  },
  noReviewText: {
    fontSize: 20,
    marginTop: 15,
    color: '#000',
    fontFamily: 'Sora-Regular',
  },
  reviewBox: {
    flex: 1,
    gap: 10,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  totalRating: {
    color: '#333333',
    fontSize: 50,
    fontWeight: '700',
    fontFamily: 'Montserrat-Bold',
  },
  flexCol: {
    flex: 1,
    marginTop: 8,
    flexDirection: 'column',
    gap: 3,
  },
  textColor: {
    color: '#333333',
    fontFamily: 'Montserrat-Bold',
  },
  alignRight: {
    alignItems: 'flex-end',
  },
  reviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  reviewLabel: {
    textAlign: 'center',
    marginRight: 5,
    fontFamily: 'Sora-Regular',
  },
  barContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  bar: {
    height: '100%',
    backgroundColor: '#000000',
  },
  reviewCount: {
    width: 20,
    textAlign: 'right',
    fontFamily: 'Sora-Regular',
  },
  grayBar: {
    backgroundColor: '#e0e0e0',
  },
});
