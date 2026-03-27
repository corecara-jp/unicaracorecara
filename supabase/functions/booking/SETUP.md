# Google Calendar 予約機能 セットアップ手順

## 必要な作業（一度だけ）

### 1. Google Cloud プロジェクトを作成

1. https://console.cloud.google.com/ にアクセス
2. 「新しいプロジェクト」を作成（例: `unicara-booking`）
3. 左メニュー → 「APIとサービス」→「ライブラリ」
4. 「Google Calendar API」を検索して**有効化**

### 2. OAuth クライアント ID を取得

1. 「APIとサービス」→「認証情報」→「認証情報を作成」→「OAuth クライアント ID」
2. アプリケーションの種類: **ウェブアプリケーション**
3. 承認済みのリダイレクト URI に追加:
   `https://developers.google.com/oauthplayground`
4. 作成後、**クライアント ID** と **クライアント シークレット** をメモ

### 3. リフレッシュトークンを取得（担当者のカレンダーを使う設定）

1. https://developers.google.com/oauthplayground を開く
2. 右上の歯車アイコン → 「Use your own OAuth credentials」にチェック
3. 上で作った クライアント ID / シークレットを入力
4. 左の検索欄に `https://www.googleapis.com/auth/calendar` を入力 → Authorize APIs
5. 担当者の Google アカウントでログイン・許可
6. 「Exchange authorization code for tokens」をクリック
7. **Refresh token** をコピー

### 4. カレンダー ID を確認

1. Google カレンダーを開く（担当者のアカウント）
2. 対象カレンダーの「...」→「設定と共有」
3. 「カレンダーの統合」欄の **カレンダー ID** をコピー
   （通常は `xxxx@gmail.com` または `xxxx@group.calendar.google.com`）

### 5. Supabase シークレットに登録

```bash
supabase secrets set GOOGLE_CLIENT_ID=あなたのクライアントID
supabase secrets set GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット
supabase secrets set GOOGLE_REFRESH_TOKEN=取得したリフレッシュトークン
supabase secrets set GOOGLE_CALENDAR_ID=カレンダーID（例: your@gmail.com）
```

### 6. Edge Function をデプロイ

```bash
supabase functions deploy booking
```

### 7. line-webhook もデプロイ（予約リンクの追加反映）

```bash
supabase functions deploy line-webhook
```

### 8. booking.html を GitHub にプッシュして GitHub Pages に反映

```bash
git add tool/booking.html supabase/functions/booking/
git commit -m "feat: Google Calendar 連携の無料面談予約機能を追加"
git push
```

---

## 動作確認

- https://corecara-jp.github.io/unicaracorecara/tool/booking.html にアクセス
- 「空き時間を確認して予約する」をクリック
- 空きスロットが表示されること、予約後に担当者の Google カレンダーにイベントが作られることを確認

## 営業時間の変更方法

`supabase/functions/booking/index.ts` の以下を編集:

```ts
const BUSINESS_START_HOUR = 10; // 開始時間（10:00）
const BUSINESS_END_HOUR = 19;   // 終了時間（最後のスロットは 18:30 〜 19:00）
```
