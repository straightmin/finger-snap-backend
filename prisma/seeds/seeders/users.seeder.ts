/**
 * 사용자 데이터 시더
 * 패스워드 해싱 및 프로필 생성
 */

import { PrismaClient, User } from '@prisma/client'
import bcrypt from 'bcrypt'
import { usersData } from '../data/users.data.js'
import { logProgress } from '../utils/logger.js'

export async function seedUsers(prisma: PrismaClient): Promise<User[]> {
    const users: User[] = []
    
    for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i]
        logProgress(i + 1, usersData.length, `사용자 ${userData.username}`)
        
        // 패스워드 해싱
        const passwordHash = await bcrypt.hash(userData.password, 12)
        
        // 사용자 생성
        const user = await prisma.user.create({
            data: {
                email: userData.email,
                passwordHash,
                username: userData.username,
                bio: userData.bio,
                profileImageUrl: userData.profileImageUrl,
                // 알림 설정 기본값
                notifyLikes: true,
                notifyComments: true,
                notifyFollows: true,
                notifySeries: true,
                createdAt: getRandomDateInPast(90), // 최근 3개월 내 가입
                updatedAt: new Date()
            }
        })
        
        users.push(user)
    }
    
    return users
}

/**
 * 과거 N일 이내의 랜덤한 날짜 생성
 */
function getRandomDateInPast(maxDaysAgo: number): Date {
    const now = new Date()
    const msPerDay = 24 * 60 * 60 * 1000
    const randomDaysAgo = Math.floor(Math.random() * maxDaysAgo)
    return new Date(now.getTime() - (randomDaysAgo * msPerDay))
}