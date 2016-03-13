///<reference path="../threejs/three.d.ts"/>
///<reference path="../renderer.ts"/>
///<reference path="../math/mathjs.d.ts"/>
///<reference path="./ground_plane.ts"/>
///<reference path="../carsimulator.ts"/>

import Vector3 = THREE.Vector3;
class PhysicsObject3d {
    private _state : mathjs.Matrix;
    private _velocity : mathjs.Matrix;

    private _object : THREE.Mesh;
    private _renderer : Renderer;
    private _geometry : THREE.Geometry;
    private _material : THREE.Material;

    private _forceRadius : THREE.Vector3;

    private _desiredDirection : THREE.Vector3;
    private _normalDirection : THREE.Vector3;
    private _realDirection : THREE.Vector3;
    private _velocityDirection : THREE.Vector3;
    private _angularVelocityDirection : THREE.Vector3;

    private _normalArrow : THREE.ArrowHelper;
    private _gradientArrow : THREE.ArrowHelper;
    private _velocityDirectionArrow : THREE.ArrowHelper;

    private _localXDirection : THREE.Vector3;
    private _localYDirection : THREE.Vector3;
    private _localZDirection : THREE.Vector3;
    private _localXDirectionArrow : THREE.ArrowHelper;
    private _localYDirectionArrow : THREE.ArrowHelper;
    private _localZDirectionArrow : THREE.ArrowHelper;

    private _centerOfMassPoint : THREE.Mesh;

    private _isColliding : boolean = false;
    private _surfaceDistance : number = 0;
    private _collisionPosition : THREE.Vector3;
    private _collisionScene : THREE.Scene;

    private _collisionSurfaceIndices:number[];
    private _lastSurfaceIndex:number = 0;
    private _collisionSurfaces : GroundPlane[];
    private _collisionMeshes : THREE.Mesh;
    private _collisionRaycaster = THREE.Raycaster;

    private _collisionPoints : THREE.Mesh[];
    private _externalCollisionPoints : THREE.Mesh[];
    private _externalCollisionPositions : THREE.Vector3[];
    private _externalCollision : boolean[];

