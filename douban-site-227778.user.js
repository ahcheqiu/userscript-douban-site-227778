// ==UserScript==
// @name        douban-site-227778
// @namespace   d227778
// @description 豆瓣深圳租房团增强脚本
// @include     http://site.douban.com/227778/*
// @version     1
// @grant       none
// ==/UserScript==

var d227778 = function(jQuery){
    //一些常量
    var namespace = 'd227778';
    var UI = '\
        <div style="float:right;position:fixed;top:0px;right:0px;background-color:white;">\
            <span><input style="width:200px;" id="'+namespace+'-filter" type="text" placeholder="\uff08\u8f93\u5165\u5173\u952e\u5b57\uff0c\u591a\u4e2a\u7528\u005f\u9694\u5f00\uff09"><button>\u8fc7\u6ee4</button></span><br/>\
            <span><input style="width:200px;" id="'+namespace+'-exclude" type="text" placeholder="\uff08\u8f93\u5165\u5173\u952e\u5b57\uff0c\u591a\u4e2a\u7528\u005f\u9694\u5f00\uff09"><button>\u5254\u9664</button></span><br/>\
            <span><input type="checkbox" data="remove" id="'+namespace+'-remove-unrelated" autocomplete="off"><label for="'+namespace+'-remove-unrelated">\u65e0\u5173\u7684\u4e1c\u897f\u53ef\u4ee5\u5220</label></span><br/>\
            <span><input type="checkbox" data="important" id="'+namespace+'-important-first" autocomplete="off"><label for="'+namespace+'-important-first">\u91cd\u8981\u7684\u4e1c\u897f\u8981\u7a81\u51fa</label></span><br/>\
        </div>';
    var item_remove = namespace + '_remove_check';
    var item_important = namespace + '_important_check';
    var item_filter = namespace + '_filter';

    //jquery变量
    var $UI,$remove,$removeThing,$important,$postTable,$filter;

    //主函数
    var init = function(jq) {

        if(jq != undefined){
            var $ = jq;
        }

        //jquery变量赋值
        $UI = $(UI);
        $('#227778').append($UI);
        $remove = $('#'+namespace+'-remove-unrelated');
        $removeThing = $('.bg,#header,#footer,.extra,.db-ad,#db-followers,#db-similar-sites,#div_archives,#sp-rec-room');
        $important = $('#'+namespace+'-important-first');
        $postTable = $('.list-b');
        $filter = $('#'+namespace+'-filter');
        
        //UI绑定事件
        $UI
            //checkbox事件
            .bind('click','[type="checkbox"]',function(e){
                var $e = $(e.srcElemnt||e.target);
                var check = $e.attr('checked');
                var data = $e.attr('data');
                var item;
                switch(data) {
                    case 'remove':
                        removeChange(check);
                        item = item_remove;
                        break;
                    case 'important':
                        importantChange(check);
                        item = item_important;
                        break;
                    default:
                        break;
                }
                //记住选择
                try{
                    if( check != true ) check = false;
                    localStorage.setItem(item,check);
                } catch(e){}
            })
            //过滤事件
            .bind('click','button',function(e){
                var t = e.srcElemnt||e.target;
                if( t.tagName == 'BUTTON' ) {
                    var filter = $filter.attr('value');
                    filterChange(filter);
                    //记住选择
                    try{
                        localStorage.setItem(item_filter,filter);
                    } catch(e) {}
                }
            });
        
        //初始化UI和从本地储存读取设置
        try{
            var optionRemove = localStorage.getItem(item_remove);
            if( optionRemove == 'true' ) {
                $remove.attr('checked','checked');
                removeChange(true);
            } else {
                removeChange(false);
            }
            var optionImportant = localStorage.getItem(item_important);
            if( optionImportant == 'true' ) {
                $important.attr('checked','checked');
                importantChange(true);
            } else {
                importantChange(false);
            }

            var optionFilter = localStorage.getItem(item_filter);
            if( optionFilter != null && Object.prototype.toString.call(optionFilter) === "[object String]" ) {
                $filter.attr('value',optionFilter);
                filterChange(optionFilter)
            } else {
                filterChange('');
            }
        } catch(e) {}

    }

    //修改过滤设置
    var filterChange = function(filter) {
        $postTable.find('tr').show();
        if($.trim(filter) != ''){
            var filters = filter.split(' ');
            for( var x in filters ) {
                filters[x] = '.*'+filters[x]+'.*';
            }
            var reg = new RegExp(filters.join('|'));
            $postTable.find('tr').each(function(index,elem){
                var $e = $(elem);
                var $t = $e.children(':eq(0)').children('a');
                if( !reg.test($t.attr('title')) ) {
                    $e.hide();
                }
            });
        }
    }
    
    //移除无关信息
    var removeChange = function(checked) {
        if( checked == true ) {
            $removeThing.hide();
            $('#content').attr('style','padding-top:50px;');
        } else {
            $removeThing.show();
            $('#content').removeAttr('style');
        }
    }
    
    //显示重要信息
    var importantChange = function(checked) {
        if( checked == true ) {
            $postTable.attr('style','font-size:20px;')
                .find('tr').each(function(index,elem){
                    var $e = $(elem);
                    $e.children(':eq(1),:eq(2)').hide();
                    if( index != 0 ) {
                        var $t = $e.children(':eq(0)').children('a');
                        var text = $t.text();
                        $t.text($t.attr('title')).attr('title-true',text);
                    }
                });
        } else {
            $postTable.removeAttr('style')
                .find('tr').each(function(index,elem){
                    var $e = $(elem);
                    $e.children(':eq(1),:eq(2)').show();
                    if( index != 0 ) {
                        var $t = $e.children(':eq(0)').children('a');
                        $t.text($t.attr('title-true'));
                    }
                });
        }
    }
    
    init(jQuery);
};

//获取jquery对象
try{
    //firefox安装greaseMonkey后$可以直接获取
    $ == undefined;
    d227778($);
} catch(e) {
    //chrome需要额外加载，豆瓣使用的是1.4.4，保持兼容使用新浪CDN的1.4.4
    var script = document.createElement("script");
    script.setAttribute("src", "http://lib.sinaapp.com/js/jquery/1.4.4/jquery.min.js");
    script.addEventListener('load', function() {
        var script = document.createElement("script");
        script.textContent = "window.jQ=jQuery.noConflict(true);("+d227778.toString()+")(jQ);";
        document.body.appendChild(script);
    }, false);
    document.body.appendChild(script);
}