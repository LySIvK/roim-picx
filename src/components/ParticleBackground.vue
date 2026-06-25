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
  type: 'star' | 'meteor'
  rotation: number; rotationSpeed: number
  life?: number; maxLife?: number; angle?: number
}

const starColors = ['#FFFFFF', '#FFFACD', '#E0E8FF', '#C8D8FF', '#FFE4B5', '#B0C4FF', '#FFF', '#F0F8FF']
let particles: Particle[] = []
let animationId = 0
let time = 0

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, s: number, rot: number) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath()
  const o = s * 0.5, i = s * 0.15
  for (let n = 0; n < 5; n++) {
    const a = (n * Math.PI * 2) / 5 - Math.PI / 2
    const x1 = Math.cos(a) * o, y1 = Math.sin(a) * o
    const x2 = Math.cos(a + Math.PI / 5) * i, y2 = Math.sin(a + Math.PI / 5) * i
    if (n === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
  }
  ctx.closePath(); ctx.fill(); ctx.restore()
}

function createStar(W: number, H: number): Particle {
  return {
    x: Math.random() * W,
    y: Math.random() * H * 0.75,
    size: Math.random() * 6 + 2,
    speedX: (Math.random() - 0.5) * 0.06,
    speedY: (Math.random() - 0.5) * 0.04,
    opacity: 0,
    baseOpacity: Math.random() * 0.5 + 0.5, // 0.5~1.0 更亮
    twinkleSpeed: Math.random() * 0.025 + 0.006,
    twinklePhase: Math.random() * Math.PI * 2,
    type: 'star',
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.005,
  }
}

function spawnMeteor(W: number, H: number): Particle {
  const startX = Math.random() * W * 0.7 + W * 0.1
  const startY = Math.random() * H * 0.12
  const angle = Math.PI / 5 + Math.random() * Math.PI / 3
  const speed = 5 + Math.random() * 8
  return {
    x: startX, y: startY,
    size: 2 + Math.random() * 3,
    speedX: Math.cos(angle) * speed,
    speedY: Math.sin(angle) * speed,
    opacity: 1, baseOpacity: 1,
    twinkleSpeed: 0, twinklePhase: 0,
    type: 'meteor', rotation: angle, rotationSpeed: 0,
    life: 0, maxLife: 35 + Math.random() * 45, angle,
  }
}

let meteorCooldown = 0

function animate() {
  const c = canvas.value; if (!c) return
  const ctx = c.getContext('2d'); if (!ctx) return
  time++; ctx.clearRect(0, 0, c.width, c.height)
  const W = c.width, H = c.height

  meteorCooldown--
  if (meteorCooldown <= 0 && Math.random() < 0.3) {
    particles.push(spawnMeteor(W, H))
    meteorCooldown = 40 + Math.floor(Math.random() * 260)
  }

  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i]
    p.x += p.speedX; p.y += p.speedY; p.rotation += p.rotationSpeed

    if (p.type === 'star') {
      p.opacity = p.baseOpacity * (0.35 + 0.65 * Math.abs(Math.sin(time * p.twinkleSpeed + p.twinklePhase)))
      if (p.x < -20) p.x = W + 20
      if (p.x > W + 20) p.x = -20
      if (p.y < -20) p.y = H * 0.75
      if (p.y > H * 0.75 + 20) p.y = -20
    } else {
      p.life = (p.life || 0) + 1
      if (p.life > (p.maxLife || 50) || p.x > W + 60 || p.y > H + 60) {
        particles.splice(i, 1); continue
      }
      p.opacity = 1 - p.life / (p.maxLife || 50)
    }

    const color = starColors[Math.floor(Math.random() * starColors.length)]
    ctx.globalAlpha = p.opacity

    if (p.type === 'star') {
      ctx.fillStyle = color
      drawStar(ctx, p.x, p.y, p.size, p.rotation)
      // Glow for medium+ stars
      if (p.size > 3.5) {
        ctx.globalAlpha = p.opacity * 0.4
        ctx.shadowColor = color; ctx.shadowBlur = p.size * 3
        drawStar(ctx, p.x, p.y, p.size * 0.8, p.rotation)
        ctx.shadowBlur = 0; ctx.globalAlpha = p.opacity
      }
    } else {
      const a = p.angle || Math.PI / 4
      const trail = 30 + p.opacity * 50
      ctx.strokeStyle = '#FFFFFF'; ctx.lineWidth = p.size * 0.6
      ctx.beginPath(); ctx.moveTo(p.x, p.y)
      ctx.lineTo(p.x - Math.cos(a) * trail, p.y - Math.sin(a) * trail); ctx.stroke()
      ctx.fillStyle = '#FFFFFF'; ctx.shadowColor = '#FFF'; ctx.shadowBlur = 8
      ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2); ctx.fill()
      ctx.shadowBlur = 0
    }
  }

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
}

function resize() {
  const c = canvas.value; if (!c) return
  c.width = window.innerWidth; c.height = window.innerHeight
}

function init() {
  particles = Array.from({ length: 130 }, () => createStar(window.innerWidth, window.innerHeight))
}

onMounted(() => {
  init(); resize(); animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>
