// ==========================================
// IssueDesk — Enhanced Particle Background
// Floating geometric shapes with mouse interaction
// Green theme
// ==========================================

(function() {
  'use strict';

  const canvas = document.createElement('canvas');
  canvas.id = 'particle-canvas';
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');

  const cursorGlow = document.createElement('div');
  cursorGlow.id = 'cursor-glow';
  cursorGlow.style.cssText = `
    position: fixed; width: 350px; height: 350px; border-radius: 50%;
    background: radial-gradient(circle, rgba(34, 197, 94, 0.12) 0%, rgba(74, 222, 128, 0.06) 35%, transparent 70%);
    pointer-events: none; z-index: 1; transform: translate(-50%, -50%);
    transition: opacity 0.3s ease; opacity: 0;
  `;
  document.body.prepend(cursorGlow);

  let mouse = { x: -500, y: -500, active: false };

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  document.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
    cursorGlow.style.left = e.clientX + 'px';
    cursorGlow.style.top = e.clientY + 'px';
    cursorGlow.style.opacity = '1';
  });
  document.addEventListener('mouseleave', () => {
    mouse.active = false; cursorGlow.style.opacity = '0';
  });

  const SHAPES = ['circle', 'triangle', 'hexagon', 'diamond'];

  function drawTriangle(ctx, x, y, size, rotation) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI / 3) - Math.PI / 2;
      if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
      else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.closePath(); ctx.restore();
  }

  function drawHexagon(ctx, x, y, size, rotation) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation); ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i * Math.PI / 3) - Math.PI / 6;
      if (i === 0) ctx.moveTo(Math.cos(angle) * size, Math.sin(angle) * size);
      else ctx.lineTo(Math.cos(angle) * size, Math.sin(angle) * size);
    }
    ctx.closePath(); ctx.restore();
  }

  function drawDiamond(ctx, x, y, size, rotation) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rotation + Math.PI / 4);
    ctx.beginPath(); ctx.rect(-size * 0.7, -size * 0.7, size * 1.4, size * 1.4);
    ctx.restore();
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3.5 + 1;
      this.speedX = (Math.random() - 0.5) * 0.4;
      this.speedY = (Math.random() - 0.5) * 0.4;
      this.opacity = Math.random() * 0.45 + 0.08;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.01;
      this.shape = SHAPES[Math.floor(Math.random() * SHAPES.length)];
      const colors = [
        [34, 197, 94],    // green
        [74, 222, 128],   // light green
        [22, 163, 74],    // dark green
        [16, 185, 129],   // emerald
        [52, 211, 153],   // teal-green
        [134, 239, 172],  // mint
      ];
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.baseOpacity = this.opacity;
    }
    update() {
      this.x += this.speedX; this.y += this.speedY;
      this.rotation += this.rotationSpeed;
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
      if (mouse.active) {
        const dx = this.x - mouse.x, dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          const force = (180 - dist) / 180;
          this.x -= (dx / dist) * force * 0.8;
          this.y -= (dy / dist) * force * 0.8;
          this.opacity = Math.min(this.baseOpacity + force * 0.55, 0.9);
          this.rotationSpeed += force * 0.001;
        } else {
          this.opacity += (this.baseOpacity - this.opacity) * 0.05;
          this.rotationSpeed += (((Math.random() - 0.5) * 0.01) - this.rotationSpeed) * 0.02;
        }
      }
    }
    draw() {
      const fill = `rgba(${this.color[0]}, ${this.color[1]}, ${this.color[2]}, ${this.opacity})`;
      ctx.fillStyle = fill;
      switch (this.shape) {
        case 'circle': ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); break;
        case 'triangle': drawTriangle(ctx, this.x, this.y, this.size * 1.5, this.rotation); ctx.fill(); break;
        case 'hexagon': drawHexagon(ctx, this.x, this.y, this.size * 1.3, this.rotation); ctx.fill(); break;
        case 'diamond': drawDiamond(ctx, this.x, this.y, this.size * 1.1, this.rotation); ctx.fill(); break;
      }
    }
  }

  const particleCount = Math.min(90, Math.floor((canvas.width * canvas.height) / 14000));
  const particles = [];
  for (let i = 0; i < particleCount; i++) particles.push(new Particle());

  function drawConnections() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x, dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(34, 197, 94, ${(1 - dist / 130) * 0.12})`;
          ctx.lineWidth = 0.5; ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawConnections();
    requestAnimationFrame(animate);
  }
  animate();
})();
