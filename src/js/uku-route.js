function RouteController(containerId){
    var pageStack = {};
    var currentPage = undefined;
    var defaultPage = undefined;
    var otherwisePage = undefined;
    var self = this;
    var container = "#"+containerId;
    var anchors = {};
    var pageCache = {};

    var registerRoute = function(key,path,isDefault){
        var hash = window.location.hash;
        var page = {"key":key,"path":path};
        if(isDefault){
            defaultPage = page;
        }
        pageStack[key] = page;
    }

    this.default = function(key,path){
        registerRoute(key,path,true);
        return this;
    };
    this.when = function(key,path){
        registerRoute(key,path,false);
        return this;
    };
    this.otherwise = function(path){
        otherwisePage = {"path":path,"isDefault":false};
        pageStack["otherwise"] = otherwisePage;
        return this;
    };
    this.goto = function(key){
        var page = pageStack[key];
        if(page){
            if(page !== currentPage){
                if(pageCache[key]){
                     var oldPageKey = currentPage.key;
                     if(pageCache[oldPageKey]){
                         pageCache[oldPageKey].hide();
                     }else{
                         cacheOldPage();
                     }
                     pageCache[key].show();
                     currentPage = page;
                }else{             
                    cacheOldPage();
                    $.get(page.path,function(html){
                        $(container).append(html);
                        currentPage = page;
                    });
                }
            }    
        }else if(anchors[key] === undefined){
            this.goto("otherwise");
        }
        
        function cacheOldPage(){
            $(container).children().each(function(){
                if($(this).is(":visible")){
                    $(this).hide();
                    var oldPageKey = currentPage.key;
                    pageCache[oldPageKey] = $(this);
                    return false;
                }                    
            });
        }
    };
    this.work = function(){
        var hash = window.location.hash;
        $("a[name]").each(function(){
            var anchor = $(this).attr("name");
            anchors["#"+anchor] = anchor;
        });
        var self = this;
        window.onhashchange = function(e){
            hash = window.location.hash;
            self.goto(hash);
        }
        if(hash){
            this.goto(hash);
        }else if(defaultPage){
            this.goto(defaultPage.key);
        }
    };
}