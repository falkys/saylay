const Rcon = require('rcon');
const logger = require("../Utils/logger")
function send(command, options = {}) {
  const {
    host = '127.0.0.1',
    port = 25575,
    password = '010101'
  } = options;

  return new Promise((resolve, reject) => {
    const rcon = new Rcon(host, port, password);

    rcon.on('auth', () => {
      logger.log(" Подключено", "rcon")
      rcon.send(command);
    });

    rcon.on('response', (response) => {
      logger.log(`Ответ: ${response}`, "rcon")
      rcon.disconnect();
      resolve(response);
    });

    rcon.on('error', (err) => {
      logger.log(`Ошибка: ${err}`, "rcon")
      reject(err);
    });

    rcon.on('end', () => {
      logger.log(`Соединение закрыто`, "rcon")
    });

    rcon.connect();
  });
}

module.exports = {send}