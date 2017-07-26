/*
Пример вызова:
$('#slider_id').hromSlider();
$('#slider_id').hromSlider(options);

Настройки (указаны значения по умолчанию):
var options = {
	// время автоматического пролистивания (ms)
	interval: 0,
	// скорость листания (ms)
	speed: 400,
	// тип анимации, шпаргалка - http://easings.net/ru
	easing: 'linear',
	// при разной высоте слайдов, изменять или нет высоту при пролистывании (имеет смысл для page_count=1). Когда false - высота слайдера всегда как у самого большого элемента.
	slide_height: false,
	
	// кол-во видимых слайдов
	page_count: 1,
	// на сколько слайдов пролистывать (default = page_count)
	list_count: 1,
	// отступ между элементами (px)
	item_margin: 0,
	
	// пролистывание пальцем
	touch_slide: false,
	// кол-во секунд, которое слайдер не будет сам листаться после пролистывания пальцем
	sleep_after_touch: 0,
};

CSS:
1. Нужно указать ширину для .static (ширина слайдов - автоматически, высота .static - по высоте элементов)
2. Оформть кнопки вперед/назад (.prev, .next)
3. Оформть кнопки навигации (.nav)
*/

(function($) {

	// все функции в массив
	var methods = {
		// переход к следующему
		next_slide: function() {
			var $this = this;
			var data = $this.data('hromSlider');
			if (!data) {
				return false;
			}
			methods.slider_to.apply($this, [data.current + data.list_count]);
		},
		// переход к предыдущему
		prev_slide: function() {
			var $this = this;
			var data = $this.data('hromSlider');
			if (!data) {
				return false;
			}
			methods.slider_to.apply($this, [data.current - data.list_count]);
		},
		// переход к нужному элементу
		slider_to: function(num) {
			var $this = this;
			var data = this.data('hromSlider');
			if (!data) {
				return false;
			}
			// листание назад
		    if (num < 1-data.list_count) {
				// ушли ниже первого
		        num = data.num_last;
		    }
		    if (num == data.num_last - data.list_count &&
		    	data.num_last % data.list_count != 0) {
				// нужно листнуть меньше чем list_count
		    	num = data.num_last - (data.num_last % data.list_count);
		    }
		    // листание вперед
		    if (num > data.num_last) {
		    	if (data.current < data.num_last) {
		    		num = data.num_last;
		    	} else {
		    		num = 0;
		    	}
		    }
		    // обновляем данные
		    data.current = num;
		    $this.data('hromSlider', data);
		    // анимация
		    var new_scroll = (data.el_width + data.item_margin) * data.current;
			$('.elements', $this).stop().animate({left:-new_scroll}, data.speed, data.easing);
			if (data.slide_height) {
		    	var new_height = $('.elements .item'+num, $this).outerHeight();
				$('.static', $this).stop().animate({lheight:new_height}, data.speed);
		    }
		    // кнопки навигации
		    $('.nav a', $this).removeClass('active');
		    $('.nav a.nav'+num, $this).addClass('active');
		},
		// запуск автоматического пролистывания
		start_slider: function() {
			var $this = this;
			var data = this.data('hromSlider');
			if (!data) {
				return false;
			}
			if (data.timer) {
				clearInterval(data.timer);
			}
			data.timer = setInterval(function(){
				methods.next_slide.apply($this);
			}, data.interval);
		},
		// остановка автоматического пролистывания
		stop_slider: function() {
			var $this = this;
			var data = $this.data('hromSlider');
			if (!data) {
				return false;
			}
			if (data.timer) {
				clearInterval(data.timer);
			}
		},
		// обработчик события touchstart
		touchstart: function(e){
			var $this = $(this);
			var data = $this.data('hromSlider');
			if (!data) {
				return false;
			}
			var ev = e.originalEvent;
			// если одно нажатие
			if (ev.touches.length == 1 && ev.targetTouches.length == 1) {
				if (data.interval > 0) {
					// остановка пролистывания
					methods.stop_slider.apply($this);
				}
				// обновляем данные (позиция и время)
				var touch = ev.targetTouches[0];
				data.touch_x = touch.clientX;
				var m = new Date();
				data.touch_time = m.getTime();
				$this.data('hromSlider', data);
			}
		},
		// обработчик события touchmove
		touchmove: function(e){
			var $this = $(this);
			var data = $this.data('hromSlider');
			if (!data) {
				return false;
			}
			var ev = e.originalEvent;
			if (data.touch_x > 0) {
				var touch = ev.targetTouches[0];
				var m = new Date();
				// только для быстрых движений (300ms)
				if (m.getTime() < data.touch_time+300) {
					if (touch.clientX > data.touch_x) {
						methods.prev_slide.apply($this);
					} else {
						methods.next_slide.apply($this);
					}
				}
				// обнуляем данные
				data.touch_x = 0;
				data.touch_time = 0;
				// запуск слайдера (если нужно с таймаутом)
				if (data.interval > 0) {
					if (data.sleep_after_touch > 0) {
						if (data.touch_sleep_timer) {
							// очистка предыдущего
							clearTimeout(data.touch_sleep_timer);
						}
						// установка нового
						data.touch_sleep_timer = setTimeout(function(){
							methods.start_slider.apply($this);
						}, data.sleep_after_touch*1000);
					} else {
						methods.start_slider.apply($this);
					}
				}
				// обновляем данные
				$this.data('hromSlider', data);
			}
		},
		init: function(settings) { 

			var $this = this;

			var data = $this.data('hromSlider');
			if (data) {
				// init уже вызывался
				return false;
			}

			$this.addClass('hromSlider');

			var count = $('.elements .item', $this).length;
			var el_width = $('.static', $this).innerWidth();
			if (settings.page_count > 1) {
				el_width = el_width - settings.item_margin*(settings.page_count-1);
				el_width = Math.floor(el_width/settings.page_count);
			}

			// в data будет храниться вся информация
			var data = settings;
			data.el_width = el_width;
			data.count = count;
			data.current = 0;
			data.timer = 0;

			// настройки под палец
			if (data.touch_slide) {
				data.touch_x = 0;
				data.touch_time = 0;
				if (data.sleep_after_touch > 0) {
					data.touch_sleep_timer = 0;
				}
			}
			
			// css для .item
			// события и css для .nav
			// определение максимальной высоты .item
			data.num_last = data.count - data.page_count; // последний к которому можно листать
		    $('.elements .item', $this).each(function (i, item) {
		    	$(item).addClass('item'+i).css({'width':data.el_width, 'margin-right':data.item_margin+'px'});
		    	if ((i % data.list_count == 0 && i < data.num_last) || i==data.num_last) {
		    		$('.nav', $this).append('<a class="nav'+i+'"></a>');
		    		$('.nav a.nav'+i, $this).bind('click.hromSlider', function(){
			    		methods.slider_to.apply($this, [i]);
			    	});
		    	}
		    });
		    $('.nav a.nav0', $this).addClass('active');

		    // высота слайдера
		    if (data.slide_height) {
		    	var item0_height = $('.elements .item0', $this).outerHeight();
				$('.static', $this).css('height', item0_height);
		    } 

		    // кнопки вперед / назад
			$('a.prev', $this).bind('click.hromSlider', function(){
				methods.prev_slide.apply($this);
			});
			$('a.next', $this).bind('click.hromSlider', function(){
				methods.next_slide.apply($this);
			});

			// события под палец
			if (data.touch_slide) {
				$this.bind('touchstart.hromSlider', methods.touchstart);
				$this.bind('touchmove.hromSlider', methods.touchmove);
			}

			// записываем данные
			$this.data('hromSlider', data);

			// запускаем слайдер если нужно
			if (data.interval > 0) {
				$this.bind('mouseover.hromSlider', function(){
					methods.stop_slider.apply($this);
			    });
			    $this.bind('mouseout.hromSlider', function(){
			        methods.start_slider.apply($this);
			    });
		        methods.start_slider.apply($this);
			}

		}
	};

	$.fn.hromSlider = function(options) {

		var $this = this;
		
		if (!options) {
			options = {};
		}
		
		// разбираемся с настройками
		var settings = $.extend({
			interval: 0,
			speed: 400,
			easing: 'linear',
			slide_height: false,
			page_count: 1,
			list_count: 1,
			item_margin: 0,
			touch_slide: false,
			sleep_after_touch: 0
		}, options);
		if (options.list_count == null || settings.list_count > settings.page_count) {
			settings.list_count = settings.page_count;
		}
		if (settings.slide_height && settings.page_count != 1) {
			settings.slide_height = false;
		}
		
		// возвращаем исходный объект
		return $this.each(function() {
			// инициализация
			methods.init.apply($this, [settings]);
		});
		
	};

})(jQuery);