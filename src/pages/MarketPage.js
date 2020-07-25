import React, { Fragment, useState, useEffect } from 'react'
import useStateWithCallback from 'use-state-with-callback'
import { Loading, Tabs, Icon } from 'element-react'
import { API, graphqlOperation, Auth } from 'aws-amplify'
//import { getMarket } from '../graphql/queries'
import {
  onCreateProduct,
  onUpdateProduct,
  onDeleteProduct
} from '../graphql/subscriptions'
import { Link } from 'react-router-dom'
import NewProduct from '../components/NewProduct'
import Product from '../components/Product'

export const getMarket = /* GraphQL */ `
  query GetMarket($id: ID!) {
    getMarket(id: $id) {
      id
      name
      products {
        items {
          id
          description
          price
          shipped
          owner
          file {
            key
          }
          createdAt
          updatedAt
        }
        nextToken
      }
      tags
      owner
      createdAt
      updatedAt
    }
  }
`
const MarketPage = props => {
  const [isOwner, setIsOwner] = useState(false)
  const [market, setMarket] = useStateWithCallback(
    {
      isLoading: true,
      item: null
    },
    () => checkMarketOwner()
  )
  // destructred the properties
  const { isLoading, item } = market

  const checkMarketOwner = () => {
    if (item) {
      const { user } = props
      setIsOwner(user.username == item.owner)
    }
  }

  async function handleGetMarkets () {
    const input = {
      id: props.marketId
    }
    const result = await API.graphql(graphqlOperation(getMarket, input))

    setMarket({
      isLoading: false,
      item: result.data.getMarket
    })
  }

  const getUser = async () => {
    const user = await Auth.currentUserInfo()

    return user
  }
  useEffect(() => {
    handleGetMarkets()

    let createProductListener = null

    let deleteProductListener = null

    let updateProductListener = null

    getUser().then(user => {
      createProductListener = API.graphql(
        graphqlOperation(onCreateProduct, { owner: user.attributes.sub })
      ).subscribe({
        next: productData => {
          const newProduct = productData.value.data.onCreateProduct
          setMarket(prevState => {
            const preProducts = prevState.item.products.items.filter(
              item => item.id !== newProduct.id
            )
            const updatedProducts = [newProduct, ...preProducts]
            const market = prevState.item
            market.products.items = updatedProducts
            return { isLoading: false, item: market }
          })
        }
      })
    })
    getUser().then(user => {
      deleteProductListener = API.graphql(
        graphqlOperation(onDeleteProduct, { owner: user.attributes.sub })
      ).subscribe({
        next: productData => {
          const deletedProduct = productData.value.data.onDeleteProduct
          setMarket(prevState => {
            const updatedProducts = prevState.item.products.items.filter(
              item => item.id !== deletedProduct.id
            )

            const market = prevState.item
            market.products.items = updatedProducts
            return { isLoading: false, item: market }
          })
        }
      })
    })
    getUser().then(user => {
      updateProductListener = API.graphql(
        graphqlOperation(onUpdateProduct, { owner: user.attributes.sub })
      ).subscribe({
        next: productData => {
          const updatedProduct = productData.value.data.onUpdateProduct
          setMarket(prevState => {
            const updatedProductIndex = prevState.item.products.items.findIndex(
              product => product.id === updatedProduct.id
            )

            const updatedProducts = [
              ...prevState.item.products.items.slice(0, updatedProductIndex),
              updatedProduct,
              ...prevState.item.products.items.slice(updatedProductIndex + 1)
            ]

            const market = prevState.item
            market.products.items = updatedProducts
            return { isLoading: false, item: market }
          })
        }
      })
    })
    return () => {
      createProductListener.unsubscribe()
      deleteProductListener.unsubscribe()
      updateProductListener.unsubscribe()
    }
  }, [])

  return isLoading ? (
    <Loading fullscreen={true} />
  ) : (
    <Fragment>
      <Link className='link' to='/'>
        <Icon name='arrow-left' /> Back to Market List
      </Link>
      <span className='items-center pt-2'>
        <h2 className='mb-mt'>{item.name}</h2> - {item.owner}
      </span>
      <div className='items-center pt-2'>
        <span style={{ color: '(var--lightSquidInk)', paddingBottom: 'lem' }}>
          <Icon name='date' className='icon'></Icon>
          {item.createdAt}
        </span>
      </div>
      <Tabs type='border-card' value={isOwner ? '1' : '2'}>
        {isOwner && (
          <Tabs.Pane
            label={
              <Fragment>
                <Icon name='plus' className='icon' />
                Add Product
              </Fragment>
            }
            name='1'
          >
            <NewProduct marketId={props.marketId} />
          </Tabs.Pane>
        )}

        <Tabs.Pane
          label={
            <Fragment>
              <Icon name='menu' className='icon' />
              Products({item.products ? item.products.items.length : 0})
            </Fragment>
          }
          name='2'
        >
          <div className='product-list'>
            {item.products.items.map(product => (
              <Product key={product.id} product={product} />
            ))}
          </div>
        </Tabs.Pane>
      </Tabs>
    </Fragment>
  )
}

export default MarketPage
