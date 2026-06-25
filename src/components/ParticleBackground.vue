<template>
  <canvas ref="canvas" class="fixed inset-0 pointer-events-none z-0" />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

const canvas = ref<HTMLCanvasElement>()

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  fade: number
  type: 'heart' | 'star' | 'sparkle' | 'circle'
  color: string
  rotation: number
  rotationSpeed: number
}

let particles: Particle[] = []
let animationId = 0
const PARTICLE_COUNT = 60

const colors = [
  '#FFB7C5', // soft pink
  '#FFD1DC', // light pink
  '#FFE4E1', // misty rose
  '#FFC0CB', // pink
  '#FFF0F5', // lavender blush
  '#FFDAB9', // peach
  '#FFE5B4', // peach puff
  '#FFFACD', // lemon chiffon
  '#E8D5F5', // soft lavender
  '#FFB6C1', // light pink
]

function drawHeart(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  ctx.beginPath()
  const s = size * 0.6
  ctx.moveTo(x, y + s * 0.3)
  ctx.bezierCurveTo(x, y, x - s * 0.55, y, x - s * 0.55, y + s * 0.3)
  ctx.bezierCurveTo(x - s * 0.55, y + s * 0.7, x, y + s, x, y + s * 1.1)
  ctx.bezierCurveTo(x, y + s, x + s * 0.55, y + s * 0.7, x + s * 0.55, y + s * 0.3)
  ctx.bezierCurveTo(x + s * 0.55, y, x, y, x, y + s * 0.3)
  ctx.closePath()
  ctx.fill()
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  ctx.beginPath()
  const outer = size * 0.5
  const inner = size * 0.2
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 - Math.PI / 2
    const x1 = Math.cos(angle) * outer
    const y1 = Math.sin(angle) * outer
    const x2 = Math.cos(angle + Math.PI / 5) * inner
    const y2 = Math.sin(angle + Math.PI / 5) * inner
    if (i === 0) ctx.moveTo(x1, y1)
    else ctx.lineTo(x1, y1)
    ctx.lineTo(x2, y2)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rotation)
  const len = size * 0.5
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const angle = (i * Math.PI) / 2
    ctx.moveTo(0, 0)
    const ex = Math.cos(angle) * len
    const ey = Math.sin(angle) * len
    ctx.lineTo(ex - Math.cos(angle + 0.4) * len * 0.35, ey - Math.sin(angle + 0.4) * len * 0.35)
    ctx.lineTo(ex, ey)
    ctx.lineTo(ex + Math.cos(angle - 0.4) * len * 0.35, ey + Math.sin(angle - 0.4) * len * 0.35)
  }
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

function createParticle(canvasW: number, canvasH: number): Particle {
  const types: Particle['type'][] = ['heart', 'star', 'sparkle', 'circle']
  return {
    x: Math.random() * canvasW,
    y: Math.random() * canvasH,
    size: Math.random() * 14 + 6,
    speedX: (Math.random() - 0.5) * 0.3,
    speedY: -(Math.random() * 0.4 + 0.1),
    opacity: Math.random() * 0.6 + 0.1,
    fade: Math.random() * 0.003 + 0.002,
    type: types[Math.floor(Math.random() * types.length)],
    color: colors[Math.floor(Math.random() * colors.length)],
    rotation: Math.random() * Math.PI * 2,
    rotationSpeed: (Math.random() - 0.5) * 0.015,
  }
}

function animate() {
  const c = canvas.value
  if (!c) return
  const ctx = c.getContext('2d')
  if (!ctx) return

  ctx.clearRect(0, 0, c.width, c.height)

  for (const p of particles) {
    p.x += p.speedX
    p.y += p.speedY
    p.rotation += p.rotationSpeed
    p.opacity -= p.fade

    if (p.opacity <= 0 || p.y < -20) {
      Object.assign(p, createParticle(c.width, c.height))
      p.opacity = Math.random() * 0.6 + 0.1
    }

    ctx.globalAlpha = p.opacity
    ctx.fillStyle = p.color

    switch (p.type) {
      case 'heart':
        drawHeart(ctx, p.x, p.y, p.size)
        break
      case 'star':
        drawStar(ctx, p.x, p.y, p.size, p.rotation)
        break
      case 'sparkle':
        drawSparkle(ctx, p.x, p.y, p.size, p.rotation)
        break
      case 'circle':
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 0.35, 0, Math.PI * 2)
        ctx.fill()
        break
    }
  }

  ctx.globalAlpha = 1
  animationId = requestAnimationFrame(animate)
}

function resize() {
  const c = canvas.value
  if (!c) return
  c.width = window.innerWidth
  c.height = window.innerHeight
}

onMounted(() => {
  resize()
  particles = Array.from({ length: PARTICLE_COUNT }, () => createParticle(window.innerWidth, window.innerHeight))
  animate()
  window.addEventListener('resize', resize)
})

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  window.removeEventListener('resize', resize)
})
</script>
