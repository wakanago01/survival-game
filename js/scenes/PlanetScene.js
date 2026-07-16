import WorldMap from "../world/map.js";
import CollisionManager from "../world/collision.js";
import TimeManager from "../world/time.js";
import TimeClock from "../ui/timeClock.js";
import { GAME_SETTINGS } from "../data/settings.js";

// ★ 先ほど作ったプレイヤー本体クラスをインポート
import Player from "../player/player.js";

export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    preload() {
        // マップ画像のロード
        this.load.image(GAME_SETTINGS.map.dayKey, GAME_SETTINGS.map.dayPath);
        this.load.image(GAME_SETTINGS.map.nightKey, GAME_SETTINGS.map.nightPath);

        // ★ キャラクター用アニメーション画像のロード
        const basePath = 'assets/images/charactors/';
        
        // 下向き
        this.load.image('player_down1', basePath + '下向き1.png');
        this.load.image('player_down2', basePath + '下向き2.png');
        this.load.image('player_down3', basePath + '下向き3.png');
        this.load.image('player_down4', basePath + '下向き4.png');

        // 左向き
        this.load.image('player_left1', basePath + '左向き1.png');
        this.load.image('player_left2', basePath + '左向き2.png');
        this.load.image('player_left3', basePath + '左向き3.png');
        this.load.image('player_left4', basePath + '左向き4.png');

        // 上向き
        this.load.image('player_up1', basePath + '上向き1.png');
        this.load.image('player_up2', basePath + '上向き2.png');
        this.load.image('player_up3', basePath + '上向き3.png');
        this.load.image('player_up4', basePath + '上向き4.png');
    }

    create() {
        // ① マップを生成
        this.worldMap = new WorldMap(this);

        // ② 当たり判定システムを生成
        this.collision = new CollisionManager(this.worldMap);

        // ③ 時間管理と昼夜時計UIを生成
        this.timeManager = new TimeManager(this, this.worldMap);
        this.timeManager.onNightStart = () => {
            this.worldMap.setTimeOfDay(true);
        };
        this.timeManager.onMorningStart = () => {
            this.worldMap.setTimeOfDay(false);
        };
        this.worldMap.setTimeOfDay(this.timeManager.getNightFlag());
        this.timeClock = new TimeClock(this, this.timeManager);

        // ④ スポーン地点を取得
        const spawn = this.worldMap.getSpawnPoint();

        // ★ ⑤ 本物のプレイヤーを生成して配置
        // スポーン地点（spawn.x, spawn.y）にプレイヤーを配置します
        this.player = new Player(this, spawn.x, spawn.y);

        // ★ ⑥ キーボード入力を取得する用のcursorsを作成
        this.cursors = this.input.keyboard.createCursorKeys();

        console.log("マップ生成完了");
        console.log("スポーン地点:", spawn);
    }

    update(time, delta) {
        this.timeManager.update(delta);
        this.timeClock.update();

        // ★ ⑦ プレイヤーの更新処理（移動＆アニメーション）を呼び出す
        if (this.player) {
            // 本物の移動処理 (movement.js) を内部で呼び出します
            this.player.update(this.cursors);

            // 【当たり判定連動】
            // 移動後にもし障害物にぶつかっていたら、CollisionManager を使って進めないようにする
            // ※CollisionManagerの仕様に合わせて、必要なら player.x や y を押し戻す処理を挟んでください
        }
    }
}
