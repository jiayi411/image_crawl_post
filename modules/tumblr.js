/**
 * Created by jiayi on 15/11/24.
 */
var tumblr = require('tumblr-post');
//var tumblr = require('tumblr');
var async = require("async");
cf = require('./common_functions.js');

var one_module = one_module || {};
module.exports = (function (m) {

    m.post = function( arr, post_call_back ){
        if( !arr ){
            cf.log('none post array');
            if( post_call_back ) {
                post_call_back();
            }
            return;
        }
        // create wordpress client
        //var oauth = { // 91girlblog
        //    consumer_key: 'ydEJXCgNa0283G46JSPrJB5EK3UAZQkWfl21YyTajIhxQFBUcy',
        //    consumer_secret: 'kGyezb1YrqNwJgrwfdfNEukL01Jz8u8D9MpWP8oDWk58B4udEw',
        //    token: 'SRtoxiypnxP2uXKntxraYuXB2M9x3H1n3fttM7GiGvCh1qDGCm',
        //    token_secret: 'OlySikvf9n8fwDD9xn11H4uXSAIa1HeFLgPIjlKCcseC6l52Qi'
        //};

        var oauth = { // poster0001
            consumer_key: 'oLHTwdBaGOxGypP9AiSgpMT1bIarWbzjoWQXkvVkZfCUiG7rxw',
            consumer_secret: 'W9aivXpvSZCGYjEkiM47qqNV6YzAsARwSNFnxsXDPe6DKAExbX',
            token: '1a0NM9s3nKoMQZ25VbAMVJGYcM49QcJGMNWaU9QijYmRGtO6JX',
            token_secret: 'oIw26etrYQI90zu2DLmhTgDi9YiC1zVv67RdT3q64fsZjRWUbc'
        };
        //var blog = new tumblr.Blog('91girlblog.tumblr.com', oauth);

        // test
        async.series( [function(s_callback) {
            var count = arr.length;
            async.each(arr, function (item, callback) {

                //tumblr(item.txt + "</br><p><img src=\"" + item.url +"\"</p>", '91girlblog', null,  oauth,
                tumblr(item.txt, 'poster0001', item.url,  oauth,
                    function (err, respond) {
                        --count;
                        if (err) {
                            cf.log(err);
                            callback();
                        } else {
                            cf.log('new post:' + respond);
                            callback();
                        }

                        if( count == 0 ){
                            s_callback();
                        }
                    });

            } );
        }, function( s_callback ){
            s_callback();
        }], function( err, result ){
            post_call_back();
        } );

    };
    return m;
})(one_module);