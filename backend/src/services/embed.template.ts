export const createEmbedTemplate = (shortCode: string, index: number, captioned?: boolean) => '' +
`<iframe
    id="instagram-embed-${index}"
    class="instagram-media instagram-media-rendered"
    style="background: white;
        max-width: 658px;
        width: calc(100% - 2px);
        border-radius: 3px;
        border: 1px solid #dbdbdb;
        box-shadow: none;
        display: block;
        margin: 0px 0px 12px;
        min-width: 326px;
        padding: 0px;"
    src="https://www.instagram.com/p/${shortCode}/embed${captioned ? '/captioned' : ''}/?utm_source=ig_embed&cr=1"
    scrolling="no"
    data-instgrm-payload-id="instagram-media-payload-${index}"
    frameborder="1"
></iframe>`;
