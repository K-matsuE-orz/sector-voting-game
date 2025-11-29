# Sector Voting Game

国家戦略技術6分野
GitHub Actionsを使用して毎日、市場が開いている日の17時以降に株価データを自動更新し、実際の市場パフォーマンスを比較できます。

## 開発環境のセットアップ

1.  **Node.jsのインストール**:
    [Node.js公式サイト](https://nodejs.org/)からLTS版をインストールしてください。

2.  **依存関係のインストール**:
    ```bash
    npm install
    ```

3.  **開発サーバーの起動**:
    ```bash
    npm run dev
    ```

## 株価データの更新（ローカル）

Pythonがインストールされている場合、以下のコマンドで手動更新できます。

```bash
pip install yfinance pandas
python scripts/fetch_stock_data.py
```

実行すると `public/stock_data.json` が生成されます。

## デプロイ（GitHub Pages）

1.  このリポジトリをGitHubにプッシュします。
2.  GitHubのリポジトリ設定で、Pagesのソースを「GitHub Actions」に設定するか、`gh-pages` ブランチを使用する設定にします。
3.  `.github/workflows/daily_update.yml` が毎日自動実行され、データを更新します。
