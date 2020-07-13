import React, { Fragment, useState } from 'react'
import NewMarket from '../components/NewMarket'
import MarketList from '../components/MarketList'
import { API, graphqlOperation } from 'aws-amplify'
import { searchMarkets } from '../graphql/queries'
const HomePage = () => {
  const [search, setSearch] = useState({
    searchTerm: '',
    searchResults: [],
    isSearching: false
  })

  const handleSearchChange = searchTerm => setSearch({ searchTerm: searchTerm })
  const handleClearSearch = () => {
    console.log(search.searchTerm)
    setSearch({ ...search, searchTerm: '' })
  }
  const handleSearch = async event => {
    try {
      event.preventDefault()
      setSearch({ ...search, isSearching: true })
      const result = await API.graphql(
        graphqlOperation(searchMarkets, {
          filter: {
            or: [
              { name: { match: search.searchTerm } },
              { owner: { match: search.searchTerm } },
              { tags: { match: search.searchTerm } }
            ]
          },
          sort: {
            field: 'createdAt',
            direction: 'desc'
          }
        })
      )
      //  console.log(result.data.searchMarkets.items)
      setSearch({
        ...search,
        searchResults: result.data.searchMarkets.items,
        isSearching: false
      })
    } catch (err) {
      console.error(err)
    }
  }
  return (
    <Fragment>
      <NewMarket
        handleSearch={handleSearch}
        isSearching={search.isSearching}
        searchTerm={search.searchTerm}
        handleSearchChange={handleSearchChange}
        handleClearSearch={handleClearSearch}
      ></NewMarket>
      <MarketList searchResults={search.searchResults} />
    </Fragment>
  )
}
export default HomePage
