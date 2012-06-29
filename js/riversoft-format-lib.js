(function($) {

  var formaters = [];
  
  //document ready後(包含使用$CC.VIEW取得的畫面)，要預先執行的javascript，context是response回來的html
  var beforeLoad = function(context) {

    $("[format]", context).each(function() {
      
      var $element = $(this);
      $.each(formaters, function(k, formater) {
        if ($element.attr("format") == formater.key) {
          formater.formater($element);
        }
      });
    });
  };
  
  $RS.VIEW.addBeforeLoad(beforeLoad);

  $(function() {

    // 第一次使用傳統post取得的html要先執行一次beforeLoad
    beforeLoad($("body"));
    
  });
  
  $RS.addFormater = function(formater) {
    formaters.push(formater);
  };
  
}($));