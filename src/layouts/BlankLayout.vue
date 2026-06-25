<script setup lang="ts">
import ParticleBackground from '../components/ParticleBackground.vue'

const repoLink = 'https://github.com/roimdev'
const repoName = 'roim-picx'
</script>

<template>
    <div class="flex flex-col min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-sky-950 relative">
        <ParticleBackground />

        <!-- Main Content -->
        <div class="flex-1 w-full z-[2] relative">
            <router-view />
        </div>

        <!-- Footer -->
        <div
            class="w-full py-4 border-t border-gray-800/50 bg-gray-900/50 backdrop-blur-sm mt-auto z-[2] relative">
            <div
                class="max-w-7xl mx-auto flex items-center justify-center text-gray-400 text-sm px-4">
                <span class="mr-1">Powered by</span>
                <a :href="repoLink" target="_blank"
                    class="font-medium text-indigo-400 hover:text-indigo-300 transition-colors hover:underline">
                    {{ repoName }}
                </a>
            </div>
        </div>
    </div>
</template>
