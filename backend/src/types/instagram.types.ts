export interface PageInfo {
    has_next_page: boolean;
    end_cursor: string;
}

export interface Dimensions {
    height: number;
    width: number;
}

export interface DisplayResource {
    src: string;
    config_width: number;
    config_height: number;
}

export interface EdgeMediaToTaggedUser {
    edges: any[];
}

export interface Node2 {
    text: string;
}

export interface Edge2 {
    node: Node2;
}

export interface EdgeMediaToCaption {
    edges: Edge2[];
}

export interface PageInfo2 {
    has_next_page: boolean;
    end_cursor?: any;
}

export interface Owner {
    id: string;
    is_verified: boolean;
    profile_pic_url: string;
    username: string;
}

export interface Node3 {
    id: string;
    text: string;
    created_at: number;
    did_report_as_spam: boolean;
    owner: Owner;
    viewer_has_liked: boolean;
}

export interface Edge3 {
    node: Node3;
}

export interface EdgeMediaToComment {
    count: number;
    page_info: PageInfo2;
    edges: Edge3[];
}

export interface EdgeMediaToSponsorUser {
    edges: any[];
}

export interface EdgeMediaPreviewLike {
    count: number;
    edges: any[];
}

export interface Owner2 {
    id: string;
    username: string;
}

export interface Location {
    id: string;
    has_public_page: boolean;
    name: string;
    slug: string;
}

export interface ThumbnailResource {
    src: string;
    config_width: number;
    config_height: number;
}

export interface DashInfo {
    is_dash_eligible: boolean;
    video_dash_manifest?: any;
    number_of_qualities: number;
}

export interface Node {
    __typename: string;
    id: string;
    dimensions: Dimensions;
    display_url: string;
    display_resources: DisplayResource[];
    is_video: boolean;
    tracking_token: string;
    edge_media_to_tagged_user: EdgeMediaToTaggedUser;
    accessibility_caption?: any;
    edge_media_to_caption: EdgeMediaToCaption;
    shortcode: string;
    edge_media_to_comment: EdgeMediaToComment;
    edge_media_to_sponsor_user: EdgeMediaToSponsorUser;
    comments_disabled: boolean;
    taken_at_timestamp: number;
    edge_media_preview_like: EdgeMediaPreviewLike;
    gating_info?: any;
    fact_check_information?: any;
    media_preview: string;
    owner: Owner2;
    location: Location;
    viewer_has_liked: boolean;
    viewer_has_saved: boolean;
    viewer_has_saved_to_collection: boolean;
    viewer_in_photo_of_you: boolean;
    viewer_can_reshare: boolean;
    thumbnail_src: string;
    thumbnail_resources: ThumbnailResource[];
    dash_info: DashInfo;
    video_url: string;
    video_view_count?: number;
}

export interface Edge {
    node: Node;
}

export interface EdgeOwnerToTimelineMedia {
    count: number;
    page_info: PageInfo;
    edges: Edge[];
}

export interface GraphUser {
    edge_owner_to_timeline_media: EdgeOwnerToTimelineMedia;
    profile_pic_url?: string;
}

export interface GraphUserResponse {
    user: GraphUser;
}

export interface InstagramUserProfile {
    url: string;
    user: GraphUser;
}
