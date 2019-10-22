import { Browser, Page } from 'puppeteer';
import fetch from 'node-fetch';

export class ProfileService {

    constructor(private browser: Browser) {
    }

    async getUserPosts(username: string, page: number, pageSize: number = 20): Promise<{ posts: Array<any> }> {
        return this.getUserPostChunk(username, pageSize, (page - 1) * pageSize);
    }

    private async getUserPostChunk(username: string, $top: number, $skip: number): Promise<{ posts: Array<any> }> {
        console.time(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
        const page = await this.createProfilePage();
        const getGraphQLQuery: Promise<{ url: string }> = new Promise((resolve, reject) => {
            page.on('response', async response => {
                if (this.isGraphURL(response)) {
                    resolve(response.json());
                }
            });
        });
        const getGraphQLQueryTimeout: Promise<{ url: string }> = new Promise(resolve => {
            setTimeout(() => resolve({ url: '' }), 1000)
        });

        await page.goto(`https://instagram.com/${username}`);

        let { url } = await Promise.race([ getGraphQLQuery, getGraphQLQueryTimeout ]);
        console.log(url);
        let end_cursor = '';

        let posts: Array<any> = [];
        const initialMedia = await page.evaluate(() => {
            return (window as any)._sharedData.entry_data.ProfilePage[0].graphql.user.edge_owner_to_timeline_media;
        });
        await page.close();

        posts = [...posts, ...initialMedia.edges.map((edge: any) => this.mapEdgeToPost(edge))];

        if (posts.length >= $skip + $top) {
            console.timeEnd(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
            return {
                posts: posts.slice($skip, $skip + $top)
            };
        }

        if (url) {
            do {
                const response = await fetch(url);
                if (!response.ok) {
                    const { status, statusText, headers } = response;
                    throw new Error(JSON.stringify({ status, statusText, headers }));
                }
                const json = await response.json();
                
                posts = [...posts, ...json.data.user.edge_owner_to_timeline_media.edges.map((edge: any) => this.mapEdgeToPost(edge))];

                if (json.data.user.edge_owner_to_timeline_media.page_info.has_next_page) {
                    end_cursor = json.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
                    url = url.replace(/%22after%22%3A\w+/, `%22after%22%3A${end_cursor}`);
                } else {
                    break;
                }
            } while (posts.length < $skip + $top);    
        }

        console.timeEnd(`ProfileService.getUserPosts(${username}, ${$top}, ${$skip})`);
        return {
            posts: posts.slice($skip, $skip + $top)
        };
    }

    private async createProfilePage(batchSize: number = 20): Promise<Page> {
        const page = await this.browser.newPage();

        page.setRequestInterception(true);
        page.on('console', x => console.log(x.text()));
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

    private mapEdgeToPost(edge: any) {
        const node = edge.node;
        const caption = node.edge_media_to_caption.edges[0].node.text;
        const shortCode = node.shortcode;
        const hashTags = caption.match(/\#\w+/gi);
    
        return { caption, shortCode, hashTags };
    }
    
    private isGraphURL(x: { url: () => string }) {
        return x.url().includes('graph') && !x.url().includes('user_id');
    }
}