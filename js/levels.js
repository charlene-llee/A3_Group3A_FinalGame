// ============================================================
// LEVEL 1
// ============================================================
const LEVEL_1_STAGES = [
  {
    title: "Stage 1",
    width: 1900,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 1820, width: 56, height: 90 },
    ground: [
      { x: 0, width: 880 },
      { x: 1280, width: 620 },
    ],

    blocks: [
      { x: 211, width: 61, height: 53, sprite: "box" },
      { x: 800, width: 61, height: 53, sprite: "box" },
      {
        x: 480,
        width: 79,
        height: 97,
        sprite: "2box",
        triggerHoleId: "l1-1-box-pit-1",
      },
      {
        x: 1490,
        width: 79,
        height: 97,
        sprite: "2box",
        triggerHoleId: "l1-1-box-pit-2",
      },
    ],

    trapGround: [
      {
        x: 880,
        width: 400,
        id: "l1-1-pit",
        prefallen: true,
      },
      {
        x: 550,
        width: 120,
        id: "l1-1-box-pit-1",
      },
      {
        x: 1560,
        width: 180,
        id: "l1-1-box-pit-2",
      },
    ],

    movingPlatforms: [
      {
        x: 880,
        y: 550,
        width: 100,
        range: 300,
        speed: 120,
        phase: 0,
      },
    ],
    hazards: [],
  },

  {
    title: "Stage 2",
    width: 1900,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 1800, width: 56, height: 90 },
    ground: [{ x: 0, width: 1900 }],

    blocks: [],
    trapGround: [],
    movingPlatforms: [],

    hazards: [
      {
        x: 294,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.8,
        flashOff: 1.2,
        flashPhase: 0,
      },
      {
        x: 728,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.7,
        flashOff: 1.3,
        flashPhase: 0.5,
      },
      {
        x: 1029,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.9,
        flashOff: 1.1,
        flashPhase: 1,
      },
    ],
    groundHazards: [
      {
        x: 1252,
        width: 79,
        height: 56,
        range: 380,
        speed: 140,
        phase: 0,
        sprite: "whitedog",
      },
    ],
  },

  {
    title: "Stage 3",
    width: 1900,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 1790, width: 56, height: 90 },

    ground: [
      { x: 0, width: 498 },
      { x: 1256, width: 644 },
    ],

    blocks: [{ x: 1612, width: 61, height: 53, sprite: "box" }],

    trapGround: [
      {
        x: 498,
        width: 758,
        id: "l1-3-pit",
        prefallen: true,
      },
    ],

    movingPlatforms: [
      {
        x: 503,
        y: 550,
        width: 120,
        range: 180,
        speed: 150,
        phase: 0,
      },
      {
        x: 783,
        y: 550,
        width: 120,
        range: 320,
        speed: 180,
        phase: 0,
      },
    ],

    groundHazards: [
      {
        x: 1311,
        width: 79,
        height: 56,
        range: 200,
        speed: 140,
        phase: 0,
        sprite: "whitedog",
      },
    ],

    hazards: [
      {
        x: 228,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.7,
        flashOff: 1.3,
        flashPhase: 0.5,
      },
    ],
  },
];

// ============================================================
// LEVEL 2
// ============================================================
const TREE_DRAW_W = 200;
const TREE_DRAW_H = 302;
const BIRD_DRAW_W = 42;
const BIRD_DRAW_H = 38;
const BIRD_PERCH_OFFSET_Y = 60;
const LEVEL_2_GROUND_Y = 550;

function birdOnTree(treeX, id) {
  return {
    id,
    x: treeX + TREE_DRAW_W / 2 - BIRD_DRAW_W / 2,
    width: BIRD_DRAW_W,
    height: BIRD_DRAW_H,
    y: LEVEL_2_GROUND_Y - TREE_DRAW_H + BIRD_PERCH_OFFSET_Y,
    sprite: "bird",
  };
}

