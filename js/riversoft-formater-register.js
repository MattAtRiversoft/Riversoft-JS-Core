(function($) {
  
  // $().mask 必需引用 jquery.maskedinput-*.js
  // reference: http://digitalbush.com/projects/masked-input-plugin/
  
  // 要加入新的formater方法
  // $RS.addFormater({
  //   key : "",   <-- 對應format attribute的文字， element會自動依照attribute選擇使用的formater
  //   formater : function($element) { } <-- formater的implementation。$element為對應的要做format處理的JQuery Object
  // });
  
  // 自訂義mask規則 
  $.mask.definitions['A']='[A-Z]';
  
  $RS.addFormater({ // 身份證號碼格式
    key : "idNumber",
    formater : function($element) {
      
      $element.mask("A999999999");
    }
  });
  
  $RS.addFormater({ // 年月日 日期格式 - 可省略"日"
    key : "date",
    formater : function($element) {
      
      $element.mask("9999-99?-99");
    }
  });
  
  $RS.addFormater({ // 時間格式
    key : "time",
    formater : function($element) {
      
      $element.mask("99:99");
    }
  });
  
  
})($);
