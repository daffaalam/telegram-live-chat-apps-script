const version = 2107132240

/**
 * @param {object} e 
 */
function doPost(e) {
  if (e.postData.type != 'application/json') return;
  let data = JSON.parse(e.postData.contents);
  let message = data.message;
  if (!message || isBotCommand(message.entities)) return;
  if (message.chat.type == 'private') {
    let req = forwardMessage(message.chat.id, message.message_id);
    setCache(this.admin + ':' + req.result.message_id, message.chat.id.toString());
    return;
  }
  if (message.chat.id == this.admin && message.reply_to_message) {
    let chat_id = 0;
    if (message.reply_to_message.forward_from) {
      chat_id = message.reply_to_message.forward_from.id;
    } else {
      chat_id = getCache(this.admin + ':' + message.reply_to_message.message_id);
    }
    copyMessage(parseInt(chat_id.toString()), message.message_id);
    return;
  }
}

/**
 * @param {object} data 
 * @param {string} data.token 
 * @param {number} data.admin 
 * @param {CacheService.Cache} data.cache 
 * @param {string} data.exec 
 * 
 * contact me at Telegram.
 * username: daffaalam
 * id: 256902271
 * 
 * @return {this} 
 */
function init(data) {
  if (!data || data == {}) throw 'data must not be null or empty';
  if (!data.token) throw 'data token must not be null or empty';
  if (!data.admin) throw 'data admin must not be null or empty';
  if (!data.cache) throw 'data cache must not be null or empty';
  if (!data.exec) throw 'data exec must not be null or empty';
  this.token = data.token;
  this.admin = data.admin;
  this.cache = data.cache;
  this.exec = data.exec;
  return this;
}

/**
 * @param {string} method 
 * @param {object} data 
 * @return {object} 
 */
function request(method, data) {
  data = JSON.stringify(data, null, 2);
  let url = 'https://api.telegram.org/bot' + this.token + '/';
  let params = {
    'contentType': 'application/json',
    'method': 'post',
    'payload': data,
    'muteHttpExceptions': true
  };
  let req = UrlFetchApp.fetch(url + method, params);
  let res = JSON.parse(req.getContentText());
  if (res.ok) return res;
  else throw res.description + '\n\n`' + data + '`';
}

/**
 * @param {object} entities 
 * @return {boolean} 
 */
function isBotCommand(entities) {
  if (!entities) return false;
  let command = entities[0].type == 'bot_command';
  let offset = entities[0].offset == 0;
  if (command && offset) return true;
  return false;
}

function forwardMessage(from_chat_id, message_id, chat_id = this.admin) {
  let params = {
    chat_id: chat_id,
    from_chat_id: from_chat_id,
    message_id: message_id
  }
  return request('forwardMessage', params);
}

function copyMessage(chat_id, message_id, from_chat_id = this.admin) {
  let params = {
    chat_id: chat_id,
    from_chat_id: from_chat_id,
    message_id: message_id
  };
  return request('copyMessage', params);
}

/**
 * @return {object} 
 */
function setWebhook() {
  deleteWebhook();
  let params = {
    url: 'https://script.google.com/macros/s/' + this.exec + '/exec',
    allowed_updates: ['message', 'poll']
  };
  return request('setWebhook', params);
}

/**
 * @return {object} 
 */
function deleteWebhook() {
  return request('deleteWebhook');
}

/**
 * @param {string} key 
 * @param {string} data 
 */
function setCache(key, data) {
  return this.cache.put(key, data, 21600);
}

/**
 * @param {string} key 
 * @return {string} 
 */
function getCache(key) {
  return this.cache.get(key);
}
