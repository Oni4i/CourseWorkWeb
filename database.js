//Редирект страницы, нужен для авторизации
redirect();
let db = openDatabase('StudentShipilovIE6618', '0.1', 'StudentShipilovIE6618', 200000);
if (!db) {
    alert('Can\'t connect to db');
}

//Создаю таблицы, если запрос не выополняется
db.transaction(function (tx) {
    tx.executeSql("SELECT COUNT(*) FROM USERS", [], function (result) {
    }, function (tx, error) {
        //Таблица USERS - хранит данные о пользователе
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `USERS` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `first_name` VARCHAR(200) NOT NULL,\n" +
            "  `last_name` VARCHAR(200) NOT NULL,\n" +
            "  `gender` VARCHAR(20) NOT NULL,\n" +
            "  `age` INTEGER NOT NULL,\n" +
            "  `email` VARCHAR(200) NOT NULL,\n" +
            "  `login` VARCHAR(200) NOT NULL,\n" +
            "  `password` VARCHAR(200) NOT NULL\n )"
        );
        //Таблица PARTNERS - хранит данные о партнёрах
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `PARTNERS` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `name` VARCHAR(200) NOT NULL,\n" +
            "  `email` VARCHAR(200) NOT NULL,\n" +
            "  `phone` VARCHAR(15) NOT NULL,\n" +
            "  `site` VARCHAR(255) NOT NULL\n )"
        );
        //Таблица ORDERS - хранит данные о заказах
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `ORDERS` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `from` VARCHAR(200) NOT NULL,\n" +
            "  `to` VARCHAR(200) NOT NULL,\n" +
            "  `time` INTEGER NOT NULL,\n" +
            "  `rate` INTEGER NOT NULL,\n" +
            "  `price` INTEGER NOT NULL," +
            "  `phone` VARCHAR(15) NOT NULL,\n" +
            "  `user_id` INTEGER NOT NULL)\n"
            , [], null, function (tx, error) {
                console.log(error)
            });
        //Таблица RATES - хранит данные о тарифах за такси
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `RATES` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `price` INTEGER NOT NULL ,\n" +
            "  `name` VARCHAR(200) NOT NULL)\n"
            , [], null, function (tx, error) {
                console.log(error)
            });
        //Таблица ADDITIONALS - хранит данные о дополнительных параметрах при заказе такси
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `ADDITIONALS` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `price` INTEGER NOT NULL ,\n" +
            "  `name` VARCHAR(200) NOT NULL)\n"
            , [], null, function (tx, error) {
                console.log(error)
            });
        //Связь многие ко многим таблиц ADDITIONALS и ORDERS
        tx.executeSql(
            "CREATE TABLE IF NOT EXISTS `ADDITIONAL_ORDERS` (\n" +
            "  `id` INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL ,\n" +
            "  `order_id` INTEGER NOT NULL,\n" +
            "  `additional_id` INTEGER NOT NULL)\n"
            , [], null, function (tx, error) {
                console.log(error)
            });


        //Админка для входа
        tx.executeSql(
            "INSERT INTO USERS (first_name, last_name, age, gender, email, login, password) VALUES(?, ?, ?, ?, ?, ?, ?)",
            ["Никита", "Шипилов", "962481600", "Мужской", "test@mail.ru","admin", "admin"]
        );
        //Необходимые данные
        tx.executeSql("SELECT COUNT(*) as count FROM `RATES`", [],
            function (tx, result) {
                //Проверяем, что в rates пусто
                if (!result.rows.item(0)['count']) {
                    tx.executeSql(
                        "INSERT INTO `RATES` (`price`, `name`) " +
                        "           VALUES (?, ?), (?, ?)," +
                        "                  (?, ?), (?, ?)"
                    , [
                            10, 'Эконом',
                            11, 'Комфорт',
                            20, 'Бизнес',
                            43, 'Элитный'
                        ]);
                }
            });
        tx.executeSql("SELECT COUNT(*) as count FROM `ADDITIONALS`", [],
            function (tx, result) {
                //Проверяем, что в additional пусто
                if (!result.rows.item(0)['count']) {
                    tx.executeSql(
                        "INSERT INTO `ADDITIONALS` (`price`, `name`) " +
                        "           VALUES (?, ?), (?, ?)," +
                        "                  (?, ?), (?, ?), " +
                        "                  (?, ?)"
                    , [
                            150, 'Перевозка домашнего животного',
                            100, 'Сидение для ребёнка',
                            80, 'Кондиционер',
                            150, 'Желтые номера',
                            50, 'Некурящий водитель'
                        ]);
                }
            });

        //Тестовые данные для демонстрации работоспособности
        tx.executeSql("SELECT COUNT(*) as count FROM `ORDERS`", [],
            function (tx, result) {
                //Проверяем, что в orders пусто
                if (!result.rows.item(0)['count']) {
                    //Вставляем тестовые заказы
                    tx.executeSql(
                        "INSERT INTO `ORDERS` (`from`, `to`, `time`, `rate`, `price`, `phone`, `user_id`) " +
                        "           VALUES (?, ?, ?, ?, ?, ?, ?)," +
                        "                  (?, ?, ?, ?, ?, ?, ?)"
                    , [
                            'Москва, улица 1, 9', 'Москва, улица 100, 1', '1606893563', '1', '1300', '71111111111', '1',
                            'Москва, улица Победы, 20', 'Москва, улица Независимости, 2', '1606893700', '1', '2000', '89999999999','3'
                        ]);
                    //Вставляем тестовые соединения с дополнительными параметрами заказов
                    tx.executeSql(
                        "INSERT INTO `ADDITIONAL_ORDERS` (`order_id`, `additional_id`) " +
                        "           VALUES (?, ?), (?, ?)"
                    , [
                            1, 1,
                            1, 4
                        ]);
                }
            });
    })
});

