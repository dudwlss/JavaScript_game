const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// UI 엘리먼트
const hpDisplay = document.getElementById("hpDisplay");
const creditDisplay = document.getElementById("creditDisplay");
const killDisplay = document.getElementById("killDisplay");
const stimStatus = document.getElementById("stimStatus");

// 버튼 연결 (ID를 html과 맞춰주세요: btn1 ~ btn8)
const btns = [
  document.getElementById("btn1"), // 공업
  document.getElementById("btn2"), // 공속
  document.getElementById("btn3"), // 힐
  document.getElementById("btn4"), // 포탑
  document.getElementById("btn5"), // 체력업
  document.getElementById("btn6"), // 이속업
  document.getElementById("btn7"), // 샷건
  document.getElementById("btn8"), // 관통
];

// 버튼 이벤트 연결
btns[0].addEventListener("click", () => upgradeDamage());
btns[1].addEventListener("click", () => upgradeFirerate());
btns[2].addEventListener("click", () => buyHeal());
btns[3].addEventListener("click", () => buyTurret());
btns[4].addEventListener("click", () => upgradeMaxHp());
btns[5].addEventListener("click", () => upgradeSpeed());
btns[6].addEventListener("click", () => upgradeShotgun());
btns[7].addEventListener("click", () => upgradePierce());

// ==========================================
// 1. 게임 설정 및 리소스
// ==========================================
const CANVAS_W = canvas.width;
const CANVAS_H = canvas.height;
const WORLD_W = 2500; // 맵을 조금 더 키움
const WORLD_H = 2500;

const sprites = {
  bg: new Image(),
  marine: new Image(),
  enemy_lv1: new Image(),
  enemy_lv2: new Image(),
  enemy_lv3: new Image(),
  enemy_lv4: new Image(),
  enemy_boss: new Image(),
};

// 이미지 소스 (파일명 확인 필수!)
sprites.bg.src = "./images/image_5.webp";
sprites.marine.src = "./images/image_2.png";
sprites.enemy_lv1.src = "./images/image_0.png";
sprites.enemy_lv2.src = "./images/image_1.png";
sprites.enemy_lv3.src = "./images/image_3.png";
sprites.enemy_lv4.src = "./images/image_4.png";
sprites.enemy_boss.src = "./images/image_7.png";

const enemyTypes = {
  lv1: {
    img: sprites.enemy_lv1,
    hp: 30,
    speed: 130,
    size: 30,
    credits: 15,
    damage: 5,
  },
  lv2: {
    img: sprites.enemy_lv2,
    hp: 80,
    speed: 160,
    size: 35,
    credits: 50,
    damage: 10,
  },
  lv3: {
    img: sprites.enemy_lv3,
    hp: 200,
    speed: 120,
    size: 45,
    credits: 150,
    damage: 20,
  },
  lv4: {
    img: sprites.enemy_lv4,
    hp: 600,
    speed: 130,
    size: 60,
    credits: 400,
    damage: 35,
  },
  boss: {
    img: sprites.enemy_boss,
    hp: 8000,
    speed: 180,
    size: 90,
    credits: 10000,
    damage: 60,
    isBoss: true,
  },
};

const camera = { x: 0, y: 0 };

const player = {
  x: WORLD_W / 2,
  y: WORLD_H / 2,
  radius: 20,
  hp: 100,
  maxHp: 100,
  speed: 240,
  baseFireDelay: 0.25,
  fireDelay: 0.25,
  fireTimer: 0,
  damage: 15,
  facingRight: true,
  pierceCount: 0,
  hasShotgun: false,
  firingAnimTimer: 0,
  recoilOffset: 0,
};

const gameState = {
  lastTime: 0,
  playing: true,
  credits: 0,
  kills: 0,
  spawnTimer: 0,
  spawnDelay: 0.6,
  stim: { active: false, timer: 0, duration: 5, multiplier: 0.3 },
  mouse: { x: 0, y: 0, worldX: 0, worldY: 0, down: false },
  keys: {},
  timeElapsed: 0,
  safeZoneRadius: 450,
  inDanger: false,
};

