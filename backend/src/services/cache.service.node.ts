import NodeCahce from 'node-cache';
import { CahceService } from './cache.service';
import { InstagramUserProfile } from 'instagram.types';

export class CacheServiceNode implements CahceService {

    private profileCache = new NodeCahce({ stdTTL: 3600 });

    getInitialUserProfile(username: string): InstagramUserProfile {
        const user = this.profileCache.get<string>(username);
        return user ? JSON.parse(user) as InstagramUserProfile : undefined;
    }

    setInitialUserProfile(username: string, user: InstagramUserProfile): void {
        if (username && user) {
            this.profileCache.set(username, JSON.stringify(user));
        }
    }
}
