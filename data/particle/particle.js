/**
 * Created by DJ on 2016-02-09.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
var Particle = (function () {
    function Particle(startPos, startVel, renderer, time, particleSprite) {
        this._lifeLength = 0.5;
        this._startTime = time;
        this._position = startPos.clone();
        this._velocity = startVel.clone();
        this._acceleration = new THREE.Vector3(0, -19.82, 0);
        this._angularVelocity = Math.random() * 5 - 2.5;
        this._particleSprite = particleSprite;
        this._particleSprite.scale.multiplyScalar(2);
        this._renderer = renderer;
        this._renderer.scene.add(this._particleSprite);
    }
    Particle.prototype.update = function (time, delta) {
        var currentTime = (time - this._startTime);
        if (currentTime > this._lifeLength) {
            this._isDead = true;
            this._particleSprite.material.dispose();
            this._particleSprite.geometry.dispose();
            this._renderer.scene.remove(this._particleSprite);
        }
        this._velocity.add(this._acceleration.clone().multiplyScalar(delta));
        this._position.add(this._velocity.clone().multiplyScalar(delta));
        this._particleSprite.position.copy(this._position);
        this._particleSprite.scale.addScalar(8 * delta);
        this._particleSprite.material.opacity = Math.pow((this._lifeLength - currentTime) / this._lifeLength, 2);
        this._particleSprite.material.rotation += this._angularVelocity * delta;
    };
    Object.defineProperty(Particle.prototype, "isParticleDead", {
        get: function () {
            return this._isDead;
        },
        enumerable: true,
        configurable: true
    });
    return Particle;
})();
//# sourceMappingURL=particle.js.map