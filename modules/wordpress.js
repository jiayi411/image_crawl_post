/**
 * Created by jiayi on 15/11/24.
 */
var wordpress = require( "wordpress" );
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
        var wordpress_client = wordpress.createClient({
            url: "https://95girlblog.wordpress.com",
            username: "93girl",
            password: "99jiayi411"
        });

        // test
        async.series( [function(s_callback) {
            var count = arr.length;
            async.each(arr, function (item, callback) {
                //var html = cf.ReferrerKiller.imageHtml( item.url );
                wordpress_client.newPost({
                    title: item.txt,
                    content: "<img src=\"" + item.url + "\"  alt=\"" + item.txt + "\" />",
                    status: "publish",
                    categories: item.categories,
                    tags: item.categories

                }, function (err, id) {
                    --count;
                    if (err) {
                        cf.log(err);
                        callback();
                    } else {
                        cf.log('new post:' + id);
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