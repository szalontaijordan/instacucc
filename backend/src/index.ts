import express from 'express';
import cors from 'cors';

import { launch } from 'puppeteer';

import { ProfileService } from './services/profile.service';
import { APIRouter } from './controllers/api/api.controller';
import { CacheServiceNode } from './services/cache.service.node';

(async () => {
    const app = express();
    const port = process.env.PORT || 3001;

    const browser = await launch({ args: [ '--no-sandbox' ]});
    const cacheService = new CacheServiceNode();
    const profileService = new ProfileService(browser, cacheService);

    app.set('trust proxy', 1);

    app.use(cors());
    app.use('/api', APIRouter(profileService));
    app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
        // TODO:
        if (err) {
            res.status(500).send({ error: err });
        } else {
            next();
        }
    });

    app.listen(port, () => console.log('Application starts at port:', port));
})();
