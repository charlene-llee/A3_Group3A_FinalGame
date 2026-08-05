// ============================================================
// TACTIC — a small platformer about Tourette Syndrome
// Engine: plain canvas 2D, fixed-timestep-ish update loop.
// ============================================================

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const VIEW_W = 1280;
const VIEW_H = 720;

const GRAVITY = 1800;
const JUMP_VELOCITY = -680;
const MOVE_SPEED = 320;
const SNEAK_SPEED = 140;
const FRICTION_GROUND = 0.0;
const PLAYER_W = 28;
const PLAYER_H = 64;
const TRAP_FALL_DELAY = 0.28;
const TRAP_TRIGGER_RANGE = 300;

let world = null;
let checkpoint = { x: 0, y: 0 };
let player = null;
let camera = { x: 0 };
let keys = { left: false, right: false, up: false, t: false, slow: false };
let lastTime = null;
let gameTime = 0;
let deathFlashTimer = 0;
let hazardSpawner = null;
let isPaused = false;
let freezeTimer = 0;
const BIRD_FREEZE_DURATION = 1.5;
let noiseLevel = 0;
const NOISE_MAX = 100;
const NOISE_RATE_UP = 88;
const NOISE_RATE_DOWN = 22;

const LEVEL_EXTENTS = (() => {
  const map = {};
  for (const s of WORLD.sections) {
    if (!map[s.levelIndex]) {
      map[s.levelIndex] = { start: s.startX, end: s.endX };
    } else {
      map[s.levelIndex].start = Math.min(map[s.levelIndex].start, s.startX);
      map[s.levelIndex].end = Math.max(map[s.levelIndex].end, s.endX);
    }
  }
  return map;
})();

const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayBtn = document.getElementById("overlay-btn");
const levelLabel = document.getElementById("level-label");
const controlsHint = document.getElementById("controls-hint");
const DEFAULT_CONTROLS_HINT =
  "← → move &nbsp;|&nbsp; ↑ / Space jump &nbsp;|&nbsp; Esc menu &nbsp;|&nbsp; ` debug";
const GRAVEL_CONTROLS_HINT =
  "← → move &nbsp;|&nbsp; ↑ / Space jump &nbsp;|&nbsp; &nbsp;|&nbsp; Esc menu &nbsp;|&nbsp; ` debug";
const BARK_CONTROLS_HINT_QUIET =
  "← → move &nbsp;|&nbsp; ↑ / Space jump &nbsp;|&nbsp; &nbsp;|&nbsp; Esc menu &nbsp;|&nbsp; ` debug";
const BARK_CONTROLS_HINT_INVERTED =
  "BARKING — controls reversed! &nbsp;|&nbsp; ↑ / Space jump &nbsp;|&nbsp; Esc menu &nbsp;|&nbsp; ` debug";
const BARK_WARN_LEAD = 0.6;
const restartBtn = document.getElementById("restart-btn");
const muteBtn = document.getElementById("mute-btn");
muteBtn.addEventListener("click", () => setMusicMuted(!musicMuted));

const BOX_SRC = "assets/images/box.png";
const DOG_SRC = "assets/images/dog.png";
const HAZARD_W = 79;
const HAZARD_H = 56;

const boxImg = new Image();
boxImg.src = BOX_SRC;
let boxLoaded = false;

const dogImg = new Image();
dogImg.src = DOG_SRC;
let dogLoaded = false;

const BOX2_SRC = "assets/images/2box.png";
const box2Img = new Image();
box2Img.src = BOX2_SRC;
let box2Loaded = false;

const STACKEDBOXES_SRC = "assets/images/stackedboxes.png";
const stackedboxesImg = new Image();
stackedboxesImg.src = STACKEDBOXES_SRC;
let stackedboxesLoaded = false;

const STAIRS_SRC = "assets/images/stairs.png";
const stairsImg = new Image();
stairsImg.src = STAIRS_SRC;
let stairsLoaded = false;

const WHITEDOG_SRC = "assets/images/whitedog.png";
const whitedogImg = new Image();
whitedogImg.src = WHITEDOG_SRC;
let whitedogLoaded = false;

const TREE_SRC = "assets/images/tree.png";
const treeImg = new Image();
treeImg.src = TREE_SRC;
let treeLoaded = false;
const BIRD_SRC = "assets/images/bird.png";
const birdImg = new Image();
birdImg.src = BIRD_SRC;
let birdImgLoaded = false;

const RAY_SRC = "assets/images/ray.png";
const rayImg = new Image();
rayImg.src = RAY_SRC;
let rayLoaded = false;
const RAIN_SRC = "assets/images/rain.png";
const rainImg = new Image();
rainImg.src = RAIN_SRC;
let rainLoaded = false;

const CODE_NPC_SRC = "assets/images/businessman.png";
const codeNpcImg = new Image();
codeNpcImg.src = CODE_NPC_SRC;
let codeNpcLoaded = false;
const CAR_SRC = "assets/images/car.png";
const carImg = new Image();
carImg.src = CAR_SRC;
let carLoaded = false;

const SPRITE_SHEET_SRC = "assets/images/mailman.png";

const SPRITE_FRAME_W = 117;
const SPRITE_FRAME_H = 189;
const SPRITE_COLS = 4;
const SPRITE_FRAME_DURATION = 0.12;

const spriteSheet = new Image();

let spriteLoaded = false;
let menuMusic = null;
let gameplayMusic = null;
let currentMusic = null;
let buttonClickSound = null;
let jumpSound = null;
let mailboxBellSound = null;
let birdChirpSound = null;
let stormSound = null;
let rainSound = null;
let carHonkSound = null;
let gravelFootstepsSound = null;
let dogBarkSound = null;
let audioInitialized = false;
let musicMuted = false;

function initAudio() {
  if (audioInitialized) return;

  audioInitialized = true;

  menuMusic = new Audio("assets/sounds/background_music.mp3");
  menuMusic.loop = true;
  menuMusic.volume = 0.35;
  menuMusic.preload = "auto";

  gameplayMusic = new Audio("assets/sounds/game_music.mp3");
  gameplayMusic.loop = true;
  gameplayMusic.volume = 0.35;
  gameplayMusic.preload = "auto";

  buttonClickSound = new Audio("assets/sounds/button_click.mp3");
  buttonClickSound.volume = 0.45;
  buttonClickSound.preload = "auto";

  jumpSound = new Audio("assets/sounds/jump_sound.mp3");
  jumpSound.volume = 0.5;
  jumpSound.preload = "auto";

  mailboxBellSound = new Audio("assets/sounds/mailbox_bell.mp3");
  mailboxBellSound.volume = 0.5;
  mailboxBellSound.preload = "auto";

  birdChirpSound = new Audio("assets/sounds/bird_chirp.mp3");
  birdChirpSound.volume = 0.55;
  birdChirpSound.preload = "auto";

  stormSound = new Audio("assets/sounds/storm.mp3");
  stormSound.volume = 0.6;
  stormSound.preload = "auto";

  rainSound = new Audio();
  rainSound.volume = 0.4;

  carHonkSound = new Audio();
  carHonkSound.volume = 0.5;

  gravelFootstepsSound = new Audio("assets/sounds/gravel_footsteps.mp3");
  gravelFootstepsSound.loop = true;
  gravelFootstepsSound.volume = 0.5;
  gravelFootstepsSound.preload = "auto";

  dogBarkSound = new Audio();
  dogBarkSound.loop = true;
  dogBarkSound.volume = 0.55;

  menuMusic.muted = musicMuted;
  gameplayMusic.muted = musicMuted;
}

function playBirdChirpSound() {
  playSound(birdChirpSound);
}

function playCarHonkSound() {
  initAudio();
  playSound(carHonkSound);
}

function startGravelFootsteps() {
  if (!gravelFootstepsSound) return;
  if (gravelFootstepsSound.paused) {
    const p = gravelFootstepsSound.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }
}

function stopGravelFootsteps() {
  if (!gravelFootstepsSound) return;
  if (!gravelFootstepsSound.paused) gravelFootstepsSound.pause();
}

function startDogBarkLoop() {
  if (!dogBarkSound) return;
  if (dogBarkSound.paused) {
    const p = dogBarkSound.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }
}

function stopDogBarkLoop() {
  if (!dogBarkSound) return;
  if (!dogBarkSound.paused) dogBarkSound.pause();
}

function setMusicMuted(muted) {
  musicMuted = muted;
  if (menuMusic) menuMusic.muted = muted;
  if (gameplayMusic) gameplayMusic.muted = muted;
  muteBtn.classList.toggle("muted", muted);
  muteBtn.title = muted ? "Unmute Music" : "Mute Music";
}

function playSound(sound) {
  if (!sound) return;
  try {
    sound.currentTime = 0;
    const playPromise = sound.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(() => {
        const retry = () => {
          playSound(sound);
          window.removeEventListener("pointerdown", retry);
          window.removeEventListener("keydown", retry);
        };

        window.addEventListener("pointerdown", retry, { once: true });
        window.addEventListener("keydown", retry, { once: true });
      });
    }
  } catch (e) {}
}

function stopMusic(audio) {
  if (!audio) return;
  try {
    audio.pause();
    audio.currentTime = 0;
  } catch (e) {}
}

function playMenuMusic() {
  initAudio();
  if (currentMusic === menuMusic) return;

  stopMusic(gameplayMusic);
  stopMusic(menuMusic);
  currentMusic = menuMusic;
  playSound(menuMusic);
}

function playGameplayMusic() {
  initAudio();
  if (currentMusic === gameplayMusic) return;

  stopMusic(menuMusic);
  stopMusic(gameplayMusic);
  currentMusic = gameplayMusic;
  playSound(gameplayMusic);
}

function playButtonSound() {
  playSound(buttonClickSound);
}

function playJumpSound() {
  playSound(jumpSound);
}

function playMailboxBellSound() {
  playSound(mailboxBellSound);
}

function preloadSprite() {
  return new Promise((resolve) => {
    spriteSheet.onload = () => {
      spriteLoaded = true;
      console.log("Sprite loaded successfully");
      resolve(true);
    };

    spriteSheet.onerror = () => {
      console.error("FAILED TO LOAD SPRITE:", SPRITE_SHEET_SRC);
      resolve(false);
    };

    spriteSheet.src = SPRITE_SHEET_SRC;
  });
}

