import React, { createContext, useContext, useReducer } from 'react';

// Auth state shape
const initialAuthState = {
  currentStep: 1, // 1: SignUp, 2: OTP, 3: Password
  isLogin: false,
  stepData: {
    signUp: {
      fullname: '',
      national_code: '',
      phone: '',
    },
    otp: {
      code: ['', '', '', '', '', ''],
      phoneNumber: '',
    },
    password: {
      password: '',
      confirmPassword: '',
    }
  }
};

// Action types
const AUTH_ACTIONS = {
  SET_STEP: 'SET_STEP',
  UPDATE_SIGNUP_DATA: 'UPDATE_SIGNUP_DATA',
  UPDATE_OTP_DATA: 'UPDATE_OTP_DATA',
  UPDATE_PASSWORD_DATA: 'UPDATE_PASSWORD_DATA',
  SET_LOGIN: 'SET_LOGIN',
  RESET: 'RESET'
};

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.SET_STEP:
      return {
        ...state,
        currentStep: action.payload
      };

    case AUTH_ACTIONS.UPDATE_SIGNUP_DATA:
      return {
        ...state,
        stepData: {
          ...state.stepData,
          signUp: {
            ...state.stepData.signUp,
            ...action.payload
          }
        }
      };

    case AUTH_ACTIONS.UPDATE_OTP_DATA:
      return {
        ...state,
        stepData: {
          ...state.stepData,
          otp: {
            ...state.stepData.otp,
            ...action.payload
          }
        }
      };

    case AUTH_ACTIONS.UPDATE_PASSWORD_DATA:
      return {
        ...state,
        stepData: {
          ...state.stepData,
          password: {
            ...state.stepData.password,
            ...action.payload
          }
        }
      };

    case AUTH_ACTIONS.SET_LOGIN:
      return {
        ...state,
        isLogin: action.payload
      };

    case AUTH_ACTIONS.RESET:
      return initialAuthState;

    default:
      return state;
  }
};

// Create Context
const AuthContext = createContext();

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialAuthState);

  const actions = {
    setStep: (step) => dispatch({ type: AUTH_ACTIONS.SET_STEP, payload: step }),
    
    updateSignUpData: (data) => dispatch({ 
      type: AUTH_ACTIONS.UPDATE_SIGNUP_DATA, 
      payload: data 
    }),
    
    updateOtpData: (data) => dispatch({ 
      type: AUTH_ACTIONS.UPDATE_OTP_DATA, 
      payload: data 
    }),
    
    updatePasswordData: (data) => dispatch({ 
      type: AUTH_ACTIONS.UPDATE_PASSWORD_DATA, 
      payload: data 
    }),
    
    setLogin: (isLogin) => dispatch({ 
      type: AUTH_ACTIONS.SET_LOGIN, 
      payload: isLogin 
    }),
    
    reset: () => dispatch({ type: AUTH_ACTIONS.RESET }),
    
    // Helper to get all data for final submission
    getAllData: () => ({
      ...state.stepData.signUp,
      ...state.stepData.password
    })
  };

  return (
    <AuthContext.Provider value={{ state, actions }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};