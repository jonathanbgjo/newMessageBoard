const express = require("express")
const app = express()
const PATH = require("path")
const PORT = 8000
const bodyParser = require('body-parser')
var mongoose = require('mongoose');
app.use(bodyParser.urlencoded({extended:true}))
app.set("views",PATH.join(__dirname,"./views"))
app.set("view engine", "ejs")
var Schema = mongoose.Schema;

mongoose.connect('mongodb://localhost/message_board', {useMongoClient:true});
var PostSchema = new mongoose.Schema({
 name:String,
 text: {type: String, required: true }, 
 comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });

// define Comment Schema
var CommentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 text: {type: String, required: true },
 name:String
}, {timestamps: true });

mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');


mongoose.Promise = global.Promise;



app.get("/", (req,res)=>{
  	Post.find({}).populate('comments').exec(function(err, posts) {
        if (err) {return console.log(err)}

        context = {
    		"posts": posts
    	}
    	console.log(context)
  	res.render('index', context)
    })
})


app.post("/post", (req,res)=>{
var post= new Post({name: req.body.name, text: req.body.text, comments: req.body.comments});
post.save(function(err) {
	    if(err) {
	      console.log('something went wrong');
	    } else {
	      console.log('successfully added a post!');
		res.redirect("/")
		}
	})
})


  // // route for getting a particular post and comments
  // app.get('/posts/:id', function (req, res){
  //  Post.findOne({_id: req.params.id})
  //  .populate('comments')
  //  .exec(function(err, post) {
  //       res.render('post', {post: post});
  //         });
  // });

  // route for creating one comment with the parent post id
app.post("/comment/:id", (req,res)=>{
	Post.findOne({_id: req.params.id}, function(err, post){
       var comment = new Comment(req.body);
       comment._post = post._id;
       post.comments.push(comment);
       comment.save(function(err){
               post.save(function(err){
                     if(err) { 
                     	console.log('Error'); 
                     } 
                     else { 
                     	res.redirect('/'); }
               });
       });
 	});
})

















app.listen(PORT,()=>{
	console.log(`listening on port ${PORT})`)
})