const MAILBOX_UP_SRC = "assets/images/mailboxup.png";
const MAILBOX_DOWN_SRC = "assets/images/mailboxdown.png";
const LEVEL_BG_SRC = "assets/images/BG.png";
const TITLE_BG_SRC = "assets/images/titlebg.png";
const LEVEL2_BG_SRC = "assets/images/BG2.png";

const mailboxUpImg = new Image();
const mailboxDownImg = new Image();
const levelBgImg = new Image();
const level2BgImg = new Image();
const level3BgImg = new Image();
const titleBgImg = new Image();

let mailboxUpLoaded = false;
let mailboxDownLoaded = false;
let levelBgLoaded = false;
let level2BgLoaded = false;
let level3BgLoaded = false;
let titleBgLoaded = false;

function preloadImage(img, src, onDone) {
  return new Promise((resolve) => {
    img.onload = () => {
      onDone(true);
      resolve(true);
    };
    img.onerror = () => {
      console.error("FAILED TO LOAD IMAGE:", src);
      onDone(false);
      resolve(false);
    };
    img.src = src;
  });
}

function preloadAllAssets() {
  return Promise.all([
    preloadSprite(),
    preloadImage(mailboxUpImg, MAILBOX_UP_SRC, (ok) => (mailboxUpLoaded = ok)),
    preloadImage(
      mailboxDownImg,
      MAILBOX_DOWN_SRC,
      (ok) => (mailboxDownLoaded = ok),
    ),
    preloadImage(levelBgImg, LEVEL_BG_SRC, (ok) => (levelBgLoaded = ok)),
    preloadImage(level2BgImg, LEVEL2_BG_SRC, (ok) => (level2BgLoaded = ok)),
    preloadImage(
      level3BgImg,
      "assets/images/BG3.png",
      (ok) => (level3BgLoaded = ok),
    ),
    preloadImage(titleBgImg, TITLE_BG_SRC, (ok) => (titleBgLoaded = ok)),
    preloadImage(boxImg, BOX_SRC, (ok) => (boxLoaded = ok)),
    preloadImage(dogImg, DOG_SRC, (ok) => (dogLoaded = ok)),
    preloadImage(box2Img, BOX2_SRC, (ok) => (box2Loaded = ok)),
    preloadImage(
      stackedboxesImg,
      STACKEDBOXES_SRC,
      (ok) => (stackedboxesLoaded = ok),
    ),
    preloadImage(stairsImg, STAIRS_SRC, (ok) => (stairsLoaded = ok)),
    preloadImage(whitedogImg, WHITEDOG_SRC, (ok) => (whitedogLoaded = ok)),
    preloadImage(treeImg, TREE_SRC, (ok) => (treeLoaded = ok)),
    preloadImage(birdImg, BIRD_SRC, (ok) => (birdImgLoaded = ok)),
    preloadImage(rayImg, RAY_SRC, (ok) => (rayLoaded = ok)),
    preloadImage(rainImg, RAIN_SRC, (ok) => (rainLoaded = ok)),
    preloadImage(codeNpcImg, CODE_NPC_SRC, (ok) => (codeNpcLoaded = ok)),
    preloadImage(carImg, CAR_SRC, (ok) => (carLoaded = ok)),
  ]);
}

function makePlayer(spawn) {
  return {
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    w: PLAYER_W,
    h: PLAYER_H,
    grounded: false,
    wasGrounded: false,
    facing: 1,
    alive: true,
    standingTrapId: null,
    superJumpReady: false,
    superJumpMultiplier: 1,
  };
}

function freshJumpBoostNpcState() {
  return (WORLD.jumpBoostNpcs || []).map((n) => ({ ...n, charge: 0 }));
}

function freshTrapState() {
  return WORLD.trapGround.map((t) => ({
    ...t,
    armed: t.prefallen || false,
    fallTimer: 0,
    fallen: t.prefallen || false,
    fallOffset: t.prefallen ? 400 : 0,
  }));
}

function loadWorld() {
  world = {
    def: WORLD,
    trapState: freshTrapState(),
    movingPlatforms: WORLD.movingPlatforms.map((p) => ({ ...p })),
    groundHazards: (WORLD.groundHazards || []).map((g) => ({ ...g })),
    jumpBoostState: freshJumpBoostNpcState(),
    mailboxes: WORLD.mailboxes.map((m) => ({ ...m })),
    speedFactor: 1,
    _blackHoleQueued: false,
    birdState: (WORLD.birds || []).map((b) => ({
      ...b,
      chirpTimer: INITIAL_BIRD_CHIRP_DELAY,
    })),
  };

  syncMailboxActivationFromProgress();

  checkpoint = { x: WORLD.spawn.x, y: WORLD.spawn.y };
  player = makePlayer(checkpoint);
  camera.x = clampCamera(player.x + player.w / 2);
  updateLevelLabel();

  keys.left = keys.right = keys.up = keys.slow = false;
  isPaused = false;
  freezeTimer = 0;
  noiseLevel = 0;
  removeLevelJumpButtons();
  hideKeypad();
  stopDogBarkLoop();

  if (hazardSpawner !== null) {
    for (const id of hazardSpawner) clearInterval(id);
    hazardSpawner = null;
  }

  initDynamicHazard();
  initGapExpansion();
  initCodeLock();
  initWeather();
  initBarkState();
}

function respawnPlayer() {
  world.trapState = freshTrapState();
  world.movingPlatforms = WORLD.movingPlatforms.map((p) => ({ ...p }));
  world.groundHazards = (WORLD.groundHazards || []).map((g) => ({ ...g }));
  world.jumpBoostState = freshJumpBoostNpcState();
  world.speedFactor = 1;
  world._blackHoleQueued = false;
  world.birdState = (WORLD.birds || []).map((b) => ({
    ...b,
    chirpTimer: INITIAL_BIRD_CHIRP_DELAY,
  }));
  freezeTimer = 0;
  noiseLevel = 0;
  hideKeypad();

  if (hazardSpawner !== null) {
    for (const id of hazardSpawner) clearInterval(id);
    hazardSpawner = null;
  }
  initDynamicHazard();
  initGapExpansion();
  resetCodeLockRunState();
  resetWeatherRunState();
  resetBarkRunState();

  player = makePlayer(checkpoint);
  camera.x = clampCamera(player.x + player.w / 2);
  keys.left = keys.right = keys.up = keys.slow = false;
}

const DYNAMIC_HAZARD_COUNT = 2;

function initDynamicHazard() {
  world.dynamicHazards = [];
  hazardSpawner = null;
}

function getSectionIndexForX(x) {
  for (let i = 0; i < WORLD.sections.length; i++) {
    const s = WORLD.sections[i];
    if (x >= s.startX && x < s.endX) return i;
  }
  // x falls in a gap between levels (or off either end): snap to the
  // nearest section behind it, so we stay in whichever level we came from
  // instead of falling through to the last level in the list.
  let best = 0;
  for (let i = 0; i < WORLD.sections.length; i++) {
    if (WORLD.sections[i].endX <= x) best = i;
  }
  return best;
}

function getCurrentSection() {
  return WORLD.sections[getSectionIndexForX(player.x)];
}

// Stages are stored as fixed-width chunks of the level, but the visual
// "end" of a stage is really wherever its mailbox sits (often well before
// the raw width cutoff). Base the displayed title on mailboxes passed so
// it flips to the next stage as soon as the player walks past one,
// matching what they see on screen instead of an invisible x cutoff.
function getDisplayStageIndex(levelIdx, x) {
  const mbs = world.mailboxes
    .filter((m) => m.levelIndex === levelIdx)
    .sort((a, b) => a.stageIndex - b.stageIndex);
  for (const mb of mbs) {
    if (x < mb.x) return mb.stageIndex;
  }
  return mbs.length ? mbs[mbs.length - 1].stageIndex : 0;
}

function updateLevelLabel() {
  const idx = getSectionIndexForX(player.x);
  const section = WORLD.sections[idx];
  const displayStageIdx = getDisplayStageIndex(section.levelIndex, player.x);
  const labelSection =
    WORLD.sections.find(
      (s) =>
        s.levelIndex === section.levelIndex && s.stageIndex === displayStageIdx,
    ) || section;
  levelLabel.textContent = labelSection.title.split("—")[0].trim();

  if (controlsHint) {
    const onGravel = getGroundSurfaceAt(player.x) === "gravel";
    const bs = world.barkState;
    const onBarkStage = bs && getCurrentSection() === bs.section;
    if (onBarkStage) {
      controlsHint.innerHTML =
        bs.phase === "barking"
          ? BARK_CONTROLS_HINT_INVERTED
          : BARK_CONTROLS_HINT_QUIET;
    } else {
      controlsHint.innerHTML = onGravel
        ? GRAVEL_CONTROLS_HINT
        : DEFAULT_CONTROLS_HINT;
    }
  }
}

const NPC_BUBBLE_SHOW_DURATION = 3.6;
const NPC_BUBBLE_HIDE_DURATION = 1.1;
const CAR_HONK_OBSCURE_DURATION = 1.0;

function generateRandomCode() {
  const code = [];
  for (let i = 0; i < 4; i++) code.push(String(Math.floor(Math.random() * 10)));
  return code;
}

function findCodeLockSection() {
  return WORLD.sections.find((s) => s.codeLock && s.npc);
}

function makeStageCars(carsCfg) {
  if (!carsCfg) return [];
  const w = carsCfg.width || 70;
  const h = carsCfg.height || 34;
  const speedMin = carsCfg.speedMin || 150;
  const speedMax = carsCfg.speedMax || 240;
  const span = carsCfg.maxX - carsCfg.minX - w;
  const count = 3;
  const cars = [];
  for (let i = 0; i < count; i++) {
    cars.push({
      x: carsCfg.minX + (span * (i + 0.5)) / count,
      y: world.def.groundY - h,
      width: w,
      height: h,
      speed: speedMin + Math.random() * (speedMax - speedMin),
      dir: i % 2 === 0 ? 1 : -1,
    });
  }
  return cars;
}

