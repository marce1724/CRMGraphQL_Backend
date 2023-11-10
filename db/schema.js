
const { gql } = require('apollo-server')

const typeDefs = gql `

     type User {
         id: ID
         name: String
         surname: String
         email: String
         created: String
     }

     type Token {
         token: String
     }

     type Product {
         id: ID
         name: String
         stock: Int
         price: Float
         created: String
     }

     type Client {
         id: ID
         name: String
         surname: String
         company: String
         email: String
         phone: String
         seller: ID
     }

     type Order {
         id: ID
         order: [OrderGroup]
         total: Float
         client: Client
         seller: ID
         created: String
         state: stateOrder
     }

     type OrderGroup {
         id: ID
         amount: Int
         name: String
         price: Float
     }

     type TopClient {
         total: Float
         client: [Client]
     }

     type TopSeller { 
          total: Float
          seller: [User]
     }

     input UserInput {
         name: String!
         surname: String!
         email: String!
         password: String!
     }

     input authenticateInput {
         email: String!
         password: String!
     }
    
     input ProductInput {
         name: String!
         stock: Int!
         price: Float!
     }

     input ClientInput {
         name: String!
         surname: String!
         company: String!
         email: String!
         phone: String
     }

     input orderProductInput {
         id: ID
         amount: Int
         name: String
         price: Float
     }

     input OrderInput {
         order: [orderProductInput]
         total: Float
         client: ID
         state: stateOrder
     }
     
     enum stateOrder {
         PENDING
         COMPLETED
         CANCELED
     }
    
     type Query {

         # Users
         getUser: User

         # Products
         getProducts: [Product]
         getProductId(id: ID!) : Product

         # Clients
         getClients: [Client]
         getClientsSeller: [Client]
         getClient(id: ID!): Client

         # Orders
         getOrders: [Order]
         getOrdersSeller: [Order]
         getOrder(id: ID!) : Order
         getOrdersState(state: String!): [Order]

         # Advanced Searches
         getBestClients: [TopClient]
         getBestSellers: [TopSeller]
         searchProduct(text: String!): [Product]
     }

     type Mutation {

         # Users
         createUser(input: UserInput): User
         authenticateUser(input: authenticateInput) : Token

         # Products
         createProduct(input: ProductInput) : Product
         updateProduct(id: ID!, input: ProductInput) : Product
         deleteProduct(id: ID!): String
        
         # Clients
         createCLient(input: ClientInput): Client
         updateClient(id: ID!, input: ClientInput): Client
         deleteClient(id: ID!): String

         # Orders
         createOrder(input: OrderInput): Order
         updateOrder(id: ID!, input: OrderInput): Order
         deleteOrder(id: ID!): String

     }
`;

module.exports = typeDefs;