/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
var Spring = (function () {
    function Spring(renderer) {
        this._linearSpringAcceleration = 0;
        this._linearSpringVelocity = 0;
        this._linearSpringConst = 12000;
        this._linearDampingConst = 900;
        this._angularSpringAccelerationX = 0;
        this._angularSpringVelocityX = 0;
        this._angularSpringAccelerationY = 0;
        this._angularSpringVelocityY = 0;
        this._angularSpringAccelerationZ = 0;
        this._angularSpringVelocityZ = 0;
        this._angularSpringConst = 16000;
        this._angularDampingConst = 1600;
        //this._vehicle = vehicle;
        this._renderer = renderer;
        this._springGroup = new THREE.Group();
        //this._springGroup.rotateZ(startRot);
        this._springGroup.position.set(0, 0, 0);
        this._spring = new THREE.Object3D();
        this._spring.position.set(0, 0, 0);
        this._springGroup.add(this._spring);
        //this._wheelConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        //this._wheelConnectorMesh.position.set(0,0,0);
        //this._springGroup.add(this._wheelConnectorMesh);
        //
        //this._carBodyConnectorMesh = new THREE.Mesh(new THREE.CylinderGeometry( 0.5, 0.5, 0.5, 10 ), new THREE.MeshBasicMaterial({color: 0xff0000, wireframe: true}));
        //this._carBodyConnectorMesh.position.set(0,8,0);
        //this._springGroup.add(this._carBodyConnectorMesh);
        //
        //this._springDirection = new THREE.Vector3(0,1,0);
        //this._springArrow = new THREE.ArrowHelper( this._springDirection, new THREE.Vector3(0,0,0), 10, 0x00ffff );
        //this._vehicle.add(this._springGroup);
        //this.loadSpringModel();
    }
    Spring.prototype.loadSpringModel = function () {
        var self = this;
        var loader = new THREE.OBJLoader();
        loader.load('./models/spring2.obj', function (object) {
            var material1 = new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true });
            self._springMesh = object.clone();
            self._springMesh.scale.set(0.4, 0.4, 0.4);
            self._springMesh.position.set(0, 1.2, 0);
            //self._springMesh.position.set(self._wheelConnectorMesh.position.x, self._wheelConnectorMesh.position.y, self._wheelConnectorMesh.position.z);
            self._spring.add(self._springMesh);
        }, function (xhr) {
            console.log('An error happened');
        });
    };
    Spring.prototype.update = function (time, delta, state) {
        this._linearSpringAcceleration = -(this._linearSpringConst * (state.valueOf()[1] - 1) + this._linearDampingConst * this._linearSpringVelocity) / 500;
        this._linearSpringVelocity += this._linearSpringAcceleration * delta;
        this._angularSpringAccelerationX = -(this._angularSpringConst * (state.valueOf()[3]) + this._angularDampingConst * this._angularSpringVelocityX) / 1500;
        this._angularSpringVelocityX += this._angularSpringAccelerationX * delta;
        this._angularSpringAccelerationY = -(this._angularSpringConst * (state.valueOf()[4]) + this._angularDampingConst * this._angularSpringVelocityY) / 1500;
        this._angularSpringVelocityY += this._angularSpringAccelerationY * delta;
        this._angularSpringAccelerationZ = -(this._angularSpringConst * (state.valueOf()[5]) + this._angularDampingConst * this._angularSpringVelocityZ) / 1500;
        this._angularSpringVelocityZ += this._angularSpringAccelerationZ * delta;
    };
    Object.defineProperty(Spring.prototype, "linearSpringAcceleration", {
        get: function () {
            return this._linearSpringAcceleration;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "linearSpringVelocity", {
        get: function () {
            return this._linearSpringVelocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringVelocityZ", {
        get: function () {
            return this._angularSpringVelocityZ;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringVelocityY", {
        get: function () {
            return this._angularSpringVelocityY;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringVelocityX", {
        get: function () {
            return this._angularSpringVelocityX;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "position", {
        get: function () {
            return this._springGroup.position;
        },
        set: function (value) {
            this._springGroup.position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "springObject", {
        get: function () {
            return this._springGroup;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
})();
//# sourceMappingURL=spring.js.map