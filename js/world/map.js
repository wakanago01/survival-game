/**
 * map.js
 * 責務: マップ生成・カメラ追従・タイル描画・オブジェクト描画・描画順制御・スポーン地点管理
 * 担当: js/world/map.js
 *
 * マップサイズ: 200×200タイル / 1タイル = 32×32px / 総サイズ = 6400×6400px
 *
 * レイヤー構成:
 *   Layer0: 背景（宇宙・星空）
 *   Layer1: 草・土・道・崖・水
 *   Layer2: 木・岩・鉱石・家・基地
 *   Layer3: プレイヤー（外部管理）
 *   Layer4: 前景（葉・崖オーバーレイなど）
 *
 * ※ タイル画像は未用意のためプレースホルダー（色ブロック）で描画する。
 *    assets/tiles/ に画像が追加されたら loadTileset() を差し替えること。
 */

// ============================================================
// タイルID定数（将来タイルセット画像に差し替えやすいよう分離）
// ============================================================
export const TILE = Object.freeze({
    // Layer1 地形
    GRASS:        1,   // 草（耕作・建築可）
    SOIL:         2,   // 土（道）
    TILLED_SOIL:  3,   // 耕した土（クワで生成）
    WATER:        4,   // 水（侵入不可・釣り可）
    CLIFF:        5,   // 崖（侵入不可）
    EMPTY:        0,   // 空（Layer0 以外では透過扱い）
});

// オブジェクトID定数（Layer2 オブジェクト）
export const OBJ = Object.freeze({
    NONE:         0,
    TREE:         1,   // 木（伐採・3日復活）
    ROCK:         2,   // 岩（採掘・5日復活）
    ORE_COPPER:   3,   // 銅鉱石
    ORE_IRON:     4,   // 鉄鉱石
    ORE_ENERGY:   5,   // エネルギー鉱石
    FLOWER:       6,   // 花（採取可）
    HOUSE:        7,   // 家（初期スポーン）
    ROCKET_SITE:  8,   // ロケット建設地
    BASE:         9,   // 人間基地
});

// ============================================================
// プレースホルダー色マップ（タイル画像が来るまでの仮表示）
// ============================================================
const TILE_COLORS = {
    [TILE.GRASS]:       "#4a7c59",
    [TILE.SOIL]:        "#8b6340",
    [TILE.TILLED_SOIL]: "#6b4226",
    [TILE.WATER]:       "#2a6fa8",
    [TILE.CLIFF]:       "#555566",
    [TILE.EMPTY]:       "transparent",
};

const OBJ_COLORS = {
    [OBJ.TREE]:        "#1a5e20",
    [OBJ.ROCK]:        "#78909c",
    [OBJ.ORE_COPPER]:  "#b87333",
    [OBJ.ORE_IRON]:    "#90a4ae",
    [OBJ.ORE_ENERGY]:  "#7e57c2",
    [OBJ.FLOWER]:      "#f48fb1",
    [OBJ.HOUSE]:       "#d4ac0d",
    [OBJ.ROCKET_SITE]: "#e67e22",
    [OBJ.BASE]:        "#c0392b",
};

// ============================================================
// マップ定数
// ============================================================
export const MAP_COLS    = 200;   // タイル列数
export const MAP_ROWS    = 200;   // タイル行数
export const TILE_SIZE   = 32;    // px
export const MAP_WIDTH   = MAP_COLS * TILE_SIZE;   // 6400px
export const MAP_HEIGHT  = MAP_ROWS * TILE_SIZE;   // 6400px

// ============================================================
// WorldMap クラス
// ============================================================
export default class WorldMap {