//Вставляем тарифы
function insertRatesMain() {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `RATES`',
            [],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let select = $('#exampleFormControlSelect1');
                select.children().remove();
                for (let i = 0; i < result.rows.length; i++) {
                    select.append(`<option data-id='${result.rows[i]['id']}' value='${result.rows[i]['price']}'>${result.rows[i]['name']}</option>`)
                }
            });
    })
}

//Вставляем дополнительные услуги
function insertAdditionalsMain() {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `ADDITIONALS`',
            [],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let ul = $('#additionals');
                ul.children().remove();
                for (let i = 0; i < result.rows.length; i++) {
                    ul.append(`<li><label><input data-id='${result.rows[i]['id']}' data-price='${result.rows[i]['price']}' type="checkbox" >${result.rows[i]['name']}</label></li>`);
                }
            });
    })
}

//Вставляем тарифы в модалку
function insertRatesModalMain() {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `RATES`',
            [],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let tableBody = $('#exampleModalCenter table tbody')
                tableBody.children().remove();
                for (let i = 0; i < result.rows.length; i++) {
                    tableBody.append(`<tr><th scope="row">${result.rows.item(i)['id']}</th><td>${result.rows.item(i)['name']}</td><td>${result.rows.item(i)['price']}</td></tr>`)
                }
            });
    })
}

//Вставляем данные в профиль из бд
function insertProfile() {
    //Берём данные авторизованного пользователя по id
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `USERS` WHERE id = ?',
            [localStorage.getItem('user')],
            function (tx, result) {
                if (result.rows.length === 0) return;
                //Вставляем все данные
                let user = result.rows.item(0);
                let date = new Date(user['age']*1000);
                let month = date.getMonth() + 1;
                if ((''+month).length === 1) month = '0' + month;
                let day = date.getDate() + 3
                if ((''+day).length === 1) day = '0' + day;
                $('#profileFirstName').text(user['first_name'])
                $('#profileLastName').text(user['last_name'])
                $('#profileAge').text(day + '.' + month + '.' + date.getFullYear())
                $('#profileGender').text(user['gender'])
                $('#profileEmail').text(user['email'])
            });
    })
}


