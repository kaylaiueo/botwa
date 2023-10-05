const qrcode = require("qrcode-terminal");
const { Client } = require("whatsapp-web.js");
const { Configuration, OpenAIApi } = require("openai");
require("dotenv").config();

const client = new Client();

client.initialize();

client.on("qr", (qr) => {
  qrcode.generate(qr, { small: true });
});

client.on("ready", () => {
  console.log("Client is ready!");
});

const config = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openAi = new OpenAIApi(config);

async function runCompletion(msg) {
  const completion = await openAi.createCompletion({
    model: "text-davinci-003",
    prompt: msg,
    max_tokens: 300,
    temperature: 0,
    top_p: 1.0,
    frequency_penalty: 0.0,
    presence_penalty: 0.0,
  });

  return completion.data.choices[0].text.replace(/(\r\n|chi\n|\r)/gm, "");
}

client.on("message", async (message) => {
  if (message.body === "!help") {
    message.reply(
      "list commands \n- !sticker \nmaybe in the future I'll add others hehe -ai"
    );
  } else if (message.type === "image" && message.body.startsWith("!sticker")) {
    const media = await message.downloadMedia();

    client.sendMessage(message.from, media, { sendMediaAsSticker: true });
  } else if (message.body.startsWith("!ask")) {
    const msg = message.body.split("!ask")[1];

    if (!msg) {
      return message.reply(
        "please write a question, for example !ask blah blah"
      );
    }

    client.sendMessage(message.from, "Please wait...", { quoted: message });
    const response = await runCompletion(msg);
    message.reply(response);
  }
});
