///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
var Vector3 = THREE.Vector3;
var PhysicsObject3d = (function () {
    function PhysicsObject3d(geometry, material, renderer) {
        this._hasCollisionSurface = false;
        this._isColliding = false;
        this._collisionRadius = 0;
        this._surfaceDistance = 0;
        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._acceleration = new THREE.Vector3(0, 0, 0);
        this._force = new THREE.Vector3(0, 0, 0);
        this._forceRadius = new THREE.Vector3(0, 0, 0);
        this._angularAcceleration = new THREE.Vector3(0, 0, 0);
        this._angularVelocity = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3(0, 0, 0);
        this._rotation = new THREE.Vector3(0, 1, 0);
        this._collisionPosition = new THREE.Vector3(0, 0, 0);
        this._desiredDirection = new THREE.Vector3(1, 0, 0);
        this._normalDirection = new THREE.Vector3(0, 0, 0);
        this._realNormalDirection = new THREE.Vector3(0, 0, 0);
        this._gradientDirection = new THREE.Vector3(0, 0, 0);
        this._realDirection = new THREE.Vector3(0, 0, 0);
        this._moveDirection = new THREE.Vector3(0, 0, 0);
        var dir = new THREE.Vector3(0, 1, 0);
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 10;
        this._normalArrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
        this._directionArrow = new THREE.ArrowHelper(dir, origin, length, 0x00ff00);
        this._gradientArrow = new THREE.ArrowHelper(dir, origin, length, 0xff00ff);
        this._forceArrow = new THREE.ArrowHelper(dir, origin, length, 0x0000ff);
        this._forceRadiusArrow = new THREE.ArrowHelper(dir, origin, length, 0xff00ff);
        renderer.scene.add(this._normalArrow);
        renderer.scene.add(this._gradientArrow);
        renderer.scene.add(this._directionArrow);
        renderer.scene.add(this._forceArrow);
        renderer.scene.add(this._forceRadiusArrow);
        this._vertTest = [];
        for (var i = 0; i < this.object.geometry.vertices.length; i++) {
            this._vertTest[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        }
        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
        renderer.scene.add(this._centerOfMassPoint);
    }
    PhysicsObject3d.prototype.update = function (time, delta) {
        if (this._hasCollisionSurface) {
            this._object.updateMatrixWorld(true);
            var vertPos1 = this._object.geometry.vertices[0].clone();
            vertPos1.applyQuaternion(this._object.getWorldQuaternion());
            var vertPos2 = this._object.geometry.vertices[1].clone();
            vertPos2.applyQuaternion(this._object.getWorldQuaternion());
            this.forceRadius = new THREE.Vector3((vertPos2.x + vertPos1.x), (0), (vertPos2.z + vertPos1.z)).normalize().multiplyScalar(4);
            this.isColliding = true;
            for (var i = 0; i < this.object.geometry.vertices.length; i++) {
                var vertPos2 = this._object.geometry.vertices[i].clone();
                vertPos2.applyQuaternion(this._object.getWorldQuaternion());
            }
            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                var vert1 = this._collisionSurface.vertices[this._collisionSurface.faces[i].a];
                var vert2 = this._collisionSurface.vertices[this._collisionSurface.faces[i].b];
                var vert3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].c];
                for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                    var vertPos = this._vertexTracker.vertices[vertexIdx].clone();
                    //var vertPos:THREE.Vector3 = this._object.geometry.vertices[vertexIdx].clone();
                    //vertPos.applyQuaternion(this._object.getWorldQuaternion());
                    if (this.checkCollision(vertPos.clone().add(this.object.position), vert1, vert2, vert3) && this.pointInTriangle(vertPos.clone().add(this.position), vert1, vert2, vert3)) {
                        var vertexNormals = this._collisionSurface.faces[i].vertexNormals;
                        var areaT = this.triangleArea(vert1, vert2, vert3);
                        var areaB = this.triangleArea(vert1, this._position, vert3);
                        var areaC = this.triangleArea(vert1, this._position, vert2);
                        var areaA = areaT - areaB - areaC;
                        var c1 = areaA / areaT;
                        var c2 = areaB / areaT;
                        var c3 = areaC / areaT;
                        this._normalDirection = new THREE.Vector3(vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3, vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3, vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3);
                        this.isColliding = true;
                        this.forceRadius.set(vertPos.x, vertPos.y, vertPos.z);
                        this.force.set(0, 1, 0).multiplyScalar(Math.abs((9.82 + this._angularVelocity.length() * this.forceRadius.length() + this.velocity.length()) * 2000));
                        this.velocity.y = 0;
                    }
                }
            }
            // console.log(this.forceRadius);
            for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                var vertPos = this._object.geometry.vertices[vertexIdx].clone();
                vertPos.applyQuaternion(this._object.getWorldQuaternion());
                this._vertTest[vertexIdx].position.set(vertPos.x + this._position.x, vertPos.y + this._position.y, vertPos.z + this._position.z);
            }
            this._centerOfMassPoint.position.set(this._position.x, this._position.y, this._position.z);
            this._object.position.set(this._position.x, this._position.y, this._position.z);
            this._normalDirection.normalize();
            this._gradientDirection.set(0, -1, 0);
            this._gradientDirection.projectOnPlane(this._normalDirection);
            if (this._gradientDirection.length() < 0.01)
                this._gradientDirection.set(0, 0, 0);
            this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
            this._realDirection.projectOnPlane(this._normalDirection);
            this._realDirection.normalize();
            this._forceRadiusArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._forceRadiusArrow.setDirection(this._forceRadius);
            this._forceRadiusArrow.setLength(6);
            this._forceArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._forceArrow.setDirection(this.force);
            this._forceArrow.setLength(10);
            this._normalArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._normalArrow.setDirection(this._rotation);
            this._normalArrow.setLength(6);
        }
        //this._object.rotation.set(this._rotation.x, this._rotation.z, this._rotation.z);
        //this._object.position.set(this._position.x, this._position.y, this._position.z);
        //this._realArrow.position.set(this._position.x, this._position.y, this._position.z);
        //this._realArrow.setDirection(this._velocity);
        //this._realArrow.setLength(this._velocity.length()/5);
        //this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._gradientArrow.setDirection(this._gradientDirection);
        //this._gradientArrow.setLength(this._gradientDirection.length()*10);
        //
        //this._directionArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._directionArrow.setDirection(this._desiredDirection);
    };
    PhysicsObject3d.prototype.trackVertices = function (angVel) {
        if (!this._vertexTracker) {
            this._vertexTracker = this.object.geometry.clone();
            this.testMesh = new THREE.Mesh(this._vertexTracker, new THREE.MeshBasicMaterial({ color: 0x999999, wireframe: true }));
            this._renderer.scene.add(this.testMesh);
        }
        this._vertexTracker.rotateX(angVel.x * 0.05);
        this._vertexTracker.rotateY(angVel.y * 0.05);
        this._vertexTracker.rotateZ(angVel.z * 0.05);
        this.testMesh.position.set(this._position.x, this._position.y, this._position.z);
        return this._vertexTracker.vertices[0];
    };
    PhysicsObject3d.prototype.updateVelocity = function (newVelocity) {
        this._velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    };
    PhysicsObject3d.prototype.connectCollisionSurface = function (surface) {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    };
    PhysicsObject3d.prototype.checkCollision = function (vertPos, p1, p2, p3) {
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);
        var l1 = ((p2.z - p3.z) * (vertPos.x - p3.x) + (p3.x - p2.x) * (vertPos.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (vertPos.x - p3.x) + (p1.x - p3.x) * (vertPos.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;
        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;
        this._surfaceDistance = Math.min(Math.max(vertPos.y - height, 0.0001), 10.0) / 10;
        if (vertPos.y <= height) {
            return true;
        }
        else {
            return false;
        }
    };
    PhysicsObject3d.prototype.showAxis = function () {
    };
    PhysicsObject3d.prototype.triangleArea = function (A, B, C) {
        var a = Math.sqrt(Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2) + Math.pow(A.z - B.z, 2));
        var b = Math.sqrt(Math.pow(A.x - C.x, 2) + Math.pow(A.y - C.y, 2) + Math.pow(A.z - C.z, 2));
        var c = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2) + Math.pow(B.z - C.z, 2));
        var s = (1 / 2) * (a + b + c);
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    };
    PhysicsObject3d.prototype.distanceToFace = function (p1, p2, p3) {
        var avgPos = new Vector3((p1.x + p2.x + p3.x) / 3, (p1.y + p2.z + p3.y) / 3, (p1.x + p2.x + p3.z) / 3);
        return Math.sqrt(Math.pow(this.position.x - avgPos.x, 2) + Math.pow(this.position.y - avgPos.y, 2) + Math.pow(this.position.z - avgPos.z, 2));
    };
    PhysicsObject3d.prototype.sign = function (p1, p2, p3) {
        return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
    };
    PhysicsObject3d.prototype.pointInTriangle = function (pt, v1, v2, v3) {
        var b1, b2, b3;
        b1 = this.sign(pt, v1, v2) < 0.0;
        b2 = this.sign(pt, v2, v3) < 0.0;
        b3 = this.sign(pt, v3, v1) < 0.0;
        return ((b1 == b2) && (b2 == b3));
    };
    Object.defineProperty(PhysicsObject3d.prototype, "object", {
        get: function () {
            return this._object;
        },
        set: function (value) {
            this._object = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "geometry", {
        get: function () {
            return this._geometry;
        },
        set: function (value) {
            this._geometry = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "material", {
        get: function () {
            return this._material;
        },
        set: function (value) {
            this._material = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "collisionSurface", {
        get: function () {
            return this._collisionSurface;
        },
        set: function (value) {
            this._collisionSurface = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "position", {
        get: function () {
            return this._position;
        },
        set: function (value) {
            this._position = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "desiredDirection", {
        get: function () {
            return this._desiredDirection;
        },
        set: function (value) {
            this._desiredDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "normalDirection", {
        get: function () {
            return this._normalDirection;
        },
        set: function (value) {
            this._normalDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "velocity", {
        get: function () {
            return this._velocity;
        },
        set: function (value) {
            this._velocity = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "realDirection", {
        get: function () {
            return this._realDirection;
        },
        set: function (value) {
            this._realDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "collisionRadius", {
        get: function () {
            return this._collisionRadius;
        },
        set: function (value) {
            this._collisionRadius = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "hasCollisionSurface", {
        get: function () {
            return this._hasCollisionSurface;
        },
        set: function (value) {
            this._hasCollisionSurface = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "gradientDirection", {
        get: function () {
            return this._gradientDirection;
        },
        set: function (value) {
            this._gradientDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "force", {
        get: function () {
            return this._force;
        },
        set: function (value) {
            this._force = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "isColliding", {
        get: function () {
            return this._isColliding;
        },
        set: function (value) {
            this._isColliding = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "realNormalDirection", {
        get: function () {
            return this._realNormalDirection;
        },
        set: function (value) {
            this._realNormalDirection = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "surfaceDistance", {
        get: function () {
            return this._surfaceDistance;
        },
        set: function (value) {
            this._surfaceDistance = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "acceleration", {
        get: function () {
            return this._acceleration;
        },
        set: function (value) {
            this._acceleration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "rotation", {
        get: function () {
            return this._rotation;
        },
        set: function (value) {
            this._rotation = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "forceRadius", {
        get: function () {
            return this._forceRadius;
        },
        set: function (value) {
            this._forceRadius = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "boundingRadius", {
        get: function () {
            return this._boundingRadius;
        },
        set: function (value) {
            this._boundingRadius = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "angularAcceleration", {
        get: function () {
            return this._angularAcceleration;
        },
        set: function (value) {
            this._angularAcceleration = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "angularVelocity", {
        get: function () {
            return this._angularVelocity;
        },
        set: function (value) {
            this._angularVelocity = value;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsObject3d;
})();
//# sourceMappingURL=physics_object3d.js.map