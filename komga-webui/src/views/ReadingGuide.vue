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

    <v-card
            v-for="timeline in timelines"
            :key="timeline.id"
            class="mb-6"
          >
            <v-card-title>
              {{ timeline.name }}
            </v-card-title>

            <v-card-subtitle>
              {{ timeline.description }}
            </v-card-subtitle>

            <v-card-text>
              <v-list>
                <v-list-item
                  v-for="(entry, index) in timeline.entries"
                  :key="`${timeline.id}-${index}`"
                >
                  <v-list-item-icon>
                    <span>{{ index + 1 }}</span>
                  </v-list-item-icon>

                  <v-list-item-content>
                    <v-list-item-title>
                      {{ entry.series }} #{{ entry.number }}
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card-text>
          </v-card>

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
          entries: [
            {
              series: '',
              number: '',
            },
          ],
        },
      ],
    }
  },
})
</script>

<style scoped>
</style>

