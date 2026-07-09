export default class TitleScene extends Phaser.Scene {

    constructor() {
        super("TitleScene");
    }

    preload() {

    }

    create() {
        this.add.text(
            500,
            300,
            "Stellar Ascent",
            {
                fontSize: "48px",
                color: "#fc3939"
            }
        );
        this.add.text(
            450,
            400,
            "Press ENTER",
            {
                fontSize: "24px",
                color: "#ffff00"
            }
        );
        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );


    }
    
    update() {
        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {

            this.scene.start("SaveSelectScene");

        }

    }

}