const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const stageEl = document.getElementById('stage');
const waveEl = document.getElementById('wave');
const weaponEl = document.getElementById('weapon');
const bossBar = document.getElementById('bossBar');

const menuPanel = document.getElementById('menuPanel');
const startButton = document.getElementById('startButton');
const continueButton = document.getElementById('continueButton');

const difficultySelect = document.getElementById('difficulty');
const controlModeSelect = document.getElementById('controlMode');
const autoFireInput = document.getElementById('autoFire');
const screenShakeInput = document.getElementById('screenShake');
const soundEnabledInput = document.getElementById('soundEnabled');
const stageThemeSelect = document.getElementById('stageTheme');
const playerSkinSelect = document.getElementById('playerSkin');

const touchHud = document.getElementById('touchHud');
const stickBase = document.getElementById('stickBase');
const stickKnob = document.getElementById('stickKnob');
const touchShoot = document.getElementById('touchShoot');
const touchBomb = document.getElementById('touchBomb');
const touchPause = document.getElementById('touchPause');
const touchRestart = document.getElementById('touchRestart');

const SAVE_KEY = 'neo-pixel-assault-save-v2';
const WAVES_PER_STAGE = 5;

const sprites = {
  playerFalcon: ['00033000', '00366300', '036ff630', '36ffff63', '3fffffff', '03f99f30', '03633630', '00300300'],
  playerRaptor: ['00088000', '008cc800', '08c99c80', '8cccccc8', 'ccffffcc', '08c66c80', '00822800', '00088000'],
  playerNova: ['000aa000', '00affa00', '0affffa0', 'aff99ffa', 'affffffa', '0a8aa8a0', '00a00a00', '000aa000'],
  scout: ['0660', '6ff6', 'f66f', '0660'],
  tank: ['077770', '7ffff7', '7f66f7', '7ffff7', '077770'],
  zig: ['0c0c0', 'ccccc', '0cfc0', 'ccccc', '0c0c0'],
  boss: [
    '0000007777777000000',
    '000077fffffff770000',
    '0007fff88888fff7000',
    '007ff88ffffff88ff700',
    '07ff8fffffffff8ff70',
    '7ff8ff66ffff66ff8ff7',
    '7fffffffffffffffffff7',
    '7ff0ff0ffff0ff0ff0f7',
    '07ffffffffffffffff70',
    '007ff0ff0ff0ff0ff700',
    '000770000000000077000',
  ],
  power: ['0aa0', 'affa', 'affa', '0aa0'],
};

const palette = {
  0: null,
  2: '#4f6cff',
  3: '#8ff5ff',
  6: '#42ff9e',
  7: '#ff8460',
  8: '#ff4f8a',
  9: '#ffe96d',
  a: '#66b5ff',
  c: '#cf68ff',
  f: '#ffffff',
};

const playerSpriteMap = { falcon: sprites.playerFalcon, raptor: sprites.playerRaptor, nova: sprites.playerNova };
const difficultyTable = {
  easy: { enemyHpMul: 0.8, enemySpeedMul: 0.85, enemyFireMul: 1.15, bossHpMul: 0.8 },
  normal: { enemyHpMul: 1, enemySpeedMul: 1, enemyFireMul: 1, bossHpMul: 1 },
  hard: { enemyHpMul: 1.4, enemySpeedMul: 1.25, enemyFireMul: 0.82, bossHpMul: 1.45 },
};

const state = {
  keys: new Set(),
  stars: Array.from({ length: 120 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 0.7 + Math.random() * 1.8, size: Math.random() > 0.85 ? 2 : 1 })),
  started: false,
  running: false,
  paused: false,
  score: 0,
  lives: 3,
  stage: 1,
  waveInStage: 1,
  bombs: 2,
  combo: 1,
  comboTimer: 0,
  shake: 0,
  settings: { difficulty: 'normal', controlMode: 'auto', autoFire: false, screenShake: true, soundEnabled: true, stageTheme: 'auto', playerSkin: 'falcon' },
  touch: { enabled: false, active: false, dx: 0, dy: 0, shoot: false },
  player: { x: canvas.width / 2, y: canvas.height - 90, speed: 6, width: 32, height: 32, cooldown: 0, invincible: 0, weapon: 'PEASHOOTER', weaponLevel: 1, weaponTimer: 0 },
  bullets: [], enemyBullets: [], enemies: [], powerups: [], effects: [], boss: null,
};

