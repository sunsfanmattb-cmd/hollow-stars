'use strict';
/* ================= v2.0 3D TABLE =================
   One WebGL canvas behind the match UI. The faction's painted board becomes a lit table: bump from the art itself,
   coloured point lights that flicker and move (so shadows move), drifting fog from a pre-made noise texture, a raised
   rim, soft shadows under every minion (and under a card while you drag it), and tappable board toys:
     The Abyss      - a pool a tentacle rises from + a bubbling pool       (light: drifting rift glow)
     The Derelict   - a sparking console + a rotating alarm beacon        (light: sweeping beacon, flickering overhead)
     The Red Communion - two candle clusters that gutter out and relight   (light: candle flames)
   Battery: it draws only when something changes. Idle = 12 fps (fog, flames); attacks, toy taps and camera moves = up to
   60 fps (30 on phones) for their duration; nothing at all behind the legendary cinematic, while the battery saver sleeps,
   or in the background. It replaces the 2D "living board" canvas that used to redraw at 30 fps. Low quality, reduced
   motion or no WebGL = the classic flat board, unchanged. */

const B3={on:0,ok:null,gl:null,cv:null,W:0,H:0,rs:1,fac:'v',tex:{},noise:null,raf:0,tm:0,act:0,last:0,toks:[],tokDirty:1,
 cam:null,spr:[],toys:[],lights:[],t0:performance.now(),frames:0,lunge:null,sleep:0};
const B3_MOBILE=/Android|iPhone|iPad|Mobile/i.test(navigator.userAgent);

/* ---------- small matrix kit (column-major) ---------- */
const M4={
 persp(f,a,n,fa){const t=1/Math.tan(f/2),r=1/(n-fa);return new Float32Array([t/a,0,0,0,0,t,0,0,0,0,(n+fa)*r,-1,0,0,2*n*fa*r,0])},
 look(e,c,u){let z=[e[0]-c[0],e[1]-c[1],e[2]-c[2]];let l=Math.hypot(...z);z=z.map(v=>v/l);let x=[u[1]*z[2]-u[2]*z[1],u[2]*z[0]-u[0]*z[2],u[0]*z[1]-u[1]*z[0]];l=Math.hypot(...x);x=x.map(v=>v/l);
  const y=[z[1]*x[2]-z[2]*x[1],z[2]*x[0]-z[0]*x[2],z[0]*x[1]-z[1]*x[0]];
  return new Float32Array([x[0],y[0],z[0],0,x[1],y[1],z[1],0,x[2],y[2],z[2],0,-(x[0]*e[0]+x[1]*e[1]+x[2]*e[2]),-(y[0]*e[0]+y[1]*e[1]+y[2]*e[2]),-(z[0]*e[0]+z[1]*e[1]+z[2]*e[2]),1])},
 mul(a,b){const o=new Float32Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
};

/* ---------- shaders ---------- */
const B3_HEAD='#ifdef GL_FRAGMENT_PRECISION_HIGH\nprecision highp float;\n#else\nprecision mediump float;\n#endif\n';
const B3_LIGHT=`
uniform vec4 uL[4];uniform vec3 uLC[4];uniform vec3 uAmb;
vec3 lit(vec3 p,vec3 n,float wet){vec3 c=uAmb;for(int i=0;i<4;i++){vec3 d=uL[i].xyz-p;float r=length(d);vec3 l=d/r;float a=uL[i].w/(1.0+r*r*0.0000065);
 float df=max(dot(n,l),0.0);vec3 h=normalize(l+vec3(0.0,0.0,1.0));float sp=pow(max(dot(n,h),0.0),40.0)*wet;c+=uLC[i]*a*(df+sp);}return c;}`;
const B3_VS_TABLE=`attribute vec3 aP;attribute vec2 aU;uniform mat4 uM;varying vec2 vU;varying vec3 vP;void main(){vU=aU;vP=aP;gl_Position=uM*vec4(aP,1.0);}`;
const B3_FS_TABLE=B3_HEAD+B3_LIGHT+`
varying vec2 vU;varying vec3 vP;uniform sampler2D uT;uniform sampler2D uN;uniform vec2 uTx;uniform float uTime;uniform vec3 uFogC;uniform float uFog;uniform float uWet;
uniform vec2 uWH;
void main(){
 vec3 al=texture2D(uT,vU).rgb;
 float l0=dot(al,vec3(.3,.59,.11));float lx=dot(texture2D(uT,vU+vec2(uTx.x,0.0)).rgb,vec3(.3,.59,.11));float ly=dot(texture2D(uT,vU+vec2(0.0,uTx.y)).rgb,vec3(.3,.59,.11));
 vec3 n=normalize(vec3((l0-lx)*5.0,(l0-ly)*5.0,1.0));
 vec3 c=al*lit(vP,n,uWet*smoothstep(.05,.4,l0));
 vec2 sc=vP.xy/uWH;float f1=texture2D(uN,sc*1.3+vec2(uTime*0.006,uTime*0.004)).r;float f2=texture2D(uN,sc*2.7-vec2(uTime*0.009,-uTime*0.003)).g;
 float fog=uFog*(0.45+0.55*smoothstep(.35,.95,f1*0.6+f2*0.4))*(0.55+0.6*(abs(sc.y-0.5)*1.6));
 c=mix(c,uFogC,clamp(fog,0.0,0.8));
 vec2 v=sc-0.5;c*=1.0-dot(v,v)*0.9;
 gl_FragColor=vec4(c,1.0);}`;
/* soft token shadows: one quad per shadow, multiplied onto the table (cost = shadow area, not the whole screen) */
const B3_VS_SH=`attribute vec2 aP;attribute vec4 aR;attribute vec2 aB;uniform mat4 uM;varying vec2 vQ;varying vec4 vR;varying vec2 vB;void main(){vQ=aP;vR=aR;vB=aB;gl_Position=uM*vec4(aP,0.0,1.0);}`;
const B3_FS_SH=B3_HEAD+`varying vec2 vQ;varying vec4 vR;varying vec2 vB;float rbox(vec2 p,vec2 b,float r){vec2 q=abs(p)-b+r;return length(max(q,0.0))+min(max(q.x,q.y),0.0)-r;}
void main(){float d=rbox(vQ-vR.xy,vR.zw*0.5,8.0);float a=vB.y*(1.0-smoothstep(-vB.x*0.6,vB.x,d));gl_FragColor=vec4(vec3(1.0-a),1.0);}`;
const B3_VS_MESH=`attribute vec3 aP;attribute vec3 aN;attribute vec3 aC;uniform mat4 uM;varying vec3 vP;varying vec3 vN;varying vec3 vC;void main(){vP=aP;vN=aN;vC=aC;gl_Position=uM*vec4(aP,1.0);}`;
const B3_FS_MESH=B3_HEAD+B3_LIGHT+`varying vec3 vP;varying vec3 vN;varying vec3 vC;uniform vec3 uEm;uniform float uWet;uniform float uRim;
void main(){vec3 n=normalize(vN);vec3 c=vC*lit(vP,n,uWet)+uEm*vC;float r=pow(1.0-abs(n.z),2.0)*uRim;c+=r*vec3(.35,.3,.45);gl_FragColor=vec4(c,1.0);}`;
/* point sprites: k=0 soft glow, 1 flame, 2 smoke, 3 ripple ring */
const B3_VS_SPR=`attribute vec3 aP;attribute vec4 aC;attribute vec2 aS;uniform mat4 uM;uniform float uPx;varying vec4 vC;varying float vK;void main(){vC=aC;vK=aS.y;vec4 p=uM*vec4(aP,1.0);gl_Position=p;gl_PointSize=aS.x*uPx/p.w;}`;
const B3_FS_SPR=B3_HEAD+`varying vec4 vC;varying float vK;void main(){vec2 p=gl_PointCoord*2.0-1.0;float a;
 if(vK<0.5){a=exp(-dot(p,p)*3.0);}
 else if(vK<1.5){vec2 q=vec2(p.x*(1.6+p.y*0.9),p.y);a=smoothstep(1.0,0.2,length(q+vec2(0.0,0.25)))*smoothstep(1.0,0.6,p.y*-1.0+0.4);}
 else if(vK<2.5){a=smoothstep(1.0,0.0,length(p))*0.6;}
 else{float r=length(p);a=smoothstep(0.08,0.0,abs(r-0.8))*0.9;}
 gl_FragColor=vec4(vC.rgb*a*vC.a,a*vC.a);}`;
/* water: dark pool with rings and light glints */
const B3_FS_WATER=B3_HEAD+B3_LIGHT+`varying vec2 vU;varying vec3 vP;uniform float uTime;uniform float uSplash;uniform vec3 uWc;
void main(){vec2 p=vU*2.0-1.0;float r=length(p);if(r>1.0)discard;
 float w=sin(r*22.0-uTime*2.2)*0.5+0.5;w*=0.25+uSplash*1.2;float h=sin(p.x*9.0+uTime*1.3)*sin(p.y*11.0-uTime)*0.15;
 vec3 n=normalize(vec3(p.x*w*0.6+h,p.y*w*0.6-h,1.0));vec3 c=uWc*(0.35+0.65*(1.0-r))+lit(vP,n,1.6)*0.25*uWc;
 c+=vec3(.6,.9,1.0)*pow(max(n.x*0.4+n.y*0.3+0.6,0.0),18.0)*0.25;float rim=smoothstep(0.78,0.95,r)*smoothstep(1.0,0.95,r);c+=vec3(.25,.75,.7)*rim*0.7;float edge=smoothstep(1.0,0.9,r);gl_FragColor=vec4(c*edge,edge*0.95);}`;

function b3Prog(gl,vs,fs){const sh=(t,s)=>{const o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);if(!gl.getShaderParameter(o,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(o));return o};
 const p=gl.createProgram();gl.attachShader(p,sh(gl.VERTEX_SHADER,vs));gl.attachShader(p,sh(gl.FRAGMENT_SHADER,fs));gl.linkProgram(p);if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
 const u={},n=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<n;i++){const a=gl.getActiveUniform(p,i),k=a.name.replace(/\[0\]$/,'');u[k]=gl.getUniformLocation(p,a.name)}
 const at={};const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);for(let i=0;i<na;i++){const a=gl.getActiveAttrib(p,i);at[a.name]=gl.getAttribLocation(p,a.name)}return{p,u,at}}

