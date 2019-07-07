const fs = require('fs');
const request = require('axios');
const lodash = require('lodash');
const credentialsHelper = require('./credentialsHelper');
const defaultTxtFilePath = './tags.txt';
const defaultJsonFilePath = './finalJson.json';
const credsPath = './consts/common.consts.json';

function checkIfCredentialsExist() {
    if (fs.existsSync(credsPath)) {
        return true;
    } else {
        throw new Error('No Credentials File! run [npm run store-credentials -- --username <username> --password <password>]');
    }
};

function getAuthSession() {
    checkIfCredentialsExist();
    let loginRequestOptions = {
        method: `POST`,
        url: `https://jira.wolterskluwer.io/jira/rest/auth/1/session`,
        data: {
            username: credentialsHelper.getDecodedParameter('userName'),
            password: credentialsHelper.getDecodedParameter('password')
        },
        headers: {
            "Content-Type": "application/json"
        },
        json: true
    };
    return request(loginRequestOptions).then((data) => {
        return data.data.session;
    })
    .catch((err) => {
        return console.error(`Login failed: ${err}`);
    });
};

function getNumberOfTestPages(authSession, tag) {
    let reqestOptions = {
        method: `GET`,
        url: `https://jira.wolterskluwer.io/jira/rest/api/2/issue/${tag}`,
        headers: {
            "Content-Type": "application/json",
            cookie: `${authSession.name}=${authSession.value}`
        },
        json: true
    }
    return request(reqestOptions).then((response) => {
        return Math.ceil(Number(response.data.fields.customfield_12303.length)/200);
    })
        .catch((err) => {
            return console.error(`Error fetching number of tags pages from jira: ${err}`);
        });
}

function getTestsFromJira(authSession, tag, pageIndex = 1) {
    let reqestOptions = {
        method: `GET`,
        url: `https://jira.wolterskluwer.io/jira/rest/raven/1.0/api/testexec/${tag}/test?limit=200&page=${pageIndex}`,
        headers: {
            "Content-Type": "application/json",
            cookie: `${authSession.name}=${authSession.value}`
        },
        json: true
    }
    return request(reqestOptions).then((response) => {
        return response.data;
    })
    .catch((err) => {
        return console.error(`Error fetching tests data from jira: ${err}`);
    });
};

function getTags(tag) {
    return getAuthSession().then((authorizedSession) => {
        return getNumberOfTestPages(authorizedSession, tag).then((numberOfPages) => {
            return new Promise((resolve, reject) => {
                let arrayOfPromises = [];
                for (let index = 1; index <= numberOfPages; index++) {
                    arrayOfPromises.push(getTestsFromJira(authorizedSession, tag, index));
                }
                resolve(Promise.all(arrayOfPromises));
            });
        });
    });
}

function getTagsToRun(arrayOfTagsFromJira) {
    let tagsToRun = [];
    let stringOfTagsToRun;
    arrayOfTagsFromJira.forEach((item) => {
        if (item.status === `FAIL` || item.status === `TODO`) {
            tagsToRun.push(`@jira(${item.key})`);
        }   
    });
    stringOfTagsToRun = `--tags "${tagsToRun.join(`","`)}"`;
    return stringOfTagsToRun;
}

function prepareResults(tag, jsonFilePath) {
    let stringOfTagsToRun;
    let givenJson;
    let finalJson = {};
    finalJson.tests = [];
    return getTags(tag).then((results) => {
        let arrayOfTests = lodash.flattenDeep(results);
        stringOfTagsToRun = getTagsToRun(arrayOfTests);
        if (jsonFilePath) {
            givenJson = require(jsonFilePath);
            givenJson.tests.forEach((item) => {
                if (stringOfTagsToRun.includes(item.testKey)) {
                    finalJson.tests.push(item);
                }
            });
            fs.writeFileSync(defaultJsonFilePath, JSON.stringify(finalJson), `utf8`);
        }
        return fs.writeFileSync(defaultTxtFilePath, stringOfTagsToRun, `utf8`);
    });
}

module.exports = {
    prepareResults
};