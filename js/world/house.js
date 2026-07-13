/**
 * house.js
 * 責務: 家への出入り・睡眠処理・HP全回復・ゲーム時間リセット（翌朝へ）
 *
 * 仕様:
 *   家に近づく（2タイル以内）→ Eキーで就寝
 *   就寝すると HP全回復 → 翌日の朝へ（time.js の skipToMorning() 呼び出し）
 *   セーブポイントとして利用可能な設計（save.js 連携用フック付き）
 *
 * 使い方（PlanetScene 等から）:
 *   import HouseManager from "./world/house.js";
 *   this.house = new HouseManager(this.scene, this.worldMap, this.collision, this.timeManager);
 *
 *   // update() 内で
 *   this.house.update(playerX, playerY, inputKeys);
 *
 * コールバック登録:
 *   this.house.onSleep = () => { ... };  // セーブ処理など
 */

export default class HouseManager {

    /**
     * @param {Phaser.Scene}                          scene
     * @param {import("./map.js").default}            worldMap
     * @param {import("./collision.js").default}      collision
     * @param {import("./time.js").default}           timeManager
     */
    constructor(scene, worldMap, collision, timeManager) {
        this.scene       = scene;
        this.worldMap    = worldMap;
        this.collision   = collision;
        this.timeManager = timeManager;

        /** 家に近いかどうかのフラグ（UI表示用） */
        this.isNearHouse = false;

        /** 睡眠処理中かどうか（重複実行防止） */
        this.isSleeping = false;

        /** 就寝コールバック（セーブ処理などを外部で定義） */
        this.onSleep = null;

        /** 就寝後コールバック */
        this.onWakeUp = null;

        // 「E で就寝」ガイドテキスト（Phaser.GameObjects.Text）
        this._promptText = null;
        this._createPromptText();

        console.log("[HouseManager] 初期化完了");
    }

    // ----------------------------------------------------------
    // 毎フレーム更新
    // ----------------------------------------------------------

    /**
     * 毎フレーム呼び出す。
     * @param {number} playerX - プレイヤー中心 X
     * @param {number} playerY - プレイヤー中心 Y
     * @param {Phaser.Types.Input.Keyboard.CursorKeys} inputKeys - カーソルキー or カスタムキー
     * @param {Phaser.Input.Keyboard.Key} [sleepKey] - 就寝キー（省略時は E キーを自動取得）
     */
    update(playerX, playerY, inputKeys, sleepKey) {
        if (this.isSleeping) return;

        // 家への近接判定
        this.isNearHouse = this.collision.isNearHouse(playerX, playerY);

        // ガイドテキストの表示切替
        if (this._promptText) {
            this._promptText.setVisible(this.isNearHouse);
            // カメラに追従させてスクリーン固定位置に表示
            if (this.isNearHouse) {
                const cam = this.scene.cameras.main;
                this._promptText.setPosition(
                    cam.scrollX + cam.width  / 2,
                    cam.scrollY + cam.height - 80
                );
            }
        }

        // 就寝キー入力チェック
        if (this.isNearHouse) {
            const eKey = sleepKey ??
                this.scene.input?.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.E);
            if (eKey && Phaser.Input.Keyboard.JustDown(eKey)) {
                this._startSleep();
            }
        }
    }

    // ----------------------------------------------------------
    // 就寝処理
    // ----------------------------------------------------------

    /**
     * 就寝を開始する。
     * フェードアウト → 回復 → 翌朝へ → フェードイン の流れ。
     */
    _startSleep() {
        if (this.isSleeping) return;
        this.isSleeping = true;

        console.log("[HouseManager] 就寝開始");

        // ガイドテキストを隠す
        if (this._promptText) this._promptText.setVisible(false);

        const cam = this.scene.cameras.main;

        // フェードアウト（0.8秒）
        cam.fade(800, 0, 0, 0, false, (camera, progress) => {
            if (progress < 1) return; // フェード完了まで待つ

            // --- フェードアウト完了後の処理 ---

            // 1. HP全回復
            this._recoverHP();

            // 2. 時間を翌朝にスキップ（time.js が日数も進める）
            if (this.timeManager) {
                this.timeManager.skipToMorning();
            }

            // 3. セーブコールバック（外部で定義可能）
            if (this.onSleep) {
                this.onSleep();
            }

            console.log(
                `[HouseManager] 回復完了 HP=${this._gameState().hp}/${this._gameState().maxHp}`,
                `Day=${this._gameState().day}`
            );

            // フェードイン（1.0秒）
            cam.fadeIn(1000, 0, 0, 0, false, (cam2, prog2) => {
                if (prog2 < 1) return;
                this.isSleeping = false;
                if (this.onWakeUp) this.onWakeUp();
                console.log("[HouseManager] 起床");
            });
        });
    }

    /**
     * HP を最大値まで回復する。
     * window.gameManager.gameState を直接更新する。
     */
    _recoverHP() {
        const gs = this._gameState();
        if (!gs) return;
        gs.hp = gs.maxHp;
    }

    // ----------------------------------------------------------
    // ガイドテキスト
    // ----------------------------------------------------------

    /** 「[E] 就寝する」テキストを作成（カメラ座標追従） */
    _createPromptText() {
        try {
            const cam = this.scene.cameras.main;
            this._promptText = this.scene.add.text(
                cam ? cam.scrollX + cam.width  / 2 : 640,
                cam ? cam.scrollY + cam.height - 80 : 640,
                "[ E ] 就寝する",
                {
                    fontSize:        "18px",
                    fontFamily:      "sans-serif",
                    color:           "#fffde7",
                    backgroundColor: "#00000088",
                    padding:         { x: 12, y: 6 },
                    align:           "center",
                }
            )
            .setOrigin(0.5, 1)
            .setDepth(100)   // 最前面
            .setScrollFactor(0) // スクロールに追従しない（UI固定）
            .setVisible(false);

        } catch (e) {
            // テキスト作成に失敗してもゲームは続行する
            console.warn("[HouseManager] promptText の作成に失敗:", e);
        }
    }

    // ----------------------------------------------------------
    // ゲート・状態確認 API
    // ----------------------------------------------------------

    /**
     * プレイヤーが現在家の近くにいるかどうか。
     * @returns {boolean}
     */
    getNearHouseFlag() {
        return this.isNearHouse;
    }

    /**
     * 現在睡眠中かどうか。
     * @returns {boolean}
     */
    getSleepingFlag() {
        return this.isSleeping;
    }

    /**
     * 強制的に HP を回復させる（イベント用）。
     * @param {number} [amount] - 省略時は全回復
     */
    heal(amount) {
        const gs = this._gameState();
        if (!gs) return;
        if (amount === undefined) {
            gs.hp = gs.maxHp;
        } else {
            gs.hp = Math.min(gs.maxHp, gs.hp + amount);
        }
    }

    /**
     * テキストプロンプトを破棄する（シーン終了時など）。
     */
    destroy() {
        if (this._promptText) {
            this._promptText.destroy();
            this._promptText = null;
        }
    }

    // ----------------------------------------------------------
    // 内部ヘルパー
    // ----------------------------------------------------------

    /** window.gameManager.gameState への参照 */
    _gameState() {
        return window.gameManager ? window.gameManager.gameState : null;
    }
}
