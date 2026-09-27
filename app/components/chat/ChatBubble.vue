<script setup lang="ts">
import type { ChatMessage } from '#shared/types'
import { formatTime } from '#shared/utils/format'

const props = defineProps<{ message: ChatMessage; showAvatar?: boolean; avatar?: string | null; name?: string }>()

const isSystem = computed(() => props.message.type === 'system')
</script>

<template>
  <div v-if="isSystem" class="my-3 flex justify-center">
    <span class="rounded-full bg-ink-100 px-3 py-1 text-center text-[11px] font-medium text-ink-500">
      {{ message.body }}
    </span>
  </div>

  <div v-else class="group flex gap-2.5" :class="message.is_mine ? 'flex-row-reverse' : ''">
    <div class="w-8 shrink-0">
      <UiAvatar
        v-if="showAvatar"
        :name="name ?? message.sender_name"
        :src="avatar"
        :size="32"
        class="mt-auto"
      />
    </div>

    <div class="flex max-w-[min(78%,26rem)] flex-col" :class="message.is_mine ? 'items-end' : 'items-start'">
      <div
        class="px-3.5 py-2 text-sm leading-relaxed break-words whitespace-pre-wrap"
        :class="message.is_mine
          ? 'rounded-br-md rounded-2xl bg-brand-600 text-white'
          : 'rounded-bl-md rounded-2xl bg-ink-100 text-ink-800'"
      >
        {{ message.body }}
      </div>

      <span class="mt-1 flex items-center gap-1 px-1 text-[10px] text-ink-400">
        {{ formatTime(message.created_at) }}
        <UiIcon
          v-if="message.is_mine"
          :name="message.read_at ? 'check-circle' : 'check'"
          class="size-3"
          :class="message.read_at ? 'text-brand-500' : ''"
        />
      </span>
    </div>
  </div>
</template>
