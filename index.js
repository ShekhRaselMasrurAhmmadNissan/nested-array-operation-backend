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

		app.patch('/folders', async (req, res) => {
			// Extracting values from req.bodt
			let { folder, pathName } = req.body;

			/**
			 * Checking for the folder is exist or not
			 */
			const sentLabel = folder.label;
			// Targeted paths
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

			/**
			 * Update part start
			 */
			// Setting New folder pathName
			folder.pathName = pathName + '%%' + folder.label;

			// Making the queries
			let updateQueryKey = '';
			let filteringOptions = [];
			allPaths.forEach((path, index) => {
				if (index !== allPaths.length - 1) {
					updateQueryKey += `children.$[a${index}].`;
					let option = {};
					option[`a${index}.label`] = allPaths[index + 1];
					filteringOptions = [...filteringOptions, option];
				}
			});
			updateQueryKey += 'children';

			let updateQuery = {};
			updateQuery[updateQueryKey] = folder;
			// Update Operation
			const updateResult = await FoldersCollection.updateOne(
				{ label: allPaths[0] },
				{
					$push: updateQuery,
				},
				{ arrayFilters: filteringOptions }
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
