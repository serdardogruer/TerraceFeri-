const { default: makeWASocket, useMultiFileAuthState, DisconnectReason } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');

const statusFilePath = path.join(__dirname, '../public/whatsapp-status.json');
const processedMsgIds = new Set();

function updateStatus(status) {
  try {
    fs.writeFileSync(statusFilePath, JSON.stringify(status, null, 2));
  } catch (e) {
    console.error('Status dosyası yazılamadı:', e);
  }
}

async function startWhatsAppBot() {
  const { state, saveCreds } = await useMultiFileAuthState('baileys_auth_info');

  const socket = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    connectTimeoutMs: 60000,
    defaultQueryTimeoutMs: 60000,
  });

  socket.ev.on('creds.update', saveCreds);

  // Telefon Numarası ile 8 Haneli Eşleştirme Kodu İste
  if (!socket.authState.creds.registered) {
    setTimeout(async () => {
      try {
        const pairingCode = await socket.requestPairingCode('905305631781');
        const formattedCode = pairingCode?.match(/.{1,4}/g)?.join('-') || pairingCode;
        console.log('\n==========================================');
        console.log(`🔑 05305631781 İÇİN CANLI EŞLEŞTİRME KODUNUZ: ${formattedCode}`);
        console.log('==========================================\n');

        updateStatus({
          isConnected: false,
          pairingCode: formattedCode,
          updatedAt: new Date().toISOString()
        });
      } catch (err) {
        console.error('Pairing code request error:', err?.message || err);
      }
    }, 4000);
  }

  socket.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = (lastDisconnect?.error)?.output?.statusCode;
      console.log(`Bağlantı kapandı (kod: ${statusCode}), tekrar bağlanılıyor...`);
      
      if (statusCode === DisconnectReason.loggedOut || statusCode === 428) {
        try { fs.rmSync('baileys_auth_info', { recursive: true, force: true }); } catch {}
      }
      
      setTimeout(startWhatsAppBot, 5000);
    } else if (connection === 'open') {
      console.log('✅ WHATSAPP BOT CANLI HATTA BAĞLANDI! Numaraya gelen tüm mesajlar dinleniyor (05305631781)');
      updateStatus({
        isConnected: true,
        pairingCode: null,
        updatedAt: new Date().toISOString()
      });
    }
  });

  socket.ev.on('messages.upsert', async (m) => {
    if (!m.messages || m.messages.length === 0) return;

    for (const msg of m.messages) {
      if (!msg.message) continue;

      const msgId = msg.key.id;
      if (processedMsgIds.has(msgId)) continue;

      const text =
        msg.message.conversation ||
        msg.message.extendedTextMessage?.text ||
        msg.message.imageMessage?.caption ||
        '';

      if (!text || text.startsWith('✅') || text.startsWith('ℹ️') || text.startsWith('İşlem')) continue;

      processedMsgIds.add(msgId);
      if (processedMsgIds.size > 200) processedMsgIds.clear();

      const from = msg.key.remoteJid;
      console.log(`📩 [WhatsApp Mesajı Alındı] (${from}): "${text}" (fromMe: ${msg.key.fromMe})`);

      try {
        const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || `http://127.0.0.1:${process.env.PORT || '3000'}`;
        const response = await fetch(`${appUrl}/api/ai-bot/execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });

        const data = await response.json();
        const replyText = data.message || '✅ İşleminiz veritabanında başarıyla gerçekleştirildi.';

        console.log(`⚡ Veritabanı İşlemi Tamamlandı: "${replyText}"`);

        // Bot yanıtı gönder
        if (from && !text.startsWith('✅')) {
          await socket.sendMessage(from, { text: replyText });
          console.log(`📤 WhatsApp Yanıtı Gönderildi (${from})`);
        }
      } catch (err) {
        console.error('Mesaj işleme hatası:', err);
      }
    }
  });
}

startWhatsAppBot();
