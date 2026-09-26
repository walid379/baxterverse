<template>

  <div
    class="paged-reader-root"

    v-touch="{

      left: () => {if(swipe && zoom <= 100) {turnRight()}},

      right: () => {if(swipe && zoom <= 100) {turnLeft()}},

      up: () => {if(swipe && zoom <= 100) {verticalNext()}},

      down: () => {if(swipe && zoom <= 100) {verticalPrev()}}

    }"

  >

    <v-carousel v-model="carouselPage"

                :show-arrows="false"

                :continuous="false"

                :reverse="flipDirection"

                :vertical="vertical"

                hide-delimiters

                touchless

                height="100%"

    >

      <!--  Carousel: pages  -->

      <v-carousel-item v-for="(spread, i) in spreads"

                       :key="`spread${i}`"

                       :eager="eagerLoad(i)"

                       class="full-height"

                       :class="preRender(i) ? 'pre-render' : ''"

                       :transition="animations ? undefined : false"

                       :reverse-transition="animations ? undefined : false"

      >

        <div

          ref="panViewports"

          class="page-viewport"

          :class="{

            'page-viewport-zoomed': zoom > 100,

            'page-viewport-dragging': mousePan.dragging

          }"

          @pointerdown="startMousePan"

          @pointermove="moveMousePan"

          @pointerup="stopMousePan"

          @pointercancel="stopMousePan"

          @click="zoomedClick"

        >

          <div class="page-content">

            <div

              :class="`d-flex flex-row${flipDirection ? '-reverse' : ''} justify-center px-0 mx-0`"

              class="page-spread"

            >

              <img

                v-for="(page, j) in spread"

                :alt="`Page ${page.number}`"

                :key="`spread${i}-${j}`"

                :src="page.url"

                :class="imgClass(spread)"

                :style="imageZoomStyle(spread, page)"

                class="img-fit-all"

                draggable="false"

              />

            </div>

          </div>

        </div>

      </v-carousel-item>

    </v-carousel>

    <!--  clickable zone: left  -->

    <div v-if="zoom <= 100 && !vertical"

         @click="turnLeft()"

         class="left-quarter"

         style="z-index: 1;"

    />

    <!--  clickable zone: right  -->

    <div v-if="zoom <= 100 && !vertical"

         @click="turnRight()"

         class="right-quarter"

         style="z-index: 1;"

    />

    <!--  clickable zone: top  -->

    <div v-if="zoom <= 100 && vertical"

         @click="verticalPrev()"

         class="top-quarter"

         style="z-index: 1;"

    />

    <!--  clickable zone: bottom  -->

    <div v-if="zoom <= 100 && vertical"

         @click="verticalNext()"

         class="bottom-quarter"

         style="z-index: 1;"

    />

    <!--  clickable zone: menu  -->

    <div v-if="zoom <= 100"

         @click="centerClick()"

         :class="`${vertical ? 'center-vertical' : 'center-horizontal'}`"

         style="z-index: 1;"

    />

  </div>

</template>

<script lang="ts">

import Vue from 'vue'

import {ReadingDirection} from '@/types/enum-books'

import {PagedReaderLayout, ScaleType} from '@/types/enum-reader'

import {shortcutsLTR, shortcutsRTL, shortcutsVertical} from '@/functions/shortcuts/paged-reader'

import {PageDtoWithUrl} from '@/types/komga-books'

import {buildSpreads} from '@/functions/book-spreads'

