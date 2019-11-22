/* Version Control */
/* v24, 24/05/2019 */

$(document).ajaxComplete(function() {
  if($(".radio-inline label>span").length == 0) { 
    $(".radio-inline label").prepend("<span><span></span></span>");
  }

  if($(".radio label>span").length == 0) { 
    $(".radio label").prepend("<span><span></span></span>");
  }

  if($(".previousPage").length > 0) {
    if($(".cell-footer .previousPage").length == 0) {
      $(".cell-footer").prepend("<div class=\"frLeft\"><div></div></div>");
      $(".previousPage").clone().appendTo(".frLeft div");
    }
  }

  if($(".lscommand").length > 0) {
    $(".lscommand input").wrap("<div class=\"lsaction\"></div>");
  }

  if($("#btnNextBottom").length > 0) {
    if($(".btnBottomWrapper #btnNextBottom").length == 0) {
      $("#btnNextBottom").wrap("<div class=\"btnBottomWrapper\"></div>");
    }
  }
});