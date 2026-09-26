<template>
  <div class="continuous-reader-root">
    <div
      ref="horizontalViewport"
      class="continuous-horizontal-viewport"
      :class="{
        'continuous-horizontal-viewport-zoomed': zoom > 100,
        'continuous-horizontal-viewport-dragging': mousePan.dragging
      }"
      @pointerdown="startMousePan"
      @pointermove="moveMousePan"
      @pointerup="stopMousePan"
      @pointercancel="stopMousePan"
      @click="zoomedClick"
    >
      <div
        class="continuous-track d-flex flex-column px-0 mx-0"
        v-scroll="onScroll"
      >
        <img
          v-for="(page, i) in pages"
          :key="`page${i}`"
          :alt="`Page ${page.number}`"
          :src="shouldLoad(i) ? page.url : undefined"
          :height="calcHeight(page)"
          :width="calcWidth(page)"
          :id="`page${page.number}`"
          :style="`margin: ${i === 0 ? 0 : pageMargin}px auto;`"
          draggable="false"
          v-intersect="onIntersect"
        />
      </div>
    </div>

    <!-- Ces zones restent actives à taille normale. En zoom, elles sont retirées
         pour ne pas bloquer le déplacement tactile / souris de la page. -->
    <div
      v-if="zoom <= 100"
      @click="prev()"
      class="top-quarter"
      style="z-index: 1;"
    />

    <div
      v-if="zoom <= 100"
      @click="next()"
      class="bottom-quarter"
      style="z-index: 1;"
    />

    <div
      v-if="zoom <= 100"
      @click="centerClick()"
      class="center-vertical"
      style="z-index: 1;"
    />
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {ContinuousScaleType} from '@/types/enum-reader'
import {PageDtoWithUrl} from '@/types/komga-books'
import {throttle} from 'lodash'

