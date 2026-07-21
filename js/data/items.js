/**
 * items.js
 * ゲームに登場するすべてのアイテムデータを管理するマスターデータ
 */

// 1. 作物
const crops = {
    "alien_potato": { id: "alien_potato", name: "エイリアンポテト", type: "crop", description: "主食に最適な青いジャガイモ。", price: 30, sellPrice: 15, stack: 99, rarity: "C" },
    "space_tomato": { id: "space_tomato", name: "スペーストマト", type: "crop", description: "ビタミン豊富な光るトマト。", price: 50, sellPrice: 25, stack: 99, rarity: "C" }
};

// 2. 種
const seeds = {
    "potato_seed": { id: "potato_seed", name: "ポテトの種", type: "seed", description: "エイリアンポテトの種。", price: 10, sellPrice: 5, stack: 99, rarity: "C" },
    "tomato_seed": { id: "tomato_seed", name: "トマトの種", type: "seed", description: "スペーストマトの種。", price: 15, sellPrice: 7, stack: 99, rarity: "C" }
};

// 3. 魚
const fishes = {
    "cosmo_salmon": { id: "cosmo_salmon", name: "コスモサーモン", type: "fish", description: "宇宙の川を泳ぐ美しい鮭。", price: 80, sellPrice: 40, stack: 99, rarity: "B" },
    "nebula_eel": { id: "nebula_eel", name: "ネブラウナギ", type: "fish", description: "夜の湖で妖しく光るウナギ。美味。", price: 200, sellPrice: 100, stack: 99, rarity: "A" }
};

// 4. 鉱石
const minerals = {
    "iron_ore": { id: "iron_ore", name: "鉄鉱石", type: "mineral", description: "クラフトの基本となる鉱石。", price: 40, sellPrice: 20, stack: 99, rarity: "C" },
    "star_diamond": { id: "star_diamond", name: "スターダイヤモンド", type: "mineral", description: "めったに採れない輝く宝石。", price: 1000, sellPrice: 500, stack: 99, rarity: "S" }
};

// 5. 武器・防具・道具
const equipments = {
    "laser_sword": { id: "laser_sword", name: "レーザーソード", type: "weapon", description: "地球人に対抗するための光の剣。", price: 500, sellPrice: 250, stack: 1, rarity: "B" },
    "space_armor": { id: "space_armor", name: "宇宙服アーマー", type: "armor", description: "防御力の高い丈夫なスーツ。", price: 600, sellPrice: 300, stack: 1, rarity: "B" },
    "advanced_hoe": { id: "advanced_hoe", name: "ハイテククワ", type: "tool", description: "一気に耕せる便利な農具。", price: 300, sellPrice: 150, stack: 1, rarity: "C" }
};

// 6. 食料・回復アイテム
const foods = {
    "space_ration": { id: "space_ration", name: "宇宙レトルト食", type: "food", description: "HPを50回復する携帯食料。", price: 40, sellPrice: 10, stack: 99, rarity: "C" }
};

// 7. クラフト素材・ロケット素材
const materials = {
    "rocket_engine": { id: "rocket_engine", name: "ロケットエンジン", type: "rocket_material", description: "土星へ行くために必要な巨大エンジン。", price: 0, sellPrice: 0, stack: 1, rarity: "SS" },
    "space_circuit": { id: "space_circuit", name: "宇宙電子回路", type: "craft_material", description: "地球人の基地から回収した高度な基盤。", price: 150, sellPrice: 75, stack: 99, rarity: "A" }
};

// すべてのアイテムを1つの大きなオブジェクトに統合
export const ITEMS = {
    ...crops,
    ...seeds,
    ...fishes,
    ...minerals,
    ...equipments,
    ...foods,
    ...materials
};

/**
 * 便利関数：アイテムIDからデータを取得する
 * 他のメンバー（ui.jsやplayer.js）がアイテム情報を引き出したい時に使います。
 */
export function getItemById(id) {
    return ITEMS[id] || null;
}