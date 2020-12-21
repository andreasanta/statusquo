var express = require('express');
var router = express.Router();
var statusReport = require('../utils/statusReport');

router.post('/status', async function(req, res, next) {
  res.send(await statusReport.issueStatusReport());
});

router.get('/status/:job_id', async function(req, res, next) {
  const jobResponse = await statusReport.retrieveStatusReport(req.params.job_id);

  if (jobResponse)
    res.send(
      jobResponse
    );
  else
      res.status(412).send('Job Not Available Yet');
});

module.exports = router;
