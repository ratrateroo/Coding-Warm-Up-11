const express = require('express');
const bodyParser = require('body-parser');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

const events = [];

//app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
	'/graphql',
	graphqlHTTP({
		schema: buildSchema(`
		type Booking {
			_id: ID!
			event: Event!
			user: User!
			createdAt: String!
			updatedAt: String!
		}

        type Event {
          _id: ID!
          title: String!
          description: String!
          price: Float!
          date: String!
		  creator: User!
        }

		 type User {
          _id: ID!
          email: String!
          password: String
		  createdEvents: [Event!]
        }

        input EventInput {
          title: String!
          description: String!
          price: Float!
          date: String!
        }

		input UserInput {
          email: String!
          password: String!
        }

        type RootQuery {
            events: [Event!]!
        }

        type RootMutation {
            createEvent(eventInput: EventInput): Event
			createUser(userInput: UserInput): User
			bookEvent(eventId: ID!): Booking!
    cancelBooking(bookingId: ID!): Event!
        }

        schema {
            query: RootQuery
            mutation: RootMutation
        }
    `),
		rootValue: {
			events: () => {
				return Event.find()
					.then((events) => {
						return events.map((event) => {
							return { ...event._doc, _id: event.id };
						});
					})
					.catch((err) => {
						throw err;
					});
			},
			createEvent: (args) => {
				const event = new Event({
					title: args.eventInput.title,
					description: args.eventInput.description,
					price: +args.eventInput.price,
					date: new Date(args.eventInput.date),
					creator: 'idgoeshere',
				});
				let createdEvent;
				return event
					.save()
					.then((result) => {
						createdEvent = {
							...result._doc,
							_id: result._doc._id.toString(),
						};
						return User.findById('idgoeshere');
					})
					.then((user) => {
						if (!user) {
							throw new Error('User not found.');
						}
						user.createdEvents.push(event);
						return user.save();
					})
					.then((result) => {
						return createdEvent;
					})
					.catch((err) => {
						console.log(err);
						throw err;
					});
			},
			createUser: (args) => {
				return User.findOne({ email: args.userInput.email })
					.then((user) => {
						if (user) {
							throw new Error('User exists already.');
						}
						return bcrypt.hash(args.userInput.password, 12);
					})
					.then((hashedPassword) => {
						const user = new User({
							email: args.userInput.email,
							password: hashedPassword,
						});
						return user.save();
					})
					.then((result) => {
						return { ...result._doc, password: null, _id: result.id };
					})
					.catch((err) => {
						throw err;
					});
			},
		},
		graphiql: true,
	})
);

const url = `mongodb://127.0.0.1:27017/${process.env.MONGO_DB}`;

mongoose
	.connect(url, { useNewUrlParser: true, useUnifiedTopology: true })
	.then(() => {
		console.log('Connected to the Database.');
		app.listen(3000);
	})
	.catch((error) => {
		console.log(error);
	});
