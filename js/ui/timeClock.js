export default class TimeClock {

    constructor(scene, timeManager) {
        this.scene = scene;
        this.timeManager = timeManager;
        this.depth = 1000;

        this.graphics = scene.add.graphics()
            .setScrollFactor(0)
            .setDepth(this.depth);

        this.iconText = scene.add.text(0, 0, "", {
            fontSize: "34px",
            fontFamily: "sans-serif",
            color: "#fff8d6",
            align: "center",
        })
        .setOrigin(0.5)
        .setScrollFactor(0)
        .setDepth(this.depth + 1);

        this.update();
    }

    update() {
        const phase = this.timeManager.getPhase();
        const progress = Phaser.Math.Clamp(this.timeManager.getPhaseProgress(), 0, 1);
        const isNight = phase === "night";
        const camera = this.scene.cameras.main;

        const cx = camera.width / 2;
        const cy = 104;
        const radius = 118;
        const marker = this._pointOnArc(cx, cy, radius, progress);

        const baseColor = isNight ? 0x23345f : 0x735820;
        const progressColor = isNight ? 0xbfd7ff : 0xffd36a;
        const markerColor = isNight ? 0xe4edff : 0xfff1a8;
        const panelColor = isNight ? 0x081225 : 0x241a0a;

        this.graphics.clear();
        this.graphics.fillStyle(panelColor, 0.72);
        this.graphics.fillRoundedRect(cx - 170, 18, 340, 122, 14);

        this._drawArc(cx, cy, radius, 0, 1, baseColor, 10, 0.42);
        this._drawArc(cx, cy, radius, 0, progress, progressColor, 10, 1);

        this.graphics.fillStyle(markerColor, 1);
        this.graphics.fillCircle(marker.x, marker.y, 11);
        this.graphics.lineStyle(3, 0xffffff, 0.85);
        this.graphics.strokeCircle(marker.x, marker.y, 11);

        this.iconText
            .setText(isNight ? "☾" : "☀")
            .setColor(isNight ? "#dce8ff" : "#fff0a8")
            .setPosition(cx, cy - 48);
    }

    destroy() {
        this.graphics?.destroy();
        this.iconText?.destroy();
    }

    _drawArc(cx, cy, radius, startProgress, endProgress, color, width, alpha) {
        const steps = 36;
        const start = Math.max(0, Math.min(1, startProgress));
        const end = Math.max(start, Math.min(1, endProgress));

        this.graphics.lineStyle(width, color, alpha);
        this.graphics.beginPath();

        for (let i = 0; i <= steps; i++) {
            const progress = start + (end - start) * (i / steps);
            const point = this._pointOnArc(cx, cy, radius, progress);
            if (i === 0) {
                this.graphics.moveTo(point.x, point.y);
            } else {
                this.graphics.lineTo(point.x, point.y);
            }
        }

        this.graphics.strokePath();
    }

    _pointOnArc(cx, cy, radius, progress) {
        const angle = Math.PI - progress * Math.PI;
        return {
            x: cx + Math.cos(angle) * radius,
            y: cy - Math.sin(angle) * radius,
        };
    }
}