/* ---------- geometry ---------- */
function gCyl(cx,cy,z0,r0,r1,h,seg,col,cap){const P=[],N=[],Cc=[],I=[];for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
  P.push(cx+c*r0,cy+s*r0,z0, cx+c*r1,cy+s*r1,z0+h);N.push(c,s,.25,c,s,.25);Cc.push(...col,...col);if(i<seg){const b=i*2;I.push(b,b+1,b+2,b+1,b+3,b+2)}}
 if(cap){const b=P.length/3;P.push(cx,cy,z0+h);N.push(0,0,1);Cc.push(...col);for(let i=0;i<=seg;i++){const a=i/seg*Math.PI*2;P.push(cx+Math.cos(a)*r1,cy+Math.sin(a)*r1,z0+h);N.push(0,0,1);Cc.push(...col)}for(let i=0;i<seg;i++)I.push(b,b+1+i,b+2+i)}
 return{P,N,C:Cc,I}}
function gBox(cx,cy,z0,w,d,h,col,top){const x0=cx-w/2,x1=cx+w/2,y0=cy-d/2,y1=cy+d/2,z1=z0+h,P=[],N=[],Cc=[],I=[];
 const f=(a,b,c,dd,n,cl)=>{const k=P.length/3;P.push(...a,...b,...c,...dd);for(let i=0;i<4;i++){N.push(...n);Cc.push(...cl)}I.push(k,k+1,k+2,k,k+2,k+3)};
 f([x0,y0,z1],[x1,y0,z1],[x1,y1,z1],[x0,y1,z1],[0,0,1],top||col);f([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0],col);f([x0,y0,z0],[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[0,-1,0],col);
 f([x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],[-1,0,0],col);f([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[1,0,0],col);return{P,N,C:Cc,I}}
function gMerge(list){const o={P:[],N:[],C:[],I:[]};for(const g of list){const b=o.P.length/3;o.P.push(...g.P);o.N.push(...g.N);o.C.push(...g.C);for(const i of g.I)o.I.push(i+b)}return o}
function b3Mesh(g,dyn){const gl=B3.gl,m={n:g.I.length,dyn};m.vp=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.vp);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.P),dyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
 m.vn=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.vn);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.N),dyn?gl.DYNAMIC_DRAW:gl.STATIC_DRAW);
 m.vc=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.vc);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(g.C),gl.STATIC_DRAW);
 m.ib=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(g.I),gl.STATIC_DRAW);return m}
