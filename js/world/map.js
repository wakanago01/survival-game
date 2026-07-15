/**
 * map.js
 * 責務: map.png の表示、マップ境界、最低限の座標・当たり判定API
 *
 * assets/images/world/map.png を1枚画像として表示する。
 * 重くならないよう、毎フレームのタイル描画やGraphics再描画は行わない。
 */

export const TILE = Object.freeze({
    GRASS: 1,
    SOIL: 2,
    TILLED_SOIL: 3,
    WATER: 4,
    CLIFF: 5,
    EMPTY: 0,
});

export const OBJ = Object.freeze({
    NONE: 0,
    TREE: 1,
    ROCK: 2,
    ORE_COPPER: 3,
    ORE_IRON: 4,
    ORE_ENERGY: 5,
    FLOWER: 6,
    HOUSE: 7,
    ROCKET_SITE: 8,
    BASE: 9,
});

export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 1080;
export const TILE_SIZE = 32;
export const MAP_COLS = Math.ceil(MAP_WIDTH / TILE_SIZE);
export const MAP_ROWS = Math.ceil(MAP_HEIGHT / TILE_SIZE);

const MAP_IMAGE_KEY = "worldMapImage";

export default class WorldMap {

    /**
     * @param {Phaser.Scene} scene
     */
    constructor(scene) {
        this.scene = scene;

        this.layer1 = [];
        this.layer2 = [];
        this.objectStates = {};
        this.waterTiles = new Set();
        this.bases = [];

        this.housePos = {
            row: Math.floor(MAP_ROWS / 2),
            col: Math.floor(MAP_COLS / 2),
        };

        this.rocketPos = {
            row: this.housePos.row,
            col: Math.min(MAP_COLS - 1, this.housePos.col + 3),
        };

        this.spawnPoint = {
            x: MAP_WIDTH / 2,
            y: MAP_HEIGHT / 2 + TILE_SIZE,
        };

        this.mapImage = null;

        this._initMapData();
        this._createMapImage();
        this._setupCamera();
    }

    _initMapData() {
        for (let r = 0; r < MAP_ROWS; r++) {
            this.layer1[r] = new Array(MAP_COLS).fill(TILE.GRASS);
            this.layer2[r] = new Array(MAP_COLS).fill(OBJ.NONE);
        }

        this.layer2[this.housePos.row][this.housePos.col] = OBJ.HOUSE;
        this.layer2[this.rocketPos.row][this.rocketPos.col] = OBJ.ROCKET_SITE;

        this.bases = [
            { row: 8, col: 8 },
            { row: 8, col: MAP_COLS - 9 },
            { row: MAP_ROWS - 8, col: Math.floor(MAP_COLS / 2) },
        ];

        for (const base of this.bases) {
            this.layer2[base.row][base.col] = OBJ.BASE;
        }
    }

    _createMapImage() {
        this.mapImage = this.scene.add.image(0, 0, MAP_IMAGE_KEY)
            .setOrigin(0, 0)
            .setDisplaySize(MAP_WIDTH, MAP_HEIGHT)
            .setDepth(0);
    }

    _setupCamera() {
        this.scene.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        this.scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }

    followCamera(target) {
        this.scene.cameras.main.startFollow(target, true, 0.1, 0.1);
    }

    renderViewport() {
        // map.png は静的画像なので、毎フレームの描画更新は不要。
    }

    removeObject(row, col, currentDay) {
        const key = `${row},${col}`;
        const state = this.objectStates[key] ?? {
            type: this.layer2[row]?.[col] ?? OBJ.NONE,
            hp: 0,
            respawnDay: -1,
            removed: false,
        };

        if (state.type === OBJ.NONE || state.removed) return;

        state.removed = true;
        if (state.type === OBJ.TREE) state.respawnDay = currentDay + 3;
        if (state.type === OBJ.ROCK) state.respawnDay = currentDay + 5;

        this.objectStates[key] = state;
        if (this.layer2[row]) this.layer2[row][col] = OBJ.NONE;
    }

    checkRespawn(currentDay) {
        for (const key in this.objectStates) {
            const state = this.objectStates[key];
            if (!state.removed || state.respawnDay <= 0 || currentDay < state.respawnDay) {
                continue;
            }

            const [row, col] = key.split(",").map(Number);
            state.removed = false;
            state.respawnDay = -1;
            if (this.layer2[row]) this.layer2[row][col] = state.type;
        }
    }

    applyDayNightEffect(normalizedTime, isNight) {
        const camera = this.scene.cameras.main;
        camera.setAlpha(isNight ? 0.75 : 1.0);
    }

    pixelToTile(px, py) {
        return {
            col: Math.max(0, Math.min(MAP_COLS - 1, Math.floor(px / TILE_SIZE))),
            row: Math.max(0, Math.min(MAP_ROWS - 1, Math.floor(py / TILE_SIZE))),
        };
    }

    tileToPixel(row, col) {
        return {
            x: col * TILE_SIZE + TILE_SIZE / 2,
            y: row * TILE_SIZE + TILE_SIZE / 2,
        };
    }

    isWalkable(row, col) {
        return row >= 0 && row < MAP_ROWS && col >= 0 && col < MAP_COLS;
    }

    getSpawnPoint() {
        return { ...this.spawnPoint };
    }

    getBases() {
        return this.bases;
    }

    getHousePixel() {
        return this.tileToPixel(this.housePos.row, this.housePos.col);
    }
}
