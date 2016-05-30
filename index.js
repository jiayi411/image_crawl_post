cf = require('./modules/common_functions.js');
var wordpress = require('./modules/wordpress.js');
var tumblr = require('./modules/tumblr.js');
var google_parser = require('./modules/google_parser.js');
var async = require('async');

// keywords array
var search_keywords = ['keyword1','keyword2', 'keyword3','keyword4','keyword5','keyword6'];

async.eachSeries( search_keywords, function( keyword, callback ){
    google_parser.parse(keyword, function( arr ){
        wordpress.post( arr, function(){
            callback();
        } );
        //tumblr.post( arr, function(){
        //    callback();
        //})
    });
});

//}
