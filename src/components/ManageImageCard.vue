<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
    ElDropdown, ElDropdownMenu, ElDropdownItem, ElImage, ElMessage
} from 'element-plus'
import {
    faEllipsisVertical, faPen, faTrash, faShareAlt, faLink, faFolderPlus, faEye, faTag, faEyeSlash, faCheck, faArrowRight, faCopy
} from '@fortawesome/free-solid-svg-icons'
import { computed, ref } from 'vue'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import copy from 'copy-to-clipboard'
import formatBytes from '../utils/format-bytes'
import type { ImgItem } from '../utils/types'

const props = defineProps<{
    item: ImgItem
    selected?: boolean
    isSelectMode?: boolean
}>()

const isNsfw = computed(() => props.item.nsfw)
const showNsfw = ref(false)

const toggleNsfw = (e: Event) => {
    e.stopPropagation()
    showNsfw.value = !showNsfw.value
}

const emit = defineEmits<{
    (e: 'click'): void
    (e: 'preview'): void
    (e: 'share'): void
    (e: 'rename'): void
    (e: 'delete'): void
    (e: 'detail'): void
    (e: 'addToAlbum'): void
    (e: 'editTags'): void
    (e: 'toggleSelect'): void
    (e: 'moveTo'): void
}>()

const { t } = useI18n()

const displayGetName = (key: string) => {
    const parts = key.split('/')
    return parts[parts.length - 1]
}

const handleCopyLink = (e: Event) => {
    e.stopPropagation()
    copy(props.item.url)
    ElMessage.success(t('manage.copySuccess'))
}
</script>

<template>
    <div class="group relative bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-lg transition-all cursor-pointer border aspect-[4/3] md:aspect-[3/4]"
        :class="selected ? 'border-indigo-500 ring-2 ring-indigo-500/50' : 'border-gray-200 dark:border-gray-700'"
        @click="$emit('preview')">

        <!-- Selection Checkbox -->
        <div v-if="isSelectMode" class="absolute top-3 left-3 z-30" @click.stop>
            <div @click="$emit('toggleSelect')"
                class="w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200"
                :class="selected ? 'bg-indigo-500 border-indigo-500 shadow-sm' : 'bg-black/20 backdrop-blur-sm border-white/30 hover:border-white/60'">
                <font-awesome-icon v-if="selected" :icon="faCheck" class="text-white text-xs" />
            </div>
        </div>

        <!-- Full Background Image -->
        <div class="absolute inset-0 overflow-hidden rounded-2xl">
            <el-image :src="item.thumbnailUrl || item.url" fit="cover"
                class="w-full h-full transition-transform duration-700 group-hover:scale-105"
                :class="{ 'blur-xl': isNsfw && !showNsfw }"
                loading="lazy">
                <template #placeholder>
                    <div class="w-full h-full bg-gray-200 dark:bg-gray-800 animate-pulse"></div>
                </template>
                <template #error>
                    <div class="w-full h-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400">
                        <font-awesome-icon :icon="faEye" class="text-2xl" />
                    </div>
                </template>
            </el-image>
            <!-- NSFW Overlay -->
            <div v-if="isNsfw && !showNsfw" class="absolute inset-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-sm z-10">
                <div class="p-3 rounded-full bg-red-500/80 text-white mb-2">
                    <font-awesome-icon :icon="faEyeSlash" class="text-xl" />
                </div>
                <span class="text-white font-bold text-sm tracking-wide">NSFW</span>
                <button @click="toggleNsfw" class="mt-3 px-3 py-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded-full backdrop-blur-md transition-colors border border-white/30">
                    Show Content
                </button>
            </div>
        </div>

        <!-- Overlay Gradient -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
        </div>

        <!-- Action Menu -->
        <div class="absolute top-3 right-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-20" @click.stop>
            <el-dropdown trigger="click">
                <div class="w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/60 cursor-pointer border border-white/10 transition-colors">
                    <font-awesome-icon :icon="faEllipsisVertical" />
                </div>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item @click="$emit('detail')">
                            <font-awesome-icon :icon="faLink" class="mr-2" />{{ $t('manage.details') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('share')">
                            <font-awesome-icon :icon="faShareAlt" class="mr-2" />{{ $t('share.title') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('addToAlbum')">
                            <font-awesome-icon :icon="faFolderPlus" class="mr-2" />{{ $t('album.uploadTo') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('moveTo')">
                            <font-awesome-icon :icon="faArrowRight" class="mr-2" />{{ $t('manage.moveToFolder') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('rename')">
                            <font-awesome-icon :icon="faPen" class="mr-2" />{{ $t('manage.rename') }}
                        </el-dropdown-item>
                        <el-dropdown-item @click="$emit('editTags')">
                            <font-awesome-icon :icon="faTag" class="mr-2" />{{ $t('tags.editTags') }}
                        </el-dropdown-item>
                        <el-dropdown-item class="text-red-500" @click="$emit('delete')">
                            <font-awesome-icon :icon="faTrash" class="mr-2" />{{ $t('common.delete') }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>

        <!-- Footer: file info + description + copy link -->
        <div class="absolute bottom-0 left-0 right-0 p-3 bg-white/75 dark:bg-gray-900/75 backdrop-blur-md border-t border-white/20 dark:border-white/5 transition-all">
            <!-- Row 1: Filename + copy btn -->
            <div class="flex items-center justify-between gap-1 mb-1">
                <h3 class="font-bold text-gray-900 dark:text-gray-100 truncate text-xs" :title="displayGetName(item.key)">
                    {{ displayGetName(item.key) }}
                </h3>
                <button @click="handleCopyLink" class="flex-shrink-0 w-6 h-6 rounded-full text-gray-400 dark:text-gray-500 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors flex items-center justify-center" :title="$t('manage.copyLink')">
                    <font-awesome-icon :icon="faCopy" class="text-[10px]" />
                </button>
            </div>
            <!-- Row 2: Description -->
            <div @click.stop="$emit('detail')" class="cursor-pointer group/desc">
                <p v-if="item.description" class="text-xs text-indigo-300 dark:text-indigo-200 leading-snug line-clamp-2 group-hover/desc:text-indigo-400 transition-colors">
                    💬 {{ item.description }}
                </p>
                <p v-else class="text-xs text-gray-400 dark:text-gray-500 italic leading-snug group-hover/desc:text-indigo-400 transition-colors">
                    {{ $t('manage.descEmptyHint') }}
                </p>
            </div>
            <!-- Row 3: Tags -->
            <div v-if="item.tags && item.tags.length > 0" class="flex flex-wrap gap-1 mt-1.5">
                <span v-for="tag in item.tags.slice(0, 3)" :key="tag"
                    class="inline-block px-1.5 py-0.5 text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full">
                    {{ tag }}
                </span>
                <span v-if="item.tags.length > 3" class="text-[10px] text-gray-400">+{{ item.tags.length - 3 }}</span>
            </div>
        </div>
    </div>
</template>
