/**
 * Created by DJ on 2016-02-09.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
var Particle2 = (function () {
    function Particle2(startPos, renderer, time, particleSprite) {
        this.lifeLength = 1.25;
        this.angle = Math.PI / 2;
        this.v0 = 10;
        this.startTime = time;
        var startPos = startPos.clone();
        this.startPos = new THREE.Vector3(startPos.x + Math.random() * 2 - 1, startPos.y, startPos.z + Math.random() * 2 - 1);
        this.Pos = new THREE.Vector3();
        this.particleSprite = particleSprite;
        this.renderer = renderer;
        this.renderer.scene.add(this.particleSprite);
    }
    Particle2.prototype.update = function (time, wheelPos) {
        var currentTime = (time - this.startTime);
        if (currentTime > this.lifeLength) {
            this.isDead = true;
            this.particleSprite.material.dispose();
            this.particleSprite.geometry.dispose();
            this.renderer.scene.remove(this.particleSprite);
        }
        this.Pos.x = this.startPos.x + (Math.cos(this.angle) * this.v0) * currentTime;
        this.Pos.y = this.startPos.y + (Math.sin(this.angle) * this.v0) * currentTime - 0.3 * Math.pow(currentTime, 2);
        this.particleSprite.scale.set(currentTime * 10, currentTime * 10, currentTime * 10);
        this.particleSprite.material.opacity = (this.lifeLength - currentTime) / 5.5;
        //Vit fyrkant för spriten syns annars
        if (currentTime > 0.001)
            this.particleSprite.position.set(this.Pos.x, this.Pos.y, this.startPos.z);
        else
            this.particleSprite.position.set(this.Pos.x, this.Pos.y - 20, this.startPos.z);
    };
    Object.defineProperty(Particle2.prototype, "ParticleDead", {
        get: function () {
            if (this.isDead)
                return true;
            else
                return false;
        },
        enumerable: true,
        configurable: true
    });
    return Particle2;
})();
//# sourceMappingURL=Particle2.js.map