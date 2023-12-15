import { gql } from '@apollo/client'

export const LOGIN_USER = gql`
mutation loginUser($input: LoginInput!) {
    loginUser(input: $input) {
        token
        user {
            _id
            username
            email
        }
    }
}
`

export const ADD_USER = gql`
mutation addUser($input: CreateUserInput!) {
    addUser(input: $input) {
        token
        user {
            _id
            username
            email
        }
    }
}
`

export const SAVE_BOOK = gql`
mutation saveBook($input: SaveBookInput!) {
    saveBook(input: $input) {
        _id
        username
        email
        savedBooks {
            _id
            authors
            description
            bookId
            image
            link
            title
        }
    }
}
`

export const DELETE_BOOK = gql`
  mutation deleteBook($bookId: ID!) {
    deleteBook(bookId: $bookId) {
        _id
        username
        email
        savedBooks {
            _id
            authors
            description
            bookId
            image
            link
            title
        }
    }
}
`