import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        home: "Home",
        welcome: "Welcome",
        hello: "Hello {{name}}!",
        chat_app: "Chat App",
        select_chat_handle: "Kindly select a chat handle.",
        talking_to: "Talking to {{name}}",
        search_users: "Search users ...",
        type_a_message: "Type a message ...",
        logout: "logout",
      },
    },
    hi: {
      translation: {
        home: "होम पेज",
        welcome: "स्वागत है",
        hello: "नमस्कार {{name}}!",
        chat_app: "बातचीत एप्लीकेशन",
        select_chat_handle: "कृपया कोई चैट हैंडल चुनें",
        talking_to: "{{name}} से बात कर रहे",
        search_users: "बन्दे ढूंढे ...",
        type_a_message: "यहाँ बात लिंखें ...",
        logout: "लॉगआउट करें",
      },
    },
    // bn: {
    //   translation: {
    //     welcome: "স্বাগতম",
    //     chat_app: "যোগাযোগ অ্যাপ্লিকেশন",
    //     select_chat_handle: "অনুগ্রহ করে একটি চ্যাট হ্যান্ডেল নির্বাচন করুন।",
    //   },
    // },
  },
  fallbackLng: "en",
});

export default i18n;
