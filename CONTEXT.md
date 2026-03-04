# 🧠 CONTEXT.md — Project Nova (iMusic)

> **O cérebro do projeto.** Este documento contém TUDO que qualquer IA precisa para entender, contribuir e evoluir este projeto em qualquer plataforma, conta ou ferramenta.

---

## 1. VISÃO GERAL

**Project Nova** é um clone de alta fidelidade do Spotify Premium para streaming e download de músicas pessoais, construído nativamente com **React Native + Expo (SDK 54)**. O app busca metadados via **iTunes/Apple Music API** (sem auth), resolve áudio via **YouTube scraping + backend Cobalt próprio**, e suporta **download offline completo** com persistência SQLite.

| Campo | Valor |
|---|---|
| **Nome interno** | `project-nova` |
| **Diretório** | `iMusic/` |
| **Plataformas** | iOS (primário), Android (secundário) |
| **Linguagem** | TypeScript |
| **Runtime** | React Native 0.81.5 + Expo ~54.0.0 |
| **Bundle ID** | `com.projectnova.app` |
| **Design System** | NativeWind v4 (TailwindCSS) + tema "nova" dark |
| **Estado atual** | MVP funcional com TrackPlayer **mockado** — as telas, pipeline e download manager estão implementados mas o `react-native-track-player` real ainda não está integrado |

---

## 2. STACK TECNOLÓGICA COMPLETA

### Core
- **React Native** 0.81.5 + **React** 19.1.0
- **Expo** ~54.0.0 (Managed Workflow com `expo-dev-client`)
- **TypeScript** ^5.1.3
- **Expo Router** ~6.0.23 (File-based routing com typed routes)

### UI & Estilização
- **NativeWind** v4 (TailwindCSS 3.4 para React Native)
- **Lucide React Native** ^0.575.0 (ícones)
- **React Native Reanimated** ~4.1.1 (animações)
- **React Native Gesture Handler** ~2.28.0
- **Expo Blur** ~15.0.8 (glassmorphism)

### Estado & Data Fetching
- **Zustand** ^4.5.2 (3 stores: Player, UI, DownloadManager)
- **TanStack React Query** ^5.0.0 (cache de API)
- **Axios** ^1.6.0 (HTTP client)

### Áudio
- **react-native-track-player** ^4.1.1 (declarado, porém **mockado** atualmente)
- Pipeline de resolução: iTunes → YouTube Scraping → Cobalt Backend

### Persistência & Storage
- **expo-sqlite** ~16.0.10 (SQLite local — tracks, playlists, downloads)
- **expo-file-system** ~19.0.21 (download e gerenciamento de arquivos MP3)
- **expo-secure-store** ~15.0.8 (dados sensíveis)
- **react-native-mmkv** ^2.12.2 (key-value ultra-rápido)
- **@react-native-async-storage/async-storage** 2.2.0

### Build & Deploy
- **EAS Build** (dev, preview, production)
- **Babel** com preset `babel-preset-expo` + `nativewind/babel`
- **Metro** com `withNativeWind` wrapper

---

## 3. ARQUITETURA DO PROJETO

