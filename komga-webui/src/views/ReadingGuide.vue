<template>
  <v-container fluid class="pa-6">

    <!-- LISTE DES GUIDES -->
    <template v-if="!selectedTimeline">
      <div class="d-flex align-center mb-6">
        <v-icon large class="mr-3">
          mdi-timeline-text-outline
        </v-icon>

        <div>
          <h1 class="text-h4 font-weight-bold">
            {{ $t('readinguide.title') }}
          </h1>

          <div class="text-subtitle-1 text--secondary">
            {{ $t('readinguide.subtitle') }}
          </div>
        </div>
      </div>

      <v-divider class="mb-6"/>

      <v-row>
        <v-col
          v-for="timeline in timelines"
          :key="timeline.id"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="timeline-card"
            outlined
            @click="openTimeline(timeline)"
          >
            <v-img
              :src="timeline.image"
              height="200"
              cover
              class="timeline-image"
            />

            <v-card-title>
              {{ timeline.name }}
            </v-card-title>

            <v-card-subtitle>
              {{ timeline.description }}
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- CONTENU DU GUIDE -->
    <template v-else>
      <div class="d-flex align-center mb-6">
        <v-btn
          icon
          class="mr-3"
          @click="closeTimeline"
        >
          <v-icon>
            mdi-arrow-left
          </v-icon>
        </v-btn>

        <div>
          <h1 class="text-h4 font-weight-bold">
            {{ selectedTimeline.name }}
          </h1>

          <div class="text-subtitle-1 text--secondary">
            {{ selectedTimeline.description }}
          </div>
        </div>
      </div>

      <v-divider class="mb-6"/>

      <div
        v-if="loadingEntries"
        class="d-flex justify-center align-center py-12"
      >
        <v-progress-circular
          indeterminate
          size="64"
          color="primary"
        />
      </div>

      <v-row v-else>
        <v-col
          v-for="(entry, index) in resolvedEntries"
          :key="`${entry.series}-${entry.number}-${index}`"
          cols="6"
          sm="4"
          md="3"
          lg="2"
        >
          <v-card
            class="issue-card"
            outlined
            :class="{ 'issue-missing': !entry.book }"
            @click="entry.book && openBook(entry.book)"
          >
            <v-img
              v-if="entry.book"
              :src="getBookThumbnail(entry.book.id)"
              aspect-ratio="0.6667"
              cover
              class="issue-cover"
            >
              <div class="issue-number-overlay">
                #{{ entry.number }}
              </div>
            </v-img>

            <div
              v-else
              class="issue-cover issue-cover-missing"
            >
              <v-icon size="56" color="grey">
                mdi-book-alert-outline
              </v-icon>

              <div class="issue-number-overlay">
                #{{ entry.number }}
              </div>
            </div>

            <v-card-title class="issue-title">
              {{ entry.series }}
            </v-card-title>

            <v-card-subtitle>
              <template v-if="entry.book">
                #{{ entry.number }}
              </template>

              <template v-else>
                <span class="error--text">
                  Introuvable dans Komga
                </span>
              </template>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </template>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import {BookDto} from '@/types/komga-books'
import {SeriesDto} from '@/types/komga-series'
import {
  SearchConditionSeriesId,
  SearchOperatorIs,
} from '@/types/komga-search'
import {bookThumbnailUrl} from '@/functions/urls'
import {getBookReadRouteFromMedia} from '@/functions/book-format'

interface ReadingGuideEntry {
  series: string
  number: string
}

interface ReadingGuideTimeline {
  id: string
  name: string
  description: string
  image: string
  entries: ReadingGuideEntry[]
}

interface ResolvedReadingGuideEntry extends ReadingGuideEntry {
  book?: BookDto
}

