const { assert } = require("chai")
const { default: Web3 } = require("web3")

const Token = artifacts.require("Token")
const EthSwap = artifacts.require("EthSwap")

require("chai")
.use(require("chai-as-promised"))
.should()

function tokens(n) {
    return web3.utils.toWei(n, "ether");
}

contract("EthSwap", ([deployer, inverstor]) => {
    let token, ethSwap

    before(async () => {
        token = await Token.new()
        ethSwap = await EthSwap.new(token.address)
        await token.transfer(ethSwap.address, tokens("1000000"))
    })

    describe("EthSwap", async () => {
        it("contract has a name", async () => {
            const name = await token.name()
            assert.equal(name, "Toli Token")
        })
    })

    describe("EthSwap Deployment", async () => {
        it("contract has a name", async () => {
            const name = await ethSwap.name()
            assert.equal(name, "EthSwap Instant Exchange")
        })

        it("contract has token", async () => {
            let balance = await token.balanceOf(ethSwap.address)
            assert.equal(balance.toString(), tokens("1000000"))
        })
    })

    describe("buyTokens()", async () => { 
        let result

        before(async () => {
            // example of buying tokens
            result = await ethSwap.buyTokens({ from: inverstor, value: web3.utils.toWei("1", "ether")})
        })

        it("allows user you instantly buy token form EthSwap for a fixed price", async () => {
            // check the balance after buying tokens
            let inverstorBalance = await token.balanceOf(inverstor)
            assert.equal(inverstorBalance.toString(), tokens("100"))

            // check Toli tokens balance of ethSwap after selling tokens
            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens("999900"))
            // check eth balance of ethSwap after selling Toli Tokens
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei("1", "Ether"))

            // check logs to see if the correct data was emitted
            const event = result.logs[0].args
            assert.equal(event.account, inverstor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens("100").toString())
            assert.equal(event.rate.toString(), "100")
        })
    })


    describe("sellTokens()", async () => { 
        let result

        before(async () => {
            // approve ethSwap to have full usage of the token
            await token.approve(ethSwap.address, tokens("100"), { from: inverstor })
            result = await ethSwap.sellTokens(tokens("100"), { from: inverstor })
        })

        it("allows user you instantly sell token to EthSwap for a fixed price", async () => {
            let inverstorBalance = await token.balanceOf(inverstor)
            assert.equal(inverstorBalance.toString(), tokens("0"))


            let ethSwapBalance
            ethSwapBalance = await token.balanceOf(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), tokens("1000000"))
            ethSwapBalance = await web3.eth.getBalance(ethSwap.address)
            assert.equal(ethSwapBalance.toString(), web3.utils.toWei("0", "Ether"))

            // check logs to see if the correct data was emitted
            const event = result.logs[0].args
            assert.equal(event.account, inverstor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens("100").toString())
            assert.equal(event.rate.toString(), "100")

            // FAILURE: Cant sell more tokens then is owned
            await ethSwap.sellTokens(tokens("500"), { from: inverstor }).should.be.rejected;
        })
    })

})