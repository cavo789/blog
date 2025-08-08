import React, { useEffect, useState } from 'react';

export default function BlueSkyComments({ postUri }) {
  const [comments, setComments] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function fetchComments() {
      try {
        const url = `https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=${encodeURIComponent(postUri)}&depth=10`;
        const res = await fetch(url);
        const data = await res.json();
        console.log('Thread data:', data.thread);
        const replies = data.thread?.replies || [];
        setComments(replies);
      } catch (err) {
        console.error(err);
        setError(true);
      }
    }
    fetchComments();
  }, [postUri]);

  if (error) return <p>Error loading comments.</p>;
  if (comments === null) return <p>Loading comments…</p>;
  if (comments.length === 0) return <p>No comments yet on BlueSky.</p>;

  return (
    <div style={{ marginTop: '2rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
      <h3>💬 Comments from BlueSky ({comments.length})</h3>
      {comments.map((reply, i) => (
        <div key={i} style={{ marginBottom: '1rem', background: '#f9f9f9', padding: '0.8rem', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontWeight: 'bold' }}>@{reply.post.author.handle}</p>
          <p style={{ margin: '0.3rem 0 0' }}>{reply.post.record.text}</p>
        </div>
      ))}
    </div>
  );
}
