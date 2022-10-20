const {ethers} = require('hardhat'); //importing ether from hardhat library 
const {expect} = require('chai');


// convert the wei to ether
const tokens = (n)=>{
	return ethers.utils.parseUnits(n.toString(),'ether')
}

describe('Exchange', ()=>{
	// the test will go here 


	// preventing any duplicate + factorising let token 
	let deployer, feeAccount , exchange 
	// let accounts
	// let deployer
	const feePercent = 10

	beforeEach(async ()=>{
		accounts =  await ethers.getSigners()
		deployer = accounts[0] //first address from our blockchain
		feeAccount = accounts[1]

		const Exchange = await ethers.getContractFactory('Exchange')
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

   })
    
 



	