export default Vue.extend({
  name: 'ReadingGuide',

  data() {
    return {
      selectedTimeline: null as ReadingGuideTimeline | null,
      loadingEntries: false,
      resolvedEntries: [] as ResolvedReadingGuideEntry[],

      timelines: [
        {
          id: 'secret-wars-1984',
          name: 'Secret Wars 1984',
          description: 'Ordre de lecture Secret Wars 1984',
          image: '/img/reading-guide/secret-wars1984.png',
          entries: [
            {series: 'Amazing Spider-Man', number: '251'},
            {series: 'Avengers', number: '242'},
            {series: 'Incredible Hulk', number: '294'},
            {series: 'Uncanny X-Men', number: '180'},
            {series: 'The Thing', number: '10'},

            {series: 'Secret Wars (1984)', number: '1'},
            {series: 'Secret Wars (1984)', number: '2'},
            {series: 'Secret Wars (1984)', number: '3'},
            {series: 'Secret Wars (1984)', number: '4'},
            {series: 'Secret Wars (1984)', number: '5'},
            {series: 'Secret Wars (1984)', number: '6'},
            {series: 'Secret Wars (1984)', number: '7'},
            {series: 'Secret Wars (1984)', number: '8'},
            {series: 'Secret Wars (1984)', number: '9'},
            {series: 'Secret Wars (1984)', number: '10'},
            {series: 'Secret Wars (1984)', number: '11'},
            {series: 'Secret Wars (1984)', number: '12'},

            {series: 'Amazing Spider-Man', number: '252'},
            {series: 'Avengers', number: '243'},
            {series: 'Fantastic Four', number: '265'},
            {series: 'Incredible Hulk', number: '295'},
            {series: 'Uncanny X-Men', number: '181'},
            {series: 'The Thing', number: '11'},
          ],
        },

        {
          id: 'civil-war',
          name: 'Civil War',
          description: 'Ordre de lecture Civil War',
          image: '/img/reading-guide/civil-war.png',
          entries: [
            {series: 'Civil War', number: '1'},
          ],
        },

        {
          id: 'secret-wars',
          name: 'Secret Wars (2015)',
          description: 'Ordre de lecture Secret Wars (2015)',
          image: '/img/reading-guide/secret-wars2015.png',
          entries: [
            {series: 'Secret Wars (2015)', number: '1'},
          ],
        },
      ] as ReadingGuideTimeline[],
    }
  },

  methods: {
    async openTimeline(timeline: ReadingGuideTimeline) {
      this.selectedTimeline = timeline
      this.resolvedEntries = []

      await this.resolveEntries(timeline)
    },

    async resolveEntries(timeline: ReadingGuideTimeline) {
      this.loadingEntries = true

      try {
        const seriesCache = new Map<string, SeriesDto>()
        const booksCache = new Map<string, BookDto[]>()
        const results: ResolvedReadingGuideEntry[] = []

        for (const entry of timeline.entries) {
          try {
            let series = seriesCache.get(entry.series)

            if (!series) {
              const seriesResult = await this.$komgaSeries.getSeriesList(
                {
                  fullTextSearch: entry.series,
                },
                {
                  page: 0,
                  size: 50,
                },
              )

              series = this.findBestSeries(
                seriesResult.content,
                entry.series,
              )

              if (series) {
                seriesCache.set(entry.series, series)
              }
            }

            if (!series) {
              results.push({...entry})
              continue
            }

            let books = booksCache.get(series.id)

            if (!books) {
              const booksResult = await this.$komgaBooks.getBooksList(
                {
                  condition: new SearchConditionSeriesId(
                    new SearchOperatorIs(series.id),
                  ),
                },
                {
                  page: 0,
                  size: 1000,
                },
              )

              books = booksResult.content
              booksCache.set(series.id, books)
            }

            const book = books.find(
              candidate =>
                this.normalizeIssueNumber(candidate.metadata.number) ===
                this.normalizeIssueNumber(entry.number),
            )

            results.push({
              ...entry,
              book,
            })
          } catch {
            results.push({...entry})
          }
        }

        this.resolvedEntries = results
      } finally {
        this.loadingEntries = false
      }
    },

    findBestSeries(
      series: SeriesDto[],
      requestedName: string,
    ): SeriesDto | undefined {
      const requested = this.normalizeSeriesName(requestedName)

      const exactName = series.find(
        candidate =>
          this.normalizeSeriesName(candidate.name) === requested,
      )

      if (exactName) {
        return exactName
      }

      const exactMetadata = series.find(
        candidate =>
          this.normalizeSeriesName(candidate.metadata.title) === requested,
      )

      if (exactMetadata) {
        return exactMetadata
      }

      return series[0]
    },

    normalizeSeriesName(value: string): string {
      return value
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
    },

    normalizeIssueNumber(value: string): string {
      return String(value)
        .trim()
        .replace(/^#/, '')
        .replace(/^0+/, '')
        .toLowerCase()
    },

    getBookThumbnail(bookId: string): string {
      return bookThumbnailUrl(bookId)
    },

    openBook(book: BookDto) {
      this.$router.push({
        name: getBookReadRouteFromMedia(book.media),
        params: {
          bookId: book.id,
        },
      })
    },

    closeTimeline() {
      this.selectedTimeline = null
      this.resolvedEntries = []
    },
  },
})
</script>

<style scoped>
  .issue-cover-missing {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .issue-missing {
    opacity: 0.65;
    cursor: default;
  }

  .issue-missing:hover {
    transform: none;
  }
</style>

