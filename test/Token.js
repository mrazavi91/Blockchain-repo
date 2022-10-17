const {ethers} = require('hardhat'); //importing ether from hardhat library 
const {expect} = require('chai');


// convert the wei to ether
const tokens = (n)=>{
	return ethers.utils.parseEther(n.toString(),'ether')
}

describe('Token', ()=>{
	// the test will go here 


	// preventing any duplicate + factorising let token 
	let token

	beforeEach(async ()=>{
		//step1: fetch tokern from thhe blockchain + deploy
		const Token = await ethers.getContractFactory('Token')
		token = await Token.deploy('DAPP University','DAPP','1000000')

	})

	describe('Deployment', ()=>{
	
	//put all variable here 
	const name = 'DAPP University'
	const symbol = 'DAPP'
	const decimals = '18'
	const totalSupply = '1000000'


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

		expect(await token.totalSupply()).to.equal(tokens(totalSupply))
	})


	})

	

})