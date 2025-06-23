import messages_kor from "../i18n/messages/ko.json";
import messages_eng from "../i18n/messages/en.json";

type Language = "ko" | "en";

const messages: Record<Language, { [key: string]: string }> = {
    ko: messages_kor as { [key: string]: string },
    en: messages_eng as { [key: string]: string },
};

export const getMessage = (key: string, lang: Language = "ko") => {
    return messages[lang][key] || messages["ko"][key] || key;
};
