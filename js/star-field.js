(() => {
    const canvas = document.getElementById('cosmos');
    const ctx = canvas.getContext('2d', { alpha: true });

    const DPR = Math.max(1, window.devicePixelRatio || 1);
    let W = 0, H = 0, RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function resize() {
        const w = window.innerWidth, h = window.innerHeight;
        W = w; H = h;
        canvas.style.width = w + 'px';
        canvas.style.height = h + 'px';
        canvas.width = Math.floor(w * DPR);
        canvas.height = Math.floor(h * DPR);
        ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // THEME
    const PURPLE = 'rgba(179,117,241,1)';
    const CYAN = 'rgba(0,191,255,1)';
    const GOLD = 'rgba(255,215,0,1)';

    // -------- Nebula (soft, slowly morphing blobs) --------
    class Blob {
        constructor({ x, y, r, hue, speed = 0.15 }) {
            this.x = x; this.y = y; this.r = r;
            this.hue = hue;                    // color string
            this.t = Math.random() * 1000;     // time offset
            this.speed = speed * (0.7 + Math.random() * 0.6);
            this.opacity = 0.12;               // subtle
        }
        update(dt) {
            this.t += dt * this.speed;
            // slow drifting around origin
            this.x += Math.sin(this.t * 0.0004) * 0.15;
            this.y += Math.cos(this.t * 0.00035) * 0.15;
        }
        draw() {
            const grd = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.r);
            grd.addColorStop(0, this.hue.replace(',1)', `,${this.opacity})`));
            grd.addColorStop(1, 'rgba(0,0,0,0)');
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = grd;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        }
    }

    // -------- Orbs (slow-floating glints) --------
    class Orb {
        constructor() {
            this.x = Math.random() * W;
            this.y = Math.random() * H;
            this.r = 1.2 + Math.random() * 2.2;
            this.speed = 0.08 + Math.random() * 0.18;
            this.angle = Math.random() * Math.PI * 2;
            this.color = Math.random() < 0.6 ? PURPLE : CYAN;
            this.alpha = 0.65 + Math.random() * 0.25;
            this.twinkleT = Math.random() * 1000;
        }
        update(dt) {
            this.twinkleT += dt * 0.002;
            const tw = 0.85 + Math.sin(this.twinkleT) * 0.15;
            this.a = this.alpha * tw;

            this.x += Math.cos(this.angle) * this.speed;
            this.y += Math.sin(this.angle) * this.speed;

            // wrap edges
            if (this.x < -5) this.x = W + 5;
            if (this.x > W + 5) this.x = -5;
            if (this.y < -5) this.y = H + 5;
            if (this.y > H + 5) this.y = -5;
        }
        draw() {
            ctx.save();
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color.replace(',1)', `,${this.a})`);
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // -------- Comet (rare smooth streak) --------
    class Comet {
        constructor() {
            // randomized entry near left/top, exit near right/bottom
            this.sx = -40 + Math.random() * 80;
            this.sy = -40 + Math.random() * (H * 0.25);
            this.ex = W - 60 + Math.random() * 120;
            this.ey = H - 60 + Math.random() * 120;

            // cubic bezier control points for a subtle arc
            const mx = W * (0.25 + Math.random() * 0.25);
            const my = H * (0.25 + Math.random() * 0.25);
            this.cx1 = (this.sx + mx) / 2;
            this.cy1 = (this.sy + my) / 2 - 60 * Math.random();
            this.cx2 = (this.ex + mx) / 2;
            this.cy2 = (this.ey + my) / 2 + 60 * Math.random();

            this.t = 0;
            this.duration = 2200 + Math.random() * 1400; // 2.2–3.6s
            this.size = 1.5 + Math.random() * 1.5;
            this.color = Math.random() < 0.5 ? PURPLE : CYAN;
        }
        bezier(t) {
            const u = 1 - t;
            const x = u * u * u * this.sx + 3 * u * u * t * this.cx1 + 3 * u * t * t * this.cx2 + t * t * t * this.ex;
            const y = u * u * u * this.sy + 3 * u * u * t * this.cy1 + 3 * u * t * t * this.cy2 + t * t * t * this.ey;
            return { x, y };
        }
        update(dt) {
            this.t += dt / this.duration;           // linear time
            // ease-in then slight ease-out
            const k = this.t < 0.7
                ? Math.pow(this.t / 0.7, 3) * 0.7       // accelerate
                : 0.7 + (1 - Math.pow(1 - (this.t - 0.7) / 0.3, 2)) * 0.3; // gentle finish
            this.k = Math.min(1, k);
            if (this.k >= 1) this.done = true;
        }
        draw() {
            const { x, y } = this.bezier(this.k);

            // trail using a simple history
            this._trail = this._trail || [];
            this._trail.push({ x, y, t: performance.now() });
            // keep last ~10 points
            if (this._trail.length > 10) this._trail.shift();

            ctx.lineWidth = 2;
            for (let i = this._trail.length - 1; i > 0; i--) {
                const p1 = this._trail[i];
                const p0 = this._trail[i - 1];
                const alpha = i / this._trail.length * 0.9;
                ctx.strokeStyle = this.color.replace(',1)', `,${alpha})`);
                ctx.beginPath();
                ctx.moveTo(p0.x, p0.y);
                ctx.lineTo(p1.x, p1.y);
                ctx.stroke();
            }

            // comet head (glow)
            ctx.save();
            ctx.shadowBlur = 18;
            ctx.shadowColor = this.color;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(x, y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    // Create scene
    const blobs = RM ? [] : [
        new Blob({ x: W * 0.18, y: H * 0.25, r: Math.max(W, H) * 0.35, hue: PURPLE }),
        new Blob({ x: W * 0.82, y: H * 0.35, r: Math.max(W, H) * 0.30, hue: CYAN }),
        new Blob({ x: W * 0.50, y: H * 0.85, r: Math.max(W, H) * 0.40, hue: GOLD })
    ];

    const orbs = Array.from({ length: RM ? 20 : 50 }, () => new Orb());
    let comets = [];
    let last = performance.now();

    function loop(now) {
        const dt = now - last; last = now;
        ctx.clearRect(0, 0, W, H);

        // Nebula
        blobs.forEach(b => { b.update(dt); b.draw(); });

        // Orbs
        orbs.forEach(o => { o.update(dt); o.draw(); });

        // Comets
        comets = comets.filter(c => !c.done);
        comets.forEach(c => { c.update(dt); c.draw(); });

        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    // Spawn rare comets: every 4–10s, 1 comet; 20% chance of double
    function scheduleComet() {
        if (!RM) {
            comets.push(new Comet());
            if (Math.random() < 0.2) comets.push(new Comet());
        }
        setTimeout(scheduleComet, 4000 + Math.random() * 6000);
    }
    scheduleComet();

})();