```
iMusic/
├── app/                          # Expo Router — Screens (file-based routing)
│   ├── _layout.tsx               # Root Layout (boot: DB init + Player setup)
│   ├── player.tsx                # Player Full-Screen Modal (slide_from_bottom)
│   └── (tabs)/                   # Bottom Tab Navigator
│       ├── _layout.tsx           # Tab config + MiniPlayer global
│       ├── index.tsx             # Home Screen (feed "Feito para você")
│       ├── search.tsx            # Search Screen (iTunes API + debounce)
│       └── library.tsx           # Library Screen (offline tracks + toggle)
│
├── src/
│   ├── assets/
│   │   ├── global.css            # NativeWind entry (Tailwind directives)
│   │   ├── icon.png / splash.png / adaptive-icon.png
│   │
│   ├── components/
│   │   ├── player/
│   │   │   └── MiniPlayer.tsx    # Mini player bar (acima do bottom tab)
│   │   └── track/
│   │       └── TrackListItem.tsx  # Item de lista de música (play + download)
│   │
│   ├── core/
│   │   ├── database/
│   │   │   ├── db.ts             # SQLite init + schema (4 tabelas)
│   │   │   └── repositories.ts   # TrackRepository + PlaylistRepository (CRUD)
│   │   └── player/
│   │       ├── AudioPipeline.ts  # ⭐ Motor de resolução de áudio (cache → YT → Cobalt → play)
│   │       ├── setup.ts          # TrackPlayer initialization + capabilities
│   │       ├── service.ts        # Playback service (remote events: lock screen, etc)
│   │       └── trackPlayer.mock.ts # MOCK do react-native-track-player (dev)
│   │
│   ├── services/
│   │   ├── spotify/
│   │   │   └── index.ts          # SpotifyService (usa iTunes API — SEM auth token!)
│   │   └── youtube/
│   │       ├── index.ts          # YouTubeService (scraping direto do youtube.com)
│   │       └── cobalt.ts         # CobaltService (backend próprio p/ stream de áudio)
│   │
│   ├── store/
│   │   ├── PlayerStore.ts        # Zustand — currentTrack, queue, isPlaying, isBuffering
│   │   ├── UIStore.ts            # Zustand — isOfflineMode, isPlayerExpanded
│   │   └── DownloadManagerStore.ts # Zustand — activeDownloads, addTrackToDownload, cancel
│   │
│   ├── types/
│   │   ├── index.ts              # Re-export barrel
│   │   ├── models.ts             # Track, Playlist, LocalTrack (interfaces de domínio)
│   │   ├── database.ts           # TrackEntity, PlaylistEntity, LocalTrackEntity (DB)
│   │   └── api.ts                # SpotifyTrackItem, YouTubeSearchResult, CobaltRequest/Response
│   │
│   ├── hooks/
│   │   └── useDebounce.ts        # Hook genérico de debounce
│   │
│   └── utils/
│       └── fileUtils.ts          # FileUtils: delete, storageSize, formatBytes
│
├── app.json                      # Expo config (nome, splash, permissions, plugins)
├── package.json                  # Deps + scripts
├── tsconfig.json                 # Extends expo/tsconfig.base
├── babel.config.js               # babel-preset-expo + nativewind/babel
├── metro.config.js               # Metro + NativeWind CSS injection
├── tailwind.config.js            # Tema "nova" (cores dark Spotify-inspired)
├── eas.json                      # EAS Build profiles
└── .env                          # EXPO_PUBLIC_SPOTIFY_CLIENT_ID / SECRET
```

---

## 4. FLUXO DE DADOS (PIPELINE DE ÁUDIO)

O coração do app é o **AudioPipeline** (`src/core/player/AudioPipeline.ts`). Este é o fluxo completo quando o usuário toca uma música:

```
┌─────────────────────────────────────────────────────────────────┐
│                    USUÁRIO TOCA UMA MÚSICA                      │
└─────────────────┬───────────────────────────────────────────────┘
                  ▼
    ┌──────────────────────────┐
    │ 1. AudioPipeline.playTrack│
    │    → setCurrentTrack()    │
    │    → setIsBuffering(true) │
    └──────────┬───────────────┘
               ▼
    ┌──────────────────────────┐     ✅ Encontrou?
    │ 2. SQLite: Check local   │────────────────┐
    │    TrackRepository       │                 │
    │    .getLocalTrackById()  │                 ▼
    └──────────┬───────────────┘     Usa local_path direto
               │ ❌ Não encontrou              │
               ▼                                │
    ┌──────────────────────────┐                │
    │ 3. YouTubeService        │                │
    │    .searchAudioContent() │                │
    │    (scraping YouTube)    │                │
    └──────────┬───────────────┘                │
               ▼                                │
    ┌──────────────────────────┐                │
    │ 4. CobaltService         │                │
    │    .resolveAudioStream() │                │
    │    (backend → stream URL)│                │
    └──────────┬───────────────┘                │
               ▼                                │
    ┌──────────────────────────┐◄───────────────┘
    │ 5. TrackPlayer           │
    │    .reset() → .add()     │
    │    → .play()             │
    └──────────────────────────┘
```

