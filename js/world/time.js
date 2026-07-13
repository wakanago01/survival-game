/**
 * time.js
 * 責務: ゲーム内時間管理（昼夜サイクル・日数管理・背景演出・日替わり通知）
 *
 * 仕様:
 *   1日 = リアル40分（昼20分・夜20分）
 *   昼夜切替で背景色を変化させ、map.js の昼夜エフェクトを呼び出す。
 *   夜はレア素材演出フラグを立てる設計。
 *   day / time は window.gameManager.gameState と同期する。
 *
 * 使い方（PlanetScene 等から）:
 *   import TimeManager from "./world/time.js";
 *   this.timeManager = new TimeManager(this.scene, this.worldMap);
 *   // update() 内で
 *   this.timeManager.update(delta);
 *
 * コールバック登録:
 *   this.timeManager.onDayChange   = (day) => { ... };
 *   this.timeManager.onNightStart  = () => { ... };
 *   this.timeManager.onMorningStart = () => { ... };
 */

// ============================================================
// 定数
// ============================================================

/** 1日のリアル時間（ミリ秒） 40分 */
const DAY_DURATION_MS  = 40 * 60 * 1000;

/** 昼の割合（0.5 = 半分） */
const DAY_RATIO        = 0.5;

/** 昼の終了時刻（0〜1 正規化） */
const NIGHT_START_NORM = DAY_RATIO; // 0.5

/** 夜の終了 = 1.0 → 翌朝0.0 */

// 背景色（宇宙・惑星フィールド）
const COLOR_DAWN       = 0x2a1a4a; // 夜明け前（深紫）
const COLOR_MORNING    = 0x4a3a7a; // 朝（紫）
const COLOR_DAY        = 0x0a0a1a; // 昼（宇宙黒 + 星空）
const COLOR_DUSK       = 0x1a0a3a; // 夕方
const COLOR_NIGHT      = 0x000010; // 深夜

export default class TimeManager {

    /**
     * @param {Phaser.Scene} scene   - このマネージャーを所有するシーン
     * @param {import("./map.js").default} worldMap - 昼夜エフェクト適用先
     */
    constructor(scene, worldMap) {
        this.scene    = scene;
        this.worldMap = worldMap;

        // ゲームステートへの参照（window.gameManager 経由）
        this._syncFromGameState();

        /**
         * 現在の時刻（0.0 〜 1.0、0.0 = 朝6時 相当）
         * gameState.time は「分」で管理されているため内部では正規化値を使う
         */
        this._normalizedTime = this._minutesToNorm(this._gameState().time);

        /** 現在が夜かどうか */
        this.isNight = this._normalizedTime >= NIGHT_START_NORM;

        /** コールバック（外部から上書き可） */
        this.onDayChange    = null;  // (day: number) => void
        this.onNightStart   = null;  // () => void
        this.onMorningStart = null;  // () => void

        /** 夜のレア素材演出フラグ（event.js 等から参照） */
        this.rareSpawnEnabled = false;

        // 初回の背景色・昼夜エフェクト適用
        this._applyTimeEffects();

        console.log(`[TimeManager] 初期化完了 day=${this._gameState().day} time=${this._gameState().time}`);
    }

    // ----------------------------------------------------------
    // 毎フレーム更新
    // ----------------------------------------------------------

    /**
     * 毎フレーム呼び出す。Phaser の delta（ミリ秒）を渡す。
     * @param {number} delta - フレーム経過時間（ms）
     */
    update(delta) {
        const prevNorm = this._normalizedTime;
        const prevNight = this.isNight;

        // 時間進行
        this._normalizedTime += delta / DAY_DURATION_MS;

        // 1日経過
        if (this._normalizedTime >= 1.0) {
            this._normalizedTime -= 1.0;
            this._advanceDay();
        }

        // 夜への切替
        if (!prevNight && this._normalizedTime >= NIGHT_START_NORM) {
            this.isNight = true;
            this.rareSpawnEnabled = true;
            this._applyTimeEffects();
            if (this.onNightStart) this.onNightStart();
            console.log(`[TimeManager] 夜になりました (Day ${this._gameState().day})`);
        }

        // 朝への切替
        if (prevNight && this._normalizedTime < NIGHT_START_NORM) {
            this.isNight = false;
            this.rareSpawnEnabled = false;
            this._applyTimeEffects();
            if (this.onMorningStart) this.onMorningStart();
            console.log(`[TimeManager] 朝になりました (Day ${this._gameState().day})`);
        }

        // 継続的な背景色更新（昼夜移行のグラデーション）
        this._updateBackgroundColor();

        // gameState に同期（UIが参照できるよう）
        this._syncToGameState();
    }

    // ----------------------------------------------------------
    // 外部 API
    // ----------------------------------------------------------

    /**
     * 現在の日数を返す。
     * @returns {number}
     */
    getDay() {
        return this._gameState().day;
    }

    /**
     * 現在時刻を「分」で返す（0〜1440 相当）。
     * UIの時計表示などに使う。
     * @returns {number}
     */
    getTimeMinutes() {
        return this._normToMinutes(this._normalizedTime);
    }

