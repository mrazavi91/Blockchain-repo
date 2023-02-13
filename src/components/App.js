import {useEffect} from 'react';
import config from '../config.json';
import { useDispatch } from 'react-redux';
import {loadProvider, loadNetwork, loadAccount, loadTokens, loadExchange} from '../store/interaction';
import Navbar from './Navbar'; 
import Markets from './Markets'
import Balance from './Balance'

function App() {
  const dispatch = useDispatch()

  //fetching the metamask wallet to web 
  const loadBlockchainData = async ()=>{
    //connect ethers to blockchain 
    const provider = loadProvider(dispatch)
    
    //fecth current account and balance from Metamask when account changed 
    window.ethereum.on('accountsChanged', () => {
      loadAccount(provider, dispatch)
    })
    ////////////// await loadAccount(provider, dispatch)

    //fetch current networks chaainId(e.g hardhat: 31337, kovan: 42 )
    const chainId = await loadNetwork(provider, dispatch)
    //reload page when network changes 
    window.ethereum.on('chainChanged', ()=>{
      window.location.reload()
    })
    
    //Token Smart Contract 
    const Dapp = config[chainId].Dapp
    const mETH = config[chainId].mETH
    await loadTokens(provider, [Dapp.address, mETH.address], dispatch)
    
    //exchange smart contract 
    const exchangeConfig = config[chainId].exchange
    await loadExchange(provider, exchangeConfig.address, dispatch)

  }

  useEffect(()=>{
    loadBlockchainData()
  })



  return (
    <div>

      < Navbar />

      <main className='exchange grid'>
        <section className='exchange__section--left grid'>

          <Markets />

          <Balance />

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
