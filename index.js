console.log("hello")

const { render } = require("ejs")
const path = require("path")
const express = require("express")
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
require('dotenv').config()

//models
const User = require("./models/userSchema")
const ChatOrders = require("./models/chatOrderSchema");

const user = new User
const dburi = process.env.SOURCE
mongoose.connect(dburi)
    .then(() => {
        console.log("db connected")
        app.listen(4000, () => {
            console.log("Backend")
        })
    })
    .catch((err) => {
        console.log(err)
    })

const app = express()
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.set("view engine", "ejs")
app.set('views', path.join(__dirname, "./views"))

//homepage
app.get("/", (req, res) => {
    console.log("Success")
    res.sendFile("./views/homepage.html", { root: __dirname })
})

//signup page
app.get("/signup", (req, res) => {
    console.log("Success")
    res.sendFile("./views/signup.html", { root: __dirname })
})

//signup submit
app.post("/signup", async(req, res) => {

    try {
        console.log(req.body.username);
        console.log(req.body.usertype);
        const newUser = new User({
            usertype: req.body.usertype,
            username: req.body.username,
            email: req.body.email,
            password: req.body.password
        })
        await newUser.save()
            .then((result) => {
                res.redirect("/")
            }).catch((err) => {
                res.sendFile("./views/not_found.html", { root: __dirname })
            })
            //res.status(201).render("manufacturer", newUser)

    } catch (error) {
        res.sendFile("./views/not_found.html", { root: __dirname })
    }
})

//login submit
app.post("/", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const usertype = req.body.usertype;

        console.log(`${email} and ${password}`)

        const checkUser = await User.findOne({ email: email });
        const username = checkUser.username;
        if (checkUser.password === password) {
            if (usertype == checkUser.usertype) {
                console.log("Login Successfull")

                if (usertype == "Manufacturer") {
                    console.log("Manufacturer");
                    const checkmssg = await ChatOrders.find({ from: username })
                    console.log("Manufacturer Mssg");
                    res.status(201).render("manufacturer", { checkUser, checkmssg })
                } else {
                    const checkmssg = await ChatOrders.find({ to: username })
                    console.log("Transporter Mssg");
                    res.status(201).render("transporter", { checkUser, checkmssg })
                }

            } else {
                res.send("Incorrect credentials 1")
            }

        } else {
            res.send("Incorrect credentials 2")
        }
    } catch (error) {
        res.status(400).send("Email not registered")
    }

})

//logout
app.get("/logout", function(req, res) {
    res.clearCookie('nToken');
    console.log("logged out")
    res.redirect("/");
});

//manufacturer dashboard
app.get("/manufacturer", (req, res) => {
    console.log(user)
    res.render("manufacturer", { user })
})

app.get("/login", (req, res) => {
    res.send("get")
})

//order placed by manufacturer
app.post("/order", async(req, res) => {
    try {
        console.log("Enter")
        const From = req.body.from;

        console.log(`${From}`)

        const checkUser = await User.findOne({ username: From })
        if (checkUser) {
            console.log("Found");
        } else {
            res.sendFile("./views/not_found.html", { root: __dirname })
        }

        const newchat = new ChatOrders({
            date: req.body.date,
            to: req.body.to,
            from: req.body.from,
            order_id: req.body.order_id,
            quantity: req.body.quantity,
            address: req.body.address
        })
        await newchat.save()
            .then((result) => {
                res.send(result)
            }).catch((err) => {
                console.log(err)
            })

    } catch (err) {
        res.status(400).send(err)
    }
})

//price updated by transporter in form of message
app.post("/price", async(req, res) => {
    try {
        console.log("Price")
        const price = req.body.price;
        const id = req.body.o_id;
        console.log(`${id}`)
        console.log(`${price}`)

        const checkmssg = await ChatOrders.findOne({
            "order_id": id
        })

        console.log("New")
        await ChatOrders.findOneAndUpdate({
            order_id: id
        }, { price: price })

        console.log("Updated")

    } catch (err) {
        res.sendFile("./views/not_found.html", { root: __dirname })
    }
})

//search operations

//search by order id
app.post("/search_by_order_id", async(req, res) => {
    try {
        console.log("Enter")
        const order_id = req.body.search;
        console.log(`${req.body.search}`);
        const checkmssg = await ChatOrders.find({ order_id: order_id });
        if (checkmssg)
            res.render("search", { checkmssg });
        else
            res.sendFile("./views/not_found.html", { root: __dirname })

    } catch (err) {
        res.sendFile("./views/not_found.html", { root: __dirname })
    }

});

//search by from
app.post("/search_by_from", async(req, res) => {
    try {
        console.log("Enter")
        const from = req.body.search_from;
        console.log(`${req.body.search_from}`);
        const checkmssg = await ChatOrders.find({ from: from });
        res.render("search", { checkmssg });

    } catch (err) {
        res.sendFile("./views/not_found.html", { root: __dirname })
    }

});

//search by from
app.post("/search_by_to", async(req, res) => {
    try {
        console.log("Enter")
        const to = req.body.search_to;
        console.log(`${req.body.search_to}`);
        const checkmssg = await ChatOrders.find({ to: to });
        res.render("search", { checkmssg });

    } catch (err) {
        res.sendFile("./views/not_found.html", { root: __dirname })
    }

});