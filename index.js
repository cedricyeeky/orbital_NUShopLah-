import { registerRootComponent } from 'expo';

// import App from './App';

// // registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// // It also ensures that whether you load the app in Expo Go or in a native build,
// // the environment is set up appropriately


// import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import {Text, TextInput} from 'react-native';


// AppRegistry.registerComponent(appName, () => App);
registerRootComponent(App);

//ADD this 
if (Text.defaultProps == null) {
    Text.defaultProps = {};
    Text.defaultProps.allowFontScaling = false;
}

if (TextInput.defaultProps == null) {
    TextInput.defaultProps = {};
    TextInput.defaultProps.allowFontScaling = false;
}

{/* <CalendarStrip
    shouldAllowFontScaling={false}
/> */}