function b3MeshUpd(m,g){const gl=B3.gl;gl.bindBuffer(gl.ARRAY_BUFFER,m.vp);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(g.P));gl.bindBuffer(gl.ARRAY_BUFFER,m.vn);gl.bufferSubData(gl.ARRAY_BUFFER,0,new Float32Array(g.N))}
/* tentacle: a tapered tube along a swaying curve that rises out of the pool (rise 0..1) */
function gTentacle(cx,cy,s,rise,t,curl){const seg=18,ring=8,P=[],N=[],Cc=[],I=[];const H=150*s*rise;
 for(let i=0;i<=seg;i++){const u=i/seg,z=u*H-(1-rise)*20*s,sw=-(Math.sin(t*2.1+u*3.4)*u*u*14*s*(.4+rise*.6)+curl*u*u*u*26*s)-u*u*18*s,sv=Math.cos(t*1.7+u*2.6)*u*u*8*s;
  const x=cx+sw,y=cy+sv,r=(10*s)*(1-u*.9)+.7;
  for(let k=0;k<=ring;k++){const a=k/ring*Math.PI*2,c=Math.cos(a),sn=Math.sin(a);P.push(x+c*r,y+sn*r*.9,z);N.push(c,sn,.15);const under=Math.max(0,sn),su=under>.6&&i%2===0;Cc.push(su?.78:.1+.12*under+.05*u,su?.86:.2+.04*under+.06*u,su?.74:.18+.2*under+.04*u)}}
 for(let i=0;i<seg;i++)for(let k=0;k<ring;k++){const a=i*(ring+1)+k,b=a+ring+1;I.push(a,b,a+1,b,b+1,a+1)}return{P,N,C:Cc,I}}

/* ---------- textures ---------- */
function b3NoiseTex(){const n=128,d=new Uint8Array(n*n*4),R=pvRng?pvRng(99):()=>Math.random();const g=[];for(let i=0;i<4;i++){const a=new Float32Array(16*16);for(let j=0;j<a.length;j++)a[j]=R();g.push(a)}
 const sm=(a,x,y,cs)=>{const X=Math.floor(x),Y=Math.floor(y),fx=x-X,fy=y-Y,q=(i,j)=>a[((j%cs+cs)%cs)*16+((i%cs+cs)%cs)],u=fx*fx*(3-2*fx),v=fy*fy*(3-2*fy);return(q(X,Y)*(1-u)+q(X+1,Y)*u)*(1-v)+(q(X,Y+1)*(1-u)+q(X+1,Y+1)*u)*v};
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let a=0,b=0;a=sm(g[0],x/n*4,y/n*4,4)*.6+sm(g[1],x/n*8,y/n*8,8)*.3+sm(g[2],x/n*16,y/n*16,16)*.1;b=sm(g[3],x/n*6,y/n*6,6)*.7+sm(g[1],x/n*12,y/n*12,12)*.3;
  const i=(y*n+x)*4;d[i]=a*255;d[i+1]=b*255;d[i+2]=0;d[i+3]=255}
 const gl=B3.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,n,n,0,gl.RGBA,gl.UNSIGNED_BYTE,d);
 gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);return t}
function b3BoardTex(key,cb){if(B3.tex[key])return cb(B3.tex[key]);const im=new Image();(B3.imgs||(B3.imgs={}))[key]=im;/* keep it alive while loading */im.onload=()=>{const gl=B3.gl;if(!gl)return;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);
  try{gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im)}catch(e){/* file:// pages can't upload images to WebGL: keep the flat board */console.warn('3D table off:',e.message);B3.ok=false;gl.deleteTexture(t);return cb(null)}for(const p of[gl.TEXTURE_WRAP_S,gl.TEXTURE_WRAP_T])gl.texParameteri(gl.TEXTURE_2D,p,gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);B3.tex[key]={t,w:im.naturalWidth,h:im.naturalHeight};cb(B3.tex[key])};
 im.onerror=()=>cb(null);im.src=uiArt(key)}

/* ---------- setup ---------- */
function b3Supported(){if(B3.ok!==null)return B3.ok;try{const c=document.createElement('canvas');const g=c.getContext('webgl',{antialias:false,alpha:false,powerPreference:'low-power'});B3.ok=!!g;if(g){const e=g.getExtension('WEBGL_lose_context');e&&e.loseContext()}}catch(e){B3.ok=false}return B3.ok}
function b3Want(){return b3Supported()&&!fxLow()&&!LG.rm.matches&&B3.pref!=='off'}
function b3Init(){if(B3.gl)return true;try{
 const cv=document.createElement('canvas');cv.id='b3d';cv.setAttribute('aria-hidden','true');const m=$('#match');m.parentNode.insertBefore(cv,m);
 const th=document.createElement('div');th.id='b3th';m.parentNode.insertBefore(th,m);
 const gl=cv.getContext('webgl',{antialias:false,alpha:false,depth:true,stencil:false,powerPreference:'low-power',preserveDrawingBuffer:false});if(!gl)throw new Error('no webgl');
 B3.cv=cv;B3.gl=gl;B3.pT=b3Prog(gl,B3_VS_TABLE,B3_FS_TABLE);B3.pH=b3Prog(gl,B3_VS_SH,B3_FS_SH);B3.bH=gl.createBuffer();B3.pM=b3Prog(gl,B3_VS_MESH,B3_FS_MESH);B3.pS=b3Prog(gl,B3_VS_SPR,B3_FS_SPR);B3.pW=b3Prog(gl,B3_VS_TABLE,B3_FS_WATER);
 B3.noise=b3NoiseTex();B3.bT=gl.createBuffer();B3.bTu=gl.createBuffer();B3.bS=gl.createBuffer();B3.bW=gl.createBuffer();B3.bWu=gl.createBuffer();
 cv.addEventListener('webglcontextlost',e=>{e.preventDefault();B3.lost=1;b3Stop(1)});cv.addEventListener('webglcontextrestored',()=>{B3.gl=null;B3.tex={};B3.lost=0;cv.remove();th.remove();if(cur==='match')b3Start()});
 return true}catch(e){console.warn('3D table off:',e.message);B3.ok=false;const c=$('#b3d');c&&c.remove();return false}}
function b3Size(){const W=innerWidth,H=innerHeight,art=1280/Math.max(W,H),q=Math.min(QL.q==='high'?1.5:1.15,Math.max(1,art*1.1)),rs=Math.min(devicePixelRatio||1,q);B3.W=W;B3.H=H;B3.rs=rs;B3.cv.width=Math.round(W*rs);B3.cv.height=Math.round(H*rs);
 const m=Math.max(W,H)*.1,P=[-m,-m,0,W+m,-m,0,W+m,H+m,0,-m,H+m,0];const gl=B3.gl;gl.bindBuffer(gl.ARRAY_BUFFER,B3.bT);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(P),gl.STATIC_DRAW);B3.marg=m;b3UV();b3Toys()}
