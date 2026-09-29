import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts, saveBlogPosts, getBlogPostBySlug } from '@/lib/storage';
import { verifyEditorSession } from '@/lib/auth';
import { BlogPost } from '@/lib/types';

export const dynamic = 'force-dynamic';

function sanitizeSlug(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const status = searchParams.get('status');

  const cacheHeaders = {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'CDN-Cache-Control': 'no-store',
  };

  if (slug) {
    const post = getBlogPostBySlug(slug);
    if (!post) {
      return NextResponse.json({ error: 'Bài viết không tồn tại' }, { status: 404 });
    }
    return NextResponse.json(post, { headers: cacheHeaders });
  }

  let posts = getBlogPosts();
  if (status) {
    posts = posts.filter((p) => p.status === status);
  }
  return NextResponse.json(posts, { headers: cacheHeaders });
}

export async function POST(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên/Biên tập viên mới có quyền tạo bài viết.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      title,
      slug,
      content,
      excerpt,
      category,
      featuredImage,
      coverImage,
      author,
      tags,
      status = 'published'
    } = body;

    if (!title || !title.trim()) {
      return NextResponse.json({ error: 'Vui lòng nhập tiêu đề bài viết' }, { status: 400 });
    }

    const cleanSlug = sanitizeSlug(slug || title);
    if (!cleanSlug) {
      return NextResponse.json({ error: 'Đường dẫn (Slug) không hợp lệ' }, { status: 400 });
    }

    const posts = getBlogPosts();
    if (posts.some((p) => p.slug === cleanSlug)) {
      return NextResponse.json({ error: `Đường dẫn "${cleanSlug}" đã tồn tại. Vui lòng chọn đường dẫn khác.` }, { status: 400 });
    }

    const newPost: BlogPost = {
      id: body.id || `post-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      slug: cleanSlug,
      content: content || '',
      excerpt: excerpt?.trim() || '',
      category: category || 'Kiến trúc',
      featuredImage: featuredImage || coverImage || '/uploads/hero_slide_1.png',
      thumbnailImage: body.thumbnailImage || featuredImage || coverImage || '/uploads/hero_slide_1.png',
      author: author || 'Đông Hòa Design',
      authorRole: body.authorRole || 'Ban Biên Tập',
      tags: Array.isArray(tags) ? tags : ['Nội thất', 'Thiết kế'],
      status: status === 'draft' ? 'draft' : 'published',
      publishedAt: body.publishedAt || new Date().toISOString().split('T')[0],
      readingTime: body.readingTime || '5 phút đọc',
      featured: Boolean(body.featured),
      seoTitle: body.seoTitle || title.trim(),
      seoDescription: body.seoDescription || excerpt?.trim() || ''
    };

    posts.unshift(newPost);
    saveBlogPosts(posts);

    return NextResponse.json({ success: true, post: newPost });
  } catch (err: any) {
    return NextResponse.json({ error: `Lỗi khi tạo bài viết: ${err.message}` }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên/Biên tập viên mới có quyền sửa bài viết.' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      id,
      title,
      slug,
      content,
      excerpt,
      category,
      featuredImage,
      coverImage,
      author,
      tags,
      status
    } = body;

    if (!id) {
      return NextResponse.json({ error: 'Thiếu ID bài viết' }, { status: 400 });
    }

    const posts = getBlogPosts();
    const idx = posts.findIndex((p) => p.id === id);
    if (idx === -1) {
      return NextResponse.json({ error: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    const current = posts[idx];
    const cleanSlug = slug ? sanitizeSlug(slug) : current.slug;

    if (posts.some((p) => p.id !== id && p.slug === cleanSlug)) {
      return NextResponse.json({ error: `Đường dẫn "${cleanSlug}" đã được sử dụng bởi bài viết khác.` }, { status: 400 });
    }

    const updatedPost: BlogPost = {
      ...current,
      title: title !== undefined ? title.trim() : current.title,
      slug: cleanSlug,
      content: content !== undefined ? content : current.content,
      excerpt: excerpt !== undefined ? excerpt.trim() : current.excerpt,
      category: category !== undefined ? category : current.category,
      featuredImage: (featuredImage || coverImage) !== undefined ? (featuredImage || coverImage) : current.featuredImage,
      thumbnailImage: body.thumbnailImage !== undefined ? body.thumbnailImage : current.thumbnailImage,
      author: author !== undefined ? author : current.author,
      authorRole: body.authorRole !== undefined ? body.authorRole : current.authorRole,
      tags: Array.isArray(tags) ? tags : current.tags,
      status: status !== undefined ? (status === 'draft' ? 'draft' : 'published') : current.status,
      readingTime: body.readingTime !== undefined ? body.readingTime : current.readingTime,
      featured: body.featured !== undefined ? Boolean(body.featured) : current.featured,
      seoTitle: body.seoTitle !== undefined ? body.seoTitle : current.seoTitle,
      seoDescription: body.seoDescription !== undefined ? body.seoDescription : current.seoDescription
    };

    posts[idx] = updatedPost;
    saveBlogPosts(posts);

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (err: any) {
    return NextResponse.json({ error: `Lỗi khi cập nhật bài viết: ${err.message}` }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const isAuth = verifyEditorSession();
  if (!isAuth) {
    return NextResponse.json({ error: 'Chỉ Quản trị viên/Biên tập viên mới có quyền xóa bài viết.' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  let id = searchParams.get('id');

  if (!id) {
    const body = await request.json().catch(() => ({}));
    id = body.id;
  }

  if (!id) return NextResponse.json({ error: 'Thiếu ID bài viết cần xóa' }, { status: 400 });

  const posts = getBlogPosts();
  const filtered = posts.filter((p) => p.id !== id);

  if (filtered.length === posts.length) {
    return NextResponse.json({ error: 'Không tìm thấy bài viết để xóa' }, { status: 404 });
  }

  saveBlogPosts(filtered);
  return NextResponse.json({ success: true, message: 'Đã xóa bài viết thành công' });
}
