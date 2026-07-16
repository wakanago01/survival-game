import { handlePlayerAnimation } from "./animation.js";

/**
 * Phaser3 プレイヤーの移動制御ロジック
 * @param {Player} player - プレイヤーのインスタンス (this)
 * @param {Object} cursors - Phaserのキーボード入力オブジェクト (矢印キー)
 */
export function updatePlayerMovement(player, cursors) {
    // 物理エンジンの速度を一旦リセット
    player.setVelocity(0);

    let vx = 0;
    let vy = 0;
    let direction = '';

    // W, A, S, D キーのサポートも含めたキー入力判定
    const keys = player.scene.input.keyboard.addKeys('W,A,S,D');

    // 上下移動の判定
    if (cursors.up.isDown || keys.W.isDown) {
        vy = -player.speed;
        direction = 'up';
    } else if (cursors.down.isDown || keys.S.isDown) {
        vy = player.speed;
        direction = 'down';
    }

    // 左右移動の判定
    if (cursors.left.isDown || keys.A.isDown) {
        vx = -player.speed;
        direction = 'left';
    } else if (cursors.right.isDown || keys.D.isDown) {
        vx = player.speed;
        direction = 'right';
    }

    // 斜め移動時に移動速度が速くならないように正規化（ベクトル調整）
    if (vx !== 0 && vy !== 0) {
        const length = Math.sqrt(vx * vx + vy * vy);
        vx = (vx / length) * player.speed;
        vy = (vy / length) * player.speed;
    }

    // 速度をセットして移動させる
    player.setVelocity(vx, vy);

    // アニメーションと反転処理を呼び出す
    handlePlayerAnimation(player, vx, vy, direction);
}