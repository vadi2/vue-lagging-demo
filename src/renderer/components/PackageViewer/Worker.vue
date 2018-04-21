<template>
  <b-progress v-if="processing" :value="count*(100/total)" :max="100" show-progress animated></b-progress>
</template>

<script>
  const {dialog} = require('electron').remote
  const {remote} = require('electron')
  const fs = require('fs')
  const path = require('path')
  const tar = require('tar-fs')
  const gunzip = require('gunzip-maybe')
  const globstream = require('glob-stream')

  export default {
    data () {
      return {
        buffer: [],
        count: 0,
        total: 0,
        processing: false
      }
    },
    mounted () {
      this.$electron.ipcRenderer.on('file-open', e => {
        this.handleFileOpen()
      })
    },

    // this should be a Promise-compatible stack so all of these could just be chained
    methods: {
      handleFileOpen: function () {
        const vm = this

        dialog.showOpenDialog({
          title: 'Select a FHIR package to open',
          properties: [ 'openFile' ],
          filters: [
            {name: 'FHIR Packages', extensions: ['tar', 'tgz', 'tar.gz']},
            {name: 'All Files', extensions: ['*']}
          ]
        }, function (filenames) {
          if (!filenames[0]) { return }

          // this seems to be something else at this point and it can't use the method
          // directly - so use a workaround
          vm.unpackTarball(filenames[0])
        })
      },

      // creates a temp directory we can extract the FHIR package into
      // returns the said directory
      initTempDirectory: function () {
        return fs.mkdtempSync(path.join(remote.app.getPath('temp'), 'fhir-package-'))
      },

      // unpacks the given file package and calls the manifest parser
      unpackTarball: function (filename) {
        const unpackLocation = this.initTempDirectory()
        const vm = this

        fs.createReadStream(filename)
          .pipe(gunzip())
          .pipe(tar.extract(unpackLocation))
          .on('finish', function () {
            vm.$store.commit('SET_EXTRACTED_LOCATION', {location: unpackLocation})
            console.log(`Unpacked in: ${vm.$store.state.FhirPackage.extractedLocation}`)

            vm.parseManifest(path.join(unpackLocation, 'package', 'package.json'))
          })
          .on('error', function (err) {
            console.log(`Error extracting package: ${err}`)
          })
      },

      // parses out all of the necessary information form package.json and stores it in
      // the FhirPackage module
      parseManifest: function (filename) {
        const manifest = JSON.parse(fs.readFileSync(filename, 'utf8'))
        console.log(manifest)

        this.$store.commit('DROP_CONFORMANCE_RESOURCES')

        this.parsePackageName(manifest)
        this.parsePackageAuthor(manifest)
        this.parsePackageDescription(manifest)
        this.parsePackageVersion(manifest)
        this.parseJsonResources(manifest)
      },

      parsePackageName: function (manifest) {
        this.$store.commit('SET_NAME', {name: manifest.name})
      },

      parsePackageAuthor: function (manifest) {
        const matches = /^(.+) \((.+)\)$/.exec(manifest.author)

        if (matches && matches[2]) {
          const author = matches[1]
          const email = matches[2]

          this.$store.commit('SET_PACKAGE_AUTHOR', {author: author})
          this.$store.commit('SET_AUTHOR_EMAIL', {email: email})
        } else {
          this.$store.commit('SET_PACKAGE_AUTHOR', {author: manifest.author})
        }
      },

      parsePackageDescription: function (manifest) {
        this.$store.commit('SET_DESCRIPTION', {description: manifest.description})
      },

      parsePackageVersion: function (manifest) {
        this.$store.commit('SET_VERSION', {version: manifest.version})
      },

      parseJsonResources: function (manifest) {
        const vm = this

        var stream = globstream(vm.$store.state.FhirPackage.extractedLocation + '/**/*.json')

        // store the promises for later
        let streamPromises = []

        stream.on('data', function (file) {
          // vm.parseJsonResource(JSON.parse(fs.readFileSync(file.path, 'utf8')))

          // for each stream data, create a promise and store in streamPromises
          let streamPromise = new Promise((resolve, reject) => {
            fs.readFile(file.path, 'utf8', (err, data) => {
              if (err) throw Error('error')

              let d = JSON.parse(data)

              // resolve using only the necassary info
              resolve({
                resourceType: d.resourceType,
                url: d.url,
                name: d.name
              })
            })
          })

          // store
          streamPromises.push(streamPromise)
        })

        // wait for all streams loaded
        stream.on('end', () => {
          // now wait for all promises to finish
          Promise.all(streamPromises)
            .then((r) => {
              // update some stats and set state
              vm.total = r.length
              vm.processing = true

              // iterate over results and for each, stagger their commit
              // to state. when finished, emit a 'done' event to parent
              r.map((i, j) => {
                setTimeout(() => {
                  if (j + 1 === r.length) {
                    vm.$emit('done')
                    vm.processing = false
                  }
                  vm.parseJsonResource(i)
                  vm.count++
                }, j * 5) // stagger 50ms apart
              })
            })
        })
      },

      parseJsonResource: function (json) {
        console.log(json.resourceType)
        if (!json.resourceType) { return }

        switch (json.resourceType) {
          case 'StructureDefinition':
            this.parseStructureDefinition(json)
            break

          case 'ValueSet':
            this.parseTerminologyResource(json)
            break

          default:
            console.log(`Unknown resourceType: ${json.resourceType}`)
        }
      },

      parseStructureDefinition: function (json) {
        this.$store.commit('ADD_CONFORMANCE_RESOURCE', {type: 'profile', url: json.url, name: json.name})
      },

      parseTerminologyResource: function (json) {
        this.$store.commit('ADD_CONFORMANCE_RESOURCE', {type: 'terminology', url: json.url, name: json.name})
      }
    }
  }
</script>

<style scoped>
>>>
  .progress-bar {
    float: left;
    width: 0;
    height: 100%;
    font-size: 12px;
    line-height: 20px;
    color: #fff;
    text-align: center;
    background-color: #337ab7;
    -webkit-box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
            box-shadow: inset 0 -1px 0 rgba(0, 0, 0, .15);
    -webkit-transition: width .2s ease !important;
         -o-transition: width .2s ease !important;
            transition: width .2s ease !important;
  }
</style>
