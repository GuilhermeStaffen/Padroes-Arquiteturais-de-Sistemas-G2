import { EmailNotificationConsumer } from './consumers/EmailNotificationConsumer';
import { DiscordNotificationConsumer } from './consumers/DiscordNotificationConsumer';

const emailConsumer = new EmailNotificationConsumer();
const discordConsumer = new DiscordNotificationConsumer();

async function start() {
    try {
        await emailConsumer.start();
        await discordConsumer.start();
        console.log('[*] Todos os consumers iniciados.');
    } catch (error) {
        console.error('Falha ao iniciar os consumers:', error);
        process.exit(1);
    }
}

start();
