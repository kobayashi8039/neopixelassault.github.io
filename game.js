const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const scoreEl = document.getElementById('score');
const livesEl = document.getElementById('lives');
const hitsEl = document.getElementById('hits');
const stageEl = document.getElementById('stage');
const waveEl = document.getElementById('wave');
const weaponEl = document.getElementById('weapon');
const bossBar = document.getElementById('bossBar');
const bombMeter = document.getElementById('bombMeter');
const lifeMeter = document.getElementById('lifeMeter');

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
const debugModeInput = document.getElementById('debugMode');
const invincibleModeInput = document.getElementById('invincibleMode');

const touchHud = document.getElementById('touchHud');
const stickBase = document.getElementById('stickBase');
const stickKnob = document.getElementById('stickKnob');
const touchShoot = document.getElementById('touchShoot');
const touchBomb = document.getElementById('touchBomb');
const touchPause = document.getElementById('touchPause');
const touchRestart = document.getElementById('touchRestart');
const debugPanel = document.getElementById('debugPanel');

const SAVE_KEY = 'neo-pixel-assault-save-v2';
const WAVES_PER_STAGE = 5;
const PLAYER_SCALE = 3;
const ENEMY_SCALE = 3;
const BOSS_SCALE = 3;
const BGM_FILE = 'Untitled.mp3';

const sprites = {
  playerFalcon: [
    '0000000330000000',
    '0000003663000000',
    '0000036ff6300000',
    '000036ffff630000',
    '00036fffff630000',
    '0036ffffff663000',
    '036ffff99ffff630',
    '36fffff33fffff63',
    '36fffff33fffff63',
    '036ffff99ffff630',
    '0036ffffff663000',
    '00036fffff630000',
    '000036f66f630000',
    '0000033000330000',
    '0000003000030000',
    '0000000000000000',
  ],
  playerRaptor: [
    '0000000880000000',
    '0000008cc8000000',
    '000008c99c800000',
    '00008ccffcc80000',
    '0008ccffffcc8000',
    '008ccffffffcc800',
    '08ccff6666ffcc80',
    '8ccffffccffffcc8',
    '8ccffffccffffcc8',
    '08ccff6666ffcc80',
    '008ccffffffcc800',
    '0008ccffffcc8000',
    '00008c6666c80000',
    '0000082000280000',
    '0000008000080000',
    '0000000000000000',
  ],
  playerNova: [
    '0000000aa0000000',
    '000000affa000000',
    '00000affffa00000',
    '0000affffffa0000',
    '000affffffffa000',
    '00affff99ffffa00',
    '0afffff88fffffa0',
    'affffffaaaffffff',
    'affffffaaaffffff',
    '0afffff88fffffa0',
    '00affff99ffffa00',
    '000affffffffa000',
    '0000affaaffa0000',
    '00000af00fa00000',
    '000000a000a00000',
    '0000000000000000',
  ],
  scout: [
    '000033000000',
    '000366300000',
    '0036ff630000',
    '036ffff63000',
    '36fffffff630',
    '3ffff99ffff3',
    '03fff33fff30',
    '003ff33ff300',
    '000366663000',
    '000033330000',
    '000003300000',
    '000000000000',
  ],
  tank: [
    '000077777000',
    '0007ffff7000',
    '007ff66ff700',
    '07ffffffff70',
    '7ff6ffff6ff7',
    '7fffffffffff',
    '7ff66ff66ff7',
    '07ffffffff70',
    '007ff66ff700',
    '0007ffff7000',
    '000077777000',
    '000007700000',
  ],
  zig: [
    '00cc0000cc00',
    '0cccc00cccc0',
    'ccffccccffcc',
    '0ccccffcccc0',
    '00ccffffcc00',
    '0ccccffcccc0',
    'ccffccccffcc',
    '0cccc00cccc0',
    '00cc0000cc00',
    '0c000cc000c0',
    'cc00000000cc',
    '000000000000',
  ],
  boss: [
    '000000000007777777777700000000000',
    '00000000077ffffffffffff7700000000',
    '000000007fff888888888fff700000000',
    '0000007fff88fffffffff88fff7000000',
    '000007ff88fffffffffffff88ff700000',
    '00007ff8ff66ffffffff66ff8ff700000',
    '0007ff8fffffffffffffffffff8ff7000',
    '007ff8ff0ff0ffffffff0ff0ff8ff7000',
    '07ff8ffffffffffffffffffffffff8ff70',
    '7ff8ff66ff66ffffffffff66ff66ff8ff',
    '7fffffffffffffffffffffffffffffffff',
    '7ff8ff66ff66ffffffffff66ff66ff8ff',
    '07ff8ffffffffffffffffffffffff8ff70',
    '007ff8ff0ff0ffffffff0ff0ff8ff7000',
    '0007ff8fffffffffffffffffff8ff7000',
    '00007ff8ff66ffffffff66ff8ff700000',
    '000007ff88fffffffffffff88ff700000',
    '0000007fff88fffffffff88fff7000000',
    '000000007fff888888888fff700000000',
    '00000000077ffffffffffff7700000000',
    '000000000007770000000777000000000',
    '000000000000700000000070000000000',
  ],
  power: [
    '000aa000',
    '00affa00',
    '0affffa0',
    'affffffa',
    'affffffa',
    '0affffa0',
    '00affa00',
    '000aa000',
  ],
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
  easy: { enemyHpMul: 0.8, enemySpeedMul: 0.85, enemyFireMul: 1.15, bossHpMul: 0.8, bossBulletSpeedMul: 0.72 },
  normal: { enemyHpMul: 1, enemySpeedMul: 1, enemyFireMul: 1, bossHpMul: 1, bossBulletSpeedMul: 1 },
  hard: { enemyHpMul: 1.4, enemySpeedMul: 1.25, enemyFireMul: 0.82, bossHpMul: 1.45, bossBulletSpeedMul: 1.2 },
};

