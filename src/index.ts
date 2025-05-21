import { Bot } from "grammy";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

// Create a new bot instance with the token from env
const bot = new Bot(process.env.BOT_TOKEN!);

// Basic /start command handler
bot.command("start", async (ctx) => {
  await ctx.reply("Привет! Я готов к работе 🚀");
});

// Launch the bot
bot.start();

console.log("🤖 Бот запущен");
