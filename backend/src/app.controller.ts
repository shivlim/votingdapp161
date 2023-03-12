/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { CastVoteRequestDTO, CastVoteResponse, MintTokenResponse, RequestTokensDTO, WinningProposalResponse } from './dto/paymentOrder.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('contract-address')
  getContractAddress(): {address:string} {
    return {address:this.appService.getContractAddress()};
  }

  @Get('total-supply')
  async getTotalSupply(): Promise<number> {
    return this.appService.getTotalSupply();
  }

  @Get('allowance/:from/:to')
  async getAllowance(@Param('from') from: string,
  @Param('to') to: string): Promise<number> {
    return this.appService.getAllowance(from,to);
  }

  @Get('allowance')
  async getAllowanceQuery(@Query('from') from: string,
  @Query('to') to: string): Promise<number> {
    return this.appService.getAllowance(from,to);
  }

  @Get('transaction-status')
  async getTransactionStatus(@Query('hash') hash: string): Promise<string> {
    return this.appService.getTransactionStatus(hash);
  }

  @Post('request-tokens')
   async requestTokens(@Body() body: RequestTokensDTO): Promise<MintTokenResponse> {
    const mintTokenResponse:MintTokenResponse = new MintTokenResponse();
    mintTokenResponse['result'] = await this.appService.requestTokens(body.address, body.amount);
    return mintTokenResponse;
  }

  
  @Post('cast-vote')
   async castVote(@Body() body: CastVoteRequestDTO): Promise<CastVoteResponse> {
    const castVoteResponse:CastVoteResponse = new CastVoteResponse();
    castVoteResponse['result'] = await this.appService.castVote(body.privateKey,body.proposalIndex, body.votingPower);
    return castVoteResponse;
  }

  @Get('winning-proposal')
  async getWinningProposal(): Promise<WinningProposalResponse> {
    const winningProposalResponse:WinningProposalResponse = new WinningProposalResponse();
    winningProposalResponse['result'] = await this.appService.getWinningProposal();
    return winningProposalResponse;
  }
  

}
