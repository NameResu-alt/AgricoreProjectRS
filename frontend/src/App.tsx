import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginComponent';
import MainPage from './components/MainComponent';
import { createTheme, ThemeProvider } from '@mui/material';

const theme = createTheme({
  colorSchemes:{
    dark: true,
    light: true
  }
})


function App() {
  return (
    <>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <PageSelect/>
        </ThemeProvider>
      </AuthProvider>
    </>
  )
}

function PageSelect(){
  const {isAuthenticated} = useAuth()
  return (
    <>
      {isAuthenticated && <MainPage/>}
      {!isAuthenticated && <LoginForm/>}
    </>
  )
}

export default App
