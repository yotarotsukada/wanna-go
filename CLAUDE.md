# wanna-go アプリ設計仕様書

## 1. URL設計

### 1.1 ルート構成

```
/ (ホーム)
├── /create (グループ作成)
├── /group/:groupId (グループメイン)
│   ├── /group/:groupId/add (ブックマーク追加)
│   ├── /group/:groupId/edit/:bookmarkId (ブックマーク編集)
│   └── /group/:groupId/settings (グループ設定)
└── /about (アプリについて)
```

### 1.2 具体的なURL例

```
https://wanna-go.vercel.app/
https://wanna-go.vercel.app/create
https://wanna-go.vercel.app/group/xy7k9m2p
https://wanna-go.vercel.app/group/xy7k9m2p/add
https://wanna-go.vercel.app/group/xy7k9m2p/edit/bookmark-uuid-123
https://wanna-go.vercel.app/group/xy7k9m2p/settings
```

### 1.3 グループID仕様

- 長さ: 8文字
- 文字種: 英数字 (0-9, a-z) ※大文字なし（混乱回避）
- 例: `xy7k9m2p`, `a3f8d1q7`, `m9x2c5b8`
- 生成方法: crypto.randomBytes()を使用してランダム生成

## 2. 画面設計

### 2.1 ホームページ (/)

```
┌─────────────────────────────────────┐
│ wanna-go 🗺️                          │
├─────────────────────────────────────┤
│                                     │
│        行きたい場所を               │
│        家族・恋人と共有しよう       │
│                                     │
│  ┌─────────────────────────────┐     │
│  │  新しいグループを作成        │     │
│  └─────────────────────────────┘     │
│                                     │
│  ┌─────────────────────────────┐     │
│  │  グループIDを入力           │     │
│  │  [_________________]        │     │
│  │  [参加する]                │     │
│  └─────────────────────────────┘     │
│                                     │
│  特徴:                              │
│  ✓ アカウント不要                   │
│  ✓ URLで簡単共有                    │
│  ✓ 地図で場所を確認                 │
│                                     │
└─────────────────────────────────────┘
```

### 2.2 グループ作成ページ (/create)

```
┌─────────────────────────────────────┐
│ ← wanna-go                          │
├─────────────────────────────────────┤
│                                     │
│  新しいグループを作成               │
│                                     │
│  グループ名 *                       │
│  ┌─────────────────────────────────┐ │
│  │ 我が家の行きたいところ          │ │
│  └─────────────────────────────────┘ │
│                                     │
│  グループID (自動生成)              │
│  ┌─────────────────────────────────┐ │
│  │ xy7k9m2p      [🔄再生成]        │ │
│  └─────────────────────────────────┘ │
│  ※ このIDでグループを共有します     │
│                                     │
│  説明 (任意)                        │
│  ┌─────────────────────────────────┐ │
│  │ 家族で行きたい場所や            │ │
│  │ やりたいことをまとめています     │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  グループを作成                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ✅ ID重複チェック済み              │
│                                     │
└─────────────────────────────────────┘
```

### 2.3 グループメインページ (/group/:groupId)

