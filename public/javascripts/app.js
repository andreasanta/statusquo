const BASE_URI = '/';

let hostsByStatus = null;

const itemTemplate = Handlebars.compile(`
    <div class="host-separator">
        <h5>ID: {{id}}<br/>Name: {{name}}</h5>
        {{#if nodes}}
        <h5>Nodes List</h5>        
        <ul>
            {{#each nodes}}
                <li>
                    {{this.web_node}} - {{this.status_code}}<br/>
                    {{#if this.checks}}
                        <i>Checks<i/>
                        <ul>
                            {{#each this.checks}}
                                <li><span style="color: {{this.state}}"> {{this.name}}</span></br>
                                    <small>{{this.message}}</small>
                            {{/each}}
                        </ul>
                    {{/if}}
                </li>
            {{/each}}
        </ul>
        {{else}}
        <h5>No nodes found...</h5>
        {{/if}}
    </div>
`);

function displayItems(status) {

    var items = hostsByStatus[status];

    $('.host-list').empty();

    var newInnerHtml = '';
    for (let i of items)
        newInnerHtml += itemTemplate({
            id: i.id,
            name: i.name,
            nodes: i.nodes,
        });

    $('.selected-status').text(status);
    $('.host-list').html(newInnerHtml);
}

function drawChart(data) {
    // create a chart and set the data
    var treeData = anychart.data.tree(data, "as-tree");

    // create a treemap chart visualizing the data tree
    var chart = anychart.treeMap(treeData);
    
    chart.container('chart');
    chart.sort("asc");
    chart.background().fill("#333");

    // enable HTML for labels
    chart.labels().useHtml(true);

    // configure labels
    chart.labels().format(
        "<span style='font-weight:bold'>{%name}</span><br>{%value}"
    );

    chart.listen('pointsSelect', function(e) {
        displayItems(e.point.get('name'));
    });

    chart.selected().fill('#aaa');

    // draw the chart
    chart.draw();
}

$(async () => {

    const response = await fetch(BASE_URI + 'status', {
        method: 'POST'
    });

    const jobId = await response.text();

    const jobCheck = setInterval(async () => {
        
        try {
            const response = await fetch(BASE_URI + `status/${jobId}`, {
                method: 'GET'
            });

            const json = await response.json();
            clearInterval(jobCheck);

            $('.loading').fadeOut();
            drawChart(json.agg);
            hostsByStatus = json.ids;
        }
        catch (e)
        {
            // TODO: handle error
            console.error(e);
        }

    }, 750);

});