function b3UV(){const T=B3.tex[B3.key];if(!T||!B3.gl)return;const W=B3.W,H=B3.H,m=B3.marg,sa=W/H,ta=T.w/T.h;let sx=1,sy=1;if(ta>sa)sx=sa/ta;else sy=ta/sa;
 const u=x=>.5+(x/W-.5)*sx,v=y=>.5+(y/H-.5)*sy;const U=[u(-m),v(-m),u(W+m),v(-m),u(W+m),v(H+m),u(-m),v(H+m)];const gl=B3.gl;gl.bindBuffer(gl.ARRAY_BUFFER,B3.bTu);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(U),gl.STATIC_DRAW);B3.txl=[sx/T.w*1.2,sy/T.h*1.2]}

/* ---------- toys: placed in the free corners of the board area ---------- */
function b3Spots(){const r=id=>{const e=$(id);return e?e.getBoundingClientRect():null},W=B3.W,H=B3.H,oph=r('#oph'),opb=r('#opb'),myb=r('#myb'),myh=r('#myh'),land=isLand();
 const s=Math.max(1.15,Math.min(2.4,Math.min(W,H)/320));
 if(!opb||!myb)return{s,A:[W*.12,H*.14],B:[W*.88,H*.66]};
 if(land)return{s,A:[opb.left+62*s,opb.top+opb.height*.55],B:[W-62*s,myb.top+myb.height*.5]};
 return{s,A:[40*s,((oph?oph.bottom:opb.top-60)+opb.top)/2+14],B:[W-40*s,(myb.bottom+(myh?myh.top:myb.bottom+70))/2+16]}}
function b3Free(m){if(!m||!B3.gl)return;const gl=B3.gl;for(const b of[m.vp,m.vn,m.vc,m.ib])b&&gl.deleteBuffer(b)}
function b3Toys(){if(!B3.gl)return;const S=b3Spots(),s=S.s,f=B3.fac;B3.spot=S;for(const o of B3.toys){b3Free(o.mesh);b3Free(o.scr);b3Free(o.tm)}/* no GPU buffers left behind between matches */B3.toys=[];const add=o=>B3.toys.push(Object.assign({st:0,t0:0},o));
 if(f==='m'){const[ax,ay]=S.A,[bx,by]=S.B;
  const cy=ay+10*s;add({k:'console',x:ax,y:cy,r:46*s,mesh:b3Mesh(gMerge([gBox(ax,cy,0,64*s,40*s,20*s,[.2,.21,.23],[.15,.16,.17]),gBox(ax,cy-6*s,20*s,54*s,14*s,26*s,[.13,.14,.15]),gBox(ax-24*s,cy+14*s,20*s,6*s,6*s,4*s,[.5,.1,.08]),gBox(ax+22*s,cy+14*s,20*s,8*s,5*s,3*s,[.1,.4,.2])])),scr:b3Mesh(gBox(ax,cy+1.2*s,23*s,46*s,1,21*s,[.2,.9,.7],[.2,.9,.7]))});
  add({k:'beacon',x:bx,y:by,r:40*s,mesh:b3Mesh(gMerge([gCyl(bx,by,0,18*s,15*s,10*s,16,[.14,.14,.15],1),gCyl(bx,by,10*s,9*s,8*s,12*s,12,[.9,.55,.12],1)]))})}
 else if(f==='c'){for(const[k,[x,y]]of[['A',S.A],['B',S.B]]){const hs=[34,24,44].map(h=>h*s),off=[[-11,4],[11,6],[0,-8]].map(([a,b])=>[x+a*s,y+b*s]);
  add({k:'candles',x,y,r:42*s,c:off.map((o,i)=>({x:o[0],y:o[1],h:hs[i]})),mesh:b3Mesh(gMerge(off.map((o,i)=>gCyl(o[0],o[1],0,6*s,5.5*s,hs[i],12,[.72,.62,.5].map(v=>v*(i===1?.8:1)),1)).concat([gCyl(x,y,0,26*s,24*s,3*s,20,[.08,.03,.03],1)])))})}}
 else{const[ax,ay]=S.A,[bx,by]=S.B;add({k:'pool',x:bx,y:by,r:32*s,big:1,tm:b3Mesh(gTentacle(bx,by,s,0,0,0),1)});add({k:'pool',x:ax,y:ay,r:22*s})}}
function b3Lights(t){const W=B3.W,H=B3.H,f=B3.fac,L=[],sp=B3.spot||{A:[0,0],B:[0,0],s:1},s=sp.s;
 const fl=(k,base,amt)=>base+amt*(Math.sin(t*7.3+k)*.5+Math.sin(t*13.1+k*2)*.3+Math.sin(t*2.3+k*3)*.2);
 if(f==='m'){const bc=B3.toys.find(o=>o.k==='beacon'),ct=B3.toys.find(o=>o.k==='console');const flick=(Math.sin(t*.7)>.985||Math.sin(t*1.9+1)>.995)?.25:1;
  L.push([W*.5,-H*.2,900,1.3*flick,[.55,.7,.85]]);const sp2=bc&&bc.st&&t-bc.t0<2.2?6:1.4,ba=t*sp2;
  L.push([bc?bc.x+Math.cos(ba)*140*s:0,bc?bc.y+Math.sin(ba)*140*s:0,60*s,bc&&bc.st&&t-bc.t0<2.2?2.2:1.2,bc&&bc.st&&t-bc.t0<2.2?[1,.15,.08]:[1,.55,.15]]);
  L.push([ct?ct.x:0,ct?ct.y:0,50*s,.9+(ct&&ct.st&&t-ct.t0<.6?2.5:0),[.2,1,.75]]);L.push([W*.5,H*.5,500,.25,[.3,.5,.6]])}
 else if(f==='c'){const cs=B3.toys.filter(o=>o.k==='candles');for(let i=0;i<2;i++){const c=cs[i],out=c&&c.st&&t-c.t0<2.6;const lvl=out?Math.max(0,1-(t-c.t0)*3)+(t-c.t0>2.2?(t-c.t0-2.2)*2.5:0):1;
   L.push([c?c.x:0,c?c.y:0,70*s,fl(i*5,1.25,.35)*Math.min(1.4,lvl),[1,.55,.22]])}
  L.push([W*.5,H*.45,300,.6+.25*Math.sin(t*.9),[.9,.08,.1]]);L.push([W*.5,-H*.3,1000,.35,[.6,.35,.35]])}
 else{L.push([W*.5,-H*.25,1000,1.05,[.45,.7,.85]]);L.push([W*.5+Math.cos(t*.23)*W*.28,H*.45+Math.sin(t*.31)*H*.18,220,1.0,[.55,.25,.95]]);
  const p=B3.toys.find(o=>o.big);L.push([p?p.x:0,p?p.y:0,40*s,.7+(p&&p.st&&t-p.t0<2.6?1.4:0)+.2*Math.sin(t*1.3),[.2,.9,.8]]);const q=B3.toys.find(o=>o.k==='pool'&&!o.big);L.push([q?q.x:0,q?q.y:0,30*s,.5+.15*Math.sin(t*1.7+2),[.2,.8,.7]])}
 B3.lights=L}
