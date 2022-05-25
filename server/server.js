const express = require('express')
const cors = require('cors');
const app = express();
const port = process.env.port || 8080;
const { exec } = require('child_process');
const cron = require('node-cron');
const path = require('path');

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, "../build")));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../build', 'index.html'));
  });
}

app.use(cors());
app.use(express.json());

const workspaceRouter = require('./routes/workspace');
const compareRouter = require('./routes/compare');
const codeRouter = require('./routes/code');
const copilotRouter = require('./routes/copilot');
const mossRouter = require('./routes/moss');
const androidRouter = require('./routes/android');
const compareMultipleRouter = require('./routes/compare-multiple');

app.use('/workspace', workspaceRouter);
app.use('/compare', compareRouter);
app.use('/code', codeRouter);
app.use('/copilot', copilotRouter);
app.use('/moss', mossRouter);
app.use('/android', androidRouter);
app.use('/compare-multiple', compareMultipleRouter);

const yourscript = exec('sh ./server/init.sh',
  (error, stdout, stderr) => {
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
  });

cron.schedule('59 23 * * *', function () {
  const yourscript = exec('sh ./server/delete.sh',
    (error, stdout, stderr) => {
      console.log(stdout);
      console.log(stderr);
      if (error !== null) {
        console.log(`exec error: ${error}`);
      }
    });
});

app.listen(port, (err) => {
  if (err) return console.log(err);
  console.log(`Server running on port:${port}`)
})