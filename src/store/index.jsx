import { legacy_createStore } from 'redux';
import reducers from './reducers';
export default legacy_createStore(reducers);