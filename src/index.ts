import express from 'express';
import cors from 'cors';

import { launch } from 'puppeteer';

import { ProfileService } from './services/profile.service';
import { APIRouter } from './controllers/api/api.controller';

(async () => {
    const app = express();
    const port = process.env.PORT || 3000;

    const browser = await launch({ args: [ '--no-sandbox' ]});
    const profileService = new ProfileService(browser);

    app.set('trust proxy', 1);

    app.use(cors());
    app.use('/api', APIRouter(profileService));

    app.listen(port, () => console.log('Application starts at port', port));
})();
