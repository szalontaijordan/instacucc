import express from 'express';
import { processHashtagList } from '../../utils/hashtag';
import { ProfileService } from '../../services/profile.service';

export function IGRouter(profileService: ProfileService) {
    const router = express.Router();

    router.get('/', (req, res) => res.send('<strong>IG</strong><div><pre>Use /:username/:page?hashtags=tag1,tag2&grouped</pre></div>'));

    router.get('/:username/:page', async (req, res) => {
        try {
            const { username, page} = req.params;
            const { hashtags, pageSize, grouped } = req.query;

            const hashtagArray = processHashtagList(hashtags || '');
            const chunkSize = Math.min(Number(pageSize) || 10, 50);

            let response;
            if (grouped !== undefined) {
                response = await profileService.getGroupedUserPosts(username, hashtagArray, Number(page), chunkSize);
            } else {
                response = await profileService.getUserPosts(username, hashtagArray, Number(page), chunkSize);
            }

            res.send(response);
        } catch (e) {
            const message = e.message || e.statusText || 'Internal error';
            const status = e.status || 500;

            res.status(status).send({ message });
        }
    });

    router.get('/ig/:username', async (req, res) => {
        const { username } = req.params;
        const { hashtags } = req.query;

        const hashtagArray = processHashtagList(hashtags || '');
        const response = await profileService.getUserPosts(username, hashtagArray, 1);
        res.send(`
            <style>
                .instagram-media {
                    flex: 0 0 25%
                }
            </style>
            <div style="display: flex; flex-wrap: wrap; justify-content: space-evenly;">
                ${response.posts.map(x => x.template).join('')}
            </div>
        `);
    });

    return router;
};
