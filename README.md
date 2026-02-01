# 🚀 운석특공대 (Meteor Commando)

<div align="center">

**AI 기반 개발로 탄생한 탑다운 아케이드 슈팅 게임**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://unseok.vercel.app)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev)

[🎮 플레이하기](https://unseok.vercel.app) • [📖 문서](#프로젝트-구조) • [🛠️ 개발 가이드](#개발-환경-설정)

</div>

---

## 🎮 게임 소개

**운석특공대**는 React와 HTML5 Canvas를 활용한 고성능 2D 탑다운 슈팅 게임입니다. 플레이어는 우주선을 조종하여 쏟아지는 운석을 피하고, 3명의 거대 보스를 물리쳐 미션을 완수해야 합니다.

### ✨ 주요 특징

- 🎯 **미션 기반 진행** - 3단계 보스 시스템 (2배, 4배, 5배 스케일)
- ⚡ **10단계 무기 레벨** - 파워업 아이템으로 무기 강화
- 🛡️ **보호막 시스템** - 최대 3중첩 가능
- 💣 **폭탄 시스템** - 화면 전체 적 제거 및 보스 대량 데미지
- 🏆 **로컬 랭킹 시스템** - 오늘/주간 최고 점수 기록
- 📱 **크로스 플랫폼** - PC (WASD/방향키) 및 모바일 터치 지원

---

## 🎮 게임 밸런스

### 아이템 시스템

| 아이템 | 드랍률 | 효과 |
|--------|--------|------|
| 파워 | 3% | 무기 레벨 +1, 에너지 +5 |
| 쉴드 | 1% (파편에서만) | 보호막 +1 (최대 3) |
| 폭탄 | 보스 보상 | 폭탄 +1 (최대 2) |
| 체력 | 보스 보상 | 에너지 +30 |

### 보장 아이템 드랍

| 아이템 | 드랍 시간 |
|--------|-----------|
| 파워 | 게임 시작 8~10초 |
| 쉴드 | 게임 시작 18~20초 |

### 보스 시스템

| 보스 | 등장 시간 | 크기 | 충돌 데미지 |
|------|-----------|------|-------------|
| 1차 | 30초 | 2배 | 10 |
| 2차 | 1차 처치 후 30초 | 4배 | 20 |
| 3차 | 2차 처치 후 30초 | 5배 | 30 |

### 레벨 시스템

| 레벨 | 목표 점수 | 보스 간격 | 총 보스 |
|------|-----------|-----------|---------|
| 1 | 120,000 | 30초 | 3 |

---

## 🛠️ 기술 스택

| 기술 | 설명 |
|------|------|
| **React 18** | 선언적 UI 오케스트레이션 |
| **Vite 6** | 빠른 HMR 및 빌드 파이프라인 |
| **HTML5 Canvas** | 60fps 고성능 렌더링 엔진 |
| **CSS Modules** | 반응형 HUD 및 메뉴 스타일링 |
| **Web Audio API** | 저지연 사운드 시스템 |

---

## 📁 프로젝트 구조

```
src/
├── main.jsx                 # React 엔트리 포인트
├── App.jsx                  # 최상위 오케스트레이터
├── constants/
│   └── gameConfig.js        # 게임 밸런스 및 레벨 설정
├── game/
│   ├── Enemy.js             # 적/보스 클래스 로직
│   ├── Item.js              # 아이템 클래스
│   ├── Particle.js          # 파티클 이펙트
│   └── renderer.js          # 캔버스 렌더링
├── hooks/
│   ├── useInput.js          # 입력 추상화 (마우스/터치/키보드)
│   ├── useWeapon.js         # 발사 패턴 관리
│   ├── useGameState.js      # 게임 상태 관리
│   ├── useBoss.js           # 보스 시스템
│   ├── useEffects.js        # 이펙트 관리
│   └── useSound.js          # 사운드 시스템
├── components/
│   ├── Game/
│   │   └── GameCanvas.jsx   # 게임 루프 & Ref 관리
│   └── UI/
│       ├── HUD/             # 플레이어 상태 표시
│       ├── StartScreen/     # 시작 화면
│       ├── GameOver/        # 게임 오버 화면
│       └── VictoryScreen/   # 미션 클리어 화면
└── utils/
    └── leaderboard.js       # LocalStorage 영속성 로직
```

---

## 🚀 개발 환경 설정

### 사전 요구사항

- Node.js 18.x 이상
- npm 또는 yarn

### 설치 및 실행

```bash
# 저장소 클론
git clone https://github.com/demoon84/unseok.git
cd unseok

# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 모바일 테스트 (LAN 접근)
npm run dev -- --host

# 프로덕션 빌드
npm run build
```

---

## 🎮 조작법

### PC
| 키 | 동작 |
|---|------|
| `WASD` / `방향키` | 이동 |
| `마우스 이동` | 조준 |
| `B` | 폭탄 사용 |
| `자동 발사` | - |

### Mobile
- **터치 드래그**: 우주선 이동
- **폭탄 버튼**: HUD에서 터치
- **자동 발사**: 게임 시작 시 활성화

---

## 🎵 오디오 크레딧

본 게임에 사용된 모든 오디오 에셋은 무료 상업용 라이센스입니다.

| 에셋 | 라이센스 | 제작자 | 링크 |
|------|----------|--------|------|
| 효과음 (50개) | CC0 | rubberduck | [50 CC0 Sci-Fi SFX](https://opengameart.org/content/50-cc0-sci-fi-sfx) |
| 아이템 획득음 | CC-BY 3.0 | Blender Foundation | [Yo Frankie!](https://opengameart.org/content/positive-item-pickup-yo-frankie) |
| BGM "Through Space" | CC-BY-SA 3.0 | maxstack | [OpenGameArt](https://opengameart.org/content/through-space) |

---

## 📄 라이선스

MIT License - 자유롭게 수정 및 배포 가능합니다.

---

<div align="center">

**Made with ❤️ using Vibe Coding**

</div>
