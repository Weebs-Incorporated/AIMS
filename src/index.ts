import app from './app';
import CONFIG from './config';

app.listen(CONFIG.port, () => {
    console.log(`Listening on port ${CONFIG.port}`);
});
