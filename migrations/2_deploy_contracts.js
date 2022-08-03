const Token = artifacts.require("Token");
const EthSwap = artifacts.require("EthSwap");

module.exports = async function(deployer) {
    // Deploy the Token Contract
  await deployer.deploy(Token);
  const token = await Token.deployed()

    // Deploy the EthSwap contract
  await deployer.deploy(EthSwap, token.address);
  const ethSwap = await EthSwap.deployed()

   // transfer all tokens to EthSwap 
   await token.transfer(ethSwap.address, "1000000000000000000000000")
};
