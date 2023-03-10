const {ethers} = require('hardhat'); //importing ether from hardhat library 
const {expect} = require('chai');


// convert the wei to ether
const tokens = (n)=>{
	return ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Exchange', ()=>{
	// the test will go here 


	// preventing any duplicate + factorising let token 
	let deployer, feeAccount , exchange , user1 , token1, transaction, token2 , user2
	// let accounts
	// let deployer
	const feePercent = 10

	beforeEach(async ()=>{
		const Exchange = await ethers.getContractFactory('Exchange')
		const Token = await ethers.getContractFactory('Token')
		//token 1
		token1 = await Token.deploy('DAPP University', 'DAPP','1000000')
		token2= await Token.deploy('Mock Dai', 'mDAI','1000000')
		


		accounts =  await ethers.getSigners()
		deployer = accounts[0] //first address from our blockchain
		feeAccount = accounts[1]
		user1= accounts[2]
		user2= accounts[3]
		

		//give user some token
		transaction = await token1.connect(deployer).transfer(user1.address, tokens(100))
		await transaction.wait()

		exchange = await Exchange.deploy(feeAccount.address, feePercent)
		

	})

    describe('Deployment', ()=>{
	
	 it('tracks the fee account', async ()=>{
		
		expect(await exchange.feeAccount()).to.equal(feeAccount.address)
	 })

	 it('traks thhe fee percent', async()=>{

		expect(await exchange.feePercent()).to.equal(feePercent)
	 })


    })

    //-------------------Deposite----------------------
    describe('depositing tokens', ()=>{
        let transaction, result
        let amount = tokens(10)
    	

    	describe('Success', ()=>{

    		beforeEach(async () =>{
				// we need to approve 
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				// then we deposite
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
			})

    		it('tracks the token deposite', async()=>{
    			expect(await token1.balanceOf(exchange.address)).to.equal(amount)
    			expect(await exchange.tokens(token1.address, user1.address)).to.equal(amount)
    			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(amount)
			})

    		it('emit a Deposit event', async()=>{
    			const event = result.events[1] // 2event emmited
    			expect(await event.event).to.equal('Deposit')
    			//check args
			    const args = event.args
			 	//console.log(args)
			 	expect(args.token).to.equal(token1.address)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.amount).to.equal(amount)
			 	expect(args.balance).to.equal(amount)

    		})
    	})

    	describe('Failure', async()=>{
    		it('fails when no tokens are approved', async()=>{
    			// Don't approve any tokens before depositing
    			await expect(exchange.connect(user1).depositToken(token1.address, amount)).to.be.reverted 
    		})

    	})


    })

    //-------------------Withdraw-----------------------
    describe('withdrawing tokens', () => {
    	let transaction, result
        let amount = tokens(10)
    	

    	describe('Success', ()=>{

    		beforeEach(async () =>{
    			//deposite some token before withdraw

				// we need to approve 
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				// then we deposit
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()

				//withhdraw now 
				transaction = await exchange.connect(user1).withdrawToken(token1.address, amount)
				result = await transaction.wait()



			})

    		it('withdraws token funds', async()=>{
    			expect(await token1.balanceOf(exchange.address)).to.equal(0)
    			expect(await exchange.tokens(token1.address, user1.address)).to.equal(0)
    			expect(await exchange.balanceOf(token1.address, user1.address)).to.equal(0)
			})

    		it('emit a Withdraw event', async()=>{
    			const event = result.events[1] // 2event emmited
    			expect(await event.event).to.equal('Withdraw')
    			//check args
			    const args = event.args
			 	//console.log(args)
			 	expect(args.token).to.equal(token1.address)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.amount).to.equal(amount)
			 	expect(args.balance).to.equal(0)
			 })




         })

        
        describe('Failure', async()=>{
    		it('fails for incificient balance', async()=>{
    			// attemp to withdraw token without depositing
    			await expect(exchange.connect(user1).withdrawToken(token1.address, amount)).to.be.reverted 
    		})

    	})


   })
   // checking the balance (technique)
    describe('Checking Balances', ()=>{
        let transaction, result
        let amount = tokens(1)
    	

    	describe('Success', ()=>{

    		beforeEach(async () =>{
				// we need to approve 
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				// then we deposite
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()
			})

    		it('returns user balance', async()=>{
    			expect(await token1.balanceOf(exchange.address)).to.equal(amount)
    			
			})

    		
    	})

    	
   })

   //-------------------Making orders-----------------------
   describe('Making Order', async ()=>{
        let transaction, result
        let amount = tokens(1)
        
    	describe('Success', async()=>{


    		beforeEach(async () =>{

    			//deposite token before making order 

    			// we need to approve 
				transaction = await token1.connect(user1).approve(exchange.address, amount)
				result = await transaction.wait()

				// then we deposite
				transaction = await exchange.connect(user1).depositToken(token1.address, amount)
				result = await transaction.wait()

				//making order 
				transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address, amount)
				result = await transaction.wait()

    			
    			})

    		it('tracks the newly created order', async() => {
    			expect(await exchange.orderCount()).to.equal(1) 
				
			})

			it('emit a Order event', async()=>{
    			const event = result.events[0] // 2event emmited
    			expect(await event.event).to.equal('Order')
    			//check args
			    const args = event.args
			 	//console.log(args)
			 	expect(args.id).to.equal(1)
			 	expect(args.user).to.equal(user1.address)
			 	expect(args.tokenGet).to.equal(token2.address)
			 	expect(args.amountGet).to.equal(tokens(1))
			 	expect(args.tokenGive).to.equal(token1.address)
			 	expect(args.amountGive).to.equal(tokens(1))
			 	expect(args.timestamp).to.at.least(1)
			 })

    		
    	})

    	describe('Failure', async()=>{
    		it('rejects with no balance', async()=>{
    			await expect(exchange.connect(user1).makeOrder(token2.address, tokens(1), token1.address, tokens(1))).to.be.reverted 
    		})
    		

    	})


   })

   //-------------------Order Action : cancel or filling---------------------- 
   describe('Order actions', async() => {
   	 let transaction, result
     let amount = tokens(1)

   	 beforeEach(async () =>{
   	 	

    	// we need to approve for user1 
		transaction = await token1.connect(user1).approve(exchange.address, amount)
		result = await transaction.wait()

		// then we deposite for usre 1
		transaction = await exchange.connect(user1).depositToken(token1.address, amount)
		result = await transaction.wait()

		// Giving tokwn to user 2
		transaction = await token2.connect(deployer).transfer(user2.address, tokens(100)) 
		result = await transaction.wait()

		//approving first for user2 in order to deposit 
		transaction = await token2.connect(user2).approve(exchange.address, tokens(2))
		result = await transaction.wait()

		//user 2 deposit to exchange 
		transaction = await exchange.connect(user2).depositToken(token2.address, tokens(2))
		result = await transaction.wait()

		//making order by user 1
		transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address, amount)
		result = await transaction.wait()
   	 })
   	 // Cancel order 
   	 describe('Cancelling orders', async () => {
	   	  describe('Success', async () => {

	   		beforeEach(async () =>{
	    	//cancel order
			transaction = await exchange.connect(user1).cancelOrder(1)
			result = await transaction.wait()
	   	    })

	   		it('updates cancelled order', async() =>{
	   			expect(await exchange.orderCancelled(1)).to.equal(true) 
	   		})

	   		it('emit a cancel event', async()=>{
	    			const event = result.events[0] // 2event emmited
	    			expect(await event.event).to.equal('Cancel')
	    			//check args
				    const args = event.args
				 	//console.log(args)
				 	expect(args.id).to.equal(1)
				 	expect(args.user).to.equal(user1.address)
				 	expect(args.tokenGet).to.equal(token2.address)
				 	expect(args.amountGet).to.equal(tokens(1))
				 	expect(args.tokenGive).to.equal(token1.address)
				 	expect(args.amountGive).to.equal(tokens(1))
				 	expect(args.timestamp).to.at.least(1)
				 })


	   	  })

	   	  describe('Failure', async () => {

	   	  	beforeEach(async () =>{
	    	// we need to approve 
			transaction = await token1.connect(user1).approve(exchange.address, amount)
			result = await transaction.wait()

			// then we deposite
			transaction = await exchange.connect(user1).depositToken(token1.address, amount)
			result = await transaction.wait()

			//making order 
			transaction = await exchange.connect(user1).makeOrder(token2.address,amount,token1.address, amount)
			result = await transaction.wait()
	   	    
	   	    })

	   	  	it('rejects invalid order id', async ()=>{
	   	  	  const invalidOrderId= 9999
			  //  
			  await expect( exchange.connect(user1).cancelOrder(invalidOrderId)).to.be.reverted 
			})

			it('rejects unauthorised cancellation', async () =>{
				//so user 2 can not cancel the order that is created by user 1
				await expect( exchange.connect(user2).cancelOrder(1)).to.be.reverted
			})
	   		
	   	  })


   	 })

   	 //Fill order  
   	 describe('Filling orders', async () => {
   	 	describe('Success', async () =>{
	   	 	beforeEach(async () =>{

	    	// filling order first  
			transaction = await exchange.connect(user2).fillOrder('1')
			result = await transaction.wait()

	   	    })

	   	 	it('executes the trade and charge the fees', async () => {
	   	 		// ensure the trade happenes by checing balances 
	   	 		//token give = DAPP, token 1
	   	 		//user 1 account
	   	 		expect(await exchange.balanceOf(token1.address , user1.address)).to.equal(tokens(0))
	   	 		//user 2 account
	   	 		expect(await exchange.balanceOf(token1.address, user2.address)).to.equal(tokens(1)) 
	   	 		//charge fee account
	   	 		expect(await exchange.balanceOf(token1.address, feeAccount.address)).to.equal(tokens(0))

	   	 		//token get = mDai, token2
	   	 		//user 1 account
	   	 		expect(await exchange.balanceOf(token2.address , user1.address)).to.equal(tokens(1))
	   	 		//user 2 account
	   	 		expect(await exchange.balanceOf(token2.address, user2.address)).to.equal(tokens(0.9)) 
	   	 		//charge fee account
	   	 		expect(await exchange.balanceOf(token2.address, feeAccount.address)).to.equal(tokens(0.1))

	   	 	})

	   	 	//fillorder update 
	   	 	it('updates filled orders', async () => {
	   	 		expect(await exchange.orderFilled(1)).to.equal(true)
	   	 	})

	   	 	//emit event

	   	 	it('emit a Order event', async()=>{
	    			const event = result.events[0] // 2event emmited
	    			expect(await event.event).to.equal('Trade')
	    			//check args
				    const args = event.args
				 	//console.log(args)
				 	expect(args.id).to.equal(1)
				 	expect(args.user).to.equal(user2.address)
				 	expect(args.tokenGet).to.equal(token2.address)
				 	expect(args.amountGet).to.equal(tokens(1))
				 	expect(args.tokenGive).to.equal(token1.address)
				 	expect(args.amountGive).to.equal(tokens(1))
				 	expect(args.creator).to.equal(user1.address)
				 	expect(args.timestamp).to.at.least(1)
			})
   	 	})

   	 	describe('Failure', async () => {
   	 		it('rejects invalid order id', async ()=>{
	   	  	  const invalidOrderId= 9999
			  await expect( exchange.connect(user2).cancelOrder(invalidOrderId)).to.be.reverted   
			})

   	 		it('rejects already filled orders', async ()=>{
	   	  	  transaction = await exchange.connect(user2).fillOrder(1)
			  await transaction.wait()

			  await expect( exchange.connect(user2).fillOrder(1)).to.be.reverted 
			})

			it('rejects cancelled orders', async ()=>{
	   	  	  transaction = await exchange.connect(user1).cancelOrder(1)
			  await transaction.wait() 

			  await expect( exchange.connect(user2).fillOrder(1)).to.be.reverted 
			})



   	 	})



   	  })

   })
   
})
    
 



	