const B3_AMB={v:[.32,.36,.44],m:[.34,.36,.4],c:[.36,.27,.27],n:[.34,.33,.3]},B3_FOG={v:[.05,.1,.12],m:[.07,.08,.09],c:[.1,.02,.03],n:[.08,.07,.06]};

/* ---------- tokens (minions, dragged card) -> shadow rects ---------- */
function b3ReadToks(){const L=[];const add=(el,elev)=>{const r=el.getBoundingClientRect();if(r.width<4)return;L.push({x:r.left+r.width/2,y:r.top+r.height/2,w:r.width,h:r.height,e:elev})};
 for(const el of document.querySelectorAll('#myb .unit,#opb .unit')){if(L.length>=11)break;const bw=el._bw||(el._bw=el.offsetWidth),sc=el.getBoundingClientRect().width/(bw||1);const e=Math.max(0,(sc-1)/.2)*(B3.lunge&&+el.dataset.u===B3.lunge.uid?B3.lunge.L:0);add(el,e)}
 const g=$('#ghost');if(g)add(g,70);B3.toks=L}
function b3ShadowUniforms(){const n=B3.toks.length,tk=new Float32Array(48),ts=new Float32Array(48),L=B3.lights;
 for(let i=0;i<n;i++){const o=B3.toks[i];let dx=0,dy=0,ws=0;for(const l of L){if(l[2]>400)continue;const vx=o.x-l[0],vy=o.y-l[1],d=Math.hypot(vx,vy)+1,w=l[3]/(1+d*d*.00004);dx+=vx/d*w;dy+=vy/d*w;ws+=w}
  const k=ws>0?1/ws:0,off=7+o.e*.55,gy=o.e;tk.set([o.x,o.y+gy,o.w*.92,o.h*.92],i*4);ts.set([dx*k*off,dy*k*off+5,11+o.e*.35,Math.max(.3,.78-o.e*.004)],i*4)}
 return{n,tk,ts}}

/* ---------- sprites ---------- */
function b3Spr(x,y,z,vx,vy,vz,life,size,col,k,g){if(B3.spr.length>220)return;B3.spr.push({x,y,z,vx,vy,vz,life,age:0,size,col,k,g:g||0})}
function b3Ambient(t,dt){const s=(B3.spot||{s:1}).s;
 for(const o of B3.toys){if(o.k==='candles'){const u=t-o.t0,lv=!o.st||u>2.6?1:u<.15?1-u/.15:u>2.2?(u-2.2)/.4:0;if(lv>0)for(const c of o.c){const fl=(1+.18*Math.sin(t*11+c.x)+.1*Math.sin(t*23+c.y))*lv;B3.fl.push(c.x,c.y,c.h+8*s*fl,1,.62,.25,.95,17*s*fl,1, c.x,c.y,c.h+7*s,1,.45,.12,.4*lv,36*s,0)}}
  if(o.k==='pool'&&Math.random()<dt*(o.big?.5:.8))b3Spr(o.x+(Math.random()-.5)*o.r,o.y+(Math.random()-.5)*o.r*.6,.5,0,0,0,1.6,o.r*.9,[.4,.9,.85,.5],3);
  if(o.k==='console'&&Math.random()<dt*.12)b3Burst(o,6)}}
function b3Burst(o,n){const s=(B3.spot||{s:1}).s;for(let i=0;i<n;i++){const a=Math.random()*Math.PI*2,v=60+Math.random()*160;b3Spr(o.x+(Math.random()-.5)*30*s,o.y-6*s,46*s,Math.cos(a)*v*s,Math.sin(a)*v*s*.6,90*s+Math.random()*120*s,.5+Math.random()*.5,5*s,[1,.85,.4,1],0,-420*s)}B3.act=Math.max(B3.act,performance.now()+900)}

/* ---------- camera ---------- */
function b3Cam(kind,x,y){const now=performance.now();B3.cam={kind,t0:now,dur:kind==='lethal'?2000:1100,x:x==null?B3.W/2:x,y:y==null?B3.H/2:y};B3.act=Math.max(B3.act,now+B3.cam.dur+50);
 const m=$('#match');if(m&&!fxLow()){const tx=((B3.cam.x-B3.W/2)/B3.W*-2).toFixed(2),ty=((B3.cam.y-B3.H/2)/B3.H*-2).toFixed(2),sc=kind==='lethal'?1.05:1.03;
  m.animate([{transform:'none'},{transform:`perspective(1200px) translate(${tx}%,${ty}%) rotateX(${kind==='lethal'?3:2}deg) scale(${sc})`,offset:.35},{transform:'none'}],{duration:B3.cam.dur,easing:'cubic-bezier(.4,0,.2,1)',composite:'add'})}b3Kick()}
function b3CamOffset(now){const c=B3.cam;if(!c)return{z:1,x:0,y:0,p:0};const u=(now-c.t0)/c.dur;if(u>=1){B3.cam=null;return{z:1,x:0,y:0,p:0}}
 const e=u<.35?Math.sin(u/.35*Math.PI/2):Math.cos((u-.35)/.65*Math.PI/2),k=c.kind==='lethal'?1.4:1;return{z:1-.05*e*k,x:(c.x-B3.W/2)*.04*e*k,y:(c.y-B3.H/2)*.04*e*k,p:.05*e*k}}

