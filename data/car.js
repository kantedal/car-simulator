///<reference path="./vehiclesetup.ts"/>
///<reference path="./vehicle.ts"/>
///<reference path="./relative_dynamic_body.ts"/>
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Car = (function (_super) {
    __extends(Car, _super);
    function Car(renderer, vehicle) {
        _super.call(this, renderer, vehicle);
        this.steering = new Steering(0);
        this.motor = new Motor(20000, 100);
        this.wheels = [
            new Wheel(renderer, new THREE.Vector3(-3, 0, -4)),
            new Wheel(renderer, new THREE.Vector3(3, 0, -4)),
            new Wheel(renderer, new THREE.Vector3(-3.8, 0, 5)),
            new Wheel(renderer, new THREE.Vector3(3.8, 0, 5))
        ];
        vehicle.vehicleModel.object.add(this.wheels[0].object);
        this.wheels[0].connectVehicle(vehicle);
        this.wheels[0].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[0].object.position.clone().add(new Vector3(0, -1.3, 0)));
        vehicle.vehicleModel.object.add(this.wheels[1].object);
        this.wheels[1].connectVehicle(vehicle);
        this.wheels[1].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[1].object.position.clone().add(new Vector3(0, -1.3, 0)));
        vehicle.vehicleModel.object.add(this.wheels[2].object);
        this.wheels[2].connectVehicle(vehicle);
        this.wheels[2].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[2].object.position.clone().add(new Vector3(0, -1.3, 0)));
        vehicle.vehicleModel.object.add(this.wheels[3].object);
        this.wheels[3].connectVehicle(vehicle);
        this.wheels[3].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[3].object.position.clone().add(new Vector3(0, -1.3, 0)));
        //vehicle.vehicleModel.addCollisionPoint(this.wheels[0].object.position.clone().add(new Vector3(2,3.5,-1)));
        //33vehicle.vehicleModel.addCollisionPoint(this.wheels[1].object.position.clone().add(new Vector3(-2,3.5,-1)));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[2].object.position.clone().add(new Vector3(2, 2.5, 1)));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[3].object.position.clone().add(new Vector3(-2, 2.5, 1)));
        if (CarSimulator.developer_mode)
            this.vehicleBody = new RelativeDynamicBody(new THREE.BoxGeometry(5, 2, 8), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }), renderer, this.vehicle, this.vehicle.vehicleModel.velocity);
        else
            this.vehicleBody = new RelativeDynamicBody(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshBasicMaterial({ color: 0xff00ff, wireframe: true }), renderer, this.vehicle, this.vehicle.vehicleModel.velocity);
        vehicle.vehicleModel.object.add(this.vehicleBody.object);
        this.springConnector = [
            new SpringConnector(renderer, vehicle.vehicleModel, this.wheels[0], this.vehicleBody, this.wheels[0].object.position.clone().add(new THREE.Vector3(2.2, 0.6, 0.5)), this.wheels[0].object.position.clone().add(new THREE.Vector3(0.5, 0, 0))),
            new SpringConnector(renderer, vehicle.vehicleModel, this.wheels[1], this.vehicleBody, this.wheels[1].object.position.clone().add(new THREE.Vector3(-2.2, 0.6, 0.5)), this.wheels[1].object.position.clone().add(new THREE.Vector3(-0.5, 0, 0))),
            new SpringConnector(renderer, vehicle.vehicleModel, this.wheels[2], this.vehicleBody, this.wheels[2].object.position.clone().add(new THREE.Vector3(2.5, 2, 0)), this.wheels[2].object.position.clone().add(new THREE.Vector3(0.5, 0, 0))),
            new SpringConnector(renderer, vehicle.vehicleModel, this.wheels[3], this.vehicleBody, this.wheels[3].object.position.clone().add(new THREE.Vector3(-2.5, 2, 0)), this.wheels[3].object.position.clone().add(new THREE.Vector3(-0.5, 0, 0))),
        ];
        var targetMesh = new THREE.Mesh(new THREE.BoxGeometry(0, 0, 0), new THREE.MeshBasicMaterial({ color: 0xff0000, wireframe: true }));
        targetMesh.position.set(0, 3, -15);
        this.vehicleBody.object.add(targetMesh);
        this.spotLight = new THREE.SpotLight(0xffffff);
        this.spotLight.position.set(0, 2, -3);
        this._spotLight.decay = 3;
        this.spotLight.exponent = 50000;
        this.spotLight.distance = 20;
        this.spotLight.intensity = 10;
        this._spotLight.target = targetMesh;
        this.vehicleBody.object.add(this.spotLight);
    }
    return Car;
})(VehicleSetup);
//# sourceMappingURL=car.js.map