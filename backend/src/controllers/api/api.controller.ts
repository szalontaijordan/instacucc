import express from 'express';
import { IGRouter } from './ig.controller';
import { ProfileService } from '../../services/profile.service';

export function APIRouter(profileService: ProfileService) {
    const router = express.Router();

    router.get('/', (req, res) => res.send('<strong>API</strong><ul><li><a href="/api/ig">ig</a></li></ul>'));
    router.use('/ig', IGRouter(profileService));

    return router;
};
