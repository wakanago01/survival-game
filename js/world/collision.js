/**
 * collision.js
 * 責務: タイル・オブジェクトの当たり判定・基地戦闘エリア検知・水域釣り判定
 *
 * 当たり判定対象: 木・岩・崖・水・家・基地
 * 基地中心から約8タイルで戦闘エリアフラグを返す。
 * 水域は侵入不可・釣り判定のみ許可。
 *
 * 使い方（PlanetScene 等から）:
 *   import CollisionManager from "./world/collision.js";
 *   this.collision = new CollisionManager(this.worldMap);
 *
 *   // 移動前チェック
 *   if (this.collision.canMove(nextX, nextY)) { ... }
 *
 *   // 戦闘エリア確認
 *   const info = this.collision.checkCombatZone(playerX, playerY);
 *   if (info.inCombat) { ... }
 *
 *   // 釣り可能確認
 *   if (this.collision.canFish(playerX, playerY, direction)) { ... }
 */

import { TILE, OBJ, MAP_COLS, MAP_ROWS, TILE_SIZE } from "./map.js";

// 基地の戦闘エリア半径（タイル単位）
const COMBAT_ZONE_RADIUS = 8;

// ロケットパーツ設置判定半径（タイル単位）
const ROCKET_INTERACT_RADIUS = 2;

export default class CollisionManager {

    /**
     * @param {import("./map.js").default} worldMap - WorldMap インスタンス
     */
    constructor(worldMap) {
        /** @type {import("./map.js").default} */
        this.worldMap = worldMap;
    }

    // ----------------------------------------------------------
    // 移動可否判定
    // ----------------------------------------------------------

    /**
     * 指定ピクセル座標へ移動できるかどうか。
     * プレイヤーの当たり判定ボックス（幅・高さ）を考慮する。
     *
     * @param {number} px - 移動後の中心 X ピクセル座標
     * @param {number} py - 移動後の中心 Y ピクセル座標
     * @param {number} [halfW=12] - プレイヤー当たり半幅
     * @param {number} [halfH=12] - プレイヤー当たり半高
     * @returns {boolean}
     */
    canMove(px, py, halfW = 12, halfH = 12) {
        // 4隅のタイルをすべてチェック
        const corners = [
            { x: px - halfW, y: py - halfH },
            { x: px + halfW, y: py - halfH },
            { x: px - halfW, y: py + halfH },
            { x: px + halfW, y: py + halfH },
        ];

        for (const corner of corners) {
            const tile = this._pixelToTile(corner.x, corner.y);
            if (!this.worldMap.isWalkable(tile.row, tile.col)) {
                return false;
            }
        }
        return true;
    }

    /**
     * 指定ピクセル座標が水域かどうか（釣り判定用）。
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    isWater(px, py) {
        const tile = this._pixelToTile(px, py);
        return this._getTile1(tile.row, tile.col) === TILE.WATER;
    }

    /**
     * 指定ピクセル座標が崖かどうか。
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    isCliff(px, py) {
        const tile = this._pixelToTile(px, py);
        return this._getTile1(tile.row, tile.col) === TILE.CLIFF;
    }

    /**
     * 指定ピクセル座標が家かどうか（出入り判定）。
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    isNearHouse(px, py) {
        const playerTile = this._pixelToTile(px, py);
        const houseTile  = this.worldMap.housePos;
        const dr = Math.abs(playerTile.row - houseTile.row);
        const dc = Math.abs(playerTile.col - houseTile.col);
        // 家から2タイル以内
        return dr <= 2 && dc <= 2;
    }

    // ----------------------------------------------------------
    // インタラクト判定
    // ----------------------------------------------------------

    /**
     * プレイヤーの向き方向1タイル先にあるオブジェクトを取得する。
     * 採掘・伐採・採取などのインタラクト時に使う。
     *
     * @param {number} px - プレイヤー中心 X
     * @param {number} py - プレイヤー中心 Y
     * @param {"up"|"down"|"left"|"right"} direction
     * @returns {{ row: number, col: number, objId: number, state: object|null } | null}
     */
    getInteractTarget(px, py, direction) {
        const origin = this._pixelToTile(px, py);
        let targetRow = origin.row;
        let targetCol = origin.col;

        switch (direction) {
            case "up":    targetRow -= 1; break;
            case "down":  targetRow += 1; break;
            case "left":  targetCol -= 1; break;
            case "right": targetCol += 1; break;
        }

        if (targetRow < 0 || targetRow >= MAP_ROWS ||
            targetCol < 0 || targetCol >= MAP_COLS) {
            return null;
        }

        const objId = this.worldMap.layer2[targetRow][targetCol];
        const state = this.worldMap.objectStates[`${targetRow},${targetCol}`] ?? null;

        if (objId === OBJ.NONE) return null;
        if (state && state.removed) return null;

        return { row: targetRow, col: targetCol, objId, state };
    }

