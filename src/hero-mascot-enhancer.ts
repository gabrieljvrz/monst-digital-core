const VIDEO_SRC = "/assets/hero-bg.mp4";
const POSTER_SRC = "/assets/hero-bg-poster.png";

const vertexSource = `attribute vec2 p; attribute vec2 t; varying vec2 uv; void main(){uv=t;gl_Position=vec4(p,0.,1.);}`;
const fragmentSource = `precision mediump float; varying vec2 uv; uniform sampler2D tex; uniform vec2 texel;
float s(float a,float b,float x){float t=clamp((x-a)/(b-a),0.,1.);return t*t*(3.-2.*t);}
float f(vec3 c){float mx=max(max(c.r,c.g),c.b);float mn=min(min(c.r,c.g),c.b);float sat=mx-mn;float lum=dot(c,vec3(.299,.587,.114));return max(s(.035,.13,sat),s(.74,.58,lum));}
void main(){vec3 c=texture2D(tex,uv).rgb;float mx=max(max(c.r,c.g),c.b);float mn=min(min(c.r,c.g),c.b);float sat=mx-mn;float lum=dot(c,vec3(.299,.587,.114));float n=0.;n+=f(texture2D(tex,uv+texel*vec2(-2.,-2.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(0.,-2.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(2.,-2.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(-2.,0.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(2.,0.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(-2.,2.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(0.,2.)).rgb);n+=f(texture2D(tex,uv+texel*vec2(2.,2.)).rgb);n/=8.;float neutral=s(.15,.045,sat)*s(.64,.84,lum);float nearby=s(.07,.28,n);gl_FragColor=vec4(c,1.-neutral*(1.-nearby));}`;

function shader(gl: WebGLRenderingContext, type: number, source: string) {
  const value = gl.createShader(type)!;
  gl.shaderSource(value, source); gl.compileShader(value);
  if (!gl.getShaderParameter(value, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(value) || "Mascot shader error");
  return value;
}

function enhanceHeroMascot(root: HTMLElement) {
  if (root.dataset.mascotVideoReady) return;
  const image = root.querySelector<HTMLImageElement>("img");
  if (!image) return;
  root.dataset.mascotVideoReady = "true";
  image.style.visibility = "hidden";
  image.style.animation = "none";
  image.style.borderRadius = "0";
  image.style.objectFit = "contain";

  const video = document.createElement("video");
  video.src = VIDEO_SRC; video.muted = true; video.loop = true; video.autoplay = true; video.playsInline = true; video.preload = "auto";
  video.setAttribute("aria-hidden", "true");
  video.style.cssText = "position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;";

  const canvas = document.createElement("canvas");
  canvas.className = "hero-mascot-canvas";
  canvas.setAttribute("aria-hidden", "true");
  root.append(video, canvas);

  const poster = document.createElement("img");
  poster.src = POSTER_SRC; poster.alt = ""; poster.width = 640; poster.height = 640; poster.className = "hero-mascot-poster";
  root.append(poster);

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const showPoster = () => { video.pause(); canvas.style.display = "none"; poster.style.display = "block"; };
  const showMotion = () => { poster.style.display = "none"; canvas.style.display = "block"; video.play().catch(() => undefined); };
  if (reduceMotion.matches) showPoster();

  const gl = reduceMotion.matches ? null : canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
  if (!gl) { showPoster(); return; }

  try {
    const program = gl.createProgram()!;
    const vertex = shader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = shader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) || "Mascot program error");
    const buffer = gl.createBuffer()!; gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0,0,1,-1,1,0,-1,1,0,1,1,1,1,1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const p = gl.getAttribLocation(program,"p"), t = gl.getAttribLocation(program,"t");
    gl.enableVertexAttribArray(p); gl.vertexAttribPointer(p,2,gl.FLOAT,false,16,0);
    gl.enableVertexAttribArray(t); gl.vertexAttribPointer(t,2,gl.FLOAT,false,16,8);
    const texture = gl.createTexture()!; gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
    gl.uniform1i(gl.getUniformLocation(program,"tex"),0);
    const texel = gl.getUniformLocation(program,"texel");
    let raf = 0;
    const render = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth) {
        const size = Math.min(720, Math.round(root.clientWidth * Math.min(window.devicePixelRatio || 1,1.5)));
        if (canvas.width !== size || canvas.height !== size) { canvas.width=size; canvas.height=size; gl.viewport(0,0,size,size); }
        gl.bindTexture(gl.TEXTURE_2D,texture); gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video); gl.uniform2f(texel,1/video.videoWidth,1/video.videoHeight); gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      }
      raf=requestAnimationFrame(render);
    };
    video.addEventListener("canplay", () => { if (!reduceMotion.matches) { showMotion(); render(); } }, { once:true });
    reduceMotion.addEventListener("change", e => e.matches ? showPoster() : showMotion());
  } catch { showPoster(); }
}

function boot() {
  document.querySelectorAll<HTMLElement>(".hero-art").forEach(enhanceHeroMascot);
  const observer = new MutationObserver(() => document.querySelectorAll<HTMLElement>(".hero-art").forEach(enhanceHeroMascot));
  observer.observe(document.body, { childList:true, subtree:true });
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once:true });
  else boot();
}