const turretConfigs = [
  // 1. 개틀링 (기존): 공속 빠름, 데미지 낮음, 사거리 보통
  {
    type: "gatling",
    color: "#ffa94d",
    damage: 15,
    delay: 0.3,
    range: 500,
    bulletSpeed: 700,
    bulletColor: "#ffa94d",
    width: 4,
  },
  // 2. 캐논: 공속 느림, 데미지 강력, 사거리 긺, 탄속 느림
  {
    type: "cannon",
    color: "#ff4444",
    damage: 70,
    delay: 1.5,
    range: 650,
    bulletSpeed: 450,
    bulletColor: "#ff0000",
    width: 12,
  },
  // 3. 레이저: 공속 보통, 관통됨(구현예정), 탄속 매우 빠름
  {
    type: "laser",
    color: "#00ffff",
    damage: 30,
    delay: 0.8,
    range: 800,
    bulletSpeed: 1500,
    bulletColor: "#00ffff",
    width: 3,
  },
];

const bullets = [];
const enemies = [];
const turrets = [];
const walls = [];

const sounds = {
  shot: new Audio(
    "data:audio/wav;base64,UklGRnQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVQAAAAAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAfHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fHx8fA=="
  ),
};
sounds.shot.volume = 0.1;

// ==========================================
// 2. 맵 및 벽 생성
// ==========================================
function initMap() {
  for (let i = 0; i < 50; i++) {
    const w = 60 + Math.random() * 120;
    const h = 60 + Math.random() * 120;
    const x = Math.random() * (WORLD_W - w);
    const y = Math.random() * (WORLD_H - h);
    const dist = Math.hypot(x - WORLD_W / 2, y - WORLD_H / 2);
    if (dist > 600) walls.push({ x, y, w, h });
  }
  // 기지 벽
  walls.push({ x: WORLD_W / 2 - 250, y: WORLD_H / 2 - 250, w: 500, h: 20 });
  walls.push({ x: WORLD_W / 2 - 250, y: WORLD_H / 2 + 250, w: 500, h: 20 });
  walls.push({ x: WORLD_W / 2 - 250, y: WORLD_H / 2 - 250, w: 20, h: 180 });
  walls.push({ x: WORLD_W / 2 - 250, y: WORLD_H / 2 + 70, w: 20, h: 200 });
  walls.push({ x: WORLD_W / 2 + 230, y: WORLD_H / 2 - 250, w: 20, h: 520 });
}
initMap();

// ==========================================
// 3. 유틸 및 업그레이드 로직
// ==========================================
function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}
function getDistance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}
function checkWallCollision(x, y, r) {
  for (let w of walls) {
    if (x + r > w.x && x - r < w.x + w.w && y + r > w.y && y - r < w.y + w.h)
      return true;
  }
  return false;
}

function purchase(cost, callback) {
  if (gameState.credits >= cost) {
    gameState.credits -= cost;
    callback();
  }
}

// --- 업그레이드 함수 구현 ---
function upgradeDamage() {
  purchase(150, () => (player.damage += 3));
}
function upgradeFirerate() {
  purchase(
    200,
    () => (player.baseFireDelay = Math.max(0.05, player.baseFireDelay * 0.85))
  );
}
function buyHeal() {
  purchase(80, () => (player.hp = Math.min(player.hp + 50, player.maxHp)));
}
function buyTurret() {
  purchase(300, () => turrets.push({ x: player.x, y: player.y, cooldown: 0 }));
}

// 신규 업그레이드
function upgradeMaxHp() {
  purchase(250, () => {
    player.maxHp += 50;
    player.hp += 50;
  });
}
function upgradeSpeed() {
  purchase(180, () => (player.speed += 20));
}
function upgradeShotgun() {
  if (player.hasShotgun) return; // 중복 구매 불가 (또는 레벨업으로 변경 가능)
  purchase(800, () => {
    player.hasShotgun = true;
    btns[6].textContent = "[7] 산탄 사격 (완료)";
    btns[6].disabled = true;
  });
}
function upgradePierce() {
  purchase(600, () => {
    player.pierceCount += 1;
    btns[7].textContent = `[8] 관통 강화 (+${player.pierceCount}) (600C)`;
  });
}

