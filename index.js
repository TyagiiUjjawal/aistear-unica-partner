/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import './Utils/firebase-messaging';

AppRegistry.registerComponent(appName, () => App);