const LEVEL_2_STAGES = [
  {
    title: "Stage 1: A New Path",
    width: 1900,
    groundY: LEVEL_2_GROUND_Y,
    spawn: { x: 80, y: 450 },
    door: { x: 1770, width: 56, height: 90 },
    ground: [{ x: 0, width: 1900 }],
    trapGround: [
      {
        x: 350,
        width: 120,
        id: "l2-1-gap-2",
        prefallen: true,
      },
      {
        x: 690,
        width: 120,
        id: "l2-1-gap-3",
        prefallen: true,
      },
      {
        x: 1200,
        width: 100,
        id: "l2-1-gap-3",
        prefallen: true,
      },
      {
        x: 1550,
        width: 110,
        id: "l2-1-gap-1",
        prefallen: true,
      },
    ],
    movingPlatforms: [],
    hazards: [
      {
        x: 1030,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.8,
        flashOff: 1.2,
        flashPhase: 0,
      },
    ],
    blocks: [{ x: 890, width: 61, height: 53, sprite: "box" }],
    birds: [birdOnTree(480, "bird-1"), birdOnTree(1300, "bird-2")],
    birdFreeze: true,
  },

  {
    title: "Stage 2",
    width: 1900,
    groundY: LEVEL_2_GROUND_Y,
    spawn: { x: 80, y: 450 },
    door: { x: 1770, width: 56, height: 90 },
    ground: [
      { x: 0, width: 105 },
      { x: 105, width: 1715, surface: "gravel" },
      { x: 1820, width: 80 },
    ],
    trapGround: [
      {
        x: 640,
        width: 450,
        id: "l2-2-gap-1",
        prefallen: true,
      },
    ],
    movingPlatforms: [
      {
        x: 670,
        y: 480,
        width: 100,
        range: 300,
        speed: 120,
        phase: 0,
      },
    ],
    hazards: [],
    blocks: [
      { x: 500, width: 148, height: 111, sprite: "stairs" },
      { x: 1500, width: 61, height: 53, sprite: "box" },
    ],
    trees: [],
    birds: [],
  },

  {
    title: "Stage 3",
    width: 1900,
    groundY: LEVEL_2_GROUND_Y,
    spawn: { x: 80, y: 450 },
    door: { x: 1770, width: 56, height: 90 },
    ground: [
      { x: 0, width: 105 },
      { x: 105, width: 1715, surface: "gravel" },
      { x: 1820, width: 80 },
    ],
    trapGround: [
      {
        x: 440,
        width: 110,
        id: "l2-2-gap-1",
        prefallen: true,
      },
      {
        x: 780,
        width: 110,
        id: "l2-2-gap-1",
        prefallen: true,
      },
    ],
    movingPlatforms: [],
    groundHazards: [
      {
        x: 900,
        width: 79,
        height: 56,
        range: 320,
        speed: 120,
        phase: 0,
        sprite: "whitedog",
      },
      {
        x: 1500,
        width: 79,
        height: 56,
        range: 150,
        speed: 120,
        phase: 0,
        sprite: "whitedog",
      },
    ],

    hazards: [
      {
        x: 200,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 0.8,
        flashOff: 1.2,
        flashPhase: 0,
      },
    ],
    blocks: [],
    trees: [],
    birds: [
      birdOnTree(300, "bird-1"),
      birdOnTree(620, "bird-2"),
      birdOnTree(1300, "bird-3"),
    ],
    birdFreeze: true,

    codeLock: true,
  },
];

