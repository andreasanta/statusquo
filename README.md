# Server Status Visualizer

## Sneak Peek

A small video of me playing with the demo: https://vimeo.com/493165986


## Getting started

Clone the repository and run:

```npm i```

Enter the _client secret_ in the utils/statusReport.js file at the top,
replacing the **CLIENT_SECRET** constant. Alternatively, you can define
the _CLIENT_SECRET_ environment variable before running the next command.

To start the project, execute:

```npm run start```

A local webserver will be spawned on http://localhost:3000 - You should be able to access it, load the report and filter by clicking on the chart.

The UI is far from splendid, but I think it's very practical for non technical users. They can drill down into the problem immediately and report it.

**PLEASE NOTE THE SITE IS DESKTOP ONLY**. No responsive version provided

## Tech choices

The tech stack used adheres exactly to the one specified in the assignment, except Grunt was not used, since an Express middleware would compile _.scss_ files instead.

The following was used:
- Npm 6.14
- Node v14
- Express 4
- Node Fetch
- Lodash
- Native ES5/6/7/8 isomorphic
- jQuery 3
- Handlebars (both BE and FE)
- Anycharts v8

## UI Display

The UI is comprised of a treemap chart and a list. I understand the secondary display should have been more "impressive" or "creative", but I opted for practical since it allows to search immediately the nodes that are failing.

The AnyCharts JavaScript library has been used due to the ease of implementation
given the time constraints. It still provides good results even on basic settings.

## Server report fetch

The technique used to fetch the report from the back-end is quite "original". First
the front-end issues a "status" request, the back end returns a job id and then
the front-end polls regularly for the status of the job.

The back-end returns a `412 Job Not Available Yet` until the job is ready, then is heavily pre-processed for front-end display and served in JSON.

## Todos

The total time spent on this assignment has been about 4 hours, so
many things can still be improved!

- Make responsive design
- Write unit tests
- Better aggregate front-end data
- Improve error handling
- Extract credentials in .env file
- Build production configuration (minification, uglification, etc)
- Improve colors and ui :)