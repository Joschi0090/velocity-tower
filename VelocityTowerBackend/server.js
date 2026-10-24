const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Persistent storage setup
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'players.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// In-memory cache loaded from JSON file
let playersDB = {};

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf8');
      playersDB = JSON.parse(content);
      console.log(`[STORAGE] Loaded ${Object.keys(playersDB).length} players from disk.`);
    } else {
      // Seed initial highscore rivals for vibrant leaderboard
      playersDB = {
        '#CYBER-001': {
          tag: '#CYBER-001',
          nickname: 'CyberNinja',
          avatar: '🥷',
          bestFloor: 84,
          bestScore: 28400,
          updatedAt: new Date().toISOString()
        },
        '#NEON-777': {
          tag: '#NEON-777',
          nickname: 'NeonValkyrie',
          avatar: '⚡',
          bestFloor: 62,
          bestScore: 19500,
          updatedAt: new Date().toISOString()
        },
        '#APEX-999': {
          tag: '#APEX-999',
          nickname: 'ApexClimber',
          avatar: '👑',
          bestFloor: 50,
          bestScore: 14200,
          updatedAt: new Date().toISOString()
        }
      };
      saveData();
      console.log(`[STORAGE] Initialized with seed rivals.`);
    }
  } catch (err) {
    console.error('[STORAGE] Error loading database:', err);
    playersDB = {};
  }
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(playersDB, null, 2), 'utf8');
  } catch (err) {
    console.error('[STORAGE] Error saving database:', err);
  }
}

loadData();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'Velocity Tower Cloud API',
    totalPlayers: Object.keys(playersDB).length,
    timestamp: new Date().toISOString()
  });
});

// Root welcome
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; background: #0b0f19; color: #fff; padding: 40px; text-align: center; min-height: 100vh;">
      <h1 style="color: #00f3ff; text-shadow: 0 0 10px #00f3ff;">🚀 Velocity Tower Cloud API</h1>
      <p style="color: #94a3b8; font-size: 1.1rem;">Friends System, Global Leaderboards & Cloud Sync Backend is Running.</p>
      <div style="margin: 30px auto; max-width: 500px; padding: 20px; background: rgba(255,255,255,0.05); border-radius: 12px; border: 1px solid rgba(0,243,255,0.2);">
        <p><strong>Registered Climbers:</strong> ${Object.keys(playersDB).length}</p>
        <p><strong>Endpoints:</strong> <code>/api/leaderboard</code> | <code>/api/player/:tag</code></p>
      </div>
    </div>
  `);
});

// 1. Register or update player profile
app.post('/api/player/register', (req, res) => {
  const { tag, nickname, avatar, bestFloor, bestScore } = req.body;
  if (!tag || !nickname) {
    return res.status(400).json({ error: 'Player tag and nickname are required.' });
  }

  const cleanTag = tag.trim().toUpperCase().startsWith('#') ? tag.trim().toUpperCase() : '#' + tag.trim().toUpperCase();

  const existing = playersDB[cleanTag] || {};
  const updated = {
    tag: cleanTag,
    nickname: (nickname || existing.nickname || 'Climber').trim().substring(0, 18),
    avatar: (avatar || existing.avatar || '🎮').trim(),
    bestFloor: Math.max(Number(bestFloor) || 0, existing.bestFloor || 0),
    bestScore: Math.max(Number(bestScore) || 0, existing.bestScore || 0),
    updatedAt: new Date().toISOString()
  };

  playersDB[cleanTag] = updated;
  saveData();

  console.log(`[PROFILE] Player registered/updated: ${cleanTag} (${updated.nickname})`);
  res.json({ success: true, profile: updated });
});

// 2. Fetch specific player by Tag
app.get('/api/player/:tag', (req, res) => {
  let tag = req.params.tag.trim().toUpperCase();
  if (!tag.startsWith('#')) tag = '#' + tag;

  const player = playersDB[tag];
  if (!player) {
    return res.status(404).json({ error: 'Player tag not found.' });
  }

  res.json({ success: true, profile: player });
});

// 3. Sync player scores & floors
app.post('/api/player/sync', (req, res) => {
  const { tag, floor, score } = req.body;
  if (!tag) {
    return res.status(400).json({ error: 'Player tag required.' });
  }

  let cleanTag = tag.trim().toUpperCase();
  if (!cleanTag.startsWith('#')) cleanTag = '#' + cleanTag;

  let player = playersDB[cleanTag];
  if (!player) {
    player = {
      tag: cleanTag,
      nickname: 'Climber',
      avatar: '🎮',
      bestFloor: Number(floor) || 0,
      bestScore: Number(score) || 0,
      updatedAt: new Date().toISOString()
    };
  } else {
    player.bestFloor = Math.max(player.bestFloor, Number(floor) || 0);
    player.bestScore = Math.max(player.bestScore, Number(score) || 0);
    player.updatedAt = new Date().toISOString();
  }

  playersDB[cleanTag] = player;
  saveData();

  res.json({ success: true, profile: player });
});

// 3b. Link Social Account (Google Play, FB, IG, Email)
app.post('/api/player/link-account', (req, res) => {
  const { tag, provider, accountName } = req.body;
  if (!tag || !provider) {
    return res.status(400).json({ error: 'Player tag and provider required.' });
  }

  let cleanTag = tag.trim().toUpperCase();
  if (!cleanTag.startsWith('#')) cleanTag = '#' + cleanTag;

  let player = playersDB[cleanTag];
  if (!player) {
    player = {
      tag: cleanTag,
      nickname: 'Climber',
      avatar: '🎮',
      bestFloor: 0,
      bestScore: 0,
      linkedAccounts: {},
      updatedAt: new Date().toISOString()
    };
  }

  if (!player.linkedAccounts) player.linkedAccounts = {};
  player.linkedAccounts[provider] = accountName || true;
  player.updatedAt = new Date().toISOString();

  playersDB[cleanTag] = player;
  saveData();

  console.log(`[SOCIAL] ${cleanTag} linked account: ${provider}`);
  res.json({ success: true, linkedAccounts: player.linkedAccounts });
});

// 4. Batch lookup for Friends List
app.post('/api/friends/list', (req, res) => {
  const { tags } = req.body;
  if (!Array.isArray(tags)) {
    return res.status(400).json({ error: 'tags must be an array of player tags.' });
  }

  const friends = tags.map(t => {
    let cleanTag = t.trim().toUpperCase();
    if (!cleanTag.startsWith('#')) cleanTag = '#' + cleanTag;
    return playersDB[cleanTag] || null;
  }).filter(Boolean);

  res.json({ success: true, friends });
});

// 5. Global Leaderboard (Top 50)
app.get('/api/leaderboard', (req, res) => {
  const sorted = Object.values(playersDB).sort((a, b) => {
    if (b.bestFloor !== a.bestFloor) {
      return b.bestFloor - a.bestFloor;
    }
    return b.bestScore - a.bestScore;
  }).slice(0, 50);

  res.json({
    success: true,
    count: sorted.length,
    leaderboard: sorted
  });
});

// Start listening
app.listen(PORT, () => {
  console.log(`\n=================================================`);
  console.log(`⚡ Velocity Tower Backend online on port ${PORT}`);
  console.log(`🌐 Health check: http://localhost:${PORT}/health`);
  console.log(`👥 Friends API: http://localhost:${PORT}/api/friends/list`);
  console.log(`🏆 Leaderboard: http://localhost:${PORT}/api/leaderboard`);
  console.log(`=================================================\n`);
});