    /**
     * @param {Phaser.Scene} scene - このマップを所有するシーン
     */
    constructor(scene) {
        this.scene = scene;

        /** @type {number[][]} Layer1 地形タイル [row][col] */
        this.layer1 = [];

        /** @type {number[][]} Layer2 オブジェクト [row][col] */
        this.layer2 = [];

        /**
         * オブジェクト状態テーブル
         * キー: "row,col" / 値: { type, hp, respawnDay, removed }
         */
        this.objectStates = {};

        /** スポーン地点（家の前） */
        this.spawnPoint = { x: 0, y: 0 };

        /** 家の位置（タイル座標） */
        this.housePos = { row: 0, col: 0 };

        /** ロケット建設地（タイル座標） */
        this.rocketPos = { row: 0, col: 0 };

        /** 人間基地リスト [{ row, col }] */
        this.bases = [];

        /** 水域タイルセット（釣り・侵入不可） */
        this.waterTiles = new Set();

        /** グラフィックスオブジェクト（Phaser.GameObjects.Graphics） */
        this.graphics = null;

        /** 最後に描画したタイル範囲 */
        this._renderedBounds = null;

        /** オブジェクト変化などで再描画が必要かどうか */
        this._needsRedraw = true;

        /** カメラ端で描画欠けを防ぐための余白タイル数 */
        this._renderPaddingTiles = 2;

        // マップを生成・描画
        this._generateMap();
        this._setupCamera();
        this._drawMap();
        this._registerRenderUpdater();
    }

    // ----------------------------------------------------------
    // マップ生成
    // ----------------------------------------------------------

    /**
     * 手続き的にマップを生成する。
     * 将来 Tiled JSON に差し替える場合は本メソッドを置き換える。
     */
    _generateMap() {
        // 配列初期化（草で埋める）
        for (let r = 0; r < MAP_ROWS; r++) {
            this.layer1[r] = new Array(MAP_COLS).fill(TILE.GRASS);
            this.layer2[r] = new Array(MAP_COLS).fill(OBJ.NONE);
        }

        // --- 地形配置 ---
        this._placeBorder();       // 外周を崖にする
        this._placeCliffs();       // 北側山岳地帯
        this._placeRiver();        // 川（1本）
        this._placePonds();        // 池（2〜3か所）

        // --- オブジェクト配置 ---
        this._placeHouse();        // 家・ロケット建設地
        this._placeBases();        // 人間基地（3か所）
        this._placeForest();       // 森林（高密度）
        this._placeMountainOres(); // 鉱山（北側）
        this._placeFlowers();      // 花

        // 水域をSetに登録（コリジョン用）
        this._buildWaterSet();
    }

