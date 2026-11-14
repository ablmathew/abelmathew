'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '../../lib/supabase-browser'

type Post = {
  id: string
  title: string
  category: string
  content: string | null
  image_url: string | null
  published: boolean
  created_at: string
}

export default function AdminPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [posts, setPosts] = useState<Post[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [profileImageSaving, setProfileImageSaving] = useState(false)
  const [profileImageRemoving, setProfileImageRemoving] = useState(false)
  const [profileImageMessage, setProfileImageMessage] = useState('')
  const [profileImageError, setProfileImageError] = useState('')

  useEffect(() => {
    let active = true

    async function loadDashboard() {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      if (!active) return
      if (authError || !user) {
        router.replace('/admin/login')
        return
      }

      const { data, error: postsError } = await supabase
        .from('posts')
        .select('id, title, category, content, image_url, published, created_at')
        .order('created_at', { ascending: false })

      if (!active) return
      if (postsError) setError(`Could not load posts: ${postsError.message}`)
      else setPosts(data ?? [])
      setCheckingAuth(false)
    }

    void loadDashboard()
    return () => { active = false }
  }, [router, supabase])

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }
    const preview = URL.createObjectURL(imageFile)
    setImagePreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [imageFile])

  useEffect(() => {
    if (!profileImageFile) {
      setProfileImagePreview(null)
      return
    }
    const preview = URL.createObjectURL(profileImageFile)
    setProfileImagePreview(preview)
    return () => URL.revokeObjectURL(preview)
  }, [profileImageFile])
  async function uploadProfilePhoto() {
    setProfileImageMessage('')
    setProfileImageError('')
    if (!profileImageFile) {
      setProfileImageError('Choose a profile photo first.')
      return
    }
    if (!profileImageFile.type.startsWith('image/')) {
      setProfileImageError('Choose an image file.')
      return
    }
    if (profileImageFile.size > 5 * 1024 * 1024) {
      setProfileImageError('Choose an image smaller than 5 MB.')
      return
    }

    setProfileImageSaving(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setProfileImageSaving(false)
      router.replace('/admin/login')
      return
    }

    const { error: uploadError } = await supabase.storage
      .from('website-images')
      .upload('profile/profile-photo', profileImageFile, {
        cacheControl: '0',
        contentType: profileImageFile.type,
        upsert: true,
      })

    setProfileImageSaving(false)
    if (uploadError) {
      setProfileImageError(`Could not upload profile photo: ${uploadError.message}. Check the profile photo Storage policies.`)
      return
    }

    setProfileImageFile(null)
    setProfileImageMessage('Profile photo updated. Refresh your homepage to see it.')
  }
  async function removeProfilePhoto() {
    const confirmed = window.confirm('Remove your profile photo from the homepage?')
    if (!confirmed) return

    setProfileImageMessage('')
    setProfileImageError('')
    setProfileImageRemoving(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setProfileImageRemoving(false)
      router.replace('/admin/login')
      return
    }

    const { error: removeError } = await supabase.storage
      .from('website-images')
      .remove(['profile/profile-photo'])

    setProfileImageRemoving(false)
    if (removeError) {
      setProfileImageError(`Could not remove profile photo: ${removeError.message}. Check that an authenticated DELETE policy allows this profile photo object.`)
      return
    }

    setProfileImageFile(null)
    setProfileImageMessage('Profile photo removed from the homepage. Refresh the homepage to see the placeholder.')
  }
  function clearEditor() {
    setEditingId(null)
    setTitle('')
    setCategory('')
    setContent('')
    setImageUrl(null)
    setImageFile(null)
    setMessage('')
    setError('')
  }

  function startEditing(post: Post) {
    setEditingId(post.id)
    setTitle(post.title)
    setCategory(post.category)
    setContent(post.content ?? '')
    setImageUrl(post.image_url)
    setImageFile(null)
    setMessage('')
    setError('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function savePost(published: boolean) {
    setMessage('')
    setError('')
    if (!title.trim() || !category.trim() || !content.trim()) {
      setError('Please enter a title, category, and content.')
      return
    }
    if (imageFile && !imageFile.type.startsWith('image/')) {
      setError('Choose an image file.')
      return
    }
    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      setError('Choose an image smaller than 5 MB.')
      return
    }

    setSaving(true)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setSaving(false)
      router.replace('/admin/login')
      return
    }

    let savedImageUrl = imageUrl
    if (imageFile) {
      const safeName = imageFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const imagePath = `${crypto.randomUUID()}-${safeName}`
      const { error: uploadError } = await supabase.storage
        .from('website-images')
        .upload(imagePath, imageFile, { cacheControl: '3600', upsert: false })

      if (uploadError) {
        setSaving(false)
        setError(`Image upload failed: ${uploadError.message}. Check that the public "website-images" storage bucket and upload policies are set up.`)
        return
      }
      savedImageUrl = supabase.storage.from('website-images').getPublicUrl(imagePath).data.publicUrl
    }

    const values = {
      title: title.trim(),
      category: category.trim(),
      content: content.trim(),
      image_url: savedImageUrl,
    }
    const result = editingId
      ? await supabase
          .from('posts')
          .update(values)
          .eq('id', editingId)
          .select('id, title, category, content, image_url, published, created_at')
          .single()
      : await supabase
          .from('posts')
          .insert({ ...values, published })
          .select('id, title, category, content, image_url, published, created_at')
          .single()

    setSaving(false)
    if (result.error) {
      setError(`Could not save post: ${result.error.message}`)
      return
    }

    const savedPost = result.data
    if (editingId) {
      setPosts((current) => current.map((post) => post.id === savedPost.id ? savedPost : post))
    } else {
      setPosts((current) => [savedPost, ...current])
    }
    const wasEditing = Boolean(editingId)
    setEditingId(null)
    setTitle('')
    setCategory('')
    setContent('')
    setImageUrl(null)
    setImageFile(null)
    setMessage(wasEditing ? 'Post changes saved.' : published ? 'Post published and visible on your website.' : 'Draft saved.')
  }

  async function deletePost(post: Post) {
    const confirmed = window.confirm(`Delete "${post.title}"? This permanently removes the post from your website.`)
    if (!confirmed) return

    setDeletingId(post.id)
    setMessage('')
    setError('')

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      setDeletingId(null)
      router.replace('/admin/login')
      return
    }

    const { error: deleteError } = await supabase
      .from('posts')
      .delete()
      .eq('id', post.id)
      .select('id')
      .single()

    if (deleteError) {
      setDeletingId(null)
      setError(`Could not delete post: ${deleteError.message}. Check that your posts table allows authenticated deletes.`)
      return
    }

    setPosts((current) => current.filter((item) => item.id !== post.id))
    if (editingId === post.id) clearEditor()

    let imageCleanupError = ''
    if (post.image_url) {
      const marker = '/storage/v1/object/public/website-images/'
      const markerIndex = post.image_url.indexOf(marker)
      if (markerIndex >= 0) {
        const imagePath = decodeURIComponent(post.image_url.slice(markerIndex + marker.length))
        const { error: storageError } = await supabase.storage.from('website-images').remove([imagePath])
        if (storageError) imageCleanupError = storageError.message
      }
    }

    setDeletingId(null)
    if (imageCleanupError) {
      setError(`Post deleted, but its image file could not be removed (${imageCleanupError}). Add an authenticated DELETE policy for website-images to remove stored files too.`)
    } else {
      setMessage('Post deleted.')
    }
  }
  async function signOut() {
    await supabase.auth.signOut()
    router.replace('/admin/login')
    router.refresh()
  }

  if (checkingAuth) {
    return <main className="admin-page"><p className="admin-muted">Checking administrator access…</p></main>
  }

  return (
    <main className="admin-page">
      <header className="admin-header">
        <div>
          <Link href="/" className="admin-logo">ablmathew<span>.</span></Link>
          <p className="admin-muted">Welcome Back Abel , I missed you so much.</p>
        </div>
        <div className="admin-header-actions">
          <Link href="/" className="admin-back-link">View website ↗</Link>
          <button type="button" className="admin-secondary-button" onClick={signOut}>Resign </button>
        </div>
      </header>

      <section className="admin-content">
        <section className="admin-profile-card">
          <div className="admin-profile-copy">
            <p className="admin-eyebrow">HOMEPAGE PHOTO</p>
            <h2>Profile photo</h2>
            <p className="admin-muted">Upload a new photo anytime to replace the one beside your About text.</p>
          </div>
          {profileImagePreview && (
            <div className="admin-image-preview">
              <img src={profileImagePreview} alt="Preview of the new profile photo" />
            </div>
          )}
          <label htmlFor="profile-photo-upload">Choose a photo (up to 5 MB)</label>
          <input
            id="profile-photo-upload"
            type="file"
            accept="image/*"
            onChange={(event) => {
              setProfileImageFile(event.target.files?.[0] ?? null)
              setProfileImageMessage('')
              setProfileImageError('')
            }}
          />
          {profileImageError && <p className="admin-error" role="alert">{profileImageError}</p>}
          {profileImageMessage && <p className="admin-success" role="status">{profileImageMessage}</p>}
          <div className="admin-form-actions">
            <button type="button" className="admin-secondary-button" onClick={() => void removeProfilePhoto()} disabled={profileImageSaving || profileImageRemoving}>
              {profileImageRemoving ? 'Removing…' : 'Remove profile photo'}
            </button>
            <button type="button" className="admin-primary-button" onClick={() => void uploadProfilePhoto()} disabled={profileImageSaving || profileImageRemoving || !profileImageFile}>
              {profileImageSaving ? 'Uploading…' : 'Upload / replace photo'}
            </button>
          </div>
        </section>
        <div className="admin-intro">
          <p className="admin-eyebrow">CONTENT</p>
          <h1>{editingId ? 'Edit post' : 'Write a post'}</h1>
          <p className="admin-muted">{editingId ? 'Update this post. Its current draft or published status will be kept.' : 'Save a draft to finish later, or publish it to your homepage.'}</p>
        </div>

        <form className="admin-editor" onSubmit={(event) => { event.preventDefault(); void savePost(false) }}>
          <label htmlFor="post-title">Title</label>
          <input id="post-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="A title for your post" required />

          <label htmlFor="post-category">Category</label>
          <select id="post-category" value={category} onChange={(event) => setCategory(event.target.value)} required>
            <option value="">Choose a category</option>
            <option value="writing">Writing</option>
            <option value="photography">Photography</option>
          </select>

          <label htmlFor="post-content">Content</label>
          <textarea id="post-content" value={content} onChange={(event) => setContent(event.target.value)} placeholder="Write your paragraph or story…" rows={9} required />

          <label htmlFor="post-image">Post image (optional, up to 5 MB)</label>
          <input id="post-image" type="file" accept="image/*" onChange={(event) => setImageFile(event.target.files?.[0] ?? null)} />
          {(imagePreview || imageUrl) && (
            <div className="admin-image-preview">
              <img src={imagePreview ?? imageUrl ?? ''} alt="Preview of the post image" />
              <button type="button" className="admin-secondary-button" onClick={() => { setImageFile(null); setImageUrl(null) }}>Remove image</button>
            </div>
          )}

          {error && <p className="admin-error" role="alert">{error}</p>}
          {message && <p className="admin-success" role="status">{message}</p>}

          <div className="admin-form-actions">
            {editingId ? (
              <>
                <button className="admin-secondary-button" type="button" onClick={clearEditor} disabled={saving}>Cancel</button>
                <button className="admin-primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save changes'}</button>
              </>
            ) : (
              <>
                <button className="admin-secondary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save draft'}</button>
                <button className="admin-primary-button" type="button" onClick={() => void savePost(true)} disabled={saving}>{saving ? 'Saving…' : 'Publish post'}</button>
              </>
            )}
          </div>
        </form>

        <section className="admin-posts">
          <h2>Your posts <span>{posts.length}</span></h2>
          {posts.length === 0 ? <p className="admin-muted">Your posts and drafts will appear here.</p> : (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  <div className="admin-post-summary"><strong>{post.title}</strong><span>{post.category} · {new Date(post.created_at).toLocaleDateString()}</span></div>
                  <div className="admin-post-actions">
                    <span className={post.published ? 'admin-status is-published' : 'admin-status'}>{post.published ? 'Published' : 'Draft'}</span>
                    <button type="button" className="admin-edit-button" onClick={() => startEditing(post)}>Edit</button>
                    <button type="button" className="admin-delete-button" onClick={() => void deletePost(post)} disabled={deletingId === post.id}>
                      {deletingId === post.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}






