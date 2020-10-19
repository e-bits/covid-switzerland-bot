require('dotenv').config()

const Telegraf = require('telegraf')
const session = require('telegraf/session')
const Stage = require('telegraf/stage')
const Scene = require('telegraf/scenes/base')
const CovidParser = require('./covidParser')

// Handler factoriess
const { enter, leave } = Stage

// GetNewCOVID cases scene
const getNewCasesScene = new Scene('getnewcases')
getNewCasesScene.enter((ctx) => ctx.replyWithMarkdown(`Please entry your canton abbreviation e.g. *SZ*, *UR* or *ZH*`))
getNewCasesScene.leave((ctx) => ctx.reply('exiting scene'))
getNewCasesScene.command('back', leave())
getNewCasesScene.on('text', (ctx) => handleCanton(ctx))
getNewCasesScene.on('message', (ctx) => ctx.reply('Only text messages please'))

async function handleCanton(ctx) {
  if(ctx.message.text.length === 2) {
    ctx.replyWithMarkdown(await CovidParser.formatAsMarkdown(ctx.message.text.toUpperCase()));
  } else {
    ctx.replyWithMarkdown(`Please enter 2 letter canton abbreviation e.g. *SZ*, *UR* or *ZH*`)
  }
  logUserInfo(ctx)
}

function handleStart(ctx) {
  ctx.replyWithMarkdown(`Hello! 😷\nI can send you detailed information about COVID-19 cases in your canton.\nTry /getnewcases`)
  logUserInfo(ctx)
}

function logUserInfo(ctx){
  console.log(ctx.from)
}

const bot = new Telegraf(process.env.BOT_TOKEN)
const stage = new Stage([getNewCasesScene], { ttl: 20 })

bot.use(session())
bot.use(stage.middleware())
bot.command('start', (ctx) => handleStart(ctx))
bot.command('getnewcases', (ctx) => ctx.scene.enter('getnewcases'))
bot.on('message', (ctx) => ctx.reply('Try /getnewcases'))
bot.launch()