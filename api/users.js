const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { ValidationError } = require('sequelize')

const { User, UserClientFields } = require('../models/user')
const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

const jwtKey = process.env.JWT_SECRET_KEY;


function requireAutorization(req, res, next){
  try{
    const auth_value = req.get('Authorization')

    if(!auth_value || !auth_value.startsWith("Bearer")) {
      return res.status(401).send("Incorrect Token")
    }

    const token = auth_value.split(" ")[1]

    const payload = jwt.verify(token, jwtKey)

    console.log("Payload " + payload)

    req.user = payload.sub
    next()
  } catch (err) {
    res.send("Incorrect Token")
    next(err)
  }
}

function isAuthorizedUser(req, res, next) {
  const userId = req.params.userId
  const authenticatedId = req.user?.sub
  const isAdmin = req.user?.admin

  if(parseInt(userId) === authenticatedId || isAdmin) {
    next()
  } else {
    res.status(403).json({ error: 'Authorization required' })
  }
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', requireAutorization, isAuthorizedUser, async function (req, res) {
  const userId = req.params.userId

  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', requireAutorization, isAuthorizedUser, async function (req, res) {
  const userId = req.params.userId

  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', requireAutorization, isAuthorizedUser, async function (req, res) {
  const userId = req.params.userId

  const userPhotos = await Photo.findAll({ where: { userId: userId }})
  res.status(200).json({
    photos: userPhotos
  })
})

/*
 * Create a User
 */
router.post('/users', async (req, res) => {
  const name = req.body.name
  const email = req.body.email
  const password = req.body.password
  const admin = req.body.admin

  if (!name || !email || !password || admin === undefined){
    return res.status(400).json({ error: "Missing information"})
  }

  const password_hash = await bcrypt.hash(password, 8)

  try{
    const user = await User.create({ name, email, password: password_hash, admin }, { fields: UserClientFields })
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }

})

// Swap to look for email so it is a unique key
router.post('/users/login', async (req, res) => {
  const email = req.body.email
  const password = req.body.password

  if (!email || !password) {
    return res.status(400).send({error: "Email and password required"})
  }

  // Do I need to pass in an ID, or can I use the username?
  const result = await User.findOne({ where: { email }})

  const password_hash = result.password;
  const is_password = await bcrypt.compare(password, password_hash);

  if (is_password) {
    payload = { "sub": result.id, admin: result.admin }
    expiration = { "expiresIn": "24h" }
    token = jwt.sign(payload, process.env.JWT_SECRET_KEY, expiration)
    res.status(200).send({
      token,
      links: { self: `users/login/${result.id}` }
    })
    console.log(`== User ${username} logged in`)
  } else {
    res.status(401).send({ error: "Incorrect username or password" })
    console.log(`== Failed login for user ${username}`)
  }
})

router.get('/users/:userId', requireAutorization, isAuthorizedUser, async (req, res) => {
  const userId = req.params.userId
  const user = await User.findByPk({ id: userId })

  if(user) {
    res.status(200).json(user)
  } else {
    res.status(404).json({ error: `Can't find user ${userId}`})
  }
})

module.exports = router
