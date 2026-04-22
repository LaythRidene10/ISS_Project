<template>
  <v-container fill-height fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" lg="4" md="6" sm="8">
        <v-card elevation="8">
          <v-card-title class="text-h5 justify-center">
            Rate The Design
          </v-card-title>

          <v-card-subtitle class="text-center">
            We'd love to hear your feedback!
          </v-card-subtitle>

          <v-card-text class="text-center">
            <v-rating
              v-model="rating"
              hover
              size="48"
              @input="onRatingChange"
            />

            <v-chip
              v-if="ratingMessage"
              class="mt-4"
              outlined
            >
              {{ ratingMessage }}
            </v-chip>

            <v-expand-transition>
              <div v-show="rating > 0">
                <v-textarea
                  v-model="feedback"
                  class="mt-6"
                  label="Tell us more about your experience (optional)"
                  outlined
                  rows="4"
                />

                <v-btn
                  block
                  :disabled="rating === 0"
                  elevation="2"
                  large
                  @click="submitRating"
                >
                  Submit Rating
                </v-btn>
              </div>
            </v-expand-transition>

            <v-alert
              v-model="showSuccess"
              class="mt-4"
              dismissible
              type="success"
            >
              Thank you for your feedback!
            </v-alert>
          </v-card-text>

          <v-divider />

          <v-card-text class="text-center">
            <div class="text-h3">{{ averageRating }}</div>
            <div class="text-caption mt-2">{{ totalRatingsText }}</div>

            <v-rating
              class="mt-2"
              dense
              half-increments
              readonly
              :value="parseFloat(averageRating)"
            />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
  export default {
    name: 'RatingCard',
    data () {
      return {
        rating: 0,
        feedback: '',
        showSuccess: false,
        ratings: [],
        ratingMessages: {
          1: 'Poor',
          2: 'Fair',
          3: 'Good',
          4: 'Very Good',
          5: 'Excellent!',
        },
      }
    },
    computed: {
      ratingMessage () {
        return this.rating > 0 ? this.ratingMessages[this.rating] : ''
      },
      averageRating () {
        if (this.ratings.length === 0) return '0.0'
        const sum = this.ratings.reduce((a, b) => a + b, 0)
        return (sum / this.ratings.length).toFixed(1)
      },
      totalRatingsText () {
        if (this.ratings.length === 0) return 'No ratings yet'
        return `Based on ${this.ratings.length} rating${this.ratings.length === 1 ? '' : 's'}`
      },
    },
    methods: {
      onRatingChange (value) {
        this.showSuccess = false
      },
      submitRating () {
        if (this.rating === 0) return

        this.ratings.push(this.rating)
        this.showSuccess = true

        setTimeout(() => {
          this.resetForm()
        }, 3000)
      },
      resetForm () {
        this.rating = 0
        this.feedback = ''
        this.showSuccess = false
      },
    },
  }
</script>
