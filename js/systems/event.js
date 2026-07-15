import { GAME_SETTINGS } from "../data/settings.js";

export default class EventManager {

    constructor(options = {}) {
        this.gameManager = options.gameManager ?? null;
        this.timeManager = options.timeManager ?? null;
        this.saveManager = options.saveManager ?? null;
        this.defaultSlot = options.defaultSlot ?? GAME_SETTINGS.save.defaultSlot;
        this.handlers = new Map();
    }

    register(name, callback) {
        if (!this.handlers.has(name)) {
            this.handlers.set(name, new Set());
        }

        this.handlers.get(name).add(callback);
        return () => this.unregister(name, callback);
    }

    unregister(name, callback) {
        const callbacks = this.handlers.get(name);
        if (!callbacks) return;
        callbacks.delete(callback);
    }

    emit(name, data = {}) {
        const callbacks = this.handlers.get(name);
        if (!callbacks) return [];

        const results = [];
        for (const callback of callbacks) {
            try {
                results.push(callback(data));
            } catch (error) {
                console.warn(`[EventManager] ${name} の実行に失敗しました:`, error);
            }
        }
        return results;
    }

    sleep(options = {}) {
        const gameManager = options.gameManager ?? this.gameManager ?? window.gameManager;
        const timeManager = options.timeManager ?? this.timeManager;
        const saveManager = options.saveManager ?? this.saveManager ?? gameManager?.saveManager;
        const slot = options.slot ?? this.defaultSlot;
        const shouldSave = options.save ?? true;
        const gameState = gameManager?.gameState;

        if (!gameState) return false;

        this.emit("beforeSleep", { gameState, slot });

        gameState.hp = gameState.maxHp;

        if (timeManager && typeof timeManager.skipToMorning === "function") {
            timeManager.skipToMorning();
        } else {
            gameState.day += 1;
            gameState.time = GAME_SETTINGS.time.morningStartMinutes;
        }

        if (shouldSave && saveManager) {
            saveManager.save(slot, gameState);
        }

        this.emit("afterSleep", { gameState, slot });
        return true;
    }
}
