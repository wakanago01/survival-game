import { GAME_SETTINGS } from "../data/settings.js";

export default class AudioManager {

    constructor(options = {}) {
        this.scene = options.scene ?? null;
        this.bgmVolume = options.bgmVolume ?? GAME_SETTINGS.audio.bgmVolume;
        this.seVolume = options.seVolume ?? GAME_SETTINGS.audio.seVolume;
        this.currentBgm = null;
        this.currentBgmKey = null;
    }

    setScene(scene) {
        this.scene = scene;
    }

    playBgm(key, options = {}) {
        const scene = options.scene ?? this.scene;
        if (!scene?.sound || !key) return false;

        if (this.currentBgmKey === key && this.currentBgm?.isPlaying) {
            return true;
        }

        this.stopBgm();

        try {
            this.currentBgm = scene.sound.add(key, {
                loop: options.loop ?? true,
                volume: options.volume ?? this.bgmVolume,
            });
            this.currentBgm.play();
            this.currentBgmKey = key;
            return true;
        } catch (error) {
            console.warn(`[AudioManager] BGM ${key} を再生できませんでした:`, error);
            this.currentBgm = null;
            this.currentBgmKey = null;
            return false;
        }
    }

    stopBgm() {
        if (this.currentBgm) {
            this.currentBgm.stop();
            this.currentBgm.destroy();
        }
        this.currentBgm = null;
        this.currentBgmKey = null;
    }

    playSe(key, options = {}) {
        const scene = options.scene ?? this.scene;
        if (!scene?.sound || !key) return false;

        try {
            scene.sound.play(key, {
                volume: options.volume ?? this.seVolume,
            });
            return true;
        } catch (error) {
            console.warn(`[AudioManager] SE ${key} を再生できませんでした:`, error);
            return false;
        }
    }

    setBgmVolume(value) {
        this.bgmVolume = this._clampVolume(value);
        if (this.currentBgm) {
            this.currentBgm.setVolume(this.bgmVolume);
        }
    }

    setSeVolume(value) {
        this.seVolume = this._clampVolume(value);
    }

    _clampVolume(value) {
        const number = Number(value);
        if (!Number.isFinite(number)) return 0;
        return Math.min(Math.max(number, 0), 1);
    }
}
