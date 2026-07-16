import { handlePlayerAnimation } from "./animation.js";

export function updatePlayerMovement(player, cursors) {

    player.setVelocity(0);

    let vx = 0;
    let vy = 0;

    let direction = "";

    const keys = player.scene.input.keyboard.addKeys("W,A,S,D");

    if (cursors.up.isDown || keys.W.isDown) {

        vy = -player.speed;
        direction = "up";

    }
    else if (cursors.down.isDown || keys.S.isDown) {

        vy = player.speed;
        direction = "down";

    }

    if (cursors.left.isDown || keys.A.isDown) {

        vx = -player.speed;
        direction = "left";

    }
    else if (cursors.right.isDown || keys.D.isDown) {

        vx = player.speed;
        direction = "right";

    }

    if (vx !== 0 && vy !== 0) {

        const length = Math.sqrt(vx * vx + vy * vy);

        vx = vx / length * player.speed;
        vy = vy / length * player.speed;

    }

    player.setVelocity(vx, vy);

    if (direction !== "") {
        player.direction = direction;
    }

    handlePlayerAnimation(player, vx, vy);

}