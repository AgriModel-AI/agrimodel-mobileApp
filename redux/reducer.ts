import { combineReducers, UnknownAction } from 'redux';
import userReducer from './slices/userSlice';
import userDetailsReducer from './slices/userDetailsSlice';
import diseaseReducer from './slices/diseaseSlice';


const appReducer = combineReducers({
  user: userReducer,
  userDetails: userDetailsReducer,
  diseases: diseaseReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'user/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;