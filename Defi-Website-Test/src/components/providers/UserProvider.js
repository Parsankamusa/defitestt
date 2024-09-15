import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import setAuthToken from "../../utils/setAuthToken";
import { SERVER_URL } from "../../constants/env";
import openNotification from "../helpers/notification";
import Wallet from "../../utils/wallet";

const userContextTemplate = {
  useInfo: null,
  userRegister: (requestData) => {},
  sendEmail: (requestData) => {},
  login: (requestData) => {},
  jwtInfo: null,
  wallet: null,
};

const UserContext = React.createContext(userContextTemplate);

function UserProvider(props) {
  const { t, i18n } = useTranslation();
  const [useInfo, setUserInfo] = useState("");
  const [jwtInfo, setJwtInfo] = useState("");
  const wallet = new Wallet();

  const userRegister = useCallback(async (requestData) => {
    try {
      const response = await axios.post(`${SERVER_URL}/users/signup`, requestData);

      if (response.data.response) {
        openNotification(t('Success'), t("Account successfully created!"), true, goWalletMain);
        localStorage.setItem("userInfo", JSON.stringify(response.data.data.userInfo));
        localStorage.setItem("jwtToken", JSON.stringify(response.data.data.token));

        if (response.data.data.keyPair) {
          localStorage.setItem("privateKey", wallet.decrypt(response.data.data.keyPair[0].privateKey));
          localStorage.setItem("publicKey", JSON.stringify(response.data.data.keyPair[0].publicKey));
        }
      } else {
        throw new Error(response.data.message || 'Registration failed');
      }
    } catch (error) {
      console.error('Error during registration:', error.message);
      openNotification(t('Fail!'), error.message || 'Registration failed', false, null);
    }
  }, [SERVER_URL, t, wallet]);

  const sendEmail = useCallback(async (requestData) => {
    try {
      const response = await axios.post(`${SERVER_URL}users/emailverify`, requestData, {
        timeout: 5000 // Set a timeout of 5 seconds
      });

      if (response.data.response) {
        openNotification(t('Success'), t("E-mail sent successfully"), true, null);
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
      if (error.code === 'ECONNABORTED') {
        openNotification(t('Error'), t("Request timed out"), false, null);
      } else if (error.response && error.response.status >= 400) {
        openNotification(t('Error'), error.response.data.message || 'Server error', false, null);
      } else {
        openNotification(t('Error'), t("Failed to send email"), false, null);
      }
    }
  }, [SERVER_URL, t]);

  const login = useCallback(async (requestData) => {
    try {
      const response = await axios.post(`${SERVER_URL}users/emailverify`, requestData);

      if (response.data.response) {
        openNotification(t('Success'), t("E-mail sent successfully"), true, null);
      } else {
        throw new Error(response.data.message || 'Email verification failed');
      }
    } catch (error) {
      console.error('Error sending email:', error.message);
      openNotification(t('Error'), t("Failed to send email"), false, null);
    }
  }, [SERVER_URL, t]);

  const goWalletMain = () => {
    window.location.href = "/walletMain";
  };

  const goMain = () => {
    window.location.href = "/";
  };

  useEffect(() => {
    setUserInfo(localStorage.getItem("userInfo"));
    setJwtInfo(localStorage.getItem("jwtToken"));
  }, [localStorage.getItem("userInfo"), localStorage.getItem("jwtToken")]);

  return (
    <UserContext.Provider value={{
      useInfo,
      userRegister,
      sendEmail,
      jwtInfo,
      wallet,
      login,
      goWalletMain,
      goMain
    }}>
      {props.children}
    </UserContext.Provider>
  );
}

export { UserContext };
export default UserProvider;
