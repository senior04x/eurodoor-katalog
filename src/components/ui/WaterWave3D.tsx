import React, { useEffect, useRef } from 'react';

interface WaterWave3DProps {
  className?: string;
  style?: React.CSSProperties;
  /** Seconds per loop for main wave motion */
  speedSec?: number;
  /** Wave height factor */
  amplitude?: number;
  /** Wave frequency factor */
  frequency?: number;
  /** Deep water color (bottom) */
  deepColor?: string;
  /** Shallow water color (top) */
  shallowColor?: string;
  /** Foam color */
  foamColor?: string;
}

/**
 * Lightweight WebGL fragment shader that fakes 3D water with
 * - multi-octave Gerstner-like waves
 * - Fresnel term for view-dependent brightness
 * - directional lighting + specular highlight
 * - thresholded foam on crests
 *
 * Designed to sit behind content (e.g. button label) as a background.
 */
export default function WaterWave3D({
  className,
  style,
  speedSec = 7.5,
  amplitude = 0.12,
  frequency = 1.35,
  deepColor = '#0b5f9a',
  shallowColor = '#3db5ff',
  foamColor = '#ffffff'
}: WaterWave3DProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const rafRef = useRef<number>();
  const startRef = useRef<number>(performance.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl');
    } catch (e) {
      gl = null;
    }
    if (!gl) {
      // Graceful fallback: simple gradient background
      const ctx2d = canvas.getContext('2d');
      if (ctx2d) {
        const resize = () => {
          const dpr = (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1) || 1;
          const w = Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr));
          const h = Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr));
          if (canvas.width !== w || canvas.height !== h) {
            canvas.width = w;
            canvas.height = h;
          }
          const g = ctx2d.createLinearGradient(0, 0, 0, canvas.height);
          g.addColorStop(0, shallowColor);
          g.addColorStop(1, deepColor);
          ctx2d.clearRect(0, 0, canvas.width, canvas.height);
          ctx2d.fillStyle = g;
          ctx2d.fillRect(0, 0, canvas.width, canvas.height);
        };
        resize();
        let ro: ResizeObserver | null = null;
        if (typeof ResizeObserver !== 'undefined') {
          ro = new ResizeObserver(resize);
          ro.observe(canvas);
        } else {
          window.addEventListener('resize', resize);
        }
        return () => {
          if (ro) ro.disconnect();
          else window.removeEventListener('resize', resize);
        };
      }
      return;
    }

    glRef.current = gl;

    const vertexSrc = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main(){
        v_uv = (a_pos + 1.0) * 0.5;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fragSrc = `
      precision mediump float;
      varying vec2 v_uv;
      uniform float u_time;
      uniform vec2 u_res;
      uniform vec3 u_deep;
      uniform vec3 u_shallow;
      uniform vec3 u_foam;
      uniform float u_amp;
      uniform float u_freq;
      uniform float u_loop;

      // Hash noise
      float hash(vec2 p){
        p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5,183.3)));
        return fract(sin(p.x+p.y)*43758.5453123);
      }

      // Pseudo 2D Perlin-ish
      float noise(vec2 p){
        vec2 i = floor(p);
        vec2 f = fract(p);
        float a = hash(i);
        float b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0));
        float d = hash(i + vec2(1.0, 1.0));
        vec2 u = f*f*(3.0-2.0*f);
        return mix(a, b, u.x) + (c - a)*u.y*(1.0 - u.x) + (d - b)*u.x*u.y;
      }

      // Multi-octave waves (combination of sin and noise)
      float waveHeight(vec2 p){
        float t = u_time / u_loop;
        float h = 0.0;
        vec2 dir1 = normalize(vec2(1.0, 0.2));
        vec2 dir2 = normalize(vec2(-0.4, 1.0));
        vec2 dir3 = normalize(vec2(0.7, -0.6));
        h += sin(dot(p* u_freq, dir1) + t*6.28318) * 0.55;
        h += sin(dot(p*(u_freq*1.6), dir2) + t*8.0) * 0.3;
        h += sin(dot(p*(u_freq*2.3), dir3) - t*5.3) * 0.2;
        h += (noise(p*2.0 + t*0.6) - 0.5) * 0.6;
        return h * u_amp;
      }

      // Estimate normal from height field
      vec3 estimateNormal(vec2 p){
        float e = 0.0025;
        float hC = waveHeight(p);
        float hX = waveHeight(p + vec2(e,0.0));
        float hY = waveHeight(p + vec2(0.0,e));
        vec3 n = normalize(vec3(hC - hX, hC - hY, e));
        return n;
      }

      void main(){
        // keep aspect
        float aspect = u_res.x / u_res.y;
        vec2 uv = v_uv;
        vec2 p = vec2(uv.x*aspect, uv.y);

        // Height and normal
        float h = waveHeight(p);
        vec3 n = estimateNormal(p);

        // Light and view
        vec3 lightDir = normalize(vec3(-0.3, 0.5, 0.8));
        vec3 viewDir = normalize(vec3(0.0, 0.0, 1.0));

        // Fresnel term
        float fresnel = pow(1.0 - max(dot(n, viewDir), 0.0), 3.0);

        // Diffuse + specular
        float diff = clamp(dot(n, lightDir), 0.0, 1.0);
        vec3 halfVec = normalize(lightDir + viewDir);
        float spec = pow(max(dot(n, halfVec), 0.0), 64.0) * 0.6;

        // Base water color blend by height (shallower near crests)
        float shallowMix = smoothstep(0.0, 0.25*u_amp, h + 0.12);
        vec3 water = mix(u_deep, u_shallow, shallowMix);

        // Foam near sharp crests
        float foam = smoothstep(0.22, 0.35, h + diff*0.35);
        foam *= smoothstep(0.4, 0.1, length(n.xy)); // sharper where slope high

        // Compose
        vec3 color = water;
        color += spec * vec3(1.0);
        color = mix(color, vec3(1.0), fresnel*0.15);
        color = mix(color, u_foam, foam*0.85);

        // Subtle vignetting for depth
        float vign = smoothstep(0.0, 0.9, length(uv - 0.5));
        color *= mix(1.0, 0.95, vign);

        gl_FragColor = vec4(color, 0.95);
      }
    `;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };

    const vs = compile(gl.VERTEX_SHADER, vertexSrc);
    const fs = compile(gl.FRAGMENT_SHADER, fragSrc);
    if (!vs || !fs) return;

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    programRef.current = program;

    const posLoc = gl.getAttribLocation(program, 'a_pos');
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    const verts = new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
       1,  1
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, 'u_time');
    const uRes = gl.getUniformLocation(program, 'u_res');
    const uDeep = gl.getUniformLocation(program, 'u_deep');
    const uShallow = gl.getUniformLocation(program, 'u_shallow');
    const uFoam = gl.getUniformLocation(program, 'u_foam');
    const uAmp = gl.getUniformLocation(program, 'u_amp');
    const uFreq = gl.getUniformLocation(program, 'u_freq');
    const uLoop = gl.getUniformLocation(program, 'u_loop');

    const hexToRgb = (hex: string): [number, number, number] => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      if (!m) return [0, 0, 0];
      return [parseInt(m[1], 16)/255, parseInt(m[2], 16)/255, parseInt(m[3], 16)/255];
    };

    const deep = hexToRgb(deepColor);
    const shallow = hexToRgb(shallowColor);
    const foam = hexToRgb(foamColor);

    const resize = () => {
      const dpr = (typeof devicePixelRatio !== 'undefined' ? devicePixelRatio : 1) || 1;
      const w = Math.max(1, Math.floor((canvas.clientWidth || 1) * dpr));
      const h = Math.max(1, Math.floor((canvas.clientHeight || 1) * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(resize);
      ro.observe(canvas);
    } else {
      window.addEventListener('resize', resize);
    }
    resize();

    const render = () => {
      const t = (performance.now() - startRef.current) / 1000;
      gl.useProgram(program);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform3f(uDeep, deep[0], deep[1], deep[2]);
      gl.uniform3f(uShallow, shallow[0], shallow[1], shallow[2]);
      gl.uniform3f(uFoam, foam[0], foam[1], foam[2]);
      gl.uniform1f(uAmp, amplitude);
      gl.uniform1f(uFreq, frequency);
      gl.uniform1f(uLoop, speedSec);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    };
    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (ro) ro.disconnect();
      else window.removeEventListener('resize', resize);
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
      }
    };
  }, [amplitude, frequency, speedSec, deepColor, shallowColor, foamColor]);

  return (
    <canvas ref={canvasRef} className={className} style={style} />
  );
}

