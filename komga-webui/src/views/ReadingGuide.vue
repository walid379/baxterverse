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
          name: 'Secret Wars',
          description: 'Ordre de lecture Secret Wars 1984',
          entries: [
            {
              series: 'Fantastic Four',
              number: '180',
            },
            {
              series: 'Amazing Spider-Man',
              number: '249',
            },
            {
              series: 'Secret Wars',
              number: '1',
            },
            {
              series: 'Secret Wars',
              number: '2',
            },
            {
              series: 'Fantastic Four',
              number: '265',
            },
          ],
        },

        {
          id: 'civil-war',
          name: 'Civil War',
          description: 'Ordre de lecture Civil War',
          entries: [
            {
              series: 'Civil War',
              number: '1',
            },
            {
              series: 'Amazing Spider-Man',
              number: '532',
            },
            {
              series: 'Civil War',
              number: '2',
            },
          ],
        },
      ],
    }
  }
})
</script>

<style scoped>
</style>

