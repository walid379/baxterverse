<template>
  <div class="ma-3">
    <v-container style="max-width: 550px">

      <v-row align="center" justify="center" class="ma-3">
        <v-img
          src="../assets/logo.svg"
          :max-width="logoWidth"
        />
      </v-row>

      <form novalidate @submit.prevent="register">

        <v-row>
          <v-col>
            <v-text-field
              v-model.trim="form.email"
              label="Adresse e-mail"
              :error-messages="getEmailErrors"
              autocomplete="email"
              autofocus
              @input="$v.form.email.$touch()"
              @blur="$v.form.email.$touch()"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field
              v-model="form.password"
              label="Mot de passe"
              :type="showPassword ? 'text' : 'password'"
              :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
              autocomplete="new-password"
              :error-messages="getPasswordErrors"
              hint="8 caractères minimum"
              @click:append="showPassword = !showPassword"
              @input="$v.form.password.$touch()"
              @blur="$v.form.password.$touch()"
            />
          </v-col>
        </v-row>

        <v-row>
          <v-col>
            <v-text-field
              v-model="form.confirmPassword"
              label="Confirmer le mot de passe"
              :type="showConfirmPassword ? 'text' : 'password'"
              :append-icon="showConfirmPassword ? 'mdi-eye' : 'mdi-eye-off'"
              autocomplete="new-password"
              :error-messages="getConfirmPasswordErrors"
              @click:append="showConfirmPassword = !showConfirmPassword"
              @input="$v.form.confirmPassword.$touch()"
              @blur="$v.form.confirmPassword.$touch()"
            />
          </v-col>
        </v-row>

        <v-row v-if="errorMessage">
          <v-col>
            <v-alert
              type="error"
              text
              dense
            >
              {{ errorMessage }}
            </v-alert>
          </v-col>
        </v-row>

        <v-row>
          <v-col cols="auto" class="d-flex">
            <v-btn
              color="primary"
              type="submit"
              :loading="loading"
              :disabled="loading"
            >
              Créer mon compte
            </v-btn>

            <v-btn
              color="primary"
              class="ml-2"
              :to="{ name: 'login' }"
              :disabled="loading"
            >
              Se connecter
            </v-btn>
          </v-col>
        </v-row>

        <v-divider class="my-4 mt-2"/>

        <v-row justify="center">
          <v-col cols="6">
            <v-select
              v-model="locale"
              :items="locales"
              :label="$t('home.translation')"
              prepend-icon="mdi-translate"
            />
          </v-col>

          <v-col cols="6">
            <v-select
              v-model="theme"
              :items="themes"
              :label="$t('home.theme')"
              :prepend-icon="themeIcon"
            />
          </v-col>
        </v-row>

      </form>
    </v-container>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import {
  email,
  minLength,
  required,
  sameAs,
} from 'vuelidate/lib/validators'
import {Theme} from '@/types/themes'

export default Vue.extend({
  name: 'RegisterView',

  data() {
    return {
      form: {
        email: '',
        password: '',
        confirmPassword: '',
      },

      showPassword: false,
      showConfirmPassword: false,

      loading: false,
      errorMessage: '',

      locales: this.$i18n.availableLocales.map((x: any) => ({
        text: this.$i18n.t('common.locale_name', x),
        value: x,
      })),
    }
  },

  validations: {
    form: {
      email: {
        required,
        email,
      },

      password: {
        required,
        minLength: minLength(8),
      },

      confirmPassword: {
        required,
        sameAsPassword: sameAs('password'),
      },
    },
  },

  computed: {
    logoWidth(): number {
      let l = 100

      switch (this.$vuetify.breakpoint.name) {
        case 'xs':
          l = 100
          break

        case 'sm':
        case 'md':
          l = 200
          break

        case 'lg':
        case 'xl':
        default:
          l = 300
      }

      return l
    },

    getEmailErrors(): string[] {
      const errors: string[] = []

      if (!this.$v.form.email.$dirty) {
        return errors
      }

      if (!this.$v.form.email.required) {
        errors.push('Adresse e-mail requise')
      }

      if (!this.$v.form.email.email) {
        errors.push('Adresse e-mail invalide')
      }

      return errors
    },

    getPasswordErrors(): string[] {
      const errors: string[] = []

      if (!this.$v.form.password.$dirty) {
        return errors
      }

      if (!this.$v.form.password.required) {
        errors.push('Mot de passe requis')
      }

      if (!this.$v.form.password.minLength) {
        errors.push(
          'Le mot de passe doit contenir au moins 8 caractères',
        )
      }

      return errors
    },

    getConfirmPasswordErrors(): string[] {
      const errors: string[] = []

      if (!this.$v.form.confirmPassword.$dirty) {
        return errors
      }

      if (!this.$v.form.confirmPassword.required) {
        errors.push('Confirmation requise')
      }

      if (!this.$v.form.confirmPassword.sameAsPassword) {
        errors.push(
          'Les mots de passe ne correspondent pas',
        )
      }

      return errors
    },

    locale: {
      get: function (): string {
        return this.$i18n.locale
      },

      set: function (locale: string): void {
        if (
          this.$i18n.availableLocales.includes(locale)
        ) {
          this.$store.commit(
            'setLocale',
            locale,
          )
        }
      },
    },

    themes(): object[] {
      return [
        {
          text: this.$i18n.t(Theme.LIGHT),
          value: Theme.LIGHT,
        },
        {
          text: this.$i18n.t(Theme.DARK),
          value: Theme.DARK,
        },
        {
          text: this.$i18n.t(Theme.SYSTEM),
          value: Theme.SYSTEM,
        },
      ]
    },

    themeIcon(): string {
      switch (this.theme) {
        case Theme.LIGHT:
          return 'mdi-brightness-7'

        case Theme.DARK:
          return 'mdi-brightness-3'

        case Theme.SYSTEM:
          return 'mdi-brightness-auto'
      }

      return ''
    },

    theme: {
      get: function (): Theme {
        return this.$store.state.persistedState.theme
      },

      set: function (theme: Theme): void {
        if (
          Object.values(Theme).includes(theme)
        ) {
          this.$store.commit(
            'setTheme',
            theme,
          )
        }
      },
    },
  },

  methods: {
    async register() {
      this.$v.$touch()

      if (this.$v.$invalid) {
        return
      }

      this.loading = true
      this.errorMessage = ''

      try {
        await this.$komgaUsers.register({
          email: this.form.email,
          password: this.form.password,
        })

        await this.$store.dispatch(
          'getMeWithAuth',
          {
            login: this.form.email,
            password: this.form.password,
            rememberMe: true,
          },
        )

        await this.$store.dispatch(
          'getLibraries',
        )

        await this.$store.dispatch(
          'getClientSettingsGlobal',
        )

        await this.$store.dispatch(
          'getClientSettingsUser',
        )

        await this.$router.push({
          name: 'home',
        })
      } catch (e) {
        this.errorMessage =
          e?.message ||
          'Impossible de créer le compte'
      } finally {
        this.loading = false
      }
    },
  },
})
</script>

<style scoped>
</style>