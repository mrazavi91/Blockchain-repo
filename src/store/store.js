import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// importing the reducer that we made!
import {provider,tokens,exchange} from './reducers';
 

const reducer = combineReducers({
	provider,tokens, exchange
})

const initialState=[]

const middleware = [thunk]

//Create a Redux store holding the state of your app.
// Its API is { subscribe, dispatch, getState }.
const store = createStore(reducer, initialState, composeWithDevTools( applyMiddleware(...middleware)))


export default store