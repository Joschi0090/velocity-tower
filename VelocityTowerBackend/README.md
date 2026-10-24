# ⚡ Velocity Tower Backend & Friends API

High-performance, ultra-lightweight Node.js / Express backend providing:
- 👥 **Freundessystem & Spieler-Profile:** Registrierung, Tag-Suche (`#TAG-XXXX`), Nickname & Avatar.
- 🏆 **Globales Leaderboard & Freundes-Rangliste:** Synchronisation von Highscore und Floor in Echtzeit.
- ⚔️ **1v1 Rivalen-Herausforderungen:** Challenge-Links und Direktduelle.
- 💾 **Persistente Speicherung:** Lokale JSON-Datenbank oder bereit für MongoDB / PostgreSQL.

---

## 🚀 Schnellstart (Lokal)

```bash
cd VelocityTowerBackend
npm install
npm start
```
Der Server läuft standardmäßig auf `http://localhost:3000`.

---

## 📡 API Endpunkte

### 1. Spieler registrieren / Profil updaten
- **POST** `/api/player/register`
- **Body:**
```json
{
  "tag": "#JOSCHI-8821",
  "nickname": "Joschi",
  "avatar": "⚡",
  "bestFloor": 64,
  "bestScore": 18500
}
```

### 2. Spieler nach Tag suchen
- **GET** `/api/player/:tag` (z.B. `/api/player/%23JOSCHI-8821` oder `/api/player/JOSCHI-8821`)

### 3. Highscore / Floor synchronisieren
- **POST** `/api/player/sync`
- **Body:**
```json
{
  "tag": "#JOSCHI-8821",
  "floor": 72,
  "score": 21000
}
```

### 4. Freunde abfragen (Batch-Lookup)
- **POST** `/api/friends/list`
- **Body:**
```json
{
  "tags": ["#JOSCHI-8821", "#CYBER-001", "#NEON-777"]
}
```

### 5. Globale Top 50 Rangliste
- **GET** `/api/leaderboard`

---

## ☁️ 1-Klick Cloud-Deployment (100% Kostenlos)

### Option A: Render.com (Empfohlen)
1. Neues kostenloses Konto auf [render.com](https://render.com) erstellen.
2. **New +** -> **Web Service**.
3. Dieses GitHub-Repo auswählen (`velocity-tower`).
4. **Root Directory:** `VelocityTowerBackend`
5. **Build Command:** `npm install`
6. **Start Command:** `node server.js`
7. Fertig! Du erhältst eine HTTPS-URL wie `https://velocity-tower-backend.onrender.com`.

### Option B: Railway.app
1. Neues Projekt auf [railway.app](https://railway.app) anlegen.
2. Repo verbinden und Subverzeichnis `VelocityTowerBackend` wählen.
3. Automatisch deployen.
