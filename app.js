let bodyParser = require("body-parser");
let mongoose = require("mongoose");
let express = require("express");
let methodeOverride = require("method-override");
let expressSanitizer = require("express-sanitizer");
let app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(expressSanitizer());
app.use(methodeOverride("_method"));

//mongoose config
mongoose.connect("mongodb://localhost/blogapp");
let blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type: Date,default: Date.now }
});
let Blog = mongoose.model("Blog", blogSchema);

// Blog.create({
//     title: "test dog",
//     image: "https://www.sciencemag.org/sites/default/files/styles/article_main_large/public/dogs_1280p_0.jpg?itok=cnRk0HYq",
//     body: "this is a test"

// })


//restful routes

app.get("/", (req, res) => {
    res.redirect("/blogs")
});

app.get("/blogs", (req,res) =>{
    Blog.find({}, (err, blogs)=>{
        if(err){
            console.log(err);
        }else {
            res.render("index", {blogs:blogs})
        }
    });
});

app.get("/blogs/new", (req, res) => {
    res.render("new");
})

// create route
app.post("/blogs", (req, res)=> {
    console.log(req.body);
    req.body.blog.body = req.sanitize(req.body.blog.body);
    console.log("====================================");
    console.log(req.body);

    Blog.create(req.body.blog, (err, newBlog)=> {
        if(err) {
            console.log(err);
            res.render("new");
        }else {
            res.redirect("/blogs");
        }
    })
});

app.get("/blogs/:id", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog)=> {
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        }else {
            res.render("show", {blog: foundBlog});
        }
    });
});

//edit route
app.get("/blogs/:id/edit", (req, res) => {
    Blog.findById(req.params.id, (err, foundBlog)=>{
        if(err){
            console.log(err);
            res.redirect("/blogs");
        }else{
            res.render("edit", {blog: foundBlog});
        }
    });
});

//update route
app.put("/blogs/:id", (req, res) => {

    req.body.blog.body = req.sanitize(req.body.blog.body);

    Blog.findByIdAndUpdate(req.params.id, req.body.blog, (err, updateBlog) =>{
        if(err) {
            console.log(err);
            res.redirect("/blogs");
        }else {
            res.redirect("/blogs/"+req.params.id);
        }
    });
})

//delete route
app.delete("/blogs/:id", (req, res) => {
    Blog.findByIdAndRemove(req.params.id, err => {
        if(err){
            console.log("error!!!!!")
            console.log(err)
            res.redirect("/blogs");
        }else{
            res.redirect("/blogs");
        }
    })
});

app.listen(3000, () => console.log("server 3000 runing"))

