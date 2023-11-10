const User = require('../models/User')
const Product = require('../models/Products')
const Client = require('../models/Client')
const Order = require('../models/Order')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config({ path: 'variables.env'})


const createToken = (user, secret, expiresIn) =>{
       
      const {id, email, name, surname} = user;
      

      return jwt.sign({id, email, name, surname}, secret, {expiresIn});
}

const resolvers = {
     
     Query: {
           getUser: async (_, {}, ctx) => {
                return ctx.user;    
           },
           getProducts: async() => {
                try {
                     const products = await Product.find({});

                     return products;

                } catch (error) {
                     console.log(error)
                }
           },
           getProductId: async(_, {id}) => {
                //Check if the product exist or no
                const product = await Product.findById(id);

                if(!product){
                     throw new Error('Product not find');
                }

                return product;
           },
           getClients: async() => {
                try {
                     const clients = await Client.find({});
                     return clients;

                } catch (error) {
                     console.log(error)
                }
           },
           getClientsSeller: async(_, {}, ctx) => {
               try {
                    const clients = await Client.find({seller: ctx.user.id.toString()});
                    return clients;

               } catch (error) {
                    console.log(error)
               }
           },
           getClient: async(_, {id}, ctx) => {
                //Check if the client exist
                const client = await Client.findById(id);

                if(!client) {
                    throw new Error('Client not find');
                }

                //Validate who have the access
                if(client.seller.toString() != ctx.user.id){
                     throw new('you do not have the credentials');
                }

                return client;
           },
           getOrders: async() => {

                try {
                     const orders = await Order.find({});

                     return orders;
                    
                } catch (error) {
                     console.log(error)
                } 
           },
           getOrdersSeller: async(_, {}, ctx) => {

               try {
                    const orders = await Order.find({seller: ctx.user.id}).populate('client');

                    return orders;
                   
               } catch (error) {
                    console.log(error)
               } 
           },
           getOrder: async(_, {id}, ctx) => {

                //Validate if the order exist
                const order = await Order.findById(id);
                if(!order){
                    throw new Error('Order not find');
                }

                //Validate if the cient have the credencials
                if(order.seller.toString() !== ctx.user.id) {
                    throw new Error('you do not have the credencials');
                }

                return order;
           },
           getOrdersState: async(_, {state}, ctx) => {

                const orders = await Order.find({seller: ctx.user.id, state: state});
                return orders;
           },
           getBestClients: async() => {

                const clients = await Order.aggregate([

                    { $match : {state: "COMPLETED"}},
                    { $group : {
                         _id: "$client",
                         total:  {$sum: '$total'}
                    }},
                    {
                         $lookup: {
                               from: 'clients',
                               localField: '_id',
                               foreignField: "_id",
                               as: "client"
                         }
                    },
                    {
                         $limit: 10
                    },
                    {
                         $sort: {total: -1}
                    }
                ]);

                return clients;
           },
           getBestSellers: async() => {
               const sellers = await Order.aggregate([

                    { $match : {state: "COMPLETED"}},
                    { $group : {
                         _id: "$seller",
                         total:  {$sum: '$total'}
                    }},
                    {
                         $lookup: {
                               from: 'users',
                               localField: '_id',
                               foreignField: "_id",
                               as: "seller"
                         }
                    },
                    {
                         $limit: 3
                    },
                    {
                         $sort: {total: -1}
                    }
                ]);

                return sellers;
           },
           searchProduct: async(_, {text}) => {

                const products = await Product.find({ $text: {$search: text }})

                return products;
           }

     },

     Mutation: {
         createUser: async (_, {input}) => {

             const {email, password} = input;
            
            //Validate if the user is already exists
            const existsUser = await User.findOne({email});
            if(existsUser){
                 throw new Error('The user is already exists');
            }

            //Hashear Password
            const salt = await bcryptjs.genSaltSync(10);
            input.password = await bcryptjs.hash(password,salt);


            //Save user in the Database
            try {
                 const user = new User(input);
                 user.save();
                 return user;

            } catch (error) {
                 console.log(error);
            }

         },
         authenticateUser: async(_, {input}) =>{
                const {email, password} = input;
               
                //Validate if the user is already exists
                const existsUser = await User.findOne({email});
                if(!existsUser){
                    throw new Error('The user does not exist');
                }

                //Validate if the password is correct
                const correctPassword = await bcryptjs.compare(password, existsUser.password);
                if(!correctPassword){
                    throw new Error('Incorrect Password');
                }

                //Create token
                return {
                     token: createToken(existsUser,process.env.WORD_TOKEN, '24h')
                }
         },
         createProduct : async(_, {input}) => {
             try {
                const product = new Product(input);

                //Save in the database
                const result = await product.save();

                return result;

             } catch (error) {
                console.log(error);
             }

         },
         updateProduct: async(_, {id, input}) => {
               //Check if the product exist or no
               let product = await Product.findById(id);

               if(!product){
                    throw new Error('Product not find');
               }

               //Update product in the dataBase
               product = await Product.findOneAndUpdate({_id: id}, input, {new: true});

               return product;
         },
         deleteProduct: async(_, {id}) => {
              //Check if the product exist or no
               let product = await Product.findById(id);

               if(!product){
                    throw new Error('Product not find');
               }

               //Delete product from the dataBase
               await Product.findOneAndDelete({_id: id});

               return "Product has been deleted";
         },
         createCLient: async(_, {input}, ctx) => {
              const {email} = input;

               //Check if the client exist
               const client =  await Client.findOne({email});
               if(client){
                    throw new Error('The client already exists');
               }
               
               const newClient = new Client(input)

               //Assign a seller
               newClient.seller = ctx.user.id;
              
               //Save in the database

               try {
                 
                    const result = await newClient.save();
     
                    return result;
                    
               } catch (error) {
                    console.log(error);
               }
         },
         updateClient: async(_, {id, input}, ctx) => {
               //Check if the client exist
               let client = await Client.findById(id);

               if(!client) {
                    throw new Error('Client not find');
               }

               //Validate who have the access
               if(client.seller.toString() != ctx.user.id){
                    throw new('you do not have the credentials');
               }

               //Update Client in the database
               client = await Client.findOneAndUpdate({_id: id}, input, {new: true});
               return client;

         },
         deleteClient: async(_, {id}, ctx) => {
               //Check if the client exist
               let client = await Client.findById(id);

               if(!client) {
                    throw new Error('Client not find');
               }

               //Validate who have the access
               if(client.seller.toString() != ctx.user.id){
                    throw new('you do not have the credentials');
               }

               //Delete Client from the database
               await Client.findOneAndDelete({_id: id});

               return "Client has been deleted";
         },
         createOrder: async(_ ,{input}, ctx) => {

                const {client} = input

                //Validate if the client exist
                let clientExist = await Client.findById(client);

                if(!clientExist) {
                    throw new Error('Client not find');
                }

                 //Validate if the client belongs to the seller
                if(clientExist.seller.toString() != ctx.user.id){
                    throw new('you do not have the credentials');
                }

                 //Validate if there is stock available
                for await (const item of input.order){

                     const {id} = item
                     const product = await Product.findById(id);

                     if(item.amount > product.stock){
                         throw new(`the product exceeds quantity available`);

                     }else{
                          //reduce stock
                          product.stock = product.stock - item.amount;
                          await product.save();
                     }
                }

                //Create a new order
                const newOrder = new Order(input);

                //Assign a seller
                newOrder.seller = ctx.user.id;

                //Save order in the database
                const result = await newOrder.save();

                return result;
         },
         updateOrder: async(_, {id, input}, ctx) => {
                
                const {client} = input;

                //Validate if the order exist
                const orderExist = await Order.findById(id);
                if(!orderExist) {
                     throw new(`Order not find`);
                }

                //Validate if the client exist
                let clientExist = await Client.findById(client);

                if(!clientExist) {
                     throw new Error('Client not find');
                }

                //Validate if the client and order belongs to the seller
                if(clientExist.seller.toString() != ctx.user.id){
                    throw new('you do not have the credentials');
                }
                
                //Validate if there is stock available
                for await (const item of input.order){

                    const {id} = item
                    const product = await Product.findById(id);

                    if(item.amount > product.stock){
                        throw new(`the product exceeds quantity available`);

                    }else{
                         //reduce stock
                         product.stock = product.stock - item.amount;
                         await product.save();
                    }
               }

                //Update Order in the database
                const result = await Order.findOneAndUpdate({_id: id}, input, {new: true});
                return result;
         },
         deleteOrder: async(_, {id}, ctx) => {

                //Validate if the order exist
                const orderExist = await Order.findById(id);
                if(!orderExist) {
                      throw new(`Order not find`);
                }


                //Validate if the client and order belongs to the seller
                if(orderExist.seller.toString() != ctx.user.id){
                     throw new('you do not have the credentials');
                }

                //Delete order in the database
                await Order.findOneAndDelete({_id: id});

                return "Order has been deleted";
         }
     }
}

module.exports = resolvers;