/* ---------- draw ---------- */
function b3Draw(now){const gl=B3.gl,W=B3.W,H=B3.H,T=B3.tex[B3.key];if(!gl||!T)return;const t=(now-B3.t0)/1000,dt=Math.min(.1,(now-(B3.last||now))/1000)||.016;B3.last=now;B3.frames++;
 if(B3.tokDirty||now<B3.act){b3ReadToks();B3.tokDirty=0}
 B3.fl=[];b3Lights(t);b3Ambient(t,dt);
 const co=b3CamOffset(now),fov=30*Math.PI/180,D=(H/2)/Math.tan(fov/2);
 const eye=[W/2+co.x,H/2+co.y+H*co.p,D*co.z],P=M4.persp(fov,W/H,D*.3,D*2),V=M4.look(eye,[W/2+co.x*.8,H/2+co.y*.8,0],[0,1,0]);
 const flip=new Float32Array([1,0,0,0,0,-1,0,0,0,0,1,0,0,0,0,1]),MVP=M4.mul(flip,M4.mul(P,V));
 /* things that stand on the table lean up the screen with their height (a Hearthstone-like angled view) while the table
    itself stays flat and lines up exactly with the cards above it */
 const SH=new Float32Array([1,0,0,0,0,1,0,0,0,-.62,1,0,0,0,0,1]),MVPs=M4.mul(MVP,SH);
 gl.viewport(0,0,B3.cv.width,B3.cv.height);gl.clearColor(0,0,0,1);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
 const Lp=new Float32Array(16),Lc=new Float32Array(12);B3.lights.forEach((l,i)=>{Lp.set([l[0],l[1],l[2],l[3]],i*4);Lc.set(l[4],i*3)});
 const setL=(pr)=>{gl.uniform4fv(pr.u.uL,Lp);gl.uniform3fv(pr.u.uLC,Lc);gl.uniform3fv(pr.u.uAmb,B3_AMB[B3.fac]||B3_AMB.v)};
 /* table */
 let pr=B3.pT;gl.useProgram(pr.p);gl.disable(gl.DEPTH_TEST);gl.disable(gl.BLEND);
 gl.bindBuffer(gl.ARRAY_BUFFER,B3.bT);gl.enableVertexAttribArray(pr.at.aP);gl.vertexAttribPointer(pr.at.aP,3,gl.FLOAT,false,0,0);
 gl.bindBuffer(gl.ARRAY_BUFFER,B3.bTu);gl.enableVertexAttribArray(pr.at.aU);gl.vertexAttribPointer(pr.at.aU,2,gl.FLOAT,false,0,0);
 gl.uniformMatrix4fv(pr.u.uM,false,MVP);gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,T.t);gl.uniform1i(pr.u.uT,0);gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,B3.noise);gl.uniform1i(pr.u.uN,1);
 gl.uniform2fv(pr.u.uTx,B3.txl||[.002,.002]);gl.uniform1f(pr.u.uTime,t);gl.uniform3fv(pr.u.uFogC,B3_FOG[B3.fac]||B3_FOG.v);gl.uniform1f(pr.u.uFog,B3.fac==='m'?.32:.42);gl.uniform1f(pr.u.uWet,B3.fac==='v'?1.2:B3.fac==='c'?.6:.35);gl.uniform2f(pr.u.uWH,W,H);
 setL(pr);
 gl.drawArrays(gl.TRIANGLE_FAN,0,4);gl.disableVertexAttribArray(pr.at.aU);
 const sh=b3ShadowUniforms();if(sh.n){const V=[];for(let i=0;i<sh.n;i++){const k=i*4,cx=sh.tk[k]+sh.ts[k],cy=sh.tk[k+1]+sh.ts[k+1],w=sh.tk[k+2],h=sh.tk[k+3],bl=sh.ts[k+2],st=sh.ts[k+3],x0=cx-w/2-bl,x1=cx+w/2+bl,y0=cy-h/2-bl,y1=cy+h/2+bl;
   for(const[x,y]of[[x0,y0],[x1,y0],[x1,y1],[x0,y0],[x1,y1],[x0,y1]])V.push(x,y,cx,cy,w,h,bl,st)}
  pr=B3.pH;gl.useProgram(pr.p);gl.enable(gl.BLEND);gl.blendFunc(gl.DST_COLOR,gl.ZERO);gl.uniformMatrix4fv(pr.u.uM,false,MVP);gl.bindBuffer(gl.ARRAY_BUFFER,B3.bH);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(V),gl.DYNAMIC_DRAW);
  gl.enableVertexAttribArray(pr.at.aP);gl.vertexAttribPointer(pr.at.aP,2,gl.FLOAT,false,32,0);gl.enableVertexAttribArray(pr.at.aR);gl.vertexAttribPointer(pr.at.aR,4,gl.FLOAT,false,32,8);gl.enableVertexAttribArray(pr.at.aB);gl.vertexAttribPointer(pr.at.aB,2,gl.FLOAT,false,32,24);
  gl.drawArrays(gl.TRIANGLES,0,sh.n*6);gl.disableVertexAttribArray(pr.at.aR);gl.disableVertexAttribArray(pr.at.aB);gl.disable(gl.BLEND)}
 /* pools */
 const pools=B3.toys.filter(o=>o.k==='pool');if(pools.length){pr=B3.pW;gl.useProgram(pr.p);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);gl.uniformMatrix4fv(pr.u.uM,false,MVP);gl.uniform1f(pr.u.uTime,t);setL(pr);gl.uniform3fv(pr.u.uWc,[.05,.2,.22]);
  for(const o of pools){const r=o.r,P=[o.x-r,o.y-r*.72,.3,o.x+r,o.y-r*.72,.3,o.x+r,o.y+r*.72,.3,o.x-r,o.y+r*.72,.3];gl.bindBuffer(gl.ARRAY_BUFFER,B3.bW);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(P),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pr.at.aP);gl.vertexAttribPointer(pr.at.aP,3,gl.FLOAT,false,0,0);
   gl.bindBuffer(gl.ARRAY_BUFFER,B3.bWu);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,1,1,0,1]),gl.DYNAMIC_DRAW);gl.enableVertexAttribArray(pr.at.aU);gl.vertexAttribPointer(pr.at.aU,2,gl.FLOAT,false,0,0);
   gl.uniform1f(pr.u.uSplash,o.st&&t-o.t0<2.6?Math.max(0,1-(t-o.t0)/2.6):0);gl.drawArrays(gl.TRIANGLE_FAN,0,4);gl.disableVertexAttribArray(pr.at.aU)}}
 /* meshes */
 pr=B3.pM;gl.useProgram(pr.p);gl.enable(gl.DEPTH_TEST);gl.disable(gl.BLEND);gl.uniformMatrix4fv(pr.u.uM,false,MVPs);setL(pr);gl.clear(gl.DEPTH_BUFFER_BIT);
 const draw=(m,em,wet,rim)=>{gl.uniform3fv(pr.u.uEm,em);gl.uniform1f(pr.u.uWet,wet);gl.uniform1f(pr.u.uRim,rim);for(const[b,a,n]of[[m.vp,pr.at.aP,3],[m.vn,pr.at.aN,3],[m.vc,pr.at.aC,3]]){gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.enableVertexAttribArray(a);gl.vertexAttribPointer(a,n,gl.FLOAT,false,0,0)}gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,m.ib);gl.drawElements(gl.TRIANGLES,m.n,gl.UNSIGNED_SHORT,0)};
 for(const o of B3.toys){
  if(o.k==='console'){draw(o.mesh,[0,0,0],.4,.3);const gl2=o.st&&t-o.t0<.7?(Math.random()<.5?[1.4,.2,.2]:[.3,.3,.3]):[.6+.25*Math.sin(t*9)*(Math.sin(t*.8)>.9?1:.1),.6,.6];draw(o.scr,gl2,0,0)}
  else if(o.k==='beacon'){const on=o.st&&t-o.t0<2.2;draw(o.mesh,on?[1.2,.1,.05]:[.5+.3*Math.sin(t*2.2),.3,.1],.6,.3)}
  else if(o.k==='candles')draw(o.mesh,[.12,.06,.02],.2,.15);
  else if(o.big){const u=o.st?(t-o.t0):99,rise=u<.6?u/.6:u<2.0?1:u<2.8?1-(u-2)/.8:0;const r=Math.max(0,Math.min(1,rise)),ease=r*r*(3-2*r);
   if(ease>.01||o.wasUp){b3MeshUpd(o.tm,gTentacle(o.x,o.y,(B3.spot||{s:1}).s,ease,t,Math.sin(u*2.4)*ease));o.wasUp=ease>.01;if(ease>.01)draw(o.tm,[.05,.12,.11],1.8,1.2)}}}
 /* sprites */
 pr=B3.pS;gl.useProgram(pr.p);gl.disable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.ONE,gl.ONE);gl.uniformMatrix4fv(pr.u.uM,false,MVPs);gl.uniform1f(pr.u.uPx,B3.rs*D);
 const S=[];B3.spr=B3.spr.filter(p=>{p.age+=dt;if(p.age>p.life)return false;p.vz+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.z=Math.max(0,p.z+p.vz*dt);const a=p.k===3?1-p.age/p.life:Math.min(1,(1-p.age/p.life)*1.6);
  S.push(p.x,p.y,p.z,p.col[0],p.col[1],p.col[2],p.col[3]*a,p.k===3?p.size*(.4+p.age/p.life):p.size,p.k);return true});
 for(const v of B3.fl)S.push(v);
 if(S.length){gl.bindBuffer(gl.ARRAY_BUFFER,B3.bS);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(S),gl.DYNAMIC_DRAW);const st=36;gl.enableVertexAttribArray(pr.at.aP);gl.vertexAttribPointer(pr.at.aP,3,gl.FLOAT,false,st,0);
  gl.enableVertexAttribArray(pr.at.aC);gl.vertexAttribPointer(pr.at.aC,4,gl.FLOAT,false,st,12);gl.enableVertexAttribArray(pr.at.aS);gl.vertexAttribPointer(pr.at.aS,2,gl.FLOAT,false,st,28);gl.drawArrays(gl.POINTS,0,S.length/9);
  gl.disableVertexAttribArray(pr.at.aC);gl.disableVertexAttribArray(pr.at.aS)}
 gl.disable(gl.BLEND)}

