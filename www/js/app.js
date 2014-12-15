/**
 * Возвращает случайное значение между min и max
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 */
function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Возвращает значение cookie по названию
 * @param {String} name
 * @return {String|Null} value
 */
document.getCookie = function (name) {
    var matches = document.cookie.match(name + '=(.*?)(;|$)');
    return matches ? matches[1] : null;
};

/**
 * Возвращает все куки
 * @return {Object}
 */
document.getCookies = function () {
    var pairs = document.cookie.split(";"),
        cookies = {},
        pair,
        i;

    for (i = 0; i < pairs.length; i++) {
        pair = pairs[i].split('=');
        cookies[pair[0]] = decodeURIComponent(pair[1]);
    }

    return cookies;
};

/**
 * Устанавливает куки
 * @param {String} name
 * @param {String|Number} value
 * @param {Number} days
 */
document.setCookie = function (name, value, days) {
    var expires = new Date();
    expires.setDate(expires.getDate() + days);
    document.cookie = name + '=' + value + '; expires=' + expires.toUTCString();
};

$(function () {
    game.start();
});