export default Vue.extend({
  name: 'ContinuousReader',
  data: () => {
    return {
      offsetTop: 0,
      totalHeight: 1000,
      currentPage: 1,
      seen: [] as boolean[],
      mousePan: {
        active: false,
        dragging: false,
        moved: false,
        pointerId: -1,
        startX: 0,
        scrollLeft: 0,
      },
    }
  },
  props: {
    pages: {
      type: Array as () => PageDtoWithUrl[],
      required: true,
    },
    animations: {
      type: Boolean,
      required: true,
    },
    page: {
      type: Number,
      required: true,
    },
    scale: {
      type: String as () => ContinuousScaleType,
      required: true,
    },
    sidePadding: {
      type: Number,
      required: true,
    },
    pageMargin: {
      type: Number,
      required: true,
    },
    zoom: {
      type: Number,
      required: true,
    },
  },
  watch: {
    pages: {
      handler(val) {
        this.seen = new Array(val.length).fill(false)
        if (this.page === 1) window.scrollTo(0, 0)
        this.centerHorizontalViewport()
      },
      immediate: true,
    },
    page: {
      handler(val) {
        if (val != this.currentPage) {
          this.$vuetify.goTo(`#page${val}`, {
            duration: 0,
          })
        }
      },
      immediate: false,
    },
    zoom() {
      this.centerHorizontalViewport()
    },
  },
  created() {
    window.addEventListener('keydown', this.keyPressed)
  },
  destroyed() {
    window.removeEventListener('keydown', this.keyPressed)
  },
  mounted() {
    if (this.page != this.currentPage) {
      this.$vuetify.goTo(`#page${this.page}`, {
        duration: 0,
      })
    }
    this.centerHorizontalViewport()
  },
  computed: {
    canPrev(): boolean {
      return this.offsetTop > 0
    },
    canNext(): boolean {
      return this.offsetTop + this.$vuetify.breakpoint.height < this.totalHeight
    },
    goToOptions(): object | undefined {
      if (this.animations) return undefined
      return {duration: 0}
    },
    totalSidePadding(): number {
      return this.sidePadding * 2
    },
  },
  methods: {
    keyPressed: throttle(function (this: any, e: KeyboardEvent) {
      switch (e.key) {
        case ' ':
        case 'PageDown':
        case 'ArrowDown':
          if (!this.canNext) this.$emit('jump-next')
          break
        case 'PageUp':
        case 'ArrowUp':
          if (!this.canPrev) this.$emit('jump-previous')
          break
      }
    }, 500),
    onScroll(e: any) {
      this.offsetTop = e.target.scrollingElement.scrollTop
      this.totalHeight = e.target.scrollingElement.scrollHeight
    },
    onIntersect(entries: any) {
      if (entries[0].isIntersecting) {
        const page = parseInt(entries[0].target.id.replace('page', ''))
        this.seen.splice(page - 1, 1, true)
        this.currentPage = page
        this.$emit('update:page', page)
      }
    },
    shouldLoad(page: number): boolean {
      return page == 0 || this.seen[page] || Math.abs((this.currentPage - 1) - page) <= 2
    },
    calcHeight(page: PageDtoWithUrl): number | undefined {
      const zoomFactor = (this.zoom || 100) / 100

      switch (this.scale) {
        case ContinuousScaleType.WIDTH:
          if (page.height && page.width) {
            const baseWidth =
              this.$vuetify.breakpoint.width -
              (
                this.$vuetify.breakpoint.width *
                this.totalSidePadding
              ) / 100

            const width = baseWidth * zoomFactor
            return page.height / (page.width / width)
          }

          return undefined

        case ContinuousScaleType.ORIGINAL:
          return page.height
            ? page.height * zoomFactor
            : undefined

        default:
          return undefined
      }
    },
    calcWidth(page: PageDtoWithUrl): number | undefined {
      const zoomFactor = (this.zoom || 100) / 100

      switch (this.scale) {
        case ContinuousScaleType.WIDTH:
          return (
            (
              this.$vuetify.breakpoint.width -
              (
                this.$vuetify.breakpoint.width *
                this.totalSidePadding
              ) / 100
            ) * zoomFactor
          )

        case ContinuousScaleType.ORIGINAL:
          return page.width
            ? page.width * zoomFactor
            : undefined

        default:
          return undefined
      }
    },
    centerHorizontalViewport() {
      this.$nextTick(() => {
        const viewport = this.$refs.horizontalViewport as HTMLElement | undefined
        if (!viewport) return

        if (this.zoom <= 100) {
          viewport.scrollLeft = 0
          return
        }

        viewport.scrollLeft = Math.max(
          0,
          (viewport.scrollWidth - viewport.clientWidth) / 2,
        )
      })
    },
    startMousePan(e: PointerEvent) {
      if (
        this.zoom <= 100 ||
        e.pointerType !== 'mouse' ||
        e.button !== 0
      ) {
        return
      }

      const viewport = e.currentTarget as HTMLElement

      this.mousePan.active = true
      this.mousePan.dragging = false
      this.mousePan.moved = false
      this.mousePan.pointerId = e.pointerId
      this.mousePan.startX = e.clientX
      this.mousePan.scrollLeft = viewport.scrollLeft

      viewport.setPointerCapture(e.pointerId)
      e.preventDefault()
    },
    moveMousePan(e: PointerEvent) {
      if (
        !this.mousePan.active ||
        e.pointerId !== this.mousePan.pointerId
      ) {
        return
      }

      const viewport = e.currentTarget as HTMLElement
      const deltaX = e.clientX - this.mousePan.startX

      if (Math.abs(deltaX) > 3) {
        this.mousePan.dragging = true
        this.mousePan.moved = true
      }

      if (!this.mousePan.dragging) return

      viewport.scrollLeft = this.mousePan.scrollLeft - deltaX
      e.preventDefault()
    },
    stopMousePan(e: PointerEvent) {
      if (
        e.pointerType !== 'mouse' ||
        !this.mousePan.active
      ) {
        return
      }

      const viewport = e.currentTarget as HTMLElement

      if (viewport.hasPointerCapture(this.mousePan.pointerId)) {
        viewport.releasePointerCapture(this.mousePan.pointerId)
      }

      this.mousePan.active = false
      this.mousePan.dragging = false
      this.mousePan.pointerId = -1
    },
    zoomedClick() {
      if (this.zoom <= 100) return

      if (this.mousePan.moved) {
        this.mousePan.moved = false
        return
      }

      this.centerClick()
    },
    centerClick() {
      this.$emit('menu')
    },
    prev() {
      if (this.canPrev) {
        const step = this.$vuetify.breakpoint.height * 0.95
        this.$vuetify.goTo(this.offsetTop - step, this.goToOptions)
      } else {
        this.$emit('jump-previous')
      }
    },
    next() {
      if (this.canNext) {
        const step = this.$vuetify.breakpoint.height * 0.95
        this.$vuetify.goTo(this.offsetTop + step, this.goToOptions)
      } else {
        this.$emit('jump-next')
      }
    },
  },
})
</script>

<style scoped>
.continuous-reader-root {
  width: 100%;
  max-width: 100vw;
  min-width: 0;
  overflow-x: hidden;
}

.continuous-horizontal-viewport {
  width: 100vw;
  max-width: 100vw;
  min-width: 0;
  overflow-x: hidden;
  overflow-y: visible;
}

.continuous-horizontal-viewport-zoomed {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  touch-action: pan-x pan-y;
  cursor: grab;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.continuous-horizontal-viewport-zoomed::-webkit-scrollbar {
  display: none;
}

.continuous-horizontal-viewport-dragging {
  cursor: grabbing;
}

.continuous-track {
  width: max-content;
  min-width: 100%;
  align-items: center;
}

.continuous-track img {
  max-width: none;
  flex: 0 0 auto;
  user-select: none;
  -webkit-user-select: none;
  -webkit-user-drag: none;
}

.top-quarter {
  top: 0;
  height: 25vh;
  width: 100%;
  position: fixed;
}

.bottom-quarter {
  top: 75vh;
  height: 25vh;
  width: 100%;
  position: fixed;
}

.center-vertical {
  top: 25vh;
  height: 50vh;
  width: 100%;
  position: fixed;
}
</style>
