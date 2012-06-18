(function($) {

  /**
   * 如果流覽器不支援String.trim，為他加上trim
   */
  if(typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, ''); 
    };
  }
  
  /**
   * 如果流覽器不支援window.console.log，為他加上空的console.log function必免錯誤
   */
  if (window.console === undefined) {
    window.console = {};
    window.console.log = function() {};
  }
  
  /**
   * jqeury ui sortable在firefox下有bug，如果sortable外部的element有 position:relative會造成scroll down後drag的item會往上跑
   * 加上以下這一段可以解決
   * 解決方式參考此篇文張 http://forum.jquery.com/topic/sortable-offset-when-element-is-dragged-and-page-scrolled-down-ff
   */
  var userAgent = navigator.userAgent.toLowerCase();
  if(userAgent.match(/firefox/)) {
    $(".ui-sortable").live( "sortstart", function (event, ui) {
      ui.helper.css('margin-top', $(window).scrollTop() );
    });
    $(".ui-sortable").live( "sortbeforestop", function (event, ui) {
      ui.helper.css('margin-top', 0 );
    });
  };

  /**
  // AJAX util ajax工具
  // AJAX.defaultParams 預設參數
  // AJAX.request(params) 發ajax request
  // AJAX.requestJSON(params) 發ajax request並取得json
  // AJAX.sync(params) 發出同步request，必需等待response回來才可繼續後面的動作
  // AJAX.syncJSON(params) 發出同步request，必需等待response回來才可繼續後面的動作，取得json
  */
  var AJAX = {
    defaultParams : {
      type : "POST",
      beforeSend: function(xhr) {
        xhr.setRequestHeader("Ajax-Call","true");
      }
    },
    // params = {
    //   url : ""
    //   data : {}
    //   form : jQuery()
    //   success : function() {}
    //   noblock : boolean
    //   其它請參考 $.ajax的參數
    // }
    request : function(params) {
      
      if (params.form == undefined || (params.form != undefined)) {
        
        if ($.isFunction($RS.requiredValidation)) {
          if (!$RS.requiredValidation(params.form)) {
            return;
          }
        }
        
        var allParams = {data : {}};
        
        if (!params.noblock) {
          ajaxBeforeLoadingCallback();
        }
        
        $.extend(allParams, this.defaultParams, params, {
          complete : function(data, textStatus) {
            
            if (!params.noblock) {
              ajaxAfterLoadingCallback();
            }
          }
        });
        
        if (params.form != undefined) {
          var formParams = formToJSON(params.form, {ignoreDisabled : params["ignoreDisabled"]});
          $.extend(allParams.data,formParams);
        }
        
        if (params.data != undefined) {
          $.extend(allParams.data,params.data);
        }
        
        return $.ajax(allParams);
      }
      
    },
    // params = {
    //   url : ""
    //   data : {}
    //   form : jQuery()
    //   success : function() {}
    //   noblock : boolean
    //   其它請參考 $.ajax的參數
    // }
    requestJSON : function(params) {
      
      params = $.extend({dataType:"json"},params);
      return this.request(params);
    },
    // params = {
    //   url : ""
    //   data : {}
    //   form : jQuery()
    //   success : function() {}
    //   noblock : boolean
    //   其它請參考 $.ajax的參數
    // }
    sync : function(params) {
      
      params = $.extend({async:false},params);
      return this.request(params);
    },
    // params = {
    //   url : ""
    //   data : {}
    //   form : jQuery()
    //   success : function() {}
    //   noblock : boolean
    //   其它請參考 $.ajax的參數
    // }
    syncJSON : function(params) {
      
      params = $.extend({dataType:"json",async:false},params);
      return this.request(params);
    }
  };
  
  
  /**
  // VIEW util ajax取得、更新畫面工具
  // View.load(target, params) ajax取得html後更新到target的內容
  */
  var VIEW = {
    beforeLoads : [], 
    // target : jQuery()
    // params : {
    //   參考 AJAX.request的參數
    // }
    addBeforeLoad : function(f) {
      
      this.beforeLoads.push(f);
    },
    load : function(target, params) {
      
      var self = this;
      params = $.extend({
        success : function() {}
      }, params);
      
      var success = params.success;
      
      $.extend(params, {
        dataType : "html",
        success : function(data) {
          
          var rs = $(data);
          $.each(self.beforeLoads, function(i, f) {
            
            if ($.isFunction(f)) {
              f(rs);
            }
          });
          target.html(rs);
          success(rs);
        }
      });
      
      AJAX.request(params);
    }  
  };
  
  /**
   * javascript 沒有implement sprintf。在此 implement
   */
  var sprintf = function() {
    
    var sprintfWrapper = {
     
      init : function () {
     
        if (typeof arguments == "undefined") { return null; }
        if (arguments.length < 1) { return null; }
        if (typeof arguments[0] != "string") { return null; }
        if (typeof RegExp == "undefined") { return null; }
     
        var string = arguments[0];
        var exp = new RegExp(/(%([%]|(\-)?(\+|\x20)?(0)?(\d+)?(\.(\d)?)?([bcdfosxX])))/g);
        var matches = new Array();
        var strings = new Array();
        var convCount = 0;
        var stringPosStart = 0;
        var stringPosEnd = 0;
        var matchPosEnd = 0;
        var newString = '';
        var match = null;
     
        while (match = exp.exec(string)) {
          if (match[9]) { convCount += 1; }
     
          stringPosStart = matchPosEnd;
          stringPosEnd = exp.lastIndex - match[0].length;
          strings[strings.length] = string.substring(stringPosStart, stringPosEnd);
     
          matchPosEnd = exp.lastIndex;
          matches[matches.length] = {
            match: match[0],
            left: match[3] ? true : false,
            sign: match[4] || '',
            pad: match[5] || ' ',
            min: match[6] || 0,
            precision: match[8],
            code: match[9] || '%',
            negative: parseInt(arguments[convCount]) < 0 ? true : false,
            argument: String(arguments[convCount])
          };
        }
        strings[strings.length] = string.substring(matchPosEnd);
     
        if (matches.length == 0) { return string; }
        if ((arguments.length - 1) < convCount) { return null; }
     
        var code = null;
        var match = null;
        var i = null;
     
        for (i=0; i<matches.length; i++) {
     
          if (matches[i].code == '%') { substitution = '%'; }
          else if (matches[i].code == 'b') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(2));
            substitution = sprintfWrapper.convert(matches[i], true);
          }
          else if (matches[i].code == 'c') {
            matches[i].argument = String(String.fromCharCode(parseInt(Math.abs(parseInt(matches[i].argument)))));
            substitution = sprintfWrapper.convert(matches[i], true);
          }
          else if (matches[i].code == 'd') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)));
            substitution = sprintfWrapper.convert(matches[i]);
          }
          else if (matches[i].code == 'f') {
            matches[i].argument = String(Math.abs(parseFloat(matches[i].argument)).toFixed(matches[i].precision ? matches[i].precision : 6));
            substitution = sprintfWrapper.convert(matches[i]);
          }
          else if (matches[i].code == 'o') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(8));
            substitution = sprintfWrapper.convert(matches[i]);
          }
          else if (matches[i].code == 's') {
            matches[i].argument = matches[i].argument.substring(0, matches[i].precision ? matches[i].precision : matches[i].argument.length);
            substitution = sprintfWrapper.convert(matches[i], true);
          }
          else if (matches[i].code == 'x') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
            substitution = sprintfWrapper.convert(matches[i]);
          }
          else if (matches[i].code == 'X') {
            matches[i].argument = String(Math.abs(parseInt(matches[i].argument)).toString(16));
            substitution = sprintfWrapper.convert(matches[i]).toUpperCase();
          }
          else {
            substitution = matches[i].match;
          }
     
          newString += strings[i];
          newString += substitution;
     
        }
        newString += strings[i];
     
        return newString;
     
      },
     
      convert : function(match, nosign){
        if (nosign) {
          match.sign = '';
        } else {
          match.sign = match.negative ? '-' : match.sign;
        }
        var l = match.min - match.argument.length + 1 - match.sign.length;
        var pad = new Array(l < 0 ? 0 : l).join(match.pad);
        if (!match.left) {
          if (match.pad == "0" || nosign) {
            return match.sign + pad + match.argument;
          } else {
            return pad + match.sign + match.argument;
          }
        } else {
          if (match.pad == "0" || nosign) {
            return match.sign + match.argument + pad.replace(/0/g, ' ');
          } else {
            return match.sign + match.argument + pad;
          }
        }
      }
    };
   
    return sprintfWrapper.init;  
  }();

  /**
   * 檢查是否為合法的日期object，或格式是否為正確的日期格式(yyyy-MM-dd 或 yyyy/MM/dd)
   */
  var isDateValid = function(date) {
    
    if (date instanceof Date) {
      return !isNaN(date);
    } else {
      return /\d{4}[\/-][01]?\d[\/-][0123]?\d/.test(date);
    }
  };
  
  /**
  // formToJSON 將 html包含的form元件值轉換為json
  // target : jQuery()
  // settings : {
  //   ignoreDisabled : boolean 是否忽略設為disabled的form element
  // }
  */
  var formToJSON = function(target, settings) {
    
    settings = $.extend({
      ignoreDisabled : false
    }, settings);
  
    var pattern = ":text,input:[type='hidden'],:password,textarea,select,:radio,:checkbox";
    
    var params = {};
    
    var namesObj = $(pattern, target).filter("[name]");
    
    if (settings.ignoreDisabled) {
      namesObj = namesObj.filter(":not([disabled])");
    }
  
    namesObj.each(function() {
  
      var element = $(this);
      var name = element.attr("name");
      var value = element.val();
  
      if (element.is(":checkbox")) {
        (params[name] === undefined? params[name] = []: undefined);
        if (element.is(":checked")) {
          params[name].push(value);
        }
      } else if (element.is("select[multiple]")) {
        (params[name] === undefined? params[name] = []: undefined);
        if (value !== null) {
          params[name] = params[name].concat(value);
        }
      } else if (element.is(":radio")) {
        if (element.is(":checked")) {
          params[name] = value;
        }
      } else {
  
        (params[name] === undefined? params[name] = "": 
          (typeof(params[name]) === "string"? params[name] = [params[name]]: undefined)
        );
        if ($.isArray(params[name])) {
          params[name].push(value);
        } else {
          params[name] = value;
        }
      }
    });
  
    return params;
  };
  
  /**
   * 限定$.datepicker日期區間
   */
  var dateRange = function(from, to) {
    
    var dates = from.add(to);
      
    dates.each(function(i) {
      
      var $input = $(this);
    
      var maxOrMinDate = (i == 0? "minDate":"maxDate");

      var instance = $input.data( "datepicker" );

      $input.datepicker("option", "onSelect", function(selectedDate) {
        
        dates.not($input).datepicker("option", maxOrMinDate, $.datepicker.parseDate(
            instance.settings.dateFormat ||
            $.datepicker._defaults.dateFormat,
            selectedDate, instance.settings ));
        $input.change();
      });
      
      dates.not($input).datepicker("option", maxOrMinDate, $.datepicker.parseDate(
          instance.settings.dateFormat ||
          $.datepicker._defaults.dateFormat,
          $input.val(), instance.settings ));
    });
  };

  /**
   * 自動完成
   * params : {
   *   url : required , String, action name
   *   data : not required, JSON, post參數
   *   value(item) : required, Function, 定義要放進input bux的內容。參數說明：item:response的list中被選取的object
   *   itemFormat(item) : required, Function, 查詢結果顯示格示，會影響到response回來的list中的每一個object。參數說明：item:response的list中的各個object
   *   minLength : required, int, 查詢發動的字串最小長度
   *   afterItemExists(item) : not required, Function, 取得資料放入input中的動作。參數說明：item:response的list中被選取的object
   *   afterItemNoExists() : not required, Function, 清空input的動作。參數說明：無參數 
   *   cleanValueWhenNoItemMatched : not required, boolean, 沒對應的item時是否要執行value清空。預設true
   *   html : not required, boolean, dropdownlist是否使用html格式，請搭配jquery.ui.autocomplete.html.js。參考：http://github.com/scottgonzalez/jquery-ui-extensions
   *   其他 $.autocomplete參數也可傳入，可參考jquery ui官網，參數會覆蓋原本程式中的設定，
   * }
   */
  var autocomplete = function(target, params) {

    if (target.size() == 0) {
      return;
    }
    
    var params = $.extend(true, {
      url : "",
      data : {
        keyword : function() {
          return target.val();
        }
      },
      resultHandle : function(results) {
        
        $.each(results, function(i, result) {
          result["autoLocaleName"] = (result.localName? result.localName : result.name);
        });
      },
      value : function() {},
      afterItemExists : function() {},
      afterItemNoExists : function() {},
      itemFormat : function() {},
      minLength : 0,
      cleanValueWhenNoItemMatched : true
    }, params);

    var url = params.url;
    var data = params.data;
    var resultHandle = params.resultHandle;
    var value = params.value;
    var afterItemExists = params.afterItemExists;
    var afterItemNoExists = params.afterItemNoExists;
    var itemFormat = params.itemFormat;
    var cleanValueWhenNoItemMatched = params.cleanValueWhenNoItemMatched;
    
    var alertEmpty = function() {
      
      var speed = 400;
      target.css({"background" : "none"});
      target.animate({
        "background-color" : "#FFA500"
      },speed);
      target.animate({
        "background-color" : "#ffffff"
      },speed);
      target.animate({
        "background-color" : "#FFA500"
      },speed);
      target.animate({
        "background-color" : "#ffffff"
      },speed, function() {
        target.css({"background" : ""});
      });

    };

    var par = $.extend(true, {

      source : function(request, response) {

        target.addClass("loading");
        AJAX.requestJSON({
          url : url,
          noblock : true,
          data : data,
          success : function(results) {
            resultHandle(results);
            var wrapResult = [];
            $.each(results, function(k, v) {
              wrapResult.push({
                "label" : itemFormat(v),
                "value" : v
              });
            });
            response(wrapResult);
            target.removeClass("loading");
          }
        });
      },
      html: true,
      focus : function(event, ui) {

        if (value !== null) {
          target.val(value(ui.item.value)); 
        }
        return false;
      },
      select : function(event, ui) {
        
        target.data("autocomplete")._trigger( "change", event, { item: ui.item } );
        return false;
      },
      change : function(event, ui) {

        if (!ui.item.value) {
          
          if (cleanValueWhenNoItemMatched) {
            target.val("");
            target.data( "autocomplete" ).term = "";
            alertEmpty();
          }
          afterItemNoExists();
        } else {
          if (value !== null) {
            target.val(value(ui.item.value));
          }
          afterItemExists(ui.item.value);
        }
        return false;
      },
    }, params);

    target.autocomplete(par);
    
    target.bind("keyup", function() {
      
      if (target.val().length == 0) {
        if (cleanValueWhenNoItemMatched) {
          alertEmpty();
        }
        afterItemNoExists();
      }
    });
    
    // 解決firefox 中文輸入法event的問題
    target.bind( "text.autocomplete", function(d) {
      target.trigger("keydown.autocomplete");
    });
    
    target.addClass("autoCompleteHint");
  };
  
  // 設定AJAX、VIEW util發出ajax call之前的callback
  var ajaxBeforeLoadingCallbackSetting = function(callback) {
    this.ajaxBeforeLoadingCallback = callback;
  };
  
  // 執行AJAX、VIEW util發出ajax call之前的callback
  var ajaxBeforeLoadingCallback = function() {
    if ($.isFunction(this.ajaxBeforeLoadingCallback)) {
      this.ajaxBeforeLoadingCallback();
    } else { // 預設顯示 loading的文字 overlay 
      if ($(".blockUI:first").size() == 0) {
        
        $.blockUI({
          message : "loading", // 加上這個空白內容才不會顯示預設文字
          overlayCSS : {background : "none", "z-index" : "2000"}
        });
      }
    }
  };

  // 設定AJAX、VIEW util發出ajax call之後的callback
  var ajaxAfterLoadingCallbackSetting = function(callback) {
    this.ajaxAfterLoadingCallback = callback;
  };
  
  // 執行AJAX、VIEW util發出ajax call之後的callback
  var ajaxAfterLoadingCallback = function() {
    if ($.isFunction(this.ajaxAfterLoadingCallback)) {
      this.ajaxAfterLoadingCallback();
    } else { // 預設關閉 loading的文字 overlay
      $.unblockUI();
    }
  };
  
  //document ready後(包含使用$CC.VIEW取得的畫面)，要預先執行的javascript，context是response回來的html
  var beforeLoad = function(context) {

    // empty
    
  };
  
  VIEW.addBeforeLoad(beforeLoad);

  $(function() {

    // 第一次使用傳統post取得的html要先執行一次beforeLoad
    beforeLoad($("body"));

    // 檢查blockUI plugin有沒有使用，沒有則須提示
    if (!$.isFunction($.blockUI)) {
      window.alert("jquery.blockUI.js not exists");
    }
  });
  
  window.$RS = {};
  window.$RS.AJAX = AJAX;
  window.$RS.VIEW = VIEW;
  window.$RS.sprintf = sprintf;
  window.$RS.isDateValid = isDateValid;
  window.$RS.formToJSON = formToJSON;
  window.$RS.dateRange = dateRange;
  window.$RS.autocomplete = autocomplete;
  
  //---- 外部設定 start
  // 設定AJAX、VIEW util發出ajax call之前的callback
  window.$RS.ajaxBeforeLoadingCallbackSetting = ajaxBeforeLoadingCallbackSetting;
  // 設定AJAX、VIEW util發出ajax call之後的callback
  window.$RS.ajaxAfterLoadingCallbackSetting = ajaxAfterLoadingCallbackSetting;
  //---- 外部設定 end

})(jQuery);
