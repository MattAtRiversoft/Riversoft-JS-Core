(function($) {
  
  var self = this;
  
  // 攔截所有submit，必須檢查必填，檢查通過才可繼續進行submit
  $("form").live("submit", function(e) {
    
    var form = $(this);
    
    if (!requiredValidation(form)) {
      e.preventDefault();
    }
  });
  
  // 檢查日期格式，不正確則清空欄位
  $(":text[constraint~='date']")
  .live("change", function() {
      
    if ($(this).val() != "") {

      if (!$RS.isDateValid($(this).val())) {
        $(this).val("");
      }
    }
  });
  
  // 檢查數字格式，輸入值必須為正、負整數或小數或0
  $(":text[constraint~='number']")
  .live("keypress", function(event) {

    var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
    return event.ctrlKey || (chr < ' ' || /[\d\.-]/.test(chr));
  })
  .live("keyup", function() {
 
    if (!/^-[0-9]*(\.[0-9]*)?$|^[0-9]+(\.[0-9]*)?$/.test($(this).val()) || /^0\d+$/.test($(this).val())) {
      $(this).val(0);
      $(this).change();
      $(this).focus();
    }
  })
  .live("change", function() {
    
    if (!/^-?[0-9]+(.[0-9]+)?$/.test($(this).val()) || /^0\d+$/.test($(this).val())) {
      $(this).val(0);
      $(this).change();
    }
  });
  
  // 檢查時間格式，必須為00:00，如果只輸入數字則會自動補「:」，例如輸入1121會變為11:21
  $(":text[constraint~='time']")
  .live("blur", function() {

    var input = $(this).val();
    var hour = 0;
    var second = 0;
    var output = "";
    if (/^\d{1,4}$/.test(input)) {
      
      hour = $RS.sprintf("%02s",input.substr(0,2));
      second = $RS.sprintf("%02s",input.substr(2,2));
      output = hour + ":" + second;
    } else if (/^\d{0,2}:\d{0,2}$/.test(input)) {
      
      hour = $RS.sprintf("%02s",input.substr(0,input.indexOf(":")));
      second = $RS.sprintf("%02s",input.substr(input.indexOf(":") + 1));
      output = hour + ":" + second;
    }
    $(this).val(output);
  })
  .live("keyup", function() {
    
    var input = $(this).val();
    if (!/^\d{0,4}$/.test(input) && !/^\d{0,2}:\d{0,2}$/.test(input)) {
    
      $(this).val("00:00");
      this.select();
    }
  })
  .live("keypress", function(event) {

    var chr = String.fromCharCode(event.charCode == undefined ? event.keyCode : event.charCode);
    return event.ctrlKey || (chr < ' ' || /[\d\:]/.test(chr));
  })
  .live("change", function() {
    $(this).keyup();
  });
  
  // 輸入文字自動轉大寫
  $(":input[constraint~='upperCase']")
  .live("keyup", function() {

    var self = $(this);
    
    clearTimeout(self.data("timeoutObject"));
    self.data("timeoutObject", setTimeout(function() {
      
      var myValue = self.val();
      if (/[a-z]+/.test(myValue)) {
        self.val(myValue.toUpperCase());
      }
    }, 500));
  });
  
  // 文字方塊focus時自動全選
  $(":text:not([inputFormat~='date']), textarea").live("focus", function() {
    
    var self = $(this);
    clearTimeout(self.data("timeoutObject"));
    self.data("timeoutObject", setTimeout(function() {
      self.select();
    }, 1));
  });
  
  // 檢查constraint='required'必填欄位、textarea輸入字數是否超過maxlength設定的長度，如果是必填檢查不通過，會
  // 執行 requiredInvalidCallback()，若是長度檢查不通過，會執行textareaTooLongCallback()
  // requiredInvalidCallback，這兩個callback由外部傳入
  var requiredValidation = function(form) {
    
    var getUniqueId = (function() {
      var id=0;
      return function() {
        if (arguments[0]==0) id=0;
        return id++;
      };
    })();
    
    // 檢查textarea輸入文字長度是否超過maxlength
    var textareaTooLong = function(form) {
      
      var elements = form.find("textarea");
      
      var hasTooLong = false;
      var labelNames = [];
      var maxlengths = [];
      
      elements.each(function() {
        
        if ($(this).val().length > parseInt($(this).attr("maxlength"))) {
          hasTooLong = true;
          labelNames.push($(this).attr("labelName"));
          maxlengths.push($(this).attr("maxlength"));
        }
      });
      if (hasTooLong) {
        textareaTooLongCallback(labelNames, maxlengths);
      }
      return hasTooLong;
    };
    
    if (textareaTooLong(form)) {
      return false;
    }
    
    var elements = form.find("[constraint~='required']:not([ignoreValidation='true'])");

    var groups = {};
    
    elements.each(function() {
      
      var element = $(this);
      
      if (element.is(":radio, :checkbox")) {
        if (element.is("[name]")) {
          var name = element.attr("name");
          var g = groups[name];
          if (!g) {
            g = [];
            groups[name] = g;
          }
          g.push(element);
        }
      } else if (":text, :password, textarea, select") {
        var name = element.attr("name");
        if (!name) {
          name = "element_" + getUniqueId();
        }
        var g = groups[name];
        if (!g) {
          g = [];
          groups[name] = g;
        }
        g.push(element);
      }
    });
    
    var isValid = true;
    var labelNames = [];
    
    $.each(groups, function(k, v) {
      
      var notEmpty = false;
      
      $.each(v, function(k2, element) {
        
        if (element.is(":radio, :checkbox") && element.filter(":checked").size() > 0) {
          notEmpty = true;
        } else if (element.is("[constraint~='number']")) {
          if (element.val() != 0) {
            notEmpty = true;
          }
        } else if (element.is(":text, :password, textarea, select") && element.val() != "") {
          notEmpty = true;
        }
        
      });
      
      if (!notEmpty) {
        isValid = false;
        labelNames.push(v[0].attr("labelName"));
      }
      
    });
    if (!isValid) {
      requiredInvalidCallback(labelNames); 
    }
    return isValid;
  };
  
  // 設定必填檢查不通過時的callback
  var setRequiredInvalidCallback = function(callback) {
    self.requiredInvalidCallback = callback;
  };
  
  // 執行必填檢查不通過時的callback
  var requiredInvalidCallback = function(labelNames) {

    if ($.isFunction(self.requiredInvalidCallback)) {
      self.requiredInvalidCallback(labelNames);
    } else { // 預設 window.alert 提示
      
      var text = "";
      $.each(labelNames, function(k, labelName) {
        text = text + "「" + labelName + "」,";
      });
      
      window.alert(text + " is required !");
    }
  };
  
  // 設定textarea長度檢查不通過時的callback
  var setTextareaTooLongCallback = function(callback) {
    self.textareaTooLongCallback = callback;
  };
  
  // 執行textarea長度檢查不通過時的callback
  var textareaTooLongCallback = function(labelNames, maxlengths) {
    if ($.isFunction(self.textareaTooLongCallback)) {
      self.textareaTooLongCallback(labelNames, maxlengths);
    } else { // 預設 window.alert 提示
      
      var text = "";
      $.each(labelNames, function(i, labelName) {
        
        if (i > 0) {
          text = text + "\n";
        }
        text = text + "「" + labelName + "」 length is too long, max length is " + maxlengths[i] + "!";
      });
      
      window.alert(text);
    }
  };
  
  //document ready後(包含使用$CC.VIEW取得的畫面)，要預先執行的javascript，context是response回來的html
  var beforeLoad = function(context) {
    
    // 設定只可輸入英文
    $(":text[constraint~='date'], :text[constraint~='number'], :text[constraint~='time'], :text[constraint~='onlyEn']", context)
    .css({"ime-mode":"disabled"});
    
    // 設定日期
    $("[constraint~='date']", context).datepicker($.extend({
      dateFormat: 'yy/mm/dd',
      changeYear: true,
      changeMonth: true,
      yearRange: "-100:+100"
    }));

    $(":text[constraint~='number'][value='']", context).val(0);
  };
  
  $RS.VIEW.addBeforeLoad(beforeLoad);

  $(function() {

    // 第一次使用傳統post取得的html要先執行一次beforeLoad
    beforeLoad($("body"));
  });

  window.$RS.requiredValidation = requiredValidation;
  window.$RS.beforeLoad = beforeLoad;

  //---- 外部設定 start
  // 設定必填檢查不通過時的callback
  window.$RS.setRequiredInvalidCallback = setRequiredInvalidCallback;
  // 設定textarea長度檢查不通過時的callback
  window.$RS.setTextareaTooLongCallback = setTextareaTooLongCallback;
  //---- 外部設定 end

  // constraint attribute可用的 value : required, date, number, time, upperCase, onlyEn，可合併使用，以空格(' ')隔開
  // 例  constraint='upperCase onlyEn required'
  // labelName attribute : textarea及有constraint attribute的element一定要設定此attribute
  
}($));

