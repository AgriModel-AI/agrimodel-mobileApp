import { combineReducers, UnknownAction } from 'redux';
import userReducer from './slices/userSlice';
import userDetailsReducer from './slices/userDetailsSlice';


const appReducer = combineReducers({
  user: userReducer,
  userDetails: userDetailsReducer,
});

const rootReducer = (state: Partial<{ user: { jwtToken: null; refreshToken: null; } | undefined; userDetails: { userDetails: {}; loading: boolean; error: null; hasFetched: boolean; } | undefined; }> | undefined, action: UnknownAction) => {
  if (action.type === 'user/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;