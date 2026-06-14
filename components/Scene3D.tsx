"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Animated wireframe wave terrain — the kind of subtle, professional
 * 3D background used by Vercel / Linear / Stripe-tier sites.
 *
 * A plane mesh tilted into perspective, its vertices displaced by layered
 * sine waves over time, rendered as a glowing gradient wireframe in the
 * Biztreck palette. Plus a thin starfield for depth.
 *
 * Skipped on mobile + prefers-reduced-motion (CSS aurora handles those).
 */
export default function Scene3D() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 640px)").matches;
    if (reduce || isMobile) return;

    const container = containerRef.current;
    if (!container) return;

    /* Renderer */
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* Scene + camera */
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x030711, 8, 28);

    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    camera.position.set(0, 3.2, 9);
    camera.lookAt(0, 0, -4);

    /* ─── Wireframe wave terrain ─── */
    const PLANE_W = 40;
    const PLANE_D = 40;
    const SEG_W = 80;
    const SEG_D = 80;
    const geometry = new THREE.PlaneGeometry(PLANE_W, PLANE_D, SEG_W, SEG_D);
    geometry.rotateX(-Math.PI / 2);

    /* Two-tone wireframe via vertex colors so the mesh fades to navy at distance */
    const colors = new Float32Array(geometry.attributes.position.count * 3);
    const colorNear = new THREE.Color(0x7fa2ff);  // accent-glow
    const colorFar = new THREE.Color(0x1a3a8c);   // navy-700
    const positions = geometry.attributes.position;
    for (let i = 0; i < positions.count; i++) {
      const z = positions.getZ(i); // since plane was rotated, z is depth
      const t = THREE.MathUtils.clamp((z + PLANE_D / 2) / PLANE_D, 0, 1);
      const c = colorFar.clone().lerp(colorNear, 1 - t);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const wireMaterial = new THREE.MeshBasicMaterial({
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: 0.55,
    });
    const terrain = new THREE.Mesh(geometry, wireMaterial);
    terrain.position.y = -2.2;
    scene.add(terrain);

    /* Cache the original positions so we can displace them each frame */
    const original = positions.array.slice() as Float32Array;

    /* ─── Subtle starfield for depth ─── */
    const STAR_COUNT = 600;
    const starPositions = new Float32Array(STAR_COUNT * 3);
    for (let i = 0; i < STAR_COUNT; i++) {
      starPositions[i * 3] = (Math.random() - 0.5) * 60;
      starPositions[i * 3 + 1] = Math.random() * 12 + 2;
      starPositions[i * 3 + 2] = -Math.random() * 30 - 4;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x7fa2ff,
      size: 0.06,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.7,
      depthWrite: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ─── Scroll + mouse parallax ─── */
    let scrollFrac = 0;
    let mouseX = 0;
    let mouseY = 0;
    let tMouseX = 0;
    let tMouseY = 0;

    const onScroll = () => {
      const max = (document.documentElement.scrollHeight - window.innerHeight) || 1;
      scrollFrac = Math.min(window.scrollY / max, 1);
    };
    const onMouse = (e: MouseEvent) => {
      tMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      tMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMouse, { passive: true });

    const onResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", onResize);

    /* ─── Animate ─── */
    const clock = new THREE.Clock();
    let frameId: number;

    const animate = () => {
      const t = clock.getElapsedTime();

      /* Displace plane vertices with layered sine waves */
      const arr = positions.array as Float32Array;
      for (let i = 0; i < positions.count; i++) {
        const x = original[i * 3];
        const z = original[i * 3 + 2];
        const wave1 = Math.sin(x * 0.35 + t * 0.6) * 0.35;
        const wave2 = Math.sin(z * 0.42 + t * 0.45) * 0.28;
        const wave3 = Math.cos((x + z) * 0.18 + t * 0.3) * 0.22;
        const ring = Math.sin(Math.sqrt(x * x + z * z) * 0.35 - t * 0.9) * 0.18;
        arr[i * 3 + 1] = wave1 + wave2 + wave3 + ring;
      }
      positions.needsUpdate = true;

      /* Slow drift of stars and overall scene rotation */
      stars.position.x = Math.sin(t * 0.08) * 0.4;

      /* Smoothly track mouse for parallax */
      mouseX += (tMouseX - mouseX) * 0.04;
      mouseY += (tMouseY - mouseY) * 0.04;

      camera.position.x = mouseX * 0.6;
      camera.position.y = 3.2 - mouseY * 0.4 - scrollFrac * 1.2;
      camera.lookAt(0, 0, -4 + scrollFrac * 2);

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    /* Cleanup */
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", onResize);
      geometry.dispose();
      wireMaterial.dispose();
      starGeo.dispose();
      starMat.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-0"
    />
  );
}
