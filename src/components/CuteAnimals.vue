<template>
  <div class="fixed inset-0 pointer-events-none z-[1] overflow-hidden">
    <!-- Rabbit - Left side -->
    <div class="absolute bottom-8 left-8 md:left-16 lg:left-24 animate-float-bunny">
      <svg viewBox="0 0 200 240" width="140" height="168" class="drop-shadow-lg">
        <!-- Left ear -->
        <ellipse cx="75" cy="55" rx="22" ry="55" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <ellipse cx="75" cy="55" rx="12" ry="40" fill="#FFB7C5"/>
        <!-- Right ear -->
        <ellipse cx="125" cy="55" rx="22" ry="55" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <ellipse cx="125" cy="55" rx="12" ry="40" fill="#FFB7C5"/>
        <!-- Head -->
        <ellipse cx="100" cy="130" rx="55" ry="48" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <!-- Eyes -->
        <ellipse cx="82" cy="125" rx="10" ry="11" fill="#2D2D2D"/>
        <ellipse cx="118" cy="125" rx="10" ry="11" fill="#2D2D2D"/>
        <!-- Eye shine -->
        <circle cx="86" cy="121" r="4" fill="white"/>
        <circle cx="122" cy="121" r="4" fill="white"/>
        <circle cx="80" cy="128" r="2" fill="white"/>
        <circle cx="116" cy="128" r="2" fill="white"/>
        <!-- Nose -->
        <ellipse cx="100" cy="138" rx="6" ry="5" fill="#FFB7C5"/>
        <!-- Mouth -->
        <path d="M94 144 Q100 152 106 144" fill="none" stroke="#FFB7C5" stroke-width="2" stroke-linecap="round"/>
        <!-- Whiskers -->
        <line x1="55" y1="134" x2="78" y2="138" stroke="#FFD1DC" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="55" y1="140" x2="78" y2="140" stroke="#FFD1DC" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="122" y1="138" x2="145" y2="134" stroke="#FFD1DC" stroke-width="1.5" stroke-linecap="round"/>
        <line x1="122" y1="140" x2="145" y2="140" stroke="#FFD1DC" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Blush -->
        <ellipse cx="72" cy="138" rx="8" ry="5" fill="#FFD1DC" opacity="0.6"/>
        <ellipse cx="128" cy="138" rx="8" ry="5" fill="#FFD1DC" opacity="0.6"/>
        <!-- Body -->
        <ellipse cx="100" cy="200" rx="45" ry="35" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <!-- Paws -->
        <ellipse cx="75" cy="225" rx="18" ry="12" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <ellipse cx="125" cy="225" rx="18" ry="12" fill="#FFF5F5" stroke="#FFD1DC" stroke-width="2"/>
        <!-- Paw pads -->
        <circle cx="75" cy="227" r="4" fill="#FFB7C5" opacity="0.5"/>
        <circle cx="125" cy="227" r="4" fill="#FFB7C5" opacity="0.5"/>
      </svg>
    </div>

    <!-- Snake - Right side -->
    <div class="absolute bottom-8 right-8 md:right-16 lg:right-24 animate-float-snake">
      <svg viewBox="0 0 200 220" width="140" height="154" class="drop-shadow-lg">
        <!-- Body (curvy) -->
        <path d="M100 210 Q140 180 155 140 Q170 100 140 70 Q110 40 80 65 Q50 90 70 120 Q90 150 120 135 Q145 122 135 95"
          fill="none" stroke="#A8E6CF" stroke-width="28" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Body lighter inner -->
        <path d="M100 210 Q140 180 155 140 Q170 100 140 70 Q110 40 80 65 Q50 90 70 120 Q90 150 120 135 Q145 122 135 95"
          fill="none" stroke="#D4F4E8" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Head -->
        <ellipse cx="132" cy="88" rx="24" ry="20" fill="#A8E6CF" stroke="#7BC8A4" stroke-width="2"/>
        <!-- Eyes -->
        <ellipse cx="125" cy="84" rx="6" ry="7" fill="#2D2D2D"/>
        <ellipse cx="141" cy="84" rx="6" ry="7" fill="#2D2D2D"/>
        <!-- Eye shine -->
        <circle cx="127" cy="81" r="3" fill="white"/>
        <circle cx="143" cy="81" r="3" fill="white"/>
        <!-- Blush -->
        <ellipse cx="120" cy="92" rx="6" ry="4" fill="#FFB7C5" opacity="0.5"/>
        <ellipse cx="146" cy="92" rx="6" ry="4" fill="#FFB7C5" opacity="0.5"/>
        <!-- Mouth -->
        <path d="M128 94 Q133 100 138 94" fill="none" stroke="#7BC8A4" stroke-width="1.5" stroke-linecap="round"/>
        <!-- Tongue -->
        <path d="M133 97 L133 106 L138 110" fill="none" stroke="#FF8A8A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- Tail -->
        <circle cx="100" cy="214" r="8" fill="#A8E6CF" stroke="#7BC8A4" stroke-width="2"/>
        <!-- Belly spots -->
        <circle cx="130" cy="130" r="4" fill="#7BC8A4" opacity="0.4"/>
        <circle cx="90" cy="118" r="5" fill="#7BC8A4" opacity="0.4"/>
        <circle cx="75" cy="78" r="3.5" fill="#7BC8A4" opacity="0.4"/>
      </svg>
    </div>
  </div>
</template>

<style scoped>
@keyframes floatBunny {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(-2deg); }
  75% { transform: translateY(-6px) rotate(2deg); }
}

@keyframes floatSnake {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  30% { transform: translateY(-8px) rotate(1deg); }
  60% { transform: translateY(-4px) rotate(-1deg); }
}

.animate-float-bunny {
  animation: floatBunny 4s ease-in-out infinite;
}

.animate-float-snake {
  animation: floatSnake 5s ease-in-out infinite;
}

.drop-shadow-lg {
  filter: drop-shadow(0 4px 12px rgba(255, 183, 197, 0.3));
}
</style>
