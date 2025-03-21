import userReducer from './slices/userSlice';
import userDetailsReducer from './slices/userDetailsSlice';
import cropReducer from './slices/cropSlice';
import diseaseReducer from './slices/diseaseSlice';
import predictReducer from './slices/predictSlice';
import communitesReducer from './slices/communitySlice';
import postsReducer from './slices/postsSlice';
import notificationsReducer from './slices/notificationSlice';
import { combineReducers } from '@reduxjs/toolkit';


const appReducer = combineReducers({
  user: userReducer,
  userDetails: userDetailsReducer,
  diseases: diseaseReducer,
  communites: communitesReducer,
  posts: postsReducer,
  notifications: notificationsReducer,
  crops: cropReducer,
  predict: predictReducer
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'user/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;