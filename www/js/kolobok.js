/**
 * Класс колобка
 * @param {Object|Null} config Параметры создавемого колобка
 * @return {Object}
 */
function Kolobok(config) {
    var kolobok = {
        type: 'enemy',
        current: false,
        interact: false,
        turned: false,
        cell: null
    };

    $.extend(kolobok, config);

    return kolobok;
}