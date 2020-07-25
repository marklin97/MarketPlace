import React from 'react'
import { Menu as Nav, Button } from 'element-react'
import { Icon } from 'react-icons-kit'
import { gear } from 'react-icons-kit/fa/gear'
import { library } from 'react-icons-kit/icomoon/library'
import { NavLink } from 'react-router-dom'

const Navbar = ({ user, handleSignOut }) => (
  <Nav mode='horizontal' theme='dark' defaultActive='1'>
    <div className='nav-container'>
      <Nav.Item index='1'>
        <NavLink to='/' className='nav-link'>
          <span className='app-title'>
            <Icon size={32} icon={library} className='app-icon' />
            MarketPlace
          </span>
        </NavLink>
      </Nav.Item>
      <div className='nav-items'>
        <Nav.Item index='2'>
          <span className='app-user'>Hello,{user.username}</span>
        </Nav.Item>
        <Nav.Item index='3'>
          <NavLink to='/profile' className='nav-link' />
          <Icon size={26} icon={gear} className='app-icon' />
          Profile
        </Nav.Item>
        <Nav.Item index='4'>
          <Button type='warning' onClick={handleSignOut}>
            Sign Out
          </Button>
        </Nav.Item>
      </div>
    </div>
  </Nav>
)

export default Navbar