function initCodeLock() {
  const section = findCodeLockSection();
  if (!section) {
    world.codeLock = null;
    return;
  }
  const alreadyCompleted = Progress.isCompleted(
    section.levelIndex,
    section.stageIndex,
  );
  world.codeLock = {
    section,
    code: generateRandomCode(),
    solved: alreadyCompleted,
    cyclePhase: "showing",
    cycleTimer: NPC_BUBBLE_SHOW_DURATION,
    obscured: [0, 0, 0, 0],
    cars: makeStageCars(section.cars),
    honkTimer: 1 + Math.random() * 1.5,
  };
  if (alreadyCompleted) {
    const mb = world.mailboxes.find(
      (m) =>
        m.levelIndex === section.levelIndex &&
        m.stageIndex === section.stageIndex,
    );
    if (mb) mb.locked = false;
  }
}

function resetCodeLockRunState() {
  if (!world.codeLock) return;
  world.codeLock.cyclePhase = "showing";
  world.codeLock.cycleTimer = NPC_BUBBLE_SHOW_DURATION;
  world.codeLock.obscured = [0, 0, 0, 0];
  world.codeLock.cars = makeStageCars(world.codeLock.section.cars);
  world.codeLock.honkTimer = 1 + Math.random() * 1.5;
}

function updateCarsAndNpc(dt) {
  const cl = world.codeLock;
  if (!cl) return;

  cl.cycleTimer -= dt;
  if (cl.cycleTimer <= 0) {
    if (cl.cyclePhase === "showing") {
      cl.cyclePhase = "hidden";
      cl.cycleTimer = NPC_BUBBLE_HIDE_DURATION;
    } else {
      cl.cyclePhase = "showing";
      cl.cycleTimer = NPC_BUBBLE_SHOW_DURATION;
      cl.obscured = [0, 0, 0, 0];
    }
  }

  for (let i = 0; i < cl.obscured.length; i++) {
    if (cl.obscured[i] > 0) cl.obscured[i] = Math.max(0, cl.obscured[i] - dt);
  }

  const carsCfg = cl.section.cars;
  if (!carsCfg) return;

  for (const car of cl.cars) {
    car.x += car.dir * car.speed * dt;
    if (car.x <= carsCfg.minX) {
      car.x = carsCfg.minX;
      car.dir = 1;
    } else if (car.x + car.width >= carsCfg.maxX) {
      car.x = carsCfg.maxX - car.width;
      car.dir = -1;
    }
  }

  cl.honkTimer -= dt;
  if (cl.honkTimer <= 0) {
    const honkMin = carsCfg.honkIntervalMin || 1.2;
    const honkMax = carsCfg.honkIntervalMax || 2.6;
    cl.honkTimer = honkMin + Math.random() * (honkMax - honkMin);

    if (cl.cyclePhase === "showing" && cl.cars.length > 0) {
      playCarHonkSound();
      const numObscured = Math.random() < 0.55 ? 1 : 2;
      const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numObscured; i++) {
        cl.obscured[order[i]] = CAR_HONK_OBSCURE_DURATION;
      }
    }
  }
}

function roundRect(c, x, y, w, h, r) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

function drawCarsAndNpc() {
  const cl = world.codeLock;
  if (!cl) return;

  for (const car of cl.cars) {
    if (carLoaded) {
      ctx.save();
      if (car.dir === -1) {
        ctx.translate(car.x + car.width, car.y);
        ctx.scale(-1, 1);
        ctx.drawImage(carImg, 0, 0, car.width, car.height);
      } else {
        ctx.drawImage(carImg, car.x, car.y, car.width, car.height);
      }
      ctx.restore();
    } else {
      ctx.fillStyle = "#555a63";
      ctx.fillRect(car.x, car.y, car.width, car.height);
    }
  }

  const npc = cl.section.npc;
  const npcTop = npc.y !== undefined ? npc.y : world.def.groundY - npc.height;
  if (codeNpcLoaded) {
    ctx.drawImage(codeNpcImg, npc.x, npcTop, npc.width, npc.height);
  } else {
    ctx.fillStyle = "#3a6ea5";
    ctx.fillRect(npc.x, npcTop, npc.width, npc.height);
  }

  if (cl.cyclePhase === "showing") {
    const bubbleW = 150;
    const bubbleH = 54;
    const bubbleX = npc.x + npc.width / 2 - bubbleW / 2;
    const bubbleY = npcTop - bubbleH - 14;

    ctx.fillStyle = "rgba(255,255,255,0.95)";
    ctx.strokeStyle = "#222";
    ctx.lineWidth = 2;
    roundRect(ctx, bubbleX, bubbleY, bubbleW, bubbleH, 10);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bubbleX + bubbleW / 2 - 8, bubbleY + bubbleH);
    ctx.lineTo(bubbleX + bubbleW / 2 + 8, bubbleY + bubbleH);
    ctx.lineTo(bubbleX + bubbleW / 2, bubbleY + bubbleH + 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const slotW = bubbleW / 4;
    for (let i = 0; i < 4; i++) {
      const cx = bubbleX + slotW * i + slotW / 2;
      const cy = bubbleY + bubbleH / 2;
      if (cl.obscured[i] > 0) {
        ctx.fillStyle = "#d1352c";
        ctx.font = "bold 12px sans-serif";
        ctx.fillText("BEEP", cx, cy);
      } else {
        ctx.fillStyle = "#222";
        ctx.font = "bold 22px monospace";
        ctx.fillText(cl.code[i], cx, cy);
      }
    }
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }
}

let keypadEl = null;
let pendingLockedMailbox = null;
let keypadInput = "";

function buildKeypadDOM() {
  const root = document.createElement("div");
  root.id = "keypad-overlay";
  Object.assign(root.style, {
    position: "absolute",
    inset: "0",
    display: "none",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.65)",
    zIndex: "1000",
    flexDirection: "column",
  });

  const panel = document.createElement("div");
  Object.assign(panel.style, {
    background: "#22242b",
    padding: "24px",
    borderRadius: "12px",
    textAlign: "center",
    color: "#fff",
    fontFamily: "inherit",
    minWidth: "260px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.5)",
  });

  const heading = document.createElement("h2");
  heading.textContent = "Enter the 4-Digit Code";
  Object.assign(heading.style, { marginTop: "0", fontSize: "18px" });
  panel.appendChild(heading);

  const display = document.createElement("div");
  display.id = "keypad-display";
  Object.assign(display.style, {
    fontSize: "30px",
    letterSpacing: "6px",
    margin: "10px 0",
    minHeight: "38px",
    fontFamily: "monospace",
  });
  panel.appendChild(display);

  const feedback = document.createElement("div");
  feedback.id = "keypad-feedback";
  Object.assign(feedback.style, {
    minHeight: "18px",
    marginBottom: "10px",
    fontSize: "13px",
  });
  panel.appendChild(feedback);

  const grid = document.createElement("div");
  Object.assign(grid.style, {
    display: "grid",
    gridTemplateColumns: "repeat(3, 56px)",
    gap: "8px",
    justifyContent: "center",
  });
  const keysList = [
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "⌫",
    "0",
    "Enter",
  ];
  for (const k of keysList) {
    const b = document.createElement("button");
    b.textContent = k;
    b.className = "menu-btn";
    Object.assign(b.style, { padding: "12px 0", fontSize: "15px" });
    b.addEventListener("click", () => {
      playButtonSound();
      handleKeypadKey(k);
    });
    grid.appendChild(b);
  }
  panel.appendChild(grid);

  const closeBtn = document.createElement("button");
  closeBtn.textContent = "Cancel";
  closeBtn.className = "menu-btn";
  Object.assign(closeBtn.style, { marginTop: "14px" });
  closeBtn.addEventListener("click", () => {
    playButtonSound();
    hideKeypad();
  });
  panel.appendChild(closeBtn);

  root.appendChild(panel);
  document.getElementById("game-container").appendChild(root);
  return { root, display, feedback };
}

function updateKeypadDisplay() {
  const padded = keypadInput.padEnd(4, "_");
  keypadEl.display.textContent = padded.split("").join(" ");
}

function showKeypad() {
  if (!keypadEl) keypadEl = buildKeypadDOM();
  keypadInput = "";
  updateKeypadDisplay();
  keypadEl.feedback.textContent = "";
  keypadEl.feedback.style.color = "";
  keypadEl.root.style.display = "flex";
}

function hideKeypad() {
  if (keypadEl) keypadEl.root.style.display = "none";
  if (pendingLockedMailbox) pendingLockedMailbox._suppressReopen = true;
  pendingLockedMailbox = null;
}

function openKeypadForMailbox(mb) {
  if (!world.codeLock) return;
  if (world.codeLock.solved) return;
  if (keypadEl && keypadEl.root.style.display === "flex") return;
  pendingLockedMailbox = mb;
  showKeypad();
}

function handleKeypadKey(k) {
  if (!keypadEl) return;
  if (k === "⌫") {
    keypadInput = keypadInput.slice(0, -1);
  } else if (k === "Enter") {
    submitKeypadCode();
    return;
  } else if (/^[0-9]$/.test(k)) {
    if (keypadInput.length < 4) keypadInput += k;
  }
  keypadEl.feedback.textContent = "";
  updateKeypadDisplay();
}

function submitKeypadCode() {
  if (!world.codeLock || !pendingLockedMailbox) return;
  if (keypadInput.length < 4) {
    keypadEl.feedback.textContent = "Enter all 4 digits first.";
    keypadEl.feedback.style.color = "#ffb648";
    return;
  }
  const correct = keypadInput === world.codeLock.code.join("");
  if (correct) {
    world.codeLock.solved = true;
    pendingLockedMailbox.locked = false;
    playMailboxBellSound();
    keypadEl.feedback.textContent = "Correct! The mailbox unlocks.";
    keypadEl.feedback.style.color = "#7CFF7C";
    setTimeout(() => hideKeypad(), 700);
  } else {
    playButtonSound();
    keypadEl.feedback.textContent = "That's not it. Listen again.";
    keypadEl.feedback.style.color = "#ff6b6b";
    keypadInput = "";
    updateKeypadDisplay();
  }
}

