---
name: cinematic-scroll-engine
description: >
  Build Apple-style scroll-scrubbed hero animations from a PNG frame sequence (e.g. a 3D
  product exploding and reassembling). Use whenever a build needs a frame-by-frame scroll-
  driven canvas animation tied to scroll position, a sticky pinned hero, lazy frame
  preloading, and smooth performant playback. Pairs with UI-UX Pro Max (design system) and
  Front-End Design (taste). This skill owns the ANIMATION TECHNIQUE, not the visual styling.
---

# Cinematic Scroll Engine

Drive a hero animation by mapping **scroll progress → frame index** over a sequence of PNGs
exported from a product video (assembled → exploded). Scrolling down advances frames (explode);
scrolling up rewinds them (reassemble). This is the technique behind premium product pages.

## Hard requirements
- Frames live at `assets/frames/frame_001.png … frame_150.png` (zero-padded, 3 digits).
- Default sequence length: **150 frames** (from a 10s @ 15fps clip). Read the real count from disk; never hard-code if it differs.
- Render to a single `<canvas>`, **not** 150 `<img>` tags. Never animate via GIF or video element for the scrub — canvas only.
- The hero section is **pinned/sticky** for a scroll distance of ~`frames × 18px` so the user scrolls "through" the animation, then the page continues.

## Build pattern (vanilla, no framework — keep it a single static site)
1. **Pin the stage.** Wrap the canvas in a `position: sticky; top: 0; height: 100vh` stage inside a tall `position: relative` spacer whose height sets the scrub length.
2. **Preload smartly.** Preload frame 1 immediately and paint it. Preload the rest in the background with `img.decode()`; show a thin progress bar until ~the first 20 frames are ready so first paint is instant.
3. **Map scroll → frame.**
   ```js
   const FRAME_COUNT = 150;
   const frame = (i) => `assets/frames/frame_${String(i).padStart(3,'0')}.png`;
   const images = [];
   for (let i = 1; i <= FRAME_COUNT; i++){ const im = new Image(); im.src = frame(i); images.push(im); }
   const stage = document.querySelector('#hero-stage');     // the tall spacer
   const canvas = document.querySelector('#hero-canvas');
   const ctx = canvas.getContext('2d');
   function render(idx){ const im = images[idx]; if(!im?.complete) return;
     const s = Math.max(canvas.width/im.width, canvas.height/im.height);
     const w = im.width*s, h = im.height*s;
     ctx.clearRect(0,0,canvas.width,canvas.height);
     ctx.drawImage(im,(canvas.width-w)/2,(canvas.height-h)/2,w,h); }
   function onScroll(){
     const r = stage.getBoundingClientRect();
     const p = Math.min(1, Math.max(0, -r.top / (stage.offsetHeight - innerHeight)));
     const idx = Math.min(FRAME_COUNT-1, Math.round(p*(FRAME_COUNT-1)));
     requestAnimationFrame(()=>render(idx));
   }
   addEventListener('scroll', onScroll, {passive:true});
   addEventListener('resize', ()=>{ sizeCanvas(); onScroll(); });
   ```
4. **Size for retina.** `canvas.width = innerWidth*devicePixelRatio` etc.; scale the 2d context. Re-size on resize.
5. **Overlay text reveals.** Headline + sub fade/slide in over the canvas at chosen scroll thresholds (0%, 35%, 70%). Keep copy restrained.
6. **Mobile.** Same engine, but cap `devicePixelRatio` at 2, reduce to every-2nd-frame if the device is low-power, and shorten scrub length so the explode completes in ~1.2 screens.

## Performance guardrails
- Total frame payload should stay under ~12 MB. If frames are large, instruct the user to export at ≤1600px wide.
- Never decode all frames synchronously; use the background `decode()` queue.
- Throttle to one `render` per animation frame (already handled by `requestAnimationFrame`).
- Provide a reduced-motion fallback: if `prefers-reduced-motion`, show frame 1 and frame 150 as a simple before/after, no scrub.

## What this skill does NOT do
- Colour, type, spacing, component look → that's **UI-UX Pro Max** + **Front-End Design**.
- It only guarantees the scrubbed hero is smooth, performant, accessible, and correctly wired to `assets/frames/`.
