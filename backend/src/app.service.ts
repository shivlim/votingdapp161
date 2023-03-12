/* eslint-disable prettier/prettier */
import { Injectable } from '@nestjs/common';
import { Contract, ethers, Wallet } from 'ethers';
import {Provider} from "@ethersproject/providers";
import * as tokenJson from './assets/MyToken.json';
import { ConfigModule,ConfigService } from '@nestjs/config';

const CONTRACT_ADDRESS = "0x501761b004AA21C8045b00E54925e855D553e83b";

@Injectable()
export class AppService {
  
 

 
  provider: ethers.providers.Provider;
  contract: ethers.Contract;

constructor(private configService: ConfigService){
   this.provider = ethers.getDefaultProvider('goerli');
   this.contract = new ethers.Contract(
    CONTRACT_ADDRESS,tokenJson.abi,this.provider
  );

}


  async getTotalSupply(): Promise<number> {

    const totalSupplyBN = await this.contract.totalSupply();
    const totalSupplyString =  ethers.utils.formatEther(totalSupplyBN);
    const totalSupply = parseFloat(totalSupplyString);
    return totalSupply;
  }

  async getAllowance(from:string, to:string): Promise<number> {

    const allowanceBN = await this.contract.allowance(from,to);
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
    return this.contract.address;
  }

  async requestTokens(address: string, amount: number): Promise<string> {
    const deployerprivatekey = this.configService.get<string>('PRIVATE_KEY');
    const provider:Provider = new ethers.providers.AlchemyProvider("goerli", this.configService.get<string>('ALCHEMY_API_KEY'));

     // Check Private Key and connect Signer Wallet
    const wallet = new ethers.Wallet(deployerprivatekey);
    console.log(`Connected to the wallet address ${wallet.address}`);
    const signer:Wallet = wallet.connect(provider);
      const contract = new Contract(CONTRACT_ADDRESS,tokenJson.abi,signer)
      const tx = await contract.mint(address, amount, {gasLimit: 200000});
      const receipt = await tx.wait()
      if (receipt.status === 0) throw new Error(`Transaction failed: ${tx.hash}`)
      console.log(`Minted ${amount} tokens to ${signer.address} at block ${receipt.blockNumber}`)

    return tx.hash;
  }


 
}