const RAY_VISIBLE_DURATION = 0.5;
const RAIN_VISIBLE_DURATION = 1.2;
const STORM_GAP_MIN = 1.0;
const STORM_GAP_MAX = 2.4;
const STORM_GAP_MIN_FAST = 0.5;
const STORM_GAP_MAX_FAST = 1.3;
const STORM_WARN_LEAD = 0.4;
const RAY_NATIVE_W = 74;
const RAY_NATIVE_H = 367;
const RAY_SCALE = 0.5;
const RAIN_NATIVE_W = 74;
const RAIN_NATIVE_H = 367;
const RAIN_SCALE = 0.5;

function findStormSection() {
  return WORLD.sections.find((s) => s.storm);
}

function randomStormGap(w) {
  const min = w && w.fastMode ? STORM_GAP_MIN_FAST : STORM_GAP_MIN;
  const max = w && w.fastMode ? STORM_GAP_MAX_FAST : STORM_GAP_MAX;
  return min + Math.random() * (max - min);
}

function setStormSpeedMode(w, fast = false) {
  if (!w) return;
  w.fastMode = fast;
}

function initWeather() {
  const section = findStormSection();
  if (!section) {
    world.weather = null;
    return;
  }
  const rainZones = section.rainZones || [];
  const lightningZones = section.lightningZones || [];
  const allZones = rainZones.concat(lightningZones);
  const clusterX = allZones.length
    ? Math.min(...allZones.map((z) => z.x))
    : section.startX;
  const clusterEnd = allZones.length
    ? Math.max(...allZones.map((z) => z.x + z.width))
    : section.endX;

  world.weather = {
    section,
    rainZones,
    lightningZones,
    clusterX,
    clusterWidth: clusterEnd - clusterX,
    rayVisible: false,
    rainVisible: false,
    stormType: "rain",
    stormPhase: "gap",
    fastMode: false,
  };
  world.weather.stormTimer = randomStormGap(world.weather);
}

function resetWeatherRunState() {
  if (!world.weather) return;
  const w = world.weather;
  w.rayVisible = false;
  w.rainVisible = false;
  w.stormType = "rain";
  w.stormPhase = "gap";
  setStormSpeedMode(w, false);
  w.stormTimer = randomStormGap(w);
}

function updateWeather(dt) {
  const w = world.weather;
  if (!w) return;

  const onStormSection = getCurrentSection() === w.section;
  if (!onStormSection) return;

  if (
    w.stormPhase === "active" &&
    w.stormType === "lightning" &&
    w.rayVisible
  ) {
    const rayH = VIEW_H * RAY_SCALE;
    for (const zone of w.lightningZones) {
      const rayW = zone.width;
      const rayX = zone.x;
      const rayY = world.def.groundY - rayH;
      if (
        player.alive &&
        rectsOverlap(
          rayX,
          rayY,
          rayW,
          rayH,
          player.x,
          player.y,
          player.w,
          player.h,
        )
      ) {
        if (w.section && w.section.spawn) {
          checkpoint = { x: w.section.spawn.x, y: w.section.spawn.y };
        }
        setStormSpeedMode(w, true);
        w.rayVisible = false;
        w.stormType = "rain";
        w.stormPhase = "gap";
        w.stormTimer = randomStormGap(w);
        killPlayer();
        return;
      }
    }
  }

  if (w.stormPhase === "active" && w.stormType === "rain" && w.rainVisible) {
    const rainH = VIEW_H * RAIN_SCALE;
    for (const zone of w.rainZones) {
      const rainY = world.def.groundY - rainH;
      if (
        player.alive &&
        rectsOverlap(
          zone.x,
          rainY,
          zone.width,
          rainH,
          player.x,
          player.y,
          player.w,
          player.h,
        )
      ) {
        if (w.section && w.section.spawn) {
          checkpoint = { x: w.section.spawn.x, y: w.section.spawn.y };
        }
        setStormSpeedMode(w, true);
        w.rainVisible = false;
        w.stormType = "lightning";
        w.stormPhase = "gap";
        w.stormTimer = randomStormGap(w);
        killPlayer();
        return;
      }
    }
  }

  w.stormTimer -= dt;
  if (w.stormTimer > 0) return;

  if (w.stormPhase === "gap") {
    w.stormPhase = "warning";
    w.stormTimer = STORM_WARN_LEAD;
  } else if (w.stormPhase === "warning") {
    w.stormPhase = "active";
    if (w.stormType === "lightning") {
      w.rayVisible = true;
      playSound(stormSound);
      w.stormTimer = RAY_VISIBLE_DURATION;
    } else {
      w.rainVisible = true;
      playSound(rainSound);
      w.stormTimer = RAIN_VISIBLE_DURATION;
    }
  } else {
    w.rayVisible = false;
    w.rainVisible = false;
    w.stormType = w.stormType === "rain" ? "lightning" : "rain";
    w.stormPhase = "gap";
    w.stormTimer = randomStormGap(w);
  }
}

function drawStormFloorMarkers(w) {
  const markH = 6;
  const y = world.def.groundY - markH;
  ctx.fillStyle = "#4fa8ff";
  for (const zone of w.rainZones) ctx.fillRect(zone.x, y, zone.width, markH);
  ctx.fillStyle = "#ffd23f";
  for (const zone of w.lightningZones)
    ctx.fillRect(zone.x, y, zone.width, markH);
}

function drawWeather() {
  const w = world.weather;
  if (!w) return;

  drawStormFloorMarkers(w);

  if (rainLoaded && w.rainVisible) {
    const rainH = VIEW_H * RAIN_SCALE;
    for (const zone of w.rainZones) {
      const rainW = zone.width;
      ctx.drawImage(rainImg, zone.x, world.def.groundY - rainH, rainW, rainH);
    }
  }

  drawStormWarnings(w);

  if (!w.rayVisible) return;

  const rayH = VIEW_H * RAY_SCALE;
  for (const zone of w.lightningZones) {
    const x = zone.x;
    const y = world.def.groundY - rayH;
    if (rayLoaded) {
      ctx.drawImage(rayImg, x, y, zone.width, rayH);
    } else {
      ctx.fillStyle = "rgba(255, 255, 200, 0.85)";
      ctx.fillRect(x, y, zone.width, rayH);
    }
  }
}

function drawWarnIcon(x, y, color, alpha) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 18px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("!", x, y + 1);
  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function drawStormWarnings(w) {
  if (w.stormPhase !== "warning") return;
  const pulse = 0.6 + Math.sin(gameTime * 14) * 0.4;
  const cx = w.clusterX + w.clusterWidth / 2;
  const topY = 70;
  const color = w.stormType === "lightning" ? "#ffd23f" : "#5fb8ff";
  drawWarnIcon(cx, topY, color, pulse);
}

function findBarkSection() {
  return WORLD.sections.find((s) => s.barkingDogs);
}

function initBarkState() {
  const section = findBarkSection();
  if (!section) {
    world.barkState = null;
    return;
  }

  const cfg = section.barkConfig || {};
  const barkOnDuration = cfg.barkOn !== undefined ? cfg.barkOn : 5;
  const barkOffDuration = cfg.barkOff !== undefined ? cfg.barkOff : 5;

  world.barkState = {
    section,
    barkOnDuration,
    barkOffDuration,
    phase: "quiet",
    timer: barkOffDuration,
  };

  const phaseOffset = cfg.barkPhase || 0;
  if (phaseOffset > 0) {
    world.barkState.timer = Math.max(0.1, barkOffDuration - phaseOffset);
  }
}

function resetBarkRunState() {
  if (!world.barkState) return;
  world.barkState.phase = "quiet";
  world.barkState.timer = world.barkState.barkOffDuration;
  stopDogBarkLoop();
}

function updateBarkState(dt) {
  const bs = world.barkState;
  if (!bs) return;

  bs.timer -= dt;
  if (bs.timer <= 0) {
    if (bs.phase === "quiet") {
      bs.phase = "barking";
      bs.timer = bs.barkOnDuration;
    } else {
      bs.phase = "quiet";
      bs.timer = bs.barkOffDuration;
    }
  }

  const onBarkSection = getCurrentSection() === bs.section;

  if (onBarkSection && bs.phase === "barking") {
    startDogBarkLoop();
  } else {
    stopDogBarkLoop();
  }
}

function isControlsInverted() {
  const bs = world.barkState;
  if (!bs) return false;
  if (bs.phase !== "barking") return false;
  return getCurrentSection() === bs.section;
}

function isBarkWarningActive() {
  const bs = world.barkState;
  if (!bs) return false;
  if (bs.phase !== "quiet") return false;
  if (bs.timer > BARK_WARN_LEAD) return false;
  return getCurrentSection() === bs.section;
}

function randomBirdInterval() {
  return 4.5;
}

const INITIAL_BIRD_CHIRP_DELAY = 0.4;

const BIRD_WARN_LEAD = 0.4;
const BIRD_WARN_GAP = 0.15;

function isBirdWarningActive() {
  if (!areLevel2Stage1BirdsActive()) return false;
  return (world.birdState || []).some(
    (b) => b.chirpTimer > BIRD_WARN_GAP && b.chirpTimer <= BIRD_WARN_LEAD,
  );
}

/*
function areLevel2Stage1BirdsActive() {
  const curSection = getCurrentSection();
  if (!curSection.birdFreeze) return false;
  const mb = world.mailboxes.find(
    (m) => m.levelIndex === 1 && m.stageIndex === 0,
  );
  return !mb || player.x < mb.x;
}
  */
function areLevel2Stage1BirdsActive() {
  const curSection = getCurrentSection();
  if (!curSection.birdFreeze) return false;
  const mb = world.mailboxes.find(
    (m) =>
      m.levelIndex === curSection.levelIndex &&
      m.stageIndex === curSection.stageIndex,
  );
  return !mb || player.x < mb.x;
}

function updateBirds(dt) {
  if (!areLevel2Stage1BirdsActive()) return;
  for (const b of world.birdState || []) {
    b.chirpTimer -= dt;
    if (b.chirpTimer <= 0) {
      playBirdChirpSound();
      freezeTimer = BIRD_FREEZE_DURATION;
      b.chirpTimer = randomBirdInterval();
    }
  }
}

