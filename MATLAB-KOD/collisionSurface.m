function col_surf = collisionSurface()
    x = linspace(-50,50);
    y = sin(x/5)*3;
    col_surf = [x; y];
end

