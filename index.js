require('dotenv').load()

const Discord = require('discord.js')

const clients = {
  kzarka: new Discord.Client(),
  kutum: new Discord.Client(),
  nouver: new Discord.Client(),
  karanda: new Discord.Client(),
}

const schedule = require('node-schedule')
const moment = require('moment')
moment.locale('en')
const sprintf = require('sprintf-js').sprintf
const random = require("random-js")()

const MENTION = '@boss'
const ALERT_TIMERS = [30, 15]
const BOSSES = [{
    index: 0,
    type: `kzarka`,
    alert: `:timer: ${MENTION} **คจาคาร์** กำลังจะเกิดในอีก %d นาที`,
    spawn: `:loudspeaker: ${MENTION} เสียงคำรามของพระเจ้าแห่งการทุจริต คจาคาร์ กำลังสั่นสะเทือนเซเรนเดีย`,
    schedule: [{
        day: 0,
        hour: 0,
        minute: 30
      },
      {
        day: 0,
        hour: 10,
        minute: 0
      },
      {
        day: 1,
        hour: 0,
        minute: 30
      },
      {
        day: 1,
        hour: 19,
        minute: 0
      },
      {
        day: 2,
        hour: 10,
        minute: 0
      },
      {
        day: 3,
        hour: 0,
        minute: 30
      },
      {
        day: 3,
        hour: 10,
        minute: 0
      },
      {
        day: 3,
        hour: 23,
        minute: 0
      },
      {
        day: 4,
        hour: 10,
        minute: 0
      },
      {
        day: 4,
        hour: 19,
        minute: 0
      },
      {
        day: 5,
        hour: 14,
        minute: 0
      },
      {
        day: 6,
        hour: 10,
        minute: 0
      },
    ],
  },
  {
    index: 1,
    type: `kutum`,
    alert: `:timer: ${MENTION} **คูทุม** กำลังจะเกิดในอีก %d นาที`,
    spawn: `:loudspeaker: ${MENTION} หัวใจของคูทุมโบราณในห้องหินทรายสีแดงกำลังสั่นระริก`,
    schedule: [{
        day: 0,
        hour: 6,
        minute: 0
      },
      {
        day: 0,
        hour: 14,
        minute: 0
      },
      {
        day: 1,
        hour: 23,
        minute: 0
      },
      {
        day: 2,
        hour: 6,
        minute: 0
      },
      {
        day: 2,
        hour: 14,
        minute: 0
      },
      {
        day: 3,
        hour: 19,
        minute: 0
      },
      {
        day: 4,
        hour: 0,
        minute: 30
      },
      {
        day: 4,
        hour: 14,
        minute: 0
      },
      {
        day: 5,
        hour: 10,
        minute: 0
      },
      {
        day: 6,
        hour: 0,
        minute: 30
      },
      {
        day: 6,
        hour: 10,
        minute: 0
      },
    ],
  },
  {
    index: 2,
    type: `nouver`,
    alert: `:timer: ${MENTION} **นูเวอร์** กำลังจะเกิดในอีก %d นาที`,
    spawn: `:loudspeaker: ${MENTION} ร่องรอยของนูเวอร์ถูกเปิดเผยหลังจากพายุทรายผ่านไป`,
    schedule: [{
        day: 0,
        hour: 14,
        minute: 0
      },
      {
        day: 0,
        hour: 23,
        minute: 0
      },
      {
        day: 1,
        hour: 14,
        minute: 0
      },
      {
        day: 2,
        hour: 0,
        minute: 30
      },
      {
        day: 2,
        hour: 19,
        minute: 0
      },
      {
        day: 2,
        hour: 23,
        minute: 0
      },
      {
        day: 4,
        hour: 6,
        minute: 0
      },
      {
        day: 4,
        hour: 23,
        minute: 0
      },
      {
        day: 5,
        hour: 19,
        minute: 0
      },
      {
        day: 6,
        hour: 6,
        minute: 0
      },
      {
        day: 6,
        hour: 14,
        minute: 0
      },
    ],
  },
  {
    index: 3,
    type: `karanda`,
    alert: `:timer: ${MENTION} **คารานด้า** กำลังจะเกิดในอีก %d นาที`,
    spawn: `:loudspeaker: ${MENTION} ลึกเข้าไปในสันเขา, ที่ปีกแห่งคารานด้า มีเหล่าฮาร์ปี้กำลังขู่คำราม`,
    schedule: [{
        day: 0,
        hour: 0,
        minute: 30
      },
      {
        day: 0,
        hour: 10,
        minute: 0
      },
      {
        day: 0,
        hour: 19,
        minute: 0
      },
      {
        day: 1,
        hour: 6,
        minute: 0
      },
      {
        day: 2,
        hour: 10,
        minute: 0
      },
      {
        day: 3,
        hour: 14,
        minute: 0
      },
      {
        day: 4,
        hour: 19,
        minute: 0
      },
      {
        day: 5,
        hour: 23,
        minute: 0
      },
      {
        day: 6,
        hour: 14,
        minute: 0
      },
    ],
  },
]

