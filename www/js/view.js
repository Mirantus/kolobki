/**
 * Класс для работы с отображением игры
 */
game.view = {
    /**
     * Создает поле игры
     * @param {Number} cols Количество столбцов
     * @param {Number} rows Количество строк
     * @return {Kolobok}
     */
    createArea: function (cols, rows) {
        var row, $row, col, $col,
            $table = $('<table id="area" cellspacing="0"></table>');

        for (row = 0; row < rows; row++) {
            $row = $('<tr></tr>');
            for (col = 0; col < cols; col++) {
                $col = $('<td id="cell-' + row + '-' + col + '" class="cell"></td>');
                $row.append($col);
            }
            $table.append($row);
        }

        $('.field-area').append($table);
    },

    /**
     * Создает обработчики событий
     */
    initEvents: function () {
        $('.cell')
            .click(this.onCellClick)
            .hover(this.onCellMouseIn, this.onCellMouseOut);
        $(document).keyup(this.onKeyPress);
        $('#skip').click(this.onSkipTurn);
        $('#restart').click(this.onRestart);
        $('#reset').click(this.onReset);
        $('#help').click(this.onHelp);
    },

    /**
     * Отображает текущий уровень игры
     * @param {Number} level Уровень игры
     */
    setLevel: function (level) {
        $('#level').text(level);
    },

    /**
     * Показывает кнопку пропуска хода
     */
    allowSkipTurn: function () {
        $('#skip').show();
    },

    /**
     * Обновляет отображение поля по колобку
     * @param {Object} cell Количество столбцов
     * @param {Kolobok} kolobok
     */
    updateCell: function (cell, kolobok) {
        var $cell = $('#cell-' + cell.row + '-' + cell.col),
            image;

        this.clearCell(cell);

        if (kolobok.type == 'user') {
            image = 'smile';
            if (kolobok.interact) {
                image = kolobok.interact == 'sex' ? 'kiss3' : 'yess';
            }
        }
        if (kolobok.type == 'female') {
            image = 'girl_smile';
        }
        if (kolobok.type == 'enemy') {
            image = 'diablo';
            if (kolobok.interact) {
                image = kolobok.interact == 'sex' ? 'girl_devil' : 'vampire';
            }
        }

        $cell.addClass('kolobok ' + kolobok.type);
        if (kolobok.current) {
            $cell.addClass('current');
        }

        $cell.html('<img src="i/' + image + '.gif">');
    },

    /**
     * Очищает поле
     * @param {Object} cell Поле
     */
    clearCell: function (cell) {
        var $cell = $('#cell-' + cell.row + '-' + cell.col);
        $cell.attr('class', 'cell');
        $cell.text('');
    },

    /**
     * Обработчик клика по полю
     * @param {jQuery.Event} event
     */
    onCellClick: function (event) {
        var idParts = event.delegateTarget.id.split('-'),
            cell = {row: idParts[1], col: idParts[2]};

        game.handleClick(cell);
    },

    /**
     * Обработчик нажатия клавиши
     * @param {jQuery.Event} event
     */
    onKeyPress: function (event) {
        switch (event.which) {
            case 37:
                game.handleKey('left');
                break;
            case 38:
                game.handleKey('up');
                break;
            case 39:
                game.handleKey('right');
                break;
            case 40:
                game.handleKey('down');
                break;
            case 32:
                game.handleKey('space');
                break;
        }
        return false;
    },

    /**
     * Обработчик наведения мыши на поле
     * @param {jQuery.Event} event
     */
    onCellMouseIn: function (event) {
        var idParts = event.target.id.split('-'),
            cell = {row: idParts[1], col: idParts[2]};

        if (game.isAllowMove(game.kolobki.getCurrent(), cell)) {
            event.target.style.cursor = 'pointer';
        }
    },

    /**
     * Обработчик ухода мыши с поля
     * @param {jQuery.Event} event
     */
    onCellMouseOut: function (event) {
        event.target.style.cursor = 'default';
    },

    /**
     * Обработчик пропуска хода
     */
    onSkipTurn: function () {
        game.skipTurn();
    },

    /**
     * Обработчик нажатия кнопки "Начать уровень заново"
     */
    onRestart: function () {
        window.location.reload();
    },

    /**
     * Обработчик нажатия кнопки "Сбросить игру"
     */
    onReset: function () {
        game.reset();
        window.location.reload();
    },

    /**
     * Обработчик нажатия кнопки "Правила игры"
     */
    onHelp: function () {
        alert('Вы управляете колобком, выделенным красным прямоугольником. Перемещаться можно по вертикали и по горизонтали с помощью стрелок клавиатуры или кликами мышки по нужным полям. Цель игры - уничтожить всех чертят. Для этого нужно встать на одно поле с каждым из них. Если чертенок встанет на ваше поле, то ваш колобок исчезает. Если будут уничтожены все ваши колобки, то игра будет проиграна. На поле также присутствуют девочки. Если колобок или чертенок встает на одно поле с девочкой, то девочка исчезает, а вместо нее появляется либо девочка, либо другой колобок того же типа (чертенок или ваш колобок). Если у вас появляется несколько колобков, то они ходят по очереди.');
    }
};