export default Vue.extend({

  name: 'PagedReader',

  data: function () {

    return {

      logger: 'PagedReader',

      carouselPage: 0,

      spreads: [] as PageDtoWithUrl[][],

      mousePan: {
        active: false,
        dragging: false,
        moved: false,
        pointerId: -1,
        startX: 0,
        startY: 0,
        scrollLeft: 0,
        scrollTop: 0,
      },

    }

  },

  props: {

    pages: {

      type: Array as () => PageDtoWithUrl[],

      required: true,

    },

    page: {

      type: Number,

      required: true,

    },

    pageLayout: {

      type: String as () => PagedReaderLayout,

      required: true,

    },

    animations: {

      type: Boolean,

      required: true,

    },

    swipe: {

      type: Boolean,

      required: true,

    },

    readingDirection: {

      type: String as () => ReadingDirection,

      required: true,

    },

    scale: {

      type: String as () => ScaleType,

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

        this.spreads = buildSpreads(val, this.pageLayout)

      },

      immediate: true,

    },

    carouselPage(val, old) {

      this.$debug('[watch:carouselPage', `old:${old}`, `new:${val}`)

      if (this.carouselPage >= 0 && this.carouselPage < this.spreads.length && this.spreads.length > 0) {

        const currentSpread = this.spreads[this.carouselPage]

        const currentPage = currentSpread.length == 2 && currentSpread[1].mediaType ? currentSpread[1] : currentSpread[0]

        this.$emit('update:page', currentPage.number)

      } else {

        this.$emit('update:page', 1)

      }

      this.centerViewport()

    },

    page(val, old) {

      this.$debug('[watch:page]', `old:${old}`, `new:${val}`)

      const spreadIndex = this.toSpreadIndex(val)

      this.$debug('[watch:page]', `toSpreadIndex:${spreadIndex}`)

      this.carouselPage = spreadIndex

    },

    pageLayout: {

      handler(val) {

        const current = this.page

        this.spreads = buildSpreads(this.pages, val)

        this.carouselPage = this.toSpreadIndex(current)

        this.centerViewport()

      },

      immediate: true,

    },

    zoom() {

      this.centerViewport()

    },

  },

  created() {

    window.addEventListener('keydown', this.keyPressed)

  },

  destroyed() {

    window.removeEventListener('keydown', this.keyPressed)

  },

  computed: {

    shortcuts(): any {

      const shortcuts = []

      switch (this.readingDirection) {

        case ReadingDirection.LEFT_TO_RIGHT:

          shortcuts.push(...shortcutsLTR)

          break

        case ReadingDirection.RIGHT_TO_LEFT:

          shortcuts.push(...shortcutsRTL)

          break

        case ReadingDirection.VERTICAL:

          shortcuts.push(...shortcutsVertical)

          break

      }

      return this.$_.keyBy(shortcuts, x => x.key)

    },

    flipDirection(): boolean {

      return this.readingDirection === ReadingDirection.RIGHT_TO_LEFT

    },

    vertical(): boolean {

      return this.readingDirection === ReadingDirection.VERTICAL

    },

    currentSlide(): number {

      return this.carouselPage + 1

    },

    slidesCount(): number {

      return this.spreads.length

    },

    canPrev(): boolean {

      return this.currentSlide > 1

    },

    canNext(): boolean {

      return this.currentSlide < this.slidesCount

    },

    isDoublePages(): boolean {

      return this.pageLayout === PagedReaderLayout.DOUBLE_PAGES || this.pageLayout === PagedReaderLayout.DOUBLE_NO_COVER

    },

  },

  methods: {

    startMousePan(e: PointerEvent) {
      if (this.zoom <= 100 || e.pointerType !== 'mouse' || e.button !== 0) return

      const element = e.currentTarget as HTMLElement

      this.mousePan.active = true
      this.mousePan.dragging = false
      this.mousePan.moved = false
      this.mousePan.pointerId = e.pointerId
      this.mousePan.startX = e.clientX
      this.mousePan.startY = e.clientY
      this.mousePan.scrollLeft = element.scrollLeft
      this.mousePan.scrollTop = element.scrollTop

      element.setPointerCapture(e.pointerId)
      e.preventDefault()
    },

    moveMousePan(e: PointerEvent) {
      if (!this.mousePan.active || e.pointerId !== this.mousePan.pointerId) return

      const element = e.currentTarget as HTMLElement
      const deltaX = e.clientX - this.mousePan.startX
      const deltaY = e.clientY - this.mousePan.startY

      if (Math.abs(deltaX) > 3 || Math.abs(deltaY) > 3) {
        this.mousePan.dragging = true
        this.mousePan.moved = true
      }

      if (!this.mousePan.dragging) return

      element.scrollLeft = this.mousePan.scrollLeft - deltaX
      element.scrollTop = this.mousePan.scrollTop - deltaY
      e.preventDefault()
    },

    stopMousePan(e: PointerEvent) {
      if (e.pointerType !== 'mouse' || !this.mousePan.active) return

      const element = e.currentTarget as HTMLElement

      if (element.hasPointerCapture(this.mousePan.pointerId)) {
        element.releasePointerCapture(this.mousePan.pointerId)
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

    centerViewport() {
      this.$nextTick(() => {
        const refs = this.$refs.panViewports as HTMLElement[] | HTMLElement | undefined
        if (!refs) return

        const viewports = Array.isArray(refs) ? refs : [refs]
        const viewport = viewports[this.carouselPage]
        if (!viewport) return

        if (this.zoom <= 100) {
          viewport.scrollLeft = 0
          viewport.scrollTop = 0
          return
        }

        viewport.scrollLeft = Math.max(
          0,
          (viewport.scrollWidth - viewport.clientWidth) / 2,
        )

        viewport.scrollTop = Math.max(
          0,
          (viewport.scrollHeight - viewport.clientHeight) / 2,
        )
      })
    },

    keyPressed(e: KeyboardEvent) {

      this.shortcuts[e.key]?.execute(this)

    },

    imgClass(spread: PageDtoWithUrl[]): string {

      const double = spread.length > 1

      switch (this.scale) {

        case ScaleType.WIDTH:

          return double ? 'img-double-fit-width' : 'img-fit-width'

        case ScaleType.WIDTH_SHRINK_ONLY:

          return double ? 'img-double-fit-width-shrink-only' : 'img-fit-width-shrink-only'

        case ScaleType.HEIGHT:

          return 'img-fit-height'

        case ScaleType.SCREEN:

          return double ? 'img-double-fit-screen' : 'img-fit-screen'

        default:

          return 'img-fit-original'

      }

    },

    eagerLoad(spreadIndex: number): boolean {

      return Math.abs(this.carouselPage - spreadIndex) <= 2

    },

    preRender(spreadIndex: number): boolean {

      return Math.abs(this.carouselPage - spreadIndex) > (this.animations ? 1 : 0)

    },

    centerClick() {

      this.$emit('menu')

    },

    turnRight() {

      if (!this.vertical)

        this.flipDirection ? this.prev() : this.next()

    },

    turnLeft() {

      if (!this.vertical)

        this.flipDirection ? this.next() : this.prev()

    },

    verticalPrev() {

      if (this.vertical) this.prev()

    },

    verticalNext() {

      if (this.vertical) this.next()

    },

    prev() {

      if (this.canPrev) {

        this.carouselPage--

        window.scrollTo(0, 0)

      } else {

        this.$emit('jump-previous')

      }

    },

    next() {

      if (this.canNext) {

        this.carouselPage++

        window.scrollTo(0, 0)

      } else {

        this.$emit('jump-next')

      }

    },

    toSpreadIndex(i: number): number {

      this.$debug('[toSpreadIndex]', `i:${i}`, `isDoublePages:${this.isDoublePages}`)

      if (this.spreads.length > 0) {

        if (this.isDoublePages) {

          for (let j = 0; j < this.spreads.length; j++) {

            for (let k = 0; k < this.spreads[j].length; k++) {

              if (this.spreads[j][k].number === i) {

                return j

              }

            }

          }

        } else {

          return i - 1

        }

      }

      return i - 1

    },

    imageZoomStyle(spread: PageDtoWithUrl[], page: PageDtoWithUrl): object {

      const factor = this.zoom / 100

      const double = spread.length > 1

      switch (this.scale) {

        case ScaleType.WIDTH:

        case ScaleType.WIDTH_SHRINK_ONLY:

          return {

            width: `${(double ? 50 : 100) * factor}vw`,

            maxWidth: 'none',

          }

        case ScaleType.HEIGHT:

          return {

            height: `${100 * factor}vh`,

            maxHeight: 'none',

          }

        case ScaleType.SCREEN:

          return {

            width: `${(double ? 50 : 100) * factor}vw`,

            height: `${100 * factor}vh`,

            maxWidth: 'none',

            maxHeight: 'none',

          }

        default:

          return {
            width: page.width ? `${page.width * factor}px` : undefined,
            height: page.height ? `${page.height * factor}px` : undefined,
            maxWidth: 'none',
            maxHeight: 'none',
          }

      }

    },

  },

})

</script>

<style scoped>

.paged-reader-root {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
}

.page-viewport {
  width: 100vw;
  max-width: 100vw;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  position: relative;
}

.page-viewport-zoomed {
  overflow: auto;
  cursor: grab;
  touch-action: pan-x pan-y;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}

.page-viewport-zoomed::-webkit-scrollbar {
  display: none;
}

.page-viewport-dragging {
  cursor: grabbing;
}

.page-content {
  width: max-content;
  min-width: 100%;
  height: max-content;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-spread {
  width: max-content;
  min-width: 100%;
  min-height: 100vh;
  align-items: center;
}

.full-height {

  height: 100%;

}

.left-quarter {

  top: 0;

  left: 0;

  width: 25%;

  height: 100%;

  position: absolute;

}

.right-quarter {

  top: 0;

  right: 0;

  width: 25%;

  height: 100%;

  position: absolute;

}

.top-quarter {

  top: 0;

  height: 25%;

  width: 100%;

  position: absolute;

}

.bottom-quarter {

  bottom: 0;

  height: 25%;

  width: 100%;

  position: absolute;

}

.center-horizontal {

  top: 0;

  left: 25%;

  width: 50%;

  height: 100%;

  position: absolute;

}

.center-vertical {

  top: 25%;

  height: 50%;

  width: 100%;

  position: absolute;

}

.img-fit-all {

  object-fit: contain;

  object-position: center;

  flex: 0 0 auto;

  user-select: none;

  -webkit-user-select: none;

  -webkit-user-drag: none;

}

.img-fit-width {

  width: 100vw;

  min-height: 100vh;

  align-self: flex-start;

}

.img-double-fit-width {

  width: 50vw;

  min-height: 100vh;

  align-self: flex-start;

}

.img-fit-width-shrink-only {

  max-width: 100vw;

  align-self: flex-start;

}

.img-double-fit-width-shrink-only {

  max-width: 50vw;

  align-self: flex-start;

}

.img-fit-original {

  width: auto;

  height: auto;

}

.img-fit-height {

  min-height: 100vh;

  height: 100vh;

}

.img-fit-screen {

  width: 100vw;

  height: 100vh;

}

.img-double-fit-screen {

  max-width: 50vw;

  height: 100vh;

}

.pre-render {

  display: block !important;

  position: fixed;

  right: -1000vw;

  top: -1000vh;

}

</style>
