import { useEffect, useRef } from "react";

/**
 * AgriHubX Cinematic Intro — v3
 * 15 canvas-rendered scenes: aerial field, tractor hood POV, Africa map zoom,
 * market stall, crop rows, satellite, vehicle dash, constellation, rain + more.
 * Web Audio synthesised sound design per scene.
 *
 * Place in: src/components/AgriHubXIntro.tsx
 * App.tsx: const [done, setDone] = useState(false);
 *   {!done && <AgriHubXIntro onComplete={() => setDone(true)} />}
 */

interface Props { onComplete?: () => void; }

// ─── AUDIO ENGINE ────────────────────────────────────────────────────────────
function mkCtx() {
  const C = (window as any).AudioContext || (window as any).webkitAudioContext;
  return new C() as AudioContext;
}
function osc(ctx: AudioContext, type: OscillatorType, freq: number, endFreq: number, dur: number, vol: number) {
  try {
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.connect(g); g.connect(ctx.destination);
    o.type = type;
    o.frequency.setValueAtTime(freq, ctx.currentTime);
    if (endFreq !== freq) o.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    o.start(); o.stop(ctx.currentTime + dur + 0.02);
  } catch (_) {}
}
function nz(ctx: AudioContext, dur: number, vol: number, bpFreq = 2000) {
  try {
    const buf = ctx.createBuffer(1, ctx.sampleRate * dur, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
    f.type = "bandpass"; f.frequency.value = bpFreq;
    src.buffer = buf; src.connect(f); f.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(vol, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    src.start(); src.stop(ctx.currentTime + dur + 0.05);
  } catch (_) {}
}
const SFX = {
  tick:    (c: AudioContext) => { osc(c,"square",2200,400,0.025,0.30); },
  bass:    (c: AudioContext) => { osc(c,"sine",180,50,0.30,0.60); },
  whoosh:  (c: AudioContext) => { nz(c,0.30,0.22,800); osc(c,"sine",400,100,0.25,0.08); },
  drone:   (c: AudioContext) => { osc(c,"sine",55,45,0.70,0.35); osc(c,"sine",110,90,0.60,0.12); },
  engine:  (c: AudioContext) => { nz(c,0.50,0.30,120); osc(c,"sawtooth",80,75,0.50,0.15); },
  thud:    (c: AudioContext) => { osc(c,"sine",150,30,0.20,0.70); },
  shimmer: (c: AudioContext) => { osc(c,"sine",1200,2400,0.40,0.10); osc(c,"sine",900,1800,0.50,0.08); },
  rain:    (c: AudioContext) => { nz(c,0.50,0.35,4000); nz(c,0.50,0.20,2000); },
  sting:   (c: AudioContext) => {
    osc(c,"sine",50,40,2.0,0.65); osc(c,"sine",100,80,1.5,0.25);
    osc(c,"sine",200,900,0.8,0.15); nz(c,0.08,0.18,5000);
  },
};

// ─── LOGO STYLES ─────────────────────────────────────────────────────────────
interface LogoStyle {
  opacity: number; scale: number; y: number; color: string;
  mode: "normal"|"glow"|"glitch"|"sweep"|"dark"|"hidden"; tagline: boolean;
}
const L = (opacity=1,scale=1,y=0,color="#fff",mode:LogoStyle["mode"]="normal",tagline=false): LogoStyle =>
  ({ opacity, scale, y, color, mode, tagline });

// ─── SCENE TYPE ───────────────────────────────────────────────────────────────
type SFXKey = keyof typeof SFX | null;
interface Scene {
  id: string; dur: number; sfx: SFXKey;
  logo: LogoStyle;
  draw: (c: CanvasRenderingContext2D, W: number, H: number, t: number) => void; // t = 0..1
}

// ─── DRAW HELPERS ─────────────────────────────────────────────────────────────
const ease = (t: number) => t < 0.5 ? 2*t*t : -1+(4-2*t)*t;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

function drawGrain(c: CanvasRenderingContext2D, W: number, H: number, alpha = 0.06) {
  const img = c.createImageData(W, H);
  const d = img.data;
  for (let i = 0; i < d.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    d[i] = d[i+1] = d[i+2] = v; d[i+3] = (alpha * 255) | 0;
  }
  c.putImageData(img, 0, 0);
}

function drawStars(c: CanvasRenderingContext2D, W: number, H: number, count=120) {
  c.fillStyle = "#fff";
  for (let i = 0; i < count; i++) {
    const x = (Math.sin(i * 127.1) * 0.5 + 0.5) * W;
    const y = (Math.sin(i * 311.7) * 0.5 + 0.5) * H;
    const r = Math.sin(i * 53.3) * 0.5 + 0.8;
    c.globalAlpha = 0.4 + Math.sin(i * 73.1) * 0.3;
    c.beginPath(); c.arc(x, y, r, 0, Math.PI*2); c.fill();
  }
  c.globalAlpha = 1;
}

// Africa simplified outline (normalized 0..1)
const AFRICA: [number,number][] = [
  [0.38,0.02],[0.48,0.00],[0.58,0.01],[0.66,0.04],[0.74,0.08],[0.80,0.16],
  [0.84,0.25],[0.86,0.35],[0.83,0.45],[0.76,0.52],[0.72,0.60],[0.70,0.70],
  [0.65,0.80],[0.58,0.90],[0.50,0.97],[0.43,1.00],[0.36,0.97],[0.29,0.90],
  [0.22,0.80],[0.16,0.70],[0.10,0.58],[0.06,0.48],[0.04,0.38],[0.05,0.28],
  [0.08,0.20],[0.04,0.15],[0.06,0.10],[0.12,0.06],[0.20,0.03],[0.30,0.01],
];
// Kenya rough bounding box in normalized Africa space
const KENYA = { cx: 0.70, cy: 0.50, r: 0.055 };

// ─── SCENES ──────────────────────────────────────────────────────────────────
function buildScenes(): Scene[] {

  // ── S0: Particle void materialisation
  const S0: Scene = {
    id:"void", dur:500, sfx:"drone",
    logo: L(0,1,0,"#fff","normal",false),
    draw(c,W,H,t) {
      c.fillStyle="#000"; c.fillRect(0,0,W,H);
      const cx=W/2, cy=H/2;
      for(let i=0;i<80;i++){
        const angle=(i/80)*Math.PI*2;
        const maxR=Math.min(W,H)*0.4;
        const r=maxR*(1-t)*Math.abs(Math.sin(i*0.7));
        const x=cx+Math.cos(angle+t*2)*r;
        const y=cy+Math.sin(angle+t*2)*r;
        const alpha=t*0.7;
        c.globalAlpha=alpha; c.fillStyle="#22c55e";
        c.beginPath(); c.arc(x,y,1.2,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
      drawGrain(c,W,H,0.04);
    },
  };

  // ── S1: Aerial drone field — 3rd person top-down zoom out
  const S1: Scene = {
    id:"aerial", dur:700, sfx:"drone",
    logo: L(0.9,1,0,"#fff","normal",false),
    draw(c,W,H,t) {
      const zoom = lerp(1.4, 1.0, ease(t));
      c.save(); c.translate(W/2,H/2); c.scale(zoom,zoom); c.translate(-W/2,-H/2);
      // Sky strip
      const sky=c.createLinearGradient(0,0,0,H*0.08);
      sky.addColorStop(0,"#020e02"); sky.addColorStop(1,"#051505");
      c.fillStyle=sky; c.fillRect(0,0,W,H*0.08);
      // Field base
      c.fillStyle="#051a05"; c.fillRect(0,H*0.08,W,H);
      // Crop rows — converging lines from vanishing point
      const vx=W/2, vy=H*0.08;
      const rows=28;
      c.lineWidth=1.5;
      for(let i=0;i<rows;i++){
        const f=i/(rows-1);
        const bx=f*W;
        c.strokeStyle=`rgba(34,197,94,${0.15+f*(1-f)*0.6})`;
        c.beginPath(); c.moveTo(vx,vy); c.lineTo(bx,H); c.stroke();
        // Row plant dots
        for(let j=3;j<12;j++){
          const jt=j/12;
          const px=lerp(vx,bx,jt); const py=lerp(vy,H,jt);
          c.fillStyle=`rgba(34,197,94,${jt*0.6})`;
          c.beginPath(); c.arc(px,py,jt*2.5,0,Math.PI*2); c.fill();
        }
      }
      // AgriHubX brand on field (below logo overlay)
      c.restore();
      drawGrain(c,W,H,0.05);
    },
  };

  // ── S2: Tractor hood — 1st person POV
  const S2: Scene = {
    id:"tractor-hood", dur:700, sfx:"engine",
    logo: L(1,0.7,H=>H*0.18,"#22c55e","glow",false),
    draw(c,W,H,t) {
      // Sky
      const sky=c.createLinearGradient(0,0,0,H*0.45);
      sky.addColorStop(0,"#020d18"); sky.addColorStop(1,"#0a1a0a");
      c.fillStyle=sky; c.fillRect(0,0,W,H);
      // Field horizon
      const field=c.createLinearGradient(0,H*0.45,0,H*0.65);
      field.addColorStop(0,"#0a1f0a"); field.addColorStop(1,"#051005");
      c.fillStyle=field; c.fillRect(0,H*0.45,W,H*0.2);
      // Road/track perspective
      const roadL=lerp(W*0.30,W*0.20,t), roadR=lerp(W*0.70,W*0.80,t);
      c.fillStyle="#080f08";
      c.beginPath(); c.moveTo(W*0.46,H*0.45); c.lineTo(W*0.54,H*0.45);
      c.lineTo(roadR,H*0.65); c.lineTo(roadL,H*0.65); c.closePath(); c.fill();
      // Road dashes
      for(let i=0;i<5;i++){
        const jt=(i/5+t*0.3)%1;
        const y=lerp(H*0.45,H*0.65,jt);
        const w=lerp(4,14,jt); const xm=W/2;
        c.fillStyle=`rgba(34,197,94,${jt*0.5})`;
        c.fillRect(xm-w/2,y,w,lerp(3,10,jt));
      }
      // TRACTOR HOOD (trapezoid, wider at bottom)
      const shake=Math.sin(t*Math.PI*22)*1.5; // vibration
      const hoodTop=H*0.62, hoodBot=H;
      const hoodTL=W*0.12, hoodTR=W*0.88, hoodBL=-W*0.1, hoodBR=W*1.1;
      const metal=c.createLinearGradient(0,hoodTop,0,hoodBot);
      metal.addColorStop(0,"#1a2a1a"); metal.addColorStop(0.3,"#243324");
      metal.addColorStop(0.7,"#1a2a1a"); metal.addColorStop(1,"#111811");
      c.save(); c.translate(0,shake);
      c.fillStyle=metal;
      c.beginPath();
      c.moveTo(hoodTL,hoodTop); c.lineTo(hoodTR,hoodTop);
      c.lineTo(hoodBR,hoodBot); c.lineTo(hoodBL,hoodBot); c.closePath(); c.fill();
      // Hood rivets/lines (metallic detail)
      c.strokeStyle="rgba(34,197,94,0.1)"; c.lineWidth=0.5;
      for(let i=1;i<8;i++){
        const y=lerp(hoodTop,hoodBot,i/8);
        const xl=lerp(hoodTL,hoodBL,i/8), xr=lerp(hoodTR,hoodBR,i/8);
        c.beginPath(); c.moveTo(xl,y); c.lineTo(xr,y); c.stroke();
      }
      c.restore();
      drawGrain(c,W,H,0.06);
    },
  };

  // ── S3: Africa map zoom into Kenya
  const S3: Scene = {
    id:"africa-map", dur:800, sfx:"whoosh",
    logo: L(0,1,0,"#22c55e","normal",false),
    draw(c,W,H,t) {
      c.fillStyle="#020d14"; c.fillRect(0,0,W,H);
      drawStars(c,W,H,60);
      // Zoom: start whole Africa, end focused on Kenya
      const mapW=Math.min(W,H)*0.72;
      const mapH=mapW*1.2;
      // Kenya center in normalized Africa: ~(0.70, 0.50)
      const focusX=KENYA.cx, focusY=KENYA.cy;
      // Interpolate: zoom from overview to Kenya
      const zoomStart=1, zoomEnd=3.2;
      const zoom=lerp(zoomStart,zoomEnd,ease(t));
      // Pan so Kenya stays centered
      const offX=lerp(0,(focusX-0.5)*mapW*zoomEnd,ease(t));
      const offY=lerp(0,(focusY-0.5)*mapH*zoomEnd,ease(t));
      const mx=W/2-mapW/2-offX, my=H/2-mapH/2-offY;
      c.save(); c.translate(W/2,H/2); c.scale(zoom,zoom); c.translate(-W/2,-H/2);
      // Draw ocean glow behind africa
      const ocean=c.createRadialGradient(W/2,H/2,0,W/2,H/2,mapW*0.7);
      ocean.addColorStop(0,"rgba(0,40,60,0.4)"); ocean.addColorStop(1,"transparent");
      c.fillStyle=ocean; c.fillRect(0,0,W,H);
      // Draw Africa outline
      c.beginPath();
      AFRICA.forEach(([nx,ny],i)=>{
        const px=mx+nx*mapW, py=my+ny*mapH;
        i===0?c.moveTo(px,py):c.lineTo(px,py);
      });
      c.closePath();
      c.fillStyle="rgba(10,30,12,0.95)";
      c.strokeStyle="rgba(34,197,94,0.7)"; c.lineWidth=1.2/zoom;
      c.fill(); c.stroke();
      // Kenya highlight
      const kx=mx+KENYA.cx*mapW, ky=my+KENYA.cy*mapH;
      const kr=(KENYA.r*mapW)/zoom;
      const kAlpha=ease(t);
      const kGlow=c.createRadialGradient(kx,ky,0,kx,ky,kr*2.5);
      kGlow.addColorStop(0,`rgba(34,197,94,${kAlpha*0.5})`);
      kGlow.addColorStop(1,"transparent");
      c.fillStyle=kGlow; c.fillRect(kx-kr*3,ky-kr*3,kr*6,kr*6);
      // Kenya dot
      c.globalAlpha=kAlpha;
      c.fillStyle="#22c55e";
      c.beginPath(); c.arc(kx,ky,kr,0,Math.PI*2); c.fill();
      // Pin
      c.strokeStyle="#fff"; c.lineWidth=1/zoom;
      c.beginPath(); c.moveTo(kx,ky-kr); c.lineTo(kx,ky-kr*3); c.stroke();
      c.globalAlpha=1;
      c.restore();
      drawGrain(c,W,H,0.04);
    },
  };

  // ── S4: Flash cut
  const S4: Scene = {
    id:"flash", dur:65, sfx:"tick",
    logo: L(0,1,0,"#000","dark",false),
    draw(c,W,H) { c.fillStyle="#fff"; c.fillRect(0,0,W,H); },
  };

  // ── S5: Market stall sign — 3rd person
  const S5: Scene = {
    id:"market", dur:650, sfx:"whoosh",
    logo: L(1,0.65,H=>-H*0.12,"#fff","normal",false),
    draw(c,W,H,t) {
      // Warm ambient background
      const bg=c.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#0a0800"); bg.addColorStop(1,"#150f00");
      c.fillStyle=bg; c.fillRect(0,0,W,H);
      // Market ground
      c.fillStyle="#1a1100";
      c.fillRect(0,H*0.68,W,H*0.32);
      // Stall posts (left and right)
      const postW=W*0.025;
      [[W*0.08,H*0.15],[W*0.92,H*0.15]].forEach(([px,ph])=>{
        const wood=c.createLinearGradient(px,0,px+postW,0);
        wood.addColorStop(0,"#2a1a00"); wood.addColorStop(0.5,"#3d2800"); wood.addColorStop(1,"#2a1a00");
        c.fillStyle=wood; c.fillRect(px,ph,postW,H-ph);
      });
      // Crossbeam
      c.fillStyle="#2a1a00"; c.fillRect(W*0.08,H*0.15,W*0.84,H*0.03);
      // Hanging sign (swings slightly)
      const swing=Math.sin(t*Math.PI*3)*0.015;
      c.save(); c.translate(W/2,H*0.15);
      c.rotate(swing);
      // Sign shadow
      c.fillStyle="rgba(0,0,0,0.5)";
      c.fillRect(-W*0.22+4,H*0.02+4,W*0.44,H*0.15);
      // Sign board
      const signGrad=c.createLinearGradient(-W*0.22,0,W*0.22,0);
      signGrad.addColorStop(0,"#1a2a1a"); signGrad.addColorStop(0.5,"#243324"); signGrad.addColorStop(1,"#1a2a1a");
      c.fillStyle=signGrad;
      c.strokeStyle="rgba(34,197,94,0.6)"; c.lineWidth=1.5;
      c.beginPath(); c.roundRect(-W*0.22,H*0.02,W*0.44,H*0.15,8); c.fill(); c.stroke();
      // Rope strings from crossbeam
      c.strokeStyle="#3d2800"; c.lineWidth=1.5;
      [[-W*0.18,0],[W*0.18,0]].forEach(([rx])=>{
        c.beginPath(); c.moveTo(rx,-H*0.01); c.lineTo(rx,H*0.02); c.stroke();
      });
      c.restore();
      // Produce on table
      const prodColors=["#dc2626","#f97316","#eab308","#22c55e","#f472b6"];
      const table=c.createLinearGradient(0,H*0.58,0,H*0.68);
      table.addColorStop(0,"#2a1a00"); table.addColorStop(1,"#1a1000");
      c.fillStyle=table; c.fillRect(W*0.05,H*0.58,W*0.9,H*0.1);
      for(let i=0;i<22;i++){
        const px=W*0.08+i*(W*0.84/22)+(Math.sin(i*1.7)*8);
        const py=H*0.59+Math.sin(i*2.3)*8;
        const r=6+Math.sin(i*3.1)*3;
        c.globalAlpha=0.7+ease(t)*0.3;
        c.fillStyle=prodColors[i%prodColors.length];
        c.beginPath(); c.arc(px,py,r,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
      // Warm lighting from stall
      const lamp=c.createRadialGradient(W/2,H*0.15,0,W/2,H*0.15,W*0.5);
      lamp.addColorStop(0,"rgba(251,191,36,0.08)"); lamp.addColorStop(1,"transparent");
      c.fillStyle=lamp; c.fillRect(0,0,W,H);
      drawGrain(c,W,H,0.06);
    },
  };

  // ── S6: Satellite pull-back — Earth from space
  const S6: Scene = {
    id:"satellite", dur:700, sfx:"drone",
    logo: L(0.8,0.8,0,"#fff","normal",false),
    draw(c,W,H,t) {
      c.fillStyle="#000"; c.fillRect(0,0,W,H);
      drawStars(c,W,H,200);
      // Earth zooms out
      const earthR=lerp(W*1.5,Math.min(W,H)*0.38,ease(t));
      const ex=W/2, ey=H/2;
      // Atmosphere glow
      const atm=c.createRadialGradient(ex,ey,earthR*0.95,ex,ey,earthR*1.15);
      atm.addColorStop(0,"rgba(30,100,200,0.35)"); atm.addColorStop(1,"transparent");
      c.fillStyle=atm; c.beginPath(); c.arc(ex,ey,earthR*1.15,0,Math.PI*2); c.fill();
      // Ocean
      const ocean=c.createRadialGradient(ex-earthR*0.2,ey-earthR*0.2,0,ex,ey,earthR);
      ocean.addColorStop(0,"#0a3060"); ocean.addColorStop(0.6,"#061830"); ocean.addColorStop(1,"#020810");
      c.fillStyle=ocean; c.beginPath(); c.arc(ex,ey,earthR,0,Math.PI*2); c.fill();
      // Africa landmass on Earth
      c.save(); c.beginPath(); c.arc(ex,ey,earthR,0,Math.PI*2); c.clip();
      const afScale=earthR*1.6, afX=ex+earthR*0.08, afY=ey-earthR*0.1;
      c.beginPath();
      AFRICA.forEach(([nx,ny],i)=>{
        const px=afX+(nx-0.5)*afScale, py=afY+(ny-0.5)*afScale*1.2;
        i===0?c.moveTo(px,py):c.lineTo(px,py);
      });
      c.closePath(); c.fillStyle="#1a5c2a"; c.fill();
      // Kenya glow
      const kgx=afX+(KENYA.cx-0.5)*afScale, kgy=afY+(KENYA.cy-0.5)*afScale*1.2;
      const kg=c.createRadialGradient(kgx,kgy,0,kgx,kgy,earthR*0.18);
      kg.addColorStop(0,"rgba(34,197,94,0.5)"); kg.addColorStop(1,"transparent");
      c.fillStyle=kg; c.fillRect(kgx-earthR*0.2,kgy-earthR*0.2,earthR*0.4,earthR*0.4);
      c.restore();
      // Earth edge shadow
      const shadow=c.createRadialGradient(ex+earthR*0.3,ey+earthR*0.3,earthR*0.4,ex,ey,earthR);
      shadow.addColorStop(0,"transparent"); shadow.addColorStop(1,"rgba(0,0,0,0.8)");
      c.fillStyle=shadow; c.beginPath(); c.arc(ex,ey,earthR,0,Math.PI*2); c.fill();
      drawGrain(c,W,H,0.04);
    },
  };

  // ── S7: Phone in hand — 2nd person
  const S7: Scene = {
    id:"phone", dur:650, sfx:"shimmer",
    logo: L(1,0.45,H=>H*0.22,"#22c55e","glow",false),
    draw(c,W,H,t) {
      const bg=c.createLinearGradient(0,0,W,H);
      bg.addColorStop(0,"#030a03"); bg.addColorStop(1,"#050f05");
      c.fillStyle=bg; c.fillRect(0,0,W,H);
      // Hand holding phone (simple silhouette)
      const ph=H*0.72, pw=Math.min(W*0.38,220);
      const px=W/2-pw/2, py=H/2-ph/2;
      const tilt=-0.06;
      c.save(); c.translate(W/2,H/2); c.rotate(tilt); c.translate(-W/2,-H/2);
      // Phone body shadow
      c.fillStyle="rgba(0,0,0,0.5)";
      c.beginPath(); c.roundRect(px+6,py+8,pw,ph,pw*0.08); c.fill();
      // Phone body
      const phoneBg=c.createLinearGradient(px,py,px+pw,py+ph);
      phoneBg.addColorStop(0,"#1a1a1a"); phoneBg.addColorStop(1,"#0d0d0d");
      c.fillStyle=phoneBg; c.strokeStyle="rgba(255,255,255,0.12)"; c.lineWidth=1;
      c.beginPath(); c.roundRect(px,py,pw,ph,pw*0.08); c.fill(); c.stroke();
      // Phone screen
      const sx=px+pw*0.04, sy=py+ph*0.04, sw=pw*0.92, sh=ph*0.88;
      const screen=c.createLinearGradient(sx,sy,sx,sy+sh);
      screen.addColorStop(0,"#050f05"); screen.addColorStop(1,"#030803");
      c.fillStyle=screen; c.beginPath(); c.roundRect(sx,sy,sw,sh,pw*0.04); c.fill();
      // App UI: nav bar
      c.fillStyle="rgba(34,197,94,0.15)";
      c.fillRect(sx,sy,sw,sh*0.08);
      // Nav dots
      [0.2,0.4,0.6,0.8].forEach((f,i)=>{
        c.fillStyle=i===0?"#22c55e":"rgba(255,255,255,0.2)";
        c.beginPath(); c.arc(sx+sw*f,sy+sh*0.04,3,0,Math.PI*2); c.fill();
      });
      // Content rows (simulated cards)
      for(let i=0;i<5;i++){
        const cy2=sy+sh*(0.12+i*0.16);
        const alpha=0.1+i*0.04;
        c.fillStyle=`rgba(34,197,94,${alpha})`;
        c.beginPath(); c.roundRect(sx+sw*0.04,cy2,sw*0.92,sh*0.11,4); c.fill();
      }
      // Bottom camera notch
      c.fillStyle="#1a1a1a";
      c.beginPath(); c.arc(W/2,py+ph*0.96,pw*0.04,0,Math.PI*2); c.fill();
      // Screen glow
      const glow=c.createRadialGradient(W/2,H/2,0,W/2,H/2,pw*0.6);
      glow.addColorStop(0,"rgba(34,197,94,0.06)"); glow.addColorStop(1,"transparent");
      c.fillStyle=glow; c.fillRect(0,0,W,H);
      c.restore();
      drawGrain(c,W,H,0.05);
    },
  };

  // ── S8: Crop rows — 1st person walking
  const S8: Scene = {
    id:"crop-rows", dur:700, sfx:"whoosh",
    logo: L(0.9,0.85,H=>-H*0.05,"#fff","normal",false),
    draw(c,W,H,t) {
      // Sky
      const sky=c.createLinearGradient(0,0,0,H*0.38);
      sky.addColorStop(0,"#020e18"); sky.addColorStop(1,"#0a1a0a");
      c.fillStyle=sky; c.fillRect(0,0,W,H*0.38);
      // Ground
      const gnd=c.createLinearGradient(0,H*0.38,0,H);
      gnd.addColorStop(0,"#0a1a06"); gnd.addColorStop(1,"#040c03");
      c.fillStyle=gnd; c.fillRect(0,H*0.38,W,H*0.62);
      // Walking bob
      const bob=Math.sin(t*Math.PI*6)*H*0.008;
      c.save(); c.translate(0,bob);
      // Vanishing point
      const vpx=W/2+Math.sin(t*Math.PI)*W*0.02, vpy=H*0.38;
      // Left crop row
      const rowPairs=[[0.12,0.35],[0.22,0.28],[0.32,0.22],[0.42,0.16]];
      const rowColors=["#15803d","#16a34a","#22c55e","#4ade80"];
      rowPairs.forEach(([bx,topW],ri)=>{
        // Left side
        const lbx=bx*W, ltx=lerp(vpx,lbx,0.02);
        const rbx=(1-bx)*W, rtx=lerp(vpx,rbx,0.02);
        for(let j=0;j<18;j++){
          const jt=j/17;
          const jt2=(j+1)/17;
          // Left plant segment
          const x1=lerp(ltx,lbx,jt), y1=lerp(vpy,H,jt);
          const x2=lerp(ltx,lbx,jt2), y2=lerp(vpy,H,jt2);
          const w1=lerp(1,topW*W,jt), w2=lerp(1,topW*W,jt2);
          c.fillStyle=`rgba(${ri<2?"21,128,61":"34,197,94"},${0.3+jt*0.5})`;
          // Draw stem
          c.beginPath(); c.moveTo(x1-w1/2,y1); c.lineTo(x1+w1/2,y1);
          c.lineTo(x2+w2/2,y2); c.lineTo(x2-w2/2,y2); c.closePath(); c.fill();
          // Right side mirror
          const rx1=W-x1, rx2=W-x2;
          c.beginPath(); c.moveTo(rx1-w1/2,y1); c.lineTo(rx1+w1/2,y1);
          c.lineTo(rx2+w2/2,y2); c.lineTo(rx2-w2/2,y2); c.closePath(); c.fill();
        }
      });
      // Path between rows
      c.fillStyle="rgba(5,15,3,0.8)";
      c.beginPath(); c.moveTo(vpx-2,vpy); c.lineTo(vpx+2,vpy);
      c.lineTo(W*0.56,H); c.lineTo(W*0.44,H); c.closePath(); c.fill();
      c.restore();
      drawGrain(c,W,H,0.06);
    },
  };

  // ── S9: Flash
  const S9: Scene = {
    id:"flash2", dur:65, sfx:"tick",
    logo: L(0,1,0,"#000","dark",false),
    draw(c,W,H) { c.fillStyle="#fff"; c.fillRect(0,0,W,H); },
  };

  // ── S10: Vehicle dashboard — 1st person driving
  const S10: Scene = {
    id:"vehicle-dash", dur:700, sfx:"engine",
    logo: L(0.9,0.7,H=>H*0.14,"#22c55e","glow",false),
    draw(c,W,H,t) {
      const bg=c.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#030a03"); bg.addColorStop(1,"#010501");
      c.fillStyle=bg; c.fillRect(0,0,W,H);
      const shake=Math.sin(t*Math.PI*20)*1.2;
      c.save(); c.translate(shake,0);
      // Windshield area (trapezoid)
      const wsTop=H*0.04, wsBot=H*0.55;
      const wsL=W*0.08, wsR=W*0.92, wsInL=W*0.22, wsInR=W*0.78;
      c.fillStyle="#020602";
      c.beginPath(); c.moveTo(wsL,wsTop); c.lineTo(wsR,wsTop); c.lineTo(wsInR,wsBot); c.lineTo(wsInL,wsBot); c.closePath(); c.fill();
      // Road through windshield
      const road=c.createLinearGradient(0,wsBot*0.5,0,wsBot);
      road.addColorStop(0,"#0a1a04"); road.addColorStop(1,"#050d02");
      c.save(); c.beginPath(); c.moveTo(wsL,wsTop); c.lineTo(wsR,wsTop); c.lineTo(wsInR,wsBot); c.lineTo(wsInL,wsBot); c.closePath(); c.clip();
      c.fillStyle=road; c.fillRect(0,0,W,H);
      // Road perspective
      c.fillStyle="#060e02";
      c.beginPath(); c.moveTo(W*0.45,wsTop); c.lineTo(W*0.55,wsTop); c.lineTo(wsInR,wsBot); c.lineTo(wsInL,wsBot); c.closePath(); c.fill();
      // Road lines
      for(let i=0;i<6;i++){
        const jt=((i/6)+t*0.4)%1;
        const y=lerp(wsTop,wsBot,jt);
        const lw=lerp(2,12,jt);
        c.fillStyle=`rgba(34,197,94,${jt*0.4})`;
        c.fillRect(W/2-lw/2,y,lw,lerp(4,20,jt));
      }
      // Trees silhouette on horizon
      for(let i=0;i<14;i++){
        const tx=wsInL+i*((wsInR-wsInL)/14);
        const th=wsBot*lerp(0.07,0.14,Math.abs(Math.sin(i*2.3)));
        c.fillStyle="rgba(5,20,5,0.8)";
        c.beginPath(); c.moveTo(tx,wsBot); c.lineTo(tx+8,wsBot-th); c.lineTo(tx+16,wsBot); c.closePath(); c.fill();
      }
      c.restore();
      // Windshield pillar frame
      c.fillStyle="#0a0f0a";
      c.beginPath(); c.moveTo(0,0); c.lineTo(wsL,wsTop); c.lineTo(wsInL,wsBot); c.lineTo(0,H); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(W,0); c.lineTo(wsR,wsTop); c.lineTo(wsInR,wsBot); c.lineTo(W,H); c.closePath(); c.fill();
      // Dashboard
      const dash=c.createLinearGradient(0,wsBot,0,H);
      dash.addColorStop(0,"#111a11"); dash.addColorStop(1,"#0a110a");
      c.fillStyle=dash; c.fillRect(0,wsBot,W,H-wsBot);
      // Gauges
      [[W*0.3,H*0.75],[W*0.7,H*0.75]].forEach(([gx,gy])=>{
        c.strokeStyle="rgba(34,197,94,0.3)"; c.lineWidth=1.5;
        c.beginPath(); c.arc(gx,gy,H*0.06,0,Math.PI*2); c.stroke();
        c.strokeStyle="rgba(34,197,94,0.8)"; c.lineWidth=2;
        c.beginPath(); c.moveTo(gx,gy); c.lineTo(gx+H*0.05*Math.cos(-1.2+t),gy+H*0.05*Math.sin(-1.2+t)); c.stroke();
      });
      // Steering wheel
      c.strokeStyle="rgba(34,197,94,0.2)"; c.lineWidth=8;
      c.beginPath(); c.arc(W/2,H*0.93,H*0.09,0,Math.PI*2); c.stroke();
      c.strokeStyle="rgba(34,197,94,0.15)"; c.lineWidth=3;
      c.beginPath(); c.moveTo(W/2,H*0.93-H*0.09); c.lineTo(W/2,H*0.93+H*0.09); c.stroke();
      c.beginPath(); c.moveTo(W/2-H*0.09,H*0.93); c.lineTo(W/2+H*0.09,H*0.93); c.stroke();
      c.restore();
      drawGrain(c,W,H,0.07);
    },
  };

  // ── S11: Glitch cut
  const S11: Scene = {
    id:"glitch", dur:160, sfx:"tick",
    logo: L(1,1,0,"#fff","glitch",false),
    draw(c,W,H,t) {
      c.fillStyle="#000"; c.fillRect(0,0,W,H);
      // Horizontal glitch slices
      for(let i=0;i<12;i++){
        if(Math.random()>0.6){
          const y=Math.random()*H;
          const h2=Math.random()*H*0.04+2;
          const off=(Math.random()-0.5)*W*0.06;
          c.save(); c.translate(off,0);
          c.fillStyle=`rgba(${Math.random()>0.5?"248,113,113":"52,211,153"},0.15)`;
          c.fillRect(0,y,W,h2); c.restore();
        }
      }
      drawGrain(c,W,H,0.08);
    },
  };

  // ── S12: Night sky constellation
  const S12: Scene = {
    id:"constellation", dur:650, sfx:"shimmer",
    logo: L(0,1,0,"#fff","normal",false),
    draw(c,W,H,t) {
      const bg=c.createLinearGradient(0,0,0,H);
      bg.addColorStop(0,"#000208"); bg.addColorStop(1,"#000105");
      c.fillStyle=bg; c.fillRect(0,0,W,H);
      // Stars
      for(let i=0;i<180;i++){
        const x=(Math.sin(i*127.1)*0.5+0.5)*W;
        const y=(Math.sin(i*311.7)*0.5+0.5)*H;
        const r=Math.sin(i*53.3)*0.4+0.7;
        const twinkle=Math.abs(Math.sin(t*Math.PI*3+i*0.8));
        c.globalAlpha=(0.3+twinkle*0.4);
        c.fillStyle="#fff"; c.beginPath(); c.arc(x,y,r,0,Math.PI*2); c.fill();
      }
      c.globalAlpha=1;
      // AgriHubX constellation — key stars that form the logo shape
      const stars: [number,number][] = [
        // A
        [0.15,0.45],[0.18,0.35],[0.21,0.45],[0.19,0.40],
        // G
        [0.26,0.38],[0.24,0.43],[0.28,0.45],[0.29,0.41],
        // Leaf icon
        [0.50,0.30],[0.50,0.50],[0.44,0.42],[0.56,0.42],
        // H
        [0.62,0.35],[0.62,0.45],[0.65,0.40],[0.68,0.35],[0.68,0.45],
        // X
        [0.74,0.35],[0.78,0.45],[0.76,0.40],[0.74,0.45],[0.78,0.35],
      ];
      const conAlpha=ease(t);
      // Draw constellation lines
      c.strokeStyle=`rgba(34,197,94,${conAlpha*0.35})`; c.lineWidth=0.8;
      stars.forEach(([x,y],i)=>{
        if(i<stars.length-1){
          const nx=stars[i+1][0], ny=stars[i+1][1];
          if(Math.hypot((nx-x)*W,(ny-y)*H)<W*0.12){
            c.beginPath();
            c.moveTo(x*W,y*H); c.lineTo(nx*W,ny*H); c.stroke();
          }
        }
      });
      // Draw star nodes
      stars.forEach(([x,y],i)=>{
        const glow=c.createRadialGradient(x*W,y*H,0,x*W,y*H,W*0.018);
        glow.addColorStop(0,`rgba(34,197,94,${conAlpha*0.9})`);
        glow.addColorStop(0.3,`rgba(34,197,94,${conAlpha*0.3})`);
        glow.addColorStop(1,"transparent");
        c.globalAlpha=conAlpha;
        c.fillStyle=glow; c.fillRect(x*W-W*0.02,y*H-W*0.02,W*0.04,W*0.04);
        c.fillStyle="#fff"; c.beginPath(); c.arc(x*W,y*H,2.2,0,Math.PI*2); c.fill();
      });
      c.globalAlpha=1;
      drawGrain(c,W,H,0.04);
    },
  };

  // ── S13: Rain on logo surface
  const S13: Scene = {
    id:"rain", dur:600, sfx:"rain",
    logo: L(0.6,1,0,"rgba(255,255,255,0.5)","normal",false),
    draw(c,W,H,t) {
      c.fillStyle="#000"; c.fillRect(0,0,W,H);
      // Rain drops
      const dropCount=120;
      for(let i=0;i<dropCount;i++){
        const phase=(t*3+i/dropCount)%1;
        const x=(Math.sin(i*173.1)*0.5+0.5)*W;
        const y=phase*H*1.2-H*0.1;
        const len=lerp(8,25,Math.sin(i*53.1)*0.5+0.5);
        const alpha=0.15+Math.sin(i*37.3)*0.1;
        c.strokeStyle=`rgba(100,200,255,${alpha})`;
        c.lineWidth=0.8;
        c.beginPath(); c.moveTo(x,y); c.lineTo(x-len*0.15,y+len); c.stroke();
      }
      // Ripples on ground surface
      for(let i=0;i<15;i++){
        const rx=(Math.sin(i*211.3)*0.5+0.5)*W;
        const ry=H*0.65+(Math.sin(i*137.1)*0.5+0.5)*H*0.25;
        const age=(t*2+i/15)%1;
        const r=age*W*0.04;
        c.globalAlpha=(1-age)*0.3;
        c.strokeStyle="rgba(100,200,255,0.6)"; c.lineWidth=0.8;
        c.beginPath(); c.ellipse(rx,ry,r,r*0.25,0,0,Math.PI*2); c.stroke();
      }
      c.globalAlpha=1;
      // Ground reflection of logo (blurry)
      const refGrad=c.createLinearGradient(0,H*0.6,0,H);
      refGrad.addColorStop(0,"rgba(34,197,94,0.08)"); refGrad.addColorStop(1,"transparent");
      c.fillStyle=refGrad; c.fillRect(W*0.2,H*0.6,W*0.6,H*0.4);
      drawGrain(c,W,H,0.04);
    },
  };

  // ── S14: Final cinematic settle
  const S14: Scene = {
    id:"final", dur:1600, sfx:"sting",
    logo: L(1,1,0,"#fff","final",true),
    draw(c,W,H,t) {
      c.fillStyle="#000"; c.fillRect(0,0,W,H);
      // Subtle vignette
      const vig=c.createRadialGradient(W/2,H/2,Math.min(W,H)*0.3,W/2,H/2,Math.min(W,H)*0.75);
      vig.addColorStop(0,"transparent"); vig.addColorStop(1,"rgba(0,0,0,0.7)");
      c.fillStyle=vig; c.fillRect(0,0,W,H);
      // Ambient green shimmer on logo
      const shimmer=c.createRadialGradient(W/2,H/2,0,W/2,H/2,Math.min(W,H)*0.4);
      shimmer.addColorStop(0,`rgba(34,197,94,${t*0.06})`); shimmer.addColorStop(1,"transparent");
      c.fillStyle=shimmer; c.fillRect(0,0,W,H);
      drawGrain(c,W,H,0.035);
    },
  };

  // ── S15: Fade out
  const S15: Scene = {
    id:"fadeout", dur:750, sfx:null,
    logo: L(1,1,0,"#fff","normal",false),
    draw(c,W,H,t) { c.fillStyle="#000"; c.fillRect(0,0,W,H); },
  };

  return [S0,S1,S2,S3,S4,S5,S6,S7,S8,S9,S10,S11,S12,S13,S14,S15];
}

// ─── CSS ──────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Syne:wght@700&display=swap');
#ahx-wrap{position:fixed;inset:0;z-index:9999;overflow:hidden;background:#000;}
#ahx-canvas{position:absolute;inset:0;width:100%;height:100%;}
#ahx-logo{
  position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
  display:flex;flex-direction:column;align-items:center;gap:0;
  pointer-events:none;user-select:none;will-change:transform,opacity;
  font-family:'Bebas Neue',sans-serif; z-index:2;
}
#ahx-icon{margin-bottom:6px;}
#ahx-name{
  font-size:clamp(52px,10vw,100px);letter-spacing:0.08em;line-height:1;
  white-space:nowrap;position:relative;color:#fff;will-change:color,text-shadow;
}
#ahx-tag{
  font-family:'Syne',sans-serif;font-size:clamp(9px,1.3vw,13px);
  letter-spacing:0.42em;text-transform:uppercase;margin-top:8px;opacity:0;color:#fff;
}
#ahx-g1,#ahx-g2{
  position:absolute;top:0;left:0;width:100%;
  font-family:'Bebas Neue',sans-serif;
  font-size:clamp(52px,10vw,100px);letter-spacing:0.08em;line-height:1;white-space:nowrap;
}
#ahx-g1{display:none;animation:ahx-gl1 0.11s steps(1) infinite;color:#fff;}
#ahx-g2{display:none;animation:ahx-gl2 0.08s steps(1) infinite;}
@keyframes ahx-gl1{0%{clip-path:inset(18% 0 60% 0);transform:translateX(-8px)}33%{clip-path:inset(55% 0 12% 0);transform:translateX(8px)}66%{clip-path:inset(8% 0 78% 0);transform:translateX(-5px)}100%{clip-path:inset(0);transform:translateX(0)}}
@keyframes ahx-gl2{0%{clip-path:inset(60% 0 15% 0);transform:translateX(9px);color:#f87171}33%{clip-path:inset(22% 0 52% 0);transform:translateX(-9px);color:#34d399}66%{clip-path:inset(72% 0 5% 0);transform:translateX(6px);color:#60a5fa}100%{clip-path:inset(0);transform:translateX(0);color:#fff}}
@keyframes ahx-glow{0%,100%{text-shadow:0 0 20px #22c55e55,0 0 55px #22c55e22}50%{text-shadow:0 0 45px #22c55ecc,0 0 120px #22c55e88}}
@keyframes ahx-sweep{0%{background-position:-200% center}100%{background-position:350% center}}
@keyframes ahx-settle{0%{transform:scale(1.12);letter-spacing:0.22em;opacity:0.25}55%{transform:scale(1.02);letter-spacing:0.10em;opacity:1}100%{transform:scale(1);letter-spacing:0.08em;opacity:1}}
@keyframes ahx-tagfade{0%,50%{opacity:0;transform:translateY(12px)}100%{opacity:0.55;transform:translateY(0)}}
#ahx-tap{position:absolute;inset:0;z-index:20;display:flex;align-items:center;justify-content:center;background:#000;cursor:pointer;flex-direction:column;gap:18px;font-family:'Syne',sans-serif;}
#ahx-tap-label{font-size:11px;letter-spacing:0.45em;text-transform:uppercase;color:#4ade80;opacity:0.75;}
#ahx-ring{width:68px;height:68px;border:1.5px solid #4ade80;border-radius:50%;display:flex;align-items:center;justify-content:center;animation:ahx-pulse 2s ease-in-out infinite;}
@keyframes ahx-pulse{0%,100%{opacity:0.35;transform:scale(1)}50%{opacity:1;transform:scale(1.08)}}
#ahx-skip{position:absolute;bottom:26px;right:26px;font-family:'Syne',sans-serif;font-size:10px;letter-spacing:0.38em;text-transform:uppercase;opacity:0.28;cursor:pointer;border:none;background:none;color:#fff;transition:opacity 0.2s;z-index:30;padding:8px 12px;}
#ahx-skip:hover{opacity:0.7;}
`;

const LEAF = (col: string) =>
  `<svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M32 56C32 56 8 44 8 24C8 24 20 8 40 10C60 12 58 34 46 44C38 50 32 56 32 56Z" fill="${col}" fill-opacity="0.92"/><path d="M32 56C32 34 22 20 22 20" stroke="${col}" stroke-width="2.5" stroke-linecap="round" opacity="0.55"/></svg>`;

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function AgriHubXIntro({ onComplete }: Props) {
  const wrapRef   = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef   = useRef<HTMLDivElement>(null);
  const iconRef   = useRef<HTMLSpanElement>(null);
  const nameRef   = useRef<HTMLSpanElement>(null);
  const g1Ref     = useRef<HTMLSpanElement>(null);
  const g2Ref     = useRef<HTMLSpanElement>(null);
  const tagRef    = useRef<HTMLSpanElement>(null);
  const tapRef    = useRef<HTMLDivElement>(null);
  const audioRef  = useRef<AudioContext | null>(null);
  const timers    = useRef<ReturnType<typeof setTimeout>[]>([]);
  const rafRef    = useRef<number>(0);
  const scenes    = useRef(buildScenes());

  const clearAll = () => {
    timers.current.forEach(clearTimeout); timers.current = [];
    cancelAnimationFrame(rafRef.current);
  };

  const applyLogo = (s: LogoStyle, H: number) => {
    const logo = logoRef.current, name = nameRef.current;
    const g1 = g1Ref.current, g2 = g2Ref.current;
    const tag = tagRef.current, icon = iconRef.current;
    if (!logo||!name||!g1||!g2||!tag||!icon) return;

    logo.style.opacity    = String(s.opacity);
    logo.style.transform  = `translate(-50%, calc(-50% + ${typeof s.y==="function"?(s as any).y(H):s.y}px)) scale(${s.scale})`;

    const iconCol = s.mode==="sweep" ? "#fbbf24" : s.mode==="glow" ? "#22c55e" : s.color;
    icon.innerHTML = LEAF(iconCol);
    icon.style.display = s.mode==="hidden" ? "none" : "block";

    name.removeAttribute("style");
    name.style.color = s.color;
    name.textContent = "AGRIHUBX";
    g1.style.display = "none"; g2.style.display = "none";
    tag.removeAttribute("style"); tag.style.opacity = "0";

    if (s.mode === "glitch") {
      g1.style.display = "block"; g1.textContent = "AGRIHUBX";
      g2.style.display = "block"; g2.textContent = "AGRIHUBX";
    }
    if (s.mode === "glow") {
      name.style.color = "#22c55e";
      name.style.animation = "ahx-glow 0.55s ease-in-out infinite";
    }
    if (s.mode === "sweep") {
      name.style.background = "linear-gradient(105deg,#92400e 25%,#fde68a 45%,#fbbf24 50%,#92400e 75%)";
      name.style.backgroundSize = "200% auto";
      (name.style as any).webkitBackgroundClip = "text";
      name.style.backgroundClip = "text";
      (name.style as any).webkitTextFillColor = "transparent";
      name.style.animation = "ahx-sweep 0.55s linear";
    }
    if (s.mode === "dark") {
      name.style.color = "#000";
      icon.innerHTML = LEAF("#000");
    }
    if (s.mode === "final") {
      name.style.animation = "ahx-settle 1s cubic-bezier(0.16,1,0.3,1) forwards";
      tag.style.display = "block";
      tag.style.animation = "ahx-tagfade 1.4s ease forwards";
    }
    if (s.tagline && s.mode !== "final") {
      tag.style.opacity = "0.55";
    }
  };

  const runScene = (idx: number) => {
    if (idx >= scenes.current.length) { onComplete?.(); return; }
    const scene = scenes.current[idx];
    const canvas = canvasRef.current;
    if (!canvas) return;
    const W = canvas.width, H = canvas.height;
    const ctx = canvas.getContext("2d")!;
    const startTime = performance.now();

    // Sound
    if (scene.sfx && audioRef.current) {
      const ac = audioRef.current;
      if (ac.state === "suspended") ac.resume();
      SFX[scene.sfx]?.(ac);
    }

    // Logo
    applyLogo(scene.logo, H);

    // Handle fade-out scene differently
    if (scene.id === "fadeout") {
      const wrap = wrapRef.current;
      if (wrap) { wrap.style.transition = "opacity 0.65s ease"; wrap.style.opacity = "0"; }
      const t2 = setTimeout(() => onComplete?.(), scene.dur);
      timers.current.push(t2);
      return;
    }

    // RAF loop for canvas
    const drawLoop = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / scene.dur, 1);
      const W2 = canvas.width, H2 = canvas.height;
      scene.draw(ctx, W2, H2, progress);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(drawLoop);
      }
    };
    rafRef.current = requestAnimationFrame(drawLoop);

    const t = setTimeout(() => {
      cancelAnimationFrame(rafRef.current);
      runScene(idx + 1);
    }, scene.dur);
    timers.current.push(t);
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width  = window.innerWidth  * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width  = window.innerWidth  + "px";
    canvas.style.height = window.innerHeight + "px";
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(dpr, dpr);
  };

  const handleStart = () => {
    try { audioRef.current = mkCtx(); } catch (_) {}
    const tap = tapRef.current;
    if (tap) {
      tap.style.transition = "opacity 0.35s";
      tap.style.opacity = "0";
      setTimeout(() => { if (tap) tap.style.display = "none"; }, 350);
    }
    resizeCanvas();
    // Small delay so font loads
    setTimeout(() => runScene(0), 80);
  };

  const handleSkip = () => {
    clearAll();
    const wrap = wrapRef.current;
    if (wrap) { wrap.style.transition = "opacity 0.4s"; wrap.style.opacity = "0"; }
    setTimeout(() => onComplete?.(), 420);
  };

  useEffect(() => {
    window.addEventListener("resize", resizeCanvas);
    return () => { clearAll(); window.removeEventListener("resize", resizeCanvas); };
  }, []);

  return (
    <>
      <style>{CSS}</style>
      <div id="ahx-wrap" ref={wrapRef}>
        <canvas id="ahx-canvas" ref={canvasRef} />

        <div id="ahx-logo" ref={logoRef} style={{ opacity: 0 }}>
          <span id="ahx-icon" ref={iconRef} dangerouslySetInnerHTML={{ __html: LEAF("#fff") }} />
          <div style={{ position: "relative" }}>
            <span id="ahx-name" ref={nameRef}>AGRIHUBX</span>
            <span id="ahx-g1" ref={g1Ref} />
            <span id="ahx-g2" ref={g2Ref} />
          </div>
          <span id="ahx-tag" ref={tagRef}>Connect · Trade · Grow · Smarter</span>
        </div>

        <div id="ahx-tap" ref={tapRef} onClick={handleStart}>
          <div id="ahx-ring">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.2">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          </div>
          <span id="ahx-tap-label">Tap to enter</span>
        </div>

        <button id="ahx-skip" onClick={handleSkip}>Skip</button>
      </div>
    </>
  );
}
