jQuery.expr[':'].step = function(node,index,meta){
  var $index = index;
  var $meta = meta[3].toString().split(',');
  var $step = parseInt($meta[0]);  
  var $start = ($meta.length > 1) ? $meta[1] : 0;
  if ($start != 0) $start -= 1;
  return ( ( ($index-$start) / $step ) == Math.floor( ( ($index-$start) / $step ) ) && ( ($index-$start) >= 0 ) );  
};

$(document).ready(function(){

	// blockquotes
	$('#content blockquote, #content p.blockquote').wrapInner('<div class="quote_inner"></div>');

	// search form
	$('#footer .search a.btn').click(function(){
		$('#footer .search form').submit();
	});

	// lightbox
	$('.lightbox').lightbox();

	// journal photos
	$('#journal .item .media .photos').click(function(){
		var json = $(this).attr('data-photos');
		var imgs = jQuery.parseJSON(json);
		$.lightbox(imgs);
		return false;
	});

});