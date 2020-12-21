var fetch = require('node-fetch');
var url = require('url');
var _ = require('lodash');

const AUTH_TOKEN_BASE_URI = 'https://staging-authentication.wallstreetdocs.com/oauth/token';
const CLIENT_ID = 'coding_test';
const CLIENT_SECRET = 'bwZm5XC6HTlr3fcdzRnD';

const STATUS_BASE_URI = 'https://staging-gateway.priipcloud.com/api/v2.0/gateway/reports/status/service';

const FILL_TABLE = {
    'OK': "#33ab5c",
    'Not Implemented': '#343434',
    'Forbidden hostname': '#ffbe13',
    'Error': '#ec0548',
    'No web hosts registered.' : '#666666',
    'Invalid response (JSON)': '#ec0548',
    'Host unreachable': '#ff4e00'
}

async function obtainToken()
{
    let token = null;
    try {
        const params = {
            grant_type: 'client_credentials',
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET
        }

        const formData = new url.URLSearchParams();
        for (let [k,v] of Object.entries(params))
            formData.append(k, v);

        const response = await fetch(AUTH_TOKEN_BASE_URI, {
            method: 'POST',
            body: formData,
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });

        if (response.status === 200)
            token = (await response.json()).access_token;
        else
            console.log('token response', await response.text());
    }
    catch (e)
    {
        console.error(e);
    }

    console.debug('got token = ' + token);
    return token;
}

async function issueStatusReport()
{
    const authToken = await obtainToken();
    const response = await fetch(STATUS_BASE_URI, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    const json = await response.json();
    console.log('job response', json);
    return json.job_id;
}

async function retrieveStatusReport(jobId)
{
    const authToken = await obtainToken();
    const response = await fetch(STATUS_BASE_URI + `/${jobId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${authToken}`
        }
    });

    if (response.status !== 200)
        return false;

    const json = await response.json();
    console.log('requested job response', json);
    return preprocessResponse(json);
}

/**
 * 
 * We take the JOBs, group by status and key by id ;)
 * 
 * @param {*} response 
 */
function preprocessResponse(response)
{
    const groupbyStatus = _.groupBy(response.service_reports, 'status_text');

    // Harmonize the responses and make them ready for tree map
    const newObject = {};
    const rawHostsById = {};
    for (let [k,v] of Object.entries(groupbyStatus))
    {
        // Remap key
        if (k.includes('ECONNREFUSED'))
            k = 'Host unreachable';
        else if (k.includes('invalid json'))
            k = 'Invalid response (JSON)';
        else if (k.includes('One or more nodes'))
            k = 'Error';
        else if (k.includes('Forbidden'))
            k = 'Forbidden hostname';

        if (newObject[k])
            newObject[k] = newObject[k].concat(v);
        else
            newObject[k] = v;

        for (let service of v)
        {
            rawHostsById[service.host.id] = {
                id: service.host.id,
                status_code: service.status_code,
                status_text: k,
                name: service.host.name,
                alerts: service.total_alerts,
                nodes: service.nodes
            };
        }
    }

    const agg = [];
    for (let [k,v] of Object.entries(newObject))
        agg.push({
            name: k,
            value: v.length,
            fill: FILL_TABLE[k]
        });

    return {
        agg: [{ name: 'WSD Service Reports', children: agg, fill: '#333', stroke:'#fff' }],
        ids: _.groupBy(rawHostsById, 'status_text')
    };
}

module.exports = {
    obtainToken,
    issueStatusReport,
    retrieveStatusReport
}