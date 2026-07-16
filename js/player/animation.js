export function handlePlayerAnimation(player, vx, vy) {

    const targetWidth = 48;

    if (player.texture && player.texture.getSourceImage()) {

        const img = player.texture.getSourceImage();

        const aspectRatio = img.height / img.width;

        player.setDisplaySize(targetWidth, targetWidth * aspectRatio);

    }

    if (vx !== 0 || vy !== 0) {

        switch (player.direction) {

            case "up":

                player.setFlipX(false);
                player.play("walk_up", true);
                break;

            case "down":

                player.setFlipX(false);
                player.play("walk_down", true);
                break;

            case "left":

                player.setFlipX(false);
                player.play("walk_left", true);
                break;

            case "right":

                player.setFlipX(true);
                player.play("walk_right", true);
                break;

        }

    } else {

        switch (player.direction) {

            case "up":

                player.play("idle_up", true);
                break;

            case "down":

                player.play("idle_down", true);
                break;

            case "left":

                player.setFlipX(false);
                player.play("idle_left", true);
                break;

            case "right":

                player.setFlipX(true);
                player.play("idle_right", true);
                break;

        }

    }

}