// 다국어 지원 (i18n) - 한국어/영어

const translations = {
    ko: {
        // 메인 메뉴
        startMission: '임무 시작',
        ranking: '순위',
        settings: '설정',
        today: '오늘',
        weekly: '주간',
        noRecords: '아직 기록이 없습니다',

        // 튜토리얼
        tutorial: '조작법',
        tutorialTitle: '조작 가이드',
        pcControls: 'PC 조작',
        mobileControls: '모바일 조작',
        moveKeys: 'WASD 또는 화살표로 이동',
        bombKey: 'B키로 폭탄 사용',
        touchMove: '화면 터치로 이동',
        bombButton: '💣 버튼으로 폭탄 사용',
        gotIt: '알겠습니다!',
        skipTutorial: '다시 보지 않기',

        // 설정
        bgmVolume: 'BGM 볼륨',
        sfxVolume: '효과음 볼륨',
        language: '언어',
        pause: '일시정지',
        resume: '계속하기',
        close: '닫기',

        // 게임 화면
        score: '점수',
        energy: '에너지',
        shield: '보호막',
        bomb: '폭탄',
        boss: '보스',

        // 게임 오버
        gameOver: '게임 오버',
        finalScore: '최종 점수',
        enterName: '이름 입력',
        submit: '등록',
        restart: '다시 시작',
        mainMenu: '메인 메뉴',
        share: '공유',

        // 승리
        missionComplete: '임무 완료!',
        clearTime: '클리어 시간',
        timeBonus: '시간 보너스',

        // 레벨 선택
        selectLevel: '레벨 선택',
        level: '레벨',
        locked: '잠금',
        unlocked: '해제됨',

        // 업적
        achievements: '업적',
        achievementUnlocked: '업적 달성!',

        // 로딩
        loading: '로딩 중...',
        loadingAssets: '에셋 로딩 중',

        // 에러
        networkError: '네트워크 오류가 발생했습니다',
        offlineMode: '오프라인 모드입니다',
        retry: '다시 시도',

        // 공유
        shareTitle: '운석특공대에서 {score}점 달성!',
        shareText: '나의 최고 점수: {score}점! 도전해보세요!',
    },
    en: {
        // Main Menu
        startMission: 'Start Mission',
        ranking: 'Ranking',
        settings: 'Settings',
        today: 'Today',
        weekly: 'Weekly',
        noRecords: 'No records yet',

        // Tutorial
        tutorial: 'Controls',
        tutorialTitle: 'Control Guide',
        pcControls: 'PC Controls',
        mobileControls: 'Mobile Controls',
        moveKeys: 'Move with WASD or Arrow keys',
        bombKey: 'Press B for Bomb',
        touchMove: 'Touch to move',
        bombButton: 'Tap 💣 for Bomb',
        gotIt: 'Got it!',
        skipTutorial: "Don't show again",

        // Settings
        bgmVolume: 'BGM Volume',
        sfxVolume: 'SFX Volume',
        language: 'Language',
        pause: 'Pause',
        resume: 'Resume',
        close: 'Close',

        // Game Screen
        score: 'Score',
        energy: 'Energy',
        shield: 'Shield',
        bomb: 'Bomb',
        boss: 'Boss',

        // Game Over
        gameOver: 'Game Over',
        finalScore: 'Final Score',
        enterName: 'Enter Name',
        submit: 'Submit',
        restart: 'Restart',
        mainMenu: 'Main Menu',
        share: 'Share',

        // Victory
        missionComplete: 'Mission Complete!',
        clearTime: 'Clear Time',
        timeBonus: 'Time Bonus',

        // Level Select
        selectLevel: 'Select Level',
        level: 'Level',
        locked: 'Locked',
        unlocked: 'Unlocked',

        // Achievements
        achievements: 'Achievements',
        achievementUnlocked: 'Achievement Unlocked!',

        // Loading
        loading: 'Loading...',
        loadingAssets: 'Loading assets',

        // Error
        networkError: 'Network error occurred',
        offlineMode: 'Offline mode',
        retry: 'Retry',

        // Share
        shareTitle: 'Scored {score} in Meteor Commando!',
        shareText: 'My high score: {score}! Try to beat it!',
    }
};

// 현재 언어 (localStorage에서 로드)
let currentLanguage = 'ko';

// 초기화
export const initI18n = () => {
    const saved = localStorage.getItem('meteor-commando-lang');
    if (saved && translations[saved]) {
        currentLanguage = saved;
    }
};

// 언어 가져오기
export const getLanguage = () => currentLanguage;

// 언어 설정
export const setLanguage = (lang) => {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('meteor-commando-lang', lang);
    }
};

// 번역 함수
export const t = (key, params = {}) => {
    const text = translations[currentLanguage]?.[key] || translations.ko[key] || key;

    // 파라미터 치환 ({score} -> 실제 값)
    return text.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey] !== undefined ? params[paramKey] : match;
    });
};

// 언어 목록
export const getAvailableLanguages = () => [
    { code: 'ko', name: '한국어' },
    { code: 'en', name: 'English' }
];

// 초기화 실행
initI18n();
