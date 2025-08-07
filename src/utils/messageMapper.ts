import messages_kor from '../i18n/messages/ko.json';
import messages_eng from '../i18n/messages/en.json';
import messages_jpn from '../i18n/messages/ja.json';

export type Language = 'ko' | 'en' | 'ja';

const messages: Record<Language, { [key: string]: string }> = {
    ko: messages_kor as { [key: string]: string },
    en: messages_eng as { [key: string]: string },
    ja: messages_jpn as { [key: string]: string },
};

/**
 * 메시지 내의 플레이스홀더를 처리합니다.
 * @param message 원본 메시지
 * @param replacements 치환할 값들
 * @returns 포맷팅된 메시지
 */
const formatMessage = (message: string, replacements?: { [key: string]: string | number }) => {
    if (!replacements) {
        return message;
    }
    let formattedMessage = message;
    for (const key in replacements) {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        formattedMessage = formattedMessage.replace(regex, String(replacements[key]));
    }
    return formattedMessage;
};

/**
 * 일반 메시지를 가져옵니다.
 * @param key 메시지 키
 * @param lang 언어 설정
 * @param replacements 치환할 값들
 * @returns 다국어 메시지
 */
export const getMessage = (key: string, lang: Language = 'ko', replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][key] || messages['ko'][key] || key;
    return formatMessage(message, replacements);
};

/**
 * 에러 메시지를 가져옵니다.
 * @param key 메시지 키 (ERROR. 접두어 자동 추가)
 * @param lang 언어 설정
 * @param replacements 치환할 값들
 * @returns 다국어 에러 메시지
 */
export const getErrorMessage = (key: string, lang: Language = 'ko', replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][`ERROR.${key}`] || messages['ko'][`ERROR.${key}`] || key;
    return formatMessage(message, replacements);
};

/**
 * 성공 메시지를 가져옵니다.
 * @param key 메시지 키 (SUCCESS. 접두어 자동 추가)
 * @param lang 언어 설정
 * @param replacements 치환할 값들
 * @returns 다국어 성공 메시지
 */
export const getSuccessMessage = (key: string, lang: Language = 'ko', replacements?: { [key: string]: string | number }) => {
    const message = messages[lang][`SUCCESS.${key}`] || messages['ko'][`SUCCESS.${key}`] || key;
    return formatMessage(message, replacements);
};