#version 300 es

uniform mat4 u_ViewProj;
uniform float u_Time;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Nor; // Non-instanced, and presently unused
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene
in vec2 vs_UV; // Non-instanced, and presently unused in main(). Feel free to use it for your meshes.

out vec4 fs_Col;
out vec4 fs_Nor;
out vec4 fs_Pos;

void main() {
    fs_Pos = vs_Pos;
    fs_Nor = vs_Nor;
    fs_Col = vs_Col;

    vec3 transformedPos = vs_Pos.xyz + vs_Translate;

    gl_Position = u_ViewProj * vec4(transformedPos, 1.0);
}
