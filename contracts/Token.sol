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
	//thhe number of token that the spender allowto spendsowe have nested mapping
	mapping(address => mapping(address => uint256)) public allowance;
	//tranfer event 
	event Transfer(address indexed from,
	 address indexed to,
	 uint256 value
	 );
	//approval event 
	event Approval(address indexed owner,
	 address indexed spender,
	  uint256 value);



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

		_transfer(msg.sender,_to,_value);
		
		return true;
	}


	//Internal function which is use for Transfer and Transferfrom functions

	function _transfer (address _from, address _to, uint256 _value)
	 internal
	{
		require(_to != address(0));

		//deduct token from sender 
		balanceOf[_from] = balanceOf[_from] - _value;
		//credit token to reciever 
		balanceOf[_to] = balanceOf[_to] + _value;

		//emit event 
		emit Transfer(_from, _to, _value);

	}

	//approve 
	function approve(address _spender, uint256 _value)
	 public
	 returns (bool success)
	{
		require(_spender != address(0));
		
		allowance[msg.sender][_spender] = _value; 
		//emit event 
		emit Approval(msg.sender, _spender, _value);
		return true;

	}

	//trasferfrom function, let the other people spend crypto on our behalf
	function transferFrom(address _from, address _to, uint256 _value)
	 public
	 returns (bool success)
	{
		//check approval
		require(_value <= balanceOf[_from]);
		require(_value <= allowance[_from][msg.sender]);

		//reset allowance which means user can not spend more 
		allowance[_from][msg.sender]= allowance[_from][msg.sender] - _value;

		//spend token
		_transfer(_from, _to, _value); 

		return true;
	} 
}
 