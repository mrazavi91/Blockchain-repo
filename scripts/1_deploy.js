//putting into blockchhain
async function main() {
  // we gonna do stuff
  console.log(`preparing depoloyment...\n`)
  //Step 1: Fetch contract to deploy, using ether library bc thher can intract withh blockchain for javascript
  const Token = await ethers.getContractFactory('Token')

  //import the exchange contract 
  const Exchange = await ethers.getContractFactory('Exchange')

  //fetchh the accounts 
  const accounts= await ethers.getSigners() 
  console.log(`Accounts fetched: \n${accounts[0].address}\n${accounts[1].address}\n`)

  //Step2 : Deploy the contracts
  //first token
  const dapp = await Token.deploy('DAPP University','DAPP','1000000')
  await dapp.deployed()
  console.log(`DAPP Deployed to: ${dapp.address}`)  

  //second token 
  const mETH= await Token.deploy('mETH', 'mETH','1000000')
  await mETH.deployed()
  console.log(`mETH Deployed to: ${mETH.address}`) 

  //third token 
  const mDAI= await Token.deploy('mDAI', 'mDAI','1000000')
  await mDAI.deployed()
  console.log(`mDAI Deployed to: ${mDAI.address}`) 

  // deploy exchange 
  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)

}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
