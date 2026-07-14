export default class TitleScene extends Phaser.Scene {

    constructor() {
        super("TitleScene");
    }

    preload() {
        // 背景画像
        this.load.image(
            "titleBackground",
            "assets/images/titles/karititle.png"
        );

        // NEW GAME 通常
        this.load.image(
            "newGame",
            "assets/images/titles/newgame1.png"
        );

        // NEW GAME 選択中
        this.load.image(
            "newGameSelected",
            "assets/images/titles/newgame2.png"
        );

        // CONTINUE 通常
        this.load.image(
            "continue",
            "assets/images/titles/continue1.png"
        );

        // CONTINUE 選択中
        this.load.image(
            "continueSelected",
            "assets/images/titles/continue2.png"
        );
    }

    create() {
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;

        // =========================
        // 背景画像
        // =========================
        const background = this.add.image(
            width / 2,
            height / 2,
            "titleBackground"
        );

        background.setDisplaySize(width, height);
        background.setDepth(0);

        // =========================
        // NEW GAME画像ボタン
        // =========================
        this.newGameButton = this.add.image(
            width / 2,
            450,
            "newGameSelected"
        );

        this.newGameButton
            .setDisplaySize(600,200)
            .setDepth(100);

        // =========================
        // CONTINUE画像ボタン
        // =========================
        this.continueButton = this.add.image(
            width / 2,
            525,
            "continue"
        );

        this.continueButton
            .setDisplaySize(600,210)
            .setDepth(100);

        // =========================
        // キーボード
        // =========================
        this.cursors = this.input.keyboard.createCursorKeys();

        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );

        // 0 = NEW GAME
        // 1 = CONTINUE
        this.selected = 0;
    }

    update() {
        // ↓キー
        if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
            this.selected = 1;
        }

        // ↑キー
        if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
            this.selected = 0;
        }

        // =========================
        // 選択状態によって画像を変更
        // =========================
        if (this.selected === 0) {
            this.newGameButton.setTexture("newGameSelected");
            this.continueButton.setTexture("continue");
        } else {
            this.newGameButton.setTexture("newGame");
            this.continueButton.setTexture("continueSelected");
        }

        // =========================
        // ENTERで決定
        // =========================
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
            if (this.selected === 0) {
                window.gameManager.newGame();
            } else {
                window.gameManager.continueGame();
            }
        }
    }
}