import React, { Fragment } from 'react'
import { Connect } from 'aws-amplify-react'
import { listMarkets } from '../graphql/queries'
import { graphqlOperation } from 'aws-amplify'
import { onCreateMarket } from '../graphql/subscriptions'
import { Loading, Card, Tag } from 'element-react'
import { Icon } from 'react-icons-kit'

import { database } from 'react-icons-kit/icomoon/database'
import { cart } from 'react-icons-kit/icomoon/cart'
import { Link } from 'react-router-dom'
import Error from './Error'

// const onNewMarket = (prevQuery, newData) => {
//   let updatedQuery = { ...prevQuery }
//   const updatedMarketList = [
//     newData.onCreateMarket,
//     ...prevQuery.listMarkets.items
//   ]
//   updatedQuery.listMarkets.items = updatedMarketList
//   return updatedQuery
// }
const MarketList = ({ searchResults }) => {
  return (
    <Connect
      query={graphqlOperation(listMarkets)}
      subscription={graphqlOperation(onCreateMarket)}
      onSubscriptionMsg={(prevQuery, newData) => {
        let updatedQuery = { ...prevQuery }
        const updatedMarketList = [
          newData.onCreateMarket,
          ...prevQuery.listMarkets.items
        ]
        updatedQuery.listMarkets.items = updatedMarketList
        return updatedQuery
      }}
    >
      {({ data, loading, errors }) => {
        if (errors.length > 0) return <Error errors={errors} />
        if (loading || !data.listMarkets) return <Loading fullscreen={true} />
        const markets =
          (searchResults && searchResults.length) > 0
            ? searchResults
            : data.listMarkets.items

        return (
          <Fragment>
            {searchResults && searchResults.length > 0 ? (
              <h2 className='text-green'>
                <Icon type='success' name='check' className='icon' />
                {searchResults.length} Results
              </h2>
            ) : (
              <h2 className='header'>
                <Icon size={32} icon={database} className='img-icon' />
                Markets
              </h2>
            )}
            {markets.map(market => (
              <div key={market.id} className='my-2'>
                <Card
                  bodyStyle={{
                    padding: '0.7em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div style={{ color: '#F4A261' }}>
                    <span className='flex'>
                      <Link className='link' to={`/markets/${market.id}`}>
                        {market.name}
                      </Link>
                      <span style={{ color: 'var(--darkAmazonOrange)' }}>
                        {market.products.items
                          ? market.products.items.length
                          : 0}
                      </span>
                      <Icon icon={cart} />
                    </span>
                    <div style={{ color: 'var(--lightSquidInk' }}>
                      {market.owner}
                    </div>
                  </div>
                  <div>
                    {market.tags &&
                      market.tags.map(tag => (
                        <Tag key={tag} type='danger' className='mx-1'>
                          {tag}
                        </Tag>
                      ))}
                  </div>
                </Card>
              </div>
            ))}
          </Fragment>
        )
      }}
    </Connect>
  )
}

export default MarketList
