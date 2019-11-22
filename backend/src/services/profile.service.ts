import { Browser, Page } from 'puppeteer';
import fetch from 'node-fetch';
import { GraphUserResponse, Edge, GraphUser, InstagramUserProfile } from 'instagram.types';
import { InstagramPost, InstagramPostMap } from 'common.types';
import { createEmbedTemplate } from './embed.template';
import { hashtagRegex } from '../utils/hashtag';
import { CahceService } from './cache.service';

export class ProfileService {

    constructor(private browser: Browser, private cacheService: CahceService) {
    }

    async getUserProfile(username: string): Promise<GraphUser> {
        const page = await this.browser.newPage();
        await page.goto(`https://instagram.com/${username}`, { waitUntil: 'domcontentloaded' });

        const user = await this.getInitialUserProfile(username, page);

        await page.close();
        return user;
    }

    async getUserPosts(username: string, hashtags: Array<string>, page: number, pageSize: number = 10): Promise<{ posts: Array<InstagramPost> }> {
        const chunk = await this.getUserPostChunk(username, pageSize, (page - 1) * pageSize);

        if (!hashtags || hashtags.length === 0) {
            return chunk;
        }

        const posts = chunk.posts.filter(post => {
            return Array.isArray(post.hashTags)
                && post.hashTags.some(tag => hashtags.includes(tag));;
        });

        return { posts };
    }

    async getGroupedUserPosts(username: string, hashtags: Array<string>, page: number, pageSize: number = 10): Promise<{ groups: { [hashtag: string]: Array<InstagramPost> } }> {
        const groups: { [hashtag: string]: Array<InstagramPost> } = { 'nohashtag': [] };
        const results = await this.getUserPosts(username, hashtags, page, pageSize);

        if (!Array.isArray(hashtags) || hashtags.length === 0) {
            results.posts.forEach(post => post.hashTags.forEach(tag => groups[tag] = []));
        } else {
            hashtags.forEach(tag => groups[tag] = []);
        }

        results.posts.forEach(post => {
            if (post.hashTags.length === 0) {
                groups['nohashtag'].push({ ...post });
            } else {
                post.hashTags.forEach(tag => groups[tag] && groups[tag].push({ ...post }));
            }
        });

        return { groups };
    }

    private getTemplateForPost(post: InstagramPost, username: string) {
        const { shortCode, takenAtTimestamp } = post;
        return createEmbedTemplate(shortCode, username, takenAtTimestamp);
    }

    private async getUserPostChunk(username: string, $top: number, $skip: number): Promise<{ posts: Array<InstagramPost> }> {
        console.time(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
        const posts: InstagramPostMap = {};
        let userProfile: InstagramUserProfile = this.cacheService.getInitialUserProfile(username);
        let url: string;
        let user: GraphUser;

        if (userProfile) {
            url = userProfile.url.replace(/\"first\":[0-9]+/, `"first":${$top}`);
            user = userProfile.user;
        } else {
            const page = await this.createProfilePage($top);
            const getGraphQLQuery: Promise<string> = new Promise(resolve => {
                page.on('response', async response => {
                    if (this.isGraphURL(response)) {
                        const json = await response.json();
                        resolve(json.url);
                    }
                });
            });

            await page.goto(`https://instagram.com/${username}`);
            await page.waitForFunction('window._sharedData !== undefined');

            user = await this.getInitialUserProfile(username, page);

            if (!user.edge_owner_to_timeline_media.page_info.has_next_page) {
                url = 'single-page';
            } else {
                url = await getGraphQLQuery;
            }

            // wont wait for this to happen
            page.close();
            this.cacheService.setInitialUserProfile(username, { url, user });
        }

        user.edge_owner_to_timeline_media.edges.forEach((edge, i) => posts[edge.node.shortcode] = this.mapEdgeToPost(edge, i));

        if (url === 'single-page' || this.isPageFull(posts, $skip, $top)) {
            console.timeEnd(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
            return {
                posts: this.getPageOfPosts(posts, $skip, $top)
            };
        } else {
            const queryPosts = await this.queryInstagramGraphQL(user, url, posts, $top, $skip);
            console.timeEnd(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
            return {
                posts: this.getPageOfPosts(queryPosts, $skip, $top)
            };
        }
    }

    private async getInitialUserProfile(username: string, page: Page): Promise<GraphUser> {
        let userProfile = this.cacheService.getInitialUserProfile(username);
        if (!userProfile) {
            const initialData: GraphUserResponse = await page.evaluate(() => {
                return (window as any)._sharedData.entry_data.ProfilePage[0].graphql as GraphUserResponse;
            });
            return initialData.user;
        }

        return userProfile.user;
    }

    private async queryInstagramGraphQL(user: GraphUser, url: string, postMap: InstagramPostMap, $top: number, $skip: number): Promise<InstagramPostMap> {
        const posts: InstagramPostMap = { ...postMap };
    
        let page_info = user.edge_owner_to_timeline_media.page_info;

        while (!this.isPageFull(posts, $skip, $top) && page_info.has_next_page) {
            url = url.replace(/\"after\":\".*\"/, `"after":"${page_info.end_cursor}"`);
            console.log('[ProfileService]: GET', url);

            const response = await fetch(url);
            if (!response.ok) {
                const { status, statusText, headers } = response;
                throw new Error(JSON.stringify({ status, statusText, headers }));
            }
            const json = await response.json() as ({ data: GraphUserResponse });
            user = json.data.user;

            page_info = user.edge_owner_to_timeline_media.page_info;
            user.edge_owner_to_timeline_media.edges.forEach((edge, i) => posts[edge.node.shortcode] = this.mapEdgeToPost(edge, i));
        }

        return posts;
    }

    private async createProfilePage(batchSize: number = 20): Promise<Page> {
        const page = await this.browser.newPage();

        page.setRequestInterception(true);
        page.on('console', x => console.log('[PUPPETEER]: ', x.text()));
        page.on('request', async (request) => {
            if (this.isGraphURL(request)) {
                const newURL = decodeURIComponent(request.url()).replace(/\"first\":[0-9]+/, `"first":${batchSize}`);

                request.respond({
                    status: 200,
                    body: JSON.stringify({ url: newURL }),
                    contentType: 'application/json'
                });
            } else {
                request.continue();
            }
        });

        return page;
    }

    private mapEdgeToPost(edge: Edge, index: number): InstagramPost {
        const node = edge.node;
        const caption = node.edge_media_to_caption.edges[0] ? node.edge_media_to_caption.edges[0].node.text : '';
        const shortCode = node.shortcode;
        const hashTags = caption.match(hashtagRegex) || [];
        const takenAtTimestamp = node.taken_at_timestamp;

        const post = { caption, shortCode, hashTags: hashTags.map(tag => tag.toLowerCase()), takenAtTimestamp };
        const template = this.getTemplateForPost(post, edge.node.owner.username).replace(/\s+/g, ' ');

        return { ...post, template };
    }

    private getPageOfPosts(posts: InstagramPostMap, $skip: number, $top: number): Array<InstagramPost> {
        return Object.values(posts).slice($skip, $skip + $top);
    }

    private isPageFull(posts: InstagramPostMap, $skip: number, $top: number): boolean {
        return Object.values(posts).length >= $skip + $top;
    }

    private isGraphURL(x: { url: () => string }): boolean {
        return x.url().includes('graphql/query') && !x.url().includes('user_id');
    }
}