const audioState = { ctx: null, unlocked: false };
const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function detectTouchDevice() {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

function isMobileControl() {
  if (state.settings.controlMode === 'mobile') return true;
  if (state.settings.controlMode === 'pc') return false;
  return detectTouchDevice();
}

function updateControlModeUI() {
  const mobile = isMobileControl();
  state.touch.enabled = mobile;
  touchHud.classList.toggle('hidden', !mobile || !state.started);
}

function getAudioContext() {
  if (!audioState.ctx) audioState.ctx = new window.AudioContext();
  return audioState.ctx;
}

function ensureAudio() {
  if (!state.settings.soundEnabled) return;
  const audioCtx = getAudioContext();
  if (!audioState.unlocked && audioCtx.state === 'suspended') {
    audioCtx.resume();
    audioState.unlocked = true;
  }
}

function playSfx(type) {
  if (!state.settings.soundEnabled) return;
  const audioCtx = getAudioContext();
  const t = audioCtx.currentTime;
  const gain = audioCtx.createGain();
  gain.connect(audioCtx.destination);

  if (type === 'explosion' || type === 'bossExplosion') {
    const buffer = audioCtx.createBuffer(1, audioCtx.sampleRate * 0.2, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
    const noise = audioCtx.createBufferSource();
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = type === 'bossExplosion' ? 260 : 520;
    noise.buffer = buffer;
    noise.connect(filter);
    filter.connect(gain);
    gain.gain.setValueAtTime(type === 'bossExplosion' ? 0.35 : 0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (type === 'bossExplosion' ? 0.5 : 0.24));
    noise.start(t);
    noise.stop(t + (type === 'bossExplosion' ? 0.52 : 0.26));
    return;
  }

  const osc = audioCtx.createOscillator();
  osc.connect(gain);
  if (type === 'shot') {
    osc.type = 'square'; osc.frequency.setValueAtTime(760, t); osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
    gain.gain.setValueAtTime(0.07, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09); osc.start(t); osc.stop(t + 0.1);
  } else if (type === 'enemyShot') {
    osc.type = 'triangle'; osc.frequency.setValueAtTime(310, t); osc.frequency.exponentialRampToValueAtTime(140, t + 0.12);
    gain.gain.setValueAtTime(0.05, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12); osc.start(t); osc.stop(t + 0.12);
  } else if (type === 'powerup') {
    osc.type = 'sine'; osc.frequency.setValueAtTime(430, t); osc.frequency.linearRampToValueAtTime(900, t + 0.16);
    gain.gain.setValueAtTime(0.1, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2); osc.start(t); osc.stop(t + 0.2);
  } else if (type === 'hit') {
    osc.type = 'sawtooth'; osc.frequency.setValueAtTime(220, t); osc.frequency.exponentialRampToValueAtTime(90, t + 0.2);
    gain.gain.setValueAtTime(0.12, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.21); osc.start(t); osc.stop(t + 0.22);
  } else if (type === 'bossHit') {
    osc.type = 'square'; osc.frequency.setValueAtTime(130, t); osc.frequency.exponentialRampToValueAtTime(70, t + 0.16);
    gain.gain.setValueAtTime(0.11, t); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.17); osc.start(t); osc.stop(t + 0.18);
  }
}

function saveProgress() {
  const data = { stage: state.stage, score: state.score, lives: state.lives, timestamp: Date.now() };
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function loadProgress() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!data.stage) return null;
    return data;
  } catch {
    return null;
  }
}

function updateContinueButton() {
  continueButton.disabled = !loadProgress();
}

function drawSprite(sprite, x, y, scale = 4) {
  for (let row = 0; row < sprite.length; row += 1) {
    for (let col = 0; col < sprite[0].length; col += 1) {
      const color = palette[sprite[row][col]];
      if (!color) continue;
      ctx.fillStyle = color;
      ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
    }
  }
}

function spriteCenterDraw(sprite, cx, cy, scale = 4) {
  const w = sprite[0].length * scale;
  const h = sprite.length * scale;
  drawSprite(sprite, cx - w / 2, cy - h / 2, scale);
  return { w, h };
}

function currentTheme() {
  if (state.settings.stageTheme !== 'auto') return state.settings.stageTheme;
  const themes = ['nebula', 'grid', 'sunset'];
  return themes[(state.stage - 1) % themes.length];
}

