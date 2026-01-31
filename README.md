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
- 🛡️ **보호막 시스템** - 적의 공격으로부터 보호
- 🏆 **로컬 랭킹 시스템** - 오늘/주간 최고 점수 기록
- 📱 **크로스 플랫폼** - PC (WASD/방향키) 및 모바일 터치 지원

---

## 🛠️ 기술 스택

| 기술 | 설명 |
|------|------|
| **React 18** | 선언적 UI 오케스트레이션 |
| **Vite 6** | 빠른 HMR 및 빌드 파이프라인 |
| **HTML5 Canvas** | 60fps 고성능 렌더링 엔진 |
| **CSS Modules** | 반응형 HUD 및 메뉴 스타일링 |

---

## 📁 프로젝트 구조

```
src/
├── main.jsx                 # React 엔트리 포인트
├── App.jsx                  # 최상위 오케스트레이터 (게임 상태, UI 동기화)
├── constants/
│   └── gameConfig.js        # 게임 밸런스 설정 (스폰율, HP, 인터벌)
├── game/
│   ├── Enemy.js             # 적/보스 클래스 로직
│   ├── renderer.js          # 상태 비저장 캔버스 렌더링
│   └── ...                  # 파티클, 아이템 등
├── hooks/
│   ├── useInput.js          # 입력 추상화 (마우스/터치/키보드)
│   └── useWeapon.js         # 발사 패턴 관리
├── components/
│   ├── Game/
│   │   └── GameCanvas.jsx   # 게임 루프 & Ref 관리
│   └── UI/
│       ├── HUD.jsx          # 플레이어 상태 표시
│       └── GameOver.jsx     # 점수 및 랭킹 UI
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

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

### 모바일 테스트

LAN을 통한 실제 기기 테스트를 위해 `--host` 플래그가 기본 활성화되어 있습니다:

```bash
npm run dev  # 자동으로 LAN 접근 허용
```

---

## 🎮 조작법

### PC
| 키 | 동작 |
|---|------|
| `WASD` / `방향키` | 이동 |
| `마우스 이동` | 조준 |
| `자동 발사` | - |

### Mobile
- **터치 드래그**: 우주선 이동
- **자동 발사**: 게임 시작 시 활성화

---

## 🏆 게임 밸런싱

- **무기 레벨 감소**: Lv 3 이상에서 10초마다 1레벨 감소
- **파워 아이템 드롭률**: 3%
- **운석 HP**: 시간 경과에 따른 점진적 증가
- **보스 스케일**: 1단계(2x) → 2단계(4x) → 3단계(5x)

---

## 📄 라이선스

MIT License - 자유롭게 수정 및 배포 가능합니다.

---

<div align="center">

**Made with ❤️ using Vibe Coding**

</div>
