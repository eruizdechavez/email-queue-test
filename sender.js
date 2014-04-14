var amqp = require('amqp'),
    nodemailer = require('nodemailer'),
    url = process.env.AMQP,
    conn = amqp.createConnection({
        url: url
    }),
    transport = nodemailer.createTransport('SMTP', {
        host: '127.0.0.1',
        port: 1025
    });

conn.on('ready', function() {
    console.log('connection ready');
    conn.queue('send', function(q) {
        q.bind('email', 'send');

        q.subscribe(function(msg) {

            console.log('got individual message');
            var mail = {
                from: 'Test Email Service <testservice@example.com>',
                to: msg.to,
                subject: msg.subject,
                forceEmbeddedImages: true
            };

            if (msg.isHtml) {
                mail.html = msg.message;
                mail.generateTextFromHTML = true;
            } else {
                mail.text = msg.message;
            }

            console.log('sending email', msg.to);

            transport.sendMail(mail);
        });
    });
});