function updateHud() {
  scoreEl.textContent = `SCORE: ${String(state.score).padStart(6, '0')}`;
  livesEl.textContent = `LIVES: ${state.lives}  BOMB: ${state.bombs}`;
  stageEl.textContent = `STAGE: ${state.stage}`;
  waveEl.textContent = `WAVE: ${state.waveInStage}/${WAVES_PER_STAGE}`;
  weaponEl.textContent = `WEAPON: ${state.player.weapon}  BG: ${currentTheme().toUpperCase()}`;
  if (state.boss) { bossBar.value = Math.max(0, state.boss.hp); bossBar.max = state.boss.maxHp; }
  else { bossBar.value = 0; bossBar.max = 100; }
}

function resetPlayerLoadout() {
  state.player.weapon = 'PEASHOOTER';
  state.player.weaponLevel = 1;
  state.player.weaponTimer = 0;
}

function resetGame(stage = 1, score = 0, lives = 3) {
  state.running = true;
  state.paused = false;
  state.score = score;
  state.lives = lives;
  state.stage = stage;
  state.waveInStage = 1;
  state.bombs = 2;
  state.combo = 1;
  state.comboTimer = 0;
  state.shake = 0;
  state.player.x = canvas.width / 2;
  state.player.y = canvas.height - 90;
  state.player.cooldown = 0;
  state.player.invincible = 0;
  resetPlayerLoadout();
  state.enemies = [];
  state.bullets = [];
  state.enemyBullets = [];
  state.powerups = [];
  state.effects = [];
  state.boss = null;
  spawnWave();
  updateHud();
}

function spawnEnemy(type, x, y) {
  const diff = difficultyTable[state.settings.difficulty];
  const base = {
    scout: { hp: 1, speedX: 1.6, speedY: 1.05, fire: 130, score: 130, sprite: 'scout' },
    tank: { hp: 4, speedX: 0.8, speedY: 0.7, fire: 180, score: 250, sprite: 'tank' },
    zig: { hp: 2, speedX: 2.2, speedY: 0.95, fire: 120, score: 180, sprite: 'zig' },
  }[type];

  const stageMul = 1 + (state.stage - 1) * 0.14;
  state.enemies.push({
    type, x, y,
    hp: Math.ceil((base.hp + Math.floor(state.stage / 2)) * diff.enemyHpMul * stageMul),
    maxHp: Math.ceil((base.hp + Math.floor(state.stage / 2)) * diff.enemyHpMul * stageMul),
    speedX: base.speedX * diff.enemySpeedMul * (Math.random() > 0.5 ? 1 : -1),
    speedY: base.speedY * diff.enemySpeedMul,
    fireCooldown: base.fire * diff.enemyFireMul * (0.65 + Math.random() * 0.7),
    score: Math.floor(base.score * stageMul),
    sprite: sprites[base.sprite],
    phase: Math.random() * Math.PI * 2,
  });
}

function spawnWave() {
  if (state.waveInStage === WAVES_PER_STAGE) {
    const diff = difficultyTable[state.settings.difficulty];
    const maxHp = Math.floor((350 + state.stage * 120) * diff.bossHpMul);
    state.boss = {
      x: canvas.width / 2,
      y: 130,
      hp: maxHp,
      maxHp,
      direction: 1,
      fireCooldown: 24,
      summonCooldown: 140,
      attackPhase: 0,
      burstCounter: 0,
    };
    return;
  }

  const count = 6 + state.waveInStage * 2 + Math.min(state.stage, 7);
  for (let i = 0; i < count; i += 1) {
    const x = 48 + ((i * 56) % (canvas.width - 96));
    const y = 36 + Math.floor(i / 9) * 52;
    const roll = Math.random();
    const type = roll < 0.45 ? 'scout' : roll < 0.78 ? 'zig' : 'tank';
    spawnEnemy(type, x, y);
  }
}

function addEffect(x, y, color = '#ffffff') {
  state.effects.push({ x, y, life: 18, color, radius: 3 });
}

