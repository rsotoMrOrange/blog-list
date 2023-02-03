const supertest = require('supertest')
const mongoose = require('mongoose')
const helper = require('./test_helper')
const app = require('../app')
const api = supertest(app)

const Blog = require('../models/blog')
const User = require('../models/user')

let bearerToken
beforeEach(async () => {
  await Blog.deleteMany({})
  await User.deleteMany({})

  const newUser = helper.initialUsers[0]

  const user = await api
    .post('/api/users')
    .send(newUser)

  const response = await api
    .post('/api/login')
    .send({ username: newUser.username, password: newUser.password })

  bearerToken = response._body.token

  const blogObjects = helper.initialBlogs
    .map(blog => new Blog({
      ...blog,
      user: user.body.id
    }))
  const promiseArray = blogObjects.map(blog => blog.save())
  await Promise.all(promiseArray)
})

describe('when there is initially some blogs saved', () => {
  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-type', /application\/json/)
  }, 100000)

  test('all blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body).toHaveLength(helper.initialBlogs.length)
  })

  test('a specific blog is within the returned blogs', async () => {
    const response = await api.get('/api/blogs')

    const titles = response.body.map(blog => blog.title)
    expect(titles).toContain(
      'Daily Stoic'
    )
  })
})

describe('viewing a specific blog', () => {
  test('succeeds with a valid id', async () => {
    const blogsAtStart = await helper.blogsInDb()

    const blogToView = blogsAtStart[0]

    const resultBlog = await api
      .get(`/api/blogs/${blogToView.id}`)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    blogToView.user = blogToView.user.toString()
    expect(resultBlog.body).toEqual(blogToView)
  })

  test('fails with statuscode 404 if blog does not exist', async () => {
    const validNonExistingId = await helper.nonExistingId()

    await api
      .get(`/api/blogs/${validNonExistingId}`)
      .expect(404)
  })

  test('fails with statuscode 500 if id is invalid', async () => {
    const invalidId = '5a3d5da59070081a82a3445'

    await api
      .get(`/api/blogs/${invalidId}`)
      .expect(400)
  })
})

describe('addition of a new blog', () => {
  test('a valid blog can be added', async () => {
    const newBlog = {
      title: 'Testing blog',
      author: 'Testing file',
      url: 'url',
      likes: 19834,
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const titles = blogsAtEnd.map(blog => blog.title)
    expect(titles).toContain(
      'Testing blog'
    )
  })

  test('blog post is not created without title or url', async () => {
    const invalidBlogs = [
      {
        title: 'No url blog',
        author: 'Jeff Barcenas',
        likes: 87944
      },
      {
        author: 'Jeff Barcenas',
        url: 'No title blog',
        likes: 87944
      }
    ]

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(invalidBlogs[0])
      .expect(400)

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(invalidBlogs[1])
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length)
  })

  test('blog posts contain a defined id property', async () => {
    const response = await api.get('/api/blogs')

    response.body.forEach((blog) => {
      expect(blog.id).toBeDefined()
    })
  })

  test('likes default to 0 when empty', async () => {
    const newBlog = {
      title: 'No likes blog',
      author: 'Sarah Lagos',
      url: 'url'
    }

    await api
      .post('/api/blogs')
      .set('Authorization', `Bearer ${bearerToken}`)
      .send(newBlog)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const blogsAtEnd = await helper.blogsInDb()
    expect(blogsAtEnd).toHaveLength(helper.initialBlogs.length + 1)

    const testingBlog = blogsAtEnd.filter(blog => blog.title === 'No likes blog')[0]
    expect(testingBlog.likes).toBeDefined()
    expect(testingBlog.likes).toBe(0)
  })
})

describe('deletion of a blog', () => {
  // eslint-disable-next-line no-unused-vars
  let invalidBearerToken = ''
  beforeEach(async () => {
    const newUser = helper.initialUsers[1]

    await api
      .post('/api/users')
      .send(newUser)

    const response = await api
      .post('/api/login')
      .send({ username: newUser.username, password: newUser.password })

    invalidBearerToken = response._body.token
  })

  test('succeeds with status code 204 if id is valid and the creator of the blog is the one deleting it', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${bearerToken}`)
      .expect(204)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(
      helper.initialBlogs.length - 1
    )

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).not.toContain(blogToDelete.title)
  })

  test('fails with proper status code and message when user other than creator is trying to delete a blog', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    const response = await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .set('Authorization', `Bearer ${invalidBearerToken}`)
      .expect(401)

    expect(response.body.error).toContain('only owner of blog is able to delete')

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).toContain(blogToDelete.title)
  })

  test('fails with proper status code and message when token is missing', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToDelete = blogsAtStart[0]

    await api
      .delete(`/api/blogs/${blogToDelete.id}`)
      .expect(400)

    const blogsAtEnd = await helper.blogsInDb()

    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).toContain(blogToDelete.title)
  })
})

describe('updating a blog', () => {
  test('returns modified body when update is success', async () => {
    const blogsAtStart = await helper.blogsInDb()
    const blogToUpdate = blogsAtStart[0]

    blogToUpdate.title = 'Update Testing'

    const response = await api
      .put(`/api/blogs/${blogToUpdate.id}`)
      .send(blogToUpdate)
      .expect(200)

    console.log('response', response)

    const blogsAtEnd = await helper.blogsInDb()

    const titles = blogsAtEnd.map(blog => blog.title)

    expect(titles).toContain('Update Testing')
    expect(blogsAtEnd).toHaveLength(blogsAtStart.length)
  })
})


afterAll(async () => {
  await mongoose.connection.close()
})