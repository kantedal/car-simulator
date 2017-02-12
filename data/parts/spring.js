/**
 * Created by filles-dator on 2016-02-03.
 */
///<reference path="../../renderer.ts"/>
///<reference path="../vehicle.ts"/>
var Spring = (function () {
    function Spring() {
        this._linearSpringConst = 6000;
        this._linearDampingConst = 900;
        this._angularSpringConst = 10000;
        this._angularDampingConst = 1600;
        this._allowLinearMotion = true;
        this._allowAngularMotion = true;
        this._linearSpringAcceleration = new THREE.Vector3(0, 0, 0);
        this._linearSpringVelocity = new THREE.Vector3(0, 0, 0);
        this._linearDisplacement = new THREE.Vector3(0, 2, 0);
        this._angularSpringAcceleration = new THREE.Vector3(0, 0, 0);
        this._angularSpringVelocity = new THREE.Vector3(0, 0, 0);
        this._angularDisplacement = new THREE.Vector3(0, 0, 0);
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
    Spring.prototype.update = function (time, delta, linearState, angularState) {
        if (this._allowLinearMotion) {
            this._linearSpringAcceleration =
                linearState.clone().sub(this._linearDisplacement)
                    .multiplyScalar(this._linearSpringConst).add(this._linearSpringVelocity.clone()
                    .multiplyScalar(this._linearDampingConst)).multiplyScalar(1 / 300);
            this._linearSpringAcceleration.multiplyScalar(-1);
            this._linearSpringVelocity.add(this._linearSpringAcceleration.clone().multiplyScalar(delta));
        }
        if (this._allowAngularMotion) {
            this._angularSpringAcceleration =
                angularState.clone().sub(this._angularDisplacement)
                    .multiplyScalar(this._angularSpringConst).add(this._angularSpringVelocity.clone()
                    .multiplyScalar(this._angularDampingConst)).multiplyScalar(1 / 1000);
            this._angularSpringAcceleration.multiplyScalar(-1);
            this._angularSpringVelocity.add(this._angularSpringAcceleration.clone().multiplyScalar(delta));
        }
    };
    Spring.prototype.allowMotion = function (linear, angular) {
        this._allowLinearMotion = linear;
        this._allowAngularMotion = angular;
    };
    Object.defineProperty(Spring.prototype, "angularDampingConst", {
        set: function (value) {
            this._angularDampingConst = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringConst", {
        set: function (value) {
            this._angularSpringConst = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "linearDampingConst", {
        set: function (value) {
            this._linearDampingConst = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "linearSpringConst", {
        set: function (value) {
            this._linearSpringConst = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularDisplacement", {
        set: function (value) {
            this._angularDisplacement = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "linearDisplacement", {
        set: function (value) {
            this._linearDisplacement = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringVelocity", {
        get: function () {
            return this._angularSpringVelocity;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Spring.prototype, "angularSpringAcceleration", {
        get: function () {
            return this._angularSpringAcceleration;
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
    Object.defineProperty(Spring.prototype, "linearSpringAcceleration", {
        get: function () {
            return this._linearSpringAcceleration;
        },
        enumerable: true,
        configurable: true
    });
    return Spring;
}());
