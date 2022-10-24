//import config.json 
const config = require('../src/config.json')

// convert the wei to ether
const tokens = (n)=>{
  return ethers.utils.parseUnits(n.toString(),'ether')
}

const wait = (seconds) =>{
  const milliseconds = seconds *1000
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

async function main() {

  //fetcging accounts from the wallet  
  const accounts= await ethers.getSigners() 

  //fetch the network 
  const {chainId} = await ethers.provider.getNetwork()
  console.log('Using chainId:', chainId)


  //fetch the tokens & exchange
  const Dapp = await ethers.getContractAt('Token',config[chainId].Dapp.address)
  console.log(`Dapp token fetched: ${Dapp.address}\n`)  

  const mETH = await ethers.getContractAt('Token',config[chainId].mETH.address)
  console.log(`mETH token fetched: ${mETH.address}\n`)  

  const mDAI = await ethers.getContractAt('Token',config[chainId].mDAI.address)
  console.log(`mDAI token fetched: ${mDAI.address}\n`)  

  const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address)
  console.log(`Exchange fetched: ${exchange.address}\n`)  

  //give token to account 1
  const sender = accounts[0]
  const receiver = accounts[1]
  let amount = tokens(10000) 
  let transaction , result

  //transfering 10,000 mETH to receiver 
  transaction = await mETH.connect(sender).transfer(receiver.address, amount)
  result = await transaction.wait()
  console.log(`Transferred ${amount} token from ${sender.address}\n to ${receiver.address}\n `)  
  
  //set-up exchange users 
  const user1 = accounts[0]
  const user2 = accounts[1]
  amount = tokens(10000)

  //deposite to the exchange: everytime we have to approve first then deposite 
  //user 1 approves 10,000 Dapp and deposite
  transaction = await Dapp.connect(user1).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user1.address}\n`)

  transaction = await exchange.connect(user1).depositToken(Dapp.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} tokens from ${user1.address}\n`)

  //user 2 approves 10,000 mETH and deposite 
  transaction = await mETH.connect(user2).approve(exchange.address, amount)
  await transaction.wait()
  console.log(`Approved ${amount} tokens from ${user2.address}\n`)

  transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
  await transaction.wait()
  console.log(`Deposited ${amount} mETH from ${user2.address}\n`)

  //make orders + cancel order 
  //user 1 makes order 
  let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100), Dapp.address, tokens(5))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)

  //cancel order 
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user1).cancelOrder(orderId)
  result = await transaction.wait()
  console.log(`Cancelled order from  ${user1.address}\n`)

  //wait 1 second
  await wait(1)
 

  //fill orders

  //make order first by user 1
  // let orderId
  transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(100), Dapp.address, tokens(10))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)
  
   //fill now
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`filled order from ${user2.address}\n`)
  
  //wait for 1 sec
  await wait(1)

  //user1 makes another order 
  transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(50), Dapp.address, tokens(15))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)
  
  //fill order now 
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`filled  order from ${user2.address}\n`)

  //wait for 1 sec
  await wait(1)
  
  //user makes the final order 
  transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(200), Dapp.address, tokens(20))
  result = await transaction.wait()
  console.log(`Made order from ${user1.address}\n`)
  
  //fill order now 
  orderId = result.events[0].args.id
  transaction = await exchange.connect(user2).fillOrder(orderId)
  result = await transaction.wait()
  console.log(`filled  order from ${user2.address}\n`)

  //wait for 1 sec
  await wait(1)


  //---------------seed open orders------------
  //user1 makes 10 orrders 
  for(let i=1; i <= 10; i++){
    transaction = await exchange.connect(user1).makeOrder(mETH.address,tokens(10 * i), Dapp.address, tokens(20))
    result = await transaction.wait()
    console.log(`Made order from ${user1.address}\n`)

    await wait(1)
  }

  //user2 makes 10 orrders 
    for(let i=1; i<= 10; i++){
    transaction = await exchange.connect(user2).makeOrder(Dapp.address,tokens(10), mETH.address, tokens(10 * i ))
    result = await transaction.wait()
    console.log(`Made order from ${user2.address}\n`)

    await wait(1)
  }
  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
