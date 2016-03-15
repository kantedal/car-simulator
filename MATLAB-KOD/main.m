delta = 0.01667;

%Dynamic rigid body vectors and matrices
dim = [6,2]; % Width and height
mass = 500;
inertia_tensor = 500;

pos = [0; 10; 0]; % Postion and rotationx
vel = [0; 0; 0]; % Postion and rotation

M = [mass 0 0; 0 mass 0; 0 0 inertia_tensor]; % Haiku
Fext = M * [0; -9.82; 0]; % External forces
Fc = [0; 0; 0];
F = [Fext(1); Fext(2); Fext(3)]; % Forces combined

col_rect = rect(pos(1), pos(2), pos(3), dim(1), dim(2));
col_surf = collisionSurface();

wheel_distance = [1.5; 1.5]; 
wheel_pos = [3 -3; 17 17; 0 0];
wheel_vel = [0; 0];
wheel_force = M*[0 0;-9.82 -9.82; 0 0];
wheel_radius = 1;
wheel_vertIdx = [4 1; 3 2];
wheel_isColliding = [false; false];

wheel1_handle = circle(wheel_pos(1,1), wheel_pos(2,1), wheel_radius);    
wheel2_handle = circle(wheel_pos(1,2), wheel_pos(2,2), wheel_radius);

spring_velocity = [0 0];
spring_axis = [0 0; 0 0; 0 0];

plot(col_surf(1,:),col_surf(2,:));
axis([-30 30 -10 50]);
hold on;
rect_handle = plotObject(col_rect);

for i=0:delta:20
    delete(rect_handle);
    delete(wheel1_handle);
    delete(wheel2_handle);
    
    col_rect = rect(pos(1), pos(2), pos(3), dim(1), dim(2));
    
    %%Set wheel pos to distance from axis
    for i=1:2
        wheel_pos(:,i) = projPointOnLine(wheel_distance(i), [col_rect(wheel_vertIdx(2,i),:)'; 0], [col_rect(wheel_vertIdx(1,i),:)'; 0]);
    end
    
    wheel1_handle = circle(wheel_pos(1,1), wheel_pos(2,1), wheel_radius);
    wheel2_handle = circle(wheel_pos(1,2), wheel_pos(2,2), wheel_radius);
    rect_handle = plotObject(col_rect);
    
    
    %Spring constraints
    for i=1:2
        wheelPos = wheel_pos(:,i);
        bodyPos = col_rect(wheel_vertIdx(1,i),:)';
        
        spring_axis(:,i) = [col_rect(wheel_vertIdx(2,i),:)'; 0] - [col_rect(wheel_vertIdx(1,i),:)'; 0];
        spring_axis(:,i) = spring_axis(:,i)/norm(spring_axis(:,i));
        spring_velocity(i) = springConstraint2(wheel_distance(i), spring_velocity(i), mass);
        
        vel = vel + delta*spring_axis(:,i)*spring_velocity(i);     
        %vel(3) = 5*delta*springRotImpulse([col_rect(wheel_vertIdx(1,i),:)'; 0], pos, spring_velocity(i), vel, spring_axis(:,i), M);
        wheel_vel(i) = wheel_vel(i) - delta*spring_velocity(i);    
    end
    
    %Collision constraints
    Fc = [0;0;0];
    force_radius = [0 0];
    normal = [0 0];
    for idx=1:4
        collision = isColliding([pos(1) pos(2)], col_rect(idx,:), col_surf);
       
        force_radius = collision(1,:);
        normal = collision(2,:);
     
        if(abs(force_radius) ~= 0)
            vel = vel + collisionConstraint(vel,F,delta,normal,force_radius,M,0);
        end
    end
    
    new_vel = vel;
    for i=1:2
        wheel_collision = isWheelColliding([pos(1) pos(2)], wheel_pos(:,i), wheel_radius, col_surf);
        force_radius = wheel_collision(1,:);
        normal = wheel_collision(2,:); 
        collision_pos = wheel_collision(3,:);
        
        if(abs(force_radius) ~= 0)
            spring_weight = dot(normal, [spring_axis(1,i); spring_axis(2,i)]);
            %penetration = wheel_pos(2,i)-collision_pos(2)
            penetration = sqrt((wheel_pos(1,i)-collision_pos(1))^2 + (wheel_pos(2,i)-collision_pos(2))^2)-1;
            
            force_radius = [col_rect(wheel_vertIdx(1,i),1) - pos(1), col_rect(wheel_vertIdx(1,i),2) - pos(2)];
            collision_wheel_vel = collisionConstraint(wheel_vel(i)*spring_axis(:,i),F,delta,[spring_axis(1,i); spring_axis(2,i)],normal,M,penetration);    
            collision_vel = collisionConstraint(vel,F,delta,normal,force_radius,M,penetration);
           
            new_vel(1) = new_vel(1) + (1-abs(spring_weight))*collision_vel(1);
            new_vel(2) = new_vel(2) + (1-abs(spring_weight))*collision_vel(2);
            new_vel(3) = new_vel(3) + collision_vel(3);
            
            if(i == 2)
                %pause(10);
            end
            
            wheel_vel(i) = wheel_vel(i) + dot(collision_wheel_vel, spring_axis(:,i));
        end
        
        wheel_vel(i) = wheel_vel(i) + delta*dot(spring_axis(:,i), wheel_force(:,i))/mass;
        wheel_distance(i) = wheel_distance(i) + delta*(dot(spring_axis(:,i), vel)-wheel_vel(i));
    end
    vel = new_vel;
    
    F = [Fext(1) + Fc(1); Fext(2) + Fc(2); Fext(3) + Fc(3)]; % Forces combined
    vel = vel + inv(M) * F * delta;
    pos = pos + delta*vel;
    
    pause(delta)
end


close all
clear all