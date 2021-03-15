import {createSlice} from '@reduxjs/toolkit';

const initialUserState = {
  encoded_login: null,
  name: null,
  email: null,
  mapboxToken: null,
  password: null,
  image: null,
};

// createSlice combines reducers, actions, and constants
const userProfileSlice = createSlice({
  name: 'user',
  initialState: initialUserState,
  reducers: {
    setUserData(state, action) {
      const {name, email, mapboxToken, password, encoded_login, image} = action.payload;
      state.name = name;
      state.email = email;
      state.mapboxToken = mapboxToken;
      state.password = password;
      state.encoded_login = encoded_login;
      state.image = image;
    },
  },
});

export const {setUserData} = userProfileSlice.actions;

export default userProfileSlice.reducer;
