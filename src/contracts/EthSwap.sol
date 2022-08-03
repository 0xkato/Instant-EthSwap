pragma solidity ^0.5.0;

import "./Token.sol";

contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokenPurchased(
        address account, 
        address token, 
        uint amount, 
        uint rate
        );

    event TokenSold(
        address account, 
        address token, 
        uint amount, 
        uint rate
        );

    constructor(Token _token) public {
        token = _token;
    }

    function buyTokens() public payable {
        // calculate the number of tokens that will be bought
        uint tokenAmount = msg.value * rate;

        // make use that ethswap was enough tokens to sell
        require(token.balanceOf(address(this))>= tokenAmount);

        token.transfer(msg.sender, tokenAmount);

        // emit event for buying tokens
        emit TokenPurchased(msg.sender, address(token), tokenAmount, rate);
    }

    function sellTokens(uint _amount) public {
        // can't send more tokens then is owned 
        require(token.balanceOf(msg.sender) >= _amount);

        // calculate the amount of there for amount of tokens
        uint etherAmount = _amount / rate;

        // Makes sure that ethSwap has enough eth for the trade
        require(address(this).balance >= etherAmount);

        token.transferFrom(msg.sender, address(this), _amount);
        msg.sender.transfer(etherAmount);

        emit TokenSold(msg.sender, address(token), _amount, rate);
    }
}
