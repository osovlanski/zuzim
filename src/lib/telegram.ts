import TelegramBot from 'node-telegram-bot-api';
import { querySummary } from './db';

let botInstance: TelegramBot | null = null;

function getBot(): TelegramBot | null {
  if (!process.env.TELEGRAM_BOT_TOKEN) return null;
  if (!botInstance) {
    botInstance = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: false });
  }
  return botInstance;
}

export async function sendAlert(message: string): Promise<void> {
  const bot = getBot();
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!bot || !chatId) return;
  await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
}

export async function sendDailySummary(): Promise<void> {
  const today = new Date().toISOString().split('T')[0];
  const summary = querySummary(today, today);

  if (summary.transactionCount === 0) {
    await sendAlert(`📊 *Daily Summary - ${today}*\nNo transactions today.`);
    return;
  }

  const topCategories = summary.categoryBreakdown
    .sort((a, b) => a.total - b.total)
    .slice(0, 3);

  const categoryLines = topCategories
    .map(c => `  • ${c.category}: ₪${Math.abs(c.total).toFixed(2)}`)
    .join('\n');

  const totalSpent = Math.abs(summary.totalAmount).toFixed(2);

  const message = [
    `📊 *Daily Summary - ${today}*`,
    `💰 Total spent: ₪${totalSpent}`,
    `🧾 Transactions: ${summary.transactionCount}`,
    ``,
    `*Top categories:*`,
    categoryLines,
  ].join('\n');

  await sendAlert(message);
}
