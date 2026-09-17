import { useEffect, useRef } from "react";
import "./mascot-hero.css";

const VIDEO_SRC = "/assets/hero-bg.mp4";
const POSTER_SRC = "/assets/hero-bg-poster.png";

const vertexShaderSource = `
attribute vec2 a_position;
attribute vec2 a_uv;
varying vec2 v_uv;
void main() { v_uv = a_uv; gl_Position = vec4(a_position, 0.0, 1.0); }
`;

const fragmentShaderSource = `
precision mediump float;
varying vec2 v_uv;
uniform sampler2D u_texture;
uniform vec2 u_texel;
float smooth01(float edge0, float edge1, float x) { float t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0); return t * t * (3.0 - 2.0 * t); }
float foregroundScore(vec3 color) {
  float maximum = max(max(color.r, color.g), color.b);
  float minimum = min(min(color.r, color.g), color.b);
  float saturation = maximum - minimum;
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  return max(smooth01(0.035, 0.13, saturation), smooth01(0.74, 0.58, luminance));
}
void main() {
  vec3 color = texture2D(u_texture, v_uv).rgb;
  float maximum = max(max(color.r, color.g), color.b);
  float minimum = min(min(color.r, color.g), color.b);
  float saturation = maximum - minimum;
  float luminance = dot(color, vec3(0.299, 0.587, 0.114));
  float local = 0.0;
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2(-2.0, -2.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2( 0.0, -2.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2( 2.0, -2.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2(-2.0,  0.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2( 2.0,  0.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2(-2.0,  2.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2( 0.0,  2.0)).rgb);
  local += foregroundScore(texture2D(u_texture, v_uv + u_texel * vec2( 2.0,  2.0)).rgb);
  local /= 8.0;
  float neutralBright = smooth01(0.15, 0.045, saturation) * smooth01(0.64, 0.84, luminance);
  float nearbyForeground = smooth01(0.07, 0.28, local);
  float alpha = 1.0 - neutralBright * (1.0 - nearbyForeground);
  gl_FragColor = vec4(color, alpha);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("Unable to create shader");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? "Unknown shader error";
    gl.deleteShader(shader);
    throw new Error(message);
  }
  return shader;
}

export function MascotHeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const posterRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const drawStatic = () => {
      video.pause();
      canvas.style.display = "none";
      if (posterRef.current) posterRef.current.style.display = "block";
    };

    if (reduceMotion.matches) { drawStatic(); return; }

    const gl = canvas.getContext("webgl", { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: "high-performance" });
    if (!gl) { drawStatic(); return; }

    let program: WebGLProgram;
    let frameId = 0;
    try {
      const vertex = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
      const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
      program = gl.createProgram()!;
      gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
      gl.deleteShader(vertex); gl.deleteShader(fragment);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program) ?? "Unable to link mascot shader");
    } catch { drawStatic(); return; }

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,0,0, 1,-1,1,0, -1,1,0,1, 1,1,1,1]), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_position");
    const uvLocation = gl.getAttribLocation(program, "a_uv");
    const textureLocation = gl.getUniformLocation(program, "u_texture");
    const texelLocation = gl.getUniformLocation(program, "u_texel");
    gl.useProgram(program);
    gl.enableVertexAttribArray(positionLocation); gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(uvLocation); gl.vertexAttribPointer(uvLocation, 2, gl.FLOAT, false, 16, 8);

    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.uniform1i(textureLocation, 0);

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const size = Math.min(720, Math.round(canvas.clientWidth * dpr));
      if (canvas.width !== size || canvas.height !== size) { canvas.width = size; canvas.height = size; gl.viewport(0, 0, size, size); }
    };
    const render = () => {
      if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA && video.videoWidth) {
        resize();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
        gl.uniform2f(texelLocation, 1 / video.videoWidth, 1 / video.videoHeight);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      }
      frameId = requestAnimationFrame(render);
    };
    const start = () => { video.play().catch(() => undefined); if (posterRef.current) posterRef.current.style.display = "none"; canvas.style.display = "block"; render(); };
    video.addEventListener("canplay", start, { once: true });
    const onMotionPreferenceChange = (event: MediaQueryListEvent) => { if (event.matches) drawStatic(); else video.play().catch(() => undefined); };
    reduceMotion.addEventListener("change", onMotionPreferenceChange);

    return () => {
      cancelAnimationFrame(frameId); video.removeEventListener("canplay", start); reduceMotion.removeEventListener("change", onMotionPreferenceChange);
      if (texture) gl.deleteTexture(texture); if (positionBuffer) gl.deleteBuffer(positionBuffer); gl.deleteProgram(program);
    };
  }, []);

  return (
    <div className="hero-mascot-motion" aria-hidden="true">
      <video ref={videoRef} className="hero-mascot-video" src={VIDEO_SRC} muted autoPlay loop playsInline preload="auto" />
      <canvas ref={canvasRef} className="hero-mascot-canvas" />
      <img ref={posterRef} className="hero-mascot-static" src={POSTER_SRC} alt="" width="640" height="640" decoding="async" />
    </div>
  );
}
