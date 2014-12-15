/**
 * Основной класс игры
 */
var game = {
    /**
     * Текущий уровень игры
     * @type Number
     */
    level: 1,

    /**
     * Количество колонок игрового поля
     * @type Number
     */
    cols: 10,

    /**
     * Количество строк игрового поля
     * @type Number
     */
    rows: 10,

    /**
     * Флаг блокировки действий пользователя
     * @type Boolean
     */
    blockHandle: false,

    /**
     * Уровень, на котором надо спрятать кнопку пропуска хода
     * @type Number
     */
    allowSkipTurnMaxLevel: 6,

    /**
     * Подготовка и запуск игры
     */
    start: function () {
        var i;

        this.initLevel();
        this.view.createArea(this.cols, this.rows);
        this.view.initEvents();
        this.createKolobok({type: 'user', current: true});
        for (i = 0; i < this.level; i++) {
            this.createKolobok({type: 'enemy'});
        }
        for (i = 0; i < this.level / 2; i++) {
            this.createKolobok({type: 'female'});
        }
    },

    /**
     * Установка текущего уровня игры
     */
    initLevel: function () {
        var savedLevel = document.getCookie('level');

        if (savedLevel) {
            this.level = parseInt(savedLevel);
        }

        this.view.setLevel(this.level);

        if (this.level < this.allowSkipTurnMaxLevel) {
            this.view.allowSkipTurn();
        }
    },

    /**
     * Сбросить текущий уровень на первый
     */
    reset: function () {
        document.setCookie('level', '1', 365);
    },

    /**
     * Создает колобка и ставит его на нужное поле
     * @param {Object} config Параметры создавемого колобка
     * @return {Kolobok}
     */
    createKolobok: function (config) {
        var kolobok;

        config = config || {};
        config.cell = config.cell || this.getRandomFreeCell();

        kolobok = this.kolobki.create(config);
        this.view.updateCell(kolobok.cell, kolobok);

        return kolobok;
    },

    /**
     * Возвращает случайное не занятое поле
     * @return {Object}
     */
    getRandomFreeCell: function () {
        var freeCell = null,
            freeCells = this.getFreeCells();

        if (freeCells.length) {
            freeCell = freeCells[rand(0, freeCells.length - 1)];
        }

        return freeCell;
    },

    /**
     * Возвращает не занятые поля
     * @return {Array}
     */
    getFreeCells: function () {
        var col, row, cell,
            freeCells = [];

        for (row = 0; row < this.rows; row++) {
            for (col = 0; col < this.cols; col++) {
                cell = {col: col, row: row};
                if (this.kolobki.isCellFree(cell)) {
                    freeCells.push(cell);
                }
            }
        }

        return freeCells;
    },

    /**
     * Обработчик клика на поле
     * @param {Object} cell Поле на которое кликнули
     */
    handleClick: function (cell) {
        this.handleTurn(this.kolobki.getCurrent(), cell);
    },

    /**
     * Обработчик нажатия на стрелки
     * @param {String} key Направление стрелки
     */
    handleKey: function (key) {
        var kolobok = this.kolobki.getCurrent(),
            cell = $.extend({}, kolobok.cell);

        switch (key) {
            case 'left':
                cell.col = parseInt(cell.col) - 1;
                break;
            case 'up':
                cell.row = parseInt(cell.row) - 1;
                break;
            case 'right':
                cell.col = parseInt(cell.col) + 1;
                break;
            case 'down':
                cell.row = parseInt(cell.row) + 1;
                break;
            case 'space':
                this.skipTurn();
                return;
                break;
            default:
                return;
        }

        this.handleTurn(kolobok, cell);
    },

    /**
     * Обработчик попытки перемещения колобка
     * @param {Kolobok} kolobok
     * @param {Object} cell
     */
    handleTurn: function (kolobok, cell) {
        if (this.blockHandle || !this.isAllowMove(kolobok, cell)) {
            return;
        }
        this.moveToCell(kolobok, cell, this.afterUserTurn);
    },

    /**
     * Возвращает true если колобка можно переместить в указанное поле
     * @param {Kolobok} kolobok
     * @param {Object} cell
     * @return {Boolean}
     */
    isAllowMove: function (kolobok, cell) {
        var nearestCells,
            isAllow = false,
            cellKolobok = this.kolobki.getCellKolobok(cell);

        // можно ли двигаться если поле занято
        if (cellKolobok) {
            if (kolobok.type == cellKolobok.type || kolobok.type == 'female') {
                return false;
            }
        }

        // можно двигаться только на ближайшее поле
        nearestCells = this.getNearestCells(kolobok);
        $.each(nearestCells, function (index, cellForMove) {
            if (cellForMove.col == cell.col && cellForMove.row == cell.row) {
                isAllow = true;
                return false;
            }
        });

        return isAllow;
    },

    /**
     * Возвращает список полей, которые лежат рядом с колобком
     * @param {Kolobok} kolobok
     * @return {Array}
     */
    getNearestCells: function (kolobok) {
        var cellsForMove = [],
            row = parseInt(kolobok.cell.row),
            col = parseInt(kolobok.cell.col),
            prevRow = row - 1,
            nextRow = row + 1,
            prevCol = col - 1,
            nextCol = col + 1;

        if (prevCol >= 0) {
            cellsForMove.push({row: row, col: prevCol});
        }
        if (nextCol < this.cols) {
            cellsForMove.push({row: row, col: nextCol});
        }

        if (prevRow >= 0) {
            cellsForMove.push({row: prevRow, col: col});
        }

        if (nextRow < this.rows) {
            cellsForMove.push({row: nextRow, col: col});
        }

        return cellsForMove;
    },

    /**
     * Передвигает колобка в нужное поле
     * @param {Kolobok} kolobok
     * @param {Object} cell
     * @param {Function} callback
     */
    moveToCell: function (kolobok, cell, callback) {
        var cellKolobok,
            interact = false,
            oldCell = {col: kolobok.cell.col, row: kolobok.cell.row};


        cellKolobok = this.kolobki.getCellKolobok(cell);
        if (cellKolobok) {
            interact = this.kolobki.interact(kolobok, cellKolobok);
        }

        kolobok.cell = cell;

        this.view.clearCell(oldCell);
        this.view.updateCell(cell, kolobok);

        if (interact) {
            setTimeout(this.afterMoveToCell.bind(this, kolobok, callback), 1000);
        } else {
            this.afterMoveToCell(kolobok, callback)
        }
    },

    /**
     * Действия после движения любого колобка
     * @param {Kolobok} kolobok
     * @param {Function} callback
     */
    afterMoveToCell: function (kolobok, callback) {
        var config,
            interact = kolobok.interact;

        kolobok.interact = false;
        this.view.updateCell(kolobok.cell, kolobok);

        // после секса появляется мальчик или девочка
        if (interact == 'sex') {
            config = rand(0, 1) ? {type: kolobok.type} : {type: 'female'};
            this.createKolobok(config);
        }

        if (callback) {
            if (interact == 'sex') {
                setTimeout(callback.bind(this), 500);
            } else {
                callback();
            }
        }
    },

    /**
     * Действия после движения пользовательского колобка
     */
    afterUserTurn: function () {
        if (!game.activateNextKolobok()) {
            game.endTurn();
        }
    },

    /**
     * Делает текущим следующий пользовательский колобок
     * @return {Kolobok}
     */
    activateNextKolobok: function () {
        var nextKolobok,
            current = this.kolobki.getCurrent();

        current.turned = true;

        nextKolobok = this.kolobki.getNotTurned();

        if (nextKolobok) {
            current.current = false;
            nextKolobok.current = true;
            this.view.updateCell(current.cell, current);
            this.view.updateCell(nextKolobok.cell, nextKolobok);
        }

        return nextKolobok;
    },

    /**
     * Заканчивает текущий ход
     */
    endTurn: function () {
        if (!this.kolobki.countEnemies()) {
            this.win();
        } else {
            this.blockHandle = true;
            setTimeout(this.nextTurn.bind(this), 500);
        }
    },

    /**
     * Обработчик победы
     */
    win: function () {
        alert('Уровень ' + this.level + ' пройден!');
        document.setCookie('level', this.level + 1, 365);
        window.location.reload();
    },

    /**
     * Начинает новый ход
     */
    nextTurn: function () {
        this.clearTurn();
        this.resetCurrent();
        this.enemyKolobokTurn();
    },

    /**
     * Сбрасывает все настройки, установленные текущим ходом
     */
    clearTurn: function () {
        $.each(this.kolobki.items, function (index, kolobok) {
            kolobok.interact = false;
            kolobok.turned = false;
            if (kolobok.type == 'user') {
                kolobok.current = false;
                game.view.updateCell(kolobok.cell, kolobok);
            }
        });

        this.blockHandle = false;
    },

    /**
     * Ход вражеских колобков
     */
    enemyKolobokTurn: function () {
        var cell,
            kolobok = this.kolobki.getNotTurnedEnemy();

        if (!kolobok) {
            return;
        }

        // каждый десятый ход вражеский колобок пропускает
        if (!rand(0, 10)) {
            kolobok.turned = true;
            return;
        }

        if (kolobok.type == 'enemy') {
            cell = this.getCellForEnemyMove(kolobok);
        }

        if (kolobok.type == 'female') {
            cell = this.getRandomCellForMove(kolobok);
        }

        if (cell) {
            kolobok.turned = true;
            this.moveToCell(kolobok, cell, this.afterEnemyTurn);
        } else {
            kolobok.turned = true;
            this.afterEnemyTurn();
        }
    },

    /**
     * Возвращает поле, на которые может походить противник
     * @param {Kolobok} kolobok
     * @return {Object} cell
     */
    getCellForEnemyMove: function (kolobok) {
        var targetKolobok = this.kolobki.getNearestKolobok(kolobok),
            col = parseInt(kolobok.cell.col),
            row = parseInt(kolobok.cell.row),
            cell = {row: row, col: col};

        if (targetKolobok.cell.row < row) {
            cell.row = row - 1;
        }
        if (targetKolobok.cell.row > row) {
            cell.row = row + 1;
        }
        if (targetKolobok.cell.col < col) {
            cell.col = col - 1;
            if (this.isAllowMove(kolobok, cell)) {
                return cell;
            }
        }
        if (targetKolobok.cell.col > col) {
            cell.col = col + 1;
            if (this.isAllowMove(kolobok, cell)) {
                return cell;
            }
        }
        cell.col = col;
        if (this.isAllowMove(kolobok, cell)) {
            return cell;
        }

        return this.getRandomCellForMove(kolobok);
    },

    /**
     * Возвращает случайное поле, на которое колобок может походить
     * @param {Kolobok} kolobok
     * @return {Object} cell
     */
    getRandomCellForMove: function (kolobok) {
        var cells = this.getNearestCells(kolobok),
            allowedСells = [],
            cell;

        if (!cells.length) {
            return null;
        }

        $.each(cells, function (index, cell) {
            if (game.isAllowMove(kolobok, cell)) {
                allowedСells.push(cell);
            }
        });

        if (!allowedСells.length) {
            return null;
        }

        cell = allowedСells[rand(0, allowedСells.length - 1)];

        return cell;
    },

    /**
     * Действия после хода вражеского колобка
     */
    afterEnemyTurn: function () {
        var current;

        if (!game.kolobki.getCurrent()) {
            current = game.resetCurrent();

            if (!current) {
                alert('Вы проиграли!');
                window.location.reload();
                return false;
            }
        }

        game.enemyKolobokTurn();
    },

    /**
     * Устанавливает текущего колобка заново
     * @return {Kolobok}
     */
    resetCurrent: function () {
        var kolobok = this.kolobki.getFirstUser();

        if (kolobok) {
            kolobok.current = true;
            game.view.updateCell(kolobok.cell, kolobok);
        }

        return kolobok;
    },

    /**
     * Обработчик пропуска хода
     */
    skipTurn: function () {
        if (this.blockHandle) return;
        this.afterUserTurn();
    }
};