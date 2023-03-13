import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { BigNumber, Contract, ethers, providers, utils, Wallet } from 'ethers';
import tokenJson from '../assets/MyToken.json';
import ballotJSON from '../assets/BallotContract.json'

const API_URL = "http://localhost:3000"
// remove this before pushing
const privateKey = ""
const alchemyKey = ""

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'app';
  blockNumber:number  = 0;
  ballotContractAddress: string | undefined;
  ballotContract: Contract | undefined;
  provider : ethers.providers.BaseProvider;
  userWallet: Wallet | undefined;
  userEthBalance: number | undefined;
  userTokenBalance: number | undefined;
  tokenContractAddress: string | undefined;
  tokenContract: Contract|undefined;
  tokenTotalSupply: number | undefined | string;
  winningProposal: string | undefined;

  constructor(private http: HttpClient){
    this.provider = new providers.AlchemyProvider("goerli", alchemyKey)
  }

  getTokenAddress() {
    return this.http.get<{address:string}>(`${API_URL}/contract-address`);
  }

  getTokenBalance() {
    return this.http.get<{balance:string}>(`${API_URL}/balance/${this.userWallet?.address}`)
  }

  getBallotContract() {
    return this.http.get<{address:string}>(`${API_URL}/ballot-contract`);
  }

  syncBlock(){
    this.provider.getBlock('latest').then((block)=>{
      this.blockNumber = block.number;
    });
    this.getTokenAddress().subscribe((response)=>{
      this.tokenContractAddress = response.address;
      this.updateTokenInfo();
    })
    this.getBallotContract().subscribe((response) => {
      console.log("RESP", response.address)
      this.ballotContractAddress = response.address;
      this.ballotContract = new Contract(
        this.ballotContractAddress,
        ballotJSON.abi,
        this.userWallet || this.provider
      )
    })
    if (this.userWallet) {
      this.getTokenBalance().subscribe((response) => {
          this.userTokenBalance = parseFloat(String(response));
      })
    }
  }

  updateTokenInfo(){
    if(! this.tokenContractAddress) return;
    this.tokenContract = new Contract(
      this.tokenContractAddress,
      tokenJson.abi,
      this.userWallet ?? this.provider
    );
    this.tokenTotalSupply = "loading..."
    this.tokenContract['totalSupply']().then((totalSupplyBN: BigNumber) =>{
      const totalSupplyStr = utils.formatEther(totalSupplyBN);
      this.tokenTotalSupply = parseFloat(totalSupplyStr)
    });

  }

  clearBlock(){
    this.blockNumber = 0;
  }

  requestTokens(amount:string){
    const signature = await this.userWallet?.signMessage(amount);
    const body = {
      address: this.userWallet?.address,
      amount: amount,
      signature: signature
    };
    console.log('requested ' + amount + ' tokens for address '+ this.userWallet?.address);
    return this.http
      .post<{result:string}>(`${API_URL}/request-tokens`,body)
      .subscribe((result) =>{
        console.log('tx hash ' + result.result);
    });
  }

  // function to vote
  async vote(_proposalIndex: string, _weight: string) {
    if (!this.ballotContract) {
      alert('You need to sync first')
    } else {
      if (!this.userWallet) {
        alert('Create a wallet first')
      } else {
        console.log(`Voting for proposal ${_proposalIndex} with weight ${_weight}`)
        const tx = await this.ballotContract.connect(this.userWallet!)['vote'](_proposalIndex, _weight, {
          gasLimit: 100000
        })
        console.log(`TX HASH ${tx.hash}`)
        const receipt = await tx.wait()
        console.log(`${receipt.status === 1 ? 'Success' : 'Failure'}`)
      }
    }
  }

  async delegate(_to: string) {
    if (!this.tokenContract) {
      alert('You need to sync first')
    } else {
      if (!utils.isAddress(_to)) alert('Not a valid address')
      else {
        console.log(`Delegating voting power to ${_to}`)
        const tx = await this.tokenContract['delegate'](_to, {gasLimit: 100000})
        console.log(`TX HASH ${tx.hash}`)
        const receipt = await tx.wait()
        console.log(`${receipt.status === 1 ? 'Success' : 'Failure'}`)
      }
    }
  }

  async getWinningProposal() {
    if (!this.ballotContract) {
      alert('You need to sync first')
    } else {
      const winnerAddress = await this.ballotContract['winnerName']();
      const winnerName = utils.parseBytes32String(winnerAddress)
      console.log(`The winning proposal is ${winnerName}`)
      this.winningProposal = winnerName;
    }
  }

  createWallet(){
    this.userWallet = new Wallet(privateKey, this.provider);
    this.userWallet.getBalance().then((balanceBN) =>{
      const balanceStr = utils.formatEther(balanceBN);
      this.userEthBalance = parseFloat(balanceStr)
    });
  }
}