// ============================================================
// LEVEL 3
// ============================================================
const LEVEL_3_STAGES = [
  {
    title: "Stage 1",
    width: 2134,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 2004, width: 56, height: 90 },
    ground: [{ x: 0, width: 2134 }],
    trapGround: [{ x: 1006, width: 96 }],
    movingPlatforms: [],
    hazards: [],
    groundHazards: [
      {
        x: 1608,
        width: 79,
        height: 56,
        sprite: "whitedog",
        range: 300,
        speed: 140,
      },
    ],
    blocks: [
      { x: 560, width: 186, height: 187, sprite: "stackedboxes" },
      { x: 915, width: 79, height: 97, sprite: "box2" },
      { x: 1403, width: 186, height: 187, sprite: "stackedboxes" },
    ],
    jumpBoostNpcs: [
      { x: 407, y: 518, radius: 60, chargeTime: 2, jumpMultiplier: 1.4 },
      { x: 1250, y: 518, radius: 60, chargeTime: 2, jumpMultiplier: 1.4 },
    ],
  },

  {
    title: "Stage 2",
    width: 2133,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 2003, width: 56, height: 90 },
    ground: [
      { x: 0, width: 27 },
      { x: 27, width: 1039, surface: "gravel" },
      { x: 1310, width: 823 },
    ],
    trapGround: [
      { x: 1066, width: 450, prefallen: true },
      {
        x: 1720,
        width: 120,
        id: "l1-1-box-pit-1",
      },
    ],
    movingPlatforms: [
      {
        x: 1100,
        y: 470,
        width: 70,
        height: 14,
        range: 300,
        speed: 180,
        phase: 0.0,
      },
    ],
    blocks: [
      { x: 832, width: 61, height: 53, sprite: "box" },
      {
        x: 1650,
        width: 79,
        height: 97,
        sprite: "2box",
        triggerHoleId: "l1-1-box-pit-1",
      },
    ],
    hazards: [
      {
        x: 420,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 1,
        flashOff: 1,
        flashPhase: 0.2,
      },
    ],
  },

  {
    title: "Stage 3",
    width: 2133,
    groundY: 550,
    spawn: { x: 80, y: 450 },
    door: { x: 2003, width: 56, height: 90 },
    ground: [
      { x: 0, width: 462 },
      { x: 612, width: 2133 - 612 },
    ],
    trapGround: [{ x: 422, width: 450, prefallen: true }],
    movingPlatforms: [
      {
        x: 400,
        y: 430,
        width: 100,
        height: 14,
        range: 350,
        speed: 105.5,
        phase: 0,
      },
    ],
    hazards: [
      {
        x: 950,
        width: 79,
        height: 56,
        sprite: "dog",
        flash: true,
        flashOn: 1,
        flashOff: 0.5,
        flashPhase: 0.2,
      },
    ],
    blocks: [
      { x: 250, width: 148, height: 111, sprite: "stairs" },
      { x: 1750, width: 186, height: 187, sprite: "stackedboxes" },
    ],
    groundHazards: [
      {
        x: 1150,
        width: 79,
        height: 56,
        sprite: "whitedog",
        range: 300,
        speed: 140,
      },
    ],
    jumpBoostNpcs: [
      { x: 1660, y: 518, radius: 60, chargeTime: 2, jumpMultiplier: 1.4 },
    ],
    birds: [birdOnTree(20, "l3s3-bird-1")],
    birdFreeze: true,
  },
];

