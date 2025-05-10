import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import SinglePostLoadingSkeleton from './loading'; // Will use the sibling loading.js

// Function to fetch a single post by its slug
// WordPress API often allows fetching by slug directly. If not, we might need to fetch all and filter, or use an ID if available.
// Assuming /wp/v2/posts?slug=<slug_here>&_embed will work.
async function getPost(slug) {
  const baseUrl = 'https://mantle-clothing.com/wp-json'; // Hardcoded for testing

  const fetchUrl = `${baseUrl}/wp/v2/posts?slug=${slug}&_embed`;

  const response = await fetch(fetchUrl, {
    next: { revalidate: 3600 } // Revalidate every hour
  });
  if (!response.ok) {
    // console.error('Failed to fetch single post. Status:', response.status, response.statusText);
    // const errorBody = await response.text();
    // console.error('Single post error body:', errorBody);
    throw new Error('Failed to fetch post'); 
  }
  const posts = await response.json();
  if (posts.length === 0) {
    // Handle post not found, perhaps redirect to a 404 page or show a message
    // For now, throwing an error which can be caught by an error boundary
    throw new Error('Post not found');
  }
  return posts[0]; // The API returns an array even for a single slug match
}

// Recommended: Generate static paths if you have a fixed set of blog posts or want to pre-render them
// export async function generateStaticParams() {
//   const baseUrl = process.env.NEXT_PUBLIC_WORDPRESS_URL;
//   const response = await fetch(`${baseUrl}/wp/v2/posts?_fields=slug`);
//   const posts = await response.json();
//   return posts.map((post) => ({
//     slug: post.slug,
//   }));
// }

export default async function SinglePostPage({ params }) {
  const { slug } = params;
  const post = await getPost(slug);

  const author = post._embedded?.author?.[0];
  const featuredMedia = post._embedded?.['wp:featuredmedia']?.[0];

  // Basic breadcrumbs - can be enhanced
  const breadcrumbs = [
    { name: 'Home', href: '/' },
    { name: 'Blog', href: '/blog' },
    { name: post.title.rendered, href: `/blog/${post.slug}` },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Suspense fallback={<SinglePostLoadingSkeleton />}>
        <article>
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-8">
            <ol role="list" className="flex items-center space-x-2 text-sm text-gray-500">
              {breadcrumbs.map((breadcrumb, index) => (
                <li key={breadcrumb.name}>
                  <div className="flex items-center">
                    {index > 0 && (
                      <svg className="flex-shrink-0 h-5 w-5 text-gray-300 mr-2" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M5.555 17.776l8-16 .894.448-8 16-.894-.448z" />
                      </svg>
                    )}
                    <Link href={breadcrumb.href} className="hover:text-[#9CB24D] transition-colors">
                      {index === breadcrumbs.length - 1 ? (
                        <span className="font-medium text-gray-700">{breadcrumb.name}</span>
                      ) : (
                        breadcrumb.name
                      )}
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </nav>

          {/* Post Header */}
          <header className="mb-8">
            <h1 
              className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-4 leading-tight"
              dangerouslySetInnerHTML={{ __html: post.title.rendered }}
            />
            <div className="text-gray-600 text-sm">
              <span>Published on {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              {author && <span> by {author.name}</span>}
            </div>
          </header>

          {/* Featured Image */}
          {featuredMedia && (
            <div className="mb-8 rounded-lg overflow-hidden shadow-lg">
              <Image 
                src={featuredMedia.source_url}
                alt={featuredMedia.alt_text || post.title.rendered}
                width={featuredMedia.media_details.width}
                height={featuredMedia.media_details.height}
                className="w-full h-auto object-cover"
                priority // Prioritize loading for LCP
              />
            </div>
          )}

          {/* Post Content */}
          <div 
            className="prose prose-lg max-w-none text-gray-800 prose-headings:text-gray-900 prose-a:text-[#9CB24D] hover:prose-a:underline"
            dangerouslySetInnerHTML={{ __html: post.content.rendered }}
          />

        </article>
      </Suspense>
    </div>
  );
} 