//Заказ такси
function orderTaxi() {

    let from = $('#validationServer01').val();
    let to = $('#validationServer02').val();
    let phone = $('#validationServer03').val();
    let rate = $('#exampleFormControlSelect1').val();
    let rateId = $('#exampleFormControlSelect1 option:selected').attr('data-id')
    let time = $('#validationServer04').val();
    let additional = jQuery.makeArray($('#additionals li label input:checked').map((index, element) => {
        return {
            id: element.dataset.id,
            price: element.dataset.price
        }
    }));

    let currentDate = new Date();
    time = new Date(currentDate.getUTCFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + (currentDate.getDate()) + ' ' + time +':01')
    time = time.valueOf() / 1000

    //Далее идёт использование Yandex API Геокодера (используется, в моём случае, для поиск расстояния между двух точек)
    ymaps.ready(function () {
        var myMap = new ymaps.Map('map', {
            center: [55.75, 37.57],
            zoom: 9,
            controls: ['routePanelControl']
        });

        // Получение ссылки на панель.
        var control = myMap.controls.get('routePanelControl');
        control.routePanel.options.set({
            types: {auto: true}
        });
        //Устанавливаем маршрут
        control.routePanel.state.set({
            from: from,
            to: to
        });

        control.routePanel.getRouteAsync().then(function (route) {

            // Повесим обработчик на событие построения маршрута.
            route.model.events.add('requestsuccess', function () {

                let activeRoute = route.getActiveRoute();
                if (activeRoute) {
                    // Получим протяженность маршрута.
                    let length = route.getActiveRoute().properties.get("distance")
                    //Переволим в км расстояние
                    let distance = length['value'] / 1000;
                    //Считаем сумму заказа
                    let sum = 0;
                    sum += Math.ceil(distance * rate);
                    sum += Object.keys(additional).reduce(function (sum, key) {
                        return +additional[key]['price'] + sum;
                    }, 0)

                    let modal = $('#exampleModal');
                    let modalBody = modal.find('.modal-body');
                    let confirm = modal.find('#confirmed');
                    //Закидываем ифнормацию о стоимости в модалку
                    modalBody.text('Сумма к оплате: ' + sum + '₽');
                    //Если пользователь согласен на стоимость, то сохраняем заказ
                    confirm.click(function () {
                       saveOrder(from, to, phone, rateId, time, sum, additional);
                       alert('Заказ создан!');
                       modal.modal('hide');
                    });
                    //Показываем модалку
                    modal.modal('show')
                }
            });
        });
    });
}

//Сохранение заказа в базе
function saveOrder(from, to, phone, rate, time, price, additional) {
    db.transaction( function (tx) {
        //Сохраняем заказ
        tx.executeSql(
            "INSERT INTO `ORDERS` (`from`, `to`, `time`, `rate`, `price`, `phone`, `user_id`) " +
            "           VALUES (?, ?, ?, ?, ?, ?, ?)"
            , [
                from, to, time, rate, price, phone, localStorage.getItem('user')
            ]);
        //Сохраняем связи заказа с additional
        tx.executeSql(
            "SELECT max(id) as `order` from `ORDERS` WHERE user_id = ?",
            [localStorage.getItem('user')],
            function (tx, result) {
                let order = result.rows.item(0)['order'];

                let params = Object.keys(additional).reduce(function (arr, key) {
                    arr.push(order);
                    arr.push(additional[key]['id']);
                    return arr;
                }, [])

                let valuesQuery = params.reduce((str, val, index) => {
                    if (index === params.length - 1) return str + ' ?)';
                    if (index % 2 === 0) return str + '(?,';
                    else return str + ' ?), ';
                }, '')

                tx.executeSql("INSERT INTO `ADDITIONAL_ORDERS` (`order_id`, `additional_id`) VALUES " + valuesQuery, params);

            }
        )
    })
}

//Функция авторизации
function auth() {
    let login = $('#validationServer01').val();
    let password = $('#validationServer02').val();

    //Если логин и пароль есть в базе, то ставим в локальное хранилище id пользователя и редиректим
    db.transaction( function (tx) {
        tx.executeSql(
            'SELECT id FROM `USERS` WHERE login = ? AND password = ?',
            [login, password],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let id = result.rows.item(0).id
                localStorage.setItem('user', id);
                redirect();
            });
    })
}