function firePlayerBullets() {
  if (state.player.cooldown > 0 || !state.running) return;

  const level = state.player.weaponLevel;
  const bullets = [];
  if (state.player.weapon === 'SPREAD') {
    const spread = [-2.2, -1, 0, 1, 2.2].slice(0, 2 + level);
    for (const vx of spread) bullets.push({ x: state.player.x, y: state.player.y - 12, vx, vy: -8.5, power: 1 });
    state.player.cooldown = Math.max(7, 14 - level * 2);
  } else if (state.player.weapon === 'LASER') {
    bullets.push({ x: state.player.x, y: state.player.y - 24, vx: 0, vy: -13, power: 2, laser: true });
    state.player.cooldown = Math.max(5, 10 - level);
  } else {
    bullets.push({ x: state.player.x, y: state.player.y - 16, vx: 0, vy: -9.3, power: 1 });
    if (level > 1) bullets.push({ x: state.player.x - 10, y: state.player.y - 12, vx: -0.6, vy: -8.7, power: 1 });
    if (level > 2) bullets.push({ x: state.player.x + 10, y: state.player.y - 12, vx: 0.6, vy: -8.7, power: 1 });
    state.player.cooldown = Math.max(5, 12 - level * 2);
  }

  state.bullets.push(...bullets);
  playSfx('shot');
}

function useBomb() {
  if (!state.running || state.bombs <= 0) return;
  state.bombs -= 1;
  state.enemyBullets = [];
  for (const enemy of state.enemies) {
    enemy.hp -= 4;
    if (enemy.hp <= 0) {
      state.score += enemy.score;
      addEffect(enemy.x, enemy.y, '#ffe96d');
      enemy.y = canvas.height + 80;
      playSfx('explosion');
    }
  }
  if (state.boss) {
    state.boss.hp -= 30;
    addEffect(state.boss.x, state.boss.y, '#ff4f8a');
    playSfx('bossHit');
  }
  state.shake = Math.max(state.shake, 14);
}

function collide(a, b) {
  return Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
}

function getEnemyBounds(enemy) {
  return { x: enemy.x, y: enemy.y, w: enemy.sprite[0].length * 4, h: enemy.sprite.length * 4 };
}

function getPlayerBounds() {
  return { x: state.player.x, y: state.player.y, w: state.player.width, h: state.player.height };
}

function dropPowerup(x, y) {
  if (Math.random() > 0.22) return;
  const roll = Math.random();
  const kind = roll < 0.35 ? 'weapon' : roll < 0.65 ? 'life' : roll < 0.86 ? 'bomb' : 'shield';
  state.powerups.push({ x, y, vy: 1.7, kind });
}

function onEnemyKilled(enemy) {
  state.score += Math.floor(enemy.score * state.combo);
  state.combo = Math.min(9, state.combo + 1);
  state.comboTimer = 200;
  addEffect(enemy.x, enemy.y, '#ff9f80');
  dropPowerup(enemy.x, enemy.y);
  playSfx('explosion');
}

function playerHit() {
  if (state.player.invincible > 0) return;
  state.lives -= 1;
  state.player.invincible = 120;
  state.player.x = canvas.width / 2;
  state.player.y = canvas.height - 90;
  state.enemyBullets = [];
  state.shake = Math.max(state.shake, 10);
  playSfx('hit');
  if (state.lives <= 0) state.running = false;
}

function applyPowerup(kind) {
  if (kind === 'life') state.lives = Math.min(5, state.lives + 1);
  else if (kind === 'bomb') state.bombs = Math.min(5, state.bombs + 1);
  else if (kind === 'shield') state.player.invincible = Math.max(state.player.invincible, 180);
  else {
    const weapons = ['PEASHOOTER', 'SPREAD', 'LASER'];
    const next = weapons[(weapons.indexOf(state.player.weapon) + 1) % weapons.length];
    state.player.weapon = next;
    state.player.weaponLevel = Math.min(4, state.player.weaponLevel + 1);
    state.player.weaponTimer = 1100;
  }
  playSfx('powerup');
}

function handleInputMovement() {
  let x = 0;
  let y = 0;

  if (!isMobileControl()) {
    const left = state.keys.has('ArrowLeft') || state.keys.has('KeyA');
    const right = state.keys.has('ArrowRight') || state.keys.has('KeyD');
    const up = state.keys.has('ArrowUp') || state.keys.has('KeyW');
    const down = state.keys.has('ArrowDown') || state.keys.has('KeyS');
    x = (right ? 1 : 0) - (left ? 1 : 0);
    y = (down ? 1 : 0) - (up ? 1 : 0);
  } else {
    x = state.touch.dx;
    y = state.touch.dy;
  }

  state.player.x += x * state.player.speed;
  state.player.y += y * state.player.speed;
}

