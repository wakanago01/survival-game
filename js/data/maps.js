/**
 * maps.js
 * ゲーム内の各マップ（エリア）のデータ構造と配置データを管理するファイル
 */

export const MAPS = {
    home: {
        id: "home",
        name: "自宅",
        width: 20,  // タイル数での横幅
        height: 15, // タイル数での縦幅
        spawnPoint: { x: 10, y: 7 }, // プレイヤーの初期スポーン位置
        objects: [
            { id: "bed_01", type: "furniture", x: 3, y: 4, interactable: true },
            { id: "craft_bench", type: "station", x: 5, y: 4, interactable: true }
        ]
    },
    farm: {
        id: "farm",
        name: "農場",
        width: 40,
        height: 40,
        spawnPoint: { x: 5, y: 20 },
        objects: [
            { id: "water_well", type: "structure", x: 12, y: 10, interactable: true }
            // ここに耕した土タイルやスプリンクラーなどのデータを動的に追加可能
        ]
    },
    forest: {
        id: "forest",
        name: "森",
        width: 50,
        height: 50,
        spawnPoint: { x: 2, y: 25 },
        objects: [
            { id: "tree_alien", type: "tree", x: 10, y: 15, hp: 3 },
            { id: "tree_alien", type: "tree", x: 12, y: 18, hp: 3 }
        ]
    },
    lake: {
        id: "lake",
        name: "湖",
        width: 40,
        height: 40,
        spawnPoint: { x: 20, y: 38 },
        objects: [
            { id: "fishing_pier", type: "structure", x: 20, y: 20, interactable: true }
        ]
    },
    mine: {
        id: "mine",
        name: "鉱山",
        width: 60,
        height: 60,
        spawnPoint: { x: 5, y: 5 },
        objects: [
            { id: "iron_node", type: "ore", x: 15, y: 20, hp: 5 },
            { id: "diamond_node", type: "ore", x: 45, y: 50, hp: 8 }
        ]
    },
    earthling_base: {
        id: "earthling_base",
        name: "地球人基地（戦闘エリア）",
        width: 80,
        height: 80,
        spawnPoint: { x: 40, y: 75 },
        objects: [
            { id: "laser_turret", type: "enemy_structure", x: 30, y: 40, hp: 50 },
            { id: "loot_chest_rocket", type: "chest", x: 40, y: 10, interactable: true }
        ]
    }
};

/**
 * 便利関数：特定のマップにオブジェクトを動的に追加する
 * （例：player.js や map.js から、木を植えたり家具を置いたりした時用）
 */
export function addObjectToMap(mapId, newObject) {
    if (MAPS[mapId]) {
        MAPS[mapId].objects.push(newObject);
        return true;
    }
    return false;
}