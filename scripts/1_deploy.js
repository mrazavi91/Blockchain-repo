async function main() {
  // we gonna do stuff

  //Step 1: Fetch contract to deploy, using ether library bc thher can intract withh blockchain for javascript
  const Token = await ethers.getContractFactory("Token")

  //Step2 : Deploy the contract
  const token = await Token.deploy()
  await token.deployed()
  console.log(`Token Deployed to: ${token.address}`)  
}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