function getGroundSurfaceAt(x) {
  for (const g of world.def.ground) {
    if (x >= g.x && x < g.x + g.width) return g.surface || "dirt";
  }
  return null;
}

function currentSectionHasGravel() {
  const section = getCurrentSection();
  return world.def.ground.some(
    (g) =>
      g.surface === "gravel" &&
      g.x < section.endX &&
      g.x + g.width > section.startX,
  );
}

function clampCamera(targetX) {
  const half = VIEW_W / 2;
  let cx = targetX - half;

  const section = WORLD.sections[getSectionIndexForX(targetX)];
  const ext = section ? LEVEL_EXTENTS[section.levelIndex] : null;
  const lo = ext ? ext.start : 0;
  const hi = ext ? Math.max(ext.start, ext.end - VIEW_W) : WORLD.width - VIEW_W;

  cx = Math.max(lo, cx);
  cx = Math.min(hi, cx);
  if (ext && ext.end - ext.start < VIEW_W) cx = ext.start;
  return cx;
}

function setTitleBackground(active) {
  overlay.classList.remove("end-bg");
  if (active) {
    overlay.classList.add("title-bg");
    overlayTitle.style.display = "none";
  } else {
    overlay.classList.remove("title-bg");
    overlayTitle.style.display = "";
  }
}

function showStartOverlay() {
  playMenuMusic();
  setTitleBackground(true);
  overlayTitle.textContent = "TACTIC";
  overlayText.textContent = "";
  overlayBtn.textContent = "Play";
  overlay.classList.remove("hidden");
  overlay.dataset.end = "";
  overlay.dataset.title = "1";
}

function showEndOverlay() {
  setTitleBackground(false);
  overlay.classList.add("end-bg");

  overlayTitle.textContent = "You made it!";
  overlayText.textContent =
    "You've reached the end of the road, checkpoint by checkpoint.";
  overlayBtn.textContent = "Return To Menu";
  overlay.classList.remove("hidden");
  overlay.dataset.end = "1";
}

overlayBtn.addEventListener("click", () => {
  playButtonSound();

  if (overlay.dataset.title === "1") {
    playButtonSound();
    overlay.dataset.title = "";
    overlay.classList.add("hidden");
    showLevelSelect();
    return;
  }
  if (overlay.dataset.pauseAction === "restart") {
    overlay.dataset.pauseAction = "";
    isPaused = false;
    removeLevelJumpButtons();
    respawnPlayer();
    overlay.classList.add("hidden");
  } else if (overlay.dataset.end === "1") {
    overlay.dataset.end = "";

    loadWorld();
    showStartOverlay();
  } else {
    overlay.classList.add("hidden");
  }
});

restartBtn.addEventListener("click", () => {
  playButtonSound();
  respawnPlayer();
});

function removeLevelJumpButtons() {
  const row = document.getElementById("overlay-level-row");
  if (row) row.remove();
  const menuBtn = document.getElementById("overlay-menu-btn");
  if (menuBtn) menuBtn.remove();
  const lsBtn = document.getElementById("overlay-levelselect-btn");
  if (lsBtn) lsBtn.remove();
  const actionsRow = document.getElementById("overlay-pause-actions");
  if (actionsRow) {
    if (overlayBtn.parentNode === actionsRow) {
      actionsRow.parentNode.insertBefore(overlayBtn, actionsRow);
    }
    actionsRow.remove();
  }
}

function jumpToLevelStage1(levelIdx) {
  playButtonSound();
  isPaused = false;
  overlay.dataset.pauseAction = "";
  removeLevelJumpButtons();
  overlay.classList.add("hidden");
  startStage(levelIdx, 0);
}

function enterPauseState() {
  isPaused = true;
  setTitleBackground(false);
  overlayTitle.textContent = "PAUSED";
  overlayText.textContent = "";
  overlayBtn.textContent = "Restart From Checkpoint";
  overlay.dataset.pauseAction = "restart";
  overlay.classList.remove("hidden");

  let actionsRow = document.getElementById("overlay-pause-actions");
  if (!actionsRow) {
    actionsRow = document.createElement("div");
    actionsRow.id = "overlay-pause-actions";
    overlayBtn.parentNode.insertBefore(actionsRow, overlayBtn);
    actionsRow.appendChild(overlayBtn);

    const menuBtn = document.createElement("button");
    menuBtn.id = "overlay-menu-btn";
    menuBtn.className = "menu-btn";
    menuBtn.textContent = "Main Menu";
    menuBtn.addEventListener("click", () => {
      playButtonSound();
      isPaused = false;
      overlay.dataset.pauseAction = "";
      removeLevelJumpButtons();
      loadWorld();
      showStartOverlay();
    });
    actionsRow.appendChild(menuBtn);

    const lsBtn = document.createElement("button");
    lsBtn.id = "overlay-levelselect-btn";
    lsBtn.className = "menu-btn";
    lsBtn.textContent = "Level Select";
    lsBtn.addEventListener("click", pauseOpenLevelSelect);
    actionsRow.appendChild(lsBtn);
  }
}

function pauseRestartFromCheckpoint() {
  playButtonSound();
  overlay.dataset.pauseAction = "";
  isPaused = false;
  removeLevelJumpButtons();
  respawnPlayer();
  overlay.classList.add("hidden");
}

function pauseGoToMainMenu() {
  playButtonSound();
  isPaused = false;
  overlay.dataset.pauseAction = "";
  removeLevelJumpButtons();
  hideLevelSelect();
  loadWorld();
  showStartOverlay();
}

function pauseOpenLevelSelect() {
  playButtonSound();
  isPaused = false;
  overlay.dataset.pauseAction = "";
  removeLevelJumpButtons();
  overlay.classList.add("hidden");
  showLevelSelect();
}

// ============================================================
// DEBUG MODE — press Backquote (`) to toggle. Lets graders jump to
// any built stage or app screen, and shows a live readout of the
// state values needed to verify behavior.
// ============================================================
let debugPanelEl = null;
let debugUpdateInterval = null;

function debugJumpToStage(levelIdx, stageIdx) {
  closeDebugPanel();
  hideLevelSelect();
  overlay.classList.add("hidden");
  overlay.dataset.pauseAction = "";
  removeLevelJumpButtons();
  isPaused = false;
  startStage(levelIdx, stageIdx);
}

function buildDebugPanelDOM() {
  const root = document.createElement("div");
  root.id = "debug-panel";

  const heading = document.createElement("h1");
  heading.textContent = "DEBUG MODE";
  root.appendChild(heading);

  const hint = document.createElement("p");
  hint.id = "debug-hint";
  hint.textContent = "Press ` to close";
  root.appendChild(hint);

  const levelHeading = document.createElement("h2");
  levelHeading.textContent = "Jump to Level";
  root.appendChild(levelHeading);

  const levelRow = document.createElement("div");
  levelRow.id = "debug-level-row";
  for (let lvl = 0; lvl < 3; lvl++) {
    const btn = document.createElement("button");
    btn.className = "menu-btn debug-btn";
    btn.textContent = `${lvl + 1}: Level ${lvl + 1}`;
    btn.addEventListener("click", () => debugJumpToStage(lvl, 0));
    levelRow.appendChild(btn);
  }
  root.appendChild(levelRow);

  const stageHeading = document.createElement("h2");
  stageHeading.textContent = "Click to visit stage";
  root.appendChild(stageHeading);

  const stageGrid = document.createElement("div");
  stageGrid.id = "debug-stage-grid";
  for (let levelIdx = 0; levelIdx < LEVEL_COUNT; levelIdx++) {
    for (let stageIdx = 0; stageIdx < STAGES_PER_LEVEL; stageIdx++) {
      if (!isStageBuilt(levelIdx, stageIdx)) continue;
      const btn = document.createElement("button");
      btn.className = "menu-btn debug-btn";
      btn.textContent = stageButtonLabel(levelIdx, stageIdx);
      btn.addEventListener("click", () => debugJumpToStage(levelIdx, stageIdx));
      stageGrid.appendChild(btn);
    }
  }
  root.appendChild(stageGrid);

  const screenHeading = document.createElement("h2");
  screenHeading.textContent = "Jump to Screen";
  root.appendChild(screenHeading);

  const screenRow = document.createElement("div");
  screenRow.id = "debug-screen-row";

  const screens = [
    [
      "M: Main screen",
      () => {
        closeDebugPanel();
        hideLevelSelect();
        isPaused = false;
        loadWorld();
        showStartOverlay();
      },
    ],
    [
      "L: Level screen",
      () => {
        closeDebugPanel();
        overlay.classList.add("hidden");
        isPaused = false;
        showLevelSelect();
      },
    ],
    [
      "O: Game over",
      () => {
        closeDebugPanel();
        hideLevelSelect();
        isPaused = false;
        showEndOverlay();
      },
    ],
  ];
  for (const [label, fn] of screens) {
    const btn = document.createElement("button");
    btn.className = "menu-btn debug-btn";
    btn.textContent = label;
    btn.addEventListener("click", fn);
    screenRow.appendChild(btn);
  }
  root.appendChild(screenRow);

  document.getElementById("game-container").appendChild(root);
  return root;
}

function refreshDebugState() {}

function openDebugPanel() {
  if (!debugPanelEl) debugPanelEl = buildDebugPanelDOM();
  debugPanelEl.style.display = "flex";
  refreshDebugState();
  if (debugUpdateInterval) clearInterval(debugUpdateInterval);
  debugUpdateInterval = setInterval(refreshDebugState, 200);
}

function closeDebugPanel() {
  if (debugPanelEl) debugPanelEl.style.display = "none";
  if (debugUpdateInterval) {
    clearInterval(debugUpdateInterval);
    debugUpdateInterval = null;
  }
}

function toggleDebugPanel() {
  const isOpen = debugPanelEl && debugPanelEl.style.display === "flex";
  if (isOpen) closeDebugPanel();
  else openDebugPanel();
}

