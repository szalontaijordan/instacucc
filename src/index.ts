import { launch } from 'puppeteer';
import { ProfileService } from './services/profile.service';

import * as fs from 'fs';

(async () => {
    try {
        const browser = await launch();
        const profileService = new ProfileService(browser);
        {
            const response = await profileService.getUserPosts('iringodesign', 10, 0);
            fs.writeFileSync('../iringodesign.json', JSON.stringify(response, null, 2))
            console.log(response.posts.length);
        }
        {
            const response = await profileService.getUserPosts('g.szalontai', 33, 0);
            fs.writeFileSync('../g.szalontai.json', JSON.stringify(response, null, 2))
            console.log(response.posts.length);
        }
        {
            const response = await profileService.getUserPosts('therock', 50, 0);
            fs.writeFileSync('../therock.json', JSON.stringify(response, null, 2))
            console.log(response.posts.length);
        }
    } catch (e) {
        console.error(e);
    }
})();
