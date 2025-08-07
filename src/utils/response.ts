import { Response } from 'express';
import { getErrorMessage, getSuccessMessage, Language } from './messageMapper';

/**
 * 에러 응답을 전송하는 유틸리티 함수
 * @param res Express Response 객체
 * @param statusCode HTTP 상태 코드
 * @param messageKey i18n 메시지 키
 * @param lang 언어 (기본값: 'ko')
 * @param data 추가 데이터 (선택사항)
 */
export const sendErrorResponse = (
    res: Response, 
    statusCode: number, 
    messageKey: string, 
    lang: Language = 'ko',
    data?: unknown
) => {
    const response: {
        success: boolean;
        message: string;
        data?: unknown;
    } = {
        success: false,
        message: getErrorMessage(messageKey, lang)
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * 성공 응답을 전송하는 유틸리티 함수
 * @param res Express Response 객체
 * @param statusCode HTTP 상태 코드 (기본값: 200)
 * @param messageKey i18n 메시지 키
 * @param lang 언어 (기본값: 'ko')
 * @param data 응답 데이터 (선택사항)
 */
export const sendSuccessResponse = (
    res: Response, 
    statusCode: number = 200,
    messageKey: string, 
    lang: Language = 'ko',
    data?: unknown
) => {
    const response: {
        success: boolean;
        message: string;
        data?: unknown;
    } = {
        success: true,
        message: getSuccessMessage(messageKey, lang)
    };

    if (data) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

/**
 * 페이지네이션이 포함된 성공 응답을 전송하는 유틸리티 함수
 * @param res Express Response 객체
 * @param messageKey i18n 메시지 키
 * @param lang 언어 (기본값: 'ko')
 * @param data 응답 데이터
 * @param pagination 페이지네이션 정보
 */
export const sendPaginatedResponse = (
    res: Response,
    messageKey: string,
    lang: Language = 'ko',
    data: unknown,
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    }
) => {
    return res.status(200).json({
        success: true,
        message: getSuccessMessage(messageKey, lang),
        data,
        pagination
    });
};