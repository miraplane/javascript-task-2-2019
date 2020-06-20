/* eslint-env mocha */
'use strict';

const assert = require('assert');

const robbery = require('./robbery');

describe('robbery.getAppropriateMoment()', () => {
    function getMomentFor(time) {
        return robbery.getAppropriateMoment(
            {
                Danny: [
                    { from: 'ПН 12:00+5', to: 'ПН 17:00+5' },
                    { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }
                ],
                Rusty: [
                    { from: 'ПН 11:30+5', to: 'ПН 16:30+5' },
                    { from: 'ВТ 13:00+5', to: 'ВТ 16:00+5' }
                ],
                Linus: [
                    { from: 'ПН 09:00+3', to: 'ПН 14:00+3' },
                    { from: 'ПН 21:00+3', to: 'ВТ 09:30+3' },
                    { from: 'СР 09:30+3', to: 'СР 15:00+3' }
                ]
            },
            time,
            { from: '10:00+5', to: '18:00+5' }
        );
    }

    function getMomentForNewBankSchedule(time) {
        return robbery.getAppropriateMoment(
            {
                Danny: [
                    { from: 'ПН 02:00+5', to: 'ВТ 17:00+5' }
                ],
                Rusty: [
                    { from: 'ВТ 13:00+5', to: 'ВТ 23:58+5' }
                ],
                Linus: [
                    { from: 'ПН 09:00+3', to: 'ПН 14:00+3' },
                    { from: 'ПН 21:00+3', to: 'ВТ 09:30+3' }
                ]
            },
            time,
            { from: '00:00+5', to: '23:59+5' }
        );
    }

    it('должен успевать совершать ограбление', () => {
        const moment = getMomentForNewBankSchedule(90);

        assert.ok(moment.exists());
        assert.strictEqual(
            moment.format('Метим на %DD, старт в %HH:%MM!'),
            'Метим на ПН, старт в 00:00!'
        );
    });

    it('должен форматировать существующий момент', () => {
        const moment = getMomentFor(90);

        assert.ok(moment.exists());
        assert.strictEqual(
            moment.format('Метим на %DD, старт в %HH:%MM!'),
            'Метим на ВТ, старт в 11:30!'
        );
    });

    it('должен укладываться в свободный отрезок времени', () => {
        const moment = getMomentFor(60);

        assert.ok(moment.exists());
        assert.strictEqual(
            moment.format('Метим на %DD, старт в %HH:%MM!'),
            'Метим на ПН, старт в 10:00!'
        );
    });

    it('должен вернуть пустую строку при форматировании несуществующего момента', () => {
        const moment = getMomentFor(121);

        assert.ok(!moment.exists());
        assert.strictEqual(
            moment.format('Метим на %DD, старт в %HH:%MM!'),
            ''
        );
    });

    if (robbery.isStar) {
        it('должен перемещаться на более поздний момент [*]', () => {
            const moment = getMomentFor(90);

            assert.ok(moment.tryLater());
            assert.strictEqual(moment.format('%DD %HH:%MM'), 'ВТ 16:00');

            assert.ok(moment.tryLater());
            assert.strictEqual(moment.format('%DD %HH:%MM'), 'ВТ 16:30');

            assert.ok(moment.tryLater());
            assert.strictEqual(moment.format('%DD %HH:%MM'), 'СР 10:00');
        });

        it('не должен сдвигать момент, если более позднего нет [*]', () => {
            const moment = getMomentFor(90);

            assert.ok(moment.tryLater());
            assert.ok(moment.tryLater());
            assert.ok(moment.tryLater());

            assert.ok(!moment.tryLater());
            assert.strictEqual(moment.format('%DD %HH:%MM'), 'СР 10:00');

            assert.ok(!moment.tryLater());
            assert.strictEqual(moment.format('%DD %HH:%MM'), 'СР 10:00');
        });
    }
});
