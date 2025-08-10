/**
 * 샘플 사용자 데이터
 * 요구사항 문서의 사용자 프로필을 실제 스키마에 맞게 조정
 */

export interface SeedUserData {
    email: string
    password: string  // 평문 (해싱은 seeder에서 처리)
    username: string
    bio: string
    profileImageUrl?: string
}

export const usersData: SeedUserData[] = [
    {
        email: "nature.photographer@example.com",
        password: "nature123!",
        username: "nature_kim",
        bio: "자연 속에서 찾는 소소한 일상의 아름다움을 담습니다. 📸🌿",
        profileImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b69a69a1?w=150&h=150&fit=crop&crop=face"
    },
    {
        email: "city.explorer@example.com", 
        password: "city123!",
        username: "city_park",
        bio: "도시의 숨겨진 매력을 발견하고 기록하는 것을 좋아합니다. 🏙️✨",
        profileImageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
    },
    {
        email: "forest.walker@example.com",
        password: "forest123!",
        username: "forest_lee",
        bio: "숲속 오솔길을 걸으며 만나는 순간들을 사진으로 남깁니다.",
        profileImageUrl: undefined // 프로필 이미지 없는 사용자
    },
    {
        email: "sea.dreamer@example.com",
        password: "sea123!",
        username: "sea_choi", 
        bio: "바다와 하늘이 만나는 지점에서 영감을 얻습니다. 🌊☁️",
        profileImageUrl: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face"
    },
    {
        email: "star.gazer@example.com",
        password: "star123!",
        username: "star_jung",
        bio: "밤하늘의 별빛처럼 반짝이는 순간들을 포착합니다. ⭐🌙",
        profileImageUrl: undefined // 프로필 이미지 없는 사용자
    }
]