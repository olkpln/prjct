let slideFlag = {};
let slidePointer = {};
let ajaxFlag = false;
let gapFlag = false; // флаг нужен для блокировки новых запусков функции во время, когда она уже запущена
let galstep, galgap; // объявляем переменные глобально, чтобы видеть их как из функции, так и вне ее
let tovardata = [
    {
        id: 1,
        qty: 1,
        name: 'Билеты на концерт',
        image: 'anons.jpg',
        price: 600,
    },
];


function makeOrder() {
    if (ajaxFlag) return;
    ajaxFlag = true;
    let formdata = {};
    // собираем данные из tovardata и полей формы
    formdata.zakaz = tovardata;
    formdata.name = $('#name').val();
    formdata.phone = $('#phone').val();
    formdata.mail = $('#mail').val();
    formdata.comment = $('#comment').val();
    formdata.date = $('#date').val();
    // проверяем данные на правильность заполнения. обязательные данные - name, date и phone или mail. в tovardata должен быть хотя бы один элемент (товар).
    if (!formdata.name || !formdata.date || (!formdata.phone && !formdata.mail)) {
        // если требования не выполнены, заканчиваем работу
        alert('Не заполнены обязательные поля!');
        ajaxFlag = false;
        return;
    } else if (!formdata.zakaz.length) {
        alert('Ваша корзина пуста!');
        ajaxFlag = false;
        return;
    }
    $.ajax({
        url: $('.form form').prop('action'),
        method: $('.form form').prop('method'),
        data: formdata,
        success: function(data) {
            // оповещение пользователя о приеме заказа
            console.log(data);
            // очищаем корзину
            tovardata = [];
            // отрисовываем пустую корзину
            writeTable();
            // добавляем в страницу сведения о заказе
            $('.empty p').html(`Оплата произведена! Чек поступит на эл.почту и в виде ссылки по смс. Назовите этот код при входе для получения билета - ${data.id}.`);
            ajaxFlag = false;
        },
        error: function(error) {
            console.log(error);
            ajaxFlag = false;
        }
    });
}
function makeCalendar() {
    let today = $('#date').val().split('-');
    if (today.length < 3) {
        today = new Date();
    } else {
        today = new Date(today[2], +today[1] - 1, today[0]);
    }
    let curMonth = today.getMonth();
    let curYear = today.getFullYear();
    $('body').append('<div class="screen"><div id="calendar"></div></div>');
    $('.screen').click(function(e){
        if (e.target == document.querySelector('.screen')) {
            $('.screen').remove();
        }
    });
    makeCalendarTable(curMonth, curYear);
    $('.screen').addClass('active');
    $('#date').trigger('blur');
}
function makeCalendarTable(month, year) {
    const russMonth = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь',];
    while (month < 0) {
        month += 12;
        year -= 1;
    }
    while (month > 11) {
        month -= 12;
        year += 1;
    }
    let firstday = new Date(year, month);
    let prevdays = ((firstday.getDay() + 6) % 7);
    let lastday = new Date(year, month + 1, 0);
    let monthdays = lastday.getDate();
    let weeks = Math.ceil((prevdays + monthdays) / 7);
    let hlpstr = '';
    hlpstr += '<div class="dp_header"><span class="next">></span><span class="bignext">>></span><span class="prev"><</span><span class="bigprev"><<</span><b>' + russMonth[month] + ' ' + year + '</b></div><div class="dp_grid"><span class="headday">Пн</span><span class="headday">Вт</span><span class="headday">Ср</span><span class="headday">Чт</span><span class="headday">Пт</span><span class="headday holiday">Сб</span><span class="headday holiday">Вс</span>';
    for (let i = 0; i < weeks * 7; i++) {
        if (i < prevdays) {
            hlpstr += '<span class="empty"></span>';
        } else if (i - prevdays < monthdays) {
            let getdate = addChar(i - prevdays + 1, 2) + '-' + addChar(month + 1, 2) + '-' + year;
            let curdate = $('#date').val();
            if (curdate.length < 10) {
                curdate = new Date();
                curdate = addChar(curdate.getDate(), 2) + '-' + addChar(curdate.getMonth() + 1, 2) + '-' + curdate.getFullYear();
            }
            hlpstr += '<span class="getter';
            if ((i % 7 == 5) || (i % 7 == 6)) hlpstr += ' holiday';
            if (getdate == curdate) hlpstr += ' today';
            hlpstr += '" data-get="' + getdate + '">' + (i - prevdays + 1) + '</span>';
        } else {
            hlpstr += '<span class="empty"></span>';
        } 
    }
    hlpstr += '</div>';
    $('#calendar').html(hlpstr);
    $('.prev').click(function(){
        makeCalendarTable(month - 1, year);
    })
    $('.next').click(function(){
        makeCalendarTable(month + 1, year);
    })
    $('.bigprev').click(function(){
        makeCalendarTable(month, year - 1);
    })
    $('.bignext').click(function(){
        makeCalendarTable(month, year + 1);
    })
    $('.getter').click(function(){
        $('#date').val(this.dataset.get);
        $('.screen').remove();
    });
}
function removeTovar(id) {
    for (let i = 0; i < tovardata.length; i++) {
        if (tovardata[i].id == id) {
            tovardata.splice(i, 1);
            return true;
        }
    }
    return false;
}
function writeTable() {
    // проверяем длину tovardata. если там пусто, удаляем .table и .form, добавляем .empty с текстом "Ваша корзина пуста".
    if (!tovardata.length) {
        $('.table, .form').remove();
        $('main').append('<section class="empty"><div class="container"><p>Ваша корзина пуста!</p></div></section>');
        return;
    }
    let tab = $('.table table');
    let str = `<tr>
    <th class="id">№</th>
    <th class="name">Наименование</th>
    <th class="price">Цена</th>
    <th class="quantity">Количество</th>
    <th class="summa">Сумма</th>
    <th class="delete"></th>
</tr>`;
    for (item of tovardata) {
        str += `<tr>
    <td class="id" id="tovar_${item.id}"></td>
    <td class="name">${item.name}</td>
    <td class="price">${item.price}</td>
    <td class="quantity">
        <div class="inner">
            <button type="button">-</button>
            <span class="number">${item.qty}</span>
            <button type="button">+</button>
        </div>
    </td>
    <td class="summa">${item.price * item.qty}</td>
    <td class="delete"><button type="button">+</button></td>
</tr>`;
    }
    tab.html(str);
    for (i = 1; i < tab.find('.id').length; i++) {
        tab.find('.id').eq(i).html(i);
    }
    let sum = 0;
    tab.find('td.summa').each(function(){
        sum += +$(this).html();
    })
    tab.append(`<tr><th colspan="2"></th><th colspan="2">Итого:</th><th colspan="2" class="itog">${sum}</th></tr>`);
}
function lightbox(aim){
    let src = $(aim).prop('src').split('big').join('max');
    let w = document.documentElement.clientWidth - 200; // отступ от края и паддинг по 50 с каждой стороны
    let h = document.documentElement.clientHeight - 200; // отступ от края и паддинг по 50 с каждой стороны
    let sides = aim.clientWidth / aim.clientHeight; // соотношение сторон картинки
    if (w > sides * h) { // если ширина больше, чем нужна по соотношению сторон, уменьшаем ширину
        w = sides * h;
    } else if (w < sides * h) { // если высота больше, чем нужна по соотношению сторон, уменьшаем высоту
        h = w / sides;
    }
    // и теперь у нас максимальные возможные ширина и высота при нужном соотношении сторон
    let leftfix = w / 2 + 50; // значение поправки для положения лайтбокса по центру экрана
    let hlpstr = '<div class="screen"><div class="lightbox" style="margin-left:-' + leftfix + 'px;"><button type="button">+</button><img src="' + src + '" style="width:' + w + 'px;height:' + h + 'px;"></div></div>';
    document.body.insertAdjacentHTML('beforeend', hlpstr);
    $('.screen').click(function(e){
        if ((e.target == document.querySelector('.screen')) || (e.target == document.querySelector('.screen button'))) {
            $('.screen').removeClass('active');
            setTimeout(function(){$('.screen').remove()}, 1000);
        }
    });
    setTimeout(function(){$('.screen').addClass('active')}, 500);
}
function galSlide(direction) {
    if (gapFlag) return; // если эта функция сейчас работает, не будем ей мешать
    gapFlag = true; // поднимаем флаг блокировки - теперь новые вызовы функции не будут исполняться
    let hlpstr = parseInt($('.gallery_rail').css('left')); // определили текущее положение блока
    if (direction == 'left') { // вычисляем новое положение с учетом направления движения
        hlpstr -= galstep;
        hlpstr -= galgap;
    } else {
        hlpstr += galstep;
        hlpstr += galgap;
    }
    $('.gallery_rail').animate({ // плавно перемещаем блок
        left: hlpstr
    }, function(){ // затем проверяем, должны ли работать кнопки в новом положении
    // такую же проверку можно поставить в $(function(){}), если у нас может быть на странице разное число картинок.
        if ($('.gallery_window').width() - $('.gallery_rail').width() >= parseInt(getComputedStyle($('.gallery_rail')[0]).left)) {
            $('.g_left').removeClass('active');
        } else {
            $('.g_left').addClass('active');
        }
        if (parseInt($('.gallery_rail').css('left')) >= 0) {
            $('.g_right').removeClass('active');
        } else {
            $('.g_right').addClass('active');
        }
        gapFlag = false; // опускаем флаг - наш вызов отработал, можно делать новые вызовы
    });
}
function sliderRun(slideclass, direction) {
    if (slideFlag[slideclass]) return;
    slideFlag[slideclass] = true;
    let width = $('.' + slideclass + '_block.curr').width();
    let next;
    let prev;
    if (direction == 'toright') {
        next = slidePointer[slideclass] - 1;
        prev = slidePointer[slideclass] + $('.' + slideclass + '_block.curr').length - 1;
        slidePointer[slideclass]--;
        if (slidePointer[slideclass] < 0) slidePointer[slideclass] += $('.' + slideclass + '_block').length;
        if (next < 0) next += $('.' + slideclass + '_block').length;
        if (prev > $('.' + slideclass + '_block').length - 1) prev -= $('.' + slideclass + '_block').length;
        $('.' + slideclass + '_block').eq(next).css('left', -width + 'px').addClass('curr');
        $('.' + slideclass + '_block').eq(prev).addClass('eliminate');
        //$('.' + slideclass + ' .points span').eq(next).addClass('active');
        next = '+=' + width;
    } else {
        next = slidePointer[slideclass] + $('.' + slideclass + '_block.curr').length;
        prev = slidePointer[slideclass];
        slidePointer[slideclass]++;
        if (slidePointer[slideclass] > $('.' + slideclass + '_block').length - 1) slidePointer[slideclass] -= $('.' + slideclass + '_block').length;
        if (next > $('.' + slideclass + '_block').length - 1) next -= $('.' + slideclass + '_block').length;
        $('.' + slideclass + '_block').eq(next).css('left', (width * $('.' + slideclass + '_block.curr').length) + 'px').addClass('curr');
        $('.' + slideclass + '_block').eq(prev).addClass('eliminate');
        //$('.' + slideclass + ' .points span').eq(next).addClass('active');
        next = '-=' + width;
    }
    //$('.' + slideclass + ' .points span').eq(hlp).removeClass('active');
    $('.' + slideclass + '_block.curr').animate({left: next}, 2000, function() {
        $('.' + slideclass + '_block.eliminate').removeClass('curr').removeClass('eliminate');
        slideFlag[slideclass] = false;
    });
}
function retimer() {
    let limit = new Date($('.retaimer').data('fordate'));
    let now = new Date();
    let delta = Math.floor((limit.getTime() - now.getTime()) / 1000);
    if (delta < 0) delta = 0;
    let sec = delta % 60;
    $('.retaimer .num')[3].innerHTML = `${addChar(sec)}<span class="subnum">${multiple(sec, ['секунда', 'секунды', 'секунд'])}</span>`;
    delta = Math.floor(delta / 60);
    let minute = delta % 60;
    $('.retaimer .num')[2].innerHTML = `${addChar(minute)}<span class="subnum">${multiple(minute, ['минута', 'минуты', 'минут'])}</span>`;
    delta = Math.floor(delta / 60);
    let hour = delta % 24;
    $('.retaimer .num')[1].innerHTML = `${addChar(hour)}<span class="subnum">${multiple(hour, ['час', 'часа', 'часов'])}</span>`;
    delta = Math.floor(delta / 24);
    $('.retaimer .num')[0].innerHTML = `${delta}<span class="subnum">${multiple(delta, ['день', 'дня', 'дней'])}</span>`;
}
function addChar(c) {
    c += '';
    if (c.length < 2) {
        c = '0' + c;
    }
    return c;
}
function multiple(num, words) {
    num = num % 100;
    if (Math.floor(num / 10) != 1) {
        if (num % 10 == 1) {
            return words[0];
        } else if ((num % 10 > 1) && (num % 10 < 5)) {
            return words[1];
        }
    }
    return words[2];
}