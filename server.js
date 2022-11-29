const express = require('express')
const expressGraphQL = require('express-graphql').graphqlHTTP
const {
    GraphQLSchema,
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull,
} = require('graphql')
const app = express()


const authors = [
    {id: 1, name: 'J. K. Rowling'},
    {id: 2, name: 'J. R. R. Tolkien'},
    {id: 3, name: 'Brent Weeks'}
]

const books = [
    {id: 1, name: 'Harry Potter and Chamber of Secreats', authorId: 1},
    {id: 2, name: 'Harry Potter and Prisinor of Azkaban', authorId: 1},
    {id: 3, name: 'Harry Potter and Goblet of Fire', authorId: 1},
    {id: 4, name: 'The fellowship of the Ring', authorId: 2},
    {id: 5, name: 'The Two Towers', authorId: 2},
    {id: 6, name: 'The return of the King', authorId: 2},
    {id: 7, name: 'The Way of shadows', authorId: 3},
    {id: 8, name: 'Beyond the shadows', authorId: 3},
]

const BookType = new GraphQLObjectType({
    name: 'Book',
    description: 'This represents a book written by author',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        authorId: {type: new GraphQLNonNull(GraphQLInt)},
        author: {
            type: AuthorType,
            resolve: (book) => {
                return authors.find( author => author.id === book.authorId)
            }
        }
    })
})

const AuthorType = new GraphQLObjectType({
    name: 'Author',
    description: 'This represents an author of a book',
    fields: () => ({
        id: {type: new GraphQLNonNull(GraphQLInt)},
        name: {type: new GraphQLNonNull(GraphQLString)},
        books: {
            type: new GraphQLList(BookType),
            resolve: (author) => {
                return books.filter( book => book.authorId === author.id)
            }
        }
    })
})

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        books: {
            type: new GraphQLList(BookType),
            deprecation: 'List of books',
            resolve: () => books
        },
        authors: {
            type: new GraphQLList(AuthorType),
            deprecation: 'List of authors',
            resolve: () => authors
        },
        book:{
            type: BookType,
            deprecation: 'A single book',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, arg) => books.find(book => book.id === arg.id)
        }, 
        author:{
            type: AuthorType,
            deprecation: 'A single author',
            args: {
                id: {type: GraphQLInt}
            },
            resolve: (parent, arg) => authors.find(author => author.id === arg.id)
        }
    })
})

const RootMutationType = new GraphQLObjectType({
    name: 'Mutation',
    description: 'Root Mutation',
    fields: () => ({
        addBook: {
            type: BookType,
            description: 'Add a book',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString)},
                authorId: { type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (parent, args) => {
                const book = { id: books.length + 1, name: args.name, authorId: args.authorId}
                books.push(book)
                return book
            }
        },
        addAuthor: {
            type: AuthorType,
            description: 'Add an author',
            args: {
                name: { type: new GraphQLNonNull(GraphQLString)},
            },
            resolve: (parent, args) => {
                const author = { id: authors.length + 1, name: args.name}
                authors.push(author)
                return author
            }
        }
    })
})

const schema = new GraphQLSchema({
    query: RootQueryType,
    mutation: RootMutationType
})

app.use('/graphql', expressGraphQL({
    schema: schema,
    graphiql: true
}))

app.listen(5000, () => console.log('Server is running on port 5000'))