/* ---------- loop: on demand ---------- */
function b3Busy(now){return now<B3.act||B3.cam||B3.spr.some(p=>p.k===0&&p.g)||B3.toys.some(o=>o.st&&(now-B3.t0)/1000-o.t0<3)}
function b3Loop(now){B3.raf=0;if(!B3.on)return;if(BAT.idle||BAT.hid||document.hidden||document.body.classList.contains('cinhold')){B3.sleep=1;return}
 b3Draw(now);const busy=b3Busy(now),iv=busy?(B3_MOBILE?33:16):83;const w=iv-(performance.now()-now)-5;
 if(w>3)B3.tm=setTimeout(()=>{B3.tm=0;if(B3.on&&!B3.raf)B3.raf=requestAnimationFrame(b3Loop)},w);else B3.raf=requestAnimationFrame(b3Loop)}
function b3Kick(){if(!B3.on)return;B3.sleep=0;if(B3.tm){clearTimeout(B3.tm);B3.tm=0}if(!B3.raf)B3.raf=requestAnimationFrame(b3Loop)}
function b3Start(){if(!b3Want()){b3Stop();return}if(!b3Init())return;const f=G&&'vmc'.includes(G.p[0].fac)?G.p[0].fac:'v',key='board_'+f+(isLand()?'':'_p');B3.fac=f;
 b3BoardTex(key,T=>{if(!T){b3Stop();return}if(cur!=='match')return;B3.key=key;B3.on=1;b3Size();document.body.classList.add('b3d');B3.tokDirty=1;b3Kick()})}
function b3Stop(keep){B3.on=0;if(B3.raf)cancelAnimationFrame(B3.raf);if(B3.tm)clearTimeout(B3.tm);B3.raf=B3.tm=0;document.body.classList.remove('b3d');B3.spr=[]}

/* ---------- toy taps ---------- */
function b3Tap(x,y){if(!B3.on)return false;const t=(performance.now()-B3.t0)/1000;for(const o of B3.toys){if(Math.hypot(x-o.x,(y-o.y)*1.2)>o.r+10)continue;if(o.st&&t-o.t0<1.2)return true;o.st=1;o.t0=t;
  if(o.k==='console'){b3Burst(o,34);sfx('b3spark');hap('hitBig')}
  else if(o.k==='beacon'){sfx('b3alarm');hap('turn')}
  else if(o.k==='candles'){const s=(B3.spot||{s:1}).s;for(const c of o.c)for(let i=0;i<6;i++)b3Spr(c.x,c.y,c.h+6*s,(Math.random()-.5)*14,(Math.random()-.5)*8,30+Math.random()*40,1.6+Math.random(),18*s,[.25,.22,.22,.5],2);sfx('b3snuff');hap('drop')}
  else if(o.k==='pool'){for(let i=0;i<3;i++)b3Spr(o.x,o.y,.5,0,0,0,1.2+i*.4,o.r*2.2,[.4,1,.9,.7],3);if(o.big){sfx('b3tentacle');hap('hurt')}else{sfx('b3bubble');hap('drop')}}
  B3.act=Math.max(B3.act,performance.now()+3000);b3Kick();return true}return false}
