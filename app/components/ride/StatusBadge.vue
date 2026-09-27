<script setup lang="ts">
import type { RideStatus } from '#shared/types'
import { RIDE_STATUS_LABELS } from '#shared/types'

const props = defineProps<{ status: RideStatus; size?: 'sm' | 'md' }>()

const config: Record<RideStatus, { tone: 'brand' | 'gray' | 'success' | 'warning' | 'danger' | 'info' | 'purple'; icon: string }> = {
  searching: { tone: 'warning', icon: 'search' },
  driver_assigned: { tone: 'info', icon: 'user' },
  driver_arrived: { tone: 'purple', icon: 'map-pin' },
  in_progress: { tone: 'brand', icon: 'navigation' },
  completed: { tone: 'success', icon: 'check' },
  cancelled: { tone: 'danger', icon: 'x' },
  failed: { tone: 'danger', icon: 'alert-triangle' },
}
</script>

<template>
  <UiBadge :tone="config[props.status].tone" :size="size">
    <UiIcon :name="config[props.status].icon" class="size-3" />
    {{ RIDE_STATUS_LABELS[props.status] }}
  </UiBadge>
</template>
