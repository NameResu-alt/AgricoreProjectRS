import { useState } from 'react'
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginForm from './components/LoginComponent';
import MainPage from './components/MainComponent';

function App() {
  return (
    <>
      <AuthProvider>
        <PageSelect/>
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
