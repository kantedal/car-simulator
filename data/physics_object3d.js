///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
var Vector3 = THREE.Vector3;
var PhysicsObject3d = (function () {
    function PhysicsObject3d(geometry, material, renderer) {
        this._isColliding = false;
        this._surfaceDistance = 0;
        this._lastSurfaceIndex = 0;
        this._velocity = math.transpose(math.matrix([1, 20, 0, 0, 0, 0]));
        this._state = math.transpose(math.matrix([0, 40, 0, 0, 0, Math.PI / 4]));
        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._collisionSurfaceIndices = [];
        this._collisionSurfaces = [];
        this._collisionPosition = new THREE.Vector3(0, 0, 0);
        this._desiredDirection = new THREE.Vector3(0, 0, 0);
        this._normalDirection = new THREE.Vector3(0, 0, 0);
        this._realDirection = new THREE.Vector3(0, 0, 0);
        this._forceRadius = new THREE.Vector3(0, 0, 0);
        this._velocityDirection = new THREE.Vector3(0, 0, 0);
        this._angularVelocityDirection = new THREE.Vector3(0, 0, 0);
        this._localXDirection = new THREE.Vector3(1, 0, 0);
        this._localYDirection = new THREE.Vector3(0, 1, 0);
        this._localZDirection = new THREE.Vector3(0, 0, 1);
        var dir = new THREE.Vector3(0, 1, 0);
        var origin = new THREE.Vector3(0, 0, 0);
        var length = 10;
        this._normalArrow = new THREE.ArrowHelper(dir, origin, length, 0xff0000);
        this._velocityDirectionArrow = new THREE.ArrowHelper(dir, origin, 6, 0x00ff00);
        this._gradientArrow = new THREE.ArrowHelper(dir, origin, length, 0xff00ff);
        this._localXDirectionArrow = new THREE.ArrowHelper(dir, origin, 4, 0xff0000);
        this._localYDirectionArrow = new THREE.ArrowHelper(dir, origin, 4, 0x00ff00);
        this._localZDirectionArrow = new THREE.ArrowHelper(dir, origin, 4, 0x0000ff);
        //renderer.scene.add( this._normalArrow );
        //renderer.scene.add( this._gradientArrow );
        //renderer.scene.add( this._velocityDirectionArrow );
        renderer.scene.add(this._localXDirectionArrow);
        renderer.scene.add(this._localYDirectionArrow);
        renderer.scene.add(this._localZDirectionArrow);
        this._externalCollisionPoints = [];
        this._externalCollisionPositions = [];
        this._externalCollision = [];
        this._collisionPoints = [];
        for (var i = 0; i < this.object.geometry.vertices.length; i++) {
            this._collisionPoints[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
            renderer.scene.add(this._collisionPoints[i]);
        }
        this._collisionPoints[this._collisionPoints.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        renderer.scene.add(this._collisionPoints[this._collisionPoints.length - 1]);
        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
        renderer.scene.add(this._centerOfMassPoint);
    }
    PhysicsObject3d.prototype.update = function (time, delta) {
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(1, 0, 0), delta * this.velocity.valueOf()[3]);
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(0, 1, 0), delta * this.velocity.valueOf()[4]);
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(0, 0, 1), delta * this.velocity.valueOf()[5]);
        this.object.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
        this._object.updateMatrixWorld(true);
        this.isColliding = false;
        this._centerOfMassPoint.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
        this._normalDirection.normalize();
        this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
        this._realDirection.projectOnPlane(this._normalDirection);
        this._realDirection.normalize();
        this._velocityDirection.set(this.velocity.valueOf()[0], this.velocity.valueOf()[1], this.velocity.valueOf()[2]);
        this._angularVelocityDirection.set(this.velocity.valueOf()[3], this.velocity.valueOf()[4], this.velocity.valueOf()[5]);
        this._velocityDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this._velocityDirectionArrow.setDirection(this._velocityDirection);
        this._localXDirection = new THREE.Vector3(1, 0, 0).applyQuaternion(this.object.getWorldQuaternion());
        this._localYDirection = new THREE.Vector3(0, 1, 0).applyQuaternion(this.object.getWorldQuaternion());
        this._localZDirection = new THREE.Vector3(0, 0, 1).applyQuaternion(this.object.getWorldQuaternion());
        this._localXDirectionArrow.setDirection(this._localXDirection);
        this._localYDirectionArrow.setDirection(this._localYDirection);
        this._localZDirectionArrow.setDirection(this._localZDirection);
        this._localXDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this._localYDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this._localZDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this.setCollisionSurfaceIndices();
    };
    PhysicsObject3d.prototype.rotateAroundWorldAxis = function (object, axis, radians) {
        var rotationMatrix = new THREE.Matrix4();
        rotationMatrix.makeRotationAxis(axis.normalize(), radians);
        rotationMatrix.multiply(object.matrix);
        object.matrix = rotationMatrix;
        object.rotation.setFromRotationMatrix(object.matrix);
    };
    PhysicsObject3d.prototype.addCollisionPoint = function (position) {
        this._externalCollisionPositions[this._externalCollisionPositions.length] = position;
        this._externalCollision[this._externalCollision.length] = false;
        this._externalCollisionPoints[this._externalCollisionPoints.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
        this._externalCollisionPoints[this._externalCollisionPoints.length - 1].position.set(position.x, position.y, position.z);
        this._renderer.scene.add(this._externalCollisionPoints[this._externalCollisionPoints.length - 1]);
    };
    PhysicsObject3d.prototype.connectCollisionSurfaces = function (surfaces) {
        this._collisionSurfaces = surfaces;
    };
    PhysicsObject3d.prototype.setCollisionSurfaceIndices = function () {
        this._collisionSurfaceIndices = [];
        for (var g = 0; g < this._collisionSurfaces.length; g++) {
            for (var i = 0; i < this._collisionPoints.length - 1; i++) {
                if (Math.abs(this._collisionPoints[i].position.x - this._collisionSurfaces[g].mesh.position.x) < CarSimulator.ground_width / 2 && Math.abs(this._collisionPoints[i].position.z - this._collisionSurfaces[g].mesh.position.z) < CarSimulator.ground_width / 2) {
                    this._collisionSurfaceIndices.push(g);
                    break;
                }
            }
        }
        if (this._collisionSurfaceIndices.length == 1) {
            if (this._lastSurfaceIndex != this._collisionSurfaceIndices[0]) {
                var xMove = this._collisionSurfaces[this._lastSurfaceIndex].mesh.position.x - this._collisionSurfaces[this._collisionSurfaceIndices[0]].mesh.position.x;
                var zMove = this._collisionSurfaces[this._lastSurfaceIndex].mesh.position.z - this._collisionSurfaces[this._collisionSurfaceIndices[0]].mesh.position.z;
                var oldSurfacePos = this._collisionSurfaces[this._lastSurfaceIndex].mesh.position.clone();
                var surfacePos = this._collisionSurfaces[this._lastSurfaceIndex].mesh.position.clone();
                var surfaceScale = this._collisionSurfaces[this._collisionSurfaceIndices[0]].scale.clone();
                if (xMove > 0) {
                    for (var i = 0; i < this._collisionSurfaces.length; i++) {
                        if (this._collisionSurfaces[i].mesh.position.x > oldSurfacePos.x) {
                            this._collisionSurfaces[i].mesh.position.set(this._collisionSurfaces[i].mesh.position.x - CarSimulator.ground_width * 3, this._collisionSurfaces[i].mesh.position.y, this._collisionSurfaces[i].mesh.position.z);
                            this._collisionSurfaces[i].geometry.translate(-CarSimulator.ground_width * 3, 0, 0);
                        }
                    }
                }
                else if (xMove < 0) {
                    for (var i = 0; i < this._collisionSurfaces.length; i++) {
                        if (this._collisionSurfaces[i].mesh.position.x < oldSurfacePos.x) {
                            this._collisionSurfaces[i].mesh.position.set(this._collisionSurfaces[i].mesh.position.x + CarSimulator.ground_width * 3, this._collisionSurfaces[i].mesh.position.y, this._collisionSurfaces[i].mesh.position.z);
                            this._collisionSurfaces[i].geometry.translate(CarSimulator.ground_width * 3, 0, 0);
                        }
                    }
                }
                if (zMove > 0) {
                    for (var i = 0; i < this._collisionSurfaces.length; i++) {
                        if (this._collisionSurfaces[i].mesh.position.z > oldSurfacePos.z) {
                            this._collisionSurfaces[i].mesh.translateZ(-CarSimulator.ground_width * 3);
                            this._collisionSurfaces[i].geometry.translate(0, 0, -CarSimulator.ground_width * 3);
                        }
                    }
                }
                else if (zMove < 0) {
                    for (var i = 0; i < this._collisionSurfaces.length; i++) {
                        if (this._collisionSurfaces[i].mesh.position.z < oldSurfacePos.z) {
                            this._collisionSurfaces[i].mesh.translateZ(CarSimulator.ground_width * 3);
                            this._collisionSurfaces[i].geometry.translate(0, 0, CarSimulator.ground_width * 3);
                        }
                    }
                }
                this._lastSurfaceIndex = this._collisionSurfaceIndices[0];
            }
        }
    };
    PhysicsObject3d.prototype.connectCollisionSurface = function (surface) {
        this._collisionSurface = surface;
    };
    PhysicsObject3d.prototype.checkCollisions = function () {
        var collisions = [];
        if (this._collisionSurfaces.length > 0) {
            this.forceRadius.set(0, 0, 0);
            for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                var vertPos = this._object.geometry.vertices[vertexIdx].clone();
                vertPos.applyQuaternion(this._object.getWorldQuaternion());
                this._collisionPoints[vertexIdx].position.set(vertPos.x, vertPos.y, vertPos.z).add(this._object.position);
            }
            for (var extColIdx = 0; extColIdx < this._externalCollisionPoints.length; extColIdx++) {
                var vertPos = this._externalCollisionPositions[extColIdx].clone();
                vertPos.applyQuaternion(this._object.getWorldQuaternion());
                this._externalCollisionPoints[extColIdx].position.set(vertPos.x, vertPos.y, vertPos.z).add(this._object.position);
            }
            for (var vertexIdx = 0; vertexIdx < this._externalCollisionPoints.length; vertexIdx++) {
                this._externalCollision[vertexIdx] = false;
            }
            for (var c = 0; c < this._collisionSurfaceIndices.length; c++) {
                for (var i = 0; i < this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.faces.length; i++) {
                    var vert1 = this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.vertices[this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.faces[i].a];
                    var vert2 = this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.vertices[this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.faces[i].b];
                    var vert3 = this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.vertices[this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.faces[i].c];
                    var vertexNormals = this._collisionSurfaces[this._collisionSurfaceIndices[c]].geometry.faces[i].vertexNormals;
                    for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                        var vertPos = this._collisionPoints[vertexIdx].position.clone();
                        var collision = this.handleCollision(vertPos, vert1, vert2, vert3, vertexNormals);
                        if (collision != 0)
                            collisions.push(collision);
                    }
                    for (var vertexIdx = 0; vertexIdx < this._externalCollisionPoints.length; vertexIdx++) {
                        var vertPos = this._externalCollisionPoints[vertexIdx].position.clone();
                        var collision = this.handleCollision(vertPos, vert1, vert2, vert3, vertexNormals);
                        if (collision != 0) {
                            this._externalCollision[vertexIdx] = true;
                            collisions.push(collision);
                        }
                    }
                }
            }
        }
        return collisions;
    };
    PhysicsObject3d.prototype.handleCollision = function (vertPos, vert1, vert2, vert3, vertexNormals) {
        if (this.checkCollision(vertPos.clone(), vert1, vert2, vert3) && this.pointInTriangle(vertPos.clone(), vert1, vert2, vert3)) {
            var areaT = this.triangleArea(vert1, vert2, vert3);
            var areaB = this.triangleArea(vert1, this.object.position, vert3);
            var areaC = this.triangleArea(vert1, this.object.position, vert2);
            var areaA = areaT - areaB - areaC;
            var c1 = areaA / areaT;
            var c2 = areaB / areaT;
            var c3 = areaC / areaT;
            this._normalDirection = new THREE.Vector3(vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3, vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3, vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3);
            this.isColliding = true;
            return [
                vertPos.x - this._object.position.x,
                vertPos.y - this._object.position.y,
                vertPos.z - this._object.position.z,
                this._normalDirection.x,
                this._normalDirection.y,
                this._normalDirection.z,
                vertPos.x,
                vertPos.y,
                vertPos.z
            ];
        }
        return 0;
    };
    PhysicsObject3d.prototype.checkCollision = function (vertPos, p1, p2, p3) {
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);
        var l1 = ((p2.z - p3.z) * (vertPos.x - p3.x) + (p3.x - p2.x) * (vertPos.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (vertPos.x - p3.x) + (p1.x - p3.x) * (vertPos.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;
        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;
        this._surfaceDistance = Math.min(Math.max(vertPos.y - height, 0.0001), 10.0) / 10;
        if (vertPos.y - 1 <= height) {
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
    Object.defineProperty(PhysicsObject3d.prototype, "velocityDirection", {
        get: function () {
            return this._velocityDirection;
        },
        set: function (value) {
            this._velocityDirection = value;
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
    Object.defineProperty(PhysicsObject3d.prototype, "collisionPoints", {
        get: function () {
            return this._collisionPoints;
        },
        set: function (value) {
            this._collisionPoints = value;
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
    Object.defineProperty(PhysicsObject3d.prototype, "state", {
        get: function () {
            return this._state;
        },
        set: function (value) {
            this._state = value;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "localYDirection", {
        get: function () {
            return this._localYDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "localXDirection", {
        get: function () {
            return this._localXDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "localZDirection", {
        get: function () {
            return this._localZDirection;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "externalCollision", {
        get: function () {
            return this._externalCollision;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PhysicsObject3d.prototype, "angularVelocityDirection", {
        get: function () {
            return this._angularVelocityDirection;
        },
        enumerable: true,
        configurable: true
    });
    return PhysicsObject3d;
})();
//# sourceMappingURL=physics_object3d.js.map