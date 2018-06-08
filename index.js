require('dotenv').load()

const Discord = require('discord.js')

const clients = {
  kzarka: new Discord.Client(),
  kutum: new Discord.Client(),
}

const schedule = require('node-schedule')
const moment = require('moment')
moment.locale('en')

const ALERT_TIMER = 15

const BOSSES = [
  {
    index: 0,
    type: `kzarka`,
    alert: `:timer: @everyone Kzarka กำลังจะเกิดในอีก ${ALERT_TIMER} นาที เตรียมตัวไปตายกันเถอะ!`,
    spawn: `:loudspeaker: @everyone เสียงคำรามของพระเจ้าแห่งการทุจริต คจาคาร์ กำลังสั่นสะเทือนเซเรนเดีย`,
    schedule: [
      { day: 0, hour: 0, minute: 0 },
      { day: 0, hour: 10, minute: 0 },
      { day: 0, hour: 18, minute: 0 },
      { day: 1, hour: 14, minute: 0 },
      { day: 2, hour: 18, minute: 0 },
      { day: 3, hour: 0, minute: 0 },
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
    alert: `:timer: @everyone Kutum กำลังจะเกิดในอีก ${ALERT_TIMER} นาที เตรียมตัวไปตายกันเถอะ!`,
    spawn: `:loudspeaker: @everyone หัวใจของคูทุมโบราณในห้องหินทรายสีแดงกำลังสั่นระริก`,
    schedule: [
      { day: 0, hour: 14, minute: 0 },
      { day: 1, hour: 10, minute: 0 },
      { day: 1, hour: 18, minute: 0 },
      { day: 2, hour: 14, minute: 0 },
      { day: 3, hour: 18, minute: 0 },
      { day: 4, hour: 0, minute: 0 },
      { day: 4, hour: 14, minute: 0 },
      { day: 5, hour: 10, minute: 0 },
      { day: 5, hour: 18, minute: 0 },
      { day: 6, hour: 14, minute: 0 },
    ],
  },
]

const ACTIVITY_OPTIONS = { type: 'PLAYING' }

let CHANNELS = {
  kzarka: null,
  kutum: null,
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

    let alert = spawn.clone().subtract(ALERT_TIMER, 'minutes')

    schedule.scheduleJob(`${alert.minute()} ${alert.hour()} * * ${alert.day()}`, ((boss, alert) => {
      CHANNELS[boss.type].send(boss.alert)
    }).bind(null, boss, alert))
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
