var amqp = require('amqp'),
    url = process.env.AMQP,
    conn = amqp.createConnection({
        url: url
    }),
    groups = require('./groups.json'),
    exchange;

function publish() {
    Object.keys(groups).forEach(function(group) {
        var rand = Math.random(),
            message = {
                group: group,
                subject: rand > 0.5 ? 'Test HTML' : 'Test Plain',
                template: rand > 0.5 ? 'html.hbs' : 'plain.hbs',
            };

        if (rand > 0.5) {
            message.isHtml = true;
        }

        console.log('sending group message', message);

        exchange.publish('expand', message);

    });
    setInterval(publish, 30 * 1000);
}

conn.on('ready', function() {
    console.log('connection ready');
    exchange = conn.exchange('email');

    publish();
});