const state = {
  keys: new Set(),
  stars: Array.from({ length: 120 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 0.7 + Math.random() * 1.8, size: Math.random() > 0.85 ? 2 : 1 })),
  started: false,
  running: false,
  paused: false,
  score: 0,
  lives: 3,
  hitsTaken: 0,
  stage: 1,
  waveInStage: 1,
  bombs: 2,
  combo: 1,
  comboTimer: 0,
  shake: 0,
  settings: { difficulty: 'normal', controlMode: 'auto', autoFire: false, screenShake: true, soundEnabled: true, stageTheme: 'auto', playerSkin: 'falcon', debugMode: false, invincibleMode: false },
  touch: { enabled: false, active: false, dx: 0, dy: 0, shoot: false },
  player: { x: canvas.width / 2, y: canvas.height - 90, speed: 6, width: sprites.playerFalcon[0].length * PLAYER_SCALE, height: sprites.playerFalcon.length * PLAYER_SCALE, cooldown: 0, invincible: 0, weapon: 'PEASHOOTER', weaponLevel: 1, weaponTimer: 0 },
  bullets: [], enemyBullets: [], enemies: [], powerups: [], effects: [], boss: null,
  powerSpawnTimer: 0,
  debug: { enabled: false, lastTime: performance.now(), fps: 0 },
};

const audioState = { ctx: null, unlocked: false, bgmTimer: null, bgmStep: 0, bgmAudio: null, bgmUnavailable: false };
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
  debugPanel.classList.toggle('hidden', !state.debug.enabled);
}

function getAudioContext() {
  if (!audioState.ctx) audioState.ctx = new window.AudioContext();
  return audioState.ctx;
}

function getBgmAudio() {
  if (!audioState.bgmAudio) {
    const bgm = new Audio(BGM_FILE);
    bgm.loop = true;
    bgm.volume = 0.35;
    bgm.preload = 'auto';
    bgm.playsInline = true;
    bgm.addEventListener('error', () => {
      audioState.bgmUnavailable = true;
    });
    audioState.bgmAudio = bgm;
  }
  return audioState.bgmAudio;
}

function ensureAudio() {
  if (!state.settings.soundEnabled) return;
  const audioCtx = getAudioContext();
  if (!audioState.unlocked && audioCtx.state === 'suspended') {
    audioCtx.resume();
    audioState.unlocked = true;
  }
}


