app = module.parent.exports.app;

app.get('/hello', function(req, res) {
    app.logmessage('/hello');
    return res.send('Hello World!');
});
