import {useEffect} from 'react';
// import {ethers} from 'ethers';
// import TOKEN_ABI from '../abis/Token.json'; 
// import EXCHANGE_ABI from '../abis/Exchange.json'; 
import config from '../config.json';
import { useDispatch } from 'react-redux';

import {loadProvider, loadNetwork, loadAccount, loadToken} from '../store/interaction';
 

function App() {
  const dispatch = useDispatch()

  //fetching the metamask wallet to web 
  const loadBlockchainData = async ()=>{

    await loadAccount(dispatch)
    

    //connect ethers to blockchain 
    const provider = loadProvider(dispatch)
    
    const chainId = await loadNetwork(provider, dispatch)
    
    //Token Smart Contract 
    await loadToken(provider, config[chainId].Dapp.address, dispatch)
    //symbol 
    // const symbol = await token.symbol()
    
  }

  useEffect(()=>{
    loadBlockchainData()
  })



  return (
    <div>

      {/* Navbar */}

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          {/* Markets */}

          {/* Balance */}

          {/* Order */}

        </section>
        <section className='exchange__section--right grid'>

          {/* PriceChart */}

          {/* Transactions */}

          {/* Trades */}

          {/* OrderBook */}

        </section>
      </main>

      {/* Alert */}

    </div>
  );
}

export default App; 
