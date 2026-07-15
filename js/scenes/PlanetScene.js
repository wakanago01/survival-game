import WorldMap from "../world/map.js";
import CollisionManager from "../world/collision.js";

export default class PlanetScene extends Phaser.Scene {

    constructor() {
        super("PlanetScene");
    }

    preload() {
        this.load.image("worldMapImage", "assets/images/world/map.png");
    }

    create() {

        // ① マップを生成
        this.worldMap = new WorldMap(this);

        // ② 当たり判定システムを生成
        this.collision = new CollisionManager(this.worldMap);

        // ③ スポーン地点を取得
        const spawn = this.worldMap.getSpawnPoint();

        console.log("マップ生成完了");
        console.log("スポーン地点:", spawn);
    }
}
