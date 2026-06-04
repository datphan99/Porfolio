export const LINE1 = "MAKE EVERY PIXEL";
export const LINE2 = "PAY FOR ITSELF";
export const TN = 20;
export const TRACK_EM = 0.06; // letter-spacing as fraction of font size

export const VERT = `attribute vec2 aPos;varying vec2 vUv;void main(){vUv=aPos*0.5+0.5;gl_Position=vec4(aPos,0.0,1.0);}`;

export const FRAG = [
  "precision highp float;",
  "varying vec2 vUv;",
  "uniform sampler2D uTex;",
  "uniform float uTime;",
  "uniform float uAspect;",
  "uniform vec2  uLogo;",
  "uniform vec3  uTrail[20];",
  "uniform float uReveal;",
  "uniform float uBreath;",
  "void main(){",
  "  vec2 uv=vUv;",
  "  vec2 off=vec2(0.0); float hgt=0.0;",
  // perpetual logo distortion
  "  vec2 dl=uv-uLogo; dl.x*=uAspect;",
  "  float distL=length(dl);",
  "  float fl=exp(-distL*15.0);",
  "  float phL=distL*55.0-uTime*3.0;",
  "  vec2 dirL=normalize(uv-uLogo+1e-6);",
  "  off+=dirL*sin(phL)*0.010*fl;",
  "  hgt+=cos(phL)*0.010*fl;",
  // cursor water trail
  "  for(int i=0;i<20;i++){",
  "    vec3 p=uTrail[i];",
  "    vec2 dd=uv-p.xy; dd.x*=uAspect;",
  "    float dist=length(dd);",
  "    float fo=exp(-dist*38.0);",
  "    float ph=dist*22.0-uTime*5.0;",
  "    vec2 dir=normalize(uv-p.xy+1e-6);",
  "    off+=dir*sin(ph)*0.018*fo*p.z;",
  "    hgt+=cos(ph)*0.018*fo*p.z;",
  "    float fr=exp(-dist*14.0);",
  "    float phr=dist*70.0-uTime*7.0;",
  "    off+=dir*sin(phr)*0.004*fr*p.z;",
  "    hgt+=cos(phr)*0.004*fr*p.z;",
  "  }",
  // idle breath — ring expanding from centre when field rests
  "  if(uBreath>0.0){",
  "    vec2 bc=uv-vec2(0.5); bc.x*=uAspect; float bd=length(bc);",
  "    float env=sin(uBreath*3.14159);",
  "    float front=exp(-abs(bd-uBreath*0.55)*9.0);",
  "    float wave=sin(bd*30.0-uBreath*26.0);",
  "    vec2 bdir=normalize(uv-vec2(0.5)+1e-6);",
  "    off+=bdir*wave*0.015*env*front;",
  "    hgt+=cos(bd*30.0-uBreath*26.0)*0.015*env*front;",
  "  }",
  // entrance: text condenses out of white mist once on load
  "  float rev=clamp(uReveal,0.0,1.0);",
  "  float n=sin(uv.x*7.0+uTime*0.6)*cos(uv.y*8.0-uTime*0.5);",
  "  off+=vec2(n,-n)*0.06*(1.0-rev);",
  "  vec2 uv2=uv+off;",
  "  float ca=length(off)*0.9;",
  "  vec2 cdir=normalize(off+1e-6);",
  "  float r=texture2D(uTex,uv2+cdir*ca).r;",
  "  float g=texture2D(uTex,uv2).g;",
  "  float b=texture2D(uTex,uv2-cdir*ca).b;",
  "  vec3 col=vec3(r,g,b);",
  "  col+=hgt*3.3;",
  "  col=mix(vec3(1.0),col,smoothstep(0.0,1.0,rev));",
  "  gl_FragColor=vec4(clamp(col,0.0,1.0),1.0);",
  "}",
].join("\n");
