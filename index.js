//require express
var express = require('express');
//reqiure body parser
var bodyParser = require('body-parser');
//Require mongoose
var mongoose = require('mongoose');
//Require node fetch
var fetch = require('node-fetch');
//create express object, call express
var app = express();
//get port info
const port = process.env.PORT || 3000;
//tell app to use EJS for templates
app.set('view engine', 'ejs');
//Make styles public
app.use(express.static("public"));
//tell app to use Body parser
app.use(bodyParser.urlencoded({ extended: true }));

//MongoDB Connection Info
const Todo = require('./models/todo.model');
const mongoDB = 'mongodb+srv://xiiethan:fLvdhzo1K55gAUAv@cluster0.mumvp.mongodb.net/todolist?retryWrites=true&w=majority';
//TO DO: Change database to mine
mongoose.connect(mongoDB);
mongoose.Promise = global.Promise;
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error: '));

//Couple of items items
var tasks = [];
//completed items 
var completed = [];

//get home page
app.get('/', function (req, res) {
    //Query to mongoDB
    Todo.find(function(err, todo){
        if(err){
            console.log(err);
        }else{
            //Reset the lists to avoid duplicates upon refresh
            tasks = [];
            completed = [];
            for(i=0; i < todo.length; i++){
                if(todo[i].done){
                    completed.push(todo[i]);
                }else{
                    tasks.push(todo[i]);
                }
            }
        }
    });
    //return something to homepage
    res.render('index', { tasks: tasks, completed: completed });
});

//add post method /addtask
app.post('/addtask', function (req, res) {
    let newTodo = new Todo({
        item: req.body.newtask,
        done: false
    });
    newTodo.save(function(err, todo){
        if (err){
            console.log(err)
        } else {
            //return index
            res.redirect('/');
        }
    });
});
app.post('/removetask', function (req, res) {
    var id = req.body.check;
    if (typeof id === 'string') {
        Todo.updateOne({_id: id},{done: true}, function(err){
            if(err){
                console.log(err);
            }
        });
    } else if (typeof id === 'object') {
        for (var i = 0; i < id.length; i++){
            Todo.updateOne({_id: id[i]},{done: true}, function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    }
    res.redirect('/');
});

app.post('/deleteTodo', function(req, res){
    var id = req.body.delete;
    if (typeof id === 'string') {
        Todo.deleteOne({_id: id}, function(err){
            if(err){
                console.log(err);
            }
        });
    } else if (typeof id === 'object') {
        for (var i = 0; i < id.length; i++){
            Todo.deleteOne({_id: id[i]}, function(err){
                if(err){
                    console.log(err);
                }
            });
        }
    }
    res.redirect('/');
});

app.get('/nasa', function(req, res){
    let nasaData;
    fetch('https://api.nasa.gov/planetary/apod?api_key=lanB7165TxYteQCbOXNFauIGHijkqnffyLe4CUmD')
    .then(res => res.json())
    .then(data => {
        nasaData = data;
        res.json(nasaData);
    });
});

//server setup
app.listen(port, function () {
    console.log('Listening on port ' + port)
});

//node index.js will launch