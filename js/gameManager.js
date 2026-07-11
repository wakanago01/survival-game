import TitleScene from "./scenes/TitleScene.js";
import SaveSelectScene from "./scenes/SaveSelectScene.js";
import PlanetScene from "./scenes/PlanetScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import EndingScene from "./scenes/EndingScene.js";

export default class GameManager {

    constructor() {
        this.gameState = {
            hp: 100,
            maxHp: 100,
            money: 0,
            day: 1,
            time: 480, 
            rocketProgress: 0,
            playTime: 0,
            isPaused: false,
            currentScene: "TitleScene"
        };

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
        window.gameManager = this;
    }

    getGameState() {
        return this.gameState;
    }

    newGame() {
        this.gameState = {
            hp: 100,
            maxHp: 100,
            money: 0,
            day: 1,
            time: 480,
            rocketProgress: 0,
            playTime: 0,
            currentScene: "PlanetScene",
            isPaused: false
        };
        console.log("ニューゲーム開始");
        this.changeScene("PlanetScene");
    }

    continueGame() {
        console.log("Continue");
    }

    saveGame() {
        console.log("ゲームを保存");
    }

    loadGame() {
        console.log("ゲームを読み込み");
    }

    changeScene(sceneName) {
        this.game.scene.start(sceneName);
        this.gameState.currentScene = sceneName;
    }

}