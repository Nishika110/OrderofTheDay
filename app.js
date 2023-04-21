//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

main().catch(err => console.log(err));
 
async function main() {
  await mongoose.connect('mongodb+srv://nishikaabhangi:NPJR%402010@cluster0.yywe4sz.mongodb.net/OrderoftheDayDB');
}


const itemSchema={
  name:String
};

const Item =mongoose.model(
    "Item",itemSchema
);


const item1=new Item({
  name:"Enter your expected order of the day."
});
const item2=new Item({
  name:"Hit the + button to add a new task."
});
const item3=new Item({
  name:"<-- Hit this to delete an item."
});

const defaultItems=[item1,item2,item3];

const listSchema={
  name:String,
  items:[itemSchema]
};

const List=mongoose.model("List",listSchema);
app.get("/", function(req, res) {


  Item.find()
    .then(function (foundItems) {
      if(foundItems.length===0){
       Item.insertMany(defaultItems).then (function () {
       console.log("Successfully saved all the items.");
       }) .catch(function (err) {
       console.log(err);
       });
       res.redirect("/");
      }
      else{
      
      res.render("list", {listTitle: "Today", newListItems: foundItems});}
        
    })
    .catch(function (err) {
        console.log(err);
    });


 

});

app.get("/:customListName",function(req,res){
const customListName=_.capitalize(req.params.customListName);



List.findOne({name: customListName})

  .then(function(result){
    if (result === null){
      const list = new List({
        name: customListName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customListName)
    } else{
      res.render ("list", {listTitle: result.name, newListItems: result.items});
    }
  })
  .catch(function (e){
    console.log(e);
  })
});

app.post("/", function(req, res){

  const itemname = req.body.newItem;
  const listName=req.body.list;
  const item=new Item({
    name:itemname
  });
  if(listName=== "Today"){
    item.save();
    res.redirect("/");}
    else{

      List.findOne({name: listName})
  .then(function(foundList){
    foundList.items.push(item);
        foundList.save();
        res.redirect("/"+listName);
    
  })
  .catch(function (e){
    console.log(e);
  })
      
      }
    
});

app.post("/delete",function(req,res){
  const listName=req.body.listName;
  const checkedItemId=req.body.checkbox;
  if(listName==="Today"){
  Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
  res.redirect("/");}
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkedItemId}}}).then(function (foundList)
    {
      res.redirect("/" + listName);
    });
  }
});



app.listen(3000, function() {
  console.log("Server started on port 3000");
});
