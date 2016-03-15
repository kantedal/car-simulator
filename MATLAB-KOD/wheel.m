function wheelPos = wheel(worldX, worldY, rot, localX, localY)   
    rot_mat = [cos(rot), -sin(rot); sin(rot), cos(rot)];
    
    wheelPos = rot_mat*[localX localY]';
    wheelPos = wheelPos + [worldX worldY]';
end