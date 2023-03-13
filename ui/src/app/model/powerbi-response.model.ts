export interface IPowerBiReponse {
    daily: IRespone;
    weekly: IRespone;
    test1?: IRespone;
    test2?: IRespone;
    expiresAt: string;

}

export interface IRespone {
    id: string;
    embedUrl: string;
    embedToken: string;
}
