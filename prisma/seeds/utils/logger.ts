/**
 * 시드 스크립트용 로깅 유틸리티
 */

export function logStep(message: string) {
    console.log(`\n🔄 ${message}`)
}

export function logSuccess(message: string) {
    console.log(`✅ ${message}`)
}

export function logError(message: string, error?: unknown) {
    console.error(`❌ ${message}`)
    if (error) {
        console.error(error)
    }
}

export function logProgress(current: number, total: number, item: string) {
    const percentage = Math.round((current / total) * 100)
    console.log(`   ${item} (${current}/${total}) ${percentage}%`)
}