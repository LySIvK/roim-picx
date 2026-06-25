<template>
  <canvas ref="canvas" class="fixed inset-0 pointer-events-none z-0" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()

interface Particle {
  x: number; y: number; size: number
  speedX: number; speedY: number
  opacity: number; baseOpacity: number
  twinkleSpeed: number; twinklePhase: number
  type: 'star' | 'sparkle' | 'sunray' | 'dust' | 'cloud' | 'meteor'
  rotation: number; rotationSpeed: number
  cloudParts?: { rx: number; ry: number }[]
  life?: number; maxLife?: number; angle?: number
}

let particles: Particle[] = []
let animationId = 0
let isDark = false
let time = 0
const CLOUD_COUNT = 5

const dayColors = ['#FFD700', '#FFC125', '#FFE4B5', '#FFF8DC', '#F0E68C', '#FFEC8B', '#FFFACD', '#EEE8AA']
const nightStarColors = ['#FFFFFF', '#FFFACD', '#E0E8FF', '#C8D8FF', '#FFE4B5', '#B0C4FF', '#FFF']

function getColors() { return isDark ? nightStarColors : dayColors }

// --- Drawing helpers ---

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number, innerR = 0.35) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath()
  const o = s * 0.5, i = s * innerR
  for (let n = 0; n < 5; n++) {
    const a = (n * Math.PI * 2) / 5 - Math.PI / 2
    const x1 = Math.cos(a) * o, y1 = Math.sin(a) * o
    const x2 = Math.cos(a + Math.PI / 5) * i, y2 = Math.sin(a + Math.PI / 5) * i
    if (n === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
  }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function drawSparkleCross(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot)
  const l = s * 0.5; ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2; ctx.moveTo(0, 0)
    const ex = Math.cos(a) * l, ey = Math.sin(a) * l
    ctx.lineTo(ex - Math.cos(a + 0.4) * l * 0.35, ey - Math.sin(a + 0.4) * l * 0.35)
    ctx.lineTo(ex, ey)
    ctx.lineTo(ex + Math.cos(a - 0.4) * l * 0.35, ey + Math.sin(a - 0.4) * l * 0.35)
  }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function drawSunRay(ctx: CanvasRenderingContext2D, x: number, y: number, s: number) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, s * 0.6)
  g.addColorStop(0, 'rgba(255,215,0,0.6)'); g.addColorStop(0.5, 'rgba(255,200,50,0.2)')
  g.addColorStop(1, 'rgba(255,180,0,0)')
  ctx.beginPath(); ctx.arc(x, y, s * 0.6, 0, Math.PI * 2); ctx.fillStyle = g; ctx.fill()
}

function drawCloud(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.fillStyle = `rgba(255,255,255,${p.opacity * 0.8})`
  for (const pt of (p.cloudParts || [])) {
    ctx.beginPath()
    ctx.ellipse(p.x + pt.rx, p.y + pt.ry, Math.abs(pt.rx * 0.6), Math.abs(pt.ry * 0.6), 0, 0, Math.PI * 2)
    ctx.fill()
  }
}

// --- Particle factories ---

function createNightParticle(cw: number, ch: number): Particle {
  return {
    x: Math.random() * cw, y: Math.random() * ch * 0.7,
    size: Math.random() * 5 + 1.5,
    speedX: (Math.random() - 0.5) * 0.08, speedY: (Math.random() - 0.5) * 0.06,
    opacity: 0, baseOpacity: Math.random() * 0.8 + 0.1,
    twinkleSpeed: Math.random() * 0.03 + 0.005, twinklePhase: Math.random() * Math.PI * 2,
    type: 'star', rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.005,
  }
}

function createDaySparkle(cw: number, ch: number): Particle {
  const types: Particle['type'][] = ['sparkle', 'sunray', 'dust', 'dust']
  return {
    x: Math.random() * cw, y: ch + Math.random() * 50,
    size: Math.random() * 8 + 3,
    speedX: (Math.random() - 0.5) * 0.4, speedY: -(Math.random() * 0.5 + 0.2),
    opacity: Math.random() * 0.5 + 0.2, baseOpacity: 0,
    twinkleSpeed: 0, twinklePhase: 0,
    type: types[Math.floor(Math.random() * types.length)],
    rotation: Math.random() * Math.PI * 2, rotationSpeed: (Math.random() - 0.5) * 0.02,
  }
}

function createCloud(cw: number, ch: number): Particle {
  const parts: { rx: number; ry: number }[] = []
  const n = 3 + Math.floor(Math.random() * 5)
  for (let i = 0; i < n; i++) {
    parts.push({ rx: 18 + Math.random() * 30, ry: 10 + Math.random() * 16 })
  }
  return {
    x: -(100 + Math.random() * 300),
    y: 20 + Math.random() * (ch * 0.45),
    size: 1, speedX: 0.2 + Math.random() * 0.4, speedY: 0,
    opacity: 0.4 + Math.random() * 0.35, baseOpacity: 0,
    twinkleSpeed: 0, twinklePhase: 0,
    type: 'cloud', rotation: 0, rotationSpeed: 0, cloudParts: parts,
  }
}

