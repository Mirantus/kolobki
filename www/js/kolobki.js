/**
 * Класс управления колобками
 */
game.kolobki = {
    /**
     * Набор колобков
     * @type Array
     */
    items: [],

    /**
     * Последний уникальный идентификатор
     * @type Number
     */
    uuid: 0,

    /**
     * Создает колобка и добавляет его в набор
     * @param {Object|Null} config Параметры создавемого колобка
     * @return {Kolobok}
     */
    create: function (config) {
        config = config || {};
        var kolobok = new Kolobok(config);

        kolobok.id = this.generateId();
        this.items.push(kolobok);
        return kolobok;
    },

    /**
     * Генерирует идентификатор для колобка
     * @return {Number}
     */
    generateId: function () {
        return ++this.uuid;
    },

    /**
     * Проверяет занято поле колобками или нет
     * @param {Object} cell
     * @return {Boolean}
     */
    isCellFree: function (cell) {
        var isFree = true;

        $.each(this.items, function (index, item) {
            if (item.cell.col == cell.col && item.cell.row == cell.row) {
                isFree = false;
                return false;
            }
            return true;
        });

        return isFree;
    },

    /**
     * Возвращает текущего колобка
     * @return {Kolobok}
     */
    getCurrent: function () {
        var current = null;

        $.each(this.items, function (index, item) {
            if (item.current) {
                current = item;
                return false;
            }
            return true;
        });

        return current;
    },

    /**
     * Логика взаимодействия колобков
     * @param {Kolobok} kolobok Колобок который совершает ход
     * @param {Kolobok} cellKolobok Колобок, в ячейку которого идет текущий колобок
     * @return {String} Название взаимодействия
     */
    interact: function (kolobok, cellKolobok) {
        var cellKolobokIndex = 0;

        if (kolobok.type == cellKolobok.type) {
            return kolobok.interact;
        }

        $.each(this.items, function (index, item) {
            if (item.id == cellKolobok.id) {
                cellKolobokIndex = index;
            }
        });

        this.items.splice(cellKolobokIndex, 1);
        kolobok.interact = cellKolobok.type == 'female' ? 'sex' : 'kill';

        return kolobok.interact;
    },

    /**
     * Возвращает первого пользовательского колобка, который еще не ходил в этом ходе
     * @return {Kolobok}
     */
    getNotTurned: function () {
        var notTurnedKolobok = null;

        $.each(this.items, function (index, kolobok) {
            if (kolobok.type == 'user' && !kolobok.turned) {
                notTurnedKolobok = kolobok;
                return false;
            }
            return true;
        });

        return notTurnedKolobok;
    },

    /**
     * Возвращает колобка, который находится в указанном поле
     * @param {Object} cell
     * @return {Kolobok}
     */
    getCellKolobok: function (cell) {
        var cellKolobok = null;

        $.each(this.items, function (index, kolobok) {
            if (kolobok.cell.col == cell.col && kolobok.cell.row == cell.row) {
                cellKolobok = kolobok;
                return false;
            }
        });

        return cellKolobok;
    },

    /**
     * Считает количество врагов
     * @return {Number}
     */
    countEnemies: function () {
        var enemies = 0;

        $.each(this.items, function (index, kolobok) {
            if (kolobok.type == 'enemy') {
                enemies++;
            }
        });

        return enemies;
    },

    /**
     * Возвращает первый пользовательский колобок
     * @return {Kolobok}
     */
    getFirstUser: function () {
        var user = null;

        $.each(this.items, function (index, kolobok) {
            if (kolobok.type == 'user') {
                user = kolobok;
                return false;
            }
        });

        return user;
    },

    /**
     * Возвращает вражеского колобка, который еще не ходил
     * @return {Kolobok}
     */
    getNotTurnedEnemy: function () {
        var enemy = null;

        $.each(this.items, function (index, kolobok) {
            if (kolobok && kolobok.type != 'user' && !kolobok.turned) {
                enemy = kolobok;
                return false;
            }
        });

        return enemy;
    },

    /**
     * Возвращает ближайшего колобка к переданному
     * @param {Kolobok} kolobok
     * @return {Kolobok}
     */
    getNearestKolobok: function (kolobok) {
        var nearest = {kolobok: null, distance: 99};

        $.each(this.items, function (index, userKolobok) {
            var distance;

            if (userKolobok.type == 'user') {
                distance = Math.abs(kolobok.cell.col - userKolobok.cell.col) + Math.abs(kolobok.cell.row - userKolobok.cell.row);
                if (distance < nearest.distance) {
                    nearest.kolobok = userKolobok;
                }
            }
        });
        return nearest.kolobok;
    }
};