import React, { useEffect, useState, Fragment } from 'react'
import { Authenticator, AmplifyTheme } from 'aws-amplify-react'
import { SectionBody } from 'aws-amplify-react/dist/AmplifyTheme'
import { SectionHeader } from 'aws-amplify-react/dist/AmplifyUI'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { Auth, Hub, Logger, API, graphqlOperation } from 'aws-amplify'
import { getUser } from './graphql/queries'
import { registerUser } from './graphql/mutations'
import Homepage from './pages/HomePage'
import ProfilePage from './pages/ProfilePage'
import MarketPage from './pages/MarketPage'
import Navbar from './components/Navbar'
import './App.css'

export const UserContext = React.createContext()
const theme = {
  ...AmplifyTheme,
  button: {
    ...AmplifyTheme.button,
    backgroundColor: 'var(--amazonOrange)'
  },

  sectionBody: {
    ...AmplifyTheme.sectionBody,
    padding: '5px'
  },
  sectionHeader: {
    ...AmplifyTheme.sectionHeader,
    backgroundColor: 'var(--squidInk)'
  }
}

const handleSignOut = async () => {
  try {
    await Auth.signOut()
  } catch (err) {
    console.error('Error signing out user', err)
  }
}

const App = () => {
  const [user, setUser] = useState('')
  const authListener = new Logger('authWatcher')
  const fetchUserData = async () => {
    const user = await Auth.currentAuthenticatedUser()
    user ? setUser(user) : setUser(null)
  }
  const registerNewUser = async signInData => {
    const getUserInput = {
      id: signInData.signInUserSession.idToken.payload.sub
    }
    const { data } = await API.graphql(graphqlOperation(getUser, getUserInput))
    // if the user has not been registered
    if (!data.getUser) {
      try {
        const registerUserInput = {
          ...getUserInput,
          username: signInData.username,
          email: signInData.signInUserSession.idToken.payload.email,
          registered: true
        }
        const newUser = await API.graphql(
          graphqlOperation(registerUser, { input: registerUserInput })
        )
        console.log({ newUser })
      } catch (err) {
        console.error('Error registering new user', err)
      }
    }
  }
  useEffect(() => {
    fetchUserData()
    Hub.listen('auth', authListener)
    return () => {
      Hub.remove('auth', authListener)
    }
  }, [])

  authListener.onHubCapsule = capsule => {
    switch (capsule.payload.event) {
      case 'signIn':
        console.log('signed in')
        fetchUserData()
        registerNewUser(capsule.payload.data)
        break
      case 'signUp':
        console.log('signed up')
        fetchUserData()
        break
      case 'signOut':
        console.log('signed out')
        setUser(null)
        break
      default:
        return
    }
  }

  return !user ? (
    <Authenticator theme={theme} />
  ) : (
    <UserContext.Provider value={{ user }}>
      <Router>
        <Fragment>
          <Navbar user={user} handleSignOut={handleSignOut} />
          <div className='app-container'>
            <Route exact path='/' component={Homepage}></Route>
            <Route path='/profile' component={ProfilePage}></Route>
            <Route
              path='/markets/:marketId'
              component={props => (
                <MarketPage
                  user={user}
                  marketId={props.match.params.marketId}
                />
              )}
            ></Route>
          </div>
        </Fragment>
      </Router>
    </UserContext.Provider>
  )
}

export default App
