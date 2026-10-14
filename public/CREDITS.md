# 本質の残響 ── 帰れない放課後

## 作品の位置づけ・重要な利用制限

原作「偏差値60の教室から✝本質✝が漏れ出している件について」の人物・世界観を用いた、独立した短編アクションRPGです。原作の事件・章立てのゲーム化ではありません。時計が止まる事件、綻び、戦闘、収集記録、ゲーム内の台詞はゲーム独自の翻案です。

**現状のゲーム素材には非商用限定のものが含まれます。ゲーム一式を商用利用可能なフリー素材集とは扱わないでください。販売、広告収益化等には、該当素材の別途ライセンス取得または差し替え、および原作・提供画像の権利確認が必要です。**

ゲーム画面右上の手帳 →「制作・素材」からもクレジットを確認できます。

## 原作・人物画像

- 提供：ユーザーのGoogle Drive「本質images」。原作・人物画像の権利は元の権利者に帰属します。第三者向けの再利用許諾は本ゲームから付与しません。
- 参照・使用人物：両馬二郎、三重県臣、数理零。
- 明示された許可範囲：加工物のみリポジトリに保存。
- ポートレート：提供画像から顔と上半身を切り抜き、96×112に縮小、48色に減色した加工物。元画像・原作本文はゲーム配布物に含めません。
- フィールドスプライト：以下のLimeZuアニメーション素材を基礎とし、参照画像の髪色、制服、えんじのネクタイ、眼鏡等を32×48の表現に調整しています。完全な造形再現や、全動作が参照画像から忠実に復元されたものではありません。

## 校舎タイル・家具・人物アニメーション

**Modern Interiors Free — LimeZu**

- 作者ページ：https://limezu.itch.io/moderninteriors
- 取得元：https://github.com/comato13/pixelUniversity （`assets/tiles/Modern tiles_Free/`）
- 使用：`Interiors_free_16x16.png`, `Room_Builder_free_16x16.png`, Alex の `run` と `idle_anim`。
- ライセンス：取得物の `LICENSE.txt` に記載された **非商用限定ライセンス**。商用版の条件を無料取得物に流用していません。
- ライセンス原文：`licenses/LimeZu.txt`。
- 加工：タイルをゲーム内に配置・一部拡縮・色調調整。人物は元の腕・脚の歩行／待機ポーズを使用し、頭部・制服を参照画像に合わせて編集、零の本を追加。32×48のフレームに統一。右・後ろ・左・正面だった入力を、左・後ろ・右・正面へ正規化。首・顎・襟の接続もフレームごとに保持しています。横向きでは後頭部・うなじ・後ろ襟・肩の形も調整しています。
- 無料版が許諾する「編集し非商用プロジェクトに使用」の範囲で、ゲームに組み込んでいます。素材単体として再販売してはいけません。

## 敵アニメーション

**Dungeon Tileset II — Robert Norenberg / 0x72**

- 作者ページ：https://0x72.itch.io/dungeontileset-ii
- ライセンス：CC0 1.0 Universal https://creativecommons.org/publicdomain/zero/1.0/
- 取得元：https://github.com/lewiji/MagicMissile （`frames/`）
- ライセンスの相互確認資料：https://github.com/dyrdadev/ohi-ohi-dungeon/blob/main/ThirdPartyContent.md
- 使用：`chort_idle`, `necromancer_idle`, `big_demon_idle` 各4フレーム。
- 加工：紫系のパレットに変更し、アニメーションシートに結合。ゲーム独自の敵として使用しています。

## ピクセルヒットエフェクト

**Explosion Animations Pack — Luis Zuno / ansimuz**

- 作者ページ：https://ansimuz.itch.io/explosion-animations-pack
- ライセンス：CC0 1.0 Universal。
- 取得元：https://github.com/dyrdadev/ohi-ohi-dungeon （`Assets/Features/Explosions/Textures/explosion-1.png`）
- 確認資料：同リポジトリの `ThirdPartyContent.md`。
- 使用：32×32、8フレームのネイティブ解像度のエフェクト。画像未改変。ゲーム中の描画時に拡縮・加算合成。