function spawnBossPattern() {
  if (!state.boss) return;
  const boss = state.boss;

  if (boss.attackPhase === 0) {
    for (let i = -5; i <= 5; i += 1) {
      state.enemyBullets.push({ x: boss.x, y: boss.y + 54, vx: i * 0.6, vy: 2.5 + Math.abs(i) * 0.18 });
    }
  } else if (boss.attackPhase === 1) {
    const angle = Math.atan2(state.player.y - boss.y, state.player.x - boss.x);
    for (let i = -2; i <= 2; i += 1) {
      state.enemyBullets.push({ x: boss.x, y: boss.y + 54, vx: Math.cos(angle + i * 0.15) * 3.2, vy: Math.sin(angle + i * 0.15) * 3.2 });
    }
  } else {
    boss.burstCounter += 0.5;
    for (let i = 0; i < 10; i += 1) {
      const a = boss.burstCounter + (Math.PI * 2 * i) / 10;
      state.enemyBullets.push({ x: boss.x, y: boss.y + 40, vx: Math.cos(a) * 2.6, vy: Math.sin(a) * 2.6 + 0.8 });
    }
  }

  boss.attackPhase = (boss.attackPhase + 1) % 3;
  playSfx('enemyShot');
}

function updateEntities() {
  handleInputMovement();

  state.player.x = clamp(state.player.x, 24, canvas.width - 24);
  state.player.y = clamp(state.player.y, 80, canvas.height - 30);

  const shootPressed = isMobileControl() ? state.touch.shoot : state.keys.has('Space');
  if (shootPressed || state.settings.autoFire) firePlayerBullets();

  if (state.player.cooldown > 0) state.player.cooldown -= 1;
  if (state.player.invincible > 0) state.player.invincible -= 1;
  if (state.player.weaponTimer > 0) {
    state.player.weaponTimer -= 1;
    if (state.player.weaponTimer === 0) {
      state.player.weapon = 'PEASHOOTER';
      state.player.weaponLevel = Math.max(1, state.player.weaponLevel - 1);
    }
  }

  for (const bullet of state.bullets) {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }
  state.bullets = state.bullets.filter((b) => b.y > -30 && b.x > -20 && b.x < canvas.width + 20);

  for (const bullet of state.enemyBullets) {
    bullet.x += bullet.vx;
    bullet.y += bullet.vy;
  }
  state.enemyBullets = state.enemyBullets.filter((b) => b.y < canvas.height + 35 && b.x > -30 && b.x < canvas.width + 30);

  for (const enemy of state.enemies) {
    enemy.phase += 0.03;
    enemy.x += enemy.type === 'zig' ? Math.sin(enemy.phase * 2) * 2 + enemy.speedX * 0.25 : enemy.speedX;
    enemy.y += enemy.speedY;
    if (enemy.x < 18 || enemy.x > canvas.width - 18) enemy.speedX *= -1;

    enemy.fireCooldown -= 1;
    if (enemy.fireCooldown <= 0) {
      const angle = Math.atan2(state.player.y - enemy.y, state.player.x - enemy.x);
      const speed = enemy.type === 'tank' ? 2.6 : 3.2;
      state.enemyBullets.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed });
      if (enemy.type === 'zig') state.enemyBullets.push({ x: enemy.x, y: enemy.y, vx: Math.cos(angle + 0.3) * speed, vy: Math.sin(angle + 0.3) * speed });
      enemy.fireCooldown = (enemy.type === 'tank' ? 165 : 125) * difficultyTable[state.settings.difficulty].enemyFireMul * (0.7 + Math.random() * 0.9);
      playSfx('enemyShot');
    }

    if (enemy.y > canvas.height + 40) enemy.y = -40;
  }

  if (state.boss) {
    state.boss.x += state.boss.direction * (2.2 + state.stage * 0.1);
    if (state.boss.x < 130 || state.boss.x > canvas.width - 130) state.boss.direction *= -1;

    state.boss.fireCooldown -= 1;
    if (state.boss.fireCooldown <= 0) {
      spawnBossPattern();
      state.boss.fireCooldown = Math.max(12, 26 - state.stage);
    }

    state.boss.summonCooldown -= 1;
    if (state.boss.summonCooldown <= 0) {
      spawnEnemy(Math.random() > 0.5 ? 'zig' : 'scout', state.boss.x + (Math.random() - 0.5) * 130, state.boss.y + 40);
      state.boss.summonCooldown = 120;
    }
  }

  for (const power of state.powerups) power.y += power.vy;
  state.powerups = state.powerups.filter((p) => p.y < canvas.height + 30);

  for (const effect of state.effects) { effect.life -= 1; effect.radius += 0.9; }
  state.effects = state.effects.filter((e) => e.life > 0);
}