// ============================================================
// BUILD ONE LEVEL
// ============================================================
function buildWorld(stages, levelIndex = 0) {
  const sections = [];
  const ground = [];
  const trapGround = [];
  const movingPlatforms = [];
  const hazards = [];
  const groundHazards = [];
  const blocks = [];
  const mailboxes = [];
  const duckFollowers = [];
  const bubbles = [];
  const supportNPCs = [];
  const jumpBoostNpcs = [];
  const pushingNpcs = [];
  const trees = [];
  const birds = [];

  let offsetX = 0;

  stages.forEach((def, i) => {
    const startX = offsetX;
    const endX = startX + def.width;

    sections.push({
      index: i,
      levelIndex,
      stageIndex: i,
      title: def.title,
      intro: def.intro,
      startX,
      endX,

      birdFreeze: !!def.birdFreeze,

      spawn: {
        x: startX + def.spawn.x,
        y: def.spawn.y,
      },

      fallLimit:
        def.fallLimit !== undefined ? def.fallLimit : def.groundY + 300,

      baseSpeedFactor:
        def.baseSpeedFactor !== undefined ? def.baseSpeedFactor : 1,

      npc: def.npc ? { ...def.npc, x: startX + def.npc.x } : null,
      cars: def.cars
        ? {
            ...def.cars,
            minX: startX + (def.cars.minX !== undefined ? def.cars.minX : 0),
            maxX:
              startX +
              (def.cars.maxX !== undefined ? def.cars.maxX : def.width),
          }
        : null,
      codeLock: !!def.codeLock,
      storm: !!def.storm,
      rainZones: (def.rainZones || []).map((z) => ({
        x: startX + z.x,
        width: z.width,
      })),
      lightningZones: (def.lightningZones || []).map((z) => ({
        x: startX + z.x,
        width: z.width,
      })),
      barkingDogs: !!def.barkingDogs,
      barkConfig: def.barkConfig || null,
    });

    for (const g of def.ground) {
      ground.push({
        x: startX + g.x,
        width: g.width,
        surface: g.surface || "dirt",
      });
    }

    for (const t of def.trapGround) {
      trapGround.push({
        ...t,
        x: startX + t.x,
      });
    }

    for (const p of def.movingPlatforms) {
      movingPlatforms.push({
        ...p,
        x: startX + p.x,
      });
    }

    for (const hz of def.hazards) {
      hazards.push({
        ...hz,
        x: startX + hz.x,
      });
    }

    for (const gh of def.groundHazards || []) {
      groundHazards.push({
        ...gh,
        x: startX + gh.x,
      });
    }

    for (const b of def.blocks || []) {
      blocks.push({
        ...b,
        x: startX + b.x,
      });
    }

    for (const d of def.duckFollowers || []) {
      duckFollowers.push({
        ...d,

        x: startX + d.triggerX,

        triggerX: startX + d.triggerX,

        stageIndex: i,
        levelIndex,
      });
    }

    for (const b of def.bubbles || []) {
      bubbles.push({
        ...b,
        x: startX + b.x,
        stageIndex: i,
        levelIndex,
      });
    }

    for (const n of def.supportNPCs || []) {
      supportNPCs.push({
        ...n,
        x: startX + n.x,
        stageIndex: i,
        levelIndex,
      });
    }

    for (const n of def.jumpBoostNpcs || []) {
      jumpBoostNpcs.push({
        ...n,
        x: startX + n.x,
        stageIndex: i,
        levelIndex,
      });
    }

    for (const n of def.pushingNpcs || []) {
      pushingNpcs.push({
        ...n,
        x: startX + n.x,
        stageIndex: i,
        levelIndex,
      });
    }

    for (const tr of def.trees || []) {
      trees.push({ ...tr, x: startX + tr.x });
    }

    for (const b of def.birds || []) {
      birds.push({ ...b, x: startX + b.x });
    }

    const d = def.door;

    mailboxes.push({
      x: startX + d.x,
      y: d.y,
      width: d.width,
      height: d.height,
      levelIndex,
      stageIndex: i,
      activated: false,
      locked: false,
    });

    offsetX = endX;
  });

  return {
    width: offsetX,
    groundY: 550,
    spawn: {
      x: sections[0].spawn.x,
      y: sections[0].spawn.y,
    },

    levelIndex,
    builtLevelIndices: [levelIndex],

    sections,
    ground,
    trapGround,
    movingPlatforms,
    hazards,
    groundHazards,
    blocks,
    mailboxes,
    duckFollowers,
    bubbles,
    supportNPCs,
    jumpBoostNpcs,
    pushingNpcs,
    trees,
    birds,
  };
}

