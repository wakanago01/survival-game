import { updatePlayerMovement } from "./movement.js";

// Phaser の Sprite クラスを継承してプレイヤーを作成します
export default class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        // 初期画像として「下向き1」を指定して生成
        super(scene, x, y, 'player_down1');

        // シーンに自身を追加し、物理エンジン（Arcade Physics）を有効化
        scene.add.existing(this);
        scene.physics.add.existing(this);

        this.scene = scene;
        this.speed = 150; // Phaser での移動速度（ピクセル/秒）

        // 物理体の衝突判定サイズを自動調整
        this.setCollideWorldBounds(true); // 画面外に出ないようにする

        // アニメーションの作成（まだ作られていなければ作成）
        this.createAnimations();

        // 最初のポーズを設定
        this.play('idle_down');
    }

    // アニメーションの登録処理
    createAnimations() {
        const anims = this.scene.anims;

        // すでにアニメーションが登録されている場合はスキップ
        if (anims.exists('walk_down')) return;

        // 1. 下向き歩行
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

        // 2. 上向き歩行
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

        // 3. 左向き歩行
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

        // 4. 右向き歩行（左向きのアニメーションをそのまま使い、描画時に反転させます）
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

        // 立ち止まり時のアニメーション（1コマ目固定）
        anims.create({ key: 'idle_down', frames: [{ key: 'player_down1' }] });
        anims.create({ key: 'idle_up', frames: [{ key: 'player_up1' }] });
        anims.create({ key: 'idle_left', frames: [{ key: 'player_left1' }] });
        anims.create({ key: 'idle_right', frames: [{ key: 'player_left1' }] });
    }

    // 毎フレームの更新処理（シーンの update から呼び出す）
    update(cursors) {
        // movement.js に記述する移動・アニメーション制御関数を呼び出す
        updatePlayerMovement(this, cursors);
    }
}