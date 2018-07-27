require('dotenv').load()

const Discord = require('discord.js')

const clients = {
  kzarka: new Discord.Client(),
  kutum: new Discord.Client(),
  nouver: new Discord.Client(),
}

const schedule = require('node-schedule')
const moment = require('moment')
moment.locale('en')
const sprintf = require('sprintf-js').sprintf
const random = require("random-js")()

const ALERT_TIMERS = [30, 15]
const ENDING = [
  'เตรียมตัวไปตายกันเถอะ!',
  'ขอให้ความเกลือจงสถิตอยู่กับเจ้า!',
  'หลุดก่อนบอสเกิดแน่นอน!',
  'อย่าลืมหยิบกล่องบอสกลับมาด้วยหละ',
]

const BOSSES = [
  {
    index: 0,
    type: `kzarka`,
    alert: `:timer: @here Kzarka กำลังจะเกิดในอีก %d นาที %s`,
    spawn: `:loudspeaker: @here เสียงคำรามของพระเจ้าแห่งการทุจริต คจาคาร์ กำลังสั่นสะเทือนเซเรนเดีย`,
    schedule: [
      { day: 0, hour: 0, minute: 15 },
      { day: 0, hour: 10, minute: 0 },
      { day: 0, hour: 18, minute: 0 },
      { day: 1, hour: 14, minute: 0 },
      { day: 2, hour: 18, minute: 0 },
      { day: 3, hour: 0, minute: 15 },
      { day: 3, hour: 14, minute: 0 },
      { day: 4, hour: 10, minute: 0 },
      { day: 4, hour: 18, minute: 0 },
      { day: 5, hour: 14, minute: 0 },
      { day: 6, hour: 18, minute: 0 },
    ],
  },
  {
    index: 1,
    type: `kutum`,
    alert: `:timer: @here Kutum กำลังจะเกิดในอีก %d นาที %s`,
    spawn: `:loudspeaker: @here หัวใจของคูทุมโบราณในห้องหินทรายสีแดงกำลังสั่นระริก`,
    schedule: [
      { day: 0, hour: 14, minute: 0 },
      { day: 1, hour: 10, minute: 0 },
      { day: 1, hour: 18, minute: 0 },
      { day: 2, hour: 14, minute: 0 },
      { day: 3, hour: 18, minute: 0 },
      { day: 4, hour: 0, minute: 15 },
      { day: 4, hour: 14, minute: 0 },
      { day: 5, hour: 10, minute: 0 },
      { day: 5, hour: 18, minute: 0 },
      { day: 6, hour: 14, minute: 0 },
    ],
  },
  {
    index: 2,
    type: `nouver`,
    alert: `:timer: @here Nouver กำลังจะเกิดในอีก %d นาที %s`,
    spawn: `:loudspeaker: @here นูเวอร์เกิดโว้ยยยยยยยยยยยยยยยยยยยยยยยย`,
    schedule: [
      { day: 0, hour: 10, minute: 0 },
      { day: 0, hour: 18, minute: 0 },
      { day: 1, hour: 14, minute: 0 },
      { day: 2, hour: 18, minute: 0 },
      { day: 3, hour: 10, minute: 0 },
      { day: 4, hour: 14, minute: 0 },
      { day: 5, hour: 10, minute: 0 },
      { day: 5, hour: 18, minute: 0 },
      { day: 6, hour: 14, minute: 0 },
      { day: 6, hour: 18, minute: 0 },
    ],
  },
]

const ACTIVITY_OPTIONS = { type: 'PLAYING' }

let CHANNELS = {
  kzarka: null,
  kutum: null,
  nouver: null,
}

function init(boss) {
  CHANNELS[boss.type] = clients[boss.type].channels.find('id', process.env.CHANNEL_ID)

  boss.schedule.forEach((datetime) => {
    let spawn = moment().set({
      day: datetime.day,
      hour: datetime.hour,
      minute: datetime.minute,
      second: 0,
      millisecond: 0,
    })

    schedule.scheduleJob(`${spawn.minute()} ${spawn.hour()} * * ${spawn.day()}`, ((boss, spawn) => {
      CHANNELS[boss.type].send(boss.spawn)
    }).bind(null, boss, spawn))

    ALERT_TIMERS.forEach((timer) => {
      let alert = spawn.clone().subtract(timer, 'minutes')

      schedule.scheduleJob(`${alert.minute()} ${alert.hour()} * * ${alert.day()}`, ((boss, alert, timer) => {
        CHANNELS[boss.type].send(sprintf(boss.alert, timer, ENDING[random.integer(0, ENDING.length - 1)]))
      }).bind(null, boss, alert, timer))
    })
  })

  schedule.scheduleJob(`* * * * *`, ((boss) => {
    clients[boss.type].user.setActivity(`Remaining in ${moment().to(findNextRespawn(boss.schedule), true)}`, ACTIVITY_OPTIONS)
  }).bind(null, boss))
}

function findNextRespawn(times) {
  let diff = -1
  let now = moment()
  let week = moment().set({
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  })

  while (diff < 0) {
    for (i in times) {
      let respawn = week.day(times[i].day).hour(times[i].hour).minute(times[i].minute)
      diff = respawn.diff(now, 'seconds')

      if (diff > 0) {
        return respawn
      }
    }

    week.add(1, 'weeks')
  }
}

BOSSES.forEach((boss) => {
  clients[boss.type].on('ready', () => {
    init(boss)
  })
})

clients.kzarka.login(process.env.KZARKA_BOT_TOKEN)
clients.kutum.login(process.env.KUTUM_BOT_TOKEN)
clients.nouver.login(process.env.NOUVER_BOT_TOKEN)
