import { Browser, Page } from 'puppeteer';
import fetch from 'node-fetch';
import { GraphUserResponse, Edge } from 'instagram.types';
import { InstagramPost, InstagramPostMap } from 'common.types';
import { createEmbedTemplate } from './embed.template';
import { hashtagRegex } from '../utils/hashtag';

export class ProfileService {

    constructor(private browser: Browser) {
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

    async getGroupedUserPosts(username: string, hashtags: Array<string>, page: number, pageSize: number = 10): Promise<{ groups: {[hashtag: string]: Array<InstagramPost> } }> {
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

    private getTemplateForPost(post: InstagramPost, index: number) {
        const { shortCode } = post;
        return createEmbedTemplate(shortCode, index);
    }

    private async getUserPostChunk(username: string, $top: number, $skip: number): Promise<{ posts: Array<InstagramPost> }> {
        console.time(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
        const page = await this.createProfilePage($top);
        const getGraphQLQuery: Promise<{ url: string }> = new Promise(resolve => {
            page.on('response', async response => {
                if (this.isGraphURL(response)) {
                    resolve(response.json());
                }
            });
        });
        const getGraphQLQueryTimeout: Promise<{ url: string }> = new Promise(resolve => {
            setTimeout(() => resolve({ url: 'timeout' }), 8000);
        });

        await page.goto(`https://instagram.com/${username}`, { waitUntil: 'domcontentloaded' });

        let { url } = await Promise.race([ getGraphQLQuery, getGraphQLQueryTimeout ]);
        
        const posts: InstagramPostMap = {};
        const initialData: GraphUserResponse = await page.evaluate(() => {
            return (window as any)._sharedData.entry_data.ProfilePage[0].graphql as GraphUserResponse;
        });
        
        await page.close();
        
        const { user } = initialData;
        user.edge_owner_to_timeline_media.edges.forEach((edge, i) => posts[edge.node.shortcode] = this.mapEdgeToPost(edge, i));
        
        if (this.isPageFull(posts, $skip, $top)) {
            return {
                posts: this.getPageOfPosts(posts, $skip, $top)
            };
        }
        
        if (url !== 'timeout') {
            let end_cursor = user.edge_owner_to_timeline_media.page_info.end_cursor;
            do {
                url = url.replace(/\"after\":\".*\"/, `"after":"${end_cursor}"`);
                console.log('[ProfileService]: GET', url);

                const response = await fetch(url);
                if (!response.ok) {
                    const { status, statusText, headers } = response;
                    throw new Error(JSON.stringify({ status, statusText, headers }));
                }
                const json = await response.json() as ({ data: GraphUserResponse });
                const { data: { user } } = json;

                user.edge_owner_to_timeline_media.edges.forEach((edge, i) => posts[edge.node.shortcode] = this.mapEdgeToPost(edge, i));
                
                if (user.edge_owner_to_timeline_media.page_info.has_next_page) {
                    end_cursor = user.edge_owner_to_timeline_media.page_info.end_cursor;
                } else {
                    break;
                }
            } while (!this.isPageFull(posts, $skip, $top));
        }

        return {
            posts: this.getPageOfPosts(posts, $skip, $top)
        };
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
        const template = this.getTemplateForPost(post, index).replace(/\s+/g, ' ');

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
