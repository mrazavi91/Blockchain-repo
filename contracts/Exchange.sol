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

	 //creating mapping for cancel order, when order cancel we stores in this mapping 
	 mapping(uint256 => bool) public orderCancelled;

	 //whenever the order is finished markedas filled 
	 mapping(uint256 => bool) public orderFilled;
 	
	 //event for deposit 
	 event Deposit(address token, address user, uint256 amount, uint256 balance);
	 
	 //event for withhdraw
	 event Withdraw(address token, address user, uint256 amount, uint256 balance);

	 //event for order 
	 event Order(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

	 //event for cancellation
	 event Cancel(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, uint256 timestamp);

	 // event for trade 
	 event Trade(uint256 id, address user, address tokenGet, uint256 amountGet, address tokenGive, uint256 amountGive, address creator, uint256 timestamp);

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
		orderCount = orderCount +1; //or orderCount++;
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

	//---------------------Cancel Order------------------------	

	function cancelOrder(uint256 _id) public {

		//fetch the order and the data type is _Order, storage makes it out of the memory  
		_Order storage _order = orders[_id];

		//cancel order 
		orderCancelled[_id]= true;

		// requirement for fialing 
		require(_order.id == _id);
		//ensure the caller of function is the owner of the order 
		require(address(_order.user) == msg.sender);

		///emit event
	    emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, block.timestamp); 


	}

   //---------------------Executing order------------------------

   function fillOrder(uint256 _id) public{

   	//1.must be a valid orderId
   	require(_id >0 && _id <= orderCount, "order does not exist");
   	//2. order can not be filled 
   	require(! orderFilled[_id]);
   	//3. order can not be cancelled 
   	require(!orderCancelled[_id]);

    //Fetch the order 
    _Order storage _order = orders[_id];
    //swaping tokens or trading them 
    _trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive);

    //mapping
   	orderFilled[_order.id]= true; 
   }

   function _trade(uint256 _orderId, address _user, address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) internal {
   	// do trade here ....

   	//calculate the fee charge: fee is paid by who filled thhe order(user 2(msg.sender))
   	//fee is deducted from _amountGet(basically from user2(msg.sender) account)
   	uint256 _feeAmount = (_amountGet * feePercent) /100 ;


   	// taking away mDai from msg.sender(user2), user1(_user) who made thhe order, msg.sender who filled the order so msg.sender has to pay for fee
   	tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount);
   	// adding the mDai to the user1 which is user, so in total taking mDai from msg.sender(user2) and adding to user1
   	tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet;

   	//charge the fee
   	tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount;

   	//taking away DAPP from user1 (_user)
   	tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
   	// adding the DAPPto the user2 (msg.sender), so in total taking DAPP away from user1(_user) and adding to user2 (msg.sender)
   	tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;

   	//emit an event
   	emit Trade(_orderId, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, _user, block.timestamp); 


   }


}





