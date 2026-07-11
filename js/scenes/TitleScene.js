export default class TitleScene extends Phaser.Scene {    
    constructor() {
        super("TitleScene");
    }

    preload() {
        this.load.image(
            "titleBackground",
            "assets/images/titles/title.png"
        );
    }

    create() {
        this.add.image(
            640,
            360,
            "titleBackground"
        );
        const background = this.add.image(
            this.cameras.main.centerX,
            this.cameras.main.centerY,
            "titleBackground"
        );

        background.setDisplaySize(
            this.cameras.main.width,
            this.cameras.main.height
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