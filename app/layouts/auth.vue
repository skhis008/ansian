<template>
  <div class="grid min-h-dvh lg:grid-cols-2">
    <!-- Form -->
    <div class="flex flex-col px-5 py-8 sm:px-10 lg:px-16">
      <NuxtLink to="/" class="mb-10 inline-flex items-center gap-2.5 self-start">
        <UiBrandMark class="size-9" />
        <span class="text-lg font-bold tracking-tight text-ink-900">{{ $config.public.appName }}</span>
      </NuxtLink>

      <div class="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center">
        <slot />
      </div>

      <p class="mt-10 text-center text-xs text-ink-400">
        Dengan masuk kamu setuju dengan
        <NuxtLink to="/terms" class="underline hover:text-ink-600">Ketentuan</NuxtLink>
        dan
        <NuxtLink to="/kebijakan-privasi" class="underline hover:text-ink-600">Kebijakan Privasi</NuxtLink>.
      </p>
    </div>

    <!-- Branding panel -->
    <div class="relative hidden overflow-hidden bg-ink-950 lg:block">
      <div
        class="absolute inset-0 opacity-25"
        style="background:
          radial-gradient(60% 50% at 20% 15%, #2563eb 0%, transparent 60%),
          radial-gradient(50% 40% at 85% 80%, #0ea5e9 0%, transparent 60%);"
      />
      <div
        class="absolute inset-0 opacity-[0.07]"
        style="background-image:linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px);background-size:48px 48px"
      />

      <div class="relative flex h-full flex-col justify-center px-14 py-16">
        <blockquote class="max-w-md">
          <p class="text-2xl leading-relaxed font-semibold text-white">
            “Pakai AntarJemput tiap hari. Makin hemat, driver datang sesuai doorstep.”
          </p>
          <footer class="mt-6 flex items-center gap-3">
            <UiAvatar name="Rani Kusuma" :size="40" />
            <div>
              <p class="text-sm font-semibold text-white">Rani Kusuma</p>
              <p class="text-xs text-white/60">Penumpang sejak 2024</p>
            </div>
          </footer>
        </blockquote>

        <dl class="mt-14 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-8">
          <div>
            <dt class="text-xs text-white/50">Perjalanan</dt>
            <dd class="mt-1 text-2xl font-bold text-white">120k+</dd>
          </div>
          <div>
            <dt class="text-xs text-white/50">Driver</dt>
            <dd class="mt-1 text-2xl font-bold text-white">3.4k</dd>
          </div>
          <div>
            <dt class="text-xs text-white/50">Rating</dt>
            <dd class="mt-1 text-2xl font-bold text-white">4.8</dd>
          </div>
        </dl>
      </div>
    </div>
  </div>
</template>
