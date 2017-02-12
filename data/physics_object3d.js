///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./environment/ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>
var Vector3 = THREE.Vector3;
var PhysicsObject3d = (function () {
    function PhysicsObject3d(geometry, material, renderer) {
        this._isColliding = false;
        this._surfaceDistance = 0;
        this._lastSurfaceIndex = 0;
        this._collisionRaycaster = THREE.Raycaster;
        this._velocity = math.transpose(math.matrix([1, 20, 0, 0, 0, 0]));
        this._state = math.transpose(math.matrix([0, 40, 0, 0, 0, Math.PI / 4]));
        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);
        this._collisionSurfaceIndices = [];
        this._collisionSurfaces = [];
        this._collisionRaycaster = new THREE.Raycaster();
        this._collisionPosition = new THREE.Vector3(0, 0, 0);
        this._desiredDirection = new THREE.Vector3(0, 0, 0);
        this._normalDirection = new THREE.Vector3(0, 0, 0);
        this._acceleration = new THREE.Vector3(0, 0, 0);
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
        if (CarSimulator.developer_mode) {
            renderer.scene.add(this._localXDirectionArrow);
            renderer.scene.add(this._localYDirectionArrow);
            renderer.scene.add(this._localZDirectionArrow);
        }
        this._externalCollisionPoints = [];
        this._externalCollisionPositions = [];
        this._externalCollision = [];
        this._collisionPoints = [];
        for (var i = 0; i < this.object.geometry.vertices.length; i++) {
            this._collisionPoints[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xffff00 }));
            if (CarSimulator.developer_mode)
                renderer.scene.add(this._collisionPoints[i]);
        }
        this._collisionPoints[this._collisionPoints.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({ color: 0xff0000 }));
        if (CarSimulator.developer_mode)
            renderer.scene.add(this._collisionPoints[this._collisionPoints.length - 1]);
        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true }));
        if (CarSimulator.developer_mode)
            renderer.scene.add(this._centerOfMassPoint);
    }
    Object.defineProperty(PhysicsObject3d.prototype, "acceleration", {
        get: function () {
            return this._acceleration;
        },
        enumerable: true,
        configurable: true
    });
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
        this._acceleration.set(this._velocityDirection.x - this.velocity.valueOf()[0], this._velocityDirection.y - this.velocity.valueOf()[1], this._velocityDirection.z - this.velocity.valueOf()[2]);
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
        //this.setCollisionSurfaceIndices();
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
        if (CarSimulator.developer_mode)
            this._renderer.scene.add(this._externalCollisionPoints[this._externalCollisionPoints.length - 1]);
    };
    PhysicsObject3d.prototype.connectCollisionSurfaces = function (surfaces) {
        this._collisionMeshes = surfaces;
    };
    PhysicsObject3d.prototype.newCheckCollisions = function () {
        for (var i = 0; i < this._externalCollisionPoints.length; i++)
            this._externalCollision[i] = false;
        var collisions = [];
        if (this._collisionMeshes) {
            for (var extColIdx = 0; extColIdx < this._externalCollisionPoints.length; extColIdx++) {
                var vertPos = this._externalCollisionPositions[extColIdx].clone();
                vertPos.applyQuaternion(this._object.getWorldQuaternion());
                this._externalCollisionPoints[extColIdx].position.set(vertPos.x, vertPos.y, vertPos.z).add(this._object.position);
                var testPos = this._externalCollisionPoints[extColIdx].position.clone();
                testPos.setY(30);
                this._collisionRaycaster.set(testPos, new Vector3(0, -1, 0));
                var intersects = this._collisionRaycaster.intersectObjects(this._collisionMeshes, true);
                if (intersects[0]) {
                    if (intersects[0].point.y >= this._externalCollisionPoints[extColIdx].position.y) {
                        var penetration = Math.abs(intersects[0].point.y - this._externalCollisionPoints[extColIdx].position.y);
                        var vert1 = intersects[0].object.geometry.vertices[intersects[0].face.a].clone().add(intersects[0].object.position);
                        var vert2 = intersects[0].object.geometry.vertices[intersects[0].face.b].clone().add(intersects[0].object.position);
                        var vert3 = intersects[0].object.geometry.vertices[intersects[0].face.c].clone().add(intersects[0].object.position);
                        var vertexNormals = [
                            intersects[0].face.vertexNormals[0],
                            intersects[0].face.vertexNormals[1],
                            intersects[0].face.vertexNormals[2]
                        ];
                        var collision = this.handleCollision(this._externalCollisionPoints[extColIdx].position, vert1, vert2, vert3, vertexNormals, penetration);
                        if (collision != 0) {
                            //this._externalCollision[extColIdx] = true;
                            collisions.push(collision);
                        }
                        this._externalCollision[extColIdx] = true;
                    }
                }
            }
        }
        return collisions;
    };
    PhysicsObject3d.prototype.newNewCheckCollisions = function () {
        for (var i = 0; i < this._externalCollisionPoints.length; i++)
            this._externalCollision[i] = false;
        var collisions = [];
        for (var extColIdx = 0; extColIdx < this._externalCollisionPoints.length; extColIdx++) {
            var vertPos = this._externalCollisionPositions[extColIdx].clone();
            vertPos.applyQuaternion(this._object.getWorldQuaternion());
            vertPos.add(this._object.position);
            var surfaceHeight = GroundPlane.simplexNoise(new THREE.Vector3(vertPos.x, vertPos.y, vertPos.z));
            if (surfaceHeight >= vertPos.y) {
                var penetration = Math.abs(surfaceHeight - vertPos.y);
                var x_height = GroundPlane.simplexNoise(new THREE.Vector3(vertPos.x + 0.01, vertPos.y, vertPos.z));
                var x_dir = new THREE.Vector3(0.01, x_height - surfaceHeight, 0);
                x_dir.normalize();
                var z_height = GroundPlane.simplexNoise(new THREE.Vector3(vertPos.x, vertPos.y, vertPos.z + 0.01));
                var z_dir = new THREE.Vector3(0, z_height - surfaceHeight, 0.01);
                z_dir.normalize();
                var normal = z_dir.cross(x_dir).normalize();
                var force_radius = vertPos.clone().sub(this._object.position);
                var collision = [
                    force_radius.x,
                    force_radius.y,
                    force_radius.z,
                    normal.x,
                    normal.y,
                    normal.z,
                    vertPos.x,
                    vertPos.y,
                    vertPos.z,
                    penetration
                ];
                collisions.push(collision);
            }
            if (surfaceHeight + 0.7 >= vertPos.y) {
                this._externalCollision[extColIdx] = true;
            }
        }
        return collisions;
    };
    PhysicsObject3d.prototype.handleCollision = function (vertPos, vert1, vert2, vert3, vertexNormals, penetration) {
        var areaT = this.triangleArea(vert1, vert2, vert3);
        var areaB = this.triangleArea(vert1, vertPos, vert3);
        var areaC = this.triangleArea(vert1, vertPos, vert2);
        var areaA = areaT - areaB - areaC;
        var c1 = areaA / areaT;
        var c2 = areaB / areaT;
        var c3 = areaC / areaT;
        this._normalDirection = new THREE.Vector3(vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3, vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3, vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3);
        return [
            vertPos.x - this._object.position.x,
            vertPos.y - this._object.position.y,
            vertPos.z - this._object.position.z,
            this._normalDirection.x,
            this._normalDirection.y,
            this._normalDirection.z,
            vertPos.x,
            vertPos.y,
            vertPos.z,
            penetration
        ];
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
}());
