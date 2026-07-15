import TitleScene from "./scenes/TitleScene.js";
import SaveSelectScene from "./scenes/SaveSelectScene.js";
import PlanetScene from "./scenes/PlanetScene.js";
import GameOverScene from "./scenes/GameOverScene.js";
import EndingScene from "./scenes/EndingScene.js";
import { GAME_SETTINGS, createInitialGameState } from "./data/settings.js";
import SaveManager from "./systems/save.js";
import EventManager from "./systems/event.js";
import AudioManager from "./systems/audio.js";

export default class GameManager {

    constructor() {

        this.gameState = createInitialGameState("TitleScene");
        this.saveManager = new SaveManager();
        this.eventManager = new EventManager({
            gameManager: this,
            saveManager: this.saveManager,
        });
        this.audioManager = new AudioManager();

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
        window.gameManager = this;
        this.game = new Phaser.Game(this.config);
    }

    getGameState() {
        return this.gameState;
    }

    newGame() {
        this.gameState = createInitialGameState("PlanetScene");
        console.log("ニューゲーム開始");
        this.changeScene("PlanetScene");
    }

    continueGame(slot = GAME_SETTINGS.save.defaultSlot) {
        if (this.loadGame(slot)) {
            const sceneName = this.gameState.currentScene || "PlanetScene";
            console.log(`スロット${slot}から再開`);
            this.changeScene(sceneName);
            return true;
        }

        console.log(`スロット${slot}にセーブデータがありません`);
        return false;
    }

    saveGame(slot = GAME_SETTINGS.save.defaultSlot) {
        return this.saveManager.save(slot, this.gameState);
    }

    loadGame(slot = GAME_SETTINGS.save.defaultSlot) {
        const loadedState = this.saveManager.load(slot);
        if (!loadedState) return false;

        this.gameState = loadedState;
        return true;
    }

    changeScene(sceneName) {
        this.game.scene.start(sceneName);
        this.gameState.currentScene = sceneName;
    }

}
