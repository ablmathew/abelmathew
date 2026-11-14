
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

type Post = {
  id: string
  title: string
  content: string | null
  category: string
  image_url: string | null
  created_at: string
}

const socialLinks = [
  {
    name: 'Instagram',
    url: 'https://www.instagram.com/ablmathew',
  },
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/ablmathew',
  },
  {
    name: 'GitHub',
    url: 'https://github.com/ablmathew',
  },
  {
    name: 'Medium',
    url: 'https://medium.com/@ablmathew',
  },
  {
    name: 'Discord',
    url: 'https://discord.gg/pjFJNtMKbX',
  },
  {
    name: 'Spotify',
    url: 'https://open.spotify.com/user/31vuqdr6bnlquvr5pl2r3gunyfuu?si=f07fc4150cf440cf',
  },
  {
    name: 'Tellonym',
    url: 'https://tellonym.me/anonymousabl/illanswer',
  },
  {
    name: 'Email',
    url: 'mailto:abelmathe1512005@gmail.com',
  },
  {
    name: 'WhatsApp',
    url: 'https://wa.me/91807500540',
  },
]

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [profileImageLoaded, setProfileImageLoaded] = useState(false)
  const [profileImageFailed, setProfileImageFailed] = useState(false)

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Supabase error:', error.message)
      } else {
        setPosts(data || [])
      }

      setLoading(false)
    }

    fetchPosts()
  }, [])

  return (
    <main className="website">

      {/* NAVIGATION */}
      <nav className="navbar">
        <a href="" className="logo">
          ablmathew <span>.</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#posts">Posts</a>
          <a href="#contact">Contact</a>
          <a href="/admin">Admin</a>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="hero" id="home">

        <h1>
          Hi, I&apos;m <span>Abel Mathew</span>
        </h1>

       <p className="hero-tagline">
  Ethical Hacker [Cyber Security]{" "}
  <span className="tagline-separator" aria-hidden="true">|</span>{" "}
  Learner {" "}
  <span className="tagline-separator" aria-hidden="true">|</span>{" "}
  Wanderlust{" "}
  <span className="tagline-separator" aria-hidden="true">|</span>{" "}
  Blogger
</p>

        <div className="social-links">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target={
                social.url.startsWith('mailto:')
                  ? undefined
                  : '_blank'
              }
              rel="noopener noreferrer"
            >
              {social.name}
            </a>
          ))}
          <a href="/Abel-Mathew-CV.pdf" download="Abel-Mathew-CV.pdf" className="cv-button">
            Download CV ↓
          </a>
        </div>

      </section>

      {/* ABOUT SECTION */}
      <section className="section" id="about">

       
<h2>About me</h2>

<div className="about-card">
  <div className="about-copy">
    <p>
      I'm passionate about technology and creativity, with
      interests in full-stack development, cybersecurity
      and ethical hacking, UI/UX design, and  editing.
      I'm a fast learner who enjoys exploring new technologies,
      experimenting with ideas, and embracing new challenges.
      <br /><br />
      I'm Abel Mathew, from Nilambur, Kerala, currently pursuing
      my B.Tech in Information Technology at Government
      Engineering College Idukki. I completed my Higher
      Secondary Education in Computer Science at SVHSS Palemad,
      where I also completed my schooling.
      UP in St: Mary's Mamankara .LP at ALPS Modapoika.
      <br /><br />
      CARPE DIEM !!!!!!!!!!!!!!!!!!!!!
    </p>
    <ul>
     <ul>
  <li>Live ~ Love</li>
  <li>Explore</li>
  <li>Read | Listen | Write</li>
  <li>Code | Hack | Experiment</li>
  <li>Workout | Play | Repeat</li>
  <li>Explore ideas | Embrace perspectives</li>
  <li>Eat | Sleep | Repeat</li>
</ul>
    </ul>
  </div>

  <div className={`about-photo-frame${profileImageLoaded ? ' is-loaded' : ''}`}>
    <div className="about-photo-placeholder" aria-hidden="true">
      <span id="wanted">WANTED</span>
      <small id="small">Dead / Alive</small>
    </div>
    {!profileImageFailed && (
      <img
        className="about-profile-photo"
        src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/website-images/profile/profile-photo`}
        alt="Portrait of Abel Mathew"
        onLoad={() => setProfileImageLoaded(true)}
        onError={() => setProfileImageFailed(true)}
      />
    )}
  </div>
</div>


      </section>

      {/* PHOTOS AND WRITINGS */}
      <section className="section" id="posts">

        <h2>Stamps &amp; writings</h2>

        {loading ? (

          <p className="empty-message">
            Loading posts...
          </p>

        ) : posts.length === 0 ? (

          <p className="empty-message">
            Nothing published yet. New stories are waiting to be written.
          </p>

        ) : (

          <div className="posts-grid">

            {posts.map((post) => (

              <article className="post-card" key={post.id}>

                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt={post.title}
                    className="post-image"
                  />
                )}

                <div className="post-details">

                  <span className="post-category">
                    {post.category}
                  </span>

                  <h3>{post.title}</h3>

                  {post.content && (
                    <p className="post-content">
                      {post.content}
                    </p>
                  )}

                  <time>
                    {new Date(post.created_at).toLocaleDateString('en-GB')}
                  </time>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

      {/* CONTACT SECTION */}
      <section className="section contact-section" id="contact">

        <h2 id="whoami">"A little bit of everything, a lot of curiosity."</h2>

      <p className="alchemist-quote-text">
  <span className="sr-only">
    When you want something, all the universe conspires in helping you to achieve it.
  </span>

  {[
    "When", "you", "want", "something,", "all", "the", "universe",
    "conspires", "in", "helping", "you", "to", "achieve", "it."
  ].map((word, index) => (
    <span className="quote-word" aria-hidden="true" key={index}>
      {word}
    </span>
  ))}
</p>
<cite className="alchemist-quote-cite">
  — Paulo Coelho, <em>The Alchemist</em>
</cite>
        <div className="social-links">

          <a href="mailto:abelmathe1512005@gmail.com">
            Email me
          </a>

          <a
            href="https://wa.me/91807500540"
            target="_blank"
            rel="noopener noreferrer"
          >
            WhatsApp
          </a>

          

        </div>

      </section>

      {/* FOOTER */}
      <footer className="footer">

        <p>
          © 2026 ablmathew. JUST KEEP YOUR DREAMS ALIVE !! .
        </p>

      </footer>

    </main>
  )
}