## 消散・本質解放エフェクト

**Realistic Explosion — Morgan McGuire (2018)**

- 取得・ライセンス：https://github.com/morgan3d/quadplay/blob/main/sprites/explosion-realistic-128x128.sprite.json
- ライセンス：Public Domain / CC0 1.0。
- 使用：128×128、40フレームの画像から各フレームを32×32に縮小し、紫色に再配色した `dissolve.png`。
- 同梱：`licenses/explosion-realistic-128x128.sprite.json`。

## 音楽

### “Moon” — Micah Young / Questiion (2015)

- オリジナル：https://freesound.org/people/Questiion/sounds/166392/
- 作者：https://soundcloud.com/simulating-change
- ライセンス：CC BY 3.0 https://creativecommons.org/licenses/by/3.0/
- 取得：https://github.com/morgan3d/quadplay/tree/main/sounds (`music-moon.mp3`)
- 確認：同梱の `licenses/music-moon.sound.json`。

### “Connected” / “Rumble at the Gates” — Abstraction (2021)

- 作者：http://www.abstractionmusic.com
- アルバム：Three Red Hearts https://abstractionmusic.bandcamp.com/album/three-red-hearts
- ライセンス：CC BY 4.0 https://creativecommons.org/licenses/by/4.0/
- 取得：https://github.com/morgan3d/quadplay/tree/main/sounds
- 使用ファイル：`music-connected.mp3`, `music-rumble_at_the_gates.mp3`。
- 確認：`licenses/music-connected.sound.json`, `licenses/music-rumble_at_the_gates.sound.json`。
- 注：配布側の Connected メタデータのURLは `music-connected.sound.mp3` ですが、同ディレクトリに実在する音源は `music-connected.mp3` です。

すべて音源自体は未改変。再生時の音量調整、フェードイン、ループに使用。ブラウザの自動再生制限に従い、プレイヤーの操作後に再生します。

## 効果音

**Kenney — RPG Sounds / Digital Sounds**

- 作者：https://kenney.nl/
- 取得：https://github.com/iwenzhou/kenney
- ライセンス：CC0 1.0 Universal。原文 `licenses/Kenney-CC0.md`。
- 使用：`footstep00`, `footstep01`, `knifeSlice`, `knifeSlice2`, `bookOpen`, `bookFlip1`, `cloth1`, `doorOpen_1`, `metalPot1`, `powerUp5`, `zapThreeToneUp`, `lowDown`。
- 音源未改変。足音のみ再生時にピッチをわずかに変え、連続音の機械的な印象を抑えています。

## UIアイコン・日本語書体

- Lucide Icons：https://lucide.dev/ — ISC。`licenses/Lucide-ISC.txt`。
- Noto Sans JP：https://github.com/google/fonts/tree/main/ofl/notosansjp — SIL Open Font License 1.1。`licenses/NotoSansJP-OFL.txt`。
- Shippori Mincho（しっぽり明朝）：https://github.com/google/fonts/tree/main/ofl/shipporimincho — SIL Open Font License 1.1。`licenses/ShipporiMincho-OFL.txt`。
- 書体はゲームで使用する文字にサブセット化しWOFF2に変換。内部名を `kiriha-sans` / `kiriha-serif` に変更した派生フォントを同梱しています。

## 本ゲーム用の実装

マップ配置、衝突判定、敵の行動・攻撃予兆、カメラ、ライティング、幾何学的な光の輪、追加の粒子、ゲーム固有のHUDレイアウト、会話、セーブ処理は本ゲーム用のコードです。これらを外部素材だと表示していません。

使用元・取得blob・出力ファイル対応は `asset-sources.json` も参照してください。公開リポジトリの収録コードのライセンスを、収録アートに一律適用していません。
