export const GAME_SETTINGS = Object.freeze({
    initialState: {
        hp: 100,
        maxHp: 100,
        money: 0,
        day: 1,
        time: 360,
        rocketProgress: 0,
        playTime: 0,
        isPaused: false,
    },

    time: {
        dayDurationMs: 40 * 60 * 1000,
        nightStartMinutes: 18 * 60,
        morningStartMinutes: 6 * 60,
        minutesPerDay: 24 * 60,
    },

    save: {
        defaultSlot: 1,
        maxSlots: 3,
        storagePrefix: "stellarAscent.save.",
        version: 1,
    },

    audio: {
        bgmVolume: 0.6,
        seVolume: 0.8,
    },
});

export function createInitialGameState(currentScene = "TitleScene") {
    return {
        ...GAME_SETTINGS.initialState,
        currentScene,
    };
}
