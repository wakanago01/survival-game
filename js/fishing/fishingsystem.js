export default class FishingSystem {

    startFishing(player, collisionManager) {

        if (!collisionManager.canFish(
            player.x,
            player.y,
            player.direction
        )) {
            return;
        }

        player.playFishingAnimation();
    }

}
