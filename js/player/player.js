import { updatePlayerMovement } from "./movement.js";

export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'idle_down1');

        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.speed = 150;

        this.setCollideWorldBounds(true);

        this.createAnimations();

        // 最初のポーズ（待機アニメーション）を再生
        this.play('idle_down');
    }

    createAnimations() {
        const anims = this.scene.anims;

        if (anims.exists('walk_down')) return;

        // --- 歩行アニメーション ---
        anims.create({
            key: 'walk_down',
            frames: [
                { key: 'player_down1' },
                { key: 'player_down2' },
                { key: 'player_down3' },
                { key: 'player_down4' }
            ],
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'walk_up',
            frames: [
                { key: 'player_up1' },
                { key: 'player_up2' },
                { key: 'player_up3' },
                { key: 'player_up4' }
            ],
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'walk_left',
            frames: [
                { key: 'player_left1' },
                { key: 'player_left2' },
                { key: 'player_left3' },
                { key: 'player_left4' }
            ],
            frameRate: 8,
            repeat: -1
        });

        anims.create({
            key: 'walk_right',
            frames: [
                { key: 'player_left1' },
                { key: 'player_left2' },
                { key: 'player_left3' },
                { key: 'player_left4' }
            ],
            frameRate: 8,
            repeat: -1
        });

        // ★★★ 【修正】待機アニメーション（4コマをゆっくり再生） ★★★
        anims.create({
            key: 'idle_down',
            frames: [
                { key: 'idle_down1' },
                { key: 'idle_down2' },
                { key: 'idle_down3' },
                { key: 'idle_down4' }
            ],
            frameRate: 4, // 歩行よりゆっくり動くように調整
            repeat: -1
        });

        anims.create({
            key: 'idle_up',
            frames: [
                { key: 'idle_up1' },
                { key: 'idle_up2' },
                { key: 'idle_up3' },
                { key: 'idle_up4' }
            ],
            frameRate: 4,
            repeat: -1
        });

        anims.create({
            key: 'idle_left',
            frames: [
                { key: 'idle_left1' },
                { key: 'idle_left2' },
                { key: 'idle_left3' },
                { key: 'idle_left4' }
            ],
            frameRate: 4,
            repeat: -1
        });

        anims.create({
            key: 'idle_right',
            frames: [
                { key: 'idle_left1' },
                { key: 'idle_left2' },
                { key: 'idle_left3' },
                { key: 'idle_left4' }
            ],
            frameRate: 4,
            repeat: -1
        });
    }

    update(cursors) {
        updatePlayerMovement(this, cursors);
    }
}