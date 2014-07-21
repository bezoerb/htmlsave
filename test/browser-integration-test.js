var baseUrl = 'http://127.0.0.1:8000';

module.exports = {
    'truncate': function (test) {
        test.open(baseUrl+'/test/browser-test.html')
            // assert something
            .assert.text('#truncate p').is('hello world …')
            .done();
    }
};