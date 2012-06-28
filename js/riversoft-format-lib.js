(function($) {
  
  // $().mask reference: http://digitalbush.com/projects/masked-input-plugin/
  
  //document ready後(包含使用$CC.VIEW取得的畫面)，要預先執行的javascript，context是response回來的html
  var beforeLoad = function(context) {

    $("[format]", context).each(function() {
      $(this).mask($(this).attr("format"));
    });
  };
  
  $RS.VIEW.addBeforeLoad(beforeLoad);

  $(function() {

    // 第一次使用傳統post取得的html要先執行一次beforeLoad
    beforeLoad($("body"));
    
    // 檢查jquery.maskedinput plugin有沒有使用，沒有則須提示
    if (!$.isFunction($().mask)) {
      window.alert("jquery.maskedinput*.js not exists");
    }
  });
  
}($));