#ifdef GL_ES
precision mediump float;
#endif 

uniform vec2 u_resolution;
uniform float u_time;

float noise1d(float v){
    return cos(v + cos(v * 90.1415) * 100.1415) * 0.5 + 0.5;
}

void main(){
    vec2 coord = gl_FragCoord.xy;
    vec3 color = vec3(0.0);

    color.r += noise1d(u_time);

    gl_FragColor = vec4(color, 1.0);
}