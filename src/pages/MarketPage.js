import React, { Fragment, useState, useEffect } from 'react'
import useStateWithCallback from 'use-state-with-callback'
import { Loading, Tabs, Icon } from 'element-react'
import { API, graphqlOperation } from 'aws-amplify'
import { getMarket } from '../graphql/queries'
import { Link } from 'react-router-dom'
import NewProduct from '../components/NewProduct'
import Product from '../components/Product'
const MarketPage = props => {
  const [isOwner, setIsOwner] = useState(false)
  const [market, setMarket] = useStateWithCallback(
    {
      isLoading: true,
      item: null
    },
    () => checkMarketOwner()
  )
  const { isLoading, item } = market

  const checkMarketOwner = () => {
    if (market.item) {
      const { user } = props
      setIsOwner(user.username == item.owner)
    }
  }

  const handleGetMarkets = async () => {
    const input = {
      id: props.marketId
    }
    const result = await API.graphql(graphqlOperation(getMarket, input))

    setMarket({
      isLoading: false,
      item: result.data.getMarket
    })
  }

  useEffect(() => {
    handleGetMarkets()
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
            <NewProduct />
          </Tabs.Pane>
        )}

        <Tabs.Pane
          label={
            <Fragment>
              <Icon name='menu' className='icon' />
              Products({market.products ? market.products.items.length : 0})
            </Fragment>
          }
          name='2'
        >
          <div className='product-list'>
            {/* {market.products.items.map(product=>{
              <Product product={product}/>
            }

            )} */}
          </div>
        </Tabs.Pane>
      </Tabs>
    </Fragment>
  )
}

export default MarketPage
