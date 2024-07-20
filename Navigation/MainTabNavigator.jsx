/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable prettier/prettier */
// MainTabNavigator.js
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {Image, StyleSheet, TouchableOpacity, View, Text} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import HomeScreen from '../Screens/HomeScreen';
import Account from '../Screens/AccountScreen';
import MyBookingScreen from '../Screens/MyBookingScreen';
import MyPaymentsScreen from '../Screens/MyPaymentsScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const nav = useNavigation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: 60,
          backgroundColor: 'white',
          borderTopWidth: 0,
        },
        tabBarShowLabel: false,
      }}>
      <Tab.Screen
        name="homeTab"
        component={HomeScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/homeIcon.png')}
              style={[styles.tabIcon, focused && styles.tabIconFocused]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="myBooking"
        component={MyBookingScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/agenda.png')}
              style={[styles.tabIcon, focused && styles.tabIconFocused]}
            />
          ),
headerBackVisible:false
        }}
      />
      <Tab.Screen
        name="payment"
        component={MyPaymentsScreen}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/shopping-bag.png')}
              style={[styles.tabIcon, focused && styles.tabIconFocused]}
            />
          ),
        }}
      />
      <Tab.Screen
        name="account"
        component={Account}
        options={{
          tabBarIcon: ({focused}) => (
            <Image
              source={require('../assets/accountIcon.png')}
              style={[styles.accTabIcon, focused && styles.tabIconFocused]}
            />
          ),
          // header: () => (
          //   <View
          //     style={{
          //       height: 111,
          //       backgroundColor: 'white',
          //       flexDirection: 'row',
          //       paddingHorizontal: 20,
          //       alignItems: 'center',
          //     }}>
          //     <TouchableOpacity onPress={() => nav.goBack()}>
          //       <Text
          //         style={{
          //           fontFamily: 'Sora-Regular',
          //           fontSize: 24,
          //           lineHeight: 30.24,
          //           textAlign: 'left',
          //           color: 'black',
          //         }}>
          //         X
          //       </Text>
          //     </TouchableOpacity>
          //     <Text
          //       style={{
          //         margin: 'auto',
          //         fontFamily: 'Sora-Regular',
          //         fontSize: 24,
          //         lineHeight: 24.9,
          //         textAlign: 'left',
          //         color: 'black',
          //       }}>
          //       Account
          //     </Text>
          //   </View>
          // ),
          headerShown: false,
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabIcon: {
    width: 25,
    height: 25,
    tintColor: '#000',
  },
  tabIconFocused: {
    tintColor: '#F496AC',
    width: 30,
    height: 30,
  },
  accTabIcon: {
    width: 28,
    height: 28,
    tintColor: '#000',
  },
});

export default MainTabNavigator;
