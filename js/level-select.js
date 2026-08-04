// ============================================================
// LEVEL SELECT â€” persistent stage progress + the 5x5 stage-picker
// screen. Load this script AFTER levels.js (it reads WORLD.sections)
// and BEFORE main.js (main.js calls into Progress / showLevelSelect).
// ============================================================

const SAVE_KEY = "tactic_progress_v1";
const LEVEL_COUNT = 3;
const STAGES_PER_LEVEL = 3;

const Progress = {
  data: null,

  load() {
    if (this.data) return this.data;
    let saved = null;
    try {
      saved = JSON.parse(localStorage.getItem(SAVE_KEY));
    } catch (e) {
      saved = null;
    }
    if (
      !saved ||
      !Array.isArray(saved.unlocked) ||
      !Array.isArray(saved.completed)
    ) {
      saved = { unlocked: ["0-0"], completed: [] };
    }
    this.data = saved;
    return this.data;
  },

  save() {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(this.data));
    } catch (e) {}
  },

  key(levelIdx, stageIdx) {
    return `${levelIdx}-${stageIdx}`;
  },

  isUnlocked(levelIdx, stageIdx) {
    this.load();
    return this.data.unlocked.includes(this.key(levelIdx, stageIdx));
  },

  isCompleted(levelIdx, stageIdx) {
    this.load();
    return this.data.completed.includes(this.key(levelIdx, stageIdx));
  },

  unlock(levelIdx, stageIdx) {
    this.load();
    const k = this.key(levelIdx, stageIdx);
    if (!this.data.unlocked.includes(k)) this.data.unlocked.push(k);
    this.save();
  },

  completeStage(levelIdx, stageIdx) {
    this.load();
    const k = this.key(levelIdx, stageIdx);
    if (!this.data.completed.includes(k)) this.data.completed.push(k);
    if (!this.data.unlocked.includes(k)) this.data.unlocked.push(k);

    const nextStage = stageIdx + 1;
    if (nextStage < STAGES_PER_LEVEL) {
      this.unlock(levelIdx, nextStage);
    }

    this.save();

    bridgeUnbuiltLevels();
  },

  reset() {
    this.data = { unlocked: ["0-0"], completed: [] };
    this.save();
  },
};

function findMailbox(levelIdx, stageIdx) {
  return world.mailboxes.find(
    (mb) => mb.levelIndex === levelIdx && mb.stageIndex === stageIdx,
  );
}

function isStageBuilt(levelIdx, stageIdx) {
  return WORLD.sections.some(
    (s) => s.levelIndex === levelIdx && s.stageIndex === stageIdx,
  );
}

function bridgeUnbuiltLevels() {
  Progress.load();
  const lastStage = STAGES_PER_LEVEL - 1;

  for (let levelIdx = 0; levelIdx < LEVEL_COUNT - 1; levelIdx++) {
    if (!isStageBuilt(levelIdx, lastStage)) continue;
    if (!Progress.isCompleted(levelIdx, lastStage)) continue;

    for (let nextLevel = levelIdx + 1; nextLevel < LEVEL_COUNT; nextLevel++) {
      if (isStageBuilt(nextLevel, 0)) {
        Progress.unlock(nextLevel, 0);
        break;
      }
    }
  }
}

function getStageEntryPoint(levelIdx, stageIdx) {
  if (stageIdx === 0) {
    const firstSection = WORLD.sections.find(
      (s) => s.levelIndex === levelIdx && s.stageIndex === 0,
    );
    return firstSection ? firstSection.spawn : WORLD.spawn;
  }
  const prevMb = findMailbox(levelIdx, stageIdx - 1);
  if (!prevMb) return WORLD.spawn;
  return {
    x: prevMb.x,
    y: prevMb.y !== undefined ? prevMb.y : world.def.groundY - prevMb.height,
  };
}

function syncMailboxActivationFromProgress() {
  for (const mb of world.mailboxes) {
    mb.activated = Progress.isCompleted(mb.levelIndex, mb.stageIndex);
  }
}

function startStage(levelIdx, stageIdx) {
  playGameplayMusic();
  checkpoint = getStageEntryPoint(levelIdx, stageIdx);
  respawnPlayer();
  syncMailboxActivationFromProgress();
  hideLevelSelect();
}

let levelSelectEl = null;

function buildLevelSelectDOM() {
  const root = document.createElement("div");
  root.id = "level-select-overlay";

  const heading = document.createElement("h1");
  heading.textContent = "Level Select";
  root.appendChild(heading);

  const grid = document.createElement("div");
  grid.id = "level-select-grid";
  root.appendChild(grid);

  const backBtn = document.createElement("button");
  backBtn.id = "level-select-back-btn";
  backBtn.className = "menu-btn";
  backBtn.textContent = "Back";
  backBtn.addEventListener("click", () => {
    playButtonSound();
    playMenuMusic();
    hideLevelSelect();
    loadWorld();
    showStartOverlay();
  });
  root.appendChild(backBtn);

  document.getElementById("game-container").appendChild(root);
  return { root, grid };
}

function stageButtonLabel(levelIdx, stageIdx) {
  return `L${levelIdx + 1}-${stageIdx + 1}`;
}

function refreshLevelSelectGrid(grid) {
  bridgeUnbuiltLevels();

  grid.innerHTML = "";

  for (let levelIdx = 0; levelIdx < LEVEL_COUNT; levelIdx++) {
    for (let stageIdx = 0; stageIdx < STAGES_PER_LEVEL; stageIdx++) {
      const btn = document.createElement("button");
      btn.textContent = stageButtonLabel(levelIdx, stageIdx);
      btn.dataset.level = levelIdx;
      btn.dataset.stage = stageIdx;

      const built = isStageBuilt(levelIdx, stageIdx);

      const completed = built && Progress.isCompleted(levelIdx, stageIdx);
      const unlocked = built && Progress.isUnlocked(levelIdx, stageIdx);

      btn.className = "level-stage-btn";
      if (completed) {
        btn.classList.add("completed");
      } else if (unlocked) {
        btn.classList.add("unlocked");
      } else {
        btn.classList.add("locked");
        btn.disabled = true;
      }

      if (unlocked) {
        btn.addEventListener("click", () => {
          playButtonSound();
          startStage(levelIdx, stageIdx);
        });
      }

      grid.appendChild(btn);
    }
  }
}

function showLevelSelect() {
  if (!levelSelectEl) levelSelectEl = buildLevelSelectDOM();
  refreshLevelSelectGrid(levelSelectEl.grid);
  levelSelectEl.root.style.display = "flex";
  overlay.classList.add("hidden");
  isPaused = false;
}

function hideLevelSelect() {
  if (levelSelectEl) levelSelectEl.root.style.display = "none";
}