// ==========================================
// 4. 게임 로직
// ==========================================
function updateCamera() {
  camera.x = clamp(player.x - CANVAS_W / 2, 0, WORLD_W - CANVAS_W);
  camera.y = clamp(player.y - CANVAS_H / 2, 0, WORLD_H - CANVAS_H);
}

function spawnEnemy() {
  const distFromCenter = getDistance(player, {
    x: WORLD_W / 2,
    y: WORLD_H / 2,
  });
  if (distFromCenter < gameState.safeZoneRadius) {
    gameState.inDanger = false;
    return;
  }
  gameState.inDanger = true;

  const angle = Math.random() * Math.PI * 2;
  const dist = 550 + Math.random() * 200;
  const x = player.x + Math.cos(angle) * dist;
  const y = player.y + Math.sin(angle) * dist;

  if (x < 0 || x > WORLD_W || y < 0 || y > WORLD_H) return;
  if (checkWallCollision(x, y, 20)) return;

  let type = enemyTypes.lv1;
  const t = gameState.timeElapsed;
  const r = Math.random();

  // [수정됨] 더 가혹해진 난이도 스케줄
  if (t < 20) {
    type = enemyTypes.lv1;
  } else if (t < 60) {
    type = r < 0.6 ? enemyTypes.lv1 : enemyTypes.lv2;
  } else if (t < 120) {
    if (r < 0.3) type = enemyTypes.lv1;
    else if (r < 0.8) type = enemyTypes.lv2;
    else type = enemyTypes.lv3;
  } else if (t < 180) {
    // 3분 -> 2분으로 단축 (Lv4 조기 등장)
    if (r < 0.3) type = enemyTypes.lv2;
    else if (r < 0.7) type = enemyTypes.lv3;
    else type = enemyTypes.lv4;
  } else {
    // 3분 이후: 보스 등장 확률 증가
    const bossExists = enemies.some((e) => e.isBoss);
    if (!bossExists && r < 0.03) {
      // 등장 확률 2% -> 3%
      type = enemyTypes.boss;
    } else {
      type = r < 0.5 ? enemyTypes.lv3 : enemyTypes.lv4;
    }
  }

  enemies.push({
    x,
    y,
    radius: type.size / 2,
    speed: type.speed,
    hp: type.hp * (1 + t * 0.02), // 체력 증가폭 2배 상향
    maxHp: type.hp * (1 + t * 0.02),
    damage: type.damage,
    credits: type.credits,
    img: type.img,
    size: type.size,
    isBoss: type.isBoss || false,
    skillCooldown: 2.0, // 보스 스킬 쿨타임 초기화
  });
}

function handleInput(dt) {
  gameState.mouse.worldX = gameState.mouse.x + camera.x;
  gameState.mouse.worldY = gameState.mouse.y + camera.y;

  let dx = 0,
    dy = 0;
  if (gameState.keys.KeyW) dy -= 1;
  if (gameState.keys.KeyS) dy += 1;
  if (gameState.keys.KeyA) dx -= 1;
  if (gameState.keys.KeyD) dx += 1;

  if (dx !== 0 || dy !== 0) {
    const len = Math.hypot(dx, dy);
    const moveX = (dx / len) * player.speed * dt;
    const moveY = (dy / len) * player.speed * dt;
    if (!checkWallCollision(player.x + moveX, player.y, player.radius))
      player.x += moveX;
    if (!checkWallCollision(player.x, player.y + moveY, player.radius))
      player.y += moveY;
  }

  player.x = clamp(player.x, player.radius, WORLD_W - player.radius);
  player.y = clamp(player.y, player.radius, WORLD_H - player.radius);
  player.facingRight = gameState.mouse.worldX > player.x;

  if (gameState.keys.Space) {
    if (!gameState.stim.active && player.hp > 20) {
      player.hp -= 15;
      gameState.stim.active = true;
      gameState.stim.timer = gameState.stim.duration;
      player.fireDelay = player.baseFireDelay * gameState.stim.multiplier;
    }
  }

  // --- 발사 로직 (산탄/일반) ---
  player.fireTimer -= dt;
  if (gameState.mouse.down && player.fireTimer <= 0) {
    const angle = Math.atan2(
      gameState.mouse.worldY - player.y,
      gameState.mouse.worldX - player.x
    );

    // 기본 총알 발사 함수
    const fire = (offsetAngle) => {
      const a = angle + offsetAngle;
      bullets.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * 750,
        vy: Math.sin(a) * 750,
        radius: 4,
        damage: player.damage,
        life: 1.2,
        color: "#5ce4ff",
        pierceLeft: player.pierceCount, // 관통력 설정
        hitList: [], // 이미 맞춘 적 ID 목록 (중복 타격 방지용)
      });
    };

    fire(0); // 중앙 발사

    // 샷건이면 추가 발사
    if (player.hasShotgun) {
      fire(-0.15); // 살짝 위
      fire(0.15); // 살짝 아래
    }

    // ★ [추가됨] 발사 효과 발동 (소리 재생 바로 밑에 추가하세요)
    const s = sounds.shot.cloneNode();
    s.volume = 0.1;
    s.play().catch(() => {});

    // 애니메이션 트리거
    player.firingAnimTimer = 0.06; // 0.06초 동안 불꽃 표시
    player.recoilOffset = 6; // 6픽셀만큼 뒤로 밀림

    player.fireTimer = player.fireDelay;
  }
}

