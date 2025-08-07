const { makeWASocket, useSingleFileAuthState, DisconnectReason } = require("@whiskeysockets/baileys");
const { default: pino } = require("pino");
const qrcode = require("qrcode-terminal");
const fs = require("fs");

const { state, saveState } = useSingleFileAuthState('./auth_info.json');

async function startSock() {
  const sock = makeWASocket({
    logger: pino({ level: "silent" }),
    auth: state,
    printQRInTerminal: true
  });

  sock.ev.on("creds.update", saveState);

  sock.ev.on("connection.update", (update) => {
    const { connection, lastDisconnect, qr } = update;
    if (qr) qrcode.generate(qr, { small: true });

    if (connection === "close") {
      const shouldReconnect = (lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut);
      if (shouldReconnect) startSock();
    }
  });

  sock.ev.on("messages.upsert", async ({ messages, type }) => {
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    const sender = msg.key.remoteJid;
    const message = msg.message.conversation || msg.message.extendedTextMessage?.text;

    if (message === "hi") {
      await sock.sendMessage(sender, { text: "Hello! Blaze WhatsApp Bot is live 🚀" });
    }
  });
}

startSock();
