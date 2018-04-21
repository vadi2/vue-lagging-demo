<template>
    <b-card v-bind:title="name"
            v-bind:sub-title="author"
            footer-tag="footer">
        <p class="card-text small">
          {{description}}
        </p>
        <div class="small text-sm-right" slot="footer" v-b-tooltip.hover.left title="Package version">{{version}}&nbsp;</div>
    </b-card>
</template>

<script>
  export default {
    data () {
      return {
      }
    },
    computed: {
      name () {
        return this.$store.state.FhirPackage.name
      },
      version () {
        return this.$store.state.FhirPackage.version
      },
      author () {
        return this.$store.state.FhirPackage.packageAuthor
      },
      email () {
        return this.$store.state.FhirPackage.authorEmail
      },
      description () {
        return this.$store.state.FhirPackage.description
      }
    }
  }
</script>

<style scoped>
</style>
