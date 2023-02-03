const dummy = () => {
  return 1
}

const totalLikes = (blogs) => {
  const likes = blogs.reduce((accumulator, currentBlog) => {
    return accumulator + currentBlog.likes
  }, 0)

  return likes
}

const favoriteBlog = (blogs) => {
  if(blogs.length === 0) return {}

  const favorite = blogs.reduce((currentFavorite, currentBlog) => {
    if(currentBlog === null || currentBlog === undefined) return currentFavorite

    return currentFavorite.likes < currentBlog.likes
      ? currentBlog
      : currentFavorite
  })

  return favorite
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
}