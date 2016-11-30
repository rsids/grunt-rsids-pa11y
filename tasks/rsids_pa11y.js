/*
 * grunt-rsids-pa11y
 * https://github.com/rsids/grunt-rsids-pa11y
 *
 * Copyright (c) 2016 Ids Klijnsma
 * Licensed under the MIT license.
 */

'use strict';

module.exports = (grunt) => {

  const async = require('async'),
    chalk = require('chalk'),
    fs = require('fs'),
    pa11y = require('pa11y'),
    phantomjs = require('phantomjs-prebuilt'),
    path = require('path');

  grunt.registerMultiTask('rsids_pa11y', 'Grunt wrapper for pa11y', function () {

    grunt.log.ok(['Starting grunt-rsids-pa11y']);

    let done = this.async();

    // Merge task-specific and/or target-specific options with these defaults.
    let options = this.options({
      reporter: 'console',
      standard: 'WCAG2AA',
      htmlcs: 'http://squizlabs.github.io/HTML_CodeSniffer/build/HTMLCS.js',
      config: null,
      timeout: 30000,
      debug: false
    });

    if (!this.data.url && !this.data.file && !grunt.option('url') && !grunt.option('file')) {
      grunt.fatal('No url(s) specified');
    }

    let reporterScript,
      reporter;

    switch (options.reporter) {
      case 'cli':
      case 'console':
        reporterScript = 'pa11y/reporter/cli';
        break;
      case 'csv':
        reporterScript = 'pa11y/reporter/csv';
        break;
      case 'html':
        reporterScript = 'pa11y/reporter/html';
        break;
      case 'json':
        reporterScript = 'pa11y/reporter/json';
        break;
      case 'markdown':
      case 'md':
        reporterScript = 'pa11y/reporter/markdown';
        break;
      default:
        reporterScript = options.reporter;
    }

    try {
      // Try to load the reporter
      reporter = require(reporterScript);
      options.log = reporter;
    } catch (err) {
      grunt.fatal(`Error: Reporter '${reporterScript}" not found`);
    }

    if (options.debug === false) {
      options.log.debug = function () {
      }
    }

    options.phantom = {
      path: phantomjs.path
    };

    let test = pa11y(options),
      urls = this.data.url || [],
      files = this.data.file || [];

    if (grunt.option('url')) {
      urls = grunt.option('url');
      files = [];
    }

    if (grunt.option('file')) {
      urls = [];
      files = grunt.option('file');
    }

    if (typeof urls === 'string') {
      urls = [urls];
    }

    if (typeof files === 'string') {
      files = [files];
    }
    files = grunt.file.expand(files);
    files = files.map(file => {
      return `file:///${path.resolve(file)}`;
    });

    urls = [].concat(urls, files);
    async.eachSeries(urls,
      (url, callback) => {
        console.log(chalk.cyan('Getting ready to test', url, 'against the', options.standard, 'standard.'));

        options.url = url;

        test.run(url, (error, results) => {
          if (error) {
            grunt.log.error(['Failed to run accessibility test']);
            grunt.log.error(error);
            callback(error);
          } else {

            // Catch the console log results with the hook
            let report = '',
              unhook = hook_stdout(str => {
                report += str;
              });

            // Process the results
            options.log.results(results, url);
            // and unhook
            unhook();

            if (options.dest) {
              let dest = options.dest.split('/'),
                filename = dest.pop();
              // Replace all non-alpha-numeric characters with a dash, and replace multiple dashes with a single dash
              filename = url.replace(/[^a-z0-9\.\-_]/gi, '-').replace(/\-{2,}/gi, '-') + '-' + filename;
              filename = dest.join('/') + filename;
              fs.writeFile(filename, report, err => {
                if (err) {
                  grunt.log.error(['Failed to write report to ' + options.dest]);
                  callback(err);
                } else {
                  callback();
                }
              });
            } else {
              // No destination was given, dump results (same as the console reporter)
              console.log(report);
            }

            if (!options.dest) {
              callback();
            }
          }
        });

      },

      function (err) {
        if (err) {
          grunt.log.error(err);
          done(false);
        }

        grunt.log.ok('All URLs have been processed.');
        done();
      });
  });
};

/**
 * Hooks into the standard stdout, so we can catch any console log messages and save it to the desired
 * output format
 * @param callback The callback function to replace the stdout with
 * @returns {Function} A reset function, when called normal stdout is restored
 */
function hook_stdout(callback) {
  let old_write = process.stdout.write;

  process.stdout.write = (write => {
    return (string, encoding, fd) => {
      //write.apply(process.stdout, arguments);
      callback(string, encoding, fd)
    }
  })(process.stdout.write);

  return () => {
    process.stdout.write = old_write;
  }
}
