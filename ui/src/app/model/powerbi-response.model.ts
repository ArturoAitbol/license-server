export interface IPowerBiReponse {
    daily: {
        id: string;
        embedUrl: string;
        embedToken: string;
    }
    weekly: {
        id: string;
        embedUrl: string;
        embedToken: string;
    }
    expiresAt: string;

}