    /** 外周を崖で囲む */
    _placeBorder() {
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                if (r === 0 || r === MAP_ROWS - 1 || c === 0 || c === MAP_COLS - 1) {
                    this.layer1[r][c] = TILE.CLIFF;
                }
            }
        }
    }

    /** 北側に山岳地帯（崖）を配置 */
    _placeCliffs() {
        // 北側 rows 5〜25 に不規則な崖を配置
        const rng = this._seededRng(1001);
        for (let r = 5; r < 28; r++) {
            for (let c = 5; c < MAP_COLS - 5; c++) {
                // ノイズ的に崖を配置（北ほど密）
                const threshold = 0.35 - (r - 5) * 0.012;
                if (rng() < threshold) {
                    this.layer1[r][c] = TILE.CLIFF;
                }
            }
        }
    }

    /** 川を1本配置（南北に蛇行） */
    _placeRiver() {
        // 北〜南に蛇行する川（幅2〜3タイル）
        let col = 140; // 開始列
        for (let r = 28; r < MAP_ROWS - 3; r++) {
            // 蛇行
            const delta = Math.round(Math.sin(r * 0.15) * 2);
            col = Math.max(120, Math.min(160, col + delta));
            for (let w = 0; w < 3; w++) {
                if (col + w < MAP_COLS - 1) {
                    this.layer1[r][col + w] = TILE.WATER;
                }
            }
        }
    }

    /** 池を2〜3か所配置 */
    _placePonds() {
        const pondCenters = [
            { r: 80,  c: 60,  radius: 5 },
            { r: 150, c: 170, radius: 6 },
            { r: 60,  c: 160, radius: 4 },
        ];
        for (const pond of pondCenters) {
            this._fillCircle(pond.r, pond.c, pond.radius, TILE.WATER, "layer1");
        }
    }

    /** 家とロケット建設地を配置（マップ中央付近） */
    _placeHouse() {
        // 家: 行100 列100 付近（中央）
        const houseRow = 100;
        const houseCol = 95;
        this.housePos = { row: houseRow, col: houseCol };

        // 家の周囲を安全な草地に（強制上書き）
        this._fillRect(houseRow - 3, houseCol - 3, 12, 12, TILE.GRASS, "layer1");

        // 家オブジェクト配置
        this.layer2[houseRow][houseCol] = OBJ.HOUSE;
        this._setObjectState(houseRow, houseCol, { type: OBJ.HOUSE });

        // 土道（家〜ロケット建設地）
        for (let c = houseCol; c < houseCol + 8; c++) {
            this.layer1[houseRow + 1][c] = TILE.SOIL;
        }

        // ロケット建設地: 家の近く（右）
        const rocketRow = houseRow - 2;
        const rocketCol = houseCol + 8;
        this.rocketPos = { row: rocketRow, col: rocketCol };
        this.layer2[rocketRow][rocketCol] = OBJ.ROCKET_SITE;
        this._setObjectState(rocketRow, rocketCol, { type: OBJ.ROCKET_SITE });

        // スポーン地点（家の前）
        this.spawnPoint = {
            x: (houseCol + 1) * TILE_SIZE + TILE_SIZE / 2,
            y: (houseRow + 2) * TILE_SIZE + TILE_SIZE / 2,
        };
    }

    /** 人間基地を3か所配置 */
    _placeBases() {
        const basePositions = [
            { row: 30,  col: 30  },
            { row: 40,  col: 165 },
            { row: 170, col: 100 },
        ];

        for (const pos of basePositions) {
            // 基地周囲を草地に（安全確保）
            this._fillRect(pos.row - 5, pos.col - 5, 16, 16, TILE.GRASS, "layer1");

            // 基地オブジェクト配置
            this.layer2[pos.row][pos.col] = OBJ.BASE;
            this._setObjectState(pos.row, pos.col, { type: OBJ.BASE });
            this.bases.push({ row: pos.row, col: pos.col });
        }
    }

    /** 森林を全体に高密度配置（草地のみ） */
    _placeForest() {
        const rng = this._seededRng(2002);
        // 安全地帯（家周辺）は木を置かない
        const hR = this.housePos.row;
        const hC = this.housePos.col;

        for (let r = 1; r < MAP_ROWS - 1; r++) {
            for (let c = 1; c < MAP_COLS - 1; c++) {
                if (this.layer1[r][c] !== TILE.GRASS) continue;
                if (this.layer2[r][c] !== OBJ.NONE)  continue;
                // 家周辺 15タイル圏内は木なし
                if (Math.abs(r - hR) < 15 && Math.abs(c - hC) < 15) continue;
                // 基地周辺 10タイルは木なし
                if (this._isNearBase(r, c, 10)) continue;

                if (rng() < 0.22) {
                    this.layer2[r][c] = OBJ.TREE;
                    this._setObjectState(r, c, { type: OBJ.TREE, hp: 5, respawnDay: -1, removed: false });
                } else if (rng() < 0.04) {
                    this.layer2[r][c] = OBJ.FLOWER;
                    this._setObjectState(r, c, { type: OBJ.FLOWER, hp: 1, respawnDay: -1, removed: false });
                }
            }
        }
    }

    /** 北側鉱山に岩・鉱石を配置 */
    _placeMountainOres() {
        const rng = this._seededRng(3003);
        // 北側（崖地帯の端から下 rows 26〜50）の草地に岩・鉱石
        for (let r = 26; r < 55; r++) {
            for (let c = 5; c < MAP_COLS - 5; c++) {
                if (this.layer1[r][c] !== TILE.GRASS) continue;
                if (this.layer2[r][c] !== OBJ.NONE)  continue;

                const roll = rng();
                if (roll < 0.15) {
                    this.layer2[r][c] = OBJ.ROCK;
                    this._setObjectState(r, c, { type: OBJ.ROCK, hp: 8, respawnDay: -1, removed: false });
                } else if (roll < 0.20) {
                    const oreType = this._randomOre(rng);
                    this.layer2[r][c] = oreType;
                    this._setObjectState(r, c, { type: oreType, hp: 3, respawnDay: -1, removed: false });
                }
            }
        }
    }

    /** 花を全体に散りばめる */
    _placeFlowers() {
        const rng = this._seededRng(4004);
        for (let r = 1; r < MAP_ROWS - 1; r++) {
            for (let c = 1; c < MAP_COLS - 1; c++) {
                if (this.layer1[r][c] !== TILE.GRASS) continue;
                if (this.layer2[r][c] !== OBJ.NONE)  continue;
                if (rng() < 0.015) {
                    this.layer2[r][c] = OBJ.FLOWER;
                    this._setObjectState(r, c, { type: OBJ.FLOWER, hp: 1, respawnDay: -1, removed: false });
                }
            }
        }
    }

    /** 水域タイルをSetに登録 */
    _buildWaterSet() {
        this.waterTiles.clear();
        for (let r = 0; r < MAP_ROWS; r++) {
            for (let c = 0; c < MAP_COLS; c++) {
                if (this.layer1[r][c] === TILE.WATER) {
                    this.waterTiles.add(`${r},${c}`);
                }
            }
        }
    }

    // ----------------------------------------------------------
    // 描画
    // ----------------------------------------------------------

    /** マップをGraphicsで描画（プレースホルダー） */
    _drawMap(bounds = this._getVisibleTileBounds()) {
        const scene = this.scene;

        // Graphicsオブジェクトをシーンに追加
        if (!this.graphics) {
            this.graphics = scene.add.graphics();
        }
        this.graphics.clear();

        const minX = bounds.startCol * TILE_SIZE;
        const minY = bounds.startRow * TILE_SIZE;
        const width = (bounds.endCol - bounds.startCol + 1) * TILE_SIZE;
        const height = (bounds.endRow - bounds.startRow + 1) * TILE_SIZE;

        // Layer0: 宇宙背景（グラデーション風の単色）
        this.graphics.fillStyle(0x0a0a1a, 1);
        this.graphics.fillRect(minX, minY, width, height);

        // Layer1: 地形タイルを描画
        for (let r = bounds.startRow; r <= bounds.endRow; r++) {
            for (let c = bounds.startCol; c <= bounds.endCol; c++) {
                const tileId = this.layer1[r][c];
                if (tileId === TILE.EMPTY) continue;
                const color = TILE_COLORS[tileId] ?? "#ff00ff";
                this.graphics.fillStyle(
                    parseInt(color.replace("#", "0x")), 1
                );
                this.graphics.fillRect(
                    c * TILE_SIZE, r * TILE_SIZE, TILE_SIZE, TILE_SIZE
                );
            }
        }

        // Layer1: グリッドライン（デバッグ補助・薄く）
        // ※ 画像タイル導入後は削除してよい
        this.graphics.lineStyle(0.5, 0x333344, 0.15);
        for (let r = bounds.startRow; r <= bounds.endRow + 1; r++) {
            const y = r * TILE_SIZE;
            this.graphics.lineBetween(minX, y, minX + width, y);
        }
        for (let c = bounds.startCol; c <= bounds.endCol + 1; c++) {
            const x = c * TILE_SIZE;
            this.graphics.lineBetween(x, minY, x, minY + height);
        }

        // Layer2: オブジェクト描画
        this._drawObjects(bounds);

        // Layer4: 前景（崖の上端などオーバーレイ）
        this._drawForeground(bounds);

        this._renderedBounds = bounds;
        this._needsRedraw = false;
    }

    /** Layer2 オブジェクトをGraphicsで描画 */
    _drawObjects(bounds) {
        for (let r = bounds.startRow; r <= bounds.endRow; r++) {
            for (let c = bounds.startCol; c <= bounds.endCol; c++) {
                const objId = this.layer2[r][c];
                if (objId === OBJ.NONE) continue;

                const state = this.objectStates[`${r},${c}`];
                if (state && state.removed) continue;

                const color = OBJ_COLORS[objId] ?? "#ff00ff";
                this.graphics.fillStyle(
                    parseInt(color.replace("#", "0x")), 0.92
                );

                const x = c * TILE_SIZE;
                const y = r * TILE_SIZE;
                const s = TILE_SIZE;

                // オブジェクト種別で形状を変える（視認性向上）
                switch (objId) {
                    case OBJ.TREE:
                        // 丸い木
                        this.graphics.fillCircle(x + s / 2, y + s / 2, s * 0.45);
                        break;
                    case OBJ.ROCK:
                        // 六角形風（三角+矩形）
                        this.graphics.fillTriangle(
                            x + s * 0.5, y + s * 0.1,
                            x + s * 0.1, y + s * 0.9,
                            x + s * 0.9, y + s * 0.9
                        );
                        break;
                    case OBJ.ORE_COPPER:
                    case OBJ.ORE_IRON:
                    case OBJ.ORE_ENERGY:
                        // 菱形
                        this.graphics.fillTriangle(
                            x + s / 2, y + s * 0.1,
                            x + s * 0.1, y + s / 2,
                            x + s / 2, y + s * 0.9
                        );
                        this.graphics.fillTriangle(
                            x + s / 2, y + s * 0.1,
                            x + s * 0.9, y + s / 2,
                            x + s / 2, y + s * 0.9
                        );
                        break;
                    case OBJ.FLOWER:
                        this.graphics.fillCircle(x + s / 2, y + s / 2, s * 0.25);
                        break;
                    case OBJ.HOUSE:
                        // 家型（矩形＋三角屋根）
                        this.graphics.fillRect(x + s * 0.1, y + s * 0.4, s * 0.8, s * 0.55);
                        this.graphics.fillTriangle(
                            x + s / 2, y + s * 0.05,
                            x + s * 0.05, y + s * 0.45,
                            x + s * 0.95, y + s * 0.45
                        );
                        break;
                    case OBJ.ROCKET_SITE:
                        // ロケット形（矩形＋上部三角）
                        this.graphics.fillRect(x + s * 0.35, y + s * 0.35, s * 0.3, s * 0.6);
                        this.graphics.fillTriangle(
                            x + s / 2,      y + s * 0.05,
                            x + s * 0.25,   y + s * 0.4,
                            x + s * 0.75,   y + s * 0.4
                        );
                        break;
                    case OBJ.BASE:
                        // 基地（二重矩形）
                        this.graphics.fillStyle(0xc0392b, 0.8);
                        this.graphics.fillRect(x + s * 0.05, y + s * 0.05, s * 0.9, s * 0.9);
                        this.graphics.fillStyle(0xe74c3c, 0.6);
                        this.graphics.fillRect(x + s * 0.25, y + s * 0.25, s * 0.5, s * 0.5);
                        break;
                    default:
                        this.graphics.fillRect(x + s * 0.2, y + s * 0.2, s * 0.6, s * 0.6);
                }
            }
        }
    }

    /** Layer4 前景（崖の上端に帯を描いて立体感） */
    _drawForeground(bounds) {
        this.graphics.lineStyle(2, 0x333344, 0.4);
        const startRow = Math.max(1, bounds.startRow);
        for (let r = startRow; r <= bounds.endRow; r++) {
            for (let c = bounds.startCol; c <= bounds.endCol; c++) {
                if (this.layer1[r][c] === TILE.CLIFF &&
                    this.layer1[r - 1][c] !== TILE.CLIFF) {
                    // 崖上端に影線
                    this.graphics.lineBetween(
                        c * TILE_SIZE, r * TILE_SIZE,
                        (c + 1) * TILE_SIZE, r * TILE_SIZE
                    );
                }
            }
        }
    }

    /** カメラ移動・状態変化に応じて表示範囲だけを再描画する */
    _registerRenderUpdater() {
        this.scene.events.on("update", this._updateVisibleRender, this);
        this.scene.events.once("shutdown", () => {
            this.scene.events.off("update", this._updateVisibleRender, this);
        });
        this.scene.events.once("destroy", () => {
            this.scene.events.off("update", this._updateVisibleRender, this);
        });
    }

    /** 表示中のタイル範囲が変わった時だけGraphicsを更新する */
    _updateVisibleRender() {
        const bounds = this._getVisibleTileBounds();
        if (!this._needsRedraw && this._sameBounds(bounds, this._renderedBounds)) {
            return;
        }
        this._drawMap(bounds);
    }

    /** 現在のカメラに映るタイル範囲を返す */
    _getVisibleTileBounds() {
        const camera = this.scene.cameras.main;
        const padding = this._renderPaddingTiles;
        const startCol = Math.max(0, Math.floor(camera.scrollX / TILE_SIZE) - padding);
        const startRow = Math.max(0, Math.floor(camera.scrollY / TILE_SIZE) - padding);
        const endCol = Math.min(
            MAP_COLS - 1,
            Math.ceil((camera.scrollX + camera.width) / TILE_SIZE) + padding
        );
        const endRow = Math.min(
            MAP_ROWS - 1,
            Math.ceil((camera.scrollY + camera.height) / TILE_SIZE) + padding
        );

        return { startRow, endRow, startCol, endCol };
    }

    /** 2つの描画範囲が同じかどうか */
    _sameBounds(a, b) {
        return !!a && !!b &&
            a.startRow === b.startRow &&
            a.endRow === b.endRow &&
            a.startCol === b.startCol &&
            a.endCol === b.endCol;
    }

    // ----------------------------------------------------------
    // カメラ
    // ----------------------------------------------------------

    /** ワールドサイズとカメラ境界を設定 */
    _setupCamera() {
        const scene = this.scene;
        // Phaser のワールド境界を設定（プレイヤーのコリジョン等にも使われる）
        scene.physics.world.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
        // カメラがワールド外に出ないよう制限
        scene.cameras.main.setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT);
    }

    /**
     * カメラをターゲット（プレイヤー）に追従させる。
     * Phaser の startFollow を使う場合はシーン側で呼ぶこと。
     * @param {Phaser.GameObjects.GameObject} target
     */
    followCamera(target) {
        this.scene.cameras.main.startFollow(target, true, 0.1, 0.1);
    }

    // ----------------------------------------------------------
    // オブジェクト状態管理
    // ----------------------------------------------------------

    /**
     * オブジェクトを除去する（伐採・採掘など）。
     * respawnDay が設定されている場合は time.js から呼び戻す。
     * @param {number} row
     * @param {number} col
     * @param {number} currentDay - 現在の日数（復活計算用）
     */
    removeObject(row, col, currentDay) {
        const key = `${row},${col}`;
        const state = this.objectStates[key];
        if (!state || state.removed) return;

        state.removed = true;

        // 復活日を設定
        if (state.type === OBJ.TREE) {
            state.respawnDay = currentDay + 3;
        } else if (state.type === OBJ.ROCK) {
            state.respawnDay = currentDay + 5;
        }
        // Layer2 からも除去
        this.layer2[row][col] = OBJ.NONE;

        // 再描画
        this._redrawTile(row, col);
    }

    /**
     * 日数チェックして復活すべきオブジェクトを戻す。
     * time.js の onDayChange() から呼ぶこと。
     * @param {number} currentDay
     */
    checkRespawn(currentDay) {
        for (const key in this.objectStates) {
            const state = this.objectStates[key];
            if (!state.removed) continue;
            if (state.respawnDay > 0 && currentDay >= state.respawnDay) {
                const [r, c] = key.split(",").map(Number);
                state.removed = false;
                state.respawnDay = -1;
                this.layer2[r][c] = state.type;
                this._redrawTile(r, c);
            }
        }
    }

    /**
     * 指定タイルのみ再描画（差分更新用）。
     * @param {number} row
     * @param {number} col
     */
    _redrawTile(row, col) {
        // Graphicsは表示中の範囲だけを次のupdateでまとめて再描画する。
        this._needsRedraw = true;
    }

    // ----------------------------------------------------------
    // 昼夜演出
    // ----------------------------------------------------------

    /**
     * 昼夜の明るさをカメラのポストFXで表現する。
     * time.js から呼ばれる。
     * @param {number} normalizedTime - 0.0（深夜）〜 1.0（正午）
     * @param {boolean} isNight
     */
    applyDayNightEffect(normalizedTime, isNight) {
        const camera = this.scene.cameras.main;
        if (isNight) {
            // 夜: 画面を暗くする
            const alpha = 0.4 + 0.2 * normalizedTime; // 0.4〜0.6
            camera.setAlpha(alpha);
        } else {
            // 昼: 通常
            camera.setAlpha(1.0);
        }
    }

    // ----------------------------------------------------------
    // 座標変換ユーティリティ
    // ----------------------------------------------------------

    /**
     * ピクセル座標 → タイル座標
     * @param {number} px
     * @param {number} py
     * @returns {{ row: number, col: number }}
     */
    pixelToTile(px, py) {
        return {
            col: Math.floor(px / TILE_SIZE),
            row: Math.floor(py / TILE_SIZE),
        };
    }

    /**
     * タイル座標 → ピクセル座標（タイル中心）
     * @param {number} row
     * @param {number} col
     * @returns {{ x: number, y: number }}
     */
    tileToPixel(row, col) {
        return {
            x: col * TILE_SIZE + TILE_SIZE / 2,
            y: row * TILE_SIZE + TILE_SIZE / 2,
        };
    }

    /**
     * 指定タイルが歩行可能かどうか。
     * @param {number} row
     * @param {number} col
     * @returns {boolean}
     */
    isWalkable(row, col) {
        if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) return false;
        const tile = this.layer1[row][col];
        if (tile === TILE.WATER || tile === TILE.CLIFF) return false;
        const obj = this.layer2[row][col];
        const state = this.objectStates[`${row},${col}`];
        const objRemoved = state ? state.removed : false;
        if (!objRemoved && (obj === OBJ.TREE || obj === OBJ.ROCK ||
            obj === OBJ.ORE_COPPER || obj === OBJ.ORE_IRON ||
            obj === OBJ.ORE_ENERGY || obj === OBJ.HOUSE || obj === OBJ.BASE)) {
            return false;
        }
        return true;
    }

    /**
     * スポーン地点（家の前）のピクセル座標を返す。
     * @returns {{ x: number, y: number }}
     */
    getSpawnPoint() {
        return { ...this.spawnPoint };
    }

    /**
     * 人間基地リストを返す。
     * @returns {Array<{ row: number, col: number }>}
     */
    getBases() {
        return this.bases;
    }

    /**
     * 家のピクセル座標（中心）を返す。
     * @returns {{ x: number, y: number }}
     */
    getHousePixel() {
        return this.tileToPixel(this.housePos.row, this.housePos.col);
    }

    // ----------------------------------------------------------
    // 内部ヘルパー
    // ----------------------------------------------------------

    /** 矩形範囲を指定タイルで塗りつぶす */
    _fillRect(startRow, startCol, height, width, tileId, layer) {
        for (let r = startRow; r < startRow + height; r++) {
            for (let c = startCol; c < startCol + width; c++) {
                if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) continue;
                this[layer][r][c] = tileId;
            }
        }
    }

    /** 円形範囲を指定タイルで塗りつぶす */
    _fillCircle(centerRow, centerCol, radius, tileId, layer) {
        for (let r = centerRow - radius; r <= centerRow + radius; r++) {
            for (let c = centerCol - radius; c <= centerCol + radius; c++) {
                if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) continue;
                const dr = r - centerRow;
                const dc = c - centerCol;
                if (dr * dr + dc * dc <= radius * radius) {
                    this[layer][r][c] = tileId;
                }
            }
        }
    }

    /** 指定座標が基地の近く（radius タイル以内）かどうか */
    _isNearBase(row, col, radius) {
        for (const base of this.bases) {
            const dr = row - base.row;
            const dc = col - base.col;
            if (Math.abs(dr) < radius && Math.abs(dc) < radius) return true;
        }
        return false;
    }

    /** オブジェクト状態をテーブルに登録 */
    _setObjectState(row, col, state) {
        this.objectStates[`${row},${col}`] = {
            type: OBJ.NONE,
            hp: 0,
            respawnDay: -1,
            removed: false,
            ...state,
        };
    }

    /** ランダム鉱石タイプを返す */
    _randomOre(rng) {
        const roll = rng();
        if (roll < 0.5) return OBJ.ORE_COPPER;
        if (roll < 0.8) return OBJ.ORE_IRON;
        return OBJ.ORE_ENERGY;
    }

    /**
     * シードつき疑似乱数（再現性のあるマップ生成のため）
     * @param {number} seed
     * @returns {() => number} 0〜1 の乱数関数
     */
    _seededRng(seed) {
        let s = seed;
        return () => {
            s = (s * 1664525 + 1013904223) & 0xffffffff;
            return (s >>> 0) / 0xffffffff;
        };
    }
}
