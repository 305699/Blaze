const { Boom } = require('@hapi/boom');
const makeWASocket = require('@whiskeysockets/baileys').default;
const { useSingleFileAuthState } = require('@whiskeysockets/baileys');
const { DisconnectReason } = require('@whiskeysockets/baileys');
const pino = require('pino');

// Auth
const { state, saveState } = useSingleFileAuthState('./auth_info.json');

// Start bot
async function startBlazeBot() {
  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    printQRInTerminal: true,
    auth: state
  });

  sock.ev.on('creds.update', saveState);

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const shouldReconnect = (lastDisconnect.error)?.output?.statusCode !== DisconnectReason.loggedOut;
      console.log('connection closed due to', lastDisconnect.error, ', reconnecting:', shouldReconnect);
      if (shouldReconnect) startBlazeBot();
    } else if (connection === 'open') {
      console.log('✅ Bot is now connected!');
    }
  });

  sock.ev.on('messages.upsert', async (m) => {
    const msg = m.messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const messageText = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (!messageText) return;

    console.log('📩 Received:', messageText);

    // Auto-response
    if (messageText.toLowerCase() === 'hi' || messageText.toLowerCase() === 'hello') {
      await sock.sendMessage(sender, { text: '👋 Hello! I am Blaze WhatsApp Bot. How can I assist you?' });
    } else if (messageText.toLowerCase() === 'help') {
      await sock.sendMessage(sender, { text: '🤖 Available commands:\n- hi\n- help\n- info' });
    } else if (messageText.toLowerCase() === 'info') {
      await sock.sendMessage(sender, {
        text: '🔥 Blaze Bot\nMade with @whiskeysockets/baileys\nBuilt to automate your WhatsApp!'
      });
    } else {
      await sock.sendMessage(sender, { text: `You said: "${messageText}"` });
    }
  });
}

startBlazeBot();
