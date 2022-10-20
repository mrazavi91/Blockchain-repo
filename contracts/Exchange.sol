// SPDX-License-Identifier: UNLICENSED
//programmimg language version 
pragma solidity ^0.8.0;
import "hardhat/console.sol";
import "./Token.sol"; //using the another contract in this contract

contract Exchange {
	// address receives fees
	 address public feeAccount;
	 uint256 public feePercent;

	 //how mmany tokens each userdeposited tracking
	 // token address , user address, howmany deposited
	 mapping(address => mapping(address => uint256)) public tokens;
	 //event for deposit 
	 event Deposit(address token, address user, uint256 amount, uint256 balance);
	 //event for withhdraw
	 event Withdraw(address token, address user, uint256 amount, uint256 balance);

	constructor(address _feeAccount, uint256 _feePercent){
		feeAccount = _feeAccount;
		feePercent =_feePercent;

    }

	//---------------------Deposite tokes------------------------
	function depositToken(address _token, uint256 _amount) public{
		//transfre token to excgange, address(this) is thhe address of exchange
		require(Token(_token).transferFrom(msg.sender, address(this), _amount)); 

		//update balance, whhatever user have in account + new amount
		tokens[_token][msg.sender]= tokens[_token] [msg.sender] + _amount ;

		//emit event
		emit Deposit(_token , msg.sender, _amount, tokens[_token][msg.sender]);

    }

    //-------------------------Withdraw tokens----------------------
    function withdrawToken(address _token, uint256 _amount) public{
    	//ensure user has enough token to widthdraw 
    	require(tokens[_token][msg.sender] >= _amount);
    	//transfer token to the user
    	Token(_token).transfer(msg.sender, _amount);
    	
    	//update the user balance 
    	tokens[_token][msg.sender]= tokens[_token] [msg.sender] - _amount ;


    	//emit an event 
    	emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

	//Check balances 
	function balanceOf(address _token, address _user) public view returns(uint256){

		return tokens[_token][_user];

	}


}