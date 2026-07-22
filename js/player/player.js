import { updatePlayerMovement } from "./movement.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 画像がない場合のバックアップ用（緑の四角）
        if (!scene.textures.exists('fallback_player')) {
            const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
            graphics.fillStyle(0x00ff00, 1);
            graphics.fillRect(0, 0, 32, 48);
            graphics.generateTexture('fallback_player', 32, 48);
        }

        const initialTexture = scene.textures.exists('idle_down1') ? 'idle_down1' : 'fallback_player';
        super(scene, x, y, initialTexture);

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.setDepth(10);
        this.scene = scene;
        this.speed = 150;
        this.lastDirection = 'down';
        this.direction = 'down';

        this.setCollideWorldBounds(true);

        this.createAnimations();

        if (this.scene.anims.exists('idle_down')) {
            this.play('idle_down');
        }
    }

    createAnimations() {
        const anims = this.scene.anims;

        if (anims.exists('walk_down')) return;

        // --- 歩行アニメーション ---
        if (this.scene.textures.exists('player_down1')) {
            anims.create({
                key: 'walk_down',
                frames: [{ key: 'player_down1' }, { key: 'player_down2' }, { key: 'player_down3' }, { key: 'player_down4' }],
                frameRate: 8,
                repeat: -1
            });
            anims.create({
                key: 'walk_up',
                frames: [{ key: 'player_up1' }, { key: 'player_up2' }, { key: 'player_up3' }, { key: 'player_up4' }],
                frameRate: 8,
                repeat: -1
            });
            anims.create({
                key: 'walk_left',
                frames: [{ key: 'player_left1' }, { key: 'player_left2' }, { key: 'player_left3' }, { key: 'player_left4' }],
                frameRate: 8,
                repeat: -1
            });
            anims.create({
                key: 'walk_right',
                frames: [{ key: 'player_left1' }, { key: 'player_left2' }, { key: 'player_left3' }, { key: 'player_left4' }],
                frameRate: 8,
                repeat: -1
            });
        }

        // --- 待機アニメーション ---
        if (this.scene.textures.exists('idle_down1')) {
            anims.create({
                key: 'idle_down',
                frames: [{ key: 'idle_down1' }],
                frameRate: 1,
                repeat: -1
            });
            anims.create({
                key: 'idle_up',
                frames: [{ key: 'idle_up1' }],
                frameRate: 1,
                repeat: -1
            });
            anims.create({
                key: 'idle_left',
                frames: [{ key: 'idle_left1' }],
                frameRate: 1,
                repeat: -1
            });
            anims.create({
                key: 'idle_right',
                frames: [{ key: 'idle_left1' }],
                frameRate: 1,
                repeat: -1
            });
        }
    }

    update(cursors) {
        updatePlayerMovement(this, cursors);
    }
}