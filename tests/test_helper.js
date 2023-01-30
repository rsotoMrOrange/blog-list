const Blog = require('../models/blog')

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

const nonExistingId = async () => {
  const blog = new Blog({
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

module.exports = {
  initialBlogs, nonExistingId, blogsInDb
}