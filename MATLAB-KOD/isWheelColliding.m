function collision = isWheelColliding(com, point, radius, col_surf)
    force_radius = [0 0];
    normal = [0 0];
    collision_pos = [0 0];

    for idx=1:100
        if(sqrt((point(1)-col_surf(1,idx))^2 + (point(2)-col_surf(2,idx))^2) < radius)
            rot_mat = [cos(pi/2), -sin(pi/2); sin(pi/2), cos(pi/2)];
        
            tangent = [(col_surf(1,idx+1) - col_surf(1,idx-1)); (col_surf(2,idx+1) - col_surf(2,idx-1))];
            tangent = tangent./norm(tangent);

            normal = (rot_mat*tangent)';
            force_radius = [point(1) - com(1), point(2) - com(2)];
            collision_pos = [col_surf(1,idx), col_surf(2,idx)];
            
            break;
        end
    end
    
    collision = [force_radius; normal; collision_pos];
end

