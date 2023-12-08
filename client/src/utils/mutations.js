import { gql } from '@apollo/client'

export const LOGIN_USER = gql`
mutation loginUser($usernameOrEmail: String!, $password: String!) {
    loginUser(input: { usernameOrEmail: $usernameOrEmail, password: $password }) {
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
mutation addUser($username: String!, $email: String!, $password: String!) {
    addUser(input: { username: $username, email: $email, password: $password }) {
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
mutation saveBook($book: BookInput!) {
    saveBook(input: { book: $book }) {
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