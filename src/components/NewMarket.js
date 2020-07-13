import React, { useState, Fragment } from 'react'
import { API, graphqlOperation } from 'aws-amplify'
import { createMarket } from '../graphql/mutations'
import { UserContext } from '../App'
import {
  Form,
  Button,
  Dialog,
  Input,
  Select,
  Notification
} from 'element-react'

const NewMarket = props => {
  const [display, setDisplay] = useState(false)
  const [options, setOptions] = useState([])
  const [marketName, setMarketName] = useState(null)
  const [tags, setTags] = useState([
    'Arts',
    'Technology',
    'Crafts',
    'Music',
    'Health'
  ])
  const [selectedTags, setSelectedTags] = useState([])
  const handleFilterTags = query => {
    const options = tags
      .map(tag => ({ value: tag, label: tag }))
      .filter(tag => tag.label.toLowerCase().includes(query.toLowerCase()))
    setOptions(options)
  }
  const handleAddMarket = async user => {
    try {
      setDisplay(false)
      const input = {
        name: marketName,
        owner: user.username,
        tags: selectedTags
      }
      const result = await API.graphql(
        graphqlOperation(createMarket, {
          input
        })
      )
      console.log(`Create market: id ${result.data.createMarket.id}`)

      setMarketName('')
    } catch (err) {
      console.log(err)
      Notification.error({
        title: 'Error',
        message: `${err.message || 'Error adding market'}`
      })
    }
  }
  return (
    <UserContext.Consumer>
      {({ user }) => (
        <Fragment>
          <div className='market-header'>
            <h1 className='market-title'>
              Create Your MarketPlace
              <Button
                type='text'
                icon='edit'
                className='market-title-button'
                onClick={() => setDisplay(true)}
              ></Button>
            </h1>

            <Form inline={true}>
              <Form.Item>
                <Input
                  placeholder='Search Markets...'
                  value={props.searchTerm}
                  icon='circle-cross'
                  onChange={props.handleSearchChange}
                  onIconClick={props.handleClearSearch}
                />
              </Form.Item>
              <Form.Item>
                <Button
                  type='info'
                  icon='search'
                  onClick={props.handleSearch}
                  loading={props.isSearching}
                >
                  Search
                </Button>
              </Form.Item>
            </Form>
          </div>
          <Dialog
            title='Create New Market'
            visible={display}
            onCancel={() => setDisplay(false)}
            size='large'
            customClass='dialog'
          >
            <Dialog.Body>
              <Form labelPosition='top'>
                <Form.Item label='Add Market Name'>
                  <Input
                    placeholder='Market Name'
                    trim={true}
                    onChange={name => setMarketName(name)}
                    value={marketName}
                  ></Input>
                </Form.Item>
                <Form.Item label='Add Tags'>
                  <Select
                    multiple={true}
                    filterable={true}
                    placeholder='Market Tags'
                    onChange={selectedTags => setSelectedTags(selectedTags)}
                    remoteMethod={handleFilterTags}
                    remote={true}
                  >
                    {options.map(option => (
                      <Select.Option
                        key={option.label}
                        label={option.label}
                        value={option.value}
                      />
                    ))}
                  </Select>
                </Form.Item>
              </Form>
            </Dialog.Body>
            <Dialog.Footer>
              <Button onClick={() => setDisplay(false)}>Cancle</Button>
              <Button
                type='primary'
                disabled={!marketName}
                onClick={() => handleAddMarket(user)}
              >
                Add
              </Button>
            </Dialog.Footer>
          </Dialog>
        </Fragment>
      )}
    </UserContext.Consumer>
  )
}

export default NewMarket
