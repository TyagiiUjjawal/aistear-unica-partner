/* eslint-disable prettier/prettier */
import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  info: {
    name: '',
    email: '',
    password: '',
    phoneNumber: '',
    emergencyContact: '',
    referralName: '',
    distanceCanTravel: '',
    pincode: '',
    uid: '',

    photoUrl: '',
    aadharCardUrl: '',
    panCardUrl: '',
    expertIn: [],
    experience: '',
    aadharNumber: '',
    fullAddress: '',
    panCardNumber: '',
    district: '',
    state: '',
    latitude: '',
    longitude: '',
    address: '',

    accountHolderName: '',
    ifscCode: '',
    accountNumber: '',
  },
  partnerId: '',
  bookings: [],
  bookingSuccess: false,
  bookingError: false,
  partnerInfo: {
    name: '',
    email: '',
  },
};

const partnerSlice = createSlice({
  name: 'partnerData',
  initialState,
  reducers: {
    addInformation: (state, action) => {
      state.info = {...state.info, ...action.payload};
    },
    setPartnerId: (state, action) => {
      state.partnerId = action.payload;
    },
    setPartnerInfo: (state, action) => {
      state.partnerInfo = {...state.partnerInfo, ...action.payload};
    },
    setBookingList: (state, action) => {
      state.bookings = action.payload;
    },
  },
});

export const {addInformation, setPartnerId, setBookingList, setPartnerInfo} =
  partnerSlice.actions;

export default partnerSlice.reducer;