function updateEntities(dt) {
  // 1. 총알 업데이트
  for (let i = bullets.length - 1; i >= 0; i--) {
    const b = bullets[i];
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    b.life -= dt;
    if (checkWallCollision(b.x, b.y, b.radius)) b.life = 0;
    if (b.life <= 0) {
      bullets.splice(i, 1);
      continue;
    }
  }

  // 2. 적 업데이트
  for (let i = enemies.length - 1; i >= 0; i--) {
    const e = enemies[i];
    e.id = e.id || Math.random();

    const angle = Math.atan2(player.y - e.y, player.x - e.x);
    const moveX = Math.cos(angle) * e.speed * dt;
    const moveY = Math.sin(angle) * e.speed * dt;

    if (!checkWallCollision(e.x + moveX, e.y, e.radius)) e.x += moveX;
    if (!checkWallCollision(e.x, e.y + moveY, e.radius)) e.y += moveY;

    // ★ [수정됨] 보스 스킬 (데미지 대폭 감소)
    if (e.isBoss) {
      e.skillCooldown -= dt;
      if (e.skillCooldown <= 0) {
        const baseAngle = Math.atan2(player.y - e.y, player.x - e.x);
        const offsets = [-0.3, 0, 0.3];

        offsets.forEach((offset) => {
          bullets.push({
            x: e.x,
            y: e.y,
            vx: Math.cos(baseAngle + offset) * 550,
            vy: Math.sin(baseAngle + offset) * 550,
            radius: 12,
            damage: 15, // ★ 기존 40 -> 15 (이제 한방에 안 죽음!)
            life: 4,
            color: "#00ff00",
            pierceLeft: 0,
            hitList: [],
            isHostile: true,
          });
        });
        e.skillCooldown = 1.5;
      }
    }

    // 충돌 처리 (플레이어 피격 포함)
    bullets.forEach((b) => {
      // 적의 총알(보스 스킬) -> 플레이어 피격
      if (b.isHostile) {
        if (getDistance(player, b) < player.radius + b.radius) {
          player.hp -= b.damage;
          b.life = 0;
        }
        return;
      }

      // 터렛 총알
      if (b.color === "#ffa94d") {
        if (getDistance(e, b) < e.radius + b.radius) {
          e.hp -= b.damage;
          b.life = 0;
        }
        return;
      }

      // 플레이어 총알
      if (getDistance(e, b) < e.radius + b.radius) {
        if (b.hitList.includes(e.id)) return;
        e.hp -= b.damage;
        b.hitList.push(e.id);
        if (b.pierceLeft > 0) b.pierceLeft--;
        else b.life = 0;
      }
    });

    // 몸통 박치기 데미지
    if (getDistance(e, player) < e.radius + player.radius) {
      player.hp -= e.damage * dt;
    }

    // 사망 처리
    if (e.hp <= 0) {
      gameState.credits += e.credits;
      gameState.kills++;
      enemies.splice(i, 1);

      // 난이도 가속 (더 빠르게 빨라짐)
      const timeFactor = gameState.timeElapsed * 0.003;
      const killFactor = gameState.kills * 0.002;
      gameState.spawnDelay = Math.max(0.1, 0.8 - timeFactor - killFactor);
    }
  }

  // ★ [수정됨] 포탑 로직 (종류별 발사)
  turrets.forEach((t) => {
    t.cooldown -= dt;
    if (t.cooldown <= 0 && enemies.length > 0) {
      let closest = null,
        minDist = t.range; // 포탑별 사거리 적용

      enemies.forEach((e) => {
        const d = getDistance(t, e);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      });

      if (closest) {
        const angle = Math.atan2(closest.y - t.y, closest.x - t.x);
        bullets.push({
          x: t.x,
          y: t.y,
          vx: Math.cos(angle) * t.bulletSpeed,
          vy: Math.sin(angle) * t.bulletSpeed,
          radius: t.width, // 총알 크기(두께)
          damage: t.damage,
          life: 1.5,
          color: t.bulletColor, // 포탑별 색상
          pierceLeft: t.type === "laser" ? 2 : 0, // 레이저는 2명 관통
          hitList: [],
          isHostile: false,
        });
        t.cooldown = t.delay;
      }
    }
  });

  if (gameState.stim.active) {
    gameState.stim.timer -= dt;
    if (gameState.stim.timer <= 0) {
      gameState.stim.active = false;
      player.fireDelay = player.baseFireDelay;
    }
  }

  gameState.spawnTimer -= dt;
  if (gameState.spawnTimer <= 0) {
    spawnEnemy();
    gameState.spawnTimer = gameState.spawnDelay;
  }
}