Object.assign(SFX,{
 b3spark:()=>{noise(.25,3500,3,.12,'highpass',9000);for(let i=0;i<4;i++)noise(.06,2000+i*900,6,.07,'bandpass',4000,i*.07);tone(60,58,.4,'square',.03)},
 b3alarm:()=>{for(let i=0;i<3;i++){tone(880,660,.35,'square',.022,1,i*.5);tone(440,330,.35,'square',.018,0,i*.5)}},
 b3snuff:()=>{noise(.45,600,1,.1,'lowpass',150);tone(220,110,.3,'sine',.02,1)},
 b3tentacle:()=>{noise(.9,300,1,.18,'lowpass',90);tone(48,34,1.4,'sawtooth',.05,1);noise(.5,1200,2,.08,'bandpass',300,.3)},
 b3bubble:()=>{for(let i=0;i<5;i++)tone(300+Math.random()*500,600+Math.random()*700,.08,'sine',.03,1,i*.07)}
});

/* ---------- hooks ---------- */
{const s0=show;show=function(id){const r=s0.apply(this,arguments);if(id==='match')setTimeout(b3Start,30);else if(B3.on)b3Stop();return r}}
{const r0=renderMatch;renderMatch=function(){const r=r0.apply(this,arguments);if(B3.on){B3.tokDirty=1;b3Kick()}return r}}
{const l0=lunge;lunge=function(uid,tg){if(B3.on){const a=tEl('u'+uid),b=tEl(tg);if(a&&b){const[x1,y1]=center(a),[x2,y2]=center(b);B3.lunge={uid,L:Math.min(70,Math.hypot(x2-x1,y2-y1)*.2)}}B3.act=Math.max(B3.act,performance.now()+D(900));b3Kick()}
 const p=l0.apply(this,arguments);return p&&p.then?p.then(v=>{B3.lunge=null;B3.tokDirty=1;b3Kick();return v}):p}}
{const m0=moveDrag;moveDrag=function(){const r=m0.apply(this,arguments);if(B3.on&&P&&P.drag==='h'){B3.act=Math.max(B3.act,performance.now()+250);b3Kick()}return r}}
{const l0=landFx;landFx=function(uid,id){const r=l0.apply(this,arguments);if(B3.on){const el=tEl('u'+uid);if(el){const[x,y]=center(el);b3Cam('legend',x,y)}}return r}}
{const e0=endSeq;endSeq=function(g){if(B3.on&&g.winner!==-1){const h=heroBox(g.winner===0?1:0);if(h){const[x,y]=center(h);b3Cam('lethal',x,y)}}return e0.apply(this,arguments)}}
document.addEventListener('pointerdown',e=>{if(!B3.on)return;if(B3.sleep)b3Kick();if(cur!=='match')return;const t=e.target;if(t.closest&&t.closest('.unit,.card,button,.hero,#hand,#endt,#zoom,#over,#cin,#settings,#dlg'))return;b3Tap(e.clientX,e.clientY)},true);
addEventListener('resize',()=>{if(B3.on){clearTimeout(B3.rz);B3.rz=setTimeout(()=>{const k='board_'+B3.fac+(isLand()?'':'_p');if(k!==B3.key)b3Start();else{b3Size();b3Kick()}},150)}});
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&B3.on)b3Kick()});
{const q0=qApply;qApply=function(){const r=q0.apply(this,arguments);try{if(cur==='match'){if(b3Want()&&!B3.on)b3Start();else if(!b3Want()&&B3.on)b3Stop()}}catch(e){}return r}}
B3.pref=(()=>{try{return localStorage.getItem('hs3d')||'on'}catch(e){return'on'}})();

/* ---------- dragged cards swing on a spring (they keep swinging a little after you stop, then settle) ---------- */
const SW={raf:0,a:0,v:0,ry:0,vy:0,lx:0,lt:0,vx:0};
function swLoop(now){SW.raf=0;if(!P||P.drag!=='h'||!P.g||!P.g.isConnected||fxLow())return;const dt=Math.min(.05,(now-(SW.lt||now))/1000)||.016;SW.lt=now;
 SW.vx*=Math.pow(.02,dt);const tz=Math.max(-22,Math.min(22,-SW.vx*.045)),ty=Math.max(-30,Math.min(30,SW.vx*.06));
 SW.v+=((tz-SW.a)*120-SW.v*11)*dt;SW.a+=SW.v*dt;SW.vy+=((ty-SW.ry)*140-SW.vy*12)*dt;SW.ry+=SW.vy*dt;
 P.g.style.transform=`translate(-50%,-60%) scale(.97) perspective(700px) rotateY(${SW.ry.toFixed(2)}deg) rotate(${(SW.a-3).toFixed(2)}deg)`;P.g.style.setProperty('--ox',(SW.ry/30).toFixed(2));
 if(Math.abs(SW.v)+Math.abs(SW.vy)+Math.abs(SW.vx)>.5||Math.abs(SW.a)+Math.abs(SW.ry)>.2)SW.raf=requestAnimationFrame(swLoop);else SW.raf=requestAnimationFrame(swLoop)}
{const m0=moveDrag;moveDrag=function(e){const r=m0.apply(this,arguments);if(P&&P.drag==='h'&&P.g&&!fxLow()){const now=performance.now(),dt=Math.max(8,now-(SW.lt2||now-16));SW.lt2=now;
  const vx=(e.clientX-(SW.lx||e.clientX))/dt*1000;SW.lx=e.clientX;SW.vx=SW.vx*.5+vx*.5;if(!SW.raf){SW.lt=0;SW.raf=requestAnimationFrame(swLoop)}}return r}}
{const s0=startDrag;startDrag=function(e){SW.a=SW.v=SW.ry=SW.vy=SW.vx=0;SW.lx=e&&e.clientX||0;SW.lt2=0;return s0.apply(this,arguments)}}

/* ---------- settings: 3D table switch ---------- */
{const q=$('#sQ');if(q&&!$('#s3d')){const l=document.createElement('label');l.innerHTML='<span>3D table<small>lit board, toys and shadows (off = classic flat board)</small></span><input type="checkbox" id="s3d">';q.closest('label').after(l);
 const c=$('#s3d');c.checked=B3.pref!=='off';c.addEventListener('change',()=>{B3.pref=c.checked?'on':'off';try{localStorage.setItem('hs3d',B3.pref)}catch(x){}sfx('click');if(cur==='match'){if(b3Want())b3Start();else b3Stop()}})}}
{const s0=settingsOpen;settingsOpen=function(){const r=s0.apply(this,arguments);const c=$('#s3d');if(c){c.checked=B3.pref!=='off';c.disabled=!b3Supported();c.closest('label').style.opacity=b3Supported()?'':'.5'}return r}}

Object.assign(window.__hs,{B3,b3Start,b3Stop,b3Tap,b3Cam,b3Draw,b3Want,SW});
