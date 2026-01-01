const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const mini = document.getElementById("mini");
const mctx = mini.getContext("2d");
const logBox = document.getElementById("log");
const resourceEl = document.getElementById("stat-resources");
const energyEl = document.getElementById("stat-energy");
const energyCapEl = document.getElementById("stat-energy-cap");
const popEl = document.getElementById("stat-pop");
const popCapEl = document.getElementById("stat-pop-cap");
const waveEl = document.getElementById("stat-wave");
const timeEl = document.getElementById("stat-time");
const scoreEl = document.getElementById("stat-score");
const newGameBtn = document.getElementById("new-game");
const pauseBtn = document.getElementById("pause");
const toggleHelpBtn = document.getElementById("toggle-help");
const buildActionsEl = document.getElementById("build-actions");
const unitActionsEl = document.getElementById("unit-actions");

const world = {
  width: canvas.width,
  height: canvas.height,
  grid: 32,
  lanes: [
    [{ x: 120, y: 200 }, { x: 600, y: 220 }, { x: 1080, y: 240 }],
    [{ x: 120, y: 520 }, { x: 600, y: 480 }, { x: 1080, y: 460 }],
  ],
  supplyDrops: [
    { x: 360, y: 120, timer: 8 },
    { x: 360, y: 360, timer: 12 },
    { x: 360, y: 600, timer: 18 },
  ],
};

const colors = {
  player: "#7ed957",
  enemy: "#ef8354",
  turret: "#f5d547",
  collector: "#9cf7a8",
  building: "#6ba5ff",
  neutral: "#18263f",
};

const sounds = {
  spawn: new Audio("data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YYQAAAABAQEB"),
  hit: new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YSQAAAAA"),
  alert: new Audio("data:audio/wav;base64,UklGRoQAAABXQVZFZm10IBAAAAABAAEAIlYAAESsAAACABAAZGF0YYQAAAABAQEB"),
};

const EntityType = {
  INFANTRY: "infantry",
  ROCKET: "rocket",
  TANK: "tank",
  TRUCK: "truck",
  ENEMY_LIGHT: "enemy_light",
  ENEMY_HEAVY: "enemy_heavy",
  ENEMY_ARTY: "enemy_arty",
  TURRET: "turret",
  BUNKER: "bunker",
  SUPPLY: "supply",
  POWER: "power",
  HQ: "hq",
  FACTORY: "factory",
  BARRACKS: "barracks",
};

const buildables = [
  { id: EntityType.POWER, label: "Электростанция", cost: 500, power: 6, pop: 0, popCap: 0 },
  { id: EntityType.SUPPLY, label: "Центр снабжения", cost: 650, power: -2, pop: 0, popCap: 2 },
  { id: EntityType.BARRACKS, label: "Казармы", cost: 420, power: -3, pop: 0, popCap: 4 },
  { id: EntityType.FACTORY, label: "Военный завод", cost: 850, power: -4, pop: 0, popCap: 5 },
  { id: EntityType.TURRET, label: "Башня обороны", cost: 500, power: -2, pop: 0, popCap: 0 },
  { id: EntityType.BUNKER, label: "Бункер", cost: 700, power: -2, pop: 0, popCap: 0 },
];

const trainables = [
  { id: EntityType.INFANTRY, label: "Пехота", cost: 140, pop: 1, prereq: EntityType.BARRACKS },
  { id: EntityType.ROCKET, label: "Ракетчик", cost: 220, pop: 1, prereq: EntityType.BARRACKS },
  { id: EntityType.TRUCK, label: "Грузовик снабжения", cost: 300, pop: 1, prereq: EntityType.SUPPLY },
  { id: EntityType.TANK, label: "Боевой танк", cost: 520, pop: 2, prereq: EntityType.FACTORY },
];