### Pipeline de Download (DownloadManagerStore)
1. Resolve áudio pelo mesmo pipeline (YouTube → Cobalt)
2. Baixa o MP3 via `expo-file-system` `DownloadResumable` com progress callback
3. Salva no `documentDirectory` como `{title}_{id}.mp3`
4. Persiste no SQLite (`local_tracks`) via `TrackRepository.saveLocalTrack()`

---

## 5. BANCO DE DADOS (SQLite)

**Arquivo:** `projectnova.db` | **Engine:** `expo-sqlite` (synchronous API)

```sql
-- Tabela principal de metadados de músicas
CREATE TABLE tracks (
  id TEXT PRIMARY KEY,          -- ID do iTunes/Spotify
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL
);

-- Músicas baixadas para offline
CREATE TABLE local_tracks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album TEXT NOT NULL,
  artwork_url TEXT NOT NULL,
  duration_ms INTEGER NOT NULL,
  local_path TEXT NOT NULL,     -- file:// URI do MP3 local
  downloaded_at INTEGER NOT NULL,
  FOREIGN KEY(id) REFERENCES tracks(id) ON DELETE CASCADE
);

-- Playlists do usuário
CREATE TABLE playlists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  cover_image TEXT,
  created_at INTEGER NOT NULL
);

-- Relação N:N entre playlists e tracks
CREATE TABLE playlist_tracks (
  playlist_id TEXT NOT NULL,
  track_id TEXT NOT NULL,
  added_at INTEGER NOT NULL,
  order_index INTEGER NOT NULL,
  PRIMARY KEY (playlist_id, track_id),
  FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE,
  FOREIGN KEY(track_id) REFERENCES tracks(id) ON DELETE CASCADE
);
```

**Pragmas ativos:** `journal_mode = WAL`, `foreign_keys = ON`

---

## 6. APIs E SERVIÇOS EXTERNOS

### 6.1 iTunes Search API (como "Spotify" Service)
- **Endpoint:** `https://itunes.apple.com/search?term=...&entity=song&limit=20`
- **Auth:** Nenhuma (pública e gratuita)
- **Uso:** Busca de metadados (título, artista, álbum, artwork 600x600, duração)
- **Lookup:** `https://itunes.apple.com/lookup?id={trackId}`
- **Arquivo:** `src/services/spotify/index.ts`

### 6.2 YouTube Scraping (Direct)
- **Endpoint:** `https://www.youtube.com/results?search_query=...`
- **Método:** Scraping do `ytInitialData` embutido no HTML
- **User-Agent fake:** Chrome Windows para evitar bloqueio
- **Retorno:** `videoId`, título, canal, duração
- **Arquivo:** `src/services/youtube/index.ts`

### 6.3 Backend Cobalt (Self-Hosted)
- **Dev:** `http://192.168.X.X:8000` (IP local)
- **Prod:** `https://imusic-backend.onrender.com/`
- **Endpoints:**
  - `GET /audio/{videoId}` → retorna `{ url, format, bitrate, cached }`
  - `POST /prefetch` → body `{ ids: string[] }` → pré-resolve batch de vídeos
- **Cache local:** `Map<string, { url, expiresAt }>` — 4 horas de validade
- **Arquivo:** `src/services/youtube/cobalt.ts`

---

## 7. GERENCIAMENTO DE ESTADO (Zustand)

### PlayerStore (`src/store/PlayerStore.ts`)
```typescript
{
  currentTrack: Track | null,    // Música tocando agora
  queue: Track[],                // Fila de reprodução
  isPlaying: boolean,            // Estado play/pause
  isBuffering: boolean,          // Carregando stream?
  // Actions:
  setCurrentTrack, setQueue, setIsPlaying, setIsBuffering,
  playTrack(track),              // Set track + queue + buffering
  playQueue(tracks, startIndex), // Set queue inteira e começa do índice
}
```

