/**
 * HarvaIntro — Cinematic 3D intro
 * Three.js + GSAP — WebGL, orbital rings, particles, camera animation, mouse parallax
 *
 * Place in: src/components/HarvaIntro.tsx
 * Usage in App.tsx:
 *   import HarvaIntro from "./components/HarvaIntro";
 *   {!done && <HarvaIntro onComplete={() => setDone(true)} />}
 *
 * Requires (add to package.json):
 *   "three": "^0.169.0"
 *   "gsap": "^3.12.5"
 *   "@types/three": "^0.169.0"  (devDependencies)
 */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";

interface Props {
  onComplete: () => void;
}

export default function HarvaIntro({ onComplete }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const taglineRef = useRef<HTMLDivElement>(null);
  const enterRef   = useRef<HTMLButtonElement>(null);
  const lettersRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // ── Renderer ─────────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 1);

    // ── Scene & Camera ────────────────────────────────────────────────────────
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    camera.position.set(0, 0, 7); // GSAP pulls this in to 3.8

    // ── Lights ────────────────────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));

    const greenLight = new THREE.PointLight(0x22c55e, 4, 18);
    greenLight.position.set(2.5, 2, 3);
    scene.add(greenLight);

    const goldLight = new THREE.PointLight(0xd97706, 2.5, 18);
    goldLight.position.set(-3, -1.5, 2);
    scene.add(goldLight);

    const rimLight = new THREE.PointLight(0x14532d, 2, 25);
    rimLight.position.set(0, 0, -6);
    scene.add(rimLight);

    // ── Globe — solid core ────────────────────────────────────────────────────
    const globeMat = new THREE.MeshPhongMaterial({
      color: 0x050f0a, emissive: 0x0a2e1c, emissiveIntensity: 0.5,
      shininess: 50, transparent: true, opacity: 0,
    });
    const globe = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 64), globeMat);
    scene.add(globe);

    // ── Globe — wireframe shell ───────────────────────────────────────────────
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22c55e, wireframe: true, transparent: true, opacity: 0,
    });
    const wire = new THREE.Mesh(new THREE.SphereGeometry(1.003, 30, 30), wireMat);
    scene.add(wire);

    // ── Glow halo ─────────────────────────────────────────────────────────────
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x16a34a, transparent: true, opacity: 0, side: THREE.BackSide,
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(1.2, 32, 32), haloMat);
    scene.add(halo);

    // ── Orbital rings ─────────────────────────────────────────────────────────
    const ringDefs = [
      { r: 1.48, tube: 0.007, color: 0xd97706, rx: Math.PI / 2.5,  ry:  0.4 },
      { r: 1.80, tube: 0.005, color: 0x22c55e, rx: -Math.PI / 3,   ry:  0.7 },
      { r: 2.15, tube: 0.003, color: 0x15803d, rx:  Math.PI / 5,   ry: -0.5 },
    ];
    const rings = ringDefs.map(({ r, tube, color, rx, ry }) => {
      const mat  = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
      const mesh = new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 200), mat);
      mesh.rotation.x = rx;
      mesh.rotation.y = ry;
      scene.add(mesh);
      return { mesh, mat };
    });

    // ── Particles ─────────────────────────────────────────────────────────────
    const N    = 5000;
    const pos  = new Float32Array(N * 3);
    const col  = new Float32Array(N * 3);

    for (let i = 0; i < N; i++) {
      const phi   = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r     = 1.9 + Math.random() * 4.5;
      pos[i*3]   = r * Math.sin(phi) * Math.cos(theta);
      pos[i*3+1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i*3+2] = r * Math.cos(phi);
      if (Math.random() > 0.4) {
        col[i*3] = 0.13; col[i*3+1] = 0.77; col[i*3+2] = 0.37; // green
      } else {
        col[i*3] = 0.85; col[i*3+1] = 0.60; col[i*3+2] = 0.09; // gold
      }
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    pGeo.setAttribute("color",    new THREE.BufferAttribute(col, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.022, vertexColors: true, transparent: true, opacity: 0, sizeAttenuation: true,
    });
    const pts = new THREE.Points(pGeo, pMat);
    scene.add(pts);

    // ── GSAP master timeline ──────────────────────────────────────────────────
    const tl = gsap.timeline({ delay: 0.1 });

    tl.to(camera.position,  { z: 3.8, duration: 3.2, ease: "power3.inOut" },   0);
    tl.to(pMat,             { opacity: 0.75, duration: 2.0, ease: "power2.out" }, 0);
    tl.to(globeMat,         { opacity: 1,    duration: 1.6, ease: "power2.out" }, 0.7);
    tl.to(wireMat,          { opacity: 0.14, duration: 1.6, ease: "power2.out" }, 0.7);
    tl.to(haloMat,          { opacity: 0.08, duration: 2.0, ease: "power2.out" }, 0.9);

    const ringOpacities = [0.9, 0.55, 0.28];
    rings.forEach(({ mat }, i) => {
      tl.to(mat, { opacity: ringOpacities[i], duration: 1.1, ease: "power2.out" }, 1.1 + i * 0.3);
    });

    // Letters fly in
    lettersRef.current.forEach((el, i) => {
      if (!el) return;
      tl.fromTo(el,
        { opacity: 0, y: 40, filter: "blur(14px)" },
        { opacity: 1, y: 0,  filter: "blur(0px)", duration: 0.65, ease: "power3.out" },
        1.9 + i * 0.11
      );
    });

    // Tagline
    if (taglineRef.current) {
      tl.fromTo(taglineRef.current,
        { opacity: 0, letterSpacing: "0.9em" },
        { opacity: 1, letterSpacing: "0.35em", duration: 1.3, ease: "power2.out" },
        2.9
      );
    }

    // Enter button
    if (enterRef.current) {
      tl.fromTo(enterRef.current,
        { opacity: 0, scale: 0.75, y: 12 },
        { opacity: 1, scale: 1,    y: 0,  duration: 0.7, ease: "back.out(1.7)" },
        3.8
      );
      tl.to(enterRef.current, {
        boxShadow: "0 0 28px rgba(34,197,94,0.45)",
        repeat: -1, yoyo: true, duration: 1.4, ease: "sine.inOut",
      }, 4.6);
    }

    // ── Mouse / touch parallax ────────────────────────────────────────────────
    const mouse = { x: 0, y: 0 };
    const onMove = (e: MouseEvent | TouchEvent) => {
      const px = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const py = "touches" in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
      mouse.x =  (px / window.innerWidth  - 0.5);
      mouse.y = -(py / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove",  onMove as EventListener, { passive: true });

    // ── Render loop ───────────────────────────────────────────────────────────
    const clock = new THREE.Clock();
    let raf: number;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      globe.rotation.y = t * 0.07;
      wire.rotation.y  = t * 0.07;
      halo.rotation.y  = t * 0.05;

      rings[0].mesh.rotation.z =  t * 0.20;
      rings[1].mesh.rotation.z = -t * 0.13;
      rings[2].mesh.rotation.z =  t * 0.08;

      pts.rotation.y = t * 0.022;
      pts.rotation.x = Math.sin(t * 0.1) * 0.05;

      greenLight.intensity = 3.5 + Math.sin(t * 1.8) * 0.8;

      camera.position.x += (mouse.x * 0.55 - camera.position.x) * 0.04;
      camera.position.y += (mouse.y * 0.55 - camera.position.y) * 0.04;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };
    tick();

    // ── Resize ────────────────────────────────────────────────────────────────
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", onResize);

    // ── Keyboard skip ─────────────────────────────────────────────────────────
    const onKey = (e: KeyboardEvent) => {
      if (["Enter", " ", "Escape"].includes(e.key)) onComplete();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove as EventListener);
      window.removeEventListener("touchmove",  onMove as EventListener);
      window.removeEventListener("resize",     onResize);
      window.removeEventListener("keydown",    onKey);
      tl.kill();
      renderer.dispose();
    };
  }, [onComplete]);

  // ── JSX ───────────────────────────────────────────────────────────────────
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#000", overflow: "hidden" }}>

      {/* WebGL canvas */}
      <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} />

      {/* Radial vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.65) 100%)",
      }} />

      {/* Centred text overlay */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: "1.25rem", pointerEvents: "none", userSelect: "none",
      }}>

        {/* H A R V A */}
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.04em" }}>
          {"HARVA".split("").map((letter, i) => (
            <span
              key={i}
              ref={(el) => { lettersRef.current[i] = el; }}
              style={{
                display:    "inline-block",
                opacity:    0,
                fontSize:   "clamp(3.5rem, 11vw, 8.5rem)",
                fontWeight: 700,
                fontFamily: "'Inter', 'SF Pro Display', system-ui, -apple-system, sans-serif",
                color:      "#ffffff",
                letterSpacing: "0.06em",
                textShadow: "0 0 80px rgba(34,197,94,0.35), 0 0 28px rgba(34,197,94,0.18)",
              }}
            >
              {letter}
            </span>
          ))}
        </div>

        {/* Tagline */}
        <div ref={taglineRef} style={{
          opacity:       0,
          color:         "rgba(255,255,255,0.42)",
          fontSize:      "clamp(0.55rem, 1.4vw, 0.78rem)",
          fontWeight:    300,
          fontFamily:    "system-ui, sans-serif",
          textTransform: "uppercase",
          letterSpacing: "0.9em",
        }}>
          Digital Farming Platform
        </div>
      </div>

      {/* Enter */}
      <button
        ref={enterRef}
        onClick={onComplete}
        style={{
          position:      "absolute",
          bottom:        "9vh",
          left:          "50%",
          transform:     "translateX(-50%)",
          opacity:       0,
          background:    "transparent",
          border:        "1px solid rgba(34,197,94,0.45)",
          color:         "rgba(34,197,94,0.9)",
          padding:       "0.8rem 3.2rem",
          fontSize:      "0.72rem",
          fontFamily:    "system-ui, sans-serif",
          fontWeight:    400,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          cursor:        "pointer",
          borderRadius:  "2px",
          transition:    "background 0.25s, border-color 0.25s, color 0.25s",
        }}
        onMouseEnter={(e) => {
          const b = e.currentTarget;
          b.style.background  = "rgba(34,197,94,0.1)";
          b.style.borderColor = "rgba(34,197,94,0.85)";
          b.style.color       = "#ffffff";
        }}
        onMouseLeave={(e) => {
          const b = e.currentTarget;
          b.style.background  = "transparent";
          b.style.borderColor = "rgba(34,197,94,0.45)";
          b.style.color       = "rgba(34,197,94,0.9)";
        }}
      >
        Enter
      </button>

      {/* Skip */}
      <div
        onClick={onComplete}
        style={{
          position:      "absolute",
          top:           "1.5rem",
          right:         "2rem",
          color:         "rgba(255,255,255,0.18)",
          fontSize:      "0.62rem",
          letterSpacing: "0.14em",
          fontFamily:    "system-ui, sans-serif",
          cursor:        "pointer",
          userSelect:    "none",
          textTransform: "uppercase",
        }}
      >
        Skip
      </div>

    </div>
  );
}
