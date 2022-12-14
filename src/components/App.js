import React, { Component } from 'react'
import Web3 from 'web3'
import EthSwap from "../abis/EthSwap.json"
import Token from "../abis/Token.json"
import Main from "./main"
import Navbar from './Navbar'
import './App.css'

class App extends Component {

  async componentWillMount() {
    await this.loadweb3()
    await this.loadblockchainData()
  }

  async loadblockchainData() {
    const web3 = window.web3

    const accounts = await web3.eth.getAccounts()
    this.setState({ account: accounts[0] })

    // Get the Eth balance of the connected wallet
    const ethBalance = await web3.eth.getBalance(this.state.account)
    this.setState({ ethBalance })

    // confirms that you are on the right network
    const networkId = await web3.eth.net.getId()
    const tokenData = Token.networks[networkId]
    if (tokenData) {
      const token = new web3.eth.Contract(Token.abi, tokenData.address)
      this.setState({ token })

      // get the token balance of the connected wallet
      let tokenBalance = await token.methods.balanceOf(this.state.account).call()
      this.setState({ tokenBalance: tokenBalance.toString() })
    } else {
      window.alert("Token contract not deployed to the network that you are on")
    }

    // load EthSwap
    const EthSwapData = EthSwap.networks[networkId]
    if (EthSwapData) {
      const ethSwap = new web3.eth.Contract(EthSwap.abi, EthSwapData.address)
      this.setState({ ethSwap })
    } else {
      window.alert(" EthSwap contract not deployed to the network that you are on")
    }

    this.setState({ loading: false })

  }

  async loadweb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum)
      await window.ethereum.enable()
    }
    else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider)
    }
    else {
      window.alert("Non-Ethereum browser detedted. You should consider trying Metamask!")
    }
  }

 buyTokens = (etherAmount) => {
    this.setState({ loading: true })
    this.state.ethSwap.methods.buyTokens().send({ value: etherAmount, from: this.state.account }).on('transactionHash', (hash) => {
      this.setState({ loading: false })
    })
  }

  sellTokens = (tokenAmount) => {
    this.setState({ loading: true })
    this.state.token.methods.approve(this.state.ethSwap.address, tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
      this.state.ethSwap.methods.sellTokens(tokenAmount).send({ from: this.state.account }).on('transactionHash', (hash) => {
        this.setState({ loading: false })
      })
    })
  }


  constructor(props){
    super(props)
    this.state = {
      account: "",
      token: {},
      ethSwap: {},
      ethBalance: "0",
      tokenBalance: "0",
      loading: true
    }
  }

  render() {
    let content
    if (this.state.loading) {
      content = <p id='loader' className='text-center'>loading...</p>
    } else {
      content = <Main ethBalance={this.state.ethBalance} tokenBalance={this.state.tokenBalance} buyTokens={this.buyTokens} sellTokens={this.sellTokens}/>
    }
    return (
      <div>
        <Navbar account={this.state.account} />
        <div className="container-fluid mt-5">
          <div className="row">
            <main role="main" className="col-lg-12  ml-auto mr-auto" style={{ maxWidth: "600px"}}>
              <div className="content mr-auto ml-auto">
                {content}
              </div>
            </main>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