function advanceAfterWaveClear() {
  if (state.waveInStage < WAVES_PER_STAGE) {
    state.waveInStage += 1;
    state.score += 350;
    state.combo = 1;
    spawnWave();
    return;
  }

  state.stage += 1;
  state.waveInStage = 1;
  state.score += 3000;
  state.bombs = Math.min(5, state.bombs + 1);
  saveProgress();
  spawnWave();
}

function resolveCollisions() {
  for (const bullet of state.bullets) {
    const bulletBox = { x: bullet.x, y: bullet.y, w: bullet.laser ? 8 : 6, h: bullet.laser ? 20 : 10 };
    for (const enemy of state.enemies) {
      if (!collide(bulletBox, getEnemyBounds(enemy))) continue;
      bullet.y = -100;
      enemy.hp -= bullet.power;
      if (enemy.hp <= 0) {
        enemy.y = canvas.height + 120;
        onEnemyKilled(enemy);
      }
    }

    if (state.boss) {
      const bossBox = { x: state.boss.x, y: state.boss.y, w: sprites.boss[0].length * 8, h: sprites.boss.length * 8 };
      if (collide(bulletBox, bossBox)) {
        bullet.y = -100;
        state.boss.hp -= bullet.power;
        addEffect(bullet.x, bullet.y, '#ff6ea9');
        playSfx('bossHit');
      }
    }
  }

  state.enemies = state.enemies.filter((e) => e.y < canvas.height + 90);

  const playerBox = getPlayerBounds();
  for (const bullet of state.enemyBullets) {
    if (!collide(playerBox, { x: bullet.x, y: bullet.y, w: 8, h: 8 })) continue;
    bullet.y = canvas.height + 999;
    playerHit();
  }

  for (const enemy of state.enemies) {
    if (!collide(playerBox, getEnemyBounds(enemy))) continue;
    enemy.y = canvas.height + 120;
    playerHit();
  }

  if (state.boss) {
    const bossBox = { x: state.boss.x, y: state.boss.y, w: sprites.boss[0].length * 8, h: sprites.boss.length * 8 };
    if (collide(playerBox, bossBox)) playerHit();

    if (state.boss.hp <= 0) {
      state.boss = null;
      playSfx('bossExplosion');
      advanceAfterWaveClear();
    }
  } else if (state.enemies.length === 0) {
    advanceAfterWaveClear();
  }

  for (const power of state.powerups) {
    if (!collide(playerBox, { x: power.x, y: power.y, w: 16, h: 16 })) continue;
    power.y = canvas.height + 100;
    applyPowerup(power.kind);
    addEffect(power.x, power.y, '#7bd9ff');
  }

  state.powerups = state.powerups.filter((p) => p.y < canvas.height + 40);
  if (state.comboTimer > 0) state.comboTimer -= 1;
  else state.combo = 1;
}

function drawNebulaBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#1a2a70'); g.addColorStop(1, '#080b1f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
  for (const star of state.stars) {
    star.y += star.speed;
    if (star.y > canvas.height) { star.y = -3; star.x = Math.random() * canvas.width; }
    ctx.fillStyle = '#8fc9ff'; ctx.fillRect(star.x, star.y, star.size, star.size);
  }
}

function drawGridBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#032230'); g.addColorStop(1, '#03080f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = 'rgba(83, 220, 255, 0.16)';
  for (let y = 0; y < canvas.height; y += 28) {
    ctx.beginPath(); ctx.moveTo(0, y + (performance.now() * 0.04) % 28); ctx.lineTo(canvas.width, y + (performance.now() * 0.04) % 28); ctx.stroke();
  }
  for (let x = 0; x < canvas.width; x += 38) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvas.height); ctx.stroke(); }
}

