var slider = new Array();// массив слайдеров

function slider_to(slider_id, num) {
    if (num < 0) {
        num = slider[slider_id]['count']-1;
    }
    if (num > slider[slider_id]['count']-1) {
        num = 0;
    }
    if (slider[slider_id]['current'] == num) {
    	return true;
    }
    slider[slider_id]['current'] = num;
    var new_scroll = slider[slider_id]['el_width'] * slider[slider_id]['current'];
    var new_height = $('#'+slider_id+' .elements .item'+num).outerHeight();
    $('#'+slider_id+' .static').stop().animate({scrollLeft:new_scroll, height:new_height}, 400);
    $('#'+slider_id+' .nav a').removeClass('active');
    $('#'+slider_id+' .nav a.nav'+num).addClass('active');

    if (slider_id == 'main_slider') {
    	/*var descr_height = $('#'+slider_id+' .descr .item'+num).outerHeight();
    	$('#'+slider_id+' .descr').animate({height:descr_height},400);*/
		$('#'+slider_id+' .descr .item.active').stop().animate({opacity:0}, 200, function(){
			$('#'+slider_id+' .descr .item').removeClass('active');
			$('#'+slider_id+' .descr .item'+num).stop().css({opacity:0}).addClass('active').animate({opacity:1}, 200);
		});
	}

	if (slider_id == 'journal_photos') {
    	var descr_height = $('#'+slider_id+' .descr .item'+num).outerHeight();
    	$('#'+slider_id+' .descr').animate({height:descr_height},400);

    	$('#journal_detail .photos .img_num .cur').text(slider[slider_id]['current']+1);
	}
}

function start_slider(slider_id) {
	slider[slider_id]['timer'] = setInterval('slider_to("'+slider_id+'", slider["'+slider_id+'"]["current"]+1)', slider[slider_id]['interval']);
}

function stop_slider(slider_id) {
	clearInterval(slider[slider_id]['timer']);
}

function slider_init(slider_id, interval) {

	var el = $('#'+slider_id);

	slider[slider_id] = new Array();
	slider[slider_id]['el_width'] = $('.static', el).innerWidth();
	slider[slider_id]['count'] = $('.elements .item', el).length;
	slider[slider_id]['current'] = 0;
	slider[slider_id]['timer'] = 0;
	slider[slider_id]['interval'] = interval;
	
    $('.elements .item', el).each(function (i, item) {
    	$(this).addClass('item'+i).css('width', slider[slider_id]['el_width']);
    	$('.nav', el).append('<a class="nav'+i+'"></a>');
    	$('.nav a.nav'+i, el).click(function(){
    		slider_to(slider_id, i);
    	});
    });
    $('.nav a.nav0', el).addClass('active');

    var item0_height = $('.elements .item0', el).outerHeight();
	$('.static',el).css('height', item0_height);

	$('a.prev', el).click(function(){
		slider_to(slider_id, slider[slider_id]['current']-1);
	});
	$('a.next', el).click(function(){
		slider_to(slider_id, slider[slider_id]['current']+1);
	});

	if (slider_id == 'main_slider') {
		var descr_height = 0;
		$('.descr .item', el).each(function (i, item) {
	    	$(this).addClass('item'+i);
	    	if (descr_height < $(this).outerHeight()) {
	    		descr_height = $(this).outerHeight();
	    	}
	    });
	    $('.descr .item0', el).addClass('active');
	    $('.descr', el).css({height:descr_height});
	}

	if (slider_id == 'journal_photos') {
		$('.img_num .all', el.parent()).text(slider[slider_id]['count']);
	}

	if (interval > 0) {
		$('#'+slider_id).mouseover(function(){
			stop_slider(slider_id);
	    });
	    $('#'+slider_id).mouseout(function(){
	        start_slider(slider_id);
	    });
        start_slider(slider_id);
	}
}