/**
 * Created by jiayi on 14/11/14.
 */
var iconv = require('iconv-lite');

var cf = cf || {};
module.exports = ( function(m){

    // 直接log
//    m.log = console.log;

    // sprintf log
    m.log = function(){
        if( arguments.length > 1 )
        { console.log( ( m.sprintf.apply( m, arguments ) )); }
        else
        { console.log.apply(console, arguments ); }
    };

    // 通过指定日期返回之前/之后的日期
    // date: 指定日期，为空则是今天
    // offset: 偏移的天(+,-)
    m.getOffsetDate = function( date, offset_day ){
        date = date || new Date();
        return new Date( date.getTime() + offset_day * 24 * 3600 * 1000 );
    };

    // 中文转码为gkb
    m.encodeURIComponent_GBK = function(str)
    {
        if(str==null || typeof(str)=='undefined' || str=='')
            return '';

        var a = str.toString().split('');

        for(var i=0; i<a.length; i++) {
            var ai = a[i];
            if( (ai>='0' && ai<='9') || (ai>='A' && ai<='Z') || (ai>='a' && ai<='z') || ai==='.' || ai==='-' || ai==='_') continue;
            var b = iconv.encode(ai, 'gbk');
            var e = ['']; // 注意先放个空字符串，最保证前面有一个%
            for(var j = 0; j<b.length; j++)
                e.push( b.toString('hex', j, j+1).toUpperCase() );
            a[i] = e.join('%');
        }
        return a.join('');
    };

    // 删除string中的非法字符
    m.stripIllegalChar = function( str ){
        var chars = /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\uD800-\uDFFF\uFFFE-\uFFFF]/;
        var chr = str.match(chars);
        if( chr ){
            str = str.replace( chr, ' ' );
            m.stripIllegalChar( str );
        }// found
        return str;
    };

    // 获得星期n(0-6)
    var week_string = ['日','一','二','三','四','五','六'];
    m.getWeekDayString = function( day ){
        if( day >= 0 && day <= 6 ){
            return week_string[day];
        }
        return "";
    };

    // 获得yy-mm-dd
    Date.prototype.format = function(fmt)
    { //author: meizz
        var o = {
            "M+" : this.getMonth()+1,                 //月份
            "d+" : this.getDate(),                    //日
            "h+" : this.getHours(),                   //小时
            "m+" : this.getMinutes(),                 //分
            "s+" : this.getSeconds(),                 //秒
            "q+" : Math.floor((this.getMonth()+3)/3), //季度
            "S"  : this.getMilliseconds()             //毫秒
        };
        if(/(y+)/.test(fmt))
            fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
        for(var k in o)
            if(new RegExp("("+ k +")").test(fmt))
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        return fmt;
    };


    // 获得时间,转化为Date
    m.parseDate = function( date_string ){
        var yy = date_string.slice( 0, 4 );
        var mm = date_string.slice( 5, 7 ) - 1;
        var dd = date_string.slice( 8, 10 );
        var hh = 0, m = 0, ss = 0;
        if( date_string.length > 10 ){
            hh = date_string.slice( 11, 13 );
            m = date_string.slice( 14, 16 );
            ss = date_string.slice( 17, 19 );
        }
        return new Date( yy, mm, dd, hh, m, ss, 0 );
//        ym.log( date_string );
//        ym.log( date.toLocaleString() );
    };

    // sprintf
    m.sprintf = function() {
        var i = 0, a, f = arguments[i++], o = [], m, p, c, x, s = '';
        while (f) {
            if (m = /^[^\x25]+/.exec(f)) {
                o.push(m[0]);
            }
            else if (m = /^\x25{2}/.exec(f)) {
                o.push('%');
            }
            else if (m = /^\x25(?:(\d+)\$)?(\+)?(0|'[^$])?(-)?(\d+)?(?:\.(\d+))?([b-fosuxX])/.exec(f)) {
                if (((a = arguments[m[1] || i++]) == null) || (a == undefined)) {
                    throw('Too few arguments.');
                }
                if (/[^s]/.test(m[7]) && (typeof(a) != 'number')) {
                    throw('Expecting number but found ' + typeof(a));
                }
                switch (m[7]) {
                    case 'b':
                        a = a.toString(2);
                        break;
                    case 'c':
                        a = String.fromCharCode(a);
                        break;
                    case 'd':
                        a = parseInt(a);
                        break;
                    case 'e':
                        a = m[6] ? a.toExponential(m[6]) : a.toExponential();
                        break;
                    case 'f':
                        a = m[6] ? parseFloat(a).toFixed(m[6]) : parseFloat(a);
                        break;
                    case 'o':
                        a = a.toString(8);
                        break;
                    case 's':
                        a = ((a = String(a)) && m[6] ? a.substring(0, m[6]) : a);
                        break;
                    case 'u':
                        a = Math.abs(a);
                        break;
                    case 'x':
                        a = a.toString(16);
                        break;
                    case 'X':
                        a = a.toString(16).toUpperCase();
                        break;
                }
                a = (/[def]/.test(m[7]) && m[2] && a >= 0 ? '+' + a : a);
                c = m[3] ? m[3] == '0' ? '0' : m[3].charAt(1) : ' ';
                x = m[5] - String(a).length - s.length;
                p = m[5] ? str_repeat(c, x) : '';
                o.push(s + (m[4] ? a + p : p + a));
            }
            else {
                throw('Huh ?!');
            }
            f = f.substring(m[0].length);
        }
        return o.join('');
    };

    // referrer-killer
    m.ReferrerKiller = (function () {
        var URL_REDIRECTION = "https://www.google.com/url?q=", // You can use another service if you use https protocol no referrer will be sent.
            PUB = {},
            IE_GT_8 = (function () {
                /*- Detecting if it's IE greater than 8 -*/

                return 5 > 4;
            })();

        /**
         * Escapes double quotes in a string.
         *
         * @private
         * @param {string} str
         * @return {string}
         */
        function escapeDoubleQuotes(str) {
            return str.split('"').join('\\"');
        }

        /**
         * Given a html string returns an html node.
         *
         * @private
         * @param {string} html
         * @return {Node}
         */
        function htmlToNode(html) {
            var container = document.createElement('div');
            container.innerHTML = html;
            return container.firstChild;
        }

        /**
         * Converts object to html attributes string.
         *
         * @private
         * @param {object} obj
         * @return {string}
         */
        function objectToHtmlAttributes(obj) {
            var attributes = [],
                value;
            for (var name in obj) {
                value = obj[name];
                attributes.push(name + '="' + escapeDoubleQuotes(value) + '"');
            }
            return attributes.join(' ');
        }

        /**
         * It applies the hack to kill the referrer to some html.
         *
         * @public
         * @param {string} html.
         * @param {object} [iframeAttributes]
         * @return {string} html.
         */
        function htmlString(html, iframeAttributes) {
            var iframeAttributes  = iframeAttributes || {},
                defaultStyles = 'border:none; overflow:hidden; ',
                id;
            /*-- Setting default styles and letting the option to add more or overwrite them --*/
            if ('style' in iframeAttributes) {
                iframeAttributes.style =  defaultStyles + iframeAttributes.style;
            } else {
                iframeAttributes.style = defaultStyles;
            }
            id = '__referrer_killer_' + (new Date).getTime() + Math.floor(Math.random()*9999);
            /*-- Returning html with the hack wrapper --*/
            return '<iframe \
				style="border 1px solid #ff0000" \
				scrolling="no" \
				frameborder="no" \
				allowtransparency="true" ' +
                    /*-- Adding style attribute --*/
                objectToHtmlAttributes( iframeAttributes ) +
                'id="' + id + '" ' +
                '	src="javascript:\'\
                <!doctype html>\
                <html>\
                <head>\
                <meta charset=\\\'utf-8\\\'>\
                <style>*{margin:0;padding:0;border:0;}</style>\
                </head>' +
                    /*-- Function to adapt iframe's size to content's size --*/
                '<script>\
                     function resizeWindow() {\
                        var elems  = document.getElementsByTagName(\\\'*\\\'),\
                            width  = 0,\
                            height = 0,\
                            first  = document.body.firstChild,\
                            elem;\
                        if (first.offsetHeight && first.offsetWidth) {\
                            width = first.offsetWidth;\
                            height = first.offsetHeight;\
                        } else {\
                            for (var i in elems) {\
                                                elem = elems[i];\
                                                if (!elem.offsetWidth) {\
                                                    continue;\
                                                }\
                                                width  = Math.max(elem.offsetWidth, width);\
                                                height = Math.max(elem.offsetHeight, height);\
                            }\
                        }\
                        var ifr = parent.document.getElementById(\\\'' + id + '\\\');\
					ifr.height = height;\
					ifr.width  = width;\
				}\
			</script>' +
                '<body onload=\\\'resizeWindow()\\\'>\' + decodeURIComponent(\'' +
                    /*-- Content --*/
                encodeURIComponent(html) +
                '\') +\'</body></html>\'"></iframe>';
        }

        /*-- Public interface --*/

        /**
         * It creates a link without referrer.
         *
         * @public
         * @param {string} url
         * @param {string} innerHTML
         * @param {object} [anchorParams]
         * @param {object} [iframeAttributes]
         * @return {string} html
         */
        var linkHtml = PUB.linkHtml = function (url, innerHTML, anchorParams, iframeAttributes) {
            var html,
                urlRedirection = '';
            innerHTML = innerHTML || false;
            /*-- If there is no innerHTML use the url as innerHTML --*/
            if (!innerHTML) {
                innerHTML = url;
            }
            anchorParams = anchorParams || {};
            /*-- Making sure there is a target attribute and the value isn't '_self' --*/
            if (!('target' in anchorParams) || '_self' === anchorParams.target) {
                /*-- Converting _self to _top else it would open in the iframe container --*/
                anchorParams.target = '_top';
            }
            if (IE_GT_8) {
                urlRedirection = URL_REDIRECTION;
            }
            html = '<a rel="noreferrer" href="' + urlRedirection + escapeDoubleQuotes(url) + '" ' + objectToHtmlAttributes(anchorParams) + '>' + innerHTML + '</a>';
            return htmlString(html, iframeAttributes);
        };

        /**
         * It creates a link without referrer.
         *
         * @public
         * @param {String} url
         * @param {String} innerHTML
         * @param {Object} [anchorParams]
         * @param {object} [iframeAttributes]
         * @return {Node}
         */
        var linkNode = PUB.linkNode = function (url, innerHTML, anchorParams, iframeAttributes) {
            return htmlToNode(linkHtml(url, innerHTML, anchorParams, iframeAttributes));
        };

        /**
         * It displays an image without sending the referrer.
         *
         * @public
         * @param {String} url
         * @param {Object} [imgAttributesParam]
         * @return {String} html
         */
        var imageHtml = PUB.imageHtml = function (url, imgAttributesParam) {
            var imgAttributes = imgAttributesParam || {},
            /*-- Making sure this styles are applyed in the image but let the possibility to overwrite them --*/
                defaultStyles = 'border:none; margin: 0; padding: 0';
            if ('style' in imgAttributes) {
                imgAttributes.style = defaultStyles + imgAttributes.style;
            } else {
                imgAttributes.style = defaultStyles;
            }
            return htmlString('<img src="' + escapeDoubleQuotes(url) + '" ' + objectToHtmlAttributes(imgAttributes) + '/>');
        };

        /**
         * It displays an image without sending the referrer.
         *
         * @public
         * @param {string} url
         * @param {object} [imgParams]
         * @return {Node}
         */
        var imageNode = PUB.imageNode = function (url, imgParams) {
            return htmlToNode(imageHtml(url, imgParams));
        };

        /*-- Exposing the module interface --*/
        return PUB;
    })();

    return m;

})(cf);