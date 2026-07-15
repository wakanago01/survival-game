import WorldMap from "../world/map.js";
import CollisionManager from "../world/collision.js";
import TimeManager from "../world/time.js";
import TimeClock from "../ui/timeClock.js";
import { GAME_SETTINGS } from "../data/settings.js";

export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    preload() {
        this.load.image(GAME_SETTINGS.map.dayKey, GAME_SETTINGS.map.dayPath);
        this.load.image(GAME_SETTINGS.map.nightKey, GAME_SETTINGS.map.nightPath);
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

        console.log("マップ生成完了");
        console.log("スポーン地点:", spawn);
    }


    update(time, delta) {
        this.timeManager.update(delta);
        this.timeClock.update();

        // ===== 仮キャラクター移動処理ここから（正式なmovement.js実装後に削除） =====
        if (!this.player?.body) return;

        const left = this.cursors.left.isDown || this.wasdKeys.left.isDown;
        const right = this.cursors.right.isDown || this.wasdKeys.right.isDown;
        const up = this.cursors.up.isDown || this.wasdKeys.up.isDown;
        const down = this.cursors.down.isDown || this.wasdKeys.down.isDown;

        let dirX = 0;
        let dirY = 0;

        if (left) dirX -= 1;
        if (right) dirX += 1;
        if (up) dirY -= 1;
        if (down) dirY += 1;

        if (dirX !== 0 && dirY !== 0) {
            const diagonal = Math.SQRT1_2;
            dirX *= diagonal;
            dirY *= diagonal;
        }

        const velocityX = dirX * TEMP_PLAYER_SPEED;
        const velocityY = dirY * TEMP_PLAYER_SPEED;
        const nextX = this.player.x + velocityX * (delta / 1000);
        const nextY = this.player.y + velocityY * (delta / 1000);

        if (this.collision.canMove(nextX, nextY)) {
            this.player.body.setVelocity(velocityX, velocityY);
        } else {
            this.player.body.setVelocity(0, 0);
        }
        // ===== 仮キャラクター移動処理ここまで =====
    }
}