function drawSunsetBackground() {
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  g.addColorStop(0, '#4b1f4f'); g.addColorStop(0.55, '#ff6f61'); g.addColorStop(1, '#1d1d3f');
  ctx.fillStyle = g; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'rgba(255, 234, 130, 0.42)';
  ctx.beginPath(); ctx.arc(canvas.width / 2, 190, 95, 0, Math.PI * 2); ctx.fill();
}

function drawBackground() {
  const theme = currentTheme();
  if (theme === 'grid') drawGridBackground();
  else if (theme === 'sunset') drawSunsetBackground();
  else drawNebulaBackground();
}

function drawEntities() {
  for (const bullet of state.bullets) { ctx.fillStyle = bullet.laser ? '#ff7ce6' : '#52ffd9'; ctx.fillRect(bullet.x - 2, bullet.y - 8, bullet.laser ? 5 : 4, bullet.laser ? 18 : 12); }
  for (const bullet of state.enemyBullets) { ctx.fillStyle = '#ff4f8a'; ctx.fillRect(bullet.x - 2, bullet.y - 2, 5, 5); }
  for (const enemy of state.enemies) {
    spriteCenterDraw(enemy.sprite, enemy.x, enemy.y, 4);
    if (enemy.maxHp > 1) {
      ctx.fillStyle = '#ffe96d'; ctx.fillRect(enemy.x - 12, enemy.y + 14, 24, 3);
      ctx.fillStyle = '#ff7b7b'; ctx.fillRect(enemy.x - 12, enemy.y + 14, (24 * enemy.hp) / enemy.maxHp, 3);
    }
  }

  if (state.boss) {
    spriteCenterDraw(sprites.boss, state.boss.x, state.boss.y, 8);
    ctx.fillStyle = '#ffe96d'; ctx.fillText('BOSS CORE', state.boss.x - 36, state.boss.y - 66);
  }

  for (const power of state.powerups) { spriteCenterDraw(sprites.power, power.x, power.y, 4); }

  if (!(state.player.invincible > 0 && Math.floor(state.player.invincible / 6) % 2 === 0)) {
    const sprite = playerSpriteMap[state.settings.playerSkin] || sprites.playerFalcon;
    spriteCenterDraw(sprite, state.player.x, state.player.y, 4);
  }

  for (const effect of state.effects) {
    ctx.globalAlpha = effect.life / 18; ctx.strokeStyle = effect.color;
    ctx.beginPath(); ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2); ctx.stroke();
    ctx.globalAlpha = 1;
  }
}

function drawScreenTexts() {
  ctx.fillStyle = '#aef3ff'; ctx.font = '16px "Courier New", monospace'; ctx.textAlign = 'left';
  ctx.fillText(`DIFF: ${state.settings.difficulty.toUpperCase()}  SKIN: ${state.settings.playerSkin.toUpperCase()}`, 10, 24);

  if (!state.started) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#fff07a'; ctx.textAlign = 'center'; ctx.font = 'bold 38px "Courier New", monospace';
    ctx.fillText('NEO PIXEL ASSAULT', canvas.width / 2, canvas.height / 2 - 20);
    ctx.font = '18px "Courier New", monospace'; ctx.fillStyle = '#9effe7';
    ctx.fillText('1ステージ5ウェーブ / 5ウェーブ目は大型ボス', canvas.width / 2, canvas.height / 2 + 25);
  }

  if (state.paused) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffee7a'; ctx.textAlign = 'center'; ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
  }

  if (!state.running && state.started) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)'; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffee7a'; ctx.textAlign = 'center'; ctx.font = 'bold 32px "Courier New", monospace';
    ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 24);
    ctx.font = '20px "Courier New", monospace'; ctx.fillStyle = '#9effe7';
    ctx.fillText('ENTER で再挑戦 / CONTINUEでセーブ再開', canvas.width / 2, canvas.height / 2 + 20);
  }
}

function frame() {
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state.settings.screenShake && state.shake > 0) {
    const dx = (Math.random() - 0.5) * state.shake;
    const dy = (Math.random() - 0.5) * state.shake;
    ctx.setTransform(1, 0, 0, 1, dx, dy);
    state.shake *= 0.85;
  }

  drawBackground();
  if (state.started && state.running && !state.paused) {
    updateEntities();
    resolveCollisions();
  }
  drawEntities();
  drawScreenTexts();
  updateHud();
  requestAnimationFrame(frame);
}

