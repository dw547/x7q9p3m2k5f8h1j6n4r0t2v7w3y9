import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  hardmasks: [],
}


export const rootSlice = createSlice({
  name: 'appstate',
  initialState,
  reducers: {

    addHardmask: (state, action) => {
      state.hardmasks.push(action.payload)
    },
  },
})

// Action creators are generated for each case reducer function
export const { addHardmask } = rootSlice.actions

export default rootSlice.reducer