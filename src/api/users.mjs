import express from 'express';
import * as passport from '../helpers/passport';
import * as routeHelpers from '../helpers/routeHelpers';
import user from '../models/user';

const router = express.Router();

router.post(
  '/signup',
  routeHelpers.validateBody(routeHelpers.schemas.authSchema),
  async function(req, res, next) {
    const { username, password } = req.body;

    // Check if there is a user with the same email
    const foundUser = await user.findOne({ username: username });
    if (foundUser) {
      return res
        .status(400)
        .json({ success: false, error: 'username is already in use' });
    }

    // Create a new user
    const newUser = new user({ username: username, password: password });
    await newUser.save();
    // Generate the token
    const auth_token = passport.signToken(newUser);

    // Respond with token
    res.status(200).json({ success: true, auth_token: auth_token });
  }
);

router.post(
  '/signin',
  routeHelpers.validateBody(routeHelpers.schemas.authSchema),
  passport.passportSignIn
);

router.get('/secret', passport.passportJWT, async function(req, res, next) {
  res.json({ success: true, secret: 'resource' });
});

export default router;
