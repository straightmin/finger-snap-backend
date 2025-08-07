import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { getErrorMessage, Language } from './messageMapper';

/**
 * 커스텀 에러 클래스 - 상태 코드와 i18n 키를 포함합니다.
 */
export class ValidationError extends Error {
    statusCode: number;
    i18nKey?: string;
    
    constructor(message: string, statusCode: number = 400, i18nKey?: string) {
        super(message);
        this.statusCode = statusCode;
        this.i18nKey = i18nKey;
        this.name = 'ValidationError';
    }
}

/**
 * Joi 스키마 검증 미들웨어 팩토리
 * @param schema Joi 검증 스키마
 * @param property 검증할 요청 속성 (body, params, query)
 * @returns Express 미들웨어 함수
 */
export const validateSchema = (schema: Joi.ObjectSchema, property: 'body' | 'params' | 'query' = 'body') => {
    return (req: Request, res: Response, next: NextFunction): void => {
        const { error } = schema.validate(req[property], { abortEarly: false });
        
        if (error) {
            const lang = (req.lang as Language) ?? 'ko';
            const validationErrors = error.details.map(detail => {
                // Joi 에러를 i18n 키로 매핑
                const i18nKey = mapJoiErrorToI18nKeyMemo(detail);
                return {
                    field: detail.path.join('.'),
                    message: getErrorMessage(i18nKey, lang),
                    value: detail.context?.value
                };
            });
            
            res.status(400).json({
                status: 'error',
                statusCode: 400,
                message: getErrorMessage('VALIDATION.FAILED', lang),
                errors: validationErrors
            });
            return;
        }
        
        next();
    };
};

/**
 * Joi 에러 세부사항을 i18n 키로 매핑합니다.
 * @param detail Joi 에러 세부사항
 * @returns i18n 키
 */
const mapJoiErrorToI18nKeyMemo = (() => {
    const cache = new Map<string, string>();
    
    return (detail: Joi.ValidationErrorItem): string => {
        const { type } = detail;
        
        if (cache.has(type)) {
            return cache.get(type)!;
        }
        
        let result: string;
        switch (type) {
            case 'any.required':
                result = 'VALIDATION.REQUIRED';
                break;
            case 'string.empty':
                result = 'VALIDATION.EMPTY';
                break;
            case 'string.min':
                result = 'VALIDATION.STRING_MIN';
                break;
            case 'string.max':
                result = 'VALIDATION.STRING_MAX';
                break;
            case 'string.email':
                result = 'VALIDATION.EMAIL_INVALID';
                break;
            case 'number.min':
                result = 'VALIDATION.NUMBER_MIN';
                break;
            case 'number.max':
                result = 'VALIDATION.NUMBER_MAX';
                break;
            case 'number.positive':
                result = 'VALIDATION.NUMBER_POSITIVE';
                break;
            case 'boolean.base':
                result = 'VALIDATION.BOOLEAN_INVALID';
                break;
            default:
                result = 'VALIDATION.INVALID';
                break;
        }
        
        cache.set(type, result);
        return result;
    };
})();



/**
 * ID 유효성 검사 유틸리티 함수
 * @param id 문자열 형태의 ID
 * @returns 유효한 숫자 ID 또는 null
 */
export const validateId = (id: string): number | null => {
    const numId = parseInt(id, 10);
    return isNaN(numId) || numId <= 0 ? null : numId;
};

/**
 * 일반적인 유효성 검사 스키마들
 */
export const commonSchemas = {
    id: Joi.number().integer().positive().required(),
    pagination: Joi.object({
        page: Joi.number().integer().min(1).default(1),
        limit: Joi.number().integer().min(1).max(100).default(20)
    }),
    
    // 사용자 관련 스키마
    userRegister: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        username: Joi.string().min(2).max(50).required()
    }),
    
    userLogin: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),
    
    notificationSettings: Joi.object({
        notifyLikes: Joi.boolean().optional(),
        notifyComments: Joi.boolean().optional(),
        notifyFollows: Joi.boolean().optional(),
        notifySeries: Joi.boolean().optional()
    }),

    userProfileUpdate: Joi.object({
        username: Joi.string().min(2).max(50).optional(),
        bio: Joi.string().max(500).allow('').optional(),
        profileImageUrl: Joi.string().uri().allow('').optional(),
        notifyLikes: Joi.boolean().optional(),
        notifyComments: Joi.boolean().optional(),
        notifyFollows: Joi.boolean().optional(),
        notifySeries: Joi.boolean().optional()
    }),
    
    // 사진 관련 스키마
    photoCreate: Joi.object({
        title: Joi.string().max(200).optional(),
        description: Joi.string().max(2000).allow('').optional(),
        isPublic: Joi.boolean().required()
    }),
    
    // 댓글 관련 스키마
    commentCreate: Joi.object({
        content: Joi.string().min(1).max(1000).required(),
        photoId: Joi.number().integer().positive().optional(),
        seriesId: Joi.number().integer().positive().optional(),
        parentId: Joi.number().integer().positive().optional()
    }).or('photoId', 'seriesId').messages({
        'object.missing': 'At least one of "photoId" or "seriesId" must be provided.'
    }),
    
    // 컬렉션 관련 스키마
    collectionCreate: Joi.object({
        title: Joi.string().min(1).max(200).required(),
        description: Joi.string().max(1000).allow('').optional()
    }),
    
    // 시리즈 관련 스키마
    seriesCreate: Joi.object({
        title: Joi.string().min(1).max(200).required(),
        description: Joi.string().max(2000).allow('').optional(),
        isPublic: Joi.boolean().default(true)
    })
};