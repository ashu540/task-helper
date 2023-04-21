//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://ashurawat2001:ashurawat2001@cluster0.apbmplf.mongodb.net/helperDB",
  {
    useNewUrlParser: true,
  }
);

const itemSchema = new mongoose.Schema({
  name: String,
});

const Item = mongoose.model("Item", itemSchema);

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemSchema],
});

const List = mongoose.model("List", listSchema);

const item1 = new Item({
  name: "item1",
});

const item2 = new Item({
  name: "item2",
});

const item3 = new Item({
  name: "item3",
});

const item4 = new Item({
  name: "item4",
});

let defaultItems = [item1, item2, item3, item4];

app.get("/", function (req, res) {
  Item.find({}, function (err, foundItems) {
    if (err) {
      console.log(err);
    } else {
      if (foundItems.length === 0) {
        Item.insertMany(defaultItems, function (err) {
          if (err) {
            console.log(err);
          } else {
            res.redirect("/");
          }
        });
      } else {
        res.render("list", { listTitle: "Nick", newListItems: foundItems });
      }
    }
  });
});

app.get("/:listName", function (req, res) {
  let dummyListName = _.lowerCase(req.params.listName);

  const listName = _.capitalize(dummyListName);

  List.findOne({ name: listName }, function (err, foundList) {
    if (err) {
      console.log(err);
    } else {
      if (!foundList) {
        const newList = new List({
          name: listName,
          items: defaultItems,
        });

        newList.save();
        res.redirect("/" + listName);
      } else {
        res.render("list", {
          listTitle: foundList.name,
          newListItems: foundList.items,
        });
      }
    }
  });
});

app.post("/", function (req, res) {
  const itemName = req.body.newItem;
  const listName = _.capitalize(req.body.listName);

  const item = new Item({
    name: itemName,
  });

  if (listName === "Nick") {
    Item.findOne({ name: itemName }, function (err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        if (!foundItem) {
          item.save();
        }

        res.redirect("/");
      }
    });
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      if (err) {
        console.log(err);
      } else {
        foundList.items.push(item);

        foundList.save();

        res.redirect("/" + listName);
      }
    });
  }
});

app.post("/delete", function (req, res) {
  const itemId = req.body.checkbox;
  const listName = _.capitalize(req.body.listName);

  if (listName === "Nick") {
    Item.findOneAndDelete({ _id: itemId }, function (err, foundItem) {
      if (err) {
        console.log(err);
      } else {
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: itemId } } },
      function (err, foundList) {
        if (err) {
          console.log(err);
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});




let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log("Server started on port 3000");
});