const unitStats = {
  [EntityType.INFANTRY]: { hp: 120, speed: 80, range: 70, damage: 14, versusBuilding: 0.6 },
  [EntityType.ROCKET]: { hp: 110, speed: 75, range: 110, damage: 22, versusBuilding: 1.3 },
  [EntityType.TANK]: { hp: 320, speed: 65, range: 85, damage: 26, versusBuilding: 1.1 },
  [EntityType.TRUCK]: { hp: 180, speed: 90, range: 0, damage: 0, gather: 80 },
  [EntityType.ENEMY_LIGHT]: { hp: 130, speed: 80, range: 70, damage: 13 },
  [EntityType.ENEMY_HEAVY]: { hp: 280, speed: 65, range: 95, damage: 24 },
  [EntityType.ENEMY_ARTY]: { hp: 180, speed: 55, range: 160, damage: 16 },
};

const structureStats = {
  [EntityType.TURRET]: { hp: 320, range: 180, damage: 18 },
  [EntityType.BUNKER]: { hp: 420, range: 140, damage: 14 },
  [EntityType.SUPPLY]: { hp: 340 },
  [EntityType.POWER]: { hp: 260 },
  [EntityType.BARRACKS]: { hp: 300 },
  [EntityType.FACTORY]: { hp: 360 },
  [EntityType.HQ]: { hp: 800 },
};

const state = {
  resources: 1500,
  energy: 4,
  energyCap: 4,
  pop: 0,
  popCap: 5,
  wave: 1,
  time: 0,
  paused: false,
  score: 0,
  entities: [],
  lastWave: 0,
  lastTruck: 0,
  gameOver: false,
  log: [],
};

const playerBase = { x: world.width * 0.12, y: world.height * 0.38 };
const enemyBase = { x: world.width * 0.82, y: world.height * 0.38 };

function pushLog(text) {
  state.log.unshift(`${new Date().toLocaleTimeString()} — ${text}`);
  state.log = state.log.slice(0, 80);
  logBox.innerHTML = state.log.map((l) => `<div>${l}</div>`).join("");
}

function resetGame() {
  state.resources = 1500;
  state.energy = 4;
  state.energyCap = 4;
  state.pop = 0;
  state.popCap = 5;
  state.wave = 1;
  state.time = 0;
  state.score = 0;
  state.paused = false;
  state.gameOver = false;
  state.lastWave = performance.now();
  state.lastTruck = 0;
  state.log = [];
  state.entities = [];
  spawnStructure(EntityType.HQ, playerBase.x, playerBase.y);
  spawnStructure(EntityType.HQ, enemyBase.x, enemyBase.y, "enemy");
  pushLog("Новая кампания началась! Постройте электростанцию и центр снабжения.");
}

function spawnStructure(type, x, y, faction = "player") {
  const stats = structureStats[type];
  const entity = {
    id: crypto.randomUUID(),
    type,
    x,
    y,
    hp: stats.hp,
    range: stats.range ?? 0,
    damage: stats.damage ?? 0,
    faction,
    cooldown: 0,
    isBuilding: true,
  };
  state.entities.push(entity);
  if (faction === "player" && type !== EntityType.HQ) {
    sounds.spawn.play();
  }
  return entity;
}

function spawnUnit(type) {
  const def = trainables.find((u) => u.id === type);
  if (!def) return;
  const stats = unitStats[type];
  const lane = Math.random() > 0.5 ? world.lanes[0] : world.lanes[1];
  const spawn = { x: playerBase.x + 40, y: playerBase.y + (lane === world.lanes[0] ? -20 : 200) };
  const entity = {
    id: crypto.randomUUID(),
    type,
    x: spawn.x,
    y: spawn.y,
    hp: stats.hp,
    speed: stats.speed,
    range: stats.range,
    damage: stats.damage,
    gather: stats.gather,
    targetPath: lane,
    waypoint: 0,
    faction: "player",
    cooldown: 0,
    boostedUntil: 0,
  };
  state.entities.push(entity);
  sounds.spawn.play();
  pushLog(`${def.label} готов к бою`);
}

