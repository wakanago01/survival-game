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

            // ゲーム内部の基準サイズ
            width: 1920,
            height: 1080,

            parent: "game-container",
            backgroundColor: "#000000",

            // PC画面に合わせて拡大・縮小
            scale: {
                mode: Phaser.Scale.FIT,
                autoCenter: Phaser.Scale.CENTER_BOTH,
                width: 1920,
                height: 1080
            },

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