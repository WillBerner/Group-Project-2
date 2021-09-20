// Boilerplate router creation
const router = require('express').Router();

// Import user model
const { User } = require('../../models');

// Attempt to create a new user from request body
router.post('/', async (req, res) => {
  try {

    const userData = await User.create(req.body);

    // If successful, create user session
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.status(200).json(userData);
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

// Attempt to login user based on given email/password combo
router.post('/login', async (req, res) => {
  try {

    const userData = await User.findOne({ where: { email: req.body.email } });

    // If no email found, respond with error message
    if (!userData) {
      res.status(400).json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    const validPassword = await userData.checkPassword(req.body.password);

    // If email exists but password is invalid, respond with error message
    if (!validPassword) {
      res.status(400).json({ message: 'Incorrect email or password, please try again' });
      return;
    }

    // If email/password are correct, create user session
    req.session.save(() => {
      req.session.user_id = userData.id;
      req.session.logged_in = true;

      res.json({ user: userData, message: 'You are now logged in!' });
    });

  } catch (err) {
    res.status(400).json(err);
  }
});

// Log user out by destroying their session (if they are actually logged in)
router.get('/logout', (req, res) => {
  try {
    req.session.destroy(() => {
      res.status(204).end();
    });
  } catch (error) {
    res.status(500).end();
  };
  
});

// Attempt to update a user's email address
router.put('/updateEmail', async (req, res) => {

  // Get the new email address to set
  let newEmail = { email: req.body.newEmail };
  // Get the user's current email address to know which user to update
  let oldEmail = req.body.oldEmail;

  // Try to update the database with the new email
  try {

    const updatedEmail = await User.update(newEmail, {
      where: {
        email: oldEmail
      }
    });

    // If all is successful, update the client
    res.status(200).json(updatedEmail);
  } catch (error) {
    res.status(500).json(error);
  }

});

// Attempt to update a user's name
router.put('/updateName', async (req, res) => {

  // Get the new name to set
  let newName = { name: req.body.newName };
  // Get the current user's email address to know which user to update
  let userEmail = req.body.email;

  // Try to update the database with the new name
  try {

    const updatedName = await User.update(newName, {
      where: {
        email: userEmail
      }
    });

    // If all is successful, update the client
    res.status(200).json(updatedName);
  } catch (error) {
    res.status(500).json(error);
  }

});

// Attempt to update a user's password
router.put('/updatePassword', async (req, res) => {

  // Get the new plaintext password to set
  let newPassword = { password: req.body.newPassword };
  
  // Get the current user's email address to know which user to update
  let userEmail = req.body.email;

  // Try to update the database with the new password, and hash it beforehand with Hook
  try {

    const updatedName = await User.update(newPassword, {
      where: {
        email: userEmail
      },
      individualHooks: true,
    });

    // If all is successful, update the client
    res.status(200).json(updatedName);
  } catch (error) {
    res.status(500).json(error);
  }

});

// Export router for use in /controllers/api/index.js
module.exports = router;
