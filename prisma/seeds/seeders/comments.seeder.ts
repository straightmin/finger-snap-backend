/**
 * 댓글 데이터 시더
 * 일반 댓글 및 대댓글 생성 (요구사항: 일반 댓글 0-15개, 대댓글 30% 비율)
 */

import { PrismaClient, User, Photo, Comment } from '@prisma/client'
import { commentTemplates, replyTemplates, shortComments } from '../data/comments.data.js'
import { logProgress } from '../utils/logger.js'

export async function seedComments(
    prisma: PrismaClient, 
    users: User[], 
    photos: Photo[]
): Promise<Comment[]> {
    const comments: Comment[] = []
    let totalCommentsToCreate = 0
    
    // 1단계: 각 사진별 댓글 계획 수립
    const photoCommentPlans = photos.map(photo => {
        const commentCount = calculateCommentCount(photo.viewCount, photo.createdAt)
        totalCommentsToCreate += commentCount
        return {
            photo,
            commentCount
        }
    })
    
    let currentCommentIndex = 0
    
    // 2단계: 각 사진별로 댓글 생성
    for (const plan of photoCommentPlans) {
        const { photo, commentCount } = plan
        
        if (commentCount === 0) continue
        
        // 댓글할 사용자들 선택 (사진 작성자 제외)
        const commentingUsers = selectCommentingUsers(users, commentCount, photo.userId)
        const photoComments: Comment[] = []
        
        // 일반 댓글 생성
        for (const user of commentingUsers) {
            currentCommentIndex++
            logProgress(currentCommentIndex, totalCommentsToCreate, `${photo.title}에 댓글`)
            
            const content = selectCommentContent()
            const commentedAt = getRandomDateAfter(photo.createdAt)
            
            const comment = await prisma.comment.create({
                data: {
                    userId: user.id,
                    photoId: photo.id,
                    content,
                    parentId: null, // 일반 댓글
                    createdAt: commentedAt,
                    updatedAt: commentedAt
                }
            })
            
            photoComments.push(comment)
            comments.push(comment)
        }
        
        // 대댓글 생성 (일반 댓글의 30% 정도)
        const replyCount = Math.floor(photoComments.length * 0.3)
        const photoAuthor = users.find(u => u.id === photo.userId)!
        
        for (let i = 0; i < replyCount; i++) {
            currentCommentIndex++
            
            const parentComment = photoComments[i]
            const replyContent = selectReplyContent()
            const repliedAt = getRandomDateAfter(parentComment.createdAt, 24) // 24시간 내 답글
            
            logProgress(currentCommentIndex, totalCommentsToCreate, `${photo.title}에 답글`)
            
            const reply = await prisma.comment.create({
                data: {
                    userId: photoAuthor.id, // 주로 사진 작성자가 답글
                    photoId: photo.id,
                    content: replyContent,
                    parentId: parentComment.id,
                    createdAt: repliedAt,
                    updatedAt: repliedAt
                }
            })
            
            comments.push(reply)
        }
        
        totalCommentsToCreate += replyCount
    }
    
    return comments
}

/**
 * 사진의 조회수와 업로드 시점을 고려하여 댓글 수 계산
 */
function calculateCommentCount(viewCount: number, uploadDate: Date): number {
    const now = new Date()
    const daysOld = Math.floor((now.getTime() - uploadDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // 댓글 비율: 조회수의 1-5% (좋아요보다 낮음)
    const ageMultiplier = Math.max(0.2, 1 - (daysOld / 120)) // 더 천천히 감소
    const baseRatio = 0.01 + (Math.random() * 0.04) // 1-5%
    const adjustedRatio = baseRatio * ageMultiplier
    
    const expectedComments = Math.floor(viewCount * adjustedRatio)
    
    // 최소 0개, 최대 15개로 제한 (요구사항)
    return Math.min(Math.max(0, expectedComments), 15)
}

/**
 * 댓글할 사용자들 선택
 */
function selectCommentingUsers(users: User[], commentCount: number, photoAuthorId: number): User[] {
    // 사진 작성자를 제외한 사용자들
    const availableUsers = users.filter(user => user.id !== photoAuthorId)
    
    if (commentCount === 0) return []
    
    // 중복 허용으로 변경 (한 사용자가 여러 댓글 가능)
    const commentingUsers: User[] = []
    
    for (let i = 0; i < commentCount; i++) {
        // 80% 확률로 다른 사용자, 20% 확률로 이미 댓글 단 사용자
        if (commentingUsers.length > 0 && Math.random() < 0.2) {
            // 기존 댓글 작성자 중 랜덤 선택
            const existingCommenter = commentingUsers[Math.floor(Math.random() * commentingUsers.length)]
            commentingUsers.push(existingCommenter)
        } else {
            // 새로운 사용자 선택
            const randomUser = availableUsers[Math.floor(Math.random() * availableUsers.length)]
            commentingUsers.push(randomUser)
        }
    }
    
    return commentingUsers
}

/**
 * 댓글 내용 선택 (길이에 따라 분류)
 */
function selectCommentContent(): string {
    const rand = Math.random()
    
    if (rand < 0.3) {
        // 30% - 짧은 반응형 댓글
        return shortComments[Math.floor(Math.random() * shortComments.length)]
    } else {
        // 70% - 일반 댓글
        return commentTemplates[Math.floor(Math.random() * commentTemplates.length)]
    }
}

/**
 * 대댓글 내용 선택
 */
function selectReplyContent(): string {
    return replyTemplates[Math.floor(Math.random() * replyTemplates.length)]
}

/**
 * 특정 날짜 이후의 랜덤한 날짜 생성 (시간 제한 옵션)
 */
function getRandomDateAfter(afterDate: Date, maxHoursLater?: number): Date {
    const now = new Date()
    const timeDiff = now.getTime() - afterDate.getTime()
    
    if (timeDiff <= 0) {
        return new Date(afterDate.getTime() + Math.random() * 1000 * 60 * 60)
    }
    
    let maxOffset = timeDiff
    
    // 시간 제한이 있는 경우
    if (maxHoursLater) {
        const maxOffsetByHours = maxHoursLater * 60 * 60 * 1000
        maxOffset = Math.min(timeDiff, maxOffsetByHours)
    }
    
    const randomOffset = Math.random() * maxOffset
    return new Date(afterDate.getTime() + randomOffset)
}