import WorldMap from "../world/map.js";
import CollisionManager from "../world/collision.js";
import TimeManager from "../world/time.js";
import TimeClock from "../ui/timeClock.js";
import { GAME_SETTINGS } from "../data/settings.js";

import Player from "../player/player.js";

export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    preload() {
        // マップ画像
        this.load.image(GAME_SETTINGS.map.dayKey, GAME_SETTINGS.map.dayPath);
        this.load.image(GAME_SETTINGS.map.nightKey, GAME_SETTINGS.map.nightPath);

        // プレイヤー画像フォルダのパス
        const basePath = "assets/images/charactors/";

        // 歩行画像
        this.load.image("player_down1", basePath + "下向き1.png");
        this.load.image("player_down2", basePath + "下向き2.png");
        this.load.image("player_down3", basePath + "下向き3.png");
        this.load.image("player_down4", basePath + "下向き4.png");

        this.load.image("player_left1", basePath + "左向き1.png");
        this.load.image("player_left2", basePath + "左向き2.png");
        this.load.image("player_left3", basePath + "左向き3.png");
        this.load.image("player_left4", basePath + "左向き4.png");

        this.load.image("player_up1", basePath + "上向き1.png");
        this.load.image("player_up2", basePath + "上向き2.png");
        this.load.image("player_up3", basePath + "上向き3.png");
        this.load.image("player_up4", basePath + "上向き4.png");

        // 待機画像
        this.load.image("idle_down1", basePath + "待機正面1.png");
        this.load.image("idle_up1", basePath + "待機後ろ1.png");
        this.load.image("idle_left1", basePath + "待機左向き1.png");
    }

    create() {
        // マップ生成
        this.worldMap = new WorldMap(this);

        // 当たり判定
        this.collision = new CollisionManager(this.worldMap);

        // 時間・時計
        this.timeManager = new TimeManager(this, this.worldMap);
        this.timeManager.onNightStart = () => {
            this.worldMap.setTimeOfDay(true);
        };
        this.timeManager.onMorningStart = () => {
            this.worldMap.setTimeOfDay(false);
        };
        this.worldMap.setTimeOfDay(this.timeManager.getNightFlag());
        this.timeClock = new TimeClock(this, this.timeManager);

        // スポーン地点の取得
        const spawn = this.worldMap.getSpawnPoint() || { x: 400, y: 300 };

        // プレイヤー生成（マップより手前に配置）
        this.player = new Player(this, spawn.x, spawn.y);

        // キーボード入力準備
        this.cursors = this.input.keyboard.createCursorKeys();

        // ★ カメラ追従設定 ★
        this.cameras.main.startFollow(this.player, true, 0.08, 0.08);

        console.log("マップ生成完了。スポーン:", spawn);
    }

    update(time, delta) {
        this.timeManager.update(delta);
        this.timeClock.update();

        if (this.player) {
            this.player.update(this.cursors);
        }
    }
}