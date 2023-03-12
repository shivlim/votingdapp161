/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { ethers, utils } from 'ethers';
import * as tokenJson from './assets/MyToken.json';
import * as ballotContractJson from './assets/Ballot.json';
import { ConfigService } from '@nestjs/config';

const TOKEN_CONTRACT_ADDRESS = "0x501761b004AA21C8045b00E54925e855D553e83b";
const BALLOT_CONTRACT_ADDRESS = "0xa61958f81918672533CF4cCa4acfca38833c4392";

@Injectable()
export class AppService {
 
  provider: ethers.providers.Provider;
  tokenContract: ethers.Contract;
  ballotContract: ethers.Contract;

constructor(private configService: ConfigService){
   this.provider = new ethers.providers.AlchemyProvider("goerli", this.configService.get<string>('ALCHEMY_API_KEY'));
   this.tokenContract = new ethers.Contract(
    TOKEN_CONTRACT_ADDRESS,tokenJson.abi,this.provider
  );
  this.ballotContract = new ethers.Contract(
    BALLOT_CONTRACT_ADDRESS,ballotContractJson.abi,this.provider
  );
}

  async getTotalSupply(): Promise<number> {
    const totalSupplyBN = await this.tokenContract.totalSupply();
    const totalSupplyString =  ethers.utils.formatEther(totalSupplyBN);
    const totalSupply = parseFloat(totalSupplyString);
    return totalSupply;
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.tokenContract.balanceOf(address);
    console.log(`Requested balance for ${address}, balance = ${balance.toString()}`)
    return utils.formatEther(balance);
  }

  async getAllowance(from:string, to:string): Promise<number> {
    const allowanceBN = await this.tokenContract.allowance(from,to);
    const allowanceString =  ethers.utils.formatEther(allowanceBN);
    const allowanceNumber = parseFloat(allowanceString);
    return allowanceNumber;
  }

  async getTransactionStatus(hash: string): Promise<string> {
    const tx = await this.provider.getTransaction(hash);
    const txReceipt = await tx.wait();
    return txReceipt.status == 1?"completed":"pending";
  }

  getContractAddress(): string {
    return this.tokenContract.address;
  }

  getBallotContractAddress(): string {
    return this.ballotContract.address
  }

  async requestTokens(address: string, amount: number) {
    const deployerprivatekey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(deployerprivatekey).connect(this.provider);
    const tx = await this.tokenContract.connect(wallet).mint(address, amount);
    const receipt = await tx.wait()
    if (receipt.status === 0) throw new Error(`Transaction failed: ${tx.hash}`)
    console.log(`Minted ${amount} tokens to ${address} at block ${receipt.blockNumber}`)

    return tx.hash;
  }

  async getWinningProposal(): Promise<string> {
    const deployerprivatekey = this.configService.get<string>('PRIVATE_KEY');
    const wallet = new ethers.Wallet(deployerprivatekey).connect(this.provider);
    const winnerAddress = await this.ballotContract.connect(wallet).winnerName();
    const winnerName = ethers.utils.parseBytes32String(winnerAddress)
    return winnerName;
  }
}
