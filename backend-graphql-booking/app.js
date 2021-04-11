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
		schema: ,
		rootValue: ,
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
