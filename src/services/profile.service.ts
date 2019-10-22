import { Browser, Page } from 'puppeteer';
import fetch from 'node-fetch';
import { GraphUserResponse, Edge } from 'instagram.types';
import { InstagramPost, InstagramPostMap } from 'common.types';

export class ProfileService {

    constructor(private browser: Browser) {
    }

    async getUserPosts(username: string, page: number, pageSize: number = 20): Promise<{ posts: Array<any> }> {
        return this.getUserPostChunk(username, pageSize, (page - 1) * pageSize);
    }

    private async getUserPostChunk(username: string, $top: number, $skip: number): Promise<{ posts: Array<any> }> {
        console.time(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
        const page = await this.createProfilePage();
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

        await page.goto(`https://instagram.com/${username}`);

        let { url } = await Promise.race([ getGraphQLQuery, getGraphQLQueryTimeout ]);
        
        const posts: InstagramPostMap = {};
        const initialData: GraphUserResponse = await page.evaluate(() => {
            return (window as any)._sharedData.entry_data.ProfilePage[0].graphql as GraphUserResponse;
        });
        
        await page.close();
        
        const { user } = initialData;
        user.edge_owner_to_timeline_media.edges.forEach(edge => posts[edge.node.shortcode] = this.mapEdgeToPost(edge));
        
        if (this.isPageFull(posts, $skip, $top)) {
            return {
                posts: this.getPageOfPosts(posts, $skip, $top)
            };
        }
        
        if (url !== 'timeout') {
            let end_cursor = user.edge_owner_to_timeline_media.page_info.end_cursor;
            do {
                url = url.replace(/%22after%22%3A%22.*%22/, `%22after%22%3A%22${end_cursor}%22`);
                console.log('[ProfileService]: GET', url);

                const response = await fetch(url);
                if (!response.ok) {
                    const { status, statusText, headers } = response;
                    throw new Error(JSON.stringify({ status, statusText, headers }));
                }
                const json = await response.json() as ({ data: GraphUserResponse });
                const { data: { user } } = json;

                user.edge_owner_to_timeline_media.edges.forEach(edge => posts[edge.node.shortcode] = this.mapEdgeToPost(edge));
                
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
                request.respond({
                    status: 200,
                    body: JSON.stringify({ url: request.url().replace(/%22first%22%3A[0-9]+/, `%22first%22%3A${batchSize}`) }),
                    contentType: 'application/json'
                });
            } else {
                request.continue();
            }
        });

        return page;
    }

    private mapEdgeToPost(edge: Edge): InstagramPost {
        const node = edge.node;
        const caption = node.edge_media_to_caption.edges[0].node.text;
        const shortCode = node.shortcode;
        const hashTags = caption.match(/\#\w+/gi);
        const takenAtTimestamp = node.taken_at_timestamp;

        return { caption, shortCode, hashTags, takenAtTimestamp };
    }
 
    private getPageOfPosts(posts: InstagramPostMap, $skip: number, $top: number): Array<InstagramPost> {
        return Object.values(posts).slice($skip, $skip + $top)
    }

    private isPageFull(posts: InstagramPostMap, $skip: number, $top: number): boolean {
        return Object.values(posts).length >= $skip + $top;
    }

    private isGraphURL(x: { url: () => string }): boolean {
        return x.url().includes('graph') && !x.url().includes('user_id');
    }
}