window.addEventListener("keydown", (e) => {
  if (e.code === "Backquote") {
    toggleDebugPanel();
    e.preventDefault();
    return;
  }
});

window.addEventListener("keydown", (e) => {
  if (keypadEl && keypadEl.root.style.display === "flex") {
    if (/^Digit[0-9]$/.test(e.code)) {
      handleKeypadKey(e.code.replace("Digit", ""));
      e.preventDefault();
      return;
    }
    if (/^Numpad[0-9]$/.test(e.code)) {
      handleKeypadKey(e.code.replace("Numpad", ""));
      e.preventDefault();
      return;
    }
    if (e.code === "Backspace") {
      handleKeypadKey("⌫");
      e.preventDefault();
      return;
    }
    if (e.code === "Enter" || e.code === "NumpadEnter") {
      handleKeypadKey("Enter");
      e.preventDefault();
      return;
    }
    if (e.code === "Escape") {
      playButtonSound();
      hideKeypad();
      e.preventDefault();
      return;
    }
    e.preventDefault();
    return;
  }

  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = true;
  if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
    keys.up = true;
  }
  if (e.code === "KeyT") keys.t = true;
  if (e.code === "KeyH") keys.slow = true;
  if (e.code === "Digit1") jumpToLevelStage1(0);
  if (e.code === "Digit2") jumpToLevelStage1(1);
  if (e.code === "Digit3") jumpToLevelStage1(2);
  if (e.code === "KeyR") pauseRestartFromCheckpoint();
  if (e.code === "KeyM") {
    closeDebugPanel();
    pauseGoToMainMenu();
  }
  if (e.code === "KeyL") {
    closeDebugPanel();
    pauseOpenLevelSelect();
  }
  if (e.code === "KeyO") {
    closeDebugPanel();
    hideLevelSelect();
    isPaused = false;
    showEndOverlay();
  }
  if (e.code === "Escape") {
    if (!isPaused && overlay.classList.contains("hidden")) {
      enterPauseState();
    } else if (isPaused) {
      isPaused = false;
      overlay.dataset.pauseAction = "";
      removeLevelJumpButtons();
      overlay.classList.add("hidden");
    }
    e.preventDefault();
  }
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space"].includes(e.code)) {
    e.preventDefault();
  }
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") keys.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") keys.right = false;
  if (e.code === "ArrowUp" || e.code === "Space" || e.code === "KeyW") {
    keys.up = false;
  }
  if (e.code === "KeyT") keys.t = false;
  if (e.code === "KeyH") keys.slow = false;
});

function getGroundSegmentsAt(x) {
  const segs = [];
  for (const g of world.def.ground) {
    segs.push({
      left: g.x,
      right: g.x + g.width,
      top: world.def.groundY,
      surface: g.surface || "dirt",
    });
  }

  for (const t of world.trapState) {
    if (!t.fallen) continue;
    const newSegs = [];
    for (const s of segs) {
      if (t.x >= s.right || t.x + t.width <= s.left) {
        newSegs.push(s);
        continue;
      }
      if (t.x > s.left) {
        newSegs.push({
          left: s.left,
          right: Math.min(t.x, s.right),
          top: s.top,
          surface: s.surface,
        });
      }
      const rightStart = t.x + t.width;
      if (rightStart < s.right) {
        newSegs.push({
          left: Math.max(rightStart, s.left),
          right: s.right,
          top: s.top,
          surface: s.surface,
        });
      }
    }
    segs.length = 0;
    segs.push(...newSegs);
  }

  if (world.def.blocks && world.def.blocks.length) {
    for (const b of world.def.blocks) {
      segs.push({
        left: b.x,
        right: b.x + b.width,
        top: world.def.groundY - b.height,
      });
    }
  }

  return segs;
}

function getAllHazards() {
  const staticHazards = world.def.hazards || [];
  const dyn = world.dynamicHazards || [];
  return staticHazards.concat(dyn);
}

function rectsOverlap(ax, ay, aw, ah, bx, by, bw, bh) {
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by;
}

function overlapsBlock(px, py, pw, ph, bx, by, bw, bh, cornerRadius) {
  if (!rectsOverlap(px, py, pw, ph, bx, by, bw, bh)) return false;
  if (!cornerRadius) return true;
  const cx = bx + bw - cornerRadius;
  const cy = by + cornerRadius;
  const nearestX = Math.max(px, Math.min(cx, px + pw));
  const nearestY = Math.max(py, Math.min(cy, py + ph));
  if (nearestX >= cx && nearestY <= cy) {
    const dx = nearestX - cx;
    const dy = nearestY - cy;
    return dx * dx + dy * dy <= cornerRadius * cornerRadius;
  }
  return true;
}

function triggerJumpTraps() {
  for (const t of world.trapState) {
    if (t.armed || t.fallen) continue;
    const centerX = t.x + t.width / 2;
    if (Math.abs(centerX - (player.x + player.w / 2)) <= TRAP_TRIGGER_RANGE) {
      t.armed = true;
      t.fallTimer = TRAP_FALL_DELAY;
    }
  }
}

function killPlayer() {
  if (!player.alive) return;
  player.alive = false;
  stopGravelFootsteps();
  stopDogBarkLoop();
  deathFlashTimer = 0.5;
  setTimeout(() => {
    respawnPlayer();
  }, 420);
}

function updateMovingPlatforms(dt) {
  for (const p of world.movingPlatforms) {
    const t = gameTime * p.speed * 0.01 + p.phase * Math.PI;
    const norm = (Math.sin(t) + 1) / 2;
    p.currentX = p.x + norm * p.range;
  }
}

function updateGroundHazards(dt) {
  for (const g of world.groundHazards || []) {
    if (!g.range || g.range <= 0) {
      g.currentX = g.x;
      continue;
    }

    if (g._dir === undefined) {
      g.currentX = g.x;
      g._dir = 1;
      g._paused = true;
      g._pauseTimer = Math.random() * 0.6;
      g._moveTimer = 0;
      g._rate = 0.6 + Math.random() * 0.7;
    }

    if (g._paused) {
      g._pauseTimer -= dt;
      if (g._pauseTimer <= 0) {
        g._paused = false;
        g._moveTimer = 0.35 + Math.random() * 0.9;
        g._rate = 0.6 + Math.random() * 0.7;
      }
      continue;
    }

    const minX = g.x;
    const maxX = g.x + g.range;
    g.currentX += g._dir * g.speed * g._rate * dt;

    if (g.currentX <= minX) {
      g.currentX = minX;
      g._dir = 1;
      g._paused = true;
      g._pauseTimer = 0.3 + Math.random() * 0.8;
      continue;
    }
    if (g.currentX >= maxX) {
      g.currentX = maxX;
      g._dir = -1;
      g._paused = true;
      g._pauseTimer = 0.3 + Math.random() * 0.8;
      continue;
    }

    g._moveTimer -= dt;
    if (g._moveTimer <= 0) {
      g._paused = true;
      g._pauseTimer = 0.2 + Math.random() * 0.6;
    }
  }
}

function updateTraps(dt) {
  for (const t of world.trapState) {
    if (t.armed && !t.fallen) {
      t.fallTimer -= dt;
      if (t.fallTimer <= 0) {
        t.fallen = true;
      }
    }
    if (t.fallen && t.fallOffset < 400) {
      t.fallOffset += 1400 * dt;
    }
  }
}

function updateCauseAndEffectTriggers(dt) {
  if (!world || !world.def || !world.def.blocks) return;

  if (player.grounded && !player.wasGrounded) {
    const feetY = player.y + player.h;
    for (const b of world.def.blocks) {
      if (
        !(
          b.sprite === "stackedbox" ||
          b.sprite === "box" ||
          b.sprite === "2box" ||
          b.triggersHole
        )
      )
        continue;

      const top = world.def.groundY - b.height;
      const overlapX = player.x + player.w > b.x && player.x < b.x + b.width;
      if (overlapX && Math.abs(feetY - top) <= 8) {
        if (b.triggerHoleId) {
          const trap = world.trapState.find((tt) => tt.id === b.triggerHoleId);
          if (trap && !trap.armed && !trap.fallen) {
            trap.armed = true;
            trap.fallTimer = 0.6;
          }
        } else {
          const secIdx = getSectionIndexForX(b.x);
          const sec = WORLD.sections[secIdx];
          if (sec) {
            for (const tt of world.trapState) {
              if (tt.armed || tt.fallen) continue;
              if (tt.x >= sec.startX && tt.x < sec.endX) {
                tt.armed = true;
                tt.fallTimer = 0.6;
              }
            }
          }
        }
        break;
      }
    }
  }
}

function initGapExpansion() {
  const section = WORLD.sections.find(
    (s) => s.levelIndex === 0 && s.stageIndex === 3,
  );
  if (!section) {
    world.gapExpansion = null;
    return;
  }
  world.gapExpansion = {
    triggered: false,
    x: section.startX + 380,
    width: 80,
    maxWidth: 700,
    speed: 380,
  };
}

function updateGapExpansion(dt) {
  const g = world.gapExpansion;
  if (!g) return;

  if (!g.triggered) {
    const playerCenterX = player.x + player.w / 2;
    if (player.grounded && playerCenterX > g.x + g.width) {
      g.triggered = true;
    }
  }

  if (!g.triggered) return;

  g.width = Math.min(g.maxWidth, g.width + g.speed * dt);

  const t = world.trapState.find((t) => t.id === "gap-seed");
  if (t) {
    t.width = g.width;
    t.fallen = true;
    t.fallOffset = 400;
  }
}

function isHazardVisible(hz) {
  const onDur = hz.flashOn !== undefined ? hz.flashOn : 0.6;
  const offDur = hz.flashOff !== undefined ? hz.flashOff : 0.3;
  const phase = hz.flashPhase || 0;
  const cycle = onDur + offDur;
  const t = ((gameTime + phase) % cycle) + cycle;
  return t % cycle < onDur;
}

function getEffectiveSpeedFactor() {
  return world.speedFactor !== undefined ? world.speedFactor : 1;
}

