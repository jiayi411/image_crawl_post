/**
 * Created by jiayi on 15/11/24.
 */

var cf = require('./common_functions.js');
var cd = require('./common_defines.js');
var request = require('request');
var HTMLParser = require('fast-html-parser');

var one_module = one_module || {};
module.exports = (function (m) {

    // parse the result
    m.parse = function( keyword, callback ){
        var original_keyword = keyword;
        keyword = cf.encodeURIComponent_GBK(keyword);
        var query = "https://www.google.ca/search?hl=zh-CN&site=imghp&tbm=isch&source=hp&biw=1440&bih=729"+'&q='+keyword+'&oq='+keyword;
        //query = "https://www.google.ca/search?hl=zh-CN&site=imghp&tbm=isch&source=hp&biw=1440&bih=729&q=sex&oq=sex";
        request({
            uri: query,
            method: "GET",
            headers: {
                'User-Agent': cd.user_agent
            }
        },function( err, response, body){
            var root = HTMLParser.parse( body );

            var arr_divs = [];
            var arr_url_txt = [];
            collect_all_divs( root, arr_divs );
            parse_element_to_url_txt_array( arr_url_txt, arr_divs );

            // add categories
            for( var key in arr_url_txt ){
                arr_url_txt[key].categories = original_keyword;
            }
            cf.log('it parsed out ' + arr_url_txt.length + ' url&txt');
            //console.log( body );
            //console.log( root );
            if( callback ){
                callback( arr_url_txt );
            }
        });
    };


// collect all element with the class name 'rg_di'
    function collect_all_divs( root, ret )
    {
        // if find 'rg_di' class, add to array and return
        if( root.classNames && root.classNames.length > 0 ){
            for( var key in root.classNames ){
                //cf.log( root.classNames[key] );
                if( root.classNames[key] == 'rg_di' ){
                    ret.push( root );
                    return;
                }
            }
        }
        if( root.childNodes && root.childNodes.length > 0 ){
            for( var key in root.childNodes ){
                collect_all_divs( root.childNodes[key], ret );
            }
        }
    }

// parse src url to image url
    function parse_source_url( source_url ){
        var url = source_url.substring( source_url.indexOf('imgurl=') + 7, source_url.indexOf('&amp;') );
        return url;
    }

// parse src text to image description
    function parse_source_text( source_text ){
        var text_obj = JSON.parse( source_text );
        return cf.stripIllegalChar(text_obj.s);
    }

// parse the element and separate it to url and text
    function parse_element_to_url_txt_array( url_txts, divs )
    {
        for( var i = 0 ; i < divs.length; ++ i ){
        //for( var i = 0 ; i < 10; ++ i ){
            var element = {};
            parse_element_to_url_txt( element, divs[i] );
            url_txts.push( element );
        }
    }
    function parse_element_to_url_txt( url_txt, element )
    {
        if( !element ){
            return;
        }

        url_txt = url_txt || {};
        // if url or txt
        var find = false;
        if( element.classNames && element.classNames.length > 0 ){
            for( var key in element.classNames ){
                if( element.classNames[key] == 'rg_l' ){
                    url_txt.unparsed_url = element.rawAttrs;
                    url_txt.url = parse_source_url( url_txt.unparsed_url );
                    find = true;
                    break;
                }
                if( element.classNames[key] == 'rg_meta' ){
                    // first child is the txt
                    if( element.childNodes && element.childNodes.length > 0 ){
                        url_txt.unparsed_txt = element.childNodes[0].rawText;
                        url_txt.txt = parse_source_text( url_txt.unparsed_txt );
                        find = true;
                        break;
                    }
                }
            }
        }
        if( find ){
            return;
        }
        if( element.childNodes && element.childNodes.length > 0 ){
            for( var key in element.childNodes ){
                parse_element_to_url_txt( url_txt, element.childNodes[key] );
            }
        }
    }

    return m;
})(one_module);