function spawnTurretItem() {
  purchase(200, () => {
    // 3가지 중 랜덤 선택
    const randIndex = Math.floor(Math.random() * turretConfigs.length);
    const config = turretConfigs[randIndex];

    turrets.push({
      x: player.x,
      y: player.y,
      cooldown: 0,
      ...config, // 선택된 포탑의 설정값 복사
    });
  });
}

// ==========================================
// 5. 그리기
// ==========================================
function drawGame() {
  // 1. 배경 그리기
  if (sprites.bg.complete && sprites.bg.naturalWidth !== 0) {
    const pattern = ctx.createPattern(sprites.bg, "repeat");
    ctx.fillStyle = pattern;
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    ctx.fillRect(camera.x, camera.y, CANVAS_W, CANVAS_H);
    ctx.restore();
  } else {
    ctx.fillStyle = "#111";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
  }

  // 2. 벽 그리기
  ctx.fillStyle = "#555";
  ctx.strokeStyle = "#222";
  ctx.lineWidth = 2;
  walls.forEach((w) => {
    ctx.fillRect(w.x - camera.x, w.y - camera.y, w.w, w.h);
    ctx.strokeRect(w.x - camera.x, w.y - camera.y, w.w, w.h);
    ctx.beginPath();
    ctx.moveTo(w.x - camera.x, w.y - camera.y);
    ctx.lineTo(w.x + w.w - camera.x, w.y + w.h - camera.y);
    ctx.stroke();
  });

  // 3. 안전지대 라인
  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  ctx.strokeStyle = "rgba(100, 255, 100, 0.2)";
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.arc(WORLD_W / 2, WORLD_H / 2, gameState.safeZoneRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // 4. 포탑
  turrets.forEach((t) => {
    ctx.save();
    ctx.translate(t.x - camera.x, t.y - camera.y);

    // 그림자
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.beginPath();
    ctx.arc(2, 2, 12, 0, Math.PI * 2);
    ctx.fill();

    // 포탑 베이스 (종류별 색상)
    ctx.fillStyle = t.color;

    if (t.type === "cannon") {
      // 캐논
      ctx.fillRect(-12, -12, 24, 24);
      ctx.fillStyle = "#darkred";
      ctx.fillRect(-6, -6, 12, 12);
    } else if (t.type === "laser") {
      // 레이저
      ctx.beginPath();
      ctx.moveTo(0, -15);
      ctx.lineTo(12, 10);
      ctx.lineTo(-12, 10);
      ctx.fill();
    } else {
      // 개틀링
      ctx.beginPath();
      ctx.arc(0, 0, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(0, 0, 5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  });

  // 5. 적 그리기
  let bossRef = null; // 보스가 있으면 여기에 저장

  enemies.forEach((e) => {
    const sx = e.x - camera.x,
      sy = e.y - camera.y;

    // 화면 밖 최적화
    if (
      !e.isBoss &&
      (sx < -150 || sx > CANVAS_W + 150 || sy < -150 || sy > CANVAS_H + 150)
    )
      return;
    if (e.isBoss) bossRef = e;

    ctx.save();
    ctx.translate(sx, sy);
    if (player.x < e.x) ctx.scale(-1, 1);

    if (e.img.complete && e.img.naturalWidth !== 0) {
      const size = e.size * 1.6;
      ctx.drawImage(e.img, -size / 2, -size / 2, size, size);
    } else {
      ctx.fillStyle = e.isBoss ? "purple" : "red";
      ctx.beginPath();
      ctx.arc(0, 0, e.radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // 일반 몹 HP바
    if (!e.isBoss && e.hp < e.maxHp) {
      ctx.fillStyle = "black";
      ctx.fillRect(-20, -e.radius - 12, 40, 6);
      ctx.fillStyle = "red";
      ctx.fillRect(-20, -e.radius - 12, 40 * (e.hp / e.maxHp), 6);
    }
    ctx.restore();
  });

  // 6. 플레이어
  ctx.save();
  ctx.translate(player.x - camera.x, player.y - camera.y);

  if (player.recoilOffset > 0.1) {
    const angle = Math.atan2(
      gameState.mouse.worldY - player.y,
      gameState.mouse.worldX - player.x
    );
    ctx.translate(
      -Math.cos(angle) * player.recoilOffset,
      -Math.sin(angle) * player.recoilOffset
    );
  }

  if (!player.facingRight) ctx.scale(-1, 1);

  if (sprites.marine.complete && sprites.marine.naturalWidth !== 0) {
    const size = 70;
    ctx.drawImage(sprites.marine, -size / 2, -size / 2, size, size);

    // 총구 화염
    if (player.firingAnimTimer > 0) {
      const flashX = 35;
      const flashY = 8;
      const size = 20 + Math.random() * 10;
      const color = Math.random() > 0.5 ? "#ffff00" : "#ffaa00";
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(
        flashX,
        flashY,
        size / 1.5,
        size,
        Math.PI / 2,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.shadowColor = "orange";
      ctx.shadowBlur = 20;
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  } else {
    ctx.fillStyle = "#00aaff";
    ctx.beginPath();
    ctx.arc(0, 0, player.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 7. 총알
  bullets.forEach((b) => {
    const sx = b.x - camera.x;
    const sy = b.y - camera.y;
    if (sx < -50 || sx > CANVAS_W + 50 || sy < -50 || sy > CANVAS_H + 50)
      return;

    ctx.save();
    ctx.translate(sx, sy);
    const angle = Math.atan2(b.vy, b.vx);
    ctx.rotate(angle);

    if (b.color === "#5ce4ff" || b.color === "#ffa94d") {
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-15, -2, 30, 4);
    } else if (b.color === "#ff0000") {
      ctx.shadowColor = "red";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#ff8888";
      ctx.fillRect(-10, -6, 20, 12);
    } else if (b.color === "#00ffff") {
      ctx.shadowColor = "cyan";
      ctx.shadowBlur = 20;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-30, -1, 60, 2);
    } else if (b.color === "#00ff00") {
      ctx.shadowColor = "#00ff00";
      ctx.shadowBlur = 15;
      ctx.fillStyle = "#ccffcc";
      ctx.beginPath();
      ctx.arc(0, 0, b.radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.restore();
  });

  // 8. UI 오버레이
  if (gameState.inDanger) {
    if (!bossRef) {
      ctx.fillStyle = "rgba(255, 0, 0, 0.08)";
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
      ctx.fillStyle = "#ff3333";
      ctx.font = "bold 24px Arial";
      ctx.fillText("⚠️ DANGER ZONE ⚠️", CANVAS_W / 2 - 120, 40);
    }
  } else {
    ctx.fillStyle = "#66ff66";
    ctx.font = "bold 24px Arial";
    ctx.fillText("🛡️ SAFE ZONE", CANVAS_W / 2 - 80, 40);
  }

  // 9. 보스 체력바
  if (bossRef) {
    const barWidth = 600;
    const barHeight = 25;
    const x = CANVAS_W / 2 - barWidth / 2;
    const y = 80;

    ctx.fillStyle = "#ff00ff";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText("☠️ QUEEN OF BLADES ☠️", CANVAS_W / 2, y - 10);
    ctx.textAlign = "start";

    ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.fillRect(x, y, barWidth, barHeight);
    ctx.strokeRect(x, y, barWidth, barHeight);

    const hpPercent = Math.max(0, bossRef.hp / bossRef.maxHp);
    ctx.fillStyle = "#9900ff";
    ctx.fillRect(x + 2, y + 2, (barWidth - 4) * hpPercent, barHeight - 4);

    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.textAlign = "center";
    ctx.fillText(
      `${Math.floor(bossRef.hp)} / ${Math.floor(bossRef.maxHp)}`,
      CANVAS_W / 2,
      y + 18
    );
    ctx.textAlign = "start";
  }
}

function drawMinimap() {
  const mapSize = 150,
    mapX = 20,
    mapY = CANVAS_H - mapSize - 20,
    scale = mapSize / WORLD_W;
  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.fillRect(mapX, mapY, mapSize, mapSize);
  ctx.strokeStyle = "#00ff00";
  ctx.lineWidth = 1;
  ctx.strokeRect(mapX, mapY, mapSize, mapSize);
  ctx.fillStyle = "#555";
  walls.forEach((w) =>
    ctx.fillRect(
      mapX + w.x * scale,
      mapY + w.y * scale,
      w.w * scale,
      w.h * scale
    )
  );
  ctx.fillStyle = "red";
  enemies.forEach((e) =>
    ctx.fillRect(mapX + e.x * scale, mapY + e.y * scale, 3, 3)
  );
  ctx.fillStyle = "#0f0";
  ctx.beginPath();
  ctx.arc(mapX + player.x * scale, mapY + player.y * scale, 3, 0, Math.PI * 2);
  ctx.fill();
}

function updateHud() {
  hpDisplay.textContent = `${Math.floor(player.hp)} / ${player.maxHp}`;
  creditDisplay.textContent = gameState.credits;
  killDisplay.textContent = gameState.kills;
  stimStatus.textContent = gameState.stim.active ? `ON!` : "OFF";
}

function gameLoop(timestamp) {
  if (!gameState.lastTime) gameState.lastTime = timestamp;
  const dt = Math.min((timestamp - gameState.lastTime) / 1000, 0.05);
  gameState.lastTime = timestamp;

  if (gameState.playing && player.hp > 0) {
    gameState.timeElapsed += dt;
    updateCamera();
    handleInput(dt);
    updateEntities(dt);
    updateHud();
  } else if (player.hp <= 0) {
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#ff3333";
    ctx.font = "bold 60px Arial";
    ctx.textAlign = "center";
    ctx.fillText("M.I.A.", CANVAS_W / 2, CANVAS_H / 2 - 20);
    ctx.fillStyle = "white";
    ctx.font = "30px Arial";
    ctx.fillText(`SCORE: ${gameState.kills}`, CANVAS_W / 2, CANVAS_H / 2 + 40);
    return;
  }
  ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
  drawGame();
  drawMinimap();
  requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
  gameState.keys[e.code] = true;
  if (e.key === "1") upgradeDamage();
  if (e.key === "2") upgradeFirerate();
  if (e.key === "3") buyHeal();
  if (e.key === "4") buyTurret();
  if (e.key === "5") upgradeMaxHp();
  if (e.key === "6") upgradeSpeed();
  if (e.key === "7") upgradeShotgun();
  if (e.key === "8") upgradePierce();
});
window.addEventListener("keyup", (e) => (gameState.keys[e.code] = false));
canvas.addEventListener("mousemove", (e) => {
  const r = canvas.getBoundingClientRect();
  gameState.mouse.x = (e.clientX - r.left) * (canvas.width / r.width);
  gameState.mouse.y = (e.clientY - r.top) * (canvas.height / r.height);
});
canvas.addEventListener("mousedown", () => (gameState.mouse.down = true));
window.addEventListener("mouseup", () => (gameState.mouse.down = false));

requestAnimationFrame(gameLoop);
