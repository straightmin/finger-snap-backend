/**
 * 샘플 사진 데이터
 * 요구사항: 15-20장, 각 사용자별 3-5장 분산, 업로드 시기/좋아요/댓글 수 다양성
 */

export interface SeedPhotoData {
    title: string
    description: string
    imageUrl: string
    userIndex: number  // usersData 배열의 인덱스
    daysAgo: number   // 며칠 전 업로드
    viewCount: number
    isPublic: boolean
}

export const photosData: SeedPhotoData[] = [
    // nature_kim의 사진들 (4장)
    {
        title: "산속의 아침",
        description: "새벽 안개가 피어오르는 산속에서 맞이한 평화로운 아침의 순간입니다.",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
        userIndex: 0,
        daysAgo: 1,
        viewCount: 1247,
        isPublic: true
    },
    {
        title: "지리산 일출",
        description: "지리산 천왕봉에서 바라본 장엄한 일출의 순간",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1000&fit=crop",
        userIndex: 0,
        daysAgo: 5,
        viewCount: 856,
        isPublic: true
    },
    {
        title: "숲속 햇살",
        description: "나뭇잎 사이로 스며드는 따스한 아침햇살",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=900&fit=crop",
        userIndex: 0,
        daysAgo: 12,
        viewCount: 423,
        isPublic: true
    },
    {
        title: "새벽 안개",
        description: "산자락을 감싸는 신비로운 새벽 안개의 모습",
        imageUrl: "https://images.unsplash.com/photo-1419133203517-f3b3c0c2b8bf?w=800&h=1100&fit=crop",
        userIndex: 0,
        daysAgo: 20,
        viewCount: 234,
        isPublic: true
    },

    // city_park의 사진들 (4장)
    {
        title: "도시의 야경",
        description: "번화가 네온사인이 만들어내는 환상적인 밤의 풍경",
        imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&h=1000&fit=crop",
        userIndex: 1,
        daysAgo: 2,
        viewCount: 892,
        isPublic: true
    },
    {
        title: "서울 스카이라인",
        description: "한강에서 바라본 서울의 아름다운 스카이라인",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop",
        userIndex: 1,
        daysAgo: 8,
        viewCount: 1156,
        isPublic: true
    },
    {
        title: "골목길의 정취",
        description: "익숙하지만 새로운 골목길 풍경",
        imageUrl: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800&h=1200&fit=crop",
        userIndex: 1,
        daysAgo: 15,
        viewCount: 367,
        isPublic: true
    },
    {
        title: "카페 창가",
        description: "오후 햇살이 드리우는 카페 창가의 일상",
        imageUrl: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&h=900&fit=crop",
        userIndex: 1,
        daysAgo: 25,
        viewCount: 445,
        isPublic: true
    },

    // forest_lee의 사진들 (4장)
    {
        title: "숲속의 오솔길",
        description: "햇살이 스며드는 숲속 길을 따라 걸으며 찍은 사진",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=1400&fit=crop",
        userIndex: 2,
        daysAgo: 3,
        viewCount: 564,
        isPublic: true
    },
    {
        title: "계곡의 물소리",
        description: "맑은 계곡물이 흘러가는 평화로운 순간",
        imageUrl: "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800&h=1000&fit=crop",
        userIndex: 2,
        daysAgo: 10,
        viewCount: 312,
        isPublic: true
    },
    {
        title: "가을 단풍",
        description: "형형색색 물든 가을 단풍의 아름다움",
        imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=800&fit=crop",
        userIndex: 2,
        daysAgo: 45,
        viewCount: 789,
        isPublic: true
    },
    {
        title: "새소리가 들리는 숲",
        description: "이른 아침, 새소리만이 들리는 고요한 숲",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=1200&fit=crop",
        userIndex: 2,
        daysAgo: 60,
        viewCount: 156,
        isPublic: true
    },

    // sea_choi의 사진들 (4장)
    {
        title: "바다와 구름",
        description: "푸른 바다 위로 펼쳐진 구름의 장관",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=900&fit=crop",
        userIndex: 3,
        daysAgo: 4,
        viewCount: 1523,
        isPublic: true
    },
    {
        title: "석양과 바다",
        description: "수평선 너머로 지는 석양의 장관",
        imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&h=1000&fit=crop",
        userIndex: 3,
        daysAgo: 7,
        viewCount: 934,
        isPublic: true
    },
    {
        title: "파도의 리듬",
        description: "끊임없이 밀려오는 파도의 자연스러운 리듬",
        imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=800&fit=crop",
        userIndex: 3,
        daysAgo: 18,
        viewCount: 567,
        isPublic: true
    },
    {
        title: "바다 너머 섬",
        description: "수평선 너머 아스라이 보이는 작은 섬",
        imageUrl: "https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=800&h=1100&fit=crop",
        userIndex: 3,
        daysAgo: 30,
        viewCount: 401,
        isPublic: true
    },

    // star_jung의 사진들 (4장)
    {
        title: "사막의 별",
        description: "깊은 밤 사막에서 바라본 은하수의 장엄함",
        imageUrl: "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=800&h=1100&fit=crop",
        userIndex: 4,
        daysAgo: 5,
        viewCount: 2156,
        isPublic: true
    },
    {
        title: "달빛 아래",
        description: "보름달이 비추는 고요한 밤의 풍경",
        imageUrl: "https://images.unsplash.com/photo-1444927714506-8492d94b5ba0?w=800&h=900&fit=crop",
        userIndex: 4,
        daysAgo: 11,
        viewCount: 1324,
        isPublic: true
    },
    {
        title: "새벽별과 지평선",
        description: "동이 트기 전 마지막으로 빛나는 새벽별",
        imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=800&fit=crop",
        userIndex: 4,
        daysAgo: 22,
        viewCount: 887,
        isPublic: true
    },
    {
        title: "은하수 여행",
        description: "무한한 우주를 향한 꿈같은 여행",
        imageUrl: "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&h=1200&fit=crop",
        userIndex: 4,
        daysAgo: 35,
        viewCount: 643,
        isPublic: true
    }
]