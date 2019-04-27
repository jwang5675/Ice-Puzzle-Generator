#version 300 es
precision highp float;

uniform sampler2D u_TexUp;
uniform sampler2D u_TexRight;
uniform sampler2D u_TexDown;
uniform sampler2D u_TexLeft;
uniform sampler2D u_TexIce;
uniform sampler2D u_TexRock;
uniform sampler2D u_TexEnd;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec3 fs_Translate;

out vec4 out_Col;

vec4 getTextureColor() {
	vec2 uv = fs_Pos.xy + vec2(0.5);
  	uv.y = 1.0 - uv.y;

  	if (fs_Translate.z == 0.01) {
  		return texture(u_TexUp, uv);
  	} else if (fs_Translate.z == 0.02) {
  		return texture(u_TexDown, uv);
  	} else if (fs_Translate.z == 0.03) {
  		return texture(u_TexLeft, uv);
  	} else if (fs_Translate.z == 0.04) {
  		return texture(u_TexRight, uv);
  	} else if (fs_Col[3] == 0.1) {
  		return texture(u_TexRock, uv);
  	} else if (fs_Col[3] == 0.2) {
  		return texture(u_TexEnd, uv);
  	} else {
  		return texture(u_TexIce, uv);
  	}
}

void main() {
    out_Col = getTextureColor();
}