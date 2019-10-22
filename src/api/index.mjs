import fs from 'fs';
import path from 'path';

import express from 'express';
import bodyParser from 'body-parser';

import { promisify } from '../helpers/utils';

// regex to detect js file extention
const jsTest = /.mjs$/;
const filePath = new URL(import.meta.url).pathname;
const currentDir = path.dirname(filePath);

async function findRoutes(
  basePath,
  ignorePaths = [],
  router = express.Router()
) {
  const files = await promisify(fs.readdir, basePath, { withFileTypes: true });
  const routes = {};

  for (const file of files) {
    let fileName = file.name.replace(jsTest, '');
    const absoluteFilePath = path.join(basePath, fileName);
    let route = null;
    if (file.isDirectory()) {
      route = await findRoutes(absoluteFilePath, ignorePaths);
    } else if (
      !routes[fileName] &&
      !ignorePaths.includes(absoluteFilePath) &&
      jsTest.test(file.name)
    ) {
      if (fileName === 'index') {
        fileName = '';
      }
      route = (await import(absoluteFilePath)).default;
    }

    if (route) {
      // eslint-disable-next-line require-atomic-updates
      routes[`/${fileName}`] = route;
    }
  }

  if (Object.entries(routes).length === 0) return;

  Object.keys(routes)
    .sort((a, b) => b.length - a.length)
    .forEach(key => {
      router.use(key, routes[key]);
    });

  return router;
}

async function createRoutes() {
  const router = express.Router();

  router.use(bodyParser.json());

  // default route to test APIs
  router.get('/', function(req, res, next) {
    res.json({ success: true, message: 'Welcome to APIs' });
  });

  // Find all files in current directory and add them as route
  await findRoutes(currentDir, [filePath.replace(jsTest, '')], router);

  // returning error message for all endpoints which don't exist
  router.use(function(req, res, next) {
    res.status(404).json({ success: false, error: 'incorrect endpoint' });
  });

  // handling all errors and returning json responce
  router.use(function(err, req, res, next) {
    console.log(err);
    res
      .status(err.status || 500)
      .json({ success: false, error: err.message || 'Internal server error' });
  });

  return router;
}

export default (() => {
  let routes = (req, res, next) => {
    res.json({ success: false, error: 'loading routes please wait...' });
  };

  (async () => (routes = await createRoutes()))();

  return function() {
    routes.apply(null, arguments);
  };
})();