function enemyUnit(type, laneIndex = 0) {
  const stats = unitStats[type];
  const lane = world.lanes[laneIndex];
  const spawn = { x: enemyBase.x + 60, y: enemyBase.y + (laneIndex === 0 ? -20 : 200) };
  state.entities.push({
    id: crypto.randomUUID(),
    type,
    x: spawn.x,
    y: spawn.y,
    hp: stats.hp,
    speed: stats.speed,
    range: stats.range,
    damage: stats.damage,
    targetPath: [...lane].reverse(),
    waypoint: 0,
    faction: "enemy",
    cooldown: 0,
  });
}

function build(type) {
  const def = buildables.find((b) => b.id === type);
  if (!def) return;
  if (state.resources < def.cost) {
    pushLog("Недостаточно средств для строительства");
    return;
  }
  state.resources -= def.cost;
  const yOffset = (Math.random() - 0.5) * 180;
  spawnStructure(type, playerBase.x + 100 + Math.random() * 120, playerBase.y + 60 + yOffset);
  pushLog(`${def.label} построен`);
}

function train(type) {
  const def = trainables.find((t) => t.id === type);
  if (!def) return;
  if (!hasStructure(def.prereq)) {
    pushLog("Нужны соответствующие здания");
    return;
  }
  if (state.resources < def.cost) {
    pushLog("Недостаточно ресурсов");
    return;
  }
  if (state.pop + def.pop > state.popCap) {
    pushLog("Недостаточно населения");
    return;
  }
  if (state.energy <= 0) {
    pushLog("Не хватает энергии для производства");
    return;
  }
  state.resources -= def.cost;
  state.pop += def.pop;
  spawnUnit(type);
}

function hasStructure(type) {
  return state.entities.some((e) => e.type === type && e.faction === "player");
}

function renderActions() {
  buildActionsEl.innerHTML = buildables
    .map((b) => `<button class="btn action" data-build="${b.id}">${b.label}<small>${b.cost} | Энергия ${b.power >= 0 ? "+" + b.power : b.power}</small></button>`)
    .join("");

  unitActionsEl.innerHTML = trainables
    .map((u) => `<button class="btn action" data-train="${u.id}">${u.label}<small>${u.cost} | Население +${u.pop}</small></button>`)
    .join("");

  buildActionsEl.querySelectorAll("[data-build]").forEach((btn) =>
    btn.addEventListener("click", () => build(btn.dataset.build))
  );
  unitActionsEl.querySelectorAll("[data-train]").forEach((btn) =>
    btn.addEventListener("click", () => train(btn.dataset.train))
  );
}

function collectorsCount() {
  return state.entities.filter((e) => e.type === EntityType.TRUCK).length;
}

function recalcEconomy() {
  let energyCap = 4;
  let energyDrain = 0;
  let popCap = 5;
  let popUsed = 0;
  for (const entity of state.entities) {
    if (entity.faction !== "player" || !entity.isBuilding) continue;
    const def = buildables.find((b) => b.id === entity.type);
    if (!def) continue;
    if (def.power > 0) energyCap += def.power;
    else energyDrain += Math.abs(def.power || 0);
    popCap += def.popCap ?? 0;
  }
  for (const entity of state.entities) {
    if (entity.isBuilding || entity.faction !== "player") continue;
    const def = trainables.find((t) => t.id === entity.type);
    popUsed += def?.pop ?? 0;
  }
  state.energyCap = energyCap;
  state.popCap = popCap;
  state.pop = popUsed;
  const available = Math.max(0, energyCap - energyDrain);
  if (state.energy > available) state.energy = available;
  return available;
}

function update(delta) {
  if (state.gameOver) return;
  state.time += delta;
  const activeCap = recalcEconomy();
  state.resources += delta * (1 + collectorsCount() * 3);
  state.energy = Math.max(0, Math.min(activeCap, state.energy + delta * 0.8));

  world.supplyDrops.forEach((drop) => {
    drop.timer -= delta;
    if (drop.timer <= 0) {
      drop.timer = 25 + Math.random() * 10;
      const truck = state.entities.find((e) => e.type === EntityType.TRUCK && e.faction === "player");
      if (truck) {
        truck.targetPath = [{ x: drop.x, y: drop.y }, { x: playerBase.x, y: playerBase.y }];
        truck.waypoint = 0;
        pushLog("Грузовик отправлен за ящиком снабжения");
      }
    }
  });

  if (performance.now() - state.lastWave > 11000) {
    spawnEnemyWave();
    state.lastWave = performance.now();
  }

  state.entities.forEach((entity) => {
    if (entity.isBuilding) {
      handleBuilding(entity, delta);
      return;
    }
    handleUnit(entity, delta);
  });

  state.entities = state.entities.filter((e) => e.hp > 0);
  checkGameOver();
  updateUI();
}

