const mineflayer = require('mineflayer')
const armorManager = require('mineflayer-armor-manager')
const pvp = require('mineflayer-pvp').plugin
var tpsPlugin = require('mineflayer-tps')(mineflayer)
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder')
const autoeat = require('mineflayer-auto-eat').plugin
const GoalFollow = goals.GoalFollow
const GoalBlock = goals.GoalBlock

var vec3 = require('vec3');
var eventEmitter = require('events').EventEmitter;

const COMMANDS = ['help', 'echo', 'attack', 'stopattack', 'follow', 'stopfollow', 'tps']

const PREFIX = '$'
var hastarget = false
const GOD = 'Nxy__'

const bot = mineflayer.createBot({
    host: 'SERVER',
    port: '25565',
    username: 'BOTNAME',
    auth: 'microsoft'
})


var master = 'Nxy__'
var attacking = false;

bot.loadPlugin(tpsPlugin)
bot.loadPlugin(pvp)
bot.loadPlugin(pathfinder)
bot.loadPlugin(armorManager)
bot.loadPlugin(autoeat)

function replaceAll(str, find, replace) {
    return str.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

function followPlayer() {
    console.log('following');
    const playerCI = bot.players[master]

    if (!playerCI || !playerCI.entity) {    
        return
    }
    
    const mcData = require('minecraft-data')(bot.version)
    const movements = new Movements(bot, mcData)
    movements.scafoldingBlocks = []
    bot.pathfinder.setMovements(movements)
    const goal = new GoalFollow(playerCI.entity, 1)
    bot.pathfinder.setGoal(goal, true)
}

function onmessage(message){
    message = String(message)
    console.log(String(message));
    let msg = message.split(PREFIX)[1]
    // if(!String(msg).endsWith('‌')) return
    // msg = msg.replace('‌', '')
    if(msg != undefined){
        rawmsg = msg.split(" ")[0]

        if(rawmsg=== 'eat'){
            if (bot.food === 20) {
                bot.autoEat.disable()
                bot.chat('I am at full hunger!')
            }
            else bot.autoEat.enable()
        }

        if(rawmsg === 'help'){
            bot.chat('Commands: ' + String(COMMANDS).replaceAll(',', ', '))
        }
        if(rawmsg === 'armour'){
            bot.armorManager.equipAll()
        }

        if(rawmsg === 'drop'){
            if(msg.split(" ")[1] === undefined) bot.chat('Please choose a slot!')
            else if (bot.inventory.items()[msg.split(" ")[1]] === undefined) bot.chat('There is no item in that slot!')
            else {
                item = bot.inventory.items()[msg.split(" ")[1]]
                bot.tossStack(item)
            }
        }

        if (rawmsg === 'echo'){
            if(String(msg.substring(msg.indexOf(' ') + 1)).startsWith('/')) bot.chat('I cannot run commands!')
            else bot.chat(msg.substring(msg.indexOf(' ') + 1))
        }

        if(rawmsg === 'for-each'){
            for (let i = 0; i < msg.split(" ")[1]; i++) {
                bot.chat(msg.split(" ")[2])
            }
        }

        if(rawmsg === 'attack'){
            if (msg.split(" ")[1] === GOD || msg.split(" ")[1] === bot.username){
                bot.chat('No!')
            }
            else {
                if(bot.players[msg.split(" ")[1]] === undefined){
                    bot.chat('Not a valid player!')
                } else {
                    hastarget = true
                    bot.pvp.attack(bot.players[msg.split(" ")[1]].entity)
                }
            } 

        }
        if(rawmsg === 'stopattack'){
            hastarget = false
            bot.pvp.stop()
        }
        if(rawmsg === 'follow'){
            hastarget = false
            master = msg.split(" ")[1]
        }
        if(rawmsg === 'stopfollow'){
            hastarget = false
            master = bot.username
        }
        if(rawmsg === 'slot'){
            if(msg.split(" ")[1] < 0 || msg.split(" ")[1] > 8) bot.chat('slots only range from 0-8')
            else bot.setQuickBarSlot(msg.split(" ")[1])
        }
        if(rawmsg === 'tps'){
            bot.chat('Current TPS: ' + bot.getTps())
        }
    }
    return
}

function switchstates(){
    if(hastarget === true){
        return
    }
    else{
        const playerCI = bot.players[master]

        if (!playerCI || !playerCI.entity) {    
            return
        }

        const mcData = require('minecraft-data')(bot.version)
        const movements = new Movements(bot, mcData)
        movements.scafoldingBlocks = []
        bot.pathfinder.setMovements(movements)
        const goal = new GoalFollow(playerCI.entity, 1)
        bot.pathfinder.setGoal(goal, true)
    }
}

function killua(){
    setInterval(() => {
        const mobFilter = e => e.type === 'player'
        const mob = bot.nearestEntity(mobFilter)

        if (!mob) return;

        followPlayer(mob)
        bot.attack(mob);
    }, 1600);
    return
}



bot.on('physicTick', switchstates)

bot.on('death', () => {
    hastarget = false
})

bot.on('entityGone', (entity) => {
    if(entity === bot.pvp.target) hastarget = false
})

bot.on('messagestr', (message) => {
    onmessage(message)
})


bot.on('kicked', console.log)

bot.once('spawn', () => {
    bot.autoEat.options = {
      priority: 'foodPoints',
      startAt: 14,
      bannedFood: []
    }
})

bot.on('autoeat_started', () => {
    console.log('Auto Eat started!')
})
  
bot.on('autoeat_stopped', () => {
    console.log('Auto Eat stopped!')
})
  
bot.on('health', () => {
    if (bot.food === 20) bot.autoEat.disable()
    // Disable the plugin if the bot is at 20 food points
    else bot.autoEat.enable() // Else enable the plugin again
})
