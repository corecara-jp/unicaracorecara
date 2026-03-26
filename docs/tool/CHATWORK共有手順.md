# Chatworkで他社にツールを共有する手順

他社の方に「これから。」のフローツール（理想と現実のギャップ→選択肢の提示）を使ってもらうには、**ツールのURLをChatworkで送る**のがいちばん簡単です。相手はリンクをクリックするだけでブラウザでツールを開けます。

---

## 1. ツールをURLで公開する

`standalone.html` は **1ファイルだけで完結**しているので、次のいずれかの方法で公開URLを取得できます。

### 方法A: Netlify Drop（おすすめ・手軽）

1. [https://app.netlify.com/drop](https://app.netlify.com/drop) を開く
2. `standalone.html` をドラッグ＆ドロップする
3. 表示されたURL（例: `https://xxxx.netlify.app`）をコピーする

→ このURLをChatworkで送れば共有完了です。

### 方法B: GitHub Pages

1. リポジトリに `standalone.html` を置く
2. リポジトリの **Settings → Pages** で、Source を「main ブランチ」などに設定
3. 公開されるURLは `https://<ユーザー名>.github.io/<リポジトリ名>/standalone.html` の形式

→ このURLをChatworkで送る。

### 方法C: 自社サーバーやストレージに置く

- 自社のWebサーバーやオブジェクトストレージ（S3 など）に `standalone.html` をアップロードし、**https のURL** を発行する。
- そのURLをChatworkで共有する。

---

## 2. Chatworkで送るときの文面例

リンクだけ送ってもよいですが、一文添えると相手が安心して開きやすくなります。

**例文:**

```
キャリアの「理想と現実のギャップ」を整理し、4つの選択肢を根拠つきで見られるツールです。下記URLから開いてご利用ください。

https://（あなたの公開URL）
```

必要に応じて、「入力内容は端末外に送信されません」「Unicara「これから。」のキャリア支援の一環です」などを追記してもよいです。

---

## 3. 注意点

- **https で公開する**: Chatworkのリンクプレビューやクリック時の警告を避けるため、http ではなく https のURLを共有してください。
- **standalone.html を使う**: 共有用には `standalone.html`（CSS・JSを内蔵した1ファイル）を使ってください。`index.html` は `styles.css` と `app.js` が同じ場所にないと表示が崩れます。
- データはツール内で完結しており、サーバーに送信されません（Netlify等にアップロードした場合も、HTMLを配信しているだけです）。

---

## まとめ

| 手順 | 内容 |
|------|------|
| 1 | `standalone.html` を Netlify Drop または GitHub Pages 等で公開し、URLを取得する |
| 2 | ChatworkでそのURLを送り、必要なら「ツールの説明」を一文添える |
| 3 | 相手はリンクをクリックしてブラウザでツールを利用する |

これで他社の方にも同じツールをスムーズに共有できます。
