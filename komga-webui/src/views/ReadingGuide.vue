<template>
  <v-container fluid class="pa-6">
    <v-alert v-if="loadError" type="error" text dismissible @input="loadError = ''">
      {{ loadError }}
    </v-alert>

    <div v-if="loadingGuides" class="d-flex justify-center py-12">
      <v-progress-circular indeterminate size="64" color="primary"/>
    </div>

    <!-- Liste des guides, chargee depuis /reading-guides.json. -->
    <template v-else-if="!selectedTimeline">
      <div class="d-flex align-center mb-6">
        <v-icon large class="mr-3">mdi-timeline-text-outline</v-icon>
        <div>
          <h1 class="text-h4 font-weight-bold">{{ $t('readinguide.title') }}</h1>
          <div class="text-subtitle-1 text--secondary">{{ $t('readinguide.subtitle') }}</div>
        </div>
        <v-spacer/>
        <v-btn icon title="Actualiser les guides" @click="loadGuides">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </div>

      <v-divider class="mb-6"/>
      <v-alert v-if="timelines.length === 0 && !loadError" type="info" text>
        Aucun guide disponible. Ajoute-en un dans reading-guides.json.
      </v-alert>
      <v-row>
        <v-col v-for="timeline in timelines" :key="timeline.id" cols="12" sm="6" md="4">
          <v-card class="timeline-card" outlined @click="openTimeline(timeline)">
            <v-img :src="timeline.image" height="200" cover class="timeline-image"/>
            <v-card-title>{{ timeline.name }}</v-card-title>
            <v-card-subtitle>{{ timeline.description }}</v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </template>

    <!-- Contenu d'un guide, accessible via /reading-guide/:guideId. -->
    <template v-else>
      <div class="d-flex align-center mb-6">
        <v-btn icon class="mr-3" @click="closeTimeline">
          <v-icon>mdi-arrow-left</v-icon>
        </v-btn>
        <div>
          <h1 class="text-h4 font-weight-bold">{{ selectedTimeline.name }}</h1>
          <div class="text-subtitle-1 text--secondary">{{ selectedTimeline.description }}</div>
        </div>
      </div>

      <v-divider class="mb-6"/>
      <div v-if="loadingEntries" class="d-flex justify-center align-center py-12">
        <v-progress-circular indeterminate size="64" color="primary"/>
      </div>
      <v-row v-else>
        <v-col
          v-for="(entry, index) in resolvedEntries"
          :key="`${entry.series}-${entry.number}-${index}`"
          cols="6" sm="4" md="3" lg="2"
        >
          <v-card
            class="issue-card"
            outlined
            :class="{'issue-missing': !entry.book}"
            @click="entry.book && openBook(entry.book)"
          >
            <v-img
              v-if="entry.book"
              :src="getBookThumbnail(entry.book.id)"
              aspect-ratio="0.6667"
              cover
              class="issue-cover"
            >
              <div class="issue-number-overlay">#{{ entry.number }}</div>
            </v-img>
            <div v-else class="issue-cover issue-cover-missing">
              <v-icon size="56" color="grey">mdi-book-alert-outline</v-icon>
              <div class="issue-number-overlay">#{{ entry.number }}</div>
            </div>
            <v-card-title class="issue-title">{{ entry.series }}</v-card-title>
            <v-card-subtitle>
              <template v-if="entry.book">#{{ entry.number }}</template>
              <span v-else class="error--text">Introuvable dans Komga</span>
            </v-card-subtitle>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'
