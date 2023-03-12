/* eslint-disable prettier/prettier */
export class RequestTokensDTO{
    address:string;
    amount:number;
}

export class MintTokenResponse{
    result:string;
}

export class CastVoteRequestDTO{
    proposalIndex:number;
    votingPower:number;
    privateKey:string;
}


export class CastVoteResponse{
    result:string;
}

export class WinningProposalResponse{
    result:string;
}