function handleBuilding(entity, delta) {
  if (entity.faction !== "player" && entity.type === EntityType.HQ) return;
  if (entity.type === EntityType.TURRET || entity.type === EntityType.BUNKER) {
    const target = findNearest(entity, "enemy");
    if (target && distance(entity, target) < entity.range) {
      entity.cooldown -= delta;
      if (entity.cooldown <= 0) {
        damageTarget(target, entity.damage);
        entity.cooldown = 0.55;
        sounds.hit.play();
      }
    }
  }
}

function handleUnit(entity, delta) {
  if (entity.type === EntityType.TRUCK) {
    handleTruck(entity, delta);
    return;
  }

  const enemy = findNearest(entity, entity.faction === "player" ? "enemy" : "player");
  if (enemy && distance(entity, enemy) < entity.range) {
    entity.cooldown -= delta;
    if (entity.cooldown <= 0) {
      const modifier = enemy.isBuilding ? unitStats[entity.type].versusBuilding ?? 1 : 1;
      damageTarget(enemy, entity.damage * modifier * boostFactor(entity));
      entity.cooldown = 0.75;
      sounds.hit.play();
    }
    return;
  }

  const path = entity.targetPath ?? world.lanes[0];
  const waypoint = path[entity.waypoint];
  if (!waypoint) return;
  const angle = Math.atan2(waypoint.y - entity.y, waypoint.x - entity.x);
  entity.x += Math.cos(angle) * entity.speed * delta;
  entity.y += Math.sin(angle) * entity.speed * delta;
  if (distance(entity, waypoint) < 6) entity.waypoint++;
}

function boostFactor(entity) {
  return performance.now() < entity.boostedUntil ? 1.5 : 1;
}

function handleTruck(entity, delta) {
  entity.cooldown -= delta;
  const path = entity.targetPath ?? world.lanes[0];
  const waypoint = path[entity.waypoint];
  if (!waypoint) return;
  const angle = Math.atan2(waypoint.y - entity.y, waypoint.x - entity.x);
  entity.x += Math.cos(angle) * entity.speed * delta;
  entity.y += Math.sin(angle) * entity.speed * delta;
  if (distance(entity, waypoint) < 6) {
    entity.waypoint++;
    if (entity.waypoint >= path.length) {
      state.resources += entity.gather;
      state.score += 10;
      entity.waypoint = 0;
      pushLog("Грузовик доставил ресурсы");
    }
  }
}

function damageTarget(target, amount) {
  target.hp -= amount;
  if (target.hp <= 0) {
    if (target.faction === "enemy") state.score += 12;
    if (target.isBuilding && target.type === EntityType.HQ && target.faction === "enemy") {
      state.score += 500;
      pushLog("Вражеская база уничтожена! Новые волны усиливаются.");
    }
  }
}

function spawnEnemyWave() {
  const composition = [];
  const level = state.wave;
  const lanes = [0, 1];
  const light = Math.min(6 + level * 2, 30);
  const heavy = Math.floor(level / 2);
  const arty = Math.floor(level / 3);
  for (let i = 0; i < light; i++) composition.push(EntityType.ENEMY_LIGHT);
  for (let i = 0; i < heavy; i++) composition.push(EntityType.ENEMY_HEAVY);
  for (let i = 0; i < arty; i++) composition.push(EntityType.ENEMY_ARTY);

  composition.forEach((type) => {
    const laneIndex = lanes[Math.floor(Math.random() * lanes.length)];
    enemyUnit(type, laneIndex);
  });

  state.wave += 1;
  pushLog(`Волна ${state.wave - 1}: ${composition.length} юнитов`);
}

