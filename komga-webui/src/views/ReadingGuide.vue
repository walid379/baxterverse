<template>
  <v-container fluid class="pa-6">

    <!-- HEADER -->
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
          @click="selectedTimeline = timeline"
        >
          <v-img
            :src="timeline.image"
            height="200"
            contain
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

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ReadingGuide',
  data() {
    return {
      timelines: [
        {
          id: 'secret-wars-1984',
          name: 'Secret Wars 1984',
          description: 'Ordre de lecture Secret Wars 1984',
          image: '/img/reading-guide/secret-wars1984.png',
          entries: [
            {
              series: 'Amazing Spider-Man',
              number: '251',
            },
            {
              series: 'Avengers',
              number: '242',
            },
            {
              series: 'Incredible Hulk',
              number: '294',
            },
            {
              series: 'Uncanny X-Men',
              number: '180',
            },
            {
              series: 'The Thing',
              number: '10',
            },
            {
              series: 'Secret Wars (1984)',
              number: '1',
            },
            {
              series: 'Secret Wars (1984)',
              number: '2',
            },
            {
              series: 'Secret Wars (1984)',
              number: '3',
            },
            {
              series: 'Secret Wars (1984)',
              number: '4',
            },
            {
              series: 'Secret Wars (1984)',
              number: '5',
            },
            {
              series: 'Secret Wars (1984)',
              number: '6',
            },
            {
              series: 'Secret Wars (1984)',
              number: '7',
            },
            {
              series: 'Secret Wars (1984)',
              number: '8',
            },
            {
              series: 'Secret Wars (1984)',
              number: '9',
            },
            {
              series: 'Secret Wars (1984)',
              number: '10',
            },
            {
              series: 'Secret Wars (1984)',
              number: '11',
            },
            {
              series: 'Secret Wars (1984)',
              number: '12',
            },
            {
              series: 'Amazing Spider-Man',
              number: '252',
            },
            {
              series: 'Avengers',
              number: '243',
            },
            {
              series: 'Fantastic Four',
              number: '265',
            },
            {
              series: 'Incredible Hulk',
              number: '295',
            },
            {
              series: 'Uncanny X-Men',
              number: '181',
            },
            {
              series: 'The Thing',
              number: '11',
            },
          ],
        },

        {
          id: 'civil-war',
          name: 'Civil War',
          description: 'Ordre de lecture Civil War',
          image: '/img/reading-guide/civil-war.png',
          entries: [
            {
              series: 'Civil War',
              number: '1',
            },
          ],
        },

        {
          id: 'secret-wars',
          name: 'Secrt Wars (2015)',
          description : 'Ordre de lecture Secret Wars (2015)',
          image: '/img/reading-guide/secret-wars2015.png',
          entries: [
            {
              series: 'Secret Wars (2015)',
              number: '1',
            },
          ],
        }
      ],
    }
  },
})
</script>

<style scoped>
  .timeline-card {
    cursor: pointer;
    border-radius: 16px;
    overflow: hidden;
    transition: transform 0.2s ease;
  }

  .timeline-card:hover {
    transform: scale(1.02);
  }

  .timeline-image {
    background: #000;
    width: 100%;
  }
</style>

