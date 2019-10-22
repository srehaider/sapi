import passport from 'passport';
import passportJwt from 'passport-jwt';
import passportLocal from 'passport-local';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/user';

const JWT_SECRET =
  process.env.JWT_SECRET ||
  'skjdfh97^T34R&*&t^t^%YUk*&$^%%tdghergysdcblks787ed(*#^8&';

// JSON WEB TOKENS STRATEGY
passport.use(
  new passportJwt.Strategy(
    {
      jwtFromRequest: passportJwt.ExtractJwt.fromHeader('authorization'),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        // Find the user specified in token
        const user = await User.findById(payload.sub);

        // If user doesn't exists, handle it
        if (!user) {
          return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// LOCAL STRATEGY
passport.use(
  new passportLocal.Strategy(
    {
      usernameField: 'username',
    },
    async (username, password, done) => {
      try {
        // Find the user given the email
        const user = await User.findOne({ username });

        // If not, handle it
        if (!user) {
          return done(null, false);
        }

        // Check if the password is correct
        const isCorrect = await user.isValidPassword(password);

        // If not, handle it
        if (!isCorrect) {
          return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

function signToken(user) {
  return jsonwebtoken.sign(
    {
      iss: 'Shan corp.',
      sub: user.id,
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 10), // current time + 90 day ahead
    },
    JWT_SECRET
  );
}

const config = { session: false };

function passportSignIn(req, res, next) {
  passport.authenticate('local', config, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(400)
        .json({ success: false, error: 'username or password is incorrect' });
    }

    const auth_token = signToken(user);
    res.json({ success: true, auth_token: auth_token });
  })(req, res, next);
}

function passportJWT(req, res, next) {
  passport.authenticate('jwt', config, function(err, user, info) {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res
        .status(401)
        .json({ success: false, error: 'authentication failed' });
    }

    next();
  })(req, res, next);
}

export { passportSignIn, passportJWT, signToken };
