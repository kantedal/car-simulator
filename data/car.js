/**
 * Created by filles-dator on 2016-01-26.
 */
///<reference path="./physics_object3d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="./parts/wheel.ts"/>
///<reference path="./ground_plane.ts"/>
var Car = (function () {
    function Car(renderer) {
        //super(new THREE.BoxGeometry(7, 2, 5), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}), renderer);
        this._renderer = renderer;
        this._wheels = [new Wheel(renderer)];
        this._wheels[0].position.set(0, 0, -3);
        renderer.scene.add(this._wheels[0].object);
        this._position = new THREE.Vector3(0, 0, -3);
    }
    Car.prototype.update = function (time, delta) {
        for (var i = 0; i < this._wheels.length; i++) {
            this._wheels[i].update(time, delta);
        }
        this._renderer.camera.lookAt(this._wheels[0].object.position);
        this._renderer.camera.position.set(this._wheels[0].position.x, this._wheels[0].position.y + 10, this._wheels[0].position.z - 15);
        this._position.set(this._wheels[0].position.x, this._wheels[0].position.y, this._wheels[0].position.z);
    };
    Car.prototype.connectCollisionSurface = function (groundPlanes) {
        var surfaceIndex = 0;
        for (var g = 0; g < groundPlanes.length; g++) {
            for (var i = 0; i < this._wheels.length; i++) {
                if (Math.abs(this._wheels[i].position.x - groundPlanes[g].mesh.position.x) < 60 && Math.abs(this._wheels[i].position.z - groundPlanes[g].mesh.position.z) < 60) {
                    this._wheels[i].connectCollisionSurface(groundPlanes[g].geometry);
                    surfaceIndex = g;
                    break;
                }
            }
        }
        return surfaceIndex;
    };
    Object.defineProperty(Car.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    return Car;
})();
//# sourceMappingURL=car.js.map