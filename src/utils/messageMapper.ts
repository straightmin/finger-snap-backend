import messages_kor from "../i18n/messages/ko.json";
import messages_eng from "../i18n/messages/en.json";
import messages_jpn from "../i18n/messages/ja.json";

export type Language = "ko" | "en" | "ja";

const messages: Record<Language, { [key: string]: string }> = {
    ko: messages_kor as { [key: string]: string },
    en: messages_eng as { [key: string]: string },
    ja: messages_jpn as { [key: string]: string },
};

const formatMessage = (message: string, replacements?: { [key: string]: string | number }) => {
    if (!replacements) {
        return message;
    }
    let formattedMessage = message;
    for (const key in replacements) {
        formattedMessage = formattedMessage.replaceAll(`{${key}}`, String(replacements[key]));
    }
    return formattedMessage;
};

export const getMessage = (key: string, lang: Language = "ko", replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][key] || messages["ko"][key] || key;
    return formatMessage(message, replacements);
};

export const getErrorMessage = (key: string, lang: Language = "ko", replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][`ERROR.${key}`] || messages["ko"][`ERROR.${key}`] || key;
    return formatMessage(message, replacements);
};

export const getSuccessMessage = (key: string, lang: Language = "ko", replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][`SUCCESS.${key}`] || messages["ko"][`SUCCESS.${key}`] || key;
    return formatMessage(message, replacements);
};