function findNearest(entity, faction) {
  let best = null;
  let bestDist = Infinity;
  for (const other of state.entities) {
    if (other === entity) continue;
    if (other.faction !== faction) continue;
    const dist = distance(entity, other);
    if (dist < bestDist) {
      best = other;
      bestDist = dist;
    }
  }
  return best;
}

function distance(a, b) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.hypot(dx, dy);
}

function render() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawBackground();
  drawBases();
  for (const drop of world.supplyDrops) drawSupply(drop);
  for (const entity of state.entities) drawEntity(entity);
  drawAirstrikePreview();
  drawMinimap();
}

function drawBackground() {
  ctx.fillStyle = colors.neutral;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.strokeStyle = "rgba(255,255,255,0.03)";
  for (let x = 0; x < canvas.width; x += world.grid) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += world.grid) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }

  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  world.lanes.forEach((lane) => {
    ctx.beginPath();
    ctx.moveTo(playerBase.x, playerBase.y + (lane === world.lanes[0] ? -10 : 190));
    lane.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.lineTo(enemyBase.x, enemyBase.y + (lane === world.lanes[0] ? -10 : 190));
    ctx.stroke();
  });
}

function drawBases() {
  drawBaseArea(playerBase, "rgba(126,217,87,0.18)");
  drawBaseArea(enemyBase, "rgba(239,131,84,0.16)");
}

function drawBaseArea(base, color) {
  ctx.fillStyle = color;
  ctx.fillRect(base.x - 40, base.y - 20, 200, 260);
}

function drawSupply(drop) {
  ctx.save();
  ctx.translate(drop.x, drop.y);
  ctx.fillStyle = "#f0b345";
  ctx.fillRect(-12, -12, 24, 24);
  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(-12, -12, (1 - drop.timer / 25) * 24, 4);
  ctx.restore();
}

