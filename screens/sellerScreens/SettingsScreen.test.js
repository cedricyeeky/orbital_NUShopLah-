import React from 'react';
import { render, waitFor, fireEvent, findByText } from '@testing-library/react-native';
import { AuthContext, AuthProvider } from '../../navigation/AuthProvider';
import { firebase } from '../../firebaseconfig';
import SettingsScreen from './SettingsScreen';