//Проверяем, авторизован ли пользователь
function isUserAuth() {
    return localStorage.getItem('user') !== null;
}

//Функция редиректа
function redirect() {
    let splitedPathName = document.location.pathname.split('/');
    let currentFile = splitedPathName[splitedPathName.length-1].split('?')[0]

    //Проверка, авторизован ли пользователь
    if (isUserAuth()) {
        //Если находимся на страницах регистрации или авторизации, то редирект на страницу профиля
        if (['auth.html', 'register.html'].indexOf(currentFile) !== -1) {
            document.location.pathname = splitedPathName.slice(0, splitedPathName.length-1).join('/') + '/cabinet.html';
        }
    } else {
        //Если не авторизован и не на страницах авторизации или регистрации, то редирект на авторизацию
        if (['auth.html', 'register.html'].indexOf(currentFile) === -1) {
            document.location.pathname = splitedPathName.slice(0, splitedPathName.length-1).join('/') + '/auth.html';
        }
    }
}

//Регистрация пользователя
function register() {
    let first_name = $('#validationServer01').val();
    let last_name = $('#validationServer02').val();
    //Храню информацию о дате рождения в unix, поэтому заморочка с делением
    let age = new Date($('#validationServer03').val()).getTime() / 1000;
    let gender = $('input:checked').value;
    let email = $('#validationServer05').val();
    let login = $('#validationServer06').val();
    let password = $('#validationServer07').val();

    //Проверяем, существует ли пользователь с таким логином
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `USERS` WHERE login = ?',
            [login],
            function (tx, result) {
                if (result.rows.length !== 0) {
                    alert('Пользователь с таким логином уже существует');
                } else {
                    tx.executeSql("INSERT INTO USERS (first_name, last_name, age, gender, email, login, password) VALUES(?, ?, ?, ?, ?, ?, ?)",
                        [first_name, last_name, age, gender, email, login, password],
                        function (tx, result) {
                            //Если добавился новый пользователь
                            if (result.rowsAffected === 1) {
                                alert('Аккаунт успешно создан!');
                                //Редирект на страницу авторизации
                                let splitedPathName = document.location.pathname.split('/');
                                let currentFile = splitedPathName[splitedPathName.length-1].split('?')[0]
                                document.location.pathname = splitedPathName.slice(0, splitedPathName.length-1).join('/') + '/auth.html';
                            } else {
                                alert('Не удалось создать аккаунт');
                            }
                        });
                }
            });
    })
}

function insertHistoryCabinet() {
    let modal = $('#exampleModalCenter');
    //Выводим историю заказов (соединяем её с тарифами, чтобы получить их названия)
    db.transaction(function(tx) {
        tx.executeSql(
            'SELECT `ORDERS`.*, `RATES`.name FROM `ORDERS` LEFT JOIN `RATES` ON `RATES`.id = `ORDERS`.rate WHERE user_id = ? ORDER BY `ORDERS`.id DESC',
            [localStorage.getItem('user')],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let tableBody = modal.find('.modal-body tbody');
                tableBody.children().remove();
                //Заполняем таблицу
                for (let i = 0; i < result.rows.length; i++) {
                    tableBody.append(`
                                <tr>
                                    <th>${new Date(result.rows.item(i)['time'] * 1000)}</th>
                                    <td>${result.rows.item(i)['from']}</td>
                                    <td>${result.rows.item(i)['to']}</td>
                                    <td>${result.rows.item(i)['price']}₽</td>
                                    <td>${result.rows.item(i)['name']}</td>
                                </tr>
                    `)
                }
            }
        )
    })
}

//Сохранение партнёра
function savePartners() {
    let name = $('#validationServer02').val();
    let email = $('#validationServer03').val();
    let phone = $('#validationServer04').val();
    let site = $('#validationServer05').val();
    //Вставляем партнёра
    db.transaction(function(tx) {
        tx.executeSql(
            'INSERT INTO `PARTNERS` (`name`, `email`, `phone`, `site`) VALUES (?, ?, ?, ?)',
            [name, email, phone, site],
            function (tx, result) {
                alert('Заявка принята!');
            }
        )
    })
}