import urls, {bookThumbnailUrl} from '@/functions/urls'
import {getBookReadRouteFromMedia} from '@/functions/book-format'
import {BookDto} from '@/types/komga-books'
import {SeriesDto} from '@/types/komga-series'
import {SearchConditionSeriesId, SearchOperatorIs} from '@/types/komga-search'

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
      timelines: [] as ReadingGuideTimeline[],
      selectedTimeline: null as ReadingGuideTimeline | null,
      loadingGuides: true,
      loadingEntries: false,
      loadError: '',
      resolvedEntries: [] as ResolvedReadingGuideEntry[],
      resolveToken: 0,
    }
  },

  async mounted() {
    await this.loadGuides()
  },

  watch: {
    '$route.params.guideId'(guideId: string | undefined) {
      this.selectTimelineFromRoute(guideId)
    },
  },

  methods: {
    async loadGuides() {
      this.loadingGuides = true
      this.loadError = ''
      try {
        const response = await fetch(`${urls.baseNoSlash}/reading-guides.json`, {
          cache: 'no-store',
          credentials: 'same-origin',
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const payload = await response.json()
        const guides = Array.isArray(payload) ? payload : payload.guides
        if (!Array.isArray(guides)) throw new Error('Le fichier doit contenir un tableau "guides".')

        this.timelines = guides.map((guide: any) => ({
          id: String(guide.id),
          name: String(guide.name),
          description: String(guide.description || ''),
          image: String(guide.image || ''),
          entries: (Array.isArray(guide.entries) ? guide.entries : []).map((entry: any) => ({
            series: String(entry.series),
            number: String(entry.number),
          })),
        }))
      } catch (e) {
        this.timelines = []
        this.loadError = `Impossible de charger reading-guides.json : ${e?.message || e}`
      } finally {
        this.loadingGuides = false
        this.selectTimelineFromRoute(this.$route.params.guideId)
      }
    },

    openTimeline(timeline: ReadingGuideTimeline) {
      this.$router.push({name: 'readinguide', params: {guideId: timeline.id}})
    },

    selectTimelineFromRoute(guideId?: string) {
      this.resolveToken++
      this.resolvedEntries = []
      this.selectedTimeline = null
      this.loadingEntries = false
      if (!guideId) return

      const timeline = this.timelines.find(guide => guide.id === guideId)
      if (!timeline) {
        if (!this.loadError) this.loadError = `Guide introuvable : ${guideId}`
        return
      }

      this.loadError = ''
      this.selectedTimeline = timeline
      this.resolveEntries(timeline)
    },

    async resolveEntries(timeline: ReadingGuideTimeline) {
      const token = ++this.resolveToken
      this.loadingEntries = true

      try {
        const seriesCache = new Map<string, SeriesDto | null>()
        const booksCache = new Map<string, BookDto[]>()
        const results: ResolvedReadingGuideEntry[] = []

        for (const entry of timeline.entries) {
          if (token !== this.resolveToken) return
          try {
            let series = seriesCache.get(entry.series)
            if (series === undefined) {
              const seriesResult = await this.$komgaSeries.getSeriesList(
                {fullTextSearch: entry.series},
                {page: 0, size: 50},
              )
              series = this.findBestSeries(seriesResult.content, entry.series) || null
              seriesCache.set(entry.series, series)
            }

            if (!series) {
              results.push({...entry})
              continue
            }

            let books = booksCache.get(series.id)
            if (!books) {
              const booksResult = await this.$komgaBooks.getBooksList(
                {condition: new SearchConditionSeriesId(new SearchOperatorIs(series.id))},
                {page: 0, size: 1000},
              )
              books = booksResult.content
              booksCache.set(series.id, books)
            }

            const book = books.find(candidate =>
              this.normalizeIssueNumber(candidate.metadata.number) === this.normalizeIssueNumber(entry.number),
            )
            results.push({...entry, book})
          } catch (e) {
            results.push({...entry})
          }
        }

        if (token === this.resolveToken) this.resolvedEntries = results
      } finally {
        if (token === this.resolveToken) this.loadingEntries = false
      }
    },

    findBestSeries(series: SeriesDto[], requestedName: string): SeriesDto | undefined {
      const requested = this.normalizeSeriesName(requestedName)
      return series.find(candidate => this.normalizeSeriesName(candidate.name) === requested)
        || series.find(candidate => this.normalizeSeriesName(candidate.metadata.title) === requested)
        || series[0]
    },

    normalizeSeriesName(value: string): string {
      return String(value).toLowerCase().trim().replace(/\s+/g, ' ')
    },

    normalizeIssueNumber(value: string): string {
      return String(value).trim().replace(/^#/, '').replace(/^0+(?=\d)/, '').toLowerCase()
    },

    getBookThumbnail(bookId: string): string {
      return bookThumbnailUrl(bookId)
    },

    openBook(book: BookDto) {
      this.$router.push({
        name: getBookReadRouteFromMedia(book.media),
        params: {bookId: book.id},
      })
    },

    closeTimeline() {
      this.$router.push({path: '/reading-guide'})
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