    /**
     * 現在時刻を文字列で返す（例: "06:00"〜"05:59"）。
     * 仮の時計表示（朝6時スタート）。
     * @returns {string}
     */
    getTimeString() {
        // 正規化時間を 0:00〜23:59 に変換（朝6時スタート）
        const totalMinutes = Math.floor(this._normalizedTime * 24 * 60);
        const hour   = Math.floor((totalMinutes / 60 + 6) % 24);
        const minute = totalMinutes % 60;
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
    }

    /**
     * 現在が夜かどうか。
     * @returns {boolean}
     */
    getNightFlag() {
        return this.isNight;
    }

    /**
     * 正規化時刻（0.0〜1.0）を返す。
     * map.js の applyDayNightEffect に渡す用。
     * @returns {number}
     */
    getNormalizedTime() {
        return this._normalizedTime;
    }

    /**
     * 時間を朝（0.0）にリセットし、睡眠処理（翌日へ）を行う。
     * house.js から呼ばれる。
     */
    skipToMorning() {
        const wasNight = this.isNight;
        this._normalizedTime = 0.0;
        this.isNight = false;
        this.rareSpawnEnabled = false;

        // 睡眠した場合は日数を進める
        this._advanceDay();

        this._applyTimeEffects();
        if (wasNight && this.onMorningStart) this.onMorningStart();
        console.log(`[TimeManager] 睡眠 → 朝になりました (Day ${this._gameState().day})`);
    }

    // ----------------------------------------------------------
    // 内部処理
    // ----------------------------------------------------------

    /** 日数を1進める */
    _advanceDay() {
        const gs = this._gameState();
        gs.day += 1;

        // WorldMap にオブジェクト復活チェックを通知
        if (this.worldMap) {
            this.worldMap.checkRespawn(gs.day);
        }

        if (this.onDayChange) this.onDayChange(gs.day);
        console.log(`[TimeManager] 日付が変わりました → Day ${gs.day}`);
    }

    /** 昼夜に応じた背景色・マップエフェクトを適用 */
    _applyTimeEffects() {
        this._updateBackgroundColor();
        if (this.worldMap) {
            const nightFactor = this.isNight
                ? (this._normalizedTime - NIGHT_START_NORM) / (1.0 - NIGHT_START_NORM)
                : this._normalizedTime / NIGHT_START_NORM;
            this.worldMap.applyDayNightEffect(nightFactor, this.isNight);
        }
    }

    /** 時刻に応じた背景色をなめらかに補間して設定 */
    _updateBackgroundColor() {
        const t    = this._normalizedTime;
        const scene = this.scene;
        let color;

        if (t < 0.05) {
            // 夜明け（深夜→夜明け前）
            color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(COLOR_NIGHT),
                Phaser.Display.Color.ValueToColor(COLOR_DAWN),
                1, t / 0.05
            );
        } else if (t < 0.15) {
            // 朝（夜明け前→朝）
            color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(COLOR_DAWN),
                Phaser.Display.Color.ValueToColor(COLOR_MORNING),
                1, (t - 0.05) / 0.1
            );
        } else if (t < 0.45) {
            // 昼（朝→昼）
            color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(COLOR_MORNING),
                Phaser.Display.Color.ValueToColor(COLOR_DAY),
                1, (t - 0.15) / 0.3
            );
        } else if (t < 0.55) {
            // 夕方（昼→夕）
            color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(COLOR_DAY),
                Phaser.Display.Color.ValueToColor(COLOR_DUSK),
                1, (t - 0.45) / 0.1
            );
        } else {
            // 夜（夕→深夜）
            color = Phaser.Display.Color.Interpolate.ColorWithColor(
                Phaser.Display.Color.ValueToColor(COLOR_DUSK),
                Phaser.Display.Color.ValueToColor(COLOR_NIGHT),
                1, (t - 0.55) / 0.45
            );
        }

        if (color && scene.cameras && scene.cameras.main) {
            const hexColor = Phaser.Display.Color.GetColor(color.r, color.g, color.b);
            // カメラの背景色を変更（Layer0 背景の上に乗るオーバーレイ的役割）
            scene.cameras.main.setBackgroundColor(hexColor);
        }
    }

    /** gameState.time（分）→ 正規化値 */
    _minutesToNorm(minutes) {
        // gameState.time は 480（8:00 AM 相当）スタート、1440分=24時間
        // → 0.0 〜 1.0 に正規化（朝6時=0.0 として扱う）
        const adjusted = ((minutes - 360) % 1440 + 1440) % 1440;
        return adjusted / (DAY_DURATION_MS / 1000 / 60);
    }

    /** 正規化値 → gameState.time（分） */
    _normToMinutes(norm) {
        return Math.floor(norm * (DAY_DURATION_MS / 1000 / 60));
    }

    /** window.gameManager.gameState への参照を返す */
    _gameState() {
        return window.gameManager ? window.gameManager.gameState : {
            day: 1, time: 480, hp: 100, maxHp: 100,
        };
    }

    /** gameState から内部値を初期化 */
    _syncFromGameState() {
        // 初期化時のみ呼ぶ（day/time の読み込み）
        const gs = this._gameState();
        this._day = gs.day;
    }

    /** 内部状態を gameState に書き戻す */
    _syncToGameState() {
        const gs = this._gameState();
        if (!gs) return;
        gs.time = this._normToMinutes(this._normalizedTime);
        // day は _advanceDay() 内で直接書き込んでいるのでここでは省略
    }
}
