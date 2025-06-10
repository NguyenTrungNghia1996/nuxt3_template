import CryptoJS from "crypto-js";
import { useCookie } from "#app";

const ENCRYPTION_KEY = process.env.NUXT_ENCRYPTION_KEY || "your-secret-key";

export const useAuth = () => {
  const rememberMe = useCookie<boolean>("rememberMe", {
    default: () => false,
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
  });

  const saveCredentials = (username: string, password: string) => {
    const encryptedPassword = CryptoJS.AES.encrypt(password, ENCRYPTION_KEY).toString();

    const usernameCookie = useCookie("username", {
      secure: true,
      sameSite: "strict",
      maxAge: rememberMe.value ? 60 * 60 * 24 * 30 : undefined,
    });

    const passwordCookie = useCookie("password", {
      secure: true,
      sameSite: "strict",
      maxAge: rememberMe.value ? 60 * 60 * 24 * 30 : undefined,
    });

    usernameCookie.value = username;
    passwordCookie.value = encryptedPassword;
  };

  const getCredentials = () => {
    const username = useCookie("username").value;
    const encryptedPassword = useCookie("password").value;

    if (username && encryptedPassword) {
      try {
        const bytes = CryptoJS.AES.decrypt(encryptedPassword, ENCRYPTION_KEY);
        const password = bytes.toString(CryptoJS.enc.Utf8);

        return { username, password };
      } catch (error) {
        clearCredentials();
        return null;
      }
    }
    return null;
  };

  const clearCredentials = () => {
    const usernameCookie = useCookie("username");
    const passwordCookie = useCookie("password");

    usernameCookie.value = null;
    passwordCookie.value = null;
    rememberMe.value = false;
  };

  return {
    rememberMe,
    saveCredentials,
    getCredentials,
    clearCredentials,
  };
};
