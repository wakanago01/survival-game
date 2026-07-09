export default class GameOverScene extends Phaser.Scene {

    constructor() {
        super("GameOverScene");
    }

    create() {

        this.cameras.main.setBackgroundColor("#660000");

        this.add.text(
            420,
            300,
            "GAME OVER",
            {
                fontSize: "48px",
                color: "#ffffff"
            }
        );

    }

}