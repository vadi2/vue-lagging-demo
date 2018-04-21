<template>
  <b-container fluid>
    <worker @done="ready = true"></worker>
    <b-row class="justify-content-md-center">
        <b-col cols="2" class="col-md-2 bg-light sidebar">
          <metadata></metadata>
          <package-contents :ready="ready"></package-contents>
        </b-col>
        <b-col>
          <resource-viewer></resource-viewer>
        </b-col>
    </b-row>
  </b-container>

<!-- <div class="container-fluid">
    <worker></worker>
    <div class="row">
        <div class="col-3 px-1 bg-dark position-fixed" id="sticky-sidebar">
           <metadata></metadata>
          <package-contents></package-contents>
        </div>
        <div class="col offset-3" id="main">
          <resource-viewer></resource-viewer>
        </div>
    </div>
</div> -->

</template>

<script>
  import SystemInformation from './LandingPage/SystemInformation'
  import Worker from './PackageViewer/Worker'
  import Metadata from './PackageViewer/Metadata'
  import PackageContents from './PackageViewer/PackageContents'
  import ResourceViewer from './PackageViewer/ResourceViewer'

  export default {
    name: 'package-viewer',
    components: { SystemInformation, PackageContents, Metadata, ResourceViewer, Worker },
    data () {
      return {
        ready: false
      }
    },
    methods: {
      open (link) {
        this.$electron.shell.openExternal(link)
      }
    }
  }
</script>

<style>
.sidebar {
  min-width: 200px;
}
</style>
