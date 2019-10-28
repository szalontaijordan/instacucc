import { InstagramUserProfile } from "instagram.types";

export abstract class CahceService {

    public abstract getInitialUserProfile(username: string): InstagramUserProfile;

    public abstract setInitialUserProfile(username: string, user: InstagramUserProfile): void;
}