function spawnMeteor(cw: number, ch: number): Particle {
  const startX = Math.random() * cw * 0.7 + cw * 0.1
  const startY = Math.random() * ch * 0.15
  const angle = Math.PI / 5 + Math.random() * Math.PI / 3
  const speed = 5 + Math.random() * 7
  return {
    x: startX, y: startY, size: 1.5 + Math.random() * 2.5,
    speedX: Math.cos(angle) * speed, speedY: Math.sin(angle) * speed,
    opacity: 1, baseOpacity: 1, twinkleSpeed: 0, twinklePhase: 0,
    type: 'meteor', rotation: angle, rotationSpeed: 0,
    life: 0, maxLife: 35 + Math.random() * 40, angle,
  }
}

function createParticle(cw: number, ch: number): Particle {
  return isDark ? createNightParticle(cw, ch) : createDaySparkle(cw, ch)
}

let meteorCooldown = 0

// --- Main loop ---

function animate() {
  const c = canvas.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  time++; ctx.clearRect(0, 0, c.width, c.height)
  const colors = getColors()
  const W = c.width, H = c.height

  // Spawn meteors at night
  if (isDark) {
    meteorCooldown--
    if (meteorCooldown <= 0 && Math.random() < 0.25) {
      particles.push(spawnMeteor(W, H))
      meteorCooldown = 50 + Math.floor(Math.random() * 250)
    }
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed

    if (isDark) {
      if (p.type === 'star') {
        p.opacity = p.baseOpacity * (0.3 + 0.7 * Math.abs(Math.sin(time * p.twinkleSpeed + p.twinklePhase)))
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20
        if (p.y < -20) p.y = H * 0.7; if (p.y > H * 0.7 + 20) p.y = -20
      } else if (p.type === 'meteor') {
        p.life = (p.life || 0) + 1
        if (p.life > (p.maxLife || 50) || p.x > W + 50 || p.y > H + 50) {
          particles.splice(i, 1); continue
        }
        p.opacity = 1 - p.life / (p.maxLife || 50)
      }
    } else {
      if (p.type === 'cloud') {
        if (p.x > W + 300) {
          p.x = -(100 + Math.random() * 300)
          p.y = 20 + Math.random() * (H * 0.45)
        }
      } else {
        p.opacity -= 0.0012
        if (p.opacity <= 0 || p.y < -20) {
          Object.assign(p, createDaySparkle(W, H))
        }
      }
    }

    const color = colors[Math.floor(Math.random() * colors.length)]
    ctx.globalAlpha = p.opacity

    switch (p.type) {
      case 'star':
        ctx.fillStyle = color
        drawStar(ctx, p.x, p.y, p.size, p.rotation, 0.15)
        if (p.size > 3) {
          ctx.globalAlpha = p.opacity * 0.3; ctx.shadowColor = color; ctx.shadowBlur = p.size * 2.5
          drawStar(ctx, p.x, p.y, p.size * 0.8, p.rotation, 0.15)
          ctx.shadowBlur = 0; ctx.globalAlpha = p.opacity
        }
        break
      case 'sparkle':
        ctx.fillStyle = '#FFD700'; drawSparkleCross(ctx, p.x, p.y, p.size, p.rotation)
        break
      case 'sunray':
        drawSunRay(ctx, p.x, p.y, p.size); break
      case 'cloud':
        drawCloud(ctx, p); break
      case 'meteor': {
        const a = p.angle || Math.PI / 4
        const trail = 25 + p.opacity * 45
        ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = p.size * 0.7
        ctx.beginPath(); ctx.moveTo(p.x, p.y)
        ctx.lineTo(p.x - Math.cos(a) * trail, p.y - Math.sin(a) * trail); ctx.stroke()
        ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = '#FFF'; ctx.shadowBlur = 6
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
        ctx.shadowBlur = 0; break
      }
      case 'dust':
        ctx.fillStyle = color; ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.3, 0, Math.PI * 2); ctx.fill(); break
    }
  }

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
}

function resize() {
  const c = canvas.value; if (!c) return
  c.width = window.innerWidth; c.height = window.innerHeight
}

function checkTheme() {
  isDark = document.documentElement.classList.contains('dark')
  particles = []
  const W = window.innerWidth, H = window.innerHeight
  if (isDark) {
    particles = Array.from({ length: 100 }, () => createNightParticle(W, H))
  } else {
    particles = Array.from({ length: 50 }, () => createDaySparkle(W, H))
    // Add clouds
    for (let i = 0; i < CLOUD_COUNT; i++) particles.push(createCloud(W, H))
  }
}

let observer: MutationObserver | null = null

onMounted(() => {
  checkTheme(); resize(); animate()
  window.addEventListener('resize', resize)
  observer = new MutationObserver(checkTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
  observer?.disconnect()
})
</script>
