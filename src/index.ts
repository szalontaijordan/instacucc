import { launch } from 'puppeteer';
import { ProfileService } from './services/profile.service';

import express from 'express';

(async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    const browser = await launch({ args: [ '--no-sandbox' ]});
    const profileService = new ProfileService(browser);

    app.get('/ig/:username/:page', async (req, res) => {
        try {
            const { username, page} = req.params;
            const response = await profileService.getUserPosts(username, Number(page));
            res.send(response);
        } catch (e) {
            const message = e.message || e.statusText || 'Internal error';
            const status = e.status || 500;

            res.status(status).send({ message });
        }
    });

    app.listen(port, () => console.log('Application starts at port', port));
})();
