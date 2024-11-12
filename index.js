import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "library",
  password: "MyDb*2000",
  port: "5432",
});
db.connect();

// the current book id updates each time the user clicks a book to add notes into
let currentBookID;

app.get("/", async (req, res) => {
  let books = (await db.query("SELECT * FROM books")).rows;
  let notes = (await db.query("SELECT * FROM notes")).rows;
  res.render("home.ejs", {books:books,notes:notes});
});

app.post("/add",async (req,res)=>{
  let title = req.body.title;
  let description = req.body.description;
  let rating = req.body.rating;
  let author = req.body.author;
  await db.query("INSERT INTO books (title,description,rating,author) VALUES ($1,$2,$3,$4)",[title,description,rating,author]);
  res.redirect("/");
});

app.post("/delete", async(req, res) => {
  const id = req.body.deleteBookId;
  console.log(id);
  await db.query("DELETE FROM notes WHERE book_id = $1",[id]);
  await db.query("DELETE FROM books WHERE id = $1",[id]);
  res.redirect("/");
});

app.post("/addNote", async(req,res)=>{
const id = req.body.addNoteButton;
const note = req.body.newNote;
await db.query("INSERT INTO notes (note, book_id) VALUES ($1, $2)", [note, id]);
res.redirect("/");
});

app.post("/edit", async(req,res)=>{
  const id = req.body.editButton;
  console.log(id);
  const author = req.body.updatedAuthor;
  const rating = req.body.updatedRating;
  const description = req.body.updatedDescription;
  const title = req.body.updatedTitle;
  await db.query("UPDATE books SET title = $1,description = $2, rating = $3, author = $4 WHERE id = $5",[title,description,rating,author,id]);
  res.redirect("/")
});

app.post("/deleteNote", async(req,res)=>{
  const id = req.body.deleteNoteButton;
  console.log(id);
  await db.query("DELETE FROM notes WHERE id = $1",[id]);
  res.redirect("/");
});


app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
