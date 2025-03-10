import userReducer from './slices/userSlice';
import userDetailsReducer from './slices/userDetailsSlice';
import diseaseReducer from './slices/diseaseSlice';
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
  notifications: notificationsReducer
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'user/logout') {
    state = undefined;
  }
  return appReducer(state, action);
};

export default rootReducer;