///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="../math/mathjs.d.ts"/>

import Vector3 = THREE.Vector3;
class PhysicsObject3d {
    private _state : mathjs.Matrix;
    private _velocity : mathjs.Matrix;

    private _object : THREE.Mesh;
    private _renderer : Renderer;
    private _geometry : THREE.Geometry;
    private _material : THREE.Material;

    private _acceleration : THREE.Vector3;
    private _force : THREE.Vector3;
    private _forceRadius : THREE.Vector3;
    private _boundingRadius : THREE.Vector3;

    private _angularAcceleration : THREE.Vector3;
    private _angularVelocity : THREE.Vector3;

    private _position : THREE.Vector3;
    private _rotation : THREE.Vector3;
    private _desiredDirection : THREE.Vector3;
    private _normalDirection : THREE.Vector3;
    private _realNormalDirection : THREE.Vector3;
    private _gradientDirection : THREE.Vector3;
    private _realDirection : THREE.Vector3;
    private _moveDirection : THREE.Vector3;

    private _normalArrow : THREE.ArrowHelper;
    private _gradientArrow : THREE.ArrowHelper;
    private _directionArrow : THREE.ArrowHelper;
    private _rotationArrow : THREE.ArrowHelper;
    private _forceRadiusArrow : THREE.ArrowHelper;

    private _centerOfMassPoint : THREE.Mesh;

    private _hasCollisionSurface : boolean = false;
    private _isColliding : boolean = false;
    private _collisionRadius : number = 0;
    private _surfaceDistance : number = 0;
    private _collisionPosition : THREE.Vector3;
    private _collisionSurface : THREE.Geometry;

