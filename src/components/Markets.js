import config from '../config.json'
import { useSelector , useDispatch} from 'react-redux'
import {loadTokens} from '../store/interaction'

//FETCHHING chainId from thhe state

const Markets = () =>{
  const chainId = useSelector(state=> state.provider.chainId)
  const provider = useSelector(state=> state.provider.connection)
  const dispatch = useDispatch()
  const marketHandler = async (e)=>{
    // console.log('market changed... ')

    await loadTokens(provider, (e.target.value).split(","), dispatch)
  }

  return(
    <div className='component exchange__markets'>
      <div className='component__header'>
        <h2>Select Market</h2>
      </div>

      {chainId && config[chainId] ? (
        <select name="markets" id="markets" onChange= {marketHandler} >
          <option value={`${config[chainId].Dapp.address},${config[chainId].mETH.address}`}>DApp / mETH</option>
          <option value={`${config[chainId].Dapp.address},${config[chainId].mDAI.address}`}>DApp / mDAI</option>
        </select>
      ) : (
        <div>
          <p>Not Deployed to Network</p>
        </div>
      )}

      <hr />
    </div>
  )
}

export default Markets;