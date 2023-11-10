const {  ApolloServer, gql  } = require('apollo-server')
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolvers')
const conectDB = require('./config/db')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env'})


//DataBase Conexion
conectDB();


//create server
const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({req}) => {
         const token = req.headers['authorization'] || '';
         if(token){
             try {
                const user =  jwt.verify(token.replace('Bearer ', ''), process.env.WORD_TOKEN);
                console.log(token)
                
                return {
                   user
                }
                  
             } catch (error) {
                   console.log('Somenthing wrong has happened');
                   console.log(error);
             }
         }
      }
});


//Run server
server.listen({ port: process.env.PORT || 4000 }).then(({url}) => {
     console.log(`Server ready in the URL ${url}`)
})