const ACTIVITY_OPTIONS = {
  type: 'PLAYING'
}

let PREFIX = '!'
let CHANNELS = {
  kzarka: undefined,
  kutum: undefined,
  nouver: undefined,
  karanda: undefined,
}

function init(boss) {
  boss.schedule.forEach((datetime) => {
    let spawn = moment().set({
      day: datetime.day,
      hour: datetime.hour,
      minute: datetime.minute,
      second: 0,
      millisecond: 0,
    });

    schedule.scheduleJob(`${spawn.minute()} ${spawn.hour()} * * ${spawn.day()}`, ((boss, spawn) => {
      if (CHANNELS[boss.type] != undefined) {
        CHANNELS[boss.type].send(boss.spawn)
      }
    }).bind(null, boss, spawn))

    ALERT_TIMERS.forEach((timer) => {
      let alert = spawn.clone().subtract(timer, 'minutes')

      schedule.scheduleJob(`${alert.minute()} ${alert.hour()} * * ${alert.day()}`, ((boss, alert, timer) => {
        if (CHANNELS[boss.type] != undefined) {
          CHANNELS[boss.type].send(sprintf(boss.alert, timer))
        }
      }).bind(null, boss, alert, timer))
    });
  });

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
  });

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

function doBind(chat, boss) {
  if (CHANNELS[boss.type] == undefined) {
    chat.channel.send(`:wrench: ตั้งค่าการแจ้งเตือนบอสใน #${chat.channel.name}`)
  } else {
    chat.channel.send(`:wrench: เปลี่ยนการแจ้งเตือนบอสจาก #${CHANNELS[boss.type].name} เป็น #${chat.channel.name}`)
  }

  CHANNELS[boss.type] = chat.channel
}

function doChangePrefix(chat, prefix) {
  chat.channel.send(`:wrench: คำสั่งถูกเปลี่ยนจาก \`${PREFIX}\` เป็น \`${prefix}\``)

  PREFIX = prefix
}

BOSSES.forEach((boss) => {
  clients[boss.type].on('ready', () => {
    init(boss)

    console.log(`Overboss (${boss.type}) is runing.`)
  });

  clients[boss.type].on('message', chat => {
    let content = chat.content.toLocaleLowerCase()

    if (content.startsWith(PREFIX)) {
      let params = content.split(' ')
      params[0] = params[0].slice(1)

      switch (params[0]) {
        case 'bind':
          return doBind(chat, boss)

        case 'prefix':
          return doChangePrefix(chat, params[1])
      }
    }
  });
});

clients.kzarka.login(process.env.KZARKA_BOT_TOKEN)
clients.kutum.login(process.env.KUTUM_BOT_TOKEN)
clients.nouver.login(process.env.NOUVER_BOT_TOKEN)
clients.karanda.login(process.env.KARANDA_BOT_TOKEN)