```
┌─────────────────────────────────────┐
│ 我が家の行きたいところ 📝 ⚙️       │
├─────────────────────────────────────┤
│ [+ ブックマーク追加]                │
├─────────────────────────────────────┤
│                                     │
│ ┌─ フィルター ──────────────────┐     │
│ │ [全て▼] [未訪問▼] [🔍検索___] │     │
│ └─────────────────────────────┘     │
│                                     │
│ ┌─ ブックマークカード ─────────┐     │
│ │ 🍜 美味しいラーメン店         │     │
│ │ カテゴリ: レストラン ⭐⭐⭐⭐  │     │
│ │ 📍 東京都渋谷区...           │     │
│ │ 📝 友人おすすめ！味噌が絶品   │     │
│ │ 🔗 tabelog.com/...           │     │
│ │ [✓訪問済み] [✏️編集] [🗑️削除] │     │
│ └─────────────────────────────┘     │
│                                     │
│ ┌─ ブックマークカード ─────────┐     │
│ │ 🏛️ 国立科学博物館            │     │
│ │ カテゴリ: 観光地 ⭐⭐⭐⭐⭐    │     │
│ │ 📍 東京都台東区...           │     │
│ │ 📝 子供と一緒に楽しめそう     │     │
│ │ 🔗 kahaku.go.jp              │     │
│ │ [✓訪問済み] [✏️編集] [🗑️削除] │     │
│ └─────────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### 2.4 ブックマーク追加ページ (/group/:groupId/add)

```
┌─────────────────────────────────────┐
│ ← ブックマークを追加                │
├─────────────────────────────────────┤
│                                     │
│  URL *                              │
│  ┌─────────────────────────────────┐ │
│  │ https://tabelog.com/example     │ │
│  └─────────────────────────────────┘ │
│  [URLから情報を取得] [🔄取得中...]  │
│                                     │
│  タイトル *                         │
│  ┌─────────────────────────────────┐ │
│  │ 美味しいラーメン店 (自動取得)   │ │
│  └─────────────────────────────────┘ │
│                                     │
│  説明 (自動取得)                    │
│  ┌─────────────────────────────────┐ │
│  │ 渋谷にある人気ラーメン店。      │ │
│  │ 味噌ラーメンが自慢の...         │ │
│  └─────────────────────────────────┘ │
│                                     │
│  カテゴリ *                         │
│  ┌─────────────────────────────────┐ │
│  │ レストラン ▼                   │ │
│  └─────────────────────────────────┘ │
│  (レストラン/観光地/ショッピング/   │
│   アクティビティ/その他)            │
│                                     │
│  住所・場所（任意）                 │
│  ┌─────────────────────────────────┐ │
│  │ 東京都渋谷区上原1-2-3           │ │
│  └─────────────────────────────────┘ │
│                                     │
│  興味度                             │
│  ⭐ ⭐ ⭐ ⭐ ⭐ (1-5段階)           │
│                                     │
│  メモ                               │
│  ┌─────────────────────────────────┐ │
│  │ 友人おすすめ！                 │ │
│  │ 味噌ラーメンが絶品との噂       │ │
│  └─────────────────────────────────┘ │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │  保存                           │ │
│  └─────────────────────────────────┘ │
│                                     │
└─────────────────────────────────────┘
```

### 2.5 ブックマーク編集ページ (/group/:groupId/edit/:bookmarkId)

```
┌─────────────────────────────────────┐
│ ← ブックマークを編集                │
├─────────────────────────────────────┤
│                                     │
│  URL *                              │
│  ┌─────────────────────────────┐     │
│  │ https://tabelog.com/example │     │
│  └─────────────────────────────┘     │
│                                     │
│  タイトル *                         │
│  ┌─────────────────────────────┐     │
│  │ 美味しいラーメン店          │     │
│  └─────────────────────────────┘     │
│                                     │
│  カテゴリ *                         │
│  ┌─────────────────────────────┐     │
│  │ レストラン ▼               │     │
│  └─────────────────────────────┘     │
│                                     │
│  住所・場所（任意）                 │
│  ┌─────────────────────────────┐     │
│  │ 東京都渋谷区上原1-2-3       │     │
│  └─────────────────────────────┘     │
│                                     │
│  興味度                             │
│  ⭐ ⭐ ⭐ ⭐ ⭐ (1-5段階)           │
│                                     │
│  メモ                               │
│  ┌─────────────────────────────┐     │
│  │ 友人おすすめ！               │     │
│  │ 味噌ラーメンが絶品との噂     │     │
│  │                             │     │
│  │ 【追記】実際に行ってみた！   │     │
│  │ 本当に美味しかった⭐⭐⭐⭐⭐ │     │
│  └─────────────────────────────┘     │
│                                     │
│  訪問済み                           │
│  ☑️ 訪問しました                   │
│                                     │
│  ┌─────────────────────────────┐     │
│  │  更新                       │     │
│  └─────────────────────────────┘     │
│  ┌─────────────────────────────┐     │
│  │  削除                       │     │
│  └─────────────────────────────┘     │
│                                     │
└─────────────────────────────────────┘
```

### 2.6 グループ設定ページ (/group/:groupId/settings)

```
┌─────────────────────────────────────┐
│ ← グループ設定                      │
├─────────────────────────────────────┤
│                                     │
│  グループ情報                       │
│                                     │
│  グループ名                         │
│  ┌─────────────────────────────┐     │
│  │ 我が家の行きたいところ      │     │
│  └─────────────────────────────┘     │
│                                     │
│  説明                               │
│  ┌─────────────────────────────┐     │
│  │ 家族で行きたい場所や        │     │
│  │ やりたいことをまとめています │     │
│  └─────────────────────────────┘     │
│                                     │
│  ┌─────────────────────────────┐     │
│  │  設定を更新                 │     │
│  └─────────────────────────────┘     │
│                                     │
│  ─────────────────────────────     │
│                                     │
│  共有                               │
│                                     │
│  グループURL                        │
│  ┌─────────────────────────────┐     │
│  │ https://wanna-go.vercel.app/group/  │     │
│  │ xy7k9m2p                    │     │
│  └─────────────────────────────┘     │
│  [URLをコピー] [QRコード表示]       │
│                                     │
│  ─────────────────────────────     │
│                                     │
│  統計情報                           │
│                                     │
│  • 総ブックマーク数: 12件           │
│  • 訪問済み: 5件                    │
│  • 未訪問: 7件                      │
│  • 作成日: 2025/08/01               │
│                                     │
└─────────────────────────────────────┘
```

## 3. データベース設計 (SQLite)

### 3.1 テーブル構成

```sql
-- グループテーブル
CREATE TABLE groups (
    id TEXT PRIMARY KEY,              -- 8桁のランダム文字列
    name TEXT NOT NULL,               -- グループ名
    description TEXT,                 -- 説明
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ブックマークテーブル
CREATE TABLE bookmarks (
    id TEXT PRIMARY KEY,              -- UUID
    group_id TEXT NOT NULL,           -- グループID (外部キー)
    title TEXT NOT NULL,              -- タイトル
    url TEXT NOT NULL,                -- URL
    category TEXT NOT NULL,           -- カテゴリ
    memo TEXT,                        -- メモ
    address TEXT,                     -- 住所（任意）
    priority INTEGER DEFAULT 3,       -- 興味度 (1-5)
    visited BOOLEAN DEFAULT 0,        -- 訪問済みフラグ
    visited_at DATETIME,              -- 訪問日時
    -- 自動取得データ
    auto_title TEXT,                  -- 自動取得されたタイトル
    auto_description TEXT,            -- 自動取得された説明
    auto_image_url TEXT,              -- 自動取得された画像URL
    auto_site_name TEXT,              -- 自動取得されたサイト名
    -- タイムスタンプ
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES groups (id) ON DELETE CASCADE
);

-- インデックス作成
CREATE INDEX idx_bookmarks_group_id ON bookmarks(group_id);
CREATE INDEX idx_bookmarks_category ON bookmarks(category);
CREATE INDEX idx_bookmarks_visited ON bookmarks(visited);
CREATE INDEX idx_bookmarks_priority ON bookmarks(priority);
CREATE INDEX idx_bookmarks_created_at ON bookmarks(created_at);
CREATE INDEX idx_bookmarks_url ON bookmarks(url);
```

### 3.2 データサンプル

```sql
-- グループデータサンプル
INSERT INTO groups (id, name, description) VALUES 
('xy7k9m2p', '我が家の行きたいところ', '家族で行きたい場所ややりたいことをまとめています'),
('a3f8d1q7', 'デートスポット', '恋人と一緒に行きたい場所のリスト'),
('m9x2c5b8', '友達との遊び場', '友人グループで行きたいスポット');

-- ブックマークデータサンプル
INSERT INTO bookmarks (
    id, group_id, title, url, category, memo, address, 
    priority, visited
) VALUES 
(
    'bm001', 'xy7k9m2p', '美味しいラーメン店', 
    'https://tabelog.com/tokyo/A1303/A130301/13001234/',
    'レストラン', '友人おすすめ！味噌ラーメンが絶品との噂',
    '東京都渋谷区上原1-2-3', 4, 0
),
(
    'bm002', 'xy7k9m2p', '国立科学博物館',
    'https://www.kahaku.go.jp/',
    '観光地', '子供と一緒に楽しめそう。恐竜の展示が見たい！',
    '東京都台東区上野公園7-20', 5, 0
),
(
    'bm003', 'xy7k9m2p', 'おしゃれカフェ',
    'https://example-cafe.com/',
    'レストラン', 'インスタで見つけた。パンケーキが美味しそう',
    '東京都渋谷区表参道1-1-1', 3, 1
);
```

### 3.3 カテゴリ一覧（enum的な扱い）

```javascript
const CATEGORIES = [
    'レストラン',
    '観光地', 
    'ショッピング',
    'アクティビティ',
    'その他'
];
```

### 3.4 主要なクエリ例

```sql
-- グループの全ブックマーク取得
SELECT * FROM bookmarks 
WHERE group_id = 'xy7k9m2p' 
ORDER BY created_at DESC;

-- 未訪問のブックマーク取得
SELECT * FROM bookmarks 
WHERE group_id = 'xy7k9m2p' AND visited = 0
ORDER BY priority DESC, created_at DESC;

-- カテゴリ別ブックマーク取得
SELECT * FROM bookmarks 
WHERE group_id = 'xy7k9m2p' AND category = 'レストラン'
ORDER BY priority DESC;

-- キーワード検索
SELECT * FROM bookmarks 
WHERE group_id = 'xy7k9m2p' 
AND (title LIKE '%ラーメン%' OR memo LIKE '%ラーメン%' OR address LIKE '%ラーメン%')
ORDER BY priority DESC;

-- 地図表示用（座標がある）ブックマーク
SELECT * FROM bookmarks 
WHERE group_id = 'xy7k9m2p' 
AND address IS NOT NULL AND address != '';

-- グループ統計情報
SELECT 
    COUNT(*) as total_count,
    COUNT(CASE WHEN visited = 1 THEN 1 END) as visited_count,
    COUNT(CASE WHEN visited = 0 THEN 1 END) as unvisited_count,
    AVG(priority) as avg_priority
FROM bookmarks 
WHERE group_id = 'xy7k9m2p';
```

## 4. API設計

### 4.1 エンドポイント一覧

```
GET    /api/groups/:groupId              # グループ情報取得
PUT    /api/groups/:groupId              # グループ情報更新
POST   /api/groups                       # グループ作成
GET    /api/groups/check/:groupId        # グループID重複チェック

GET    /api/groups/:groupId/bookmarks    # ブックマーク一覧取得
POST   /api/groups/:groupId/bookmarks    # ブックマーク作成
GET    /api/bookmarks/:bookmarkId        # ブックマーク詳細取得  
PUT    /api/bookmarks/:bookmarkId        # ブックマーク更新
DELETE /api/bookmarks/:bookmarkId        # ブックマーク削除

POST   /api/url-metadata                 # URL メタデータ取得
```

### 4.2 レスポンス例

```javascript
// GET /api/groups/xy7k9m2p
{
    "id": "xy7k9m2p",
    "name": "我が家の行きたいところ", 
    "description": "家族で行きたい場所ややりたいことをまとめています",
    "created_at": "2025-08-01T10:00:00Z",
    "updated_at": "2025-08-01T10:00:00Z"
}

// GET /api/groups/xy7k9m2p/bookmarks
{
    "bookmarks": [
        {
            "id": "bm001",
            "group_id": "xy7k9m2p",
            "title": "美味しいラーメン店",
            "url": "https://tabelog.com/tokyo/A1303/A130301/13001234/",
            "category": "レストラン",
            "memo": "友人おすすめ！味噌ラーメンが絶品との噂",
            "address": "東京都渋谷区上原1-2-3",
            "priority": 4,
            "visited": false,
            "visited_at": null,
            "auto_title": "美味しいラーメン店 - 食べログ",
            "auto_description": "渋谷にある人気ラーメン店。味噌ラーメンが自慢の老舗店です。",
            "auto_image_url": "https://tabelog.com/imgview/original?id=r12345",
            "auto_site_name": "食べログ",
            "created_at": "2025-08-01T11:30:00Z",
            "updated_at": "2025-08-01T11:30:00Z"
        }
    ],
    "total": 1,
    "stats": {
        "total_count": 12,
        "visited_count": 5,
        "unvisited_count": 7,
        "avg_priority": 3.8
    }
}

// GET /api/groups/check/xy7k9m2p
{
    "available": true,
    "suggested_alternatives": [] // 使用済みの場合のみ代替候補
}

// POST /api/url-metadata
{
    "url": "https://tabelog.com/tokyo/A1303/A130301/13001234/",
    "title": "美味しいラーメン店 - 食べログ",
    "description": "渋谷にある人気ラーメン店。味噌ラーメンが自慢の老舗店です。濃厚スープと自家製麺の組み合わせが絶品。",
    "image": "https://tabelog.com/imgview/original?id=r12345",
    "site_name": "食べログ",
    "favicon": "https://tabelog.com/favicon.ico",
    "success": true,
    "error": null
}
```

## 5. 技術仕様詳細

### 5.1 フロントエンド構成

```javascript
// React Router設定例
import { BrowserRouter, Routes, Route } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/create" element={<CreateGroupPage />} />
                <Route path="/group/:groupId" element={<GroupPage />} />
                <Route path="/group/:groupId/add" element={<AddBookmarkPage />} />
                <Route path="/group/:groupId/edit/:bookmarkId" element={<EditBookmarkPage />} />
                <Route path="/group/:groupId/settings" element={<GroupSettingsPage />} />
            </Routes>
        </BrowserRouter>
    );
}
```

### 5.2 状態管理

```javascript
// Context API使用例
const AppContext = createContext();