function startSynthBgmFallback() {
  if (audioState.bgmTimer) return;

  const audioCtx = getAudioContext();
  const seq = [220, 247, 196, 294, 247, 330, 196, 175];
  audioState.bgmTimer = setInterval(() => {
    if (!state.running || state.paused || !state.started || !state.settings.soundEnabled) return;
    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = seq[audioState.bgmStep % seq.length];
    audioState.bgmStep += 1;
    gain.gain.setValueAtTime(0.028, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start(t);
    osc.stop(t + 0.24);
  }, 230);
}

function stopBgm() {
  if (audioState.bgmAudio) {
    audioState.bgmAudio.pause();
    audioState.bgmAudio.currentTime = 0;
  }

  if (audioState.bgmTimer) {
    clearInterval(audioState.bgmTimer);
    audioState.bgmTimer = null;
  }
}

function syncBgmPlayback() {
  if (!state.settings.soundEnabled) {
    stopBgm();
    return;
  }

  if (state.started) startBgm();
}

function startBgm() {
  if (!state.settings.soundEnabled) return;

  const bgm = getBgmAudio();
  if (audioState.bgmUnavailable) {
    startSynthBgmFallback();
    return;
  }

  bgm.play().then(() => {
    if (audioState.bgmTimer) {
      clearInterval(audioState.bgmTimer);
      audioState.bgmTimer = null;
    }
  }).catch(() => {
    audioState.bgmUnavailable = true;
    startSynthBgmFallback();
  });
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
  livesEl.textContent = `LIVES: ${state.settings.invincibleMode ? '∞' : state.lives}`;
  hitsEl.textContent = `HITS: ${state.hitsTaken}`;
  bombMeter.innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="bomb-dot ${i < state.bombs ? 'active' : ''}"></span>`).join('');
  lifeMeter.innerHTML = Array.from({ length: 5 }, (_, i) => `<span class="life-dot ${i < state.lives ? 'active' : ''}"></span>`).join('');
  stageEl.textContent = `STAGE: ${state.stage}`;
  waveEl.textContent = `WAVE: ${state.waveInStage}/${WAVES_PER_STAGE}`;
  const weaponTimerSec = state.player.weapon === 'TRIPLE' && state.player.weaponTimer > 0
    ? ` (${Math.ceil(state.player.weaponTimer / 60)}s)`
    : '';
  weaponEl.textContent = `WEAPON: ${state.player.weapon}${weaponTimerSec}  BG: ${currentTheme().toUpperCase()}`;
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
  state.hitsTaken = 0;
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
  state.powerSpawnTimer = 260;
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
    const maxHp = Math.max(40, Math.floor((350 + state.stage * 120) * diff.bossHpMul * 0.1));
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

  const bullets = [];
  if (state.player.weapon === 'TRIPLE') {
    bullets.push({ x: state.player.x, y: state.player.y - 18, vx: 0, vy: -9.4, power: 1 });
    bullets.push({ x: state.player.x - 12, y: state.player.y - 15, vx: -0.7, vy: -8.9, power: 1 });
    bullets.push({ x: state.player.x + 12, y: state.player.y - 15, vx: 0.7, vy: -8.9, power: 1 });
    state.player.cooldown = 8;
  } else {
    bullets.push({ x: state.player.x, y: state.player.y - 18, vx: 0, vy: -9.5, power: 1 });
    state.player.cooldown = 10;
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
  return { x: enemy.x, y: enemy.y, w: enemy.sprite[0].length * ENEMY_SCALE, h: enemy.sprite.length * ENEMY_SCALE };
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
  state.hitsTaken += 1;
  if (!state.settings.invincibleMode) state.lives -= 1;
  state.player.invincible = 120;
  state.player.x = canvas.width / 2;
  state.player.y = canvas.height - 90;
  state.enemyBullets = [];
  state.shake = Math.max(state.shake, 10);
  playSfx('hit');
  if (!state.settings.invincibleMode && state.lives <= 0) { state.running = false; stopBgm(); }
}

function applyPowerup(kind) {
  if (kind === 'life') state.lives = Math.min(5, state.lives + 1);
  else if (kind === 'bomb') state.bombs = Math.min(5, state.bombs + 1);
  else if (kind === 'shield') state.player.invincible = Math.max(state.player.invincible, 180);
  else {
    state.player.weapon = 'TRIPLE';
    state.player.weaponTimer = 600;
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
  const speedMul = difficultyTable[state.settings.difficulty].bossBulletSpeedMul;

  if (boss.attackPhase === 0) {
    for (let i = -5; i <= 5; i += 1) {
      state.enemyBullets.push({ x: boss.x, y: boss.y + 54, vx: i * 0.6 * speedMul, vy: (2.5 + Math.abs(i) * 0.18) * speedMul });
    }
  } else if (boss.attackPhase === 1) {
    const angle = Math.atan2(state.player.y - boss.y, state.player.x - boss.x);
    for (let i = -2; i <= 2; i += 1) {
      state.enemyBullets.push({ x: boss.x, y: boss.y + 54, vx: Math.cos(angle + i * 0.15) * 3.2 * speedMul, vy: Math.sin(angle + i * 0.15) * 3.2 * speedMul });
    }
  } else {
    boss.burstCounter += 0.5;
    for (let i = 0; i < 10; i += 1) {
      const a = boss.burstCounter + (Math.PI * 2 * i) / 10;
      state.enemyBullets.push({ x: boss.x, y: boss.y + 40, vx: Math.cos(a) * 2.6 * speedMul, vy: (Math.sin(a) * 2.6 + 0.8) * speedMul });
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

  state.powerSpawnTimer -= 1;
  if (state.powerSpawnTimer <= 0) {
    state.powerups.push({ x: 30 + Math.random() * (canvas.width - 60), y: -20, vy: 1.6 + Math.random() * 0.8, kind: Math.random() < 0.85 ? 'weapon' : (Math.random() < 0.5 ? 'bomb' : 'shield') });
    state.powerSpawnTimer = 280 + Math.random() * 260;
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
      const bossBox = { x: state.boss.x, y: state.boss.y, w: sprites.boss[0].length * BOSS_SCALE, h: sprites.boss.length * BOSS_SCALE };
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
    const bossBox = { x: state.boss.x, y: state.boss.y, w: sprites.boss[0].length * BOSS_SCALE, h: sprites.boss.length * BOSS_SCALE };
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
    spriteCenterDraw(enemy.sprite, enemy.x, enemy.y, ENEMY_SCALE);
    if (enemy.maxHp > 1) {
      const barY = enemy.y + (enemy.sprite.length * ENEMY_SCALE) / 2 + 4;
      ctx.fillStyle = '#ffe96d'; ctx.fillRect(enemy.x - 14, barY, 28, 3);
      ctx.fillStyle = '#ff7b7b'; ctx.fillRect(enemy.x - 14, barY, (28 * enemy.hp) / enemy.maxHp, 3);
    }
  }

  if (state.boss) {
    spriteCenterDraw(sprites.boss, state.boss.x, state.boss.y, BOSS_SCALE);
    ctx.fillStyle = '#ffe96d'; ctx.fillText('BOSS CORE', state.boss.x - 42, state.boss.y - 78);
  }

  for (const power of state.powerups) { spriteCenterDraw(sprites.power, power.x, power.y, 4); }

  if (!(state.player.invincible > 0 && Math.floor(state.player.invincible / 6) % 2 === 0)) {
    const sprite = playerSpriteMap[state.settings.playerSkin] || sprites.playerFalcon;
    spriteCenterDraw(sprite, state.player.x, state.player.y, PLAYER_SCALE);
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

function updateDebugPanel() {
  if (!state.debug.enabled) return;
  const now = performance.now();
  const delta = now - state.debug.lastTime;
  state.debug.lastTime = now;
  state.debug.fps = delta > 0 ? 1000 / delta : 0;
  debugPanel.textContent = [
    `FPS: ${state.debug.fps.toFixed(1)}`,
    `PLAYER: (${state.player.x.toFixed(0)}, ${state.player.y.toFixed(0)})`,
    `ENEMIES: ${state.enemies.length}`,
    `P-BULLETS: ${state.bullets.length}`,
    `E-BULLETS: ${state.enemyBullets.length}`,
    `BOSS: ${state.boss ? `${Math.max(0, state.boss.hp)}/${state.boss.maxHp}` : 'NONE'}`,
    `STAGE/WAVE: ${state.stage}/${state.waveInStage}`,
    `CONTROL: ${state.touch.enabled ? 'MOBILE' : 'PC'}`,
    `HITS: ${state.hitsTaken}  INV: ${state.settings.invincibleMode ? 'ON' : 'OFF'}`,
  ].join('\n');
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
  updateDebugPanel();
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
  state.settings.debugMode = debugModeInput.checked;
  state.settings.invincibleMode = invincibleModeInput.checked;
  state.debug.enabled = state.settings.debugMode;
  updateControlModeUI();
  syncBgmPlayback();
}

function startFromNewGame() {
  applySettingsFromUI();
  ensureAudio();
  state.started = true;
  menuPanel.classList.add('hidden');
  updateControlModeUI();
  syncBgmPlayback();
  resetGame(1, 0, 3);
}

function startFromSave() {
  applySettingsFromUI();
  ensureAudio();
  const save = loadProgress();
  state.started = true;
  menuPanel.classList.add('hidden');
  updateControlModeUI();
  syncBgmPlayback();
  if (save) resetGame(save.stage, save.score, save.lives);
  else resetGame(1, 0, 3);
}

function restartFromGameOver() {
  if (!state.started || state.running) return;
  const save = loadProgress();
  if (save) resetGame(save.stage, save.score, save.lives);
  else resetGame(1, 0, 3);
  startBgm();
}

startButton.addEventListener('click', startFromNewGame);
continueButton.addEventListener('click', startFromSave);

window.addEventListener('keydown', (event) => {
  if (event.code === 'KeyP') { state.paused = !state.paused; if (!state.paused) startBgm(); return; }
  if (event.code === 'KeyM') { state.settings.soundEnabled = !state.settings.soundEnabled; soundEnabledInput.checked = state.settings.soundEnabled; if (state.settings.soundEnabled) { ensureAudio(); startBgm(); } else { stopBgm(); } return; }
  if (event.code === 'F3') { state.debug.enabled = !state.debug.enabled; state.settings.debugMode = state.debug.enabled; debugModeInput.checked = state.debug.enabled; updateControlModeUI(); return; }

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
touchPause.addEventListener('pointerdown', (e) => { e.preventDefault(); state.paused = !state.paused; if (!state.paused) startBgm(); });
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
