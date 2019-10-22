export interface InstagramPost {
    caption: string;
    shortCode: string;
    hashTags: Array<string> | null;
    takenAtTimestamp: number;
}

export interface InstagramPostMap {
    [shortCode: string]: InstagramPost;
}
