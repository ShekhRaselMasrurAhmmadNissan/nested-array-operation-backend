const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());

const uri = process.env.URI;
const client = new MongoClient(uri, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	serverApi: ServerApiVersion.v1,
});

const allData = require('./Data/data.json');

const run = async () => {
	try {
		const db = client.db('Folders');
		const FoldersCollection = db.collection('FoldersCollection');
		app.get('/', async (req, res) => {
			res.send(allData);
		});
		app.get('/folders', async (req, res) => {
			let { folder, pathName } = req.body;
			const sentLabel = folder.label;
			const allPaths = pathName.split('%%');
			let queryKey = '';
			allPaths.forEach((path) => {
				queryKey = queryKey + 'children.';
			});
			queryKey += 'label';
			const query = {};
			query.label = allPaths[0];
			query[queryKey] = sentLabel;
			const result = await FoldersCollection.findOne(query);
			if (result) {
				return res.send({ status: 'Failed' });
			}
			folder.pathName = pathName + '%%' + folder.label;
			let updateQueryKey = '';
			allPaths.forEach((path, index) => {
				if (index !== allPaths.length - 1) {
					updateQueryKey += 'children.';
				}
			});
			updateQueryKey += 'label';

			const updateQuery = {};
			updateQuery.label = allPaths[0];
			updateQuery[updateQueryKey] = allPaths[allPaths.length - 1];
			const updateResult = FoldersCollection.updateOne(
				{ label: allPaths[0] },
				{
					$addToSet: {
						'children.$[b].children': folder,
					},
				},
				{
					arrayFilters: [{ 'b.label': allPaths[1] }],
				}
			);
			res.send({
				status: 'Success',
				data: updateResult,
				query: query,
				folder: folder,
			});
		});

		app.post('/', async (req, res) => {
			const data = req.body;
			const result = await FoldersCollection.insertOne(data);
			res.send(result);
		});
	} finally {
	}
};
run().catch((err) => console.log(err));

app.listen(port, () => {
	console.log('The server is running.');
});
