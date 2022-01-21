const express= require("express");
const bp= require("body-parser");
const mongoose=require("mongoose");
const lod=require("lodash");

const app = express();
app.use(bp.urlencoded({extended:true})); //carry the input from the user and pass it to the client via post server
app.set('view engine', 'ejs');           //to collage the template i.e index.ejs
app.use(express.static("public"));
mongoose.connect("mongodb+srv://Arthi:Stuart1999@cluster0.4dcrq.mongodb.net/todolistDB");

const itemSchema=new mongoose.Schema({item: String});
const itemModel=mongoose.model("itemModel", itemSchema);

    const doc1=new itemModel({
        item: "Hit + button to add item"
    });
    const doc2=new itemModel({
        item: "<-- Hit to remove the item"
    });

    const docs=[doc1,doc2];
    var today=new Date();
    var dates={year: "numeric", day: "numeric", month: "long", weekday: "long"};
    var currentday= today.toLocaleDateString("en-IN", dates);

const listSchema= {list: String, relation: [itemSchema] };
const listModel= mongoose.model("listModel", listSchema);

app.get("/", function(req, res)
{
    itemModel.find({}, function(err, result)
    {  
        if(result.length==0)
        {
            itemModel.insertMany(docs, function(e)
            {
                if(!e) 
                {console.log("inserted");}
                //else console.log("success");
            });
            res.redirect("/");
            console.log("0");
        }
        
        else
        {
            res.render("index", {key: result, fulldate: currentday});
        }
    });
});

app.get("/:custom", function(req, res)
{
    const cust = lod.capitalize(req.params.custom);                //if exist
    listModel.findOne( {list: cust}, function(err, result)
    {
        if(!err)
        {
            if(!result) //if not exists, then insert
            {
                const addedList= new listModel({
                    list: cust,
                    relation: docs
                });
                addedList.save();
                res.redirect("/" + cust);
            }
            else {
                   res.render("index", {fulldate: result.list, key: result.relation});
                 }
        }
    });
});

app.post("/", function(req, res)
{
    const li= req.body.button;

    const docsAddedItem=new itemModel({
        item: req.body.notes 
    });
    
    if(li===currentday)
    {
        docsAddedItem.save();
        res.redirect("/");
    }
    else
    {
        listModel.findOne({list: li}, function(err, result)
        {
            result.relation.push(docsAddedItem);
            result.save();
            res.redirect("/"+li);
        });
    }
    
});

app.post("/delete", function(req,res)
{
    const checked=req.body.clicked;
    const li=req.body.heading;

    if(li===currentday)
    {
        itemModel.findByIdAndRemove(checked,function(e)
        {
            if(!e) console.log("successfully deleted");
        });
        res.redirect("/");
    }
    
    else 
    {
        listModel.findOneAndUpdate({ list: li}, { $pull : {relation: {_id: checked}} }, function(err, result) 
        {
            if(!err)
                res.redirect("/"+li);
        });
    }
});

app.listen(process.env.PORT || 3000,function()
{
    console.log("Heroku sever started...");
});

