import "dotenv/config";
import express from "express";
import routes from "./Controllers/Controller.mjs";
import mongoose from "mongoose";
import session from "express-session";

const PORT = process.env.PORT;

const app = express();
app.use(express.json());
app.use(
  session({
    cookie: {
      maxAge: 60000 * 60,
    },
    resave: true,
    saveUninitialized: true,
    secret: "leem",
  })
);

try {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Successfully Connected to DB");
} catch (error) {
  console.log(error);
}

app.use(routes);

app.listen(PORT, () => {
  console.log(`started server on localhost://${PORT}`);
});
