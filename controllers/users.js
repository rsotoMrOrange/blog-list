const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

/**
 * @swagger
 * /api/users/:
 *   get:
 *     summary: Retrieve a list of users
 *     tags:
 *       - users
 *     description: Retrieve a list of users
 *     responses:
 *      '200':
 *         description: OK
 *         content:
 *          application/json:
 *            schema:
 *              type: object
*/
usersRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('blogs')

  response.json(users)
})

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Retrieve a single user
 *     tags:
 *       - users
 *     description: Retrieve a single user by providing an Id through the uri
 *     parameters:
 *      - in: path
 *        name: id
 *        description: id used to retrieve the user
 *        type: string
 *        example: 63d9963320bfffc712347516
 *     responses:
 *      '200':
 *         description: OK
 *         content:
 *          application/json:
 *            schema:
 *              type: object
*/
usersRouter.get('/:id', async (request, response) => {
  const user = await User.findById(request.params.id).populate('blogs')
  if(user) {
    response.json(user)
  } else {
    response.status(404).end()
  }
})

/**
 * @swagger
 * /api/users/:
 *   post:
 *     summary: Create a new User.
 *     tags:
 *       - users
 *     description: Create a new user.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: String
 *                 description: the user's name
 *                 example: Ricardo Soto
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
 *               name:
 *                 type: String
 *                 description: the user's name
 *                 example: Ricardo Soto
 *               username:
 *                 type: String
 *                 description: the user's username
 *                 example: elSoto
*/
usersRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password.length < 3) return response.status(400).send({ error: 'password must be at least 3 characters long' })

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash
  })

  const savedUser = await user.save()

  response.status(201).json(savedUser)
})

usersRouter.put('/:id', async (request, response) => {
  console.info('userRouter.put')
  const user = request.body

  const updatedUser = await User.findByIdAndUpdate(
    request.params.id,
    user,
    { new: true, runValidators: true, context: 'query' }
  )
  response.json(updatedUser)
})

usersRouter.delete('/:id', async (request, response) => {
  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter