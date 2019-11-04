'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
const isStar = false;

function parseSchedule(schedule) {
    let timeToWork = [];
    for (let member in schedule) {
        for (let hours of schedule[member]) {
            parseHours(hours, timeToWork);
        }
    }
    return timeToWork;
}

function parseHours(workingHours, timeToWork) {
    timeToWork.push({
        from: toUTC(workingHours.from),
        to: toUTC(workingHours.to)
    })    
}

function toUTC(hours) {
    let year = '2021';
    let month = '02';
    let dayNumber = {'ПН': '01', 'ВТ': '02', 'СР': '03'};
    
    let dayAndHours = hours.split(' ');
    let hoursAndZone = dayAndHours[1].split('+');
    let day = dayNumber[dayAndHours[0]];
    let hour = `${hoursAndZone[0]}:00.000`;
    let zone = `+0${hoursAndZone[1]}:00`;
    return Date.parse(`${year}-${month}-${day}T${hour}${zone}`);
}

function parseBankHours(workingHours) {
    let zone = workingHours.from.split('+')[1];
    let timeToWork = [];
    for (let day of ['ПН', 'ВТ', 'СР']) {
        timeToWork.push({
        from: toUTC(day+' '+workingHours.from),
        to: toUTC(day+' '+workingHours.to)
        });
    }
    return {time: timeToWork,
        zone: `+0${zone}:00`}
}

function getTimeToFun(startTime, endTime, timeToWork) {
    let timeToFun = [];
    for (let time of timeToWork) {
        timeToFun.push({
            from: startTime,
            to: time.from
        });
        startTime = time.to;
    }
    timeToFun.push({
            from: startTime,
            to: endTime
        });
    return timeToFun;
}

function calculateTimeToFun(startTime, endTime, schedule) {
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
        if(time.from <= timeToWork[index].to && timeToWork[index].to <= time.to) {
            timeToWork[index].to = time.to;
        }
        else if (timeToWork[index].to < time.from){
            index += 1;
            timeToWork.push({
                from: time.from,
                to: time.to
            });
        }
    }
    return getTimeToFun(startTime, endTime, timeToWork);
}

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    console.info(schedule, duration, workingHours);

    let timeToWork = parseSchedule(schedule);
    let bankTimeWork = parseBankHours(workingHours);
    let start = Date.parse('2021-02-01T00:00:00.000'+bankTimeWork.zone);
    let end = Date.parse('2021-02-03T23:59:59.999'+bankTimeWork.zone);
    let bankTimeClose = getTimeToFun(start, end, bankTimeWork.time);
    let timeToFun = calculateTimeToFun(start, end, timeToWork.concat(bankTimeClose));
    
    let timeToDo = duration * 60 * 1000;
    let go = [];
    for (let time of timeToFun) {
        if(time.to - time.from >= timeToDo){
            go.push(time);
        }
    }
    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            if (go.length != 0) {
                return true;
            }
            return false;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например, "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            if (!this.exists()) {
                return '""';
            }
            let time = new Date(go[0].from);
            let result = template.replace('%DD', ['ВС', 'ПН', 'ВТ', 'СР',][time.getDay()]);
            result = result.replace('%HH', time.getHours());
            result = result.replace('%MM', time.getMinutes());
            return result;
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {
            return false;
        }
    };
}

module.exports = { getAppropriateMoment, isStar };
