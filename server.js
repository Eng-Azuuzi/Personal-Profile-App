const express = require('express');
const app = express();
const connectDB = require('./config/db');
const PORT = process.env.PORT || 3500
const path = require('path');

const Events = ((req, res, next) => {
    console.log(`${req.method}  ${req.path}`);
    next();
});
app.use(Events);

//Connect Database
connectDB();

//Built-in Middleware 
app.use(express.json()); // for JSON payloads
app.use(express.urlencoded({ extended: false }));

// Use Routes
app.use('/users', require('./routes/apiRoutes/user'));
app.use('/auth', require('./routes/apiRoutes/auth'));
app.use('/profile', require('./routes/apiRoutes/profile'));
app.use('/post', require('./routes/apiRoutes/posts'));

//Serve static assets in production
if (process.env.NODE.ENV === 'production')
{
    // set static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'));
    });
}

app.get('/', (req, res) => res.send('API IS RUNNING'));
app.listen(PORT, () => (console.log(`Server started on PORT ${PORT}`)));