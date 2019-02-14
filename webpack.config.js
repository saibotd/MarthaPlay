const WebPackHelper = require('./WebPackHelper');

module.exports = [
    WebPackHelper.js(
        'js/app.js',
        'dist/app.js'
    ),
    WebPackHelper.scss(
        'scss/app.scss',
        'dist/app.css'
    )
];
