<template>
  <div>
    <b-btn block v-b-toggle.collapse1 variant="primary">Profiles <b-badge variant="light">{{profilesCount}}</b-badge></b-btn>
    <b-collapse visible id="collapse1" class="mt-2">
      <b-list-group>
        <b-list-group-item v-if="ready" v-for="profile in profilesResources" :key="profile.url" href="#some-link">{{profile.name}}</b-list-group-item>
      </b-list-group>
    </b-collapse>

    <b-btn block v-b-toggle.collapse2 variant="primary">Terminology <b-badge variant="light">{{terminologyCount}}</b-badge></b-btn>
    <b-collapse id="collapse2" class="mt-2">
      <b-list-group>
        <b-list-group-item v-for="resource in terminologyResources" :key="resource.url" href="#some-link">{{resource.name}}</b-list-group-item>
      </b-list-group>
    </b-collapse>

    <b-btn block v-b-toggle.collapse3 variant="primary">Instances <b-badge variant="light">0</b-badge></b-btn>
    <b-collapse id="collapse3" class="mt-2">

    </b-collapse>
  </div>
</template>

<script>
  import { mapGetters } from 'vuex'

  export default {
    props: ['ready'],
    data () {
      return {
      }
    },
    computed: {
      ...mapGetters([
        'profilesCount',
        'terminologyCount',
        'profilesResources',
        'terminologyResources'
      ])
    }
  }
</script>

<style scoped>
</style>