function drawEntity(entity) {
  ctx.save();
  ctx.translate(entity.x, entity.y);
  let color = colors.player;
  if (entity.faction === "enemy") color = colors.enemy;
  if (entity.type === EntityType.TURRET || entity.type === EntityType.BUNKER || entity.isBuilding)
    color = colors.building;
  if (entity.type === EntityType.TRUCK) color = colors.collector;
  ctx.fillStyle = color;
  const size = entity.isBuilding ? 14 : entity.type === EntityType.TANK ? 10 : 8;
  ctx.beginPath();
  ctx.arc(0, 0, size, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = "rgba(0,0,0,0.4)";
  ctx.fillRect(-size, -size - 10, size * 2, 4);
  ctx.fillStyle = entity.faction === "enemy" ? "#ff6b6b" : "#7ed957";
  const maxHp = (entity.isBuilding ? structureStats[entity.type]?.hp : unitStats[entity.type]?.hp) ?? 1;
  ctx.fillRect(-size, -size - 10, (size * 2) * Math.max(0, entity.hp / maxHp), 4);
  ctx.restore();
}

function drawAirstrikePreview() {
  if (!pendingStrike) return;
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.arc(pendingStrike.x, pendingStrike.y, 70, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawMinimap() {
  mctx.clearRect(0, 0, mini.width, mini.height);
  mctx.fillStyle = "#0b1222";
  mctx.fillRect(0, 0, mini.width, mini.height);
  const scaleX = mini.width / canvas.width;
  const scaleY = mini.height / canvas.height;
  const drawDot = (x, y, color, size = 3) => {
    mctx.fillStyle = color;
    mctx.fillRect(x * scaleX, y * scaleY, size, size);
  };
  drawDot(playerBase.x, playerBase.y + 40, colors.player, 5);
  drawDot(enemyBase.x, enemyBase.y + 40, colors.enemy, 5);
  for (const entity of state.entities) {
    const c = entity.faction === "enemy" ? colors.enemy : entity.isBuilding ? colors.building : colors.player;
    drawDot(entity.x, entity.y, c, entity.isBuilding ? 4 : 3);
  }
}

function updateUI() {
  resourceEl.textContent = Math.floor(state.resources);
  energyEl.textContent = Math.floor(state.energy);
  energyCapEl.textContent = Math.floor(state.energyCap);
  popEl.textContent = state.pop;
  popCapEl.textContent = state.popCap;
  waveEl.textContent = state.wave;
  scoreEl.textContent = state.score;
  const minutes = Math.floor(state.time / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(state.time % 60)
    .toString()
    .padStart(2, "0");
  timeEl.textContent = `${minutes}:${seconds}`;
}

function checkGameOver() {
  const playerHQ = state.entities.find((e) => e.type === EntityType.HQ && e.faction === "player");
  const enemyHQ = state.entities.find((e) => e.type === EntityType.HQ && e.faction === "enemy");
  if (!playerHQ && !state.gameOver) {
    state.gameOver = true;
    pushLog("База уничтожена. Поражение.");
  }
  if (!enemyHQ && !state.gameOver) {
    state.gameOver = true;
    pushLog("Победа! Вы пережили все волны.");
  }
}

function loop(timestamp) {
  if (!loop.last) loop.last = timestamp;
  const delta = Math.min(0.05, (timestamp - loop.last) / 1000);
  loop.last = timestamp;
  if (!state.paused) {
    update(delta);
    render();
  }
  requestAnimationFrame(loop);
}

let pendingStrike = null;
canvas.addEventListener("mousemove", (e) => {
  if (!pendingStrike) return;
  const rect = canvas.getBoundingClientRect();
  pendingStrike.x = (e.clientX - rect.left) * (canvas.width / rect.width);
  pendingStrike.y = (e.clientY - rect.top) * (canvas.height / rect.height);
});
canvas.addEventListener("click", (e) => {
  if (!pendingStrike) return;
  const rect = canvas.getBoundingClientRect();
  const x = (e.clientX - rect.left) * (canvas.width / rect.width);
  const y = (e.clientY - rect.top) * (canvas.height / rect.height);
  callAirstrike(x, y);
  pendingStrike = null;
});

document.querySelectorAll('[data-ability]').forEach((btn) =>
  btn.addEventListener('click', () => useAbility(btn.dataset.ability))
);

function useAbility(ability) {
  if (ability === "airstrike") {
    if (state.energy < 80) return pushLog("Недостаточно энергии для авиации");
    state.energy -= 80;
    pendingStrike = { x: enemyBase.x, y: enemyBase.y };
    pushLog("Выберите точку для удара");
  }
  if (ability === "repair") {
    if (state.energy < 60) return pushLog("Недостаточно энергии для ремонта");
    state.energy -= 60;
    const buildings = state.entities.filter((e) => e.faction === "player");
    buildings.forEach((b) => (b.hp = Math.min((structureStats[b.type]?.hp ?? b.hp), b.hp + 160)));
    pushLog("Инженеры восстановили защиту");
  }
  if (ability === "boost") {
    if (state.energy < 40) return pushLog("Недостаточно энергии для клича");
    state.energy -= 40;
    const troops = state.entities.filter((e) => !e.isBuilding && e.faction === "player");
    const now = performance.now();
    troops.forEach((t) => (t.boostedUntil = now + 5000));
    pushLog("Войска получили боевой дух (+50% урона на 5с)");
  }
}

function callAirstrike(x, y) {
  pushLog("Авиазвено в пути...");
  setTimeout(() => {
    pushLog("Ковровая бомбардировка!");
    state.entities.forEach((entity) => {
      if (entity.faction === "enemy" && distance(entity, { x, y }) < 120) {
        damageTarget(entity, 160);
      }
    });
  }, 1200);
}

newGameBtn.addEventListener("click", () => {
  resetGame();
  renderActions();
});
pauseBtn.addEventListener("click", () => {
  state.paused = !state.paused;
  pauseBtn.textContent = state.paused ? "Продолжить" : "Пауза";
});
toggleHelpBtn.addEventListener("click", () => {
  document.getElementById("help").scrollIntoView({ behavior: "smooth" });
});

function init() {
  renderActions();
  resetGame();
  updateUI();
  requestAnimationFrame(loop);
}

init();
