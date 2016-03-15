function rect = rect(x,y,rot,w,h)
    rect = 1/2*[-w -h; -w h; w h; w -h];
    
    rot_mat = [cos(rot), -sin(rot); sin(rot), cos(rot)];
    
    for i=1:4
        rect(i,:) = rot_mat*rect(i,:)';
        rect(i,:) = rect(i,:) + [x,y];
    end
    
end