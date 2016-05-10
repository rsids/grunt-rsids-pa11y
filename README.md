# grunt-rsids-pa11y

> Grunt wrapper for pa11y

## Getting Started
This plugin requires Grunt `~0.4.5`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-rsids-pa11y --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-rsids-pa11y');
```

## The "rsids_pa11y" task

### Overview
In your project's Gruntfile, add a section named `rsids_pa11y` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  rsids_pa11y: {
    options: {
      // Task-specific options go here.
    },
    url: ['array of urls'],
    file: ['array of files, globbing permitted']
  },
});
```

You can pass a commandline argument `--url=###` to override your configuration

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History

### 0.3.0 (2016-05-10)

- Added command line feature

### 0.2.0 (2016-04-20)

- Added support for globbing files
- Added errors for missing url property
- Implemented debug flag