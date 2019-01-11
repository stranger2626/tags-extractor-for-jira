const gulp = require('gulp');
const yargs = require("yargs").argv;
const jiraApi = require('./jira.api.runner');

gulp.task('tags:converting', () => {
    jiraApi.prepareResults(yargs.tag, yargs.path)
});