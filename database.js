
//redirect();
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
        tx.executeSql("INSERT INTO USERS (first_name, last_name, age, gender, email, login, password) VALUES(?, ?, ?, ?, ?, ?, ?)", ["Никита", "Шипилов", "962481600", "Мужской", "test@mail.ru","admin", "admin"], null, function (tx, error) {
            console.log(error)
        });
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
            },
            function (tx, error) {
                console.log(error)
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
            },
            function (tx, error) {
                console.log(error)
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
                        ], null, function (tx, error) {
                            console.log(error)
                        });
                    //Вставляем тестовые соединения с дополнительными параметрами заказов
                    tx.executeSql(
                        "INSERT INTO `ADDITIONAL_ORDERS` (`order_id`, `additional_id`) " +
                        "           VALUES (?, ?), (?, ?)"
                    , [
                            1, 1,
                            1, 4
                        ], null, function (tx, error) {
                            console.log(error)
                        });
                }
            },
            function (tx, error) {
                console.log(error)
            });
    })
});

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
                    select.append(`<option data-id='${result.rows[i]['id']}' data-price='${result.rows[i]['price']}'>${result.rows[i]['name']}</option>`)
                }
            },
            function (tx, error) {
                console.log(error);
            });
    })
}

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
                    ul.append(`<li><label><input data-id='${result.rows[i]['id']}' data-price='${result.rows[i]['price']}' type="checkbox" onclick="selectAdditional(this)">${result.rows[i]['name']}</label></li>`);
                }
            },
            function (tx, error) {
                console.log(error);
            });
    })
}

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
            },
            function (tx, error) {
                console.log(error);
            });
    })
}

function insertProfile() {
    db.transaction(function (tx) {
        tx.executeSql(
            'SELECT * FROM `USERS` WHERE id = ?',
            [localStorage.getItem('user')],
            function (tx, result) {
                if (result.rows.length === 0) return;
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
            },
            function (tx, error) {
                console.log(error);
            });
    })
}


function orderTaxi() {
    let from = $('#validationServer01').val();
    let to = $('#validationServer02').val();
    let phone = $('#validationServer03').val();
    let rate = $('#exampleFormControlSelect1').val();
    let time = $('#validationServer04').val();
    let additional = jQuery.makeArray($('#additionals li label input:checked').map((index, element) => {
        return {
            id: element.dataset.id,
            price: element.dataset.price
        }
    }));

    let currentDate = new Date();
    time = new Date(currentDate.getUTCFullYear() + '-' + (currentDate.getMonth() + 1) + '-' + (currentDate.getDay() - 1) + ' ' + time +':01')
}

function auth() {
    let login = $('#validationServer01').val();
    let password = $('#validationServer02').val();

    db.transaction( function (tx) {
        tx.executeSql(
            'SELECT id FROM `USERS` WHERE login = ? AND password = ?',
            [login, password],
            function (tx, result) {
                if (result.rows.length === 0) return;
                let id = result.rows.item(0).id
                localStorage.setItem('user', id);
                redirect();
            },
            function (tx, error) {
                console.log(error);
            });
    })
}

function isUserAuth() {
    return localStorage.getItem('user') !== null;
}

function redirect() {
    if (isUserAuth()) {
        if (['auth.html', 'register.html'].indexOf(document.location.pathname.split('/')[1]) !== -1) {
            document.location.pathname = '/cabinet.html';
        }
    } else {
        if (['auth.html', 'register.html'].indexOf(document.location.pathname.split('/')[1]) === -1) {
            document.location.pathname = '/auth.html';
        }
    }
}
function register() {
    let first_name = $('#validationServer01').val();
    let last_name = $('#validationServer02').val();
    let age = new Date($('#validationServer03').val() ).getTime() / 1000;
    let gender = $('input:checked').value;
    let email = $('#validationServer05').val();
    let login = $('#validationServer06').val();
    let password = $('#validationServer07').val();

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
                            if (result.rowsAffected === 1) {
                                alert('Аккаунт успешно создан!');
                                document.location.pathname = '/auth.html';
                            } else {
                                alert('Не удалось создать аккаунт');
                            }
                        });
                }
            },
            function (tx, error) {
                console.log(error);
            });
    })
}
