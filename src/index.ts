import { createApp } from './app';
import { getConfig } from './config';

const config = getConfig();

const app = createApp(config);

app.listen(config.port, () => {
    console.log(`Listening on port ${config.port}`);
});
