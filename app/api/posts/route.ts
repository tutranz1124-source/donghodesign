import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, saveBlogPosts, getBlogPostBySlug } from '@/lib/storage';
import { verifyEditorSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const status = searchParams.get('status');
  const isFresh = searchParams.get('fresh') === '1' || searchParams.get('admin') === '1';

  const cacheHeaders = {
    'Cache-Control': isFresh
      ? 'no-store, no-cache, must-revalidate'
      : 'public, s-maxage=60, stale-while-revalidate=3600',
    'CDN-Cache-Control': isFresh ? 'no-store' : 'public, s-maxage=60',
  };

  if (slug) {
    const post = getBlogPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }
    return NextResponse.json(post, { headers: cacheHeaders });
  }

  let posts = getBlogPosts();
  if (status) {
    posts = posts.filter(p => p.status === status);
  }
  return NextResponse.json(posts, { headers: cacheHeaders });
}

export async function POST(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const newPost = await request.json();
    const posts = getBlogPosts();
    posts.unshift(newPost);
    saveBlogPosts(posts);
    return NextResponse.json(newPost);
  } catch {
    return NextResponse.json({ error: 'Failed to create post' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const updatedPost = await request.json();
    const posts = getBlogPosts();
    const idx = posts.findIndex(p => p.id === updatedPost.id);
    if (idx !== -1) {
      posts[idx] = updatedPost;
      saveBlogPosts(posts);
      return NextResponse.json(updatedPost);
    }
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  } catch {
    return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

  const posts = getBlogPosts();
  const filtered = posts.filter(p => p.id !== id);
  saveBlogPosts(filtered);
  return NextResponse.json({ success: true });
}
