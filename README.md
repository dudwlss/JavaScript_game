# 🛡️ Terran Last Stand: Hardcore Defense

![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-yellow?logo=javascript)
![HTML5 Canvas](https://img.shields.io/badge/HTML5-Canvas-orange?logo=html5)
![License](https://img.shields.io/badge/License-MIT-blue)

**Terran Last Stand**는 HTML5 Canvas와 순수 JavaScript(Vanilla JS)로 제작된 탑다운 슈팅 디펜스 게임입니다.
스타크래프트(StarCraft)에서 영감을 받아 제작되었으며, 끊임없이 몰려오는 적들로부터 살아남아 캐릭터를 성장시키고 보스를 처치하는 것이 목표입니다.

## 🎮 게임 플레이 (Game Play)

플레이어는 '마린(Marine)'이 되어 척박한 행성에서 몰려오는 외계 생명체들을 막아내야 합니다.
기지(Safe Zone) 밖으로 나가면 적들이 땅에서 솟아오르며, 시간이 지날수록 적들은 더욱 강력해지고 빨라집니다.

### ✨ 주요 기능 (Key Features)

* **하드코어 난이도 시스템**: 게임 시간이 경과하고 킬 수가 늘어날수록 적의 스폰 속도가 기하급수적으로 빨라집니다.
* **다양한 적 유형**: Lv1(기본)부터 Lv4(정예), 그리고 강력한 스킬을 사용하는 **보스(Queen of Blades)**까지 총 5단계의 적이 등장합니다.
* **성장 및 업그레이드**: 적을 처치해 얻은 크레딧(Credit)으로 8가지 능력을 실시간으로 업그레이드할 수 있습니다.
* **전략적 요소**:
    * **3종류의 포탑**: 개틀링(Gatling), 캐논(Cannon), 레이저(Laser) 포탑을 랜덤하게 설치하여 화력을 지원받을 수 있습니다.
    * **지형지물**: 맵 곳곳에 배치된 벽을 이용해 적의 이동을 방해하고 엄폐할 수 있습니다.
    * **안전지대**: 중앙 기지 내부는 안전하지만, 적을 사냥하려면 밖으로 나가야 합니다.
* **화려한 시각 효과**:
    * 네온 스타일의 총알 궤적 (Tracer)
    * 마린의 총구 화염(Muzzle Flash) 및 반동(Recoil) 애니메이션
    * 보스 전용 체력바 및 스킬 이펙트

## 🕹️ 조작 방법 (Controls)

| 키 (Key) | 동작 (Action) |
| :---: | :--- |
| **W, A, S, D** | 캐릭터 이동 |
| **Mouse Move** | 조준 (Aim) |
| **Mouse Click** | 사격 (Shoot) |
| **Space** | 스팀팩 사용 (HP 소모, 공속 증가) |
| **1 ~ 8** | 상점 업그레이드 단축키 |

## 🛠️ 기술 스택 (Tech Stack)

* **Frontend**: HTML5, CSS3
* **Core Logic**: Vanilla JavaScript (No Frameworks)
* **Rendering**: HTML5 Canvas API (2D Context)

## 🚀 실행 방법 (How to Run)

이 프로젝트는 별도의 설치 과정 없이 웹 브라우저에서 바로 실행할 수 있습니다.

1.  이 저장소를 클론(Clone) 하거나 다운로드합니다.
    ```bash
    git clone [https://github.com/your-username/terran-last-stand.git](https://github.com/your-username/terran-last-stand.git)
    ```
2.  프로젝트 폴더 내에 `images` 폴더를 생성하고, 필요한 이미지 에셋을 위치시킵니다. (아래 파일 구조 참고)
3.  `index.html` 파일을 웹 브라우저(Chrome, Edge 등)로 엽니다.
    * *권장: VS Code의 'Live Server' 확장을 사용하면 더 원활하게 실행됩니다.*

## 📂 파일 구조 (File Structure)

```text
terran-last-stand/
├── index.html       # 게임 실행 및 UI 레이아웃
├── game.js          # 게임의 모든 로직 (엔진, 엔티티, 렌더링)
├── style.css        # (선택사항) 스타일 시트
├── README.md        # 프로젝트 설명 파일
└── images/          # 이미지 리소스 폴더
    ├── image_0.png  # Enemy Lv1
    ├── image_1.png  # Enemy Lv2
    ├── image_2.png  # Marine (Player)
    ├── image_3.png  # Enemy Lv3
    ├── image_4.png  # Enemy Lv4
    ├── image_5.webp # Background
    └── image_7.png  # Boss (Queen)
