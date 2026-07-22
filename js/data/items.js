/**
 * @file items.js
 * @brief アイテムデータの定義、および検索用ヘルパー関数を提供するモジュール
 * @note ES6 Modules形式。将来の農業・釣り・クラフト・戦闘などの拡張に対応可能な設計。
 */

// =========================================================================
// 1. アイテムのカテゴリ定義（将来の拡張を見据えた分類）
// =========================================================================
export const ITEM_CATEGORY = Object.freeze({
    MATERIAL: 'material',     // クラフト・採掘用素材（鉱石、貝殻など）
    CONSUMABLE: 'consumable', // 消費アイテム（食べ物、HP回復薬など）
    TOOL: 'tool',             // 道具（懐中電灯、ツルハシ、釣り竿など）
    SEED: 'seed',             // 農業用の種
    EQUIPMENT: 'equipment',   // 戦闘用装備（武器・防具）
    QUEST: 'quest',           // ロケット部品など重要アイテム
});

// =========================================================================
// 2. アイテムマスターデータ（データベース）
// =========================================================================
const ITEM_MASTER = Object.freeze({
    // --- Version1用：基本・回復アイテム ---
    'alien_herb': {
        id: 'alien_herb',
        name: '未知の薬草',
        description: '主人公の故郷に生えていた薬草に似た草。HPを20回復する。',
        imagePath: 'assets/images/items/alien_herb.png',
        category: ITEM_CATEGORY.CONSUMABLE,
        stackable: true,
        maxStack: 99,
        price: 10,
        effects: {
            hpRecovery: 20,
        }
    },
    'ration_pack': {
        id: 'ration_pack',
        name: '地球人の配給食',
        description: '地球人のキャンプから拝借した保存食。HPを50回復する。',
        imagePath: 'assets/images/items/ration_pack.png',
        category: ITEM_CATEGORY.CONSUMABLE,
        stackable: true,
        maxStack: 99,
        price: 35,
        effects: {
            hpRecovery: 50,
        }
    },

    // --- 素材・収集アイテム ---
    'koseki_lightblue': {
        id: 'koseki_lightblue',
        name: '水色の鉱石',
        description: 'ほのかに光る水色の綺麗な鉱石。クラフト素材や換金に使える。',
        imagePath: 'assets/images/items/koseki_lightblue.png',
        category: ITEM_CATEGORY.MATERIAL,
        stackable: true,
        maxStack: 99,
        price: 50,
    },
    'kaigara_makigai': {
        id: 'kaigara_makigai',
        name: '紫の巻貝',
        description: '海岸で拾える不思議な模様の巻貝。',
        imagePath: 'assets/images/items/kaigara_makigai_02_purple.png',
        category: ITEM_CATEGORY.MATERIAL,
        stackable: true,
        maxStack: 99,
        price: 15,
    },
    'kaigara_nimaigai': {
        id: 'kaigara_nimaigai',
        name: '青い二枚貝',
        description: '青く澄んだきれいな二枚貝。',
        imagePath: 'assets/images/items/kaigara_nimaigai_blue.png',
        category: ITEM_CATEGORY.MATERIAL,
        stackable: true,
        maxStack: 99,
        price: 15,
    },
    'sango_green': {
        id: 'sango_green',
        name: '緑のサンゴ',
        description: '鮮やかな緑色のサンゴ。珍しい素材。',
        imagePath: 'assets/images/items/sango_green.png',
        category: ITEM_CATEGORY.MATERIAL,
        stackable: true,
        maxStack: 99,
        price: 30,
    },
    'jewelry_round': {
        id: 'jewelry_round',
        name: '丸い宝石',
        description: '輝く球体の宝石。非常に高値で売却できる。',
        imagePath: 'assets/images/items/jewelry_round.png',
        category: ITEM_CATEGORY.MATERIAL,
        stackable: true,
        maxStack: 99,
        price: 300,
    },

    // --- 道具・ライト ---
    'kaichudento_red': {
        id: 'kaichudento_red',
        name: '赤い懐中電灯',
        description: '暗い夜や洞窟を照らすための探索用ライト。',
        imagePath: 'assets/images/items/kaichudento_01_red.png',
        category: ITEM_CATEGORY.TOOL,
        stackable: false,
        maxStack: 1,
        price: 150,
        toolType: 'light',
    },

    // --- 武器・防具（将来の戦闘用拡張） ---
    'tsurugi_bronze': {
        id: 'tsurugi_bronze',
        name: 'ブロンズソード',
        description: '青銅で作られた剣。近接攻撃ができる。',
        imagePath: 'assets/images/items/tsurugi_bronze.png',
        category: ITEM_CATEGORY.EQUIPMENT,
        stackable: false,
        maxStack: 1,
        price: 200,
        stats: { attack: 15 } // 攻撃力パラメータ
    },
    'shield_kiteshield': {
        id: 'shield_kiteshield',
        name: 'カイトシールド',
        description: '敵の攻撃を防ぐ頑丈な大きな盾。',
        imagePath: 'assets/images/items/shield_kiteshield.png',
        category: ITEM_CATEGORY.EQUIPMENT,
        stackable: false,
        maxStack: 1,
        price: 180,
        stats: { defense: 10 } // 防御力パラメータ
    },
    'yumi': {
        id: 'yumi',
        name: '木の弓',
        description: '遠くの敵を攻撃できる弓。',
        imagePath: 'assets/images/items/yumi.png',
        category: ITEM_CATEGORY.EQUIPMENT,
        stackable: false,
        maxStack: 1,
        price: 220,
        stats: { attack: 12, range: 5 } // 攻撃力・射程パラメータ
    }
});

// =========================================================================
// 3. 他の担当者が利用するデータ操作用ヘルパー関数（API）
// =========================================================================

/**
 * IDからアイテムのマスターデータを取得する
 * @param {string} id - アイテムID
 * @returns {Object|null} アイテムデータ。存在しない場合はnull
 */
export function getItemById(id) {
    const item = ITEM_MASTER[id];
    if (!item) {
        console.warn(`Item ID "${id}" は見つかりませんでした。`);
        return null;
    }
    return JSON.parse(JSON.stringify(item));
}

/**
 * 特定のカテゴリに属するアイテムをすべて取得する
 * @param {string} category - ITEM_CATEGORYの値
 * @returns {Array<Object>} アイテムデータの配列
 */
export function getItemsByCategory(category) {
    return Object.values(ITEM_MASTER)
        .filter(item => item.category === category)
        .map(item => JSON.parse(JSON.stringify(item)));
}

/**
 * 全アイテムのマスターデータを取得する
 * @returns {Object} アイテムマスターオブジェクト
 */
export function getAllItems() {
    return JSON.parse(JSON.stringify(ITEM_MASTER));
}