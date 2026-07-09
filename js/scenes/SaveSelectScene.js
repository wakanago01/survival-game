export default class SaveSelectScene extends Phaser.Scene {

    constructor() {
        super("SaveSelectScene");
    }

    create() {

        this.add.text(
            420,
            300,
            "Save Select",
            {
                fontSize: "48px",
                color: "#ffffff"
            }
        );
        this.enterKey = this.input.keyboard.addKey(
            Phaser.Input.Keyboard.KeyCodes.ENTER
        );

    }
    update() {

        if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {

            this.scene.start("PlanetScene");

        }

    }

}