    private _vertTest : THREE.Mesh[];
    private _collisionPoint : THREE.Vector3;

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        this._velocity = math.transpose(math.matrix([1,20,0,0,0,2]));
        this._state = math.transpose(math.matrix([0,40,0,0,0,Math.PI/4]));

        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);

        this._acceleration = new THREE.Vector3(0,0,0);
        this._force = new THREE.Vector3(0,0,0);
        this._forceRadius = new THREE.Vector3(0,0,0);

        this._angularAcceleration = new THREE.Vector3(0,0,0);
        this._angularVelocity = new THREE.Vector3(0,0,0);

        this._position = new THREE.Vector3(0,0,0);
        this._rotation = new THREE.Vector3(0,1,0);
        this._collisionPosition = new THREE.Vector3(0,0,0);
        this._desiredDirection = new THREE.Vector3(1,0,0);
        this._normalDirection = new THREE.Vector3(0,0,0);
        this._realNormalDirection = new THREE.Vector3(0,0,0);
        this._gradientDirection = new THREE.Vector3(0,0,0);
        this._realDirection = new THREE.Vector3(0,0,0);
        this._moveDirection = new THREE.Vector3(0,0,0);
        this._collisionPoint = new THREE.Vector3(0,0,0);

        var dir = new THREE.Vector3( 0, 1, 0 );
        var origin = new THREE.Vector3( 0, 0, 0 );
        var length = 10;

        this._normalArrow = new THREE.ArrowHelper( dir, origin, length, 0xff0000 );
        this._directionArrow = new THREE.ArrowHelper( dir, origin, length, 0x00ff00 );
        this._gradientArrow = new THREE.ArrowHelper( dir, origin, length, 0xff00ff );
        this._rotationArrow = new THREE.ArrowHelper( dir, origin, length, 0x0000ff );
        this._forceRadiusArrow = new THREE.ArrowHelper( dir, origin, length, 0xff00ff );

        renderer.scene.add( this._normalArrow );
        renderer.scene.add( this._gradientArrow );
        renderer.scene.add( this._directionArrow );
        renderer.scene.add( this._rotationArrow );
        renderer.scene.add( this._forceRadiusArrow );

        this._vertTest = [];
        for(var i=0; i<this.object.geometry.vertices.length; i++) {
            this._vertTest[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xffff00}))
            renderer.scene.add(this._vertTest[i]);
        }

        this._vertTest[this._vertTest.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}))
        renderer.scene.add(this._vertTest[this._vertTest.length-1]);

        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));
        renderer.scene.add( this._centerOfMassPoint );
    }

    public checkCollisions():number[][] {
        var collisions:number[] = [];
        if(this._hasCollisionSurface) {
            this.forceRadius.set(0,0,0);

            for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                //var vertPos:THREE.Vector3 = this._object.geometry.vertices[vertexIdx].clone();
                //vertPos.applyQuaternion(this._object.getWorldQuaternion());
                var vertPos:THREE.Vector3 = this._vertexTracker.vertices[vertexIdx].clone().add(this._position);
                this._vertTest[vertexIdx].position.set(vertPos.x, vertPos.y, vertPos.z);
            }

            for (var i = 0; i < this._collisionSurface.faces.length; i++) {
                var vert1:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].a];
                var vert2:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].b];
                var vert3:THREE.Vector3 = this._collisionSurface.vertices[this._collisionSurface.faces[i].c];

                for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
                    var vertPos:THREE.Vector3 = this._vertexTracker.vertices[vertexIdx].clone().add(this._position);
                    //var vertPos:THREE.Vector3 = this._vertTest[vertexIdx].position.clone();

                    if (this.checkCollision(vertPos.clone(), vert1, vert2, vert3) && this.pointInTriangle(vertPos.clone(), vert1, vert2, vert3)) {
                        var vertexNormals = this._collisionSurface.faces[i].vertexNormals;

                        var areaT = this.triangleArea(vert1, vert2, vert3);
                        var areaB = this.triangleArea(vert1, this._position, vert3);
                        var areaC = this.triangleArea(vert1, this._position, vert2);
                        var areaA = areaT - areaB - areaC;

                        var c1 = areaA / areaT;
                        var c2 = areaB / areaT;
                        var c3 = areaC / areaT;

                        this._normalDirection = new THREE.Vector3(
                            vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3,
                            vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3,
                            vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3
                        );

                        this.isColliding = true;

                        collisions.push([
                            vertPos.x - this._object.position.x,
                            vertPos.y - this._object.position.y,
                            vertPos.z - this._object.position.z,
                            this._normalDirection.x,
                            this._normalDirection.y,
                            this._normalDirection.z,
                            vertPos.x,
                            vertPos.y,
                            vertPos.z
                        ]);
                    }
                }
            }
        }
        return collisions;
    }

    public update(time:number, delta:number):void {
        //this.object.rotation.set(this._state.valueOf()[3], this._state.valueOf()[4], this._state.valueOf()[5]);
        this.object.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
        this._object.updateMatrixWorld(true);

        this.isColliding = false;

        //for(var i=0; i<this.object.geometry.vertices.length; i++) {
        //    var vertPos2:THREE.Vector3 = this._object.geometry.vertices[i].clone();
        //    vertPos2.applyQuaternion(this._object.getWorldQuaternion());
        //}
        //
        //for (var vertexIdx = 0; vertexIdx < this._object.geometry.vertices.length; vertexIdx++) {
        //    var vertPos:THREE.Vector3 = this._object.geometry.vertices[vertexIdx].clone();
        //    vertPos.applyQuaternion(this._object.getWorldQuaternion());
        //    this._vertTest[vertexIdx].position.set(vertPos.x + this._object.position.x, vertPos.y + this._object.position.y, vertPos.z + this._object.position.z);
        //}

        this._centerOfMassPoint.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
        this._normalDirection.normalize();


        this._realDirection.set(this._desiredDirection.x, this._desiredDirection.y, this._desiredDirection.z);
        this._realDirection.projectOnPlane(this._normalDirection);
        this._realDirection.normalize()

        this._forceRadiusArrow.position.set(this._state.valueOf()[0], this._state.valueOf()[1], this._state.valueOf()[2]);
        this._forceRadiusArrow.setDirection(this._forceRadius);
        this._forceRadiusArrow.setLength(6);

        //this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._gradientArrow.setDirection(new THREE.Vector3(this._velocity.valueOf()[0], this._velocity.valueOf()[1], this._velocity.valueOf()[2]));
        //this._gradientArrow.setLength(Math.sqrt(Math.pow(this.velocity.valueOf()[0],2) + Math.pow(this.velocity.valueOf()[1],2) + Math.pow(this.velocity.valueOf()[2],2));

        //this._object.rotation.set(this._rotation.x, this._rotation.z, this._rotation.z);
        //this._object.position.set(this._position.x, this._position.y, this._position.z);

        this._rotationArrow.position.set(this.position.x, this.position.y, this.position.z);
        this._rotationArrow.setDirection(new THREE.Vector3(
            this._vertexTracker.vertices[0].clone().x,
            this._vertexTracker.vertices[0].clone().y*0.2,
            this._vertexTracker.vertices[0].clone().z
        ));
        this._rotationArrow.setLength(this._vertexTracker.vertices[0].clone().length());
        //this._gradientArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._gradientArrow.setDirection(this._gradientDirection);
        //this._gradientArrow.setLength(this._gradientDirection.length()*10);
        //
        //this._directionArrow.position.set(this._position.x, this._position.y, this._position.z)
        //this._directionArrow.setDirection(this._desiredDirection);
    }

    //Vertex tracker to handle vertices positions when colliding
    private _vertexTracker : THREE.Geometry;
    private testMesh : THREE.Mesh;
    public trackVertices(delta:number) : THREE.Vector3{
        if(!this._vertexTracker) {
            this._vertexTracker = this.object.geometry.clone();
            this.testMesh = new THREE.Mesh(this._vertexTracker , new THREE.MeshBasicMaterial({color: 0x999999, wireframe: true}));
            this._renderer.scene.add(this.testMesh);
        }

        this._vertexTracker.rotateX(this._velocity.valueOf()[3]*delta);
        this._vertexTracker.rotateY(this._velocity.valueOf()[4]*delta);
        this._vertexTracker.rotateZ(this._velocity.valueOf()[5]*delta);

        this.testMesh.position.set(
            this._position.x,
            this._position.y,
            this._position.z
        );

        return this._vertexTracker.vertices[0];
    }

    public connectCollisionSurface(surface : THREE.Geometry):void {
        this._collisionSurface = surface;
        this._hasCollisionSurface = true;
    }

    private checkCollision(vertPos:THREE.Vector3, p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : boolean{
        var det = (p2.z - p3.z) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.z - p3.z);

        var l1 = ((p2.z - p3.z) * (vertPos.x - p3.x) + (p3.x - p2.x) * (vertPos.z - p3.z)) / det;
        var l2 = ((p3.z - p1.z) * (vertPos.x - p3.x) + (p1.x - p3.x) * (vertPos.z - p3.z)) / det;
        var l3 = 1.0 - l1 - l2;

        var height = l1 * p1.y + l2 * p2.y + l3 * p3.y;

        this._surfaceDistance = Math.min(Math.max(vertPos.y-height, 0.0001), 10.0)/10;

        if(vertPos.y-1 <= height) {
            return true;
        }else {
            return false;
        }
    }

    public showAxis():void {

    }

    private triangleArea(A:THREE.Vector3, B:THREE.Vector3, C:THREE.Vector3):number {
        var a = Math.sqrt(Math.pow(A.x-B.x,2) + Math.pow(A.y-B.y,2) + Math.pow(A.z-B.z,2));
        var b = Math.sqrt(Math.pow(A.x-C.x,2) + Math.pow(A.y-C.y,2) + Math.pow(A.z-C.z,2));
        var c = Math.sqrt(Math.pow(B.x-C.x,2) + Math.pow(B.y-C.y,2) + Math.pow(B.z-C.z,2));

        var s =(1/2)*(a+b+c);

        return Math.sqrt(s*(s-a)*(s-b)*(s-c))
    }

    private distanceToFace(p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : number {
        var avgPos:THREE.Vector3 = new Vector3(
            (p1.x + p2.x + p3.x)/3,
            (p1.y + p2.z + p3.y)/3,
            (p1.x + p2.x + p3.z)/3
        );
        return Math.sqrt(Math.pow(this.position.x-avgPos.x, 2) + Math.pow(this.position.y-avgPos.y, 2) + Math.pow(this.position.z-avgPos.z, 2));
    }

    private sign(p1:THREE.Vector3, p2:THREE.Vector3, p3:THREE.Vector3) : number {
        return (p1.x - p3.x) * (p2.z - p3.z) - (p2.x - p3.x) * (p1.z - p3.z);
    }

    private pointInTriangle(pt:THREE.Vector3, v1:THREE.Vector3, v2:THREE.Vector3, v3:THREE.Vector3) : boolean {
        var b1, b2, b3;

        b1 = this.sign(pt, v1, v2) < 0.0;
        b2 = this.sign(pt, v2, v3) < 0.0;
        b3 = this.sign(pt, v3, v1) < 0.0;

        return ((b1 == b2) && (b2 == b3));
    }

    get object():THREE.Mesh {
        return this._object;
    }

    set object(value:THREE.Mesh) {
        this._object = value;
    }
    get geometry():THREE.Geometry {
        return this._geometry;
    }

    set geometry(value:THREE.Geometry) {
        this._geometry = value;
    }
    get material():THREE.Material {
        return this._material;
    }

    set material(value:THREE.Material) {
        this._material = value;
    }

    get collisionSurface():THREE.Mesh {
        return this._collisionSurface;
    }

    set collisionSurface(value:THREE.Mesh) {
        this._collisionSurface = value;
    }

    get position():THREE.Vector3 {
        return this._position;
    }

    set position(value:THREE.Vector3) {
        this._position = value;
    }

    get desiredDirection():THREE.Vector3 {
        return this._desiredDirection;
    }

    set desiredDirection(value:THREE.Vector3) {
        this._desiredDirection = value;
    }

    get normalDirection():THREE.Vector3 {
        return this._normalDirection;
    }

    set normalDirection(value:THREE.Vector3) {
        this._normalDirection = value;
    }

    get realDirection():THREE.Vector3 {
        return this._realDirection;
    }

    set realDirection(value:THREE.Vector3) {
        this._realDirection = value;
    }

    get collisionRadius():number {
        return this._collisionRadius;
    }

    set collisionRadius(value:number) {
        this._collisionRadius = value;
    }

    get hasCollisionSurface():boolean {
        return this._hasCollisionSurface;
    }

    set hasCollisionSurface(value:boolean) {
        this._hasCollisionSurface = value;
    }

    get gradientDirection():THREE.Vector3 {
        return this._gradientDirection;
    }

    set gradientDirection(value:THREE.Vector3) {
        this._gradientDirection = value;
    }

    get force():THREE.Vector3 {
        return this._force;
    }

    set force(value:THREE.Vector3) {
        this._force = value;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    get realNormalDirection():THREE.Vector3 {
        return this._realNormalDirection;
    }

    set realNormalDirection(value:THREE.Vector3) {
        this._realNormalDirection = value;
    }

    get surfaceDistance():number {
        return this._surfaceDistance;
    }

    set surfaceDistance(value:number) {
        this._surfaceDistance = value;
    }

    get acceleration():THREE.Vector3 {
        return this._acceleration;
    }

    set acceleration(value:THREE.Vector3) {
        this._acceleration = value;
    }

    get rotation():THREE.Vector3 {
        return this._rotation;
    }

    set rotation(value:THREE.Vector3) {
        this._rotation = value;
    }

    get forceRadius():THREE.Vector3 {
        return this._forceRadius;
    }

    set forceRadius(value:THREE.Vector3) {
        this._forceRadius = value;
    }

    get boundingRadius():THREE.Vector3 {
        return this._boundingRadius;
    }

    set boundingRadius(value:THREE.Vector3) {
        this._boundingRadius = value;
    }

    get angularAcceleration():THREE.Vector3 {
        return this._angularAcceleration;
    }

    set angularAcceleration(value:THREE.Vector3) {
        this._angularAcceleration = value;
    }
    get angularVelocity():THREE.Vector3 {
        return this._angularVelocity;
    }

    set angularVelocity(value:THREE.Vector3) {
        this._angularVelocity = value;
    }

    get collisionPoint():THREE.Vector3 {
        return this._collisionPoint;
    }

    set collisionPoint(value:THREE.Vector3) {
        this._collisionPoint = value;
    }

    get vertTest():THREE.Mesh[] {
        return this._vertTest;
    }

    set vertTest(value:Array) {
        this._vertTest = value;
    }

    get velocity():mathjs.Matrix {
        return this._velocity;
    }

    set velocity(value:mathjs.Matrix) {
        this._velocity = value;
    }

    get state():mathjs.Matrix {
        return this._state;
    }

    set state(value:mathjs.Matrix) {
        this._state = value;
    }

    get vertexTracker():THREE.Geometry {
        return this._vertexTracker;
    }

    set vertexTracker(value:THREE.Geometry) {
        this._vertexTracker = value;
    }
}