///<reference path="../../threejs/three.d.ts"/>
///<reference path="./particle.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="../../data/vehicle.ts"/>
///<reference path="../../data/parts/wheel.ts"/>
///<reference path="../../math/matrix.ts"/>
var ParticleSystem = (function () {
    function ParticleSystem(renderer, emissionWheel) {
        this._renderer = renderer;
        this._particles = [];
        this._emissionWheel = emissionWheel;
        var texture = new THREE.TextureLoader().load("./texture/dirt.png");
        this._material = new THREE.SpriteMaterial({ map: texture, transparent: true });
    }
    ParticleSystem.prototype.generateParticles = function (startPos, time) {
        if (this._emissionWheel.isColliding) {
            var force = this._emissionWheel.connectedVehicle.vehicleModel.forceTotal;
            var force_mag = math.norm(force) / 6000;
            for (var i = 0; i < Math.floor((Math.random() * force_mag)); i++) {
                this._particleSprite = new THREE.Sprite(this._material.clone());
                var startVel = this._emissionWheel.wheelDirection.clone().multiplyScalar(-1);
                startVel.setY(1);
                startVel.setX(startVel.x + Math.random() - 0.5);
                startVel.setZ(startVel.z + Math.random() - 0.5);
                startVel.multiplyScalar(this._emissionWheel.connectedVehicle.vehicleModel.velocityDirection.length() * 0.4 + Math.random() * 0.2);
                var scale = Math.random() * 2;
                this._particleSprite.scale.set(scale, scale, scale);
                this._particleSprite.material.rotation = Math.random * 2 * Math.PI;
                this._particles.push(new Particle(startPos, startVel, this._renderer, time, this._particleSprite));
            }
        }
    };
    ParticleSystem.prototype.simulateParticles = function (time, delta) {
        for (var i = 0; i < this._particles.length; i++) {
            if (this._particles[i]) {
                this._particles[i].update(time, delta);
                if (this._particles[i].isParticleDead)
                    this._particles.splice(i, 1);
            }
        }
    };
    ParticleSystem.prototype.update = function (pos, time, delta) {
        this.generateParticles(pos, time);
        this.simulateParticles(time, delta);
    };
    return ParticleSystem;
})();
//# sourceMappingURL=particle_system.js.map