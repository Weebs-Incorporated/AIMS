import createApp from './app';
import { getConfig } from './config';

const config = getConfig();

createApp(config, false).then((app) => {
    app.listen(config.port, () => {
        console.log(`Listening on port ${config.port}`);
    });
});
