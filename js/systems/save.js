import { GAME_SETTINGS, createInitialGameState } from "../data/settings.js";

const SAVE_FIELDS = [
    "hp",
    "maxHp",
    "money",
    "day",
    "time",
    "rocketProgress",
    "playTime",
    "isPaused",
    "currentScene",
];

export default class SaveManager {

    constructor(options = {}) {
        this.storagePrefix = options.storagePrefix ?? GAME_SETTINGS.save.storagePrefix;
        this.version = options.version ?? GAME_SETTINGS.save.version;
        this.maxSlots = options.maxSlots ?? GAME_SETTINGS.save.maxSlots;
    }

    save(slot = GAME_SETTINGS.save.defaultSlot, gameState = this._gameState()) {
        if (!this._canUseStorage() || !gameState) return false;

        const safeSlot = this._normalizeSlot(slot);
        const saveData = {
            version: this.version,
            savedAt: new Date().toISOString(),
            gameState: this._pickGameState(gameState),
        };

        try {
            localStorage.setItem(this._key(safeSlot), JSON.stringify(saveData));
            console.log(`[SaveManager] スロット${safeSlot}に保存しました`);
            return true;
        } catch (error) {
            console.warn("[SaveManager] セーブに失敗しました:", error);
            return false;
        }
    }

    load(slot = GAME_SETTINGS.save.defaultSlot) {
        if (!this._canUseStorage()) return null;

        const safeSlot = this._normalizeSlot(slot);

        try {
            const raw = localStorage.getItem(this._key(safeSlot));
            if (!raw) return null;

            const saveData = JSON.parse(raw);
            if (!saveData || typeof saveData !== "object" || !saveData.gameState) {
                return null;
            }

            return {
                ...createInitialGameState("PlanetScene"),
                ...saveData.gameState,
            };
        } catch (error) {
            console.warn("[SaveManager] ロードに失敗しました:", error);
            return null;
        }
    }

    hasSave(slot = GAME_SETTINGS.save.defaultSlot) {
        if (!this._canUseStorage()) return false;
        return localStorage.getItem(this._key(this._normalizeSlot(slot))) !== null;
    }

    delete(slot = GAME_SETTINGS.save.defaultSlot) {
        if (!this._canUseStorage()) return false;
        localStorage.removeItem(this._key(this._normalizeSlot(slot)));
        return true;
    }

    getSummary(slot = GAME_SETTINGS.save.defaultSlot) {
        if (!this._canUseStorage()) return null;

        const safeSlot = this._normalizeSlot(slot);

        try {
            const raw = localStorage.getItem(this._key(safeSlot));
            if (!raw) return null;
            const saveData = JSON.parse(raw);
            return {
                slot: safeSlot,
                savedAt: saveData.savedAt,
                day: saveData.gameState?.day,
                time: saveData.gameState?.time,
                currentScene: saveData.gameState?.currentScene,
            };
        } catch (error) {
            console.warn("[SaveManager] セーブ情報の取得に失敗しました:", error);
            return null;
        }
    }

    _pickGameState(gameState) {
        const picked = {};
        for (const field of SAVE_FIELDS) {
            picked[field] = gameState[field];
        }
        return picked;
    }

    _normalizeSlot(slot) {
        const parsed = Number(slot);
        if (!Number.isInteger(parsed)) return GAME_SETTINGS.save.defaultSlot;
        return Math.min(Math.max(parsed, 1), this.maxSlots);
    }

    _key(slot) {
        return `${this.storagePrefix}${slot}`;
    }

    _gameState() {
        return window.gameManager ? window.gameManager.gameState : null;
    }

    _canUseStorage() {
        return typeof localStorage !== "undefined";
    }
}
