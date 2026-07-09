export default class EndingScene extends Phaser.Scene {

    constructor() {
        super("EndingScene");
    }

    create() {

        this.cameras.main.setBackgroundColor("#000066");

        this.add.text(
            450,
            300,
            "ENDING",
            {
                fontSize: "48px",
                color: "#ffffff"
            }
        );

    }

}