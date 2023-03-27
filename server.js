import express from 'express';
import { engine } from 'express-handlebars';
import livereload from 'livereload';
import connectLiveReload from 'connect-livereload';

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const liveReloadServer = livereload.createServer();
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.static(__dirname + '/public'));
app.use(connectLiveReload());

app.engine(
  'handlebars',
  engine({
    extname: 'handlebars',
    defaultLayout: 'not-loggedin',
    layoutsDir: path.join(__dirname, 'views/layouts'),
    partialsDir: [
      //  path to your partials
      path.join(__dirname, 'views/partials'),
    ],
  })
);
app.set('view engine', 'handlebars');
app.set('views', path.resolve(__dirname, './views'));

app.get('/', (req, res) => {
  res.render('home', { stuff: 'this is stuff..' }, (err, html) => {
    if (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send(html);
    }
  });
});

// Getting the pages from views folder here.
const getPage = (fileName) => {
  const pageName = fileName.replace('.handlebars', '');

  const route = '/' + pageName;
  app.get(route, (req, res) => {
    // Todo: Filter loggedin vs notloggedin layouts here
    res.render(pageName, { layout: 'loggedin', test: 'test' });
  });
};

const viewsFolder = './views/';

fs.readdirSync(viewsFolder).forEach((fileName, index) => {
  // Files in the root folder are considered pages.
  let pageFound = fileName.includes('.handlebars');
  if (!pageFound) return;
  getPage(fileName);
});

app.listen(3000, () => {
  console.log('express-handlebars example server listening on: 3000');
});
