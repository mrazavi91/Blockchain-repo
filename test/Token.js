const {ethers} = require('hardhat'); //importing ether from hardhat library 
const {expect} = require('chai');


// convert the wei to ether
const tokens = (n)=>{
	return ethers.utils.parseEther(n.toString(),'ether')
}

describe('Token', ()=>{
	// the test will go here 


	// preventing any duplicate + factorising let token 
	let token, accounts, deployer, receiver , exchange
	// let accounts
	// let deployer

	beforeEach(async ()=>{
		//step1: fetch tokern from thhe blockchain + deploy
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('DAPP University','DAPP','1000000')

	 	accounts =  await ethers.getSigners()
		deployer = accounts[0] //first address from our blockchain
		receiver = accounts[1]
		exchange = accounts[2]

	})

    describe('Deployment', ()=>{
	
	//put all variable here 
	const name = 'DAPP University'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = tokens('1000000')	

	//name
	it('has correct name', async ()=>{
		
		//step2: read the token name
		//step3: check the name is correct using 
		expect(await token.name()).to.equal(name)
	})

	// symbol 
	it('has correct symbol', async ()=>{
		
		//step2: read the token symbol
		//step3: check the symbol is correct using 
		expect(await token.symbol()).to.equal(symbol)
	})

	//decimal 
	it ('has correct decimals', async ()=>{
		expect(await token.decimals()).to.equal(decimals)
	})

	//total Supply 
	it('has correct total supply', async()=>{
		//const value = tokens('1000000')

		expect(await token.totalSupply()).to.equal(totalSupply)
	})

	//balance 
	it('assign total supply to deployer', async()=>{
		//const value = tokens('1000000')
		// console.log(deployer.address)
		expect(await token.balanceOf(deployer.address)).to.equal(totalSupply)
	})

	})


	//sending tokens
	describe('Sending Tokens', ()=>{
		let amount , transaction , result
		
		describe('Success', async()=>{
		beforeEach( async()=>{
			amount = tokens(100)
		 	transaction = await token.connect(deployer).transfer(receiver.address,amount)
			result = await transaction.wait()
		})

		it('transfer token balances', async()=>{
			// transfer token 
			//ensure that token transfered 
			expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
			expect(await token.balanceOf(receiver.address)).to.equal(amount)
		})

		it('emit a transfer event', async()=>{
			const event = result.events[0]
			// console.log(event)
			expect(event.event).to.equal('Transfer')

			//check args
			const args = event.args
			//console.log(args)
			expect(args.from).to.equal(deployer.address)
			expect(args.to).to.equal(receiver.address)
			expect(args.value).to.equal(amount)
		})


		})

	    describe('Failure', async()=>{
	    	it('rejects insufficient balance', async()=>{
	    		//transfer more token than deployer has- 100M
	    		const invalidAmount = tokens(100000000)
	    		await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
	    	})

	    	it('rejects invalid recipent', async()=>{
	    		//transfer invalid address
	    		const amount = tokens(100)
	    		await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000', amount)).to.be.reverted
	    	})
	    })
	
	})

	describe('Approving tokens', async()=>{
		let amount , transaction , result
		beforeEach( async()=>{
			amount = tokens(100)
		 	transaction = await token.connect(deployer).approve(exchange.address,amount)
			result = await transaction.wait()
		})

		describe('Succes', async()=>{
			it('allocates an allowance for deligated token spending', async ()=>{
				expect(await token.allowance(deployer.address,exchange.address)).to.equal(amount)
			})
		    // event 
		    it('emit a Approval event', async()=>{
		    const event = result.events[0]
			// console.log(event)
			expect(event.event).to.equal('Approval')

			//check args
			const args = event.args
			//console.log(args)
			expect(args.owner).to.equal(deployer.address)
			expect(args.spender).to.equal(exchange.address)
			expect(args.value).to.equal(amount)

		    })
		})

		describe('Failure', async()=>{
			it('rejects invlaid recipent', async()=>{
			await expect(token.connect(deployer).approve('0x0000000000000000000000000000000000000000', amount)).to.be.reverted

		})

		})


	})
	

})