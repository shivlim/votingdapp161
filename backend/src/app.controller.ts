/* eslint-disable prettier/prettier */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { RequestTokensDTO } from './dto/paymentOrder.dto';

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
  async requestTokens(@Body() body: RequestTokensDTO): Promise<string>{
    return this.appService.requestTokens(body.address,body.amount);
  }

}
