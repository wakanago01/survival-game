preload() {
    // マップ画像のロード
    this.load.image(GAME_SETTINGS.map.dayKey, GAME_SETTINGS.map.dayPath);
    this.load.image(GAME_SETTINGS.map.nightKey, GAME_SETTINGS.map.nightPath);

    const basePath = 'assets/images/charactors/';

    // --- 歩行用画像 ---
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

    // ★★★ 【新規追加】待機用画像 ★★★
    // 待機正面
    this.load.image('idle_down1', basePath + '待機正面1.png');
    this.load.image('idle_down2', basePath + '待機正面2.png');
    this.load.image('idle_down3', basePath + '待機正面3.png');
    this.load.image('idle_down4', basePath + '待機正面4.png');

    // 待機後ろ
    this.load.image('idle_up1', basePath + '待機後ろ1.png');
    this.load.image('idle_up2', basePath + '待機後ろ2.png');
    this.load.image('idle_up3', basePath + '待機後ろ3.png');
    this.load.image('idle_up4', basePath + '待機後ろ4.png');

    // 待機左向き（右向きは反転利用）
    this.load.image('idle_left1', basePath + '待機左向き1.png');
    this.load.image('idle_left2', basePath + '待機左向き2.png');
    this.load.image('idle_left3', basePath + '待機左向き3.png');
    this.load.image('idle_left4', basePath + '待機左向き4.png');
}