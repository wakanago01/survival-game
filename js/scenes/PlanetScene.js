export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    create() {

        this.cameras.main.setBackgroundColor("#2d7d46");

        this.add.text(
            420,
            40,
            "Planet Scene",
            {
                fontSize: "40px",
                color: "#ffffff"
            }
        );

    }

}