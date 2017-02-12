/**
 * Created by filles-dator on 2016-03-12.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./ground_plane.ts"/>
var Grass = (function () {
    function Grass(renderer, groundPlanes) {
        this._particleCount = 6000;
        this._renderer = renderer;
        this._groundPlanes = groundPlanes;
        this._particles = new THREE.Geometry();
        var texture = new THREE.TextureLoader().load("texture/grass.png");
        this._particleMaterial = new THREE.PointsMaterial({
            color: 0xFFFFFF,
            size: 5,
            map: texture,
            transparent: true,
            depthWrite: false
        });
        this._particleMaterial.r;
        for (var p = 0; p < this._particleCount; p++) {
            var angle = -Math.random() * Math.PI * 2;
            var length = Math.sqrt(Math.random()) * 200;
            var x_val = Math.cos(angle) * length;
            var z_val = Math.sin(angle) * length;
            var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
            var particle = new THREE.Vector3(x_val, y_val, z_val);
            this._particles.vertices.push(particle);
        }
        this._particleSystem = new THREE.Points(this._particles, this._particleMaterial);
        this._renderer.scene.add(this._particleSystem);
    }
    Grass.prototype.update = function (current_pos, direction) {
        this._particleSystem.geometry.verticesNeedUpdate = true;
        var vel = new THREE.Vector3(direction.x, 0, direction.z);
        var ref = new THREE.Vector3(0, 0, 1);
        var ref_angle = vel.angleTo(ref);
        for (var p = 0; p < this._particleCount; p++) {
            if (current_pos.distanceTo(this._particleSystem.geometry.vertices[p]) > 200) {
                var angle = -(Math.random()) * Math.PI * 2;
                var length = Math.sqrt(Math.random()) * 200;
                var x_val = current_pos.x + Math.cos(angle) * length;
                var z_val = current_pos.z + Math.sin(angle) * length + 20;
                var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
                this._particleSystem.geometry.vertices[p].set(x_val, y_val, z_val);
            }
        }
        this._particles.boundingSphere.radius = 10000;
    };
    return Grass;
}());
