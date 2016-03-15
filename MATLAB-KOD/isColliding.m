function collision = isColliding(com, point, col_surf)
    closestIdx = 1;
    for idx=2:100
        if(abs(point(1)-col_surf(1,idx)) < abs(point(1)-col_surf(1,closestIdx)))
            closestIdx = idx;
        end
    end
    
    force_radius = [0 0];
    normal = [0 0];
    
    if(point(2) <= col_surf(2,closestIdx))
        rot_mat = [cos(pi/2), -sin(pi/2); sin(pi/2), cos(pi/2)];
        
        tangent = [(col_surf(1,closestIdx+1) - col_surf(1,closestIdx-1)); (col_surf(2,closestIdx+1) - col_surf(2,closestIdx-1))];
        tangent = tangent./norm(tangent);
        
        normal = (rot_mat*tangent)';
        force_radius = [point(1) - com(1), point(2) - com(2)];
    end
    
    collision = [force_radius; normal];
end

