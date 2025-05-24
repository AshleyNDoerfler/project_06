const { Router } = require('express')
const jwt = require('jsonwebtoken')

const { User, UserClientFields } = require('../models/user')
const { Business } = require('../models/business')
const { Photo } = require('../models/photo')
const { Review } = require('../models/review')

const router = Router()

const jwtKey = process.env.JWT_SECRET_KEY;

function requireAutorization(req, res){
  try{
    const auth_value = req.get('Authorization')

    if(!auth_value || !auth_value.startsWith("Bearer")) {
      return res.status(401).send("Incorrect Token")
    }

    const token = auth_value.split(" ")[1]

    const payload = jwt.verify(token, jwtKey)

    console.log("Payload " + payload)

    req.user = payload.sub
    next();
  } catch (err) {
    res.send("Incorrect Token")
  }
}

/*
 * Route to list all of a user's businesses.
 */
router.get('/:userId/businesses', async function (req, res) {
  const userId = req.params.userId
  const userBusinesses = await Business.findAll({ where: { ownerId: userId }})
  res.status(200).json({
    businesses: userBusinesses
  })
})

/*
 * Route to list all of a user's reviews.
 */
router.get('/:userId/reviews', async function (req, res) {
  const userId = req.params.userId
  const userReviews = await Review.findAll({ where: { userId: userId }})
  res.status(200).json({
    reviews: userReviews
  })
})

/*
 * Route to list all of a user's photos.
 */
router.get('/:userId/photos', async function (req, res) {
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

  if (!name || !email || !password || !admin){
    return res.status(400).json({ error: "Missing information"})
  }

  const password_hash = await bcrypt.hash(password, 8)

  try{
    const user = await User.create(req.body, UserClientFields)
    res.status(201).send({ id: user.id })
  } catch (e) {
    if (e instanceof ValidationError) {
      res.status(400).send({ error: e.message })
    } else {
      throw e
    }
  }

})

router.post('/users/login', requireAuthorization, async (req, res) => {
  const users = await User.findAll()

  const username = req.body.username
  const password = req.body.password

  if (!username || !password) {
    return res.status(400).send({error: "Username and password required"})
  }

  // Do I need to pass in an ID, or can I use the username?
  const result = await User.findByPk()
})

module.exports = router