// ============================================================
// BUILD MULTI-LEVEL WORLD
// ============================================================
function buildMultiWorld(levelDefs) {
  const LEVEL_GAP = 2000;
  const merged = {
    width: 0,
    groundY: 550,
    spawn: null,

    sections: [],
    ground: [],
    trapGround: [],
    movingPlatforms: [],
    hazards: [],
    groundHazards: [],
    blocks: [],
    mailboxes: [],
    duckFollowers: [],
    bubbles: [],
    supportNPCs: [],
    jumpBoostNpcs: [],
    pushingNpcs: [],
    trees: [],
    birds: [],

    builtLevelIndices: [],
  };

  let offsetX = 0;

  for (const { stages, levelIndex } of levelDefs) {
    const sub = buildWorld(stages, levelIndex);
    const shiftX = offsetX;

    sub.sections.forEach((s, i) => {
      merged.sections.push({
        ...s,

        startX: s.startX + shiftX,
        endX: s.endX + shiftX,

        spawn: {
          x: s.spawn.x + shiftX,
          y: s.spawn.y,
        },

        npc: s.npc ? { ...s.npc, x: s.npc.x + shiftX } : null,
        cars: s.cars
          ? {
              ...s.cars,
              minX: s.cars.minX + shiftX,
              maxX: s.cars.maxX + shiftX,
            }
          : null,

        stormZone: s.stormZone
          ? { ...s.stormZone, x: s.stormZone.x + shiftX }
          : null,
        rainZones: (s.rainZones || []).map((z) => ({ ...z, x: z.x + shiftX })),
        lightningZones: (s.lightningZones || []).map((z) => ({
          ...z,
          x: z.x + shiftX,
        })),

        index: merged.sections.length,
      });
    });

    merged.ground.push(
      ...sub.ground.map((g) => ({
        ...g,
        x: g.x + shiftX,
      })),
    );

    merged.trapGround.push(
      ...sub.trapGround.map((t) => ({
        ...t,
        x: t.x + shiftX,
      })),
    );

    merged.movingPlatforms.push(
      ...sub.movingPlatforms.map((p) => ({
        ...p,
        x: p.x + shiftX,
      })),
    );

    merged.hazards.push(
      ...sub.hazards.map((h) => ({
        ...h,
        x: h.x + shiftX,
      })),
    );

    merged.groundHazards.push(
      ...sub.groundHazards.map((g) => ({
        ...g,
        x: g.x + shiftX,
      })),
    );

    merged.blocks.push(
      ...sub.blocks.map((b) => ({
        ...b,
        x: b.x + shiftX,
      })),
    );

    merged.mailboxes.push(
      ...sub.mailboxes.map((m) => ({
        ...m,
        x: m.x + shiftX,
      })),
    );

    merged.duckFollowers.push(
      ...(sub.duckFollowers || []).map((d) => ({
        ...d,
        x: d.x + shiftX,
        triggerX: d.triggerX + shiftX,
      })),
    );

    merged.bubbles.push(
      ...(sub.bubbles || []).map((b) => ({
        ...b,
        x: b.x + shiftX,
      })),
    );

    merged.supportNPCs.push(
      ...(sub.supportNPCs || []).map((n) => ({
        ...n,
        x: n.x + shiftX,
      })),
    );

    merged.jumpBoostNpcs.push(
      ...(sub.jumpBoostNpcs || []).map((n) => ({
        ...n,
        x: n.x + shiftX,
      })),
    );

    merged.pushingNpcs.push(
      ...(sub.pushingNpcs || []).map((n) => ({
        ...n,
        x: n.x + shiftX,
      })),
    );

    merged.trees.push(
      ...(sub.trees || []).map((t) => ({
        ...t,
        x: t.x + shiftX,
      })),
    );

    merged.birds.push(
      ...(sub.birds || []).map((b) => ({
        ...b,
        x: b.x + shiftX,
      })),
    );

    merged.builtLevelIndices.push(levelIndex);

    if (merged.spawn === null) {
      merged.spawn = {
        x: sub.spawn.x + shiftX,
        y: sub.spawn.y,
      };
    }

    offsetX += sub.width + LEVEL_GAP;
  }

  merged.width = offsetX - LEVEL_GAP;

  return merged;
}

// ============================================================
// FINAL WORLD
// ============================================================

const WORLD = buildMultiWorld([
  {
    stages: LEVEL_1_STAGES,
    levelIndex: 0,
  },

  {
    stages: LEVEL_2_STAGES,
    levelIndex: 1,
  },

  {
    stages: LEVEL_3_STAGES,
    levelIndex: 2,
  },
]);
