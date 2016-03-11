/**
 * Created by filles-dator on 2016-02-08.
 */

///<reference path="./vehiclesetup.ts"/>
///<reference path="./vehicle.ts"/>
///<reference path="./relative_dynamic_body.ts"/>

class Car extends VehicleSetup {

    constructor(renderer : Renderer, vehicle : Vehicle){
        super(renderer, vehicle);

        this.steering = new Steering(0);
        this.motor = new Motor(20000, 100);

        this.wheels = [
            new Wheel(renderer, new THREE.Vector3(-3, -1, -4)),
            new Wheel(renderer, new THREE.Vector3(3, -1, -4)),
            new Wheel(renderer, new THREE.Vector3(-3, -1, 4)),
            new Wheel(renderer, new THREE.Vector3(3, -1, 4))
        ];

        vehicle.vehicleModel.object.add(this.wheels[0].object);
        this.wheels[0].connectVehicle(vehicle);
        this.wheels[0].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[0].object.position.clone().add(new Vector3(0,-1.3,0));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[0].object.position.clone().add(new Vector3(1,3.5,0));

        vehicle.vehicleModel.object.add(this.wheels[1].object);
        this.wheels[1].connectVehicle(vehicle);
        this.wheels[1].connectSteering(this.steering);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[1].object.position.clone().add(new Vector3(0,-1.3,0));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[1].object.position.clone().add(new Vector3(-1,3.5,0));

        vehicle.vehicleModel.object.add(this.wheels[2].object);
        this.wheels[2].connectVehicle(vehicle);
        this.wheels[2].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[2].object.position.clone().add(new Vector3(0,-1.3,0));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[2].object.position.clone().add(new Vector3(1,2.5,0));

        vehicle.vehicleModel.object.add(this.wheels[3].object);
        this.wheels[3].connectVehicle(vehicle);
        this.wheels[3].connectMotor(this.motor);
        vehicle.vehicleModel.addCollisionPoint(this.wheels[3].object.position.clone().add(new Vector3(0,-1.3,0));
        vehicle.vehicleModel.addCollisionPoint(this.wheels[3].object.position.clone().add(new Vector3(-1,2.5,0));

        this.vehicleBody = new RelativeDynamicBody(new THREE.BoxGeometry( 5, 2, 8 ), new THREE.MeshBasicMaterial({color: 0xff00ff, wireframe: true}), renderer, this.vehicle);
        vehicle.vehicleModel.object.add(this.vehicleBody.object)

        //this.springs = [
        //    new Spring(renderer, this.vehicle, 0)
        //];

    }
}