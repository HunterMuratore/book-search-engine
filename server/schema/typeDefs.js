const gql = String.raw;

const typeDefs = gql`
type User {
    _id: ID!
    username: String!
    email: String!
    savedBooks: [Book]!
}

type Book {
    _id: ID!
    authors: [String]!
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
}

input CreateUserInput {
    username: String!
    email: String!
    password: String!
}
  
input LoginInput {
    usernameOrEmail: String!
    password: String!
}
  
input SaveBookInput {
    book: BookInput!
}
  
input BookInput {
    authors: [String]!
    description: String!
    bookId: String!
    image: String
    link: String
    title: String!
}
  
type AuthPayload {
    token: String!
    user: User!
}
  
type Query {
    me: User
    getSingleUser(id: ID, username: String): User
}
  
type Mutation {
    createUser(input: CreateUserInput!): AuthPayload
    login(input: LoginInput!): AuthPayload
    saveBook(input: SaveBookInput!): User
    deleteBook(bookId: ID!): User
}
`

module.exports = typeDefs;