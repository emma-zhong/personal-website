import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        emma zhong
      </h1>
      <p className="mb-4">
        {`i'm a second-year at uc berkeley studying computer science and data science. 
        my interests are in machine learning, data engineering, and computer science education. 
        i enjoy playing the violin, going to the movies, and being caffeinated!`}
      </p>
      {/* <div className="my-8">
        <BlogPosts />
      </div> */}
    </section>
  )
}
