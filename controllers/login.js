const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

/**
 * @swagger
 * /api/login/:
 *   post:
 *     summary: Login with credentials.
 *     tags:
 *       - login
 *     description: Login with user credentials to retrieve a JWT.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: String
 *                 description: the user's username
 *                 example: elSoto
 *               password:
 *                 type: String
 *                 description: the user's password
 *                 example: root2024
 *     responses:
 *      '201':
 *         description: Created
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: String
 *                 description: The token needed for any calls which may mutate data
 *                 example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImxvY3RhdmlvIiwiaWQiOiI2NjQ3OTkyZTgzMjZmMDk2YmZjYjRlNmMiLCJpYXQiOjE3MTU5NjgzMjQsImV4cCI6MTcxNTk3MTkyNH0.TrC1z1sTCMPeFqs2qNEyIwJRTtQsOOZatD1Sc6G2Bp0
 *               name:
 *                 type: String
 *                 description: the user's name
 *                 example: Ricardo Soto
 *               username:
 *                 type: String
 *                 description: the user's username
 *                 example: elSoto
*/
loginRouter.post('/', async (request, response) => {
  const { username, password } = request.body

  const user = await User.findOne({ username })
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if (!(user && passwordCorrect)) {
    return response.status(401).json({
      error: 'invalid username or password'
    })
  }

  const userForToken = {
    username: user.username,
    id: user._id
  }

  const token = jwt.sign(
    userForToken,
    process.env.SECRET,
    { expiresIn: 60*60 }
  )

  response
    .status(200)
    .send({ token, username: user.username, name: user.name })
})

module.exports = loginRouter