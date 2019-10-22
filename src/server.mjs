import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import api from './api';

dotenv.config();

const app = express();

if (process.env.MONGO_DB_URI) {
  mongoose.connect(process.env.MONGO_DB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
  });
}

app.set('port', process.env.PORT || 3000);

app.use(function(req, res, next) {
  console.log(`request: ${req.method}: ${req.url}`);
  next();
  console.log(`response: ${req.method}: ${req.url}`);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use('/api/', api);

//starting app
app.listen(app.get('port'), () => {
  console.log('Server started on port ' + app.get('port'));
});
