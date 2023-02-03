const Blog = require('../models/blog')
const User = require('../models/user')

const initialBlogs = [
  {
    title: 'Daily Stoic',
    author: 'Ryan Holiday',
    url: 'url',
    likes: 438270
  },
  {
    title: 'Motivational blog',
    author: 'John Smith',
    url: 'url',
    likes: 23
  },
  {
    title: 'Technical blog',
    author: 'Helsinki University',
    url: 'url',
    likes: 20000
  }
]

const initialUsers = [
  {
    username: 'ricasoto',
    name: 'Ricardo Soto',
    password: 'password'
  },
  {
    username: 'milo',
    name: 'Milo Salgado',
    password: 'nala'
  }
]

const nonExistingId = async () => {
  const blog = new Blog({
    title: 'Movie production',
    author: 'Dave Decker',
    url: 'url',
    likes: 8792
  })

  await blog.save()
  await blog.remove()

  return blog._id.toString()
}

const blogsInDb = async () => {
  const blogs = await Blog.find({})
  return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

module.exports = {
  initialBlogs,
  initialUsers,
  nonExistingId,
  blogsInDb,
  usersInDb
}