### UIStore (`src/store/UIStore.ts`)
```typescript
{
  isOfflineMode: boolean,        // Toggle modo offline (library screen)
  isPlayerExpanded: boolean,     // Player full vs mini
  // Actions:
  setOfflineMode, setPlayerExpanded
}
```

### DownloadManagerStore (`src/store/DownloadManagerStore.ts`)
```typescript
{
  activeDownloads: Record<string, DownloadTask>, // Por track ID
  // Actions:
  addTrackToDownload(track),     // Pipeline completo: YT → Cobalt → download → SQLite
  cancelDownload(trackId),       // Cancela DownloadResumable
  clearCompleted(),              // Remove completed/error do mapa
}

// DownloadTask = { track, progress (0-1), status, resumable? }
```

---

## 8. DESIGN SYSTEM (Tema "Nova")

```javascript
// tailwind.config.js → theme.extend.colors.nova
nova: {
  background:    '#121212',  // Fundo principal (preto Spotify)
  surface:       '#282828',  // Cards, inputs, elementos elevados
  surfaceHover:  '#3E3E3E',  // Hover/active states
  accent:        '#1DB954',  // Verde Spotify (botões, progress bars)
  accentActive:  '#1ED760',  // Verde ativo/hover
  textPrimary:   '#FFFFFF',  // Texto principal
  textSecondary: '#B3B3B3',  // Texto secundário, subtítulos
}
```

**Uso no código:** `className="bg-nova-background text-nova-textSecondary"`

---

## 9. NAVEGAÇÃO (Expo Router)

```
/ (Stack Navigator — Root Layout)
├── /(tabs)/ (Bottom Tab Navigator — com BlurView glassmorphism)
│   ├── /                    → HomeScreen (index.tsx)
│   ├── /search              → SearchScreen
│   └── /library             → LibraryScreen
│
└── /player                  → PlayerScreen (fullScreenModal, slide_from_bottom)
```

- **MiniPlayer** é renderizado dentro do `(tabs)/_layout.tsx`, posicionado `absolute bottom-[85px]`
- O **PlayerScreen** abre como modal full-screen sobre todo o app
- O boot do app (`app/_layout.tsx`) inicializa DB + TrackPlayer antes de renderizar

---

## 10. COMPONENTES EXISTENTES

| Componente | Arquivo | Descrição |
|---|---|---|
| `MiniPlayer` | `src/components/player/MiniPlayer.tsx` | Barra compacta acima do tab bar. Mostra artwork, título, artista, botão play/pause e progress bar. Toque abre `/player`. |
| `TrackListItem` | `src/components/track/TrackListItem.tsx` | Item de lista reutilizável. Artwork, título, artista, botão download (com progresso %), menu MoreVertical. Chamam `AudioPipeline.playTrack()` e `DownloadManagerStore.addTrackToDownload()`. |

---

## 11. ESTADO ATUAL & LIMITAÇÕES CONHECIDAS

### ⚠️ MOCK DO TRACK PLAYER
O `react-native-track-player` está **completamente mockado** em `src/core/player/trackPlayer.mock.ts`. Todas as funções (`play`, `pause`, `reset`, `add`, etc.) são no-ops. Os hooks `usePlaybackState`, `useActiveTrack`, `useProgress` retornam valores estáticos.

**Para integrar o real:**
1. Remover o arquivo mock
2. Atualizar imports em `AudioPipeline.ts`, `setup.ts`, `service.ts`, `MiniPlayer.tsx`, `player.tsx`
3. Apontar para `react-native-track-player` real
4. Adicionar `react-native-reanimated/plugin` ao `babel.config.js`

### ⚠️ Cobalt Backend
- O IP de dev está hardcoded como `192.168.X.X` — precisa ser atualizado
- O backend Render (`imusic-backend.onrender.com`) precisa estar deployado

### ⚠️ YouTube Scraping
- O scraping direto do YouTube via regex no `ytInitialData` é frágil e pode quebrar se o YouTube mudar o formato da página

