const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const Comment = require('../models/comment')

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:            # arbitrary name for the security scheme
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT    # optional, arbitrary value for documentation purposes
 */

/**
 * @swagger
 * /api/blogs/:
 *   get:
 *     summary: Retrieve a list of blogs
 *     tags:
 *       - blogs
 *     description: Retrieve a list of blogs
 *     responses:
 *      '200':
 *         description: OK
 *         content:
 *          application/json:
 *            schema:
 *              type: object
*/
blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

/**
 * @swagger
 * /api/blogs/{id}:
 *   get:
 *     summary: Retrieve a single blog by Id
 *     tags:
 *       - blogs
 *     description: Retrieve a single blog by providing an Id through the uri
 *     parameters:
 *      - in: path
 *        name: id
 *        description: id used to retrieve the blog
 *        type: string
 *        example: 63ec7633739ae4db29d4ff75
 *     responses:
 *      '200':
 *         description: OK
 *         content:
 *          application/json:
 *            schema:
 *              type: object
*/
blogsRouter.get('/:id', async (request, response) => {
  const blog = await Blog.findById(request.params.id).populate('user', { username: 1, name: 1 }).populate('comments')
  if(blog) {
    response.json(blog)
  } else {
    response.status(404).end()
  }
})

/**
 * @swagger
 * /api/blogs/:
 *   post:
 *     summary: Create a new Blog. Requires JWT token to execute
 *     tags:
 *       - blogs
 *     description: Create a new blog. Requires JWT token to execute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: String
 *                 description: the blog's title
 *                 example: React in Depth
 *               author:
 *                 type: String
 *                 example: Dan Abrahamov
 *               url:
 *                 type: String
 *                 example: https://overreacted.io/
 *               likes:
 *                 type: Number
 *                 example: 230598
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      '201':
 *         description: Created
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: String
 *                 description: the document's id
 *                 example: 63ec7633739ae4db29d4ff75
 *               title:
 *                 type: String
 *                 description: the blog's title
 *                 example: React in Depth
 *               author:
 *                 type: String
 *                 example: Dan Abrahamov
 *               url:
 *                 type: String
 *                 example: https://overreacted.io/
 *               likes:
 *                 type: Number
 *                 example: 230598
 *               user:
 *                 type: String
 *                 description: The user that created this blog
 *                 example: 63d9963320bfffc712347516
 *               comments:
 *                 type: array
 *                 example: [ "664651373e6a0b529d0847f5" ]
*/
blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const userId = request.user._id.toString()

  const user = await User.findById(userId)

  const blog = new Blog({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes,
    user: user._id
  })

  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()

  response.statusCode(201).json(savedBlog)
})

/**
 * @swagger
 * /api/blogs/{id}/comments:
 *   post:
 *     summary: Create a new comment for a blog. Requires JWT token to execute
 *     tags:
 *       - blogs
 *     description: Create a new comment for a blog. Requires JWT token to execute
 *     parameters:
 *      - in: path
 *        name: id
 *        description: id of the blog with the new comment
 *        type: string
 *        example: 63ec7633739ae4db29d4ff75
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: String
 *                 description: the comment to be left
 *                 example: Awesome blog!
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      '201':
 *         description: Created
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: String
 *                 description: the document's id
 *                 example: 63ec7633739ae4db29d4ff75
 *               title:
 *                 type: String
 *                 description: the blog's title
 *                 example: React in Depth
 *               author:
 *                 type: String
 *                 example: Dan Abrahamov
 *               url:
 *                 type: String
 *                 example: https://overreacted.io/
 *               likes:
 *                 type: Number
 *                 example: 230598
 *               user:
 *                 type: String
 *                 description: The user that created this blog
 *                 example: 63d9963320bfffc712347516
 *               comments:
 *                 type: array
 *                 example: [ "664651373e6a0b529d0847f5" ]
*/
blogsRouter.post('/:id/comments', async (request, response) => {
  const body = request.body
  const blogId = request.params.id
  const blog = await Blog.findById(blogId)

  const comment = new Comment({
    content: body.content,
    blog: blog._id,
  })

  const savedComment = await comment.save()
  blog.comments = blog.comments.concat(savedComment._id)
  await blog.save()

  await blog.populate('comments')
  response.statusCode(201).json(blog)
})

/**
 * @swagger
 * /api/blogs/:
 *   put:
 *     summary: Like an existing blog. Requires JWT token to execute
 *     tags:
 *       - blogs
 *     description: Like an existing blog. Requires JWT token to execute
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: String
 *                 description: the blog's title
 *                 example: React in Depth
 *               author:
 *                 type: String
 *                 example: Dan Abrahamov
 *               url:
 *                 type: String
 *                 example: https://overreacted.io/
 *               likes:
 *                 type: Number
 *                 example: 230598
 *     security:
 *       - bearerAuth: []
 *     responses:
 *      '201':
 *         description: Created
 *         content:
 *          application/json:
 *            schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: String
 *                 description: the document's id
 *                 example: 63ec7633739ae4db29d4ff75
 *               title:
 *                 type: String
 *                 description: the blog's title
 *                 example: React in Depth
 *               author:
 *                 type: String
 *                 example: Dan Abrahamov
 *               url:
 *                 type: String
 *                 example: https://overreacted.io/
 *               likes:
 *                 type: Number
 *                 example: 230599
 *               user:
 *                 type: String
 *                 description: The user that created this blog
 *                 example: 63d9963320bfffc712347516
 *               comments:
 *                 type: array
 *                 example: [ "664651373e6a0b529d0847f5" ]
*/
blogsRouter.put('/:id', async (request, response) => {
  const blog = request.body
  blog.user = request.body.user.id

  const user = await User.findById(blog.user)

  const updatedBlog = await Blog.findByIdAndUpdate(
    request.params.id,
    blog,
    { new: true, runValidators: true, context: 'query' }
  )

  updatedBlog.user = user
  response.statusCode(201).json(updatedBlog)
})

/**
 * @swagger
 * /api/blogs/{id}:
 *   delete:
 *     summary: Delete a single blog. Requires JWT to execute
 *     tags:
 *       - blogs
 *     description: Delete a single blog. Requires JWT to execute
 *     parameters:
 *      - in: path
 *        name: id
 *        description: id of the blog to be deleted
 *        type: string
 *        example: 63ec7633739ae4db29d4ff75
 *     responses:
 *      '204':
 *         description: No Content
 *         content:
 *          application/json:
 *            schema:
 *              type: object
*/
blogsRouter.delete('/:id', async (request, response) => {
  const blogToDelete = await Blog.findById(request.params.id)

  if (blogToDelete.user.toString() !== request.user._id.toString()) {
    return response.status(401).send({ error: 'only owner of blog is able to delete' })
  }
  await Blog.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

module.exports = blogsRouter