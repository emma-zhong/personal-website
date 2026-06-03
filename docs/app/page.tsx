import { BlogPosts } from 'app/components/posts'

export default function Page() {
  return (
    <section>
      <h1 className="mb-8 text-2xl font-semibold tracking-tighter">
        emma zhong
      </h1>
      <p className="mb-4">
        {`i'm a third year at uc berkeley studying data science and minoring in music. 
        my interests are in machine learning, data engineering, and computer science education.`}
      </p>
      {/* <div className="my-8">
        <BlogPosts />
      </div> */}
    </section>
  )
}
