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

	 //creating mapping for order 
	 mapping(uint256 => _Order) public orders;
	 uint256 public orderCount; // for id 
 	
	 //event for deposit 
	 event Deposit(address token, address user, uint256 amount, uint256 balance);
	 
	 //event for withhdraw
	 event Withdraw(address token, address user, uint256 amount, uint256 balance);

	 //event for order 
	 event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);


	constructor(address _feeAccount, uint256 _feePercent){
		feeAccount = _feeAccount;
		feePercent =_feePercent;

    }

    //struct for orders, a way to model the order 
    struct _Order{
    	//Attributes of an order 
    	uint256 id; //unique identifier for order  
    	address user; // track the user who made order 
    	address tokenGet; // address of token they recievce 
    	uint256 amountGet; // ampont of token they receive
    	address tokenGive; // address of toke they give
    	uint256 amountGive; // amount they give 
    	uint256 timestamp; // when the order was created  
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

	//---------------------Making Order------------------------

	//Token Give (the token they want to spend)- whichh token , how much 
	//Token Get(the token they want to recieve)- whichh token , how much 
	function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
		//require token balance
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
		//creating order 
		orderCount = orderCount +1;
		orders[orderCount] = _Order(orderCount, //user id
		 msg.sender, // user address
		 _tokenGet, //tokenGet
		 _amountGet, // amountGte
		 _tokenGive, // tokenGive
		 _amountGive, // amountGive
		 block.timestamp // timestamp whhich is second and 
		);

		//emit event
		emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, block.timestamp); 



	}
}





