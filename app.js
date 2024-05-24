import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import { nanoid } from 'nanoid';
import 'dotenv/config';

const app = express();
const PORT = 10000;

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

// Define URL schema and model
const urlSchema = new mongoose.Schema({
  longUrl: String,
  shortUrl: String,
  urlCode: String,
  date: { type: String, default: Date.now }
});

const Url = mongoose.model('Url', urlSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve HTML form for URL shortening
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'view', 'index.html'));
});

// Handle URL shortening
app.post('/shorten', async (req, res) => {
  const { longUrl } = req.body;
  const urlCode = nanoid(7);
  let url = await Url.findOne({ longUrl });

  if (url) {
    res.send(`Short URL: ${req.headers.host}/${url.urlCode}`);
  } else {
    const shortUrl = `${req.headers.host}/${urlCode}`;
    url = new Url({ longUrl, shortUrl, urlCode });
    await url.save();
    res.send(`Short URL: ${shortUrl}`);
  }
});

// Redirect to the original URL
app.get('/:code', async (req, res) => {
  const url = await Url.findOne({ urlCode: req.params.code });

  if (url) {
    res.redirect(url.longUrl);
  } else {
    res.status(404).send('URL not found');
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