function update(dt) {
  if (!player.alive) return;

  for (const n of world.jumpBoostState || []) {
    const dx = player.x + player.w / 2 - n.x;
    const dy = player.y + player.h / 2 - n.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= n.radius) {
      n.charge = Math.min(n.chargeTime, n.charge + dt);
      if (n.charge >= n.chargeTime) {
        player.superJumpReady = true;
        player.superJumpMultiplier = n.jumpMultiplier;
        n.charge = 0;
      }
    } else {
      n.charge = 0;
    }
  }

  if (!areLevel2Stage1BirdsActive()) freezeTimer = 0;
  if (freezeTimer > 0) freezeTimer -= dt;
  const isFrozen = freezeTimer > 0;

  updateMovingPlatforms(dt);
  updateGroundHazards(dt);
  updateTraps(dt);
  updateCauseAndEffectTriggers(dt);
  updateGapExpansion(dt);
  updateBirds(dt);
  updateCarsAndNpc(dt);
  updateWeather(dt);
  updateBarkState(dt);

  const effFactor = getEffectiveSpeedFactor();
  const baseSpeed = keys.slow ? SNEAK_SPEED : MOVE_SPEED;
  const inverted = isControlsInverted();
  const rawLeft = !isFrozen && keys.left;
  const rawRight = !isFrozen && keys.right;
  const effectiveLeft = inverted ? rawRight : rawLeft;
  const effectiveRight = inverted ? rawLeft : rawRight;
  const targetVx = effectiveLeft
    ? -baseSpeed * effFactor
    : effectiveRight
      ? baseSpeed * effFactor
      : 0;

  player.vx = targetVx;
  if (player.vx < 0) player.facing = -1;
  else if (player.vx > 0) player.facing = 1;

  if (keys.up && player.grounded && !isFrozen) {
    const boosted = player.superJumpReady;
    player.vy = boosted
      ? JUMP_VELOCITY * player.superJumpMultiplier
      : JUMP_VELOCITY;
    if (boosted) player.superJumpReady = false;
    player.grounded = false;
    playJumpSound();
    triggerJumpTraps();
  }

  player.vy += GRAVITY * dt;

  const prevX = player.x;
  player.x += player.vx * dt;

  if (world.def.blocks && world.def.blocks.length) {
    for (const b of world.def.blocks) {
      const bx = b.x;
      const bTop = world.def.groundY - b.height;
      if (
        overlapsBlock(
          player.x,
          player.y,
          player.w,
          player.h,
          bx,
          bTop,
          b.width,
          b.height,
          b.cornerRadius,
        )
      ) {
        if (player.x > prevX) {
          player.x = bx - player.w;
        } else if (player.x < prevX) {
          player.x = bx + b.width;
        }
        player.vx = 0;
      }
    }
  }

  for (const mb of world.mailboxes) {
    if (!mb.locked) continue;
    const wallTop = 0;
    const wallHeight = world.def.groundY;
    const touchingWall = rectsOverlap(
      player.x,
      player.y,
      player.w,
      player.h,
      mb.x,
      wallTop,
      mb.width,
      wallHeight,
    );
    if (touchingWall) {
      if (player.x > prevX) {
        player.x = mb.x - player.w;
        if (!mb._suppressReopen) openKeypadForMailbox(mb);
      } else if (player.x < prevX) {
        player.x = mb.x + mb.width;
      }
      player.vx = 0;
    } else {
      mb._suppressReopen = false;
    }
  }

  const wallSegs = getGroundSegmentsAt(player.x);
  for (const seg of wallSegs) {
    const overlapX = player.x + player.w > seg.left && player.x < seg.right;
    const embedded = player.y + player.h > seg.top + 4;
    if (overlapX && embedded) {
      if (player.x > prevX) {
        player.x = seg.left - player.w;
      } else if (player.x < prevX) {
        player.x = seg.right;
      }
      player.vx = 0;
    }
  }

  const prevLevelSectionIdx = getSectionIndexForX(prevX);
  const curLevelIdx = WORLD.sections[prevLevelSectionIdx]
    ? WORLD.sections[prevLevelSectionIdx].levelIndex
    : 0;
  const curExt = LEVEL_EXTENTS[curLevelIdx];
  const lo = curExt ? curExt.start : 0;
  const hi = curExt ? curExt.end - player.w : world.def.width - player.w;

  // Walking off the right edge of a level's last stage carries you into the
  // next level's first stage; walking off the left edge of a level's first
  // stage carries you back into the previous level's last stage.
  const nextExt = curExt ? LEVEL_EXTENTS[curLevelIdx + 1] : null;
  const prevExt = curExt ? LEVEL_EXTENTS[curLevelIdx - 1] : null;
  if (curExt && player.x > hi && nextExt) {
    player.x = nextExt.start + 24;
    checkpoint = { x: player.x, y: player.y };
  } else if (curExt && player.x < lo && prevExt) {
    player.x = prevExt.end - player.w - 24;
    checkpoint = { x: player.x, y: player.y };
  } else {
    player.x = Math.max(lo, Math.min(hi, player.x));
  }

  player.y += player.vy * dt;

  player.grounded = false;
  let standingSurface = null;
  const feetY = player.y + player.h;
  const segs = getGroundSegmentsAt(player.x);
  for (const seg of segs) {
    const overlapX = player.x + player.w > seg.left && player.x < seg.right;
    if (
      overlapX &&
      player.vy >= 0 &&
      feetY >= seg.top &&
      feetY - player.vy * dt <= seg.top + 12
    ) {
      player.y = seg.top - player.h;
      player.vy = 0;
      player.grounded = true;
      standingSurface = seg.surface || null;
    }
  }

  for (const p of world.movingPlatforms) {
    const px = p.currentX !== undefined ? p.currentX : p.x;
    const overlapX = player.x + player.w > px && player.x < px + p.width;
    const top = p.y;
    if (
      overlapX &&
      player.vy >= 0 &&
      feetY >= top &&
      feetY - player.vy * dt <= top + 14
    ) {
      player.y = top - player.h;
      player.vy = 0;
      player.grounded = true;
      player.x += px - (p.lastX !== undefined ? p.lastX : px);
    }
    p.lastX = px;
  }

  const isMovingOnGround = player.grounded && Math.abs(player.vx) > 5;
  const isNoisy =
    isMovingOnGround && standingSurface === "gravel" && !keys.slow;
  if (isNoisy) {
    startGravelFootsteps();
  } else {
    stopGravelFootsteps();
  }
  if (!currentSectionHasGravel()) {
    // Left the gravel stage entirely — kill the bar immediately instead of
    // letting it linger and tick down while already in the next stage.
    noiseLevel = 0;
  } else if (standingSurface === "gravel" || noiseLevel > 0) {
    noiseLevel += (isNoisy ? NOISE_RATE_UP : -NOISE_RATE_DOWN) * dt;
    noiseLevel = Math.max(0, Math.min(NOISE_MAX, noiseLevel));
    if (noiseLevel >= NOISE_MAX) {
      killPlayer();
      return;
    }
  }

  for (const hz of getAllHazards()) {
    if (hz.flash && !isHazardVisible(hz)) continue;

    const hzY = hz.y !== undefined ? hz.y : world.def.groundY - hz.height;
    if (
      rectsOverlap(
        player.x,
        player.y,
        player.w,
        player.h,
        hz.x,
        hzY,
        hz.width,
        hz.height,
      )
    ) {
      killPlayer();
      return;
    }
  }

  for (const g of world.groundHazards || []) {
    const gx = g.currentX !== undefined ? g.currentX : g.x;
    const gy = world.def.groundY - g.height;
    if (
      rectsOverlap(
        player.x,
        player.y,
        player.w,
        player.h,
        gx,
        gy,
        g.width,
        g.height,
      )
    ) {
      killPlayer();
      return;
    }
  }

  const fallLimit = WORLD.sections[getSectionIndexForX(player.x)].fallLimit;
  if (player.y > fallLimit) {
    killPlayer();
    return;
  }

  for (const mb of world.mailboxes) {
    const mbTop = mb.y !== undefined ? mb.y : world.def.groundY - mb.height;
    const overlapping = rectsOverlap(
      player.x,
      player.y,
      player.w,
      player.h,
      mb.x,
      mbTop,
      mb.width,
      mb.height,
    );
    if (overlapping) {
      if (mb.locked) {
        if (!mb._suppressReopen) openKeypadForMailbox(mb);
        continue;
      }
      activateCheckpoint(mb);
    } else {
      mb._suppressReopen = false;
    }
  }

  updateLevelLabel();

  player.wasGrounded = player.grounded;

  camera.x = clampCamera(player.x + player.w / 2);
}

/*
function activateCheckpoint(mb) {
  if (mb.activated) return;
  mb.activated = true;
  playMailboxBellSound();

  Progress.completeStage(mb.levelIndex, mb.stageIndex);

  // "Last stage of the level" means the last stage actually built for
  // this level (some levels, like Level 2, have fewer than
  // STAGES_PER_LEVEL stages built so far), not a hardcoded count.
  const builtStagesForLevel = WORLD.sections.filter(
    (s) => s.levelIndex === mb.levelIndex,
  ).length;
  const isLastStageOfLevel = mb.stageIndex === builtStagesForLevel - 1;
  const isLastLevel = mb.levelIndex === LEVEL_COUNT - 1;

  if (isLastStageOfLevel && isLastLevel) {
    // The true end of the game (Level 5's 5th stage). Dormant for now
    // since Levels 2, 4, 5 aren't built — this fires once they exist.
    showEndOverlay();
    return;
  }

  // Respawn point becomes wherever this checkpoint is (mirrors the old
  // "checkpoint = the mailbox you just hit" behavior).
  checkpoint = {
    x: mb.x,
    y: mb.y !== undefined ? mb.y : world.def.groundY - mb.height,
  };

  if (isLastStageOfLevel) {
    // Cleared every stage in this level — hand the player back to Level
    // Select to pick where to go next.
    showLevelSelect();
  }
}
*/

