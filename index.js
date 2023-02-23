const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri =
	'mongodb+srv://NestedArray:hIy2RYrs7hSH4lwj@crud-operation.rls08mc.mongodb.net/?retryWrites=true&w=majority';
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const run = async () => {
	try {
		const db = client.db('Folders');
		const FoldersCollection = db.collection('FoldersCollection');
		app.get('/', async (req, res) => {
			res.send('Nested array operation is running.');
		});
		app.get('/folders', async (req, res) => {
			const query = {};
			const result = await FoldersCollection.find(query).toArray();
			res.send({ status: 'Success', data: result });
		});
	} finally {
	}
};
run().catch((err) => console.log(err));

app.listen(port, () => {
	console.log('The server is running.');
});