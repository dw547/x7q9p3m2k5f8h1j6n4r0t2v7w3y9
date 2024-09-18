import { configureStore } from '@reduxjs/toolkit'
import rootSlice from '../reducers/rootSlice'
export const store = configureStore({
  reducer: {
    appstate: rootSlice
  }
})