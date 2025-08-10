/**
 * 알림 데이터 시더
 * 사용자 상호작용(좋아요, 댓글, 팔로우)에 기반한 알림 생성
 */

import { PrismaClient, User, Photo, Like, Follow, Comment, Notification } from '@prisma/client'
import { logProgress } from '../utils/logger.js'

interface SeedData {
    users: User[]
    photos: Photo[]
    likes: Like[]
    follows: Follow[]
    comments: Comment[]
}

export async function seedNotifications(
    prisma: PrismaClient,
    data: SeedData
): Promise<Notification[]> {
    const notifications: Notification[] = []
    let notificationCount = 0
    
    // 1. 좋아요 알림 생성
    const likeNotifications = await generateLikeNotifications(prisma, data.likes, data.photos)
    notifications.push(...likeNotifications)
    notificationCount += likeNotifications.length
    
    // 2. 댓글 알림 생성  
    const commentNotifications = await generateCommentNotifications(prisma, data.comments, data.photos)
    notifications.push(...commentNotifications)
    notificationCount += commentNotifications.length
    
    // 3. 팔로우 알림 생성
    const followNotifications = await generateFollowNotifications(prisma, data.follows)
    notifications.push(...followNotifications)
    notificationCount += followNotifications.length
    
    return notifications
}

/**
 * 좋아요 알림 생성
 * 사진에 좋아요를 받으면 사진 작성자에게 알림
 */
async function generateLikeNotifications(
    prisma: PrismaClient,
    likes: Like[],
    photos: Photo[]
): Promise<Notification[]> {
    const notifications: Notification[] = []
    
    // 사진 좋아요만 처리 (댓글/시리즈 좋아요는 제외)
    const photoLikes = likes.filter(like => like.photoId !== null)
    
    // 최근 좋아요들만 알림 생성 (전체의 70% 정도)
    const recentLikes = photoLikes
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, Math.floor(photoLikes.length * 0.7))
    
    for (let i = 0; i < recentLikes.length; i++) {
        const like = recentLikes[i]
        const photo = photos.find(p => p.id === like.photoId)
        
        if (!photo) continue
        
        // 자신의 사진에 자신이 좋아요 한 경우 제외
        if (like.userId === photo.userId) continue
        
        logProgress(i + 1, recentLikes.length, `좋아요 알림`)
        
        const notification = await prisma.notification.create({
            data: {
                userId: photo.userId,      // 알림받는 사람 (사진 작성자)
                actorId: like.userId,      // 알림 발생시킨 사람 (좋아요 한 사람)
                eventType: 'NEW_LIKE',
                photoId: photo.id,
                likeId: like.id,
                isRead: Math.random() < 0.3, // 30% 확률로 이미 읽음
                createdAt: like.createdAt
            }
        })
        
        notifications.push(notification)
    }
    
    return notifications
}

/**
 * 댓글 알림 생성
 * 사진에 댓글을 받으면 사진 작성자에게 알림
 */
async function generateCommentNotifications(
    prisma: PrismaClient,
    comments: Comment[],
    photos: Photo[]
): Promise<Notification[]> {
    const notifications: Notification[] = []
    
    // 사진 댓글만 처리 (시리즈 댓글 제외)
    const photoComments = comments.filter(comment => 
        comment.photoId !== null && comment.parentId === null // 대댓글 제외
    )
    
    // 최근 댓글들만 알림 생성 (전체의 80% 정도)
    const recentComments = photoComments
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, Math.floor(photoComments.length * 0.8))
    
    for (let i = 0; i < recentComments.length; i++) {
        const comment = recentComments[i]
        const photo = photos.find(p => p.id === comment.photoId)
        
        if (!photo) continue
        
        // 자신의 사진에 자신이 댓글 단 경우 제외  
        if (comment.userId === photo.userId) continue
        
        logProgress(i + 1, recentComments.length, `댓글 알림`)
        
        const notification = await prisma.notification.create({
            data: {
                userId: photo.userId,        // 알림받는 사람 (사진 작성자)
                actorId: comment.userId,     // 알림 발생시킨 사람 (댓글 작성자)
                eventType: 'NEW_COMMENT',
                photoId: photo.id,
                commentId: comment.id,
                isRead: Math.random() < 0.4, // 40% 확률로 이미 읽음
                createdAt: comment.createdAt
            }
        })
        
        notifications.push(notification)
    }
    
    return notifications
}

/**
 * 팔로우 알림 생성  
 * 팔로우를 받으면 알림
 */
async function generateFollowNotifications(
    prisma: PrismaClient,
    follows: Follow[]
): Promise<Notification[]> {
    const notifications: Notification[] = []
    
    // 최근 팔로우들만 알림 생성 (전체의 90% 정도)
    const recentFollows = follows
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, Math.floor(follows.length * 0.9))
    
    for (let i = 0; i < recentFollows.length; i++) {
        const follow = recentFollows[i]
        
        logProgress(i + 1, recentFollows.length, `팔로우 알림`)
        
        const notification = await prisma.notification.create({
            data: {
                userId: follow.followingId,    // 알림받는 사람 (팔로우 당한 사람)
                actorId: follow.followerId,    // 알림 발생시킨 사람 (팔로우 한 사람)
                eventType: 'NEW_FOLLOW',
                followId: follow.id,
                isRead: Math.random() < 0.5,   // 50% 확률로 이미 읽음
                createdAt: follow.createdAt
            }
        })
        
        notifications.push(notification)
    }
    
    return notifications
}