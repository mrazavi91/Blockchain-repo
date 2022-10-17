// SPDX-License-Identifier: UNLICENSED
//programmimg language version 
pragma solidity ^0.8.0;
import "hardhat/console.sol";

contract Token{

	//Step1: Name of Token, creating variable, public everyone can see 
	//name
	string public name;
	//symbol
	string public symbol;
	//decimal
	uint256 public decimals = 18;
	//total supply means how many intotal are existance which = 1,000,000 x 10^18
	uint256 public totalSupply;

	constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply *(10**decimals);
	}
}
 