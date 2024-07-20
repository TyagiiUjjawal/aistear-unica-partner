/* eslint-disable prettier/prettier */
// import {configureStore} from '@reduxjs/toolkit';
// import partnerSlice from './reducer';

// const store = configureStore({
//    reducer: {
//      partnerSlice:partnerSlice
//    },
// });

// export default store;

/* eslint-disable prettier/prettier */
import {configureStore, combineReducers} from '@reduxjs/toolkit';
import {persistStore, persistReducer} from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import partnerReducer from './reducer';

const partnerPersistConfig = {
  key: 'partner',
  storage: AsyncStorage,
  whitelist: ['partnerId'],
};

const rootReducer = combineReducers({
  partnerSlice: persistReducer(partnerPersistConfig, partnerReducer),
});

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  blacklist: ['partnerSlice'],
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

const persistor = persistStore(store);

export {store, persistor};
