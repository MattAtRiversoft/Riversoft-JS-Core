(function($) {

  var formaters = [];
  
  //document ready後(包含使用$RS.VIEW取得的畫面)，要預先執行的javascript，context是response回來的html
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

    // HTML的DOM完成後，要先執行一次beforeLoad
    beforeLoad($("body"));
    
  });
  
  $RS.addFormater = function(formater) {
    formaters.push(formater);
  };
  
}($));