const AppProvider = ({ children }) => {
    const [currentGroup, setCurrentGroup] = useState(null);
    const [bookmarks, setBookmarks] = useState([]);
    const [filters, setFilters] = useState({
        category: 'all',
        visited: 'all',
        search: ''
    });

    return (
        <AppContext.Provider value={{
            currentGroup, setCurrentGroup,
            bookmarks, setBookmarks,
            filters, setFilters
        }}>
            {children}
        </AppContext.Provider>
    );
};
```

### 5.3 ユーティリティ関数

```javascript
// グループID生成（重複チェック付き）
async function generateUniqueGroupId() {
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
        const id = generateGroupId();
        const isAvailable = await checkGroupIdAvailability(id);
        
        if (isAvailable) {
            return id;
        }
        attempts++;
    }
    
    throw new Error('Failed to generate unique group ID after maximum attempts');
}

// グループID生成
function generateGroupId() {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// グループID重複チェック
async function checkGroupIdAvailability(groupId) {
    try {
        const response = await fetch(`/api/groups/check/${groupId}`);
        const data = await response.json();
        return data.available;
    } catch (error) {
        console.error('Error checking group ID availability:', error);
        return false;
    }
}

// URL メタデータ取得
async function fetchUrlMetadata(url) {
    try {
        const response = await fetch('/api/url-metadata', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url })
        });
        
        const data = await response.json();
        
        if (data.success) {
            return {
                title: data.title || '',
                description: data.description || '',
                image: data.image || '',
                siteName: data.site_name || '',
                favicon: data.favicon || ''
            };
        } else {
            throw new Error(data.error || 'Failed to fetch metadata');
        }
    } catch (error) {
        console.error('Error fetching URL metadata:', error);
        return {
            title: '',
            description: '',
            image: '',
            siteName: '',
            favicon: ''
        };
    }
}

// UUID生成（ブックマークID用）
function generateBookmarkId() {
    return 'bm' + Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// URL バリデーション
function isValidURL(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

// デバウンス関数（URL入力用）
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
```
