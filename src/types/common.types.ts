export interface InstagramPost {
    caption: string;
    shortCode: string;
    hashTags: Array<string> | null;
    takenAtTimestamp: number;
    template?: string;
}

export interface InstagramPostMap {
    [shortCode: string]: InstagramPost;
}
