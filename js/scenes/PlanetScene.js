import WorldMap from "../world/map.js";
import CollisionManager from "../world/collision.js";

const TEMP_PLAYER_SPEED = 260;

export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    preload() {
        this.load.image("worldMapImage", "assets/images/world/map.png");
    }

    create() {

        // ① マップを生成
        this.worldMap = new WorldMap(this);

        // ② 当たり判定システムを生成
        this.collision = new CollisionManager(this.worldMap);

        // ③ スポーン地点を取得
        const spawn = this.worldMap.getSpawnPoint();

        // ===== 仮キャラクター処理ここから（正式なplayer.js実装後に削除） =====
        this.player = this.add.rectangle(spawn.x, spawn.y, 36, 48, 0x66e0ff)
            .setStrokeStyle(3, 0xffffff)
            .setDepth(10);

        this.physics.add.existing(this.player);
        this.player.body.setCollideWorldBounds(true);

        this.cursors = this.input.keyboard.createCursorKeys();
        this.wasdKeys = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
        });

        this.cameras.main.setDeadzone(120, 80);
        this.worldMap.followCamera(this.player);
        // ===== 仮キャラクター処理ここまで =====

        console.log("マップ生成完了");
        console.log("スポーン地点:", spawn);
    }

    update(time, delta) {
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