    constructor(geometry: THREE.Geometry, material: THREE.Material, renderer: Renderer){
        this._velocity = math.transpose(math.matrix([1,20,0,0,0,0]));
        this._state = math.transpose(math.matrix([0,40,0,0,0,Math.PI/4]));

        this._renderer = renderer;
        this._geometry = geometry;
        this._material = material;
        this._object = new THREE.Mesh(this._geometry, this._material);

        this._collisionSurfaceIndices = [];
        this._collisionSurfaces = [];
        this._collisionRaycaster = new THREE.Raycaster();

        this._collisionPosition = new THREE.Vector3(0,0,0);
        this._desiredDirection = new THREE.Vector3(0,0,0);
        this._normalDirection = new THREE.Vector3(0,0,0);
        this._realDirection = new THREE.Vector3(0,0,0);
        this._forceRadius = new THREE.Vector3(0,0,0);
        this._velocityDirection  = new THREE.Vector3(0,0,0);
        this._angularVelocityDirection  = new THREE.Vector3(0,0,0);

        this._localXDirection = new THREE.Vector3(1,0,0);
        this._localYDirection = new THREE.Vector3(0,1,0);
        this._localZDirection = new THREE.Vector3(0,0,1);

        var dir = new THREE.Vector3( 0, 1, 0 );
        var origin = new THREE.Vector3( 0, 0, 0 );
        var length = 10;

        this._normalArrow = new THREE.ArrowHelper( dir, origin, length, 0xff0000 );
        this._velocityDirectionArrow = new THREE.ArrowHelper( dir, origin, 6, 0x00ff00 );
        this._gradientArrow = new THREE.ArrowHelper( dir, origin, length, 0xff00ff );
        this._localXDirectionArrow = new THREE.ArrowHelper( dir, origin, 4, 0xff0000 );
        this._localYDirectionArrow = new THREE.ArrowHelper( dir, origin, 4, 0x00ff00 );
        this._localZDirectionArrow = new THREE.ArrowHelper( dir, origin, 4, 0x0000ff );


        if(CarSimulator.developer_mode){
            renderer.scene.add( this._localXDirectionArrow );
            renderer.scene.add( this._localYDirectionArrow );
            renderer.scene.add( this._localZDirectionArrow );
        }

        this._externalCollisionPoints = [];
        this._externalCollisionPositions = [];
        this._externalCollision = [];

        this._collisionPoints = [];
        for(var i=0; i<this.object.geometry.vertices.length; i++) {
            this._collisionPoints[i] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xffff00}));
            if(CarSimulator.developer_mode)
                renderer.scene.add(this._collisionPoints[i]);
        }

        this._collisionPoints[this._collisionPoints.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xff0000}))

        if(CarSimulator.developer_mode)
            renderer.scene.add(this._collisionPoints[this._collisionPoints.length-1]);

        this._centerOfMassPoint = new THREE.Mesh(new THREE.SphereGeometry(0.2), new THREE.MeshBasicMaterial({color: 0x00ff00, wireframe: true}));

        if(CarSimulator.developer_mode)
            renderer.scene.add( this._centerOfMassPoint );
    }

    public update(time:number, delta:number):void {
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(1,0,0), delta*this.velocity.valueOf()[3]);
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(0,1,0), delta*this.velocity.valueOf()[4]);
        this.rotateAroundWorldAxis(this.object, new THREE.Vector3(0,0,1), delta*this.velocity.valueOf()[5]);

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

        this._localXDirection = new THREE.Vector3(1,0,0).applyQuaternion(this.object.getWorldQuaternion());
        this._localYDirection = new THREE.Vector3(0,1,0).applyQuaternion(this.object.getWorldQuaternion());
        this._localZDirection = new THREE.Vector3(0,0,1).applyQuaternion(this.object.getWorldQuaternion());

        this._localXDirectionArrow.setDirection(this._localXDirection);
        this._localYDirectionArrow.setDirection(this._localYDirection);
        this._localZDirectionArrow.setDirection(this._localZDirection);

        this._localXDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this._localYDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);
        this._localZDirectionArrow.position.set(this.object.position.x, this.object.position.y, this.object.position.z);

        //this.setCollisionSurfaceIndices();
    }

    public rotateAroundWorldAxis( object:THREE.Mesh, axis:THREE.Vector3, radians:number ) {
        var rotationMatrix = new THREE.Matrix4();

        rotationMatrix.makeRotationAxis( axis.normalize(), radians );
        rotationMatrix.multiply( object.matrix );
        object.matrix = rotationMatrix;
        object.rotation.setFromRotationMatrix( object.matrix );
    }

    public addCollisionPoint(position: THREE.Vector3){
        this._externalCollisionPositions[this._externalCollisionPositions.length] = position;
        this._externalCollision[this._externalCollision.length] = false;
        this._externalCollisionPoints[this._externalCollisionPoints.length] = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 32), new THREE.MeshBasicMaterial({color: 0xffff00}))
        this._externalCollisionPoints[this._externalCollisionPoints.length-1].position.set(position.x, position.y, position.z);
        this._renderer.scene.add(this._externalCollisionPoints[this._externalCollisionPoints.length-1]);
    }

    public connectCollisionSurfaces(surfaces : THREE.Mesh[]){
        this._collisionMeshes = surfaces;
    }


    public newCheckCollisions():number[][] {
        for(var i=0; i<this._externalCollisionPoints.length; i++)
            this._externalCollision[i] = false;

        var collisions:number[] = [];
        if (this._collisionMeshes) {

            for (var extColIdx = 0; extColIdx < this._externalCollisionPoints.length; extColIdx++) {
                var vertPos:THREE.Vector3 = this._externalCollisionPositions[extColIdx].clone();
                vertPos.applyQuaternion(this._object.getWorldQuaternion());
                this._externalCollisionPoints[extColIdx].position.set(vertPos.x, vertPos.y, vertPos.z).add(this._object.position);


                var testPos = this._externalCollisionPoints[extColIdx].position.clone();
                testPos.setY(30);
                this._collisionRaycaster.set(testPos, new Vector3(0, -1, 0));
                var intersects = this._collisionRaycaster.intersectObjects(this._collisionMeshes, true);

                if (intersects[0]) {
                    if (intersects[0].point.y >= this._externalCollisionPoints[extColIdx].position.y) {
                        var collisionPos:THREE.Vector3 = intersects[0].point.clone();

                        var vert1:THREE.Vector3 = intersects[0].object.geometry.vertices[intersects[0].face.a].clone().add(intersects[0].object.position);
                        var vert2:THREE.Vector3 = intersects[0].object.geometry.vertices[intersects[0].face.b].clone().add(intersects[0].object.position);
                        var vert3:THREE.Vector3 = intersects[0].object.geometry.vertices[intersects[0].face.c].clone().add(intersects[0].object.position);

                        var vertexNormals = [
                            intersects[0].face.vertexNormals[0],
                            intersects[0].face.vertexNormals[1],
                            intersects[0].face.vertexNormals[2]
                        ];

                        var collision = this.handleCollision(this._externalCollisionPoints[extColIdx].position, vert1, vert2, vert3, vertexNormals);
                        if (collision != 0) {
                            //this._externalCollision[extColIdx] = true;
                            collisions.push(collision);
                        }
                    }
                    if (intersects[0].point.y+0.6 >= this._externalCollisionPoints[extColIdx].position.y) {
                        this._externalCollision[extColIdx] = true;
                    }
                }
            }
        }

        return collisions;
    }


    private handleCollision(vertPos:THREE.Vector3, vert1:THREE.Vector3, vert2:THREE.Vector3, vert3:THREE.Vector3, vertexNormals:THREE.Vector3[]){
        var areaT = this.triangleArea(vert1, vert2, vert3);
        var areaB = this.triangleArea(vert1, vertPos, vert3);
        var areaC = this.triangleArea(vert1, vertPos, vert2);
        var areaA = areaT - areaB - areaC;

        var c1 = areaA / areaT;
        var c2 = areaB / areaT;
        var c3 = areaC / areaT;

        this._normalDirection = new THREE.Vector3(
            vertexNormals[0].x * c1 + vertexNormals[1].x * c2 + vertexNormals[2].x * c3,
            vertexNormals[0].y * c1 + vertexNormals[1].y * c2 + vertexNormals[2].y * c3,
            vertexNormals[0].z * c1 + vertexNormals[1].z * c2 + vertexNormals[2].z * c3
        );

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

    public showAxis():void {

    }

    private triangleArea(A:THREE.Vector3, B:THREE.Vector3, C:THREE.Vector3):number {
        var a = Math.sqrt(Math.pow(A.x-B.x,2) + Math.pow(A.y-B.y,2) + Math.pow(A.z-B.z,2));
        var b = Math.sqrt(Math.pow(A.x-C.x,2) + Math.pow(A.y-C.y,2) + Math.pow(A.z-C.z,2));
        var c = Math.sqrt(Math.pow(B.x-C.x,2) + Math.pow(B.y-C.y,2) + Math.pow(B.z-C.z,2));

        var s =(1/2)*(a+b+c);

        return Math.sqrt(s*(s-a)*(s-b)*(s-c))
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

    get velocityDirection():THREE.Vector3 {
        return this._velocityDirection;
    }

    set velocityDirection(value:THREE.Vector3) {
        this._velocityDirection = value;
    }

    get realDirection():THREE.Vector3 {
        return this._realDirection;
    }

    set realDirection(value:THREE.Vector3) {
        this._realDirection = value;
    }

    get hasCollisionSurface():boolean {
        return this._hasCollisionSurface;
    }

    set hasCollisionSurface(value:boolean) {
        this._hasCollisionSurface = value;
    }

    get isColliding():boolean {
        return this._isColliding;
    }

    set isColliding(value:boolean) {
        this._isColliding = value;
    }

    get surfaceDistance():number {
        return this._surfaceDistance;
    }

    set surfaceDistance(value:number) {
        this._surfaceDistance = value;
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

    get collisionPoints():THREE.Mesh[] {
        return this._collisionPoints;
    }

    set collisionPoints(value:Array) {
        this._collisionPoints = value;
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

    get localYDirection():THREE.Vector3 {
        return this._localYDirection;
    }

    get localXDirection():THREE.Vector3 {
        return this._localXDirection;
    }

    get localZDirection():THREE.Vector3 {
        return this._localZDirection;
    }

    get externalCollision():boolean[] {
        return this._externalCollision;
    }

    get angularVelocityDirection():THREE.Vector3 {
        return this._angularVelocityDirection;
    }

}