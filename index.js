const jiraApi = require('./jira.api.runner');
const credentialsHelper = require('./credentialsHelper');

require('yargs')
    .command('extract', 'extract jira tags from provided test execution', yargs => {
        yargs.options('t', { alias: 'tag', demand: true, desc: 'Test Execution Tag', type: 'string'})
        yargs.options('p', { alias: 'path', demand: false, desc: 'Path To JSON file with results', type: 'string'})
    }, yargs => {
        return jiraApi.prepareResults(yargs.tag, yargs.path);
    })
    .command('storeCredentials', 'stores encrypted credentials in a local file', yargs => {
        yargs.options('u', { alias: 'username', demand: true, desc: 'username to store', type: 'string'})
        yargs.options('p', { alias: 'password', demand: true, desc: 'password to store', type: 'string'})
    }, yargs => {
        return credentialsHelper.storeCredentials(yargs.username, yargs.password);
    }).argv;