### ⚠️ .env exposto
- Client ID e Secret do Spotify estão no `.env` mas **não são usados** (o serviço usa iTunes API pública)
- Devem ser removidos ou protegidos

### ⚠️ Babel Config
- O plugin `react-native-reanimated/plugin` está comentado no `babel.config.js` mas Reanimated é usado no `player.tsx`

---

## 12. MODELO DE TIPOS (TypeScript)

### Domínio (`src/types/models.ts`)
```typescript
interface Track {
  id: string;          // ID do iTunes
  title: string;
  artist: string;
  album: string;
  artwork_url: string;
  duration_ms: number;
}

interface Playlist {
  id: string;
  name: string;
  cover_image?: string;
  created_at: number;
}

interface LocalTrack extends Track {
  local_path: string;
  downloaded_at: number;
}
```

### Database Entities (`src/types/database.ts`)
```typescript
interface TrackEntity { id, title, artist, album, artwork_url, duration_ms }
interface PlaylistEntity { id, name, cover_image, created_at }
interface PlaylistTrackEntity { playlist_id, track_id, added_at, order_index }
interface LocalTrackEntity extends TrackEntity { local_path, downloaded_at }
```

### API DTOs (`src/types/api.ts`)
```typescript
interface SpotifyTrackItem { id, name, artists[], album { name, images[] }, duration_ms }
interface SpotifySearchResponse { tracks: { items: SpotifyTrackItem[] } }
interface YouTubeSearchResult { id, title, channel, duration }
interface CobaltRequestPayload { url, aFormat?, isAudioOnly?, ... }
interface CobaltResponse { status, url?, text? }
```

---

## 13. SCRIPTS & COMANDOS

```bash
npm start          # Inicia o Expo Dev Server
npm run ios        # Abre no iOS Simulator
npm run android    # Abre no Android Emulator
npm run web        # Expo Web (limitado — TrackPlayer não funciona)
npm test           # Jest (sem testes configurados ainda)
npm run lint       # ESLint para .ts/.tsx
npx eas build      # Build via EAS (dev/preview/production)
```

---

## 14. VARIÁVEIS DE AMBIENTE

```env
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=2d27b167...    # ⚠️ Não utilizado atualmente
EXPO_PUBLIC_SPOTIFY_CLIENT_SECRET=a7fc918... # ⚠️ Não utilizado atualmente
```

O backend Cobalt é configurado via constante `API_BASE` em `src/services/youtube/cobalt.ts`:
- **Dev:** `http://192.168.X.X:8000` (precisa ser ajustado)
- **Prod:** `https://imusic-backend.onrender.com/`

---

## 15. ROADMAP / PRÓXIMOS PASSOS CONHECIDOS

1. **Integrar `react-native-track-player` real** — substituir o mock
2. **Habilitar `react-native-reanimated/plugin`** no babel
3. **Backend Cobalt** — fazer deploy funcional e atualizar IP de dev
4. **Tela de Settings** — Storage & Data, gerenciar downloads
5. **Prefetch inteligente** — usar `CobaltService.prefetchTracks()` na queue
6. **Playlists UI** — CRUD de playlists (backend já tem repository pronto)
7. **Fontes customizadas** — atualmente usa `System` font
8. **Testes** — Jest + React Native Testing Library
9. **Slider de progresso real** — substituir barra estática por `@react-native-community/slider`
10. **Tratamento de erros** — Toast notifications, retry logic, fallback de skip

---

## 16. CONVENÇÕES DO PROJETO

- **Idioma do código:** Inglês para nomes de variáveis/funções, Português para comentários e textos de UI
- **Imports:** Paths relativos (`../../src/...` do app/, `../` do src/)
- **Estado:** Zustand stores — UI reflete o store, lógica pesada fica no Pipeline/Service
- **Estilização:** NativeWind classes (`className="..."`) — tema `nova-*`
- **DB:** Operações síncronas via `expo-sqlite` (`runSync`, `getAllSync`, `getFirstSync`)
- **Componentes:** Functional components com export nomeado (exceto screens que usam `export default`)

---

> **Última atualização:** 2026-03-01 | **Versão:** 1.0.0
