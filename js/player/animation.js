/**
 * プレイヤーのアニメーション再生と反転の制御ロジック
 * @param {Player} player - プレイヤーのインスタンス
 * @param {number} vx - X方向の速度
 * @param {number} vy - Y方向の速度
 * @param {string} direction - 入力から決定された向き ('up', 'down', 'left', 'right')
 */
export function handlePlayerAnimation(player, vx, vy, direction) {
    // 元の画像アセット（縦長）の比率を維持して描画するためのスケール調整
    // 横幅を 48px 相当に合わせたい場合：
    const targetWidth = 48;
    if (player.texture && player.texture.getSourceImage()) {
        const img = player.texture.getSourceImage();
        const aspectRatio = img.height / img.width;
        player.setDisplaySize(targetWidth, targetWidth * aspectRatio);
    }

    // キャラクターが動いている場合
    if (vx !== 0 || vy !== 0) {
        // 右向きの時は左向き画像を反転(Flip)させて表示
        if (direction === 'right') {
            player.setFlipX(true);
            player.play('walk_right', true);
        } else if (direction === 'left') {
            player.setFlipX(false);
            player.play('walk_left', true);
        } else if (direction === 'up') {
            player.setFlipX(false);
            player.play('walk_up', true);
        } else if (direction === 'down') {
            player.setFlipX(false);
            player.play('walk_down', true);
        }
    } else {
        // 立ち止まっている場合（直前の状態を維持しつつ idle アニメーションへ）
        const currentAnim = player.anims.currentAnim;
        if (currentAnim) {
            if (currentAnim.key.includes('up')) {
                player.play('idle_up', true);
            } else if (currentAnim.key.includes('left')) {
                player.setFlipX(false);
                player.play('idle_left', true);
            } else if (currentAnim.key.includes('right')) {
                player.setFlipX(true);
                player.play('idle_right', true);
            } else {
                player.play('idle_down', true);
            }
        }
    }
}