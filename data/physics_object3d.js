///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
var Vector3 = THREE.Vector3;
var PhysicsObject3d = (function () {
    function PhysicsObject3d(geometry, material, renderer) {
        this._hasCollisionSurface = false;
        this._isColliding = false;
        this._collisionRadius = 0;
        this._surfaceDistance = 0;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._object.position.y = -1;
        this._velocity = new THREE.Vector3(0, 0, 0);
        this._acceleration = new THREE.Vector3(0, 0, 0);
        this._position = new THREE.Vector3(0, 0, 0);
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
        this._realArrow = new THREE.ArrowHelper(dir, origin, length, 0x0000ff);
        renderer.scene.add(this._normalArrow);
        renderer.scene.add(this._gradientArrow);
        renderer.scene.add(this._directionArrow);
        renderer.scene.add(this._realArrow);
        this._vert1 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._vert2 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this._vert3 = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        this.realPos = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
        renderer.scene.add(this._vert1);
        renderer.scene.add(this._vert2);
        renderer.scene.add(this._vert3);
        renderer.scene.add(this.realPos);
    }
    PhysicsObject3d.prototype.update = function (time, delta) {
        if (this._hasCollisionSurface) {
            var faceIndex = 0;
            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                var collisionPos = new THREE.Vector3(this._position.x - this._collisionRadius * this._realNormalDirection.x, this._position.y - this._collisionRadius * this._realNormalDirection.y, this._position.z - this._collisionRadius * this._realNormalDirection.z);
                this.realPos.position.set(collisionPos.x, collisionPos.y, collisionPos.z);
                if (this.pointInTriangle(this._position, this._collisionSurface.vertices[this._collisionSurface.faces[i].a], this._collisionSurface.vertices[this._collisionSurface.faces[i].b], this._collisionSurface.vertices[this._collisionSurface.faces[i].c])) {
                    //this._collisionPosition = collisionPos;
                    faceIndex = i;
                    var vert1 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].a];
                    var vert2 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].b];
                    var vert3 = this._collisionSurface.vertices[this._collisionSurface.faces[faceIndex].c];
                    var vertexNormals = this._collisionSurface.faces[faceIndex].vertexNormals;
                    var areaT = this.triangleArea(vert1, vert2, vert3);
                    var areaB = this.triangleArea(vert1, this._position, vert3);
                    var areaC = this.triangleArea(vert1, this._position, vert2);
                    var areaA = areaT - areaB - areaC;
                    var c1 = areaA / areaT;
                    var c2 = areaB / areaT;
                    var c3 = areaC / areaT;
                    if (this.isColliding) {
                        this._normalDirection = new THREE.Vector3(vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3, vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3, vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3);
                        //Interpolate real normal direction to normal direction on landing
                        this._realNormalDirection.set(this._normalDirection.x * 0.2 + this._realNormalDirection.x * 0.8, this._normalDirection.y * 0.2 + this._realNormalDirection.y * 0.8, this._normalDirection.z * 0.2 + this._realNormalDirection.z * 0.8);
                    }
                    else {
                        var velocityProj = this._velocity.clone().projectOnPlane(this._realNormalDirection);
                        var velocityAngle = Math.acos(velocityProj.dot(this._velocity));
                        var newNormalDir = this.realDirection.clone().applyAxisAngle(new Vector3(1, 0, 0), Math.PI / 2).normalize();
                    }
                    break;
                }
            }
            if (!(vert1 && vert2 && vert3)) {
                var vert1 = new THREE.Vector3(0, 0, 0);
                var vert2 = new THREE.Vector3(0, 0, 0);
                var vert3 = new THREE.Vector3(0, 0, 0);
            }
            //this._normalDirection = this._collisionSurface.faces[faceIndex].normal;
            this._normalDirection.normalize();
            this._gradientDirection.set(0, -1, 0);
            this._gradientDirection.projectOnPlane(this._normalDirection);
            if (this._gradientDirection.length() < 0.01)
                this._gradientDirection.set(0, 0, 0);
            this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
            this._realDirection.projectOnPlane(this._normalDirection);
            this._realDirection.normalize();
            this._object.position.set(this._position.x + 2 * this.normalDirection.x, this._position.y + 2 * this.normalDirection.y, this._position.z + 2 * this.normalDirection.z);
            //this._object.position.set(this._position.x, this._position.y, this._position.z);
            this._realArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._realArrow.setDirection(this._velocity);
            this._normalArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._normalArrow.setDirection(this._normalDirection);
            this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._gradientArrow.setDirection(this._gradientDirection);
            this._gradientArrow.setLength(this._gradientDirection.length() * 10);
            this._directionArrow.position.set(this._position.x, this._position.y, this._position.z);
            this._directionArrow.setDirection(this._desiredDirection);
            this._vert1.position.set(vert1.x, vert1.y, vert1.z);
            this._vert2.position.set(vert2.x, vert2.y, vert2.z);
            this._vert3.position.set(vert3.x, vert3.y, vert3.z);
            if (this.checkCollision(vert1, vert2, vert3)) {
                this._isColliding = true;
            }
            else {
                this._isColliding = false;
            }
        }
    };
    PhysicsObject3d.prototype.updateVelocity = function (newVelocity) {
        this._velocity.set(newVelocity.x, newVelocity.y, newVelocity.z);
    };
    PhysicsObject3d.prototype.connectCollisionSurface = function (surface) {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    };
    PhysicsObject3d.prototype.checkCollision = function (p1, p2, p3) {
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);
        var l1 = ((p2.z - p3.z) * (this._position.x - p3.x) + (p3.x - p2.x) * (this._position.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (this._position.x - p3.x) + (p1.x - p3.x) * (this._position.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;
        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;
        this._surfaceDistance = Math.min(Math.max(this._position.y - height, 0.0001), 1);
        //console.log("surf dist: " + this._surfaceDistance);
        if (this._position.y <= height + 0.1) {
            if (this._position.y <= height - 0.1)
                this._position.y = height;
            return true;
        }
        else {
            // if (this._position.y >= height + 0.1)
            //     this._position.y = height;
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
    return PhysicsObject3d;
})();
//# sourceMappingURL=physics_object3d.js.map