# Parsing tags from Jira

# Requirements
- Node.js 10.9.x or newer

## Installation
```
 Run 'npm install'
```
## First Launch Preparation
```
 Run 'npm run store-credentials -- --username <username> --password <password>'
```
## Extracting jira tags
```
 Run 'npm run convert -- --tag "<jiraTag>" --path <pathToJson>'
```
After running the aforementioned command the program will generate a file called tags.txt containing a list of all jira tags for all of the tests in a given test execution. If the --path optione is passed it will also generate a finalJson.json with results suitable for jira XRAY plugin.
