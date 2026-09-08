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

    <!-- EMPTY STATE -->
    <v-row justify="center">
      <v-col
        cols="12"
        sm="10"
        md="8"
        lg="6"
      >
        <v-card
          outlined
          class="pa-8 text-center"
        >
          <v-icon
            size="72"
            color="primary"
            class="mb-4"
          >
            mdi-book-open-page-variant-outline
          </v-icon>

          <div class="text-h5 font-weight-medium mb-2">
            {{ $t('readinguide.empty') }}
          </div>

          <v-btn
            color="primary"
            large
            disabled
          >
            <v-icon left>
              mdi-plus
            </v-icon>

            {{ $t('readinguide.create') }}
          </v-btn>

          <div class="text-caption text--secondary mt-3">
            {{ $t('readinguide.soon') }}
          </div>
        </v-card>
      </v-col>
    </v-row>

  </v-container>
</template>

<script lang="ts">
import Vue from 'vue'

export default Vue.extend({
  name: 'ReadingGuide',
})
</script>

<style scoped>
</style>