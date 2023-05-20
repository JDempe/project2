const router = require("express").Router();
const bcrypt = require("bcrypt");
const { User } = require("../../models");

// set up a route for users to sign up.
router.post("/signup", async (req, res) => {
  try {
    // verify that there is no user in the database with the provided email
    const userExists = await User.findOne({
      where: {
        email: req.body.email.toLowerCase().trim(),
      },
    });

    if (userExists) {
      return res.json({
        message: `The user with the provided email "${userExists.email}" already exists. Please try to log in.`,
      });
    }

    // verify that the provided username does not exist in the database.
    const usernameExists = await User.findOne({
      where: {
        username: req.body.username.trim(),
      },
    });

    if (usernameExists) {
      return res.json({
        message: `The username "${usernameExists.username}" is already taken. Please choose a different username.`,
      });
    }

    // once all verification steps have been successfully completed, proceed to create the user in the database.
    const result = await User.create({
      username: req.body.username.trim(),
      email: req.body.email.toLowerCase().trim(),
      password: req.body.password.trim(),
    });

    req.session.user_id = result.id;
    req.session.logged_in = 1;

    req.session.save();

    res.status(200).json({
      message: `Welcome aboard, ${result.username}! Enjoy your journey with us!`,
    });
  } catch (error) {
    res.status(500).json(error);
  }
});

// set up a route for users to log in.
router.post("/login", async (req, res) => {
  try {
    // verify the existence of the user with the provided email in the database.
    const userData = await User.findOne({
      where: {
        email: req.body.email.toLowerCase().trim(),
      },
    });

    if (!userData) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
    }

    // verify that the hashed password stored in the database matches the password provided by the user.
    const validatePassword = bcrypt.compareSync(
      req.body.password,
      userData.password
    );

    if (!validatePassword) {
      return res
        .status(400)
        .json({ message: "Incorrect email or password, please try again" });
    }
    const userId = userData.id;
    console.log("!!!!!userData.id!!", userData.id);
    req.session.user_id = userId;
    req.session.logged_in = 1;

    req.session.save();

    return res
      .status(200)
      .json({ userId, message: "You have been successfully logged in!" });
  } catch (error) {
    res.status(500).json(error);
  }
});

// route for user to logout
router.post("/logout", async (req, res) => {
  try {
    if (req.session.logged_in) {
      req.session.destroy(() => {
        return res.status(200).end();
      });
    } else {
      return res.status(404).end();
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// set up a route for users to update information
router.put("/editprofile/:id", async (req, res) => {
  try {
    // TODO verify that the user exists in the database.
    const userExists = await User.findByPk(req.params.id);

    if (!userExists) {
      return res.status(400).json({
        message: `The user with the provided id "${req.params.id}" does not exist. Please try again.`,
      });
    }

    // proceed to update the user in the database.
    const result = await User.update(
      {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        username: req.body.username,
        about_me: req.body.about_me,
        avatar_id: req.body.avatar_id,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res
      .status(200)
      .json({ message: `Your profile has been successfully updated!` });
  } catch (error) {
    res.status(500).json(error);
  }
});

// Try to find a user with the provided username in the database.
router.get("/checkusername/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });

    if (user) {
      res.status(200).json(user);
    } else {
      res.status(200).json(false);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// Retrieve user id by username
router.get("/getuserid/:username", async (req, res) => {
  try {
    const user = await User.findOne({
      where: { username: req.params.username },
    });

    if (user) {
      res.status(200).json({ userId: user.id });
    } else {
      res.status(200).json(false);
    }
  } catch (error) {
    res.status(500).json(error);
  }
});

// set up a route for users to delete their account.
router.delete("/delete/:id", async (req, res) => {
  try {
    // TODO verify that the user exists in the database.
    const userExists = await User.findByPk(req.params.id);

    if (!userExists) {
      return res.status(400).json({
        message: `The user with the provided id "${req.params.id}" does not exist. Please try again.`,
      });
    }

    // proceed to delete the user from the database.
    const result = await User.destroy({
      where: {
        id: req.params.id,
      },
    });
    res
      .status(200)
      .json({ message: `Your account has been successfully deleted!` });
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
