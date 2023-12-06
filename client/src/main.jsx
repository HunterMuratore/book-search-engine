import ReactDOM from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

import App from './App.jsx'
import SearchBooks from './pages/SearchBooks'
import SavedBooks from './pages/SavedBooks'

import { ApolloClient, InMemoryCache, ApolloProvider, HttpLink } from '@apollo/client'
import { onError } from '@apollo/client/link/error'

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    })
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`)
  }
})

const httpLink = new HttpLink({
  uri: '/graphql',
})

const client = new ApolloClient({
  link: errorLink.concat(httpLink),
  cache: new InMemoryCache()
})

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    ),
    errorElement: <h1 className='display-2'>Wrong page!</h1>,
    children: [
      {
        index: true,
        element: (
          <ApolloProvider client={client}>
            <SearchBooks />
          </ApolloProvider>
        ),
      },
      {
        path: '/saved',
        element: (
          <ApolloProvider client={client}>
            <SavedBooks />
          </ApolloProvider>
        ),
      },
    ],
  },
])

ReactDOM.createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
