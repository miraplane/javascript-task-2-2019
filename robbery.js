'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
const isStar = true;

const startTime = new Date(Date.UTC(2021, 1, 1));
const endTime = new Date(Date.UTC(2021, 1, 3, 23, 59, 59, 999));
const dayNumber = ['ВС', 'ПН', 'ВТ', 'СР'];

/**
 * @class schedule
 * @private
 * @type {Object}
 * @property {Array} Danny - расписание Danny
 * @property {Array} Rusty - расписание Rusty
 * @property {Array} Linus - расписание Linus
 */
/**
 * Считываем расписание занятости участников банды и добаляем в единое рассписание
 * @param {schedule} schedule - расписание участников банды *
 * @returns {Array} - единое расписание занятости
 */
function parseSchedule(schedule) {
    let timeToWork = [];
    for (let member in schedule) {
        if (schedule[member] !== undefined) {
            parseHours(schedule[member], timeToWork);
        }
    }

    return timeToWork;
}

/**
 * Считываем компоненту рассписания
 * @param {Array} scheduleMember - расписание участника банды
 * @param {Array} timeToWork - единое расписание занятости
 */
function parseHours(scheduleMember, timeToWork) {
    for (let workingHours of scheduleMember) {
        timeToWork.push({
            from: toUTC(workingHours.from),
            to: toUTC(workingHours.to)
        });
    }
}

/**
 * Считываем время и запоминаем его в UTC
 * @param {string} hours - время
 * @returns {number} - количество миллисикунд прошедших с 1 января 1970 года до hours по UTC
 */
function toUTC(hours) {
    let dayAndHours = hours.split(' ');
    let hoursAndZone = dayAndHours[1].split('+');
    let hoursAndMinutes = hoursAndZone[0].split(':');

    let day = dayNumber.indexOf(dayAndHours[0]);
    let hour = parseInt(hoursAndMinutes[0]);
    let minutes = parseInt(hoursAndMinutes[1]);
    let zone = parseInt(hoursAndZone[1]);

    return Date.UTC(startTime.getFullYear(), startTime.getMonth(), day, hour, minutes) -
        minToMS(zone * 60);
}

/**
 * @class workingHours
 * @private
 * @type {Object}
 * @property from - время открытия
 * @property to - время звкрытия
 */
/**
 * Считываем время работы банка
 * @param {workingHours} workingHours - время работы банка
 * @returns {{time: Array, zone: number}} - time - время работы с ПН по СР,
 * zone - часовой пояс в котором находится банк
 */
function parseBankHours(workingHours) {
    let zone = workingHours.from.split('+')[1];
    let timeToWork = [];
    for (let day of dayNumber.slice(1)) {
        timeToWork.push({
            from: toUTC(day + ' ' + workingHours.from),
            to: toUTC(day + ' ' + workingHours.to)
        });
    }

    return { time: timeToWork,
        zone: parseInt(zone) };
}

/**
 * На отрезке времени от start до end берет дополнение к отрезкам из timeToWork
 * @param {number} start
 * @param {number} end
 * @param {Array} timeToWork - занятое время
 * @returns {Array} - свободное время
 */
function getTimeToFun(start, end, timeToWork) {
    let timeToFun = [];
    for (let time of timeToWork) {
        timeToFun.push({
            from: start,
            to: time.from
        });
        start = time.to;
    }
    timeToFun.push({
        from: start,
        to: end
    });

    return timeToFun;
}

/**
 * Переводит множество пересекающихся отрезков времени из schedule
 * в множество непересекающися отрезков
 * @param {Array} schedule - расписание с пересечениями по времени
 * @returns {Array} - расписание на основе исходного без пересечений по времени
 */
function calculateTimeToWork(schedule) {
    let timeToWork = [];
    schedule.sort((a, b) => {
        if (a.from > b.from) {
            return 1;
        }
        if (a.from < b.from) {
            return -1;
        }

        return 0;
    });
    let index = 0;
    timeToWork.push({
        from: schedule[index].from,
        to: schedule[index].to
    });
    for (let time of schedule) {
        if (time.from <= timeToWork[index].to && timeToWork[index].to <= time.to) {
            timeToWork[index].to = time.to;
        } else if (timeToWork[index].to < time.from) {
            index += 1;
            timeToWork.push({
                from: time.from,
                to: time.to
            });
        }
    }

    return timeToWork;
}

/**
 * Переводит минуты в миллисекунды
 * @param {number} min
 * @returns {number}
 */
function minToMS(min) {
    return min * 60 * 1000;
}

/**
 * @param {schedule} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {workingHours} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);

    let timeToWork = parseSchedule(schedule);
    let bankTimeWork = parseBankHours(workingHours);

    let start = startTime.getTime();
    let end = endTime.getTime();

    let bankTimeClose = getTimeToFun(start, end, bankTimeWork.time);
    let timeToFun = getTimeToFun(start, end, calculateTimeToWork(timeToWork.concat(bankTimeClose)));

    let go = [];
    for (let time of timeToFun) {
        if (time.to - time.from >= minToMS(duration)) {
            go.push(time);
        }
    }
    let index = 0;
    let shift = 0;

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return go.length !== 0;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например, "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (!this.exists()) {
                return '';
            }
            let time = new Date(go[index].from + minToMS(shift * 30));
            let hours = time.getUTCHours() + bankTimeWork.zone;
            let minutes = time.getUTCMinutes();
            let result = template.replace('%DD', dayNumber[time.getUTCDay()]);
            result = result.replace('%HH',
                ((hours - hours % 10) / 10).toString() + (hours % 10).toString());
            result = result.replace('%MM',
                ((minutes - minutes % 10) / 10).toString() + (minutes % 10).toString());

            return result;
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            if (go[index].to - go[index].from >= minToMS(duration) + minToMS((shift + 1) * 30)) {
                shift += 1;

                return true;
            }
            index += 1;
            if (index === go.length) {
                index -= 1;

                return false;
            }
            shift = -1;

            return this.tryLater();
        }
    };
}

module.exports = { getAppropriateMoment, isStar };