function applySettingsFromUI() {
  state.settings.difficulty = difficultySelect.value;
  state.settings.controlMode = controlModeSelect.value;
  state.settings.autoFire = autoFireInput.checked;
  state.settings.screenShake = screenShakeInput.checked;
  state.settings.soundEnabled = soundEnabledInput.checked;
  state.settings.stageTheme = stageThemeSelect.value;
  state.settings.playerSkin = playerSkinSelect.value;
  updateControlModeUI();
}

function startFromNewGame() {
  applySettingsFromUI();
  ensureAudio();
  state.started = true;
  menuPanel.classList.add('hidden');
  updateControlModeUI();
  resetGame(1, 0, 3);
}

function startFromSave() {
  applySettingsFromUI();
  ensureAudio();
  const save = loadProgress();
  state.started = true;
  menuPanel.classList.add('hidden');
  updateControlModeUI();
  if (save) resetGame(save.stage, save.score, save.lives);
  else resetGame(1, 0, 3);
}

function restartFromGameOver() {
  if (!state.started || state.running) return;
  const save = loadProgress();
  if (save) resetGame(save.stage, save.score, save.lives);
  else resetGame(1, 0, 3);
}

startButton.addEventListener('click', startFromNewGame);
continueButton.addEventListener('click', startFromSave);

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyP') { state.paused = !state.paused; return; }
  if (event.code === 'KeyM') { state.settings.soundEnabled = !state.settings.soundEnabled; soundEnabledInput.checked = state.settings.soundEnabled; return; }

  if (event.code === 'Enter' && state.started && !state.running) {
    restartFromGameOver();
    return;
  }

  if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') useBomb();

  const active = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'ShiftLeft', 'ShiftRight'];
  if (active.includes(event.code)) {
    event.preventDefault();
    state.keys.add(event.code);
    ensureAudio();
  }
});

window.addEventListener('keyup', (event) => state.keys.delete(event.code));

function handleStickPointer(clientX, clientY) {
  const rect = stickBase.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const dx = clientX - cx;
  const dy = clientY - cy;
  const max = rect.width * 0.36;
  const len = Math.hypot(dx, dy) || 1;
  const clamped = Math.min(len, max);
  const nx = (dx / len) * clamped;
  const ny = (dy / len) * clamped;
  state.touch.dx = nx / max;
  state.touch.dy = ny / max;
  stickKnob.style.transform = `translate(calc(-50% + ${nx}px), calc(-50% + ${ny}px))`;
}

function resetStick() {
  state.touch.active = false;
  state.touch.dx = 0;
  state.touch.dy = 0;
  stickKnob.style.transform = 'translate(-50%, -50%)';
}

stickBase.addEventListener('pointerdown', (e) => {
  if (!state.touch.enabled) return;
  e.preventDefault();
  state.touch.active = true;
  stickBase.setPointerCapture(e.pointerId);
  handleStickPointer(e.clientX, e.clientY);
});
stickBase.addEventListener('pointermove', (e) => {
  if (!state.touch.enabled || !state.touch.active) return;
  e.preventDefault();
  handleStickPointer(e.clientX, e.clientY);
});
stickBase.addEventListener('pointerup', resetStick);
stickBase.addEventListener('pointercancel', resetStick);

const setTouchShoot = (on) => { state.touch.shoot = on; if (on) ensureAudio(); };
touchShoot.addEventListener('pointerdown', (e) => { e.preventDefault(); setTouchShoot(true); });
touchShoot.addEventListener('pointerup', (e) => { e.preventDefault(); setTouchShoot(false); });
touchShoot.addEventListener('pointercancel', () => setTouchShoot(false));
touchBomb.addEventListener('pointerdown', (e) => { e.preventDefault(); ensureAudio(); useBomb(); });
touchPause.addEventListener('pointerdown', (e) => { e.preventDefault(); state.paused = !state.paused; });
touchRestart.addEventListener('pointerdown', (e) => { e.preventDefault(); restartFromGameOver(); });

const save = loadProgress();
if (save) {
  stageEl.textContent = `STAGE: ${save.stage}`;
  scoreEl.textContent = `SCORE: ${String(save.score).padStart(6, '0')}`;
}

updateContinueButton();
updateControlModeUI();
ctx.font = '14px "Courier New", monospace';
frame();
