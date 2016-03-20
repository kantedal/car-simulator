/**
 * Created by filles-dator on 2016-03-12.
 */
///<reference path="../../threejs/three.d.ts"/>
///<reference path="../../renderer.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="./../parts/spring.ts"/>
var Bushes = (function () {
    function Bushes(renderer) {
        this._bushCount = 80;
        this._renderer = renderer;
        this._bushes = [];
        var texture = new THREE.TextureLoader().load("texture/bush.png");
        var material = new THREE.MeshBasicMaterial({
            map: texture,
            alphaTest: 0.9,
            side: THREE.DoubleSide
        });
        for (var i = 0; i < this._bushCount; i++) {
            var angle = -Math.random() * Math.PI * 2;
            var length = Math.sqrt(Math.random()) * 200;
            var x_val = Math.cos(angle) * length;
            var z_val = Math.sin(angle) * length;
            var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
            var bush = new Bush(material);
            bush.group.position.set(x_val, y_val, z_val);
            renderer.scene.add(bush.group);
            this._bushes.push(bush);
        }
    }
    Bushes.prototype.update = function (current_pos, time, delta) {
        for (var i = 0; i < this._bushCount; i++) {
            var distance = current_pos.distanceTo(this._bushes[i].group.position);
            if (distance > 200) {
                var angle = -Math.random() * Math.PI * 2;
                var length = Math.sqrt(Math.random()) * 200;
                var x_val = current_pos.x + Math.cos(angle) * length;
                var z_val = current_pos.z + Math.sin(angle) * length;
                var y_val = GroundPlane.simplexNoise(new THREE.Vector3(x_val, 0, z_val));
                this._bushes[i].group.position.set(x_val, y_val, z_val);
            }
            else if (distance < 6)
                this._bushes[i].applyImpluse(new THREE.Vector3(-1, 0, 0));
            if (this._bushes[i].isSimulating)
                this._bushes[i].update(time, delta);
        }
    };
    return Bushes;
})();
var Bush = (function () {
    function Bush(material) {
        this._isSimulating = false;
        this._group = new THREE.Group();
        //this._mesh = [];
        for (var i = 0; i < 4; i++) {
            var mesh = new THREE.Mesh(new THREE.PlaneGeometry(8, 8, 1, 1), material);
            mesh.geometry.translate(0, 3, 0);
            mesh.geometry.rotateY(Math.random() * 2 * Math.PI);
            //this._mesh.push(mesh);
            this._group.add(mesh);
        }
        this._spring = new Spring();
        this._angularVelocity = new THREE.Vector3(0, 0, 0);
        this._rotation = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3(0, 0, 0);
    }
    Bush.prototype.update = function (time, delta) {
        //console.log(this._rotation);
        this._spring.update(time, delta, this._position, this._rotation);
        this._angularVelocity = this._spring.angularSpringVelocity;
        this._rotation.add(this._angularVelocity.clone().multiplyScalar(delta));
        this._group.rotation.set(this._rotation.x, 0, 0);
        if (this._angularVelocity.length() < 0.001) {
            this._isSimulating = false;
        }
    };
    Bush.prototype.applyImpluse = function (velocity) {
        this._isSimulating = true;
        this._spring.angularSpringVelocity.add(velocity);
    };
    Object.defineProperty(Bush.prototype, "spring", {
        get: function () {
            return this._spring;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bush.prototype, "group", {
        get: function () {
            return this._group;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bush.prototype, "angularVelocity", {
        get: function () {
            return this._angularVelocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Bush.prototype, "isSimulating", {
        get: function () {
            return this._isSimulating;
        },
        enumerable: true,
        configurable: true
    });
    return Bush;
})();
//# sourceMappingURL=bush.js.map