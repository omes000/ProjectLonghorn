const express     = require("express");
const passport    = require("passport");
const User        = require("../models/user");
const Message     = require("../models/message");
const middleware  = require("../middleware/index");


const     router = express.Router();

router.get("/login", (req, res)=>{
    res.render("login", { title: "Login" });
});

router.post("/login", passport.authenticate("local-login", { failureRedirect: "/users/register" }), (req, res)=>{
   User.findById(req.user._id).then((rUser)=>{
    rUser.online = true;
    rUser.save();
   });
   res.redirect("/users/@me");
});

router.get("/register", (req, res)=>{
    console.log(req.flash("error"));
    res.render("register", { title: "Register" });
});

router.post("/register", passport.authenticate("local-signup", {
    failureRedirect: "/users/register", // redirect back to the signup page if there is an error
    failureFlash: true,
}), (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = true;
        rUser.save();
       });
       res.redirect("/users/@me");
});

router.get("/logout", middleware.isLogedIn, (req, res)=>{
    User.findById(req.user._id).then((rUser)=>{
        rUser.online = false;
        rUser.save();
       });
    req.logout();
    res.redirect("/");
});


// Users Profile
router.get("/@me", middleware.isLogedIn, (req, res)=>{
    User.findById(req.user._id).populate("channels").then((rUser)=>{
        res.render("profile", { channels: rUser.channels, title: "username" });
    }).catch((e)=>{
        res.send(e);
    });
});

router.patch("/@me/update", middleware.isLogedIn, (req, res)=>{
    User.findByIdAndUpdate(req.user._id, req.body.user).then((rUser)=>{
        Message.find({ "author.id": rUser._id }).then((rMessage)=>{
            rMessage.forEach((message)=>{
                message.author.name = req.body.user.username;
                message.save();
            });
        });
        res.redirect("/users/@me");
    }).catch((e)=>{
        console.log(e);
        return res.redirect("/user/@me");
    });
});


module.exports = router;
