    #ifdef GL_ES
precision mediump float;
#endif
    
    uniform vec2 u_resolution;
    uniform float u_time;
  
    const int octaves = 1;
    const float seed2 = 73156.8473192;
    const float seed = 43758.5453123;
  
    float time;
  
    /*
      Tri-Noise Texture
      Liam Egan - 2018
      ----------------------

      Tri-noise is my new love, I think. It's cheap, slightly regular and slightly chaotic. 
      Here I'm just using layering 3 of them together in a distortion matrix.
      
      Many many thanks to Inigo Quilez, Patricio Gonzalez Vivo, 
      Gary Warne, Nimitz, and many many others.
      "Nanos gigantum humeris insidentes"

    */
  

// ------------------------------
  // Credit: Nimitz (ShaderToy.com, Stormoid.com), who came up with the clever idea to use overlapping triangle functions to create cheap noise.
  // Also to Gary "Shane" Warne at Shader Toy for the full implementation used here.

  const mat2 m2 = mat2(0.75, 1.2990381, -1.2990381, 0.75);

  float tri(float x){ return abs(fract(x)-0.5); }
  float triXY(vec2 p){ return tri(p.x+tri((p.y-0.25)*1.5)) + tri(p.y-tri((p.x+0.5)*1.5)); }
  float tri2(vec2 p){
      // return tri(p.x + 0.25 + tri(p.y*1.5))+tri(p.y - 0.25 + tri(p.x*1.5));
      // return tri(p.x + 0.25 + tri(p.y*0.5))+tri(p.y - 0.25 + tri(p.x*0.5));
      // float t = sin(u_time * .1);
      return tri(p.x + tri(p.y*0.5 + 0.3333)) + tri(p.y + tri(p.x*0.5 - 0.1666));

  }

  float triNoise2D(vec2 p){
    
    // mat2 m2 = m2 * sin(u_time);

      float n = tri2(p);//(tri(p.x + tri(p.y*0.5 + 0.3333)) + tri(p.y + tri(p.x*0.5 - 0.1666)));//tri2(p);//
      p *= m2;
      n += tri2(p)*0.7071;//(tri(p.x + tri(p.y*0.5 + 0.3333)) + tri(p.y + tri(p.x*0.5 - 0.1666)))*0.7071;
      p *= m2;
      n += tri2(p)*0.5;//(tri(p.x + tri(p.y*0.5 + 0.3333)) + tri(p.y + tri(p.x*0.5 - 0.1666)))*0.5;   
      return n/(2.2071);

  }

  // This is the smooth version of the tri function above. Sometimes, it's preferrable. Other times, not so much.
  float triSmooth(in float x){return 0.25+0.25*cos((x)*6.2831853);}
  float triSmooth2(float x){ x = abs(fract(x)-0.5); return x*x*(6.-8.*x); }
  float triSmoothXY(vec2 p){ return triSmooth(p.x+triSmooth((p.y-0.25)*1.5)) + triSmooth(p.y-triSmooth((p.x+0.5)*1.5)); }
  float triSmoothNoise2D(vec2 p, float ani_seed){
    
    // mat2 m2 = m2 * (sin(u_time / 20.) + .5;
    float t = ani_seed * .3333;
    float t1 = ani_seed * .15;

      float n = (triSmooth(p.x + triSmooth(p.y*0.5 + t)) + triSmooth(p.y + triSmooth(p.x*0.5 - t1)));
      p *= m2;
      n += (triSmooth(p.x + triSmooth(p.y*0.5 + t)) + triSmooth(p.y + triSmooth(p.x*0.5 - t1)))*0.7071;
      p *= m2;
      n += (triSmooth(p.x + triSmooth(p.y*0.5 + t)) + triSmooth(p.y + triSmooth(p.x*0.5 - t1)))*0.5;   
      return n/(2.2071) * .5 + .5;

  }

  // ------------------------------
  
  float pattern(vec2 uv, float seed, float time, inout vec2 q, inout vec2 r) {

    q = vec2( triSmoothNoise2D( uv + vec2(0.0,0.0), seed ),
                   triSmoothNoise2D( uv + vec2(5.2,1.3), seed ) );

    r = vec2( triSmoothNoise2D( uv + 4.0*q + vec2(1.7 - time / 2.,9.2), seed ),
                   triSmoothNoise2D( uv + 4.0*q + vec2(8.3 - time / 2.,2.8), seed ) );

    vec2 s = vec2( triSmoothNoise2D( uv + 5.0*r + vec2(21.7 - time / 2.,90.2), seed ),
                   triSmoothNoise2D( uv + 5.0*r + vec2(80.3 - time / 2.,20.8), seed ) );

    return triSmoothNoise2D( uv + 4.0*s, seed );
  }
  
  vec4 colour(float pattern, vec2 distortion1, vec2 distortion2) {
    
    // All I'm doing here is mixing up the colours using the distortion vectors and the derrived pattern
    vec3 col = vec3(pattern * distortion2.x, pattern * distortion2.y, pattern * distortion1.x * 2.);
    
    // Try muxing the colours here. Uncomment the following lines, 1-by-1 for some examples
    // col = vec3(col.b, col.r, col.g);
    // col = vec3(col.b * col.r) / col;
    // col *= vec3(dot(distortion1, distortion1) * .5);
    // col = col * (1.5 + sin(gl_FragCoord.x / u_resolution.x * 10.) * .5 + cos(gl_FragCoord.y / u_resolution.y * 10.) * .5);
    // col = 1. - col;
    // col *= sin(col * 2.);
    
    // Ramping up the contrast a bit
    col = col * col * 2.;
    
    return vec4(col, 1.);
  }
  
  void main() {
    
    time = u_time * .1;
    
    vec2 fragCoord = gl_FragCoord.xy;
      // Screen coordinates.
    vec2 uv = (fragCoord - u_resolution.xy*.5)/u_resolution.y;
    
    uv *= 3.5;
    
    vec2 q = vec2(0.);
    vec2 r = vec2(0.);
    
    float pattern = pattern(uv, seed, time, q, r);
    
    vec4 colour = colour(pattern, q, r);
    
    gl_FragColor = colour;
  }
