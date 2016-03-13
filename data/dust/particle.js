/**
 * Created by DJ on 2016-02-09.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
var Particle = (function () {
    function Particle(startPos, renderer, time, particleSprite) {
        this.lifeLength = 3;
        this.angle = Math.PI / 2;
        this.v0 = 5;
        this.startTime = time;
        var startPos = startPos.clone();
        this.startPos = new THREE.Vector3(startPos.x + Math.random() * 4 - 2, startPos.y + Math.random() * 2 - 1, startPos.z + Math.random() * 2 - 1);
        this.Pos = new THREE.Vector3();
        this.particleSprite = particleSprite;
        this.renderer = renderer;
        this.renderer.scene.add(this.particleSprite);
    }
    Particle.prototype.update = function (time, wheelPos) {
        var currentTime = (time - this.startTime);
        if (currentTime > this.lifeLength) {
            this.isDead = true;
            this.particleSprite.material.dispose();
            this.particleSprite.geometry.dispose();
            this.renderer.scene.remove(this.particleSprite);
        }
        this.Pos.x = this.startPos.x + (Math.cos(this.angle) * this.v0) * currentTime;
        this.Pos.y = this.startPos.y + (Math.sin(this.angle) * this.v0) * currentTime - 0.5 * 9.82 * Math.pow(currentTime, 2);
        this.particleSprite.material.opacity = (this.lifeLength - currentTime) / 8;
        //Vit fyrkant för spriten syns annars
        if (currentTime > 0.001)
            this.particleSprite.position.set(this.Pos.x, this.Pos.y, this.startPos.z);
        else
            this.particleSprite.position.set(this.Pos.x, this.Pos.y - 20, this.startPos.z);
    };
    Object.defineProperty(Particle.prototype, "ParticleDead", {
        get: function () {
            if (this.isDead)
                return true;
            else
                return false;
        },
        enumerable: true,
        configurable: true
    });
    return Particle;
})();
//# sourceMappingURL=Particle.js.map