    // ----------------------------------------------------------
    // 基地戦闘エリア判定
    // ----------------------------------------------------------

    /**
     * プレイヤーが基地の戦闘エリア（中心から約8タイル）内にいるか確認する。
     * 基地周囲 8タイルは「戦闘エリア」フラグをtrueにして返す。
     *
     * @param {number} px - プレイヤー中心 X
     * @param {number} py - プレイヤー中心 Y
     * @returns {{ inCombat: boolean, baseIndex: number, distanceTiles: number }}
     *   inCombat    - 戦闘エリア内かどうか
     *   baseIndex   - 最近接基地のインデックス（-1 = 圏外）
     *   distanceTiles - 最近接基地までのタイル距離
     */
    checkCombatZone(px, py) {
        const playerTile = this._pixelToTile(px, py);
        const bases = this.worldMap.getBases();

        let minDist     = Infinity;
        let minIdx      = -1;

        for (let i = 0; i < bases.length; i++) {
            const base = bases[i];
            const dr = playerTile.row - base.row;
            const dc = playerTile.col - base.col;
            const dist = Math.sqrt(dr * dr + dc * dc); // チェビシェフでなくユークリッド
            if (dist < minDist) {
                minDist = dist;
                minIdx  = i;
            }
        }

        const inCombat = minDist <= COMBAT_ZONE_RADIUS;

        return {
            inCombat,
            baseIndex:      inCombat ? minIdx : -1,
            distanceTiles:  Math.floor(minDist),
        };
    }

    // ----------------------------------------------------------
    // 釣り判定
    // ----------------------------------------------------------

    /**
     * プレイヤーの向き方向1〜2タイル先に水があれば釣り可能とみなす。
     *
     * @param {number} px
     * @param {number} py
     * @param {"up"|"down"|"left"|"right"} direction
     * @returns {boolean}
     */
    canFish(px, py, direction) {
        const origin = this._pixelToTile(px, py);

        for (let dist = 1; dist <= 2; dist++) {
            let r = origin.row;
            let c = origin.col;
            switch (direction) {
                case "up":    r -= dist; break;
                case "down":  r += dist; break;
                case "left":  c -= dist; break;
                case "right": c += dist; break;
            }
            if (r < 0 || r >= MAP_ROWS || c < 0 || c >= MAP_COLS) continue;
            if (this._getTile1(r, c) === TILE.WATER) return true;
        }
        return false;
    }

    // ----------------------------------------------------------
    // 耕作・建築判定
    // ----------------------------------------------------------

    /**
     * 指定ピクセル座標が耕作可能（草地）かどうか。
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    isTillable(px, py) {
        const tile = this._pixelToTile(px, py);
        return this._getTile1(tile.row, tile.col) === TILE.GRASS &&
               this.worldMap.layer2[tile.row][tile.col] === OBJ.NONE;
    }

    /**
     * 指定ピクセル座標に建築可能（草または耕した土）かどうか。
     * @param {number} px
     * @param {number} py
     * @returns {boolean}
     */
    isBuildable(px, py) {
        const tile = this._pixelToTile(px, py);
        const t = this._getTile1(tile.row, tile.col);
        return (t === TILE.GRASS || t === TILE.TILLED_SOIL) &&
               this.worldMap.layer2[tile.row][tile.col] === OBJ.NONE;
    }

    // ----------------------------------------------------------
    // 内部ヘルパー
    // ----------------------------------------------------------

    /**
     * ピクセル座標 → タイル座標（境界クランプ付き）
     * @param {number} px
     * @param {number} py
     * @returns {{ row: number, col: number }}
     */
    _pixelToTile(px, py) {
        return {
            col: Math.max(0, Math.min(MAP_COLS - 1, Math.floor(px / TILE_SIZE))),
            row: Math.max(0, Math.min(MAP_ROWS - 1, Math.floor(py / TILE_SIZE))),
        };
    }

    /**
     * Layer1 タイルIDを取得（範囲外は CLIFF 扱い）
     * @param {number} row
     * @param {number} col
     * @returns {number}
     */
    _getTile1(row, col) {
        if (row < 0 || row >= MAP_ROWS || col < 0 || col >= MAP_COLS) {
            return TILE.CLIFF; // 境界外は侵入不可
        }
        return this.worldMap.layer1[row][col];
    }
}