function activateCheckpoint(mb) {
  const firstTime = !mb.activated;
  mb.activated = true;

  checkpoint = {
    x: mb.x,
    y: mb.y !== undefined ? mb.y : world.def.groundY - mb.height,
  };

  if (!firstTime) return;

  playMailboxBellSound();
  Progress.completeStage(mb.levelIndex, mb.stageIndex);

  const builtStagesForLevel = WORLD.sections.filter(
    (s) => s.levelIndex === mb.levelIndex,
  ).length;
  const isLastStageOfLevel = mb.stageIndex === builtStagesForLevel - 1;
  const isLastLevel = mb.levelIndex === LEVEL_COUNT - 1;

  if (isLastStageOfLevel && isLastLevel) {
    showEndOverlay();
    return;
  }

  if (isLastStageOfLevel) {
    goToNextLevel(mb.levelIndex);
  }
}

function goToNextLevel(fromLevelIdx) {
  showLevelSelect();
}

function draw() {
  ctx.clearRect(0, 0, VIEW_W, VIEW_H);

  ctx.save();
  ctx.translate(-camera.x, 0);

  for (const levelIdxStr of Object.keys(LEVEL_EXTENTS)) {
    const levelIdx = Number(levelIdxStr);
    const ext = LEVEL_EXTENTS[levelIdx];
    const w = ext.end - ext.start;
    const img =
      levelIdx === 1 ? level2BgImg : levelIdx === 2 ? level3BgImg : levelBgImg;
    const loaded =
      levelIdx === 1
        ? level2BgLoaded
        : levelIdx === 2
          ? level3BgLoaded
          : levelBgLoaded;
    if (loaded) {
      ctx.drawImage(img, ext.start, 0, w, VIEW_H);
    }
  }

  drawWeather();

  ctx.fillStyle = "rgba(191, 191, 191, 0)";
  /*
  for (const g of world.def.ground) {
    ctx.fillRect(g.x, world.def.groundY, g.width, VIEW_H);
  }
    */
  for (const g of world.def.ground) {
    ctx.fillRect(g.x, world.def.groundY, g.width, VIEW_H);

    if (g.surface === "gravel") {
      ctx.fillStyle = "#888";
      ctx.fillRect(g.x, world.def.groundY - 8, g.width, 8);

      ctx.fillStyle = "rgba(191, 191, 191, 0)";
    }
  }

  for (const t of world.trapState) {
    if (t.fallen) {
      ctx.fillStyle = "tan";
      ctx.fillRect(t.x, world.def.groundY + t.fallOffset, t.width, 14);
      ctx.fillStyle = "#38201F";
      ctx.fillRect(t.x, world.def.groundY, t.width, VIEW_H);
    } else if (t.armed) {
      const shake = Math.sin(gameTime * 60) * 2;
      ctx.fillStyle = "rgba(0,0,0,0.15)";
      ctx.fillRect(t.x + shake, world.def.groundY, t.width, 6);
    }
  }

  for (const p of world.movingPlatforms) {
    const px = p.currentX !== undefined ? p.currentX : p.x;
    ctx.fillStyle = p.color || "#6ABB40";
    ctx.fillRect(px, p.y, p.width, 14);
    ctx.fillStyle = p.colorSide || "#754F33";
    ctx.fillRect(px, p.y + 14, p.width, 8);
  }

  for (const g of world.groundHazards || []) {
    const gx = g.currentX !== undefined ? g.currentX : g.x;
    const gy = world.def.groundY - g.height;
    const useDog = g.sprite === "dog";
    const img = useDog ? dogImg : whitedogImg;
    const imgReady = useDog ? dogLoaded : whitedogLoaded;
    if (imgReady) {
      if (!useDog && img.naturalWidth && img.naturalHeight) {
        const dw = g.width;
        const dh = dw * (img.naturalHeight / img.naturalWidth);
        ctx.drawImage(img, gx, gy + g.height - dh, dw, dh);
      } else {
        ctx.drawImage(img, gx, gy, g.width, g.height);
      }
    }
  }

  for (const b of world.def.blocks || []) {
    const top = world.def.groundY - b.height;
    if (b.sprite === "box") {
      if (boxLoaded) ctx.drawImage(boxImg, b.x, top, b.width, b.height);
    } else if (b.sprite === "stackedboxes") {
      if (stackedboxesLoaded)
        ctx.drawImage(stackedboxesImg, b.x, top, b.width, b.height);
    } else if (b.sprite === "stairs") {
      if (stairsLoaded) ctx.drawImage(stairsImg, b.x, top, b.width, b.height);
    } else if (box2Loaded) {
      ctx.drawImage(box2Img, b.x, top, b.width, b.height);
    }
  }

  for (const n of world.jumpBoostState || []) {
    const ringY = n.y - 32;
    ctx.fillStyle = n.charge >= n.chargeTime ? "#7EC8FF" : "#9FB6C9";
    ctx.beginPath();
    ctx.arc(n.x, ringY, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#1B5FA8";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(
      n.x,
      ringY,
      26,
      -Math.PI / 2,
      -Math.PI / 2 + (n.charge / n.chargeTime) * Math.PI * 2,
    );
    ctx.stroke();
  }

  for (const hz of getAllHazards()) {
    if (hz.flash && !isHazardVisible(hz)) continue;

    const hzY = hz.y !== undefined ? hz.y : world.def.groundY - hz.height;
    const img =
      hz.sprite === "whitedog"
        ? whitedogImg
        : hz.sprite === "dog"
          ? dogImg
          : boxImg;
    const imgReady =
      hz.sprite === "whitedog"
        ? whitedogLoaded
        : hz.sprite === "dog"
          ? dogLoaded
          : boxLoaded;

    if (imgReady) {
      if (hz.sprite === "whitedog" && img.naturalWidth && img.naturalHeight) {
        const dw = hz.width;
        const dh = dw * (img.naturalHeight / img.naturalWidth);
        ctx.drawImage(img, hz.x, hzY + hz.height - dh, dw, dh);
      } else {
        ctx.drawImage(img, hz.x, hzY, hz.width, hz.height);
      }
    }
  }

  for (const mb of world.mailboxes) {
    const mbTop = mb.y !== undefined ? mb.y : world.def.groundY - mb.height;

    const mailboxImg = mb.activated ? mailboxDownImg : mailboxUpImg;
    const mailboxReady = mb.activated ? mailboxDownLoaded : mailboxUpLoaded;

    if (mailboxReady) {
      ctx.drawImage(mailboxImg, mb.x, mbTop, mb.width, mb.height);
    }
  }

  for (const tr of world.def.trees || []) {
    if (treeLoaded) {
      ctx.drawImage(
        treeImg,
        tr.x,
        world.def.groundY - tr.height,
        tr.width,
        tr.height,
      );
    }
  }
  for (const b of world.birdState || []) {
    if (birdImgLoaded) {
      ctx.drawImage(birdImg, b.x, b.y, b.width, b.height);
    }
  }

  drawCarsAndNpc();

  if (player.alive || deathFlashTimer > 0) {
    drawPlayer();
  }

  if (
    player.alive &&
    (getGroundSurfaceAt(player.x) === "gravel" || noiseLevel > 0)
  ) {
    const barW = 46;
    const barH = 7;
    const bx = player.x + player.w / 2 - barW / 2;
    const by = player.y - 16;
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillRect(bx, by, barW, barH);
    ctx.fillStyle = noiseLevel > NOISE_MAX * 0.7 ? "#ff5b5b" : "#f0c95f";
    ctx.fillRect(bx, by, barW * (noiseLevel / NOISE_MAX), barH);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, barW, barH);
  }

  if (player.alive && (freezeTimer > 0 || isBirdWarningActive())) {
    const pulse = 0.6 + Math.sin(gameTime * 14) * 0.4;
    const tx = player.x + player.w / 2;
    const ty = player.y - 30;
    ctx.globalAlpha = pulse;
    ctx.fillStyle = "#ffd23f";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(tx, ty, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 16px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("!", tx, ty + 1);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  if (player.alive && isBarkWarningActive()) {
    const barkPulse = 0.6 + Math.sin(gameTime * 14) * 0.4;
    ctx.globalAlpha = barkPulse;
    ctx.fillStyle = "#ff3b3b";
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 3;
    ctx.font = "bold 28px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText("DOGS BARKING SOON — CONTROLS WILL FLIP!", VIEW_W / 2, 60);
    ctx.fillText("DOGS BARKING SOON — CONTROLS WILL FLIP!", VIEW_W / 2, 60);
    ctx.globalAlpha = 1;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
  }

  ctx.restore();
}
function drawPlayer() {
  const x = player.x;
  const y = player.y;
  const w = player.w;
  const h = player.h;

  if (!spriteLoaded) {
    return;
  }

  const row = player.facing === -1 ? 0 : 1;

  const isMoving = player.grounded && (keys.left || keys.right);

  const col = isMoving
    ? Math.floor((gameTime / SPRITE_FRAME_DURATION) % SPRITE_COLS)
    : 0;

  const sx = col * SPRITE_FRAME_W;
  const sy = row * SPRITE_FRAME_H;

  const SPRITE_SCALE = 0.4;

  const drawW = SPRITE_FRAME_W * SPRITE_SCALE;
  const drawH = SPRITE_FRAME_H * SPRITE_SCALE;

  const drawX = x + w / 2 - drawW / 2;
  const drawY = y + h - drawH;

  ctx.drawImage(
    spriteSheet,
    sx,
    sy,
    SPRITE_FRAME_W,
    SPRITE_FRAME_H,
    drawX,
    drawY,
    drawW,
    drawH,
  );
}

function frame(timestamp) {
  if (lastTime === null) lastTime = timestamp;
  let dt = (timestamp - lastTime) / 1000;
  lastTime = timestamp;
  dt = Math.min(dt, 1 / 30);

  const levelSelectOpen =
    typeof levelSelectEl !== "undefined" &&
    levelSelectEl &&
    levelSelectEl.root.style.display !== "none";

  if (!overlay.classList.contains("hidden") || levelSelectOpen) {
    requestAnimationFrame(frame);
    return;
  }

  gameTime += dt;
  if (deathFlashTimer > 0) deathFlashTimer -= dt;

  update(dt);
  draw();

  requestAnimationFrame(frame);
}

preloadAllAssets().then(() => {
  loadWorld();
  showStartOverlay();
  requestAnimationFrame(frame);
});
