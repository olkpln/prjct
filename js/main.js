$(function(){
    if ($('#currency').length) {
        fetch('https://www.cbr-xml-daily.ru/daily_json.js').then(response => response.json()).then(response => $('#currency').html(`${response['Valute']['USD']['Name']} - ${response['Valute']['USD']['Value']} рублей.`));
    }
    
    if ($('.table').length) {
        writeTable();
        $(document).on('click', '.quantity button', function(){
            let delta = 1;
            if (this.innerHTML == '-') {
                delta = -1;
            }
            let id = +$(this).parents('tr').find('.id').prop('id').slice(6);
            for (item of tovardata) {
                if (item.id == id) {
                    item.qty += delta;
                    if (item.qty <= 0) removeTovar(id);
                    break;
                }
            }
            writeTable();
        })
        $(document).on('click', '.delete button', function(){
            let id = +$(this).parents('tr').find('.id').prop('id').slice(6);
            if (removeTovar(id)) writeTable();
        })
        $('#date').focus(makeCalendar);
        $('.form button').click(function(){
            makeOrder();
        })
    }
    
    if ($('.gallery').length) {
        galstep = $('.smallimage').width(); // померили ширину блока с мелкой картинкой
        galgap = parseInt($('.gallery_rail').css('gap')); // померили промежуток между картинками
        /* подключаем кнопки */
        $('.g_left').click(function(){
            galSlide('left'); // если двигать блок некуда, кнопка не видна - и нажать на нее не получится. если по дизайну неактивная кнопка должна быть видна, тут лучше сделать проверку класса.
        });
        $('.g_right').click(function(){
            galSlide('right');
        });
        $('.smallimage img').click(function(){
            $('.bigimage img').prop('src', $(this).prop('src').split('min').join('big'));
        });
        $('.bigimage img').click(function(){
            lightbox(this);
        });
    }
    
    if ($('.catalog').length) {
        $('.accordeon, .accordeon .level2, .accordeon .level3').hide();
        $('.catmenu').click(function(){
            $(this).toggleClass('open');
            $('.accordeon').toggle('slow');
        })
        $('.accordeon .level1 > .menupoint').click(function(){
            if ($(this).parent().find('div').length && !$(this).parent().hasClass('open')) {
                $('.level1.open').removeClass('open').find('.level2, .level3').hide('slow');
                $(this).parent().addClass('open').find('.level2').show('slow');
                return false;
            }
        });
        $('.accordeon .level2 > .menupoint').click(function(){
            if ($(this).parent().find('div').length && !$(this).parent().hasClass('open')) {
                $(this).parent().parent().find('.level2.open').removeClass('open').find('.level3').hide('slow');
                $(this).parent().addClass('open').find('.level3').show('slow');
                return false;
            }
        });
    }
    
    if ($('.retaimer').length) {
        retimer();
        setInterval(retimer, 500);
    }
    
    if ($('.slider_block').length) {
        slideFlag['slider'] = false;
        slidePointer['slider'] = 0;
        $('.slider_block.curr').eq(1).css('left', $('.slider_block.curr').width() + 'px');
        setInterval(function(){
            sliderRun('slider', 'toleft');
        }, 4000);
        $('.slider .to_left').click(function(){
            sliderRun('slider', 'toleft');
        });
        $('.slider .to_right').click(function(){
            sliderRun('slider', 'toright');
        });
    }
    if ($('.slider2_block').length) {
        slideFlag['slider2'] = false;
        slidePointer['slider2'] = 0;
        setInterval(function(){
            sliderRun('slider2','toleft');
        }, 4000);
        $('.slider2 .to_left').click(function(){
            sliderRun('slider2','toleft');
        });
        $('.slider2 .to_right').click(function(){
            sliderRun('slider2','toright');
        });
    }
})