const dummy = (blogs) => {
    return 1
}

const totalLikes = (blogs) => {
    const sumLikes = (acumulator, blog) => blog.likes + acumulator
    return blogs.reduce(sumLikes, 0)
}

const favoriteBlog = (blogs) => {
    const maxLikes = (previousBlog, currentBlog) => previousBlog.likes > currentBlog.likes
        ? previousBlog : currentBlog
    const blog = blogs.reduce(maxLikes, { likes:-1 })
    if (blog.likes === -1) {
        return null
    }
    return blog
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog
}