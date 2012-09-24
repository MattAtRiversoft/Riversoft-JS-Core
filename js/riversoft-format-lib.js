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

  $RS.addFormater = function(formater) {
    formaters.push(formater);
  };
  
}($));