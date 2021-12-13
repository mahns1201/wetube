import User from "../models/User";
import bcrypt from "bcrypt";

const user = (req, res) => { return res.send("<h1>user</h1>") }

const joinGet = (req, res) => res.render("join", { pageTitle: "Join" });

const joinPost = async (req, res) => {
    const pageTitle = "Join"
    const { name, username, email, password, password2, location } = req.body;

    if (password !== password2) {
        return res.status(400).render("join", { pageTitle, errorMessage: "Password confirmation dose not match." });
    }

    const exists = await User.exists({ $or: [{ username }, { email }] });

    if (exists) {
        return res.status(400).render("join", { pageTitle, errorMessage: "This username/email is already taken." });
    }

    try {
        await User.create({
            name,
            username,
            email,
            password,
            location,
        });
        return res.redirect("/login");
    } catch (error) {
        return res.status(400).render("join", {
            pageTitle: "Upload Video",
            errorMessage: error._message,
        });
    }
};

const loginGet = (req, res) => res.render("login", { pageTitle: "Login" });

const loginPost = async (req, res) => {
    const pageTitle = "Login";
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
        return res.status(400).render("login", {
            pageTitle,
            errorMessage: "An account with this username does not exists.",
        });
    }

    const ok = await bcrypt.compare(password, user.password);

    if (!ok) {
        return res.status(400).render("login", { pageTitle, errorMessage: "Wrong password" });
    }

    req.session.loggedIn = true;
    req.session.user = user;

    return res.redirect("/");
};

export { user, joinGet, joinPost, loginGet, loginPost }