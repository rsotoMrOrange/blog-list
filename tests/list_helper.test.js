const listHelper = require('../utils/list_helper')

test('dummy returns one', () => {
  const blogs = []

  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  const blogList = [
    {
      title: 'Daily Stoic',
      author: 'Ryan Holiday',
      url: 'url',
      likes: 438270,
      id: '63d043b66f9448c64893fc79'
    },
    {
      title: 'Motivational blog',
      author: 'John Smith',
      url: 'url',
      likes: 23,
      id: '63d0620ecb191534126a77a4'
    },
    {
      title: 'Technical blog',
      author: 'Helsinki University',
      url: 'url',
      likes: 20000,
      id: '63d07bea02a16491c636634f'
    }
  ]

  test('totalLikes returns 458293', () => {
    const likes = listHelper.totalLikes(blogList)
    expect(likes).toBe(458293)
  })

  test('totalLikes returns 0', () => {
    const emptyBlogList = []
    expect(listHelper.totalLikes(emptyBlogList)).toBe(0)
  })

  test('when list has only one blog, equals the likes of that', () => {
    const singleBlogList = [
      {
        title: 'Motivational blog',
        author: 'John Smith',
        url: 'url',
        likes: 23,
        id: '63d0620ecb191534126a77a4'
      }
    ]

    expect(listHelper.totalLikes(singleBlogList)).toBe(23)
  })
})

describe('favorite blog', () => {
  const blogList = [
    {
      title: 'Daily Stoic',
      author: 'Ryan Holiday',
      url: 'url',
      likes: 438270,
      id: '63d043b66f9448c64893fc79'
    },
    {
      title: 'Motivational blog',
      author: 'John Smith',
      url: 'url',
      likes: 23,
      id: '63d0620ecb191534126a77a4'
    },
    {
      title: 'Technical blog',
      author: 'Helsinki University',
      url: 'url',
      likes: 20000,
      id: '63d07bea02a16491c636634f'
    }
  ]

  test('when list has multiple blogs, expect the one with the most likes', () => {
    expect(listHelper.favoriteBlog(blogList)).toEqual({
      title: 'Daily Stoic',
      author: 'Ryan Holiday',
      url: 'url',
      likes: 438270,
      id: '63d043b66f9448c64893fc79'
    })
  })

  test('when blog list is empty, expect an empty object', () => {
    const emptyBlogList = []
    expect(listHelper.favoriteBlog(emptyBlogList)).toEqual({})
  })

  test('when blog list is empty, expect an empty object', () => {
    const singleBlogList = [
      {
        title: 'Motivational blog',
        author: 'John Smith',
        url: 'url',
        likes: 23,
        id: '63d0620ecb191534126a77a4'
      }
    ]
    expect(listHelper.favoriteBlog(singleBlogList)).toEqual(
      {
        title: 'Motivational blog',
        author: 'John Smith',
        url: 'url',
        likes: 23,
        id: '63d0620ecb191534126a77a4'
      }
    )
  })
})