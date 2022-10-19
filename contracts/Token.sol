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

	//for transfreing tokens we have to check balance first
	//tracking balance
	mapping(address => uint256) public balanceOf;

	//tranfer event 
	event Transfer(address indexed from,
	 address indexed to,
	 uint256 value
	 );



	constructor(string memory _name, string memory _symbol, uint256 _totalSupply){
		name = _name;
		symbol = _symbol;
		totalSupply = _totalSupply *(10**decimals);
		//writing message, msg.sender is the address of the person who deploy 
		balanceOf[msg.sender] = totalSupply;
		//reading message 
	}

	//transfer tokens 
	function transfer(address _to, uint256 _value) 
	 public 
	 returns (bool success)
	{
		//requiare that sender has enough token to spend 
		require(balanceOf[msg.sender] >= _value);
		require(_to != address(0));

		//deduct token from sender 
		balanceOf[msg.sender] = balanceOf[msg.sender] - _value;
		//credit token to reciever 
		balanceOf[_to] = balanceOf[_to] + _value;

		//emit event 
		emit Transfer(msg.sender, _to, _value);
		return true;
	}
}
 