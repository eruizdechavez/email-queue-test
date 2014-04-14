var amqp = require('amqp'),
    hogan = require('hogan.js'),
    fs = require('fs'),
    path = require('path'),
    url = process.env.AMQP,
    conn = amqp.createConnection({
        url: url
    }),
    groups = require('./groups'),
    users = require('./users'),
    exchange;

conn.on('ready', function() {
    console.log('connection ready');

    exchange = conn.exchange('email');

    conn.queue('expand', function(q) {
        q.bind('email', 'expand');

        q.subscribe(function(msg) {
            console.log('got group message');

            var emails = groups[msg.group],
                template = fs.readFileSync(path.join(__dirname, msg.template), 'utf-8'),
                message;

            template = hogan.compile(template);

            console.log('expanding group into individual messages...');

            emails.forEach(function(email) {
                message = {
                    subject: msg.subject,
                    to: email,
                    message: template.render({
                        name: users[email]
                    }),
                };

                if (msg.isHtml) {
                    message.isHtml = true;
                }

                console.log('producing individual message', email);
                exchange.publish('send', message);
            });
        });
    });
});
