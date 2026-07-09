import TitleScene from "./scenes/TitleScene.js";
import SaveSelectScene from "./scenes/SaveSelectScene.js";
import PlanetScene from "./scenes/PlanetScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import EndingScene from "./scenes/EndingScene.js";

export default class GameManager {

    constructor() {

        this.config = {

            type: Phaser.AUTO,

            width: 1280,

            height: 720,

            parent: "game-container",

            backgroundColor: "#000000",

            scene: [
                TitleScene,
                SaveSelectScene,
                PlanetScene,
                GameOverScene,
                EndingScene
            ]

        };

    }

    start() {

        this